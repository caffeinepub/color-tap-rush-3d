import Map "mo:core/Map";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Set "mo:core/Set";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type ThemeId = Nat;
  type SkinId = Nat;
  type Timestamp = Int;

  type PlayerData = {
    coins : Nat;
    lastDailyClaim : Int;
    unlockedThemes : [ThemeId];
    unlockedSkins : [SkinId];
    playerName : Text;
  };

  type ScoreEntry = {
    playerName : Text;
    score : Nat;
    timestamp : Timestamp;
  };

  module ScoreEntry {
    public func compare(a : ScoreEntry, b : ScoreEntry) : Order.Order {
      Nat.compare(b.score, a.score);
    };
  };

  module PlayerData {
    public func compare(a : PlayerData, b : PlayerData) : Order.Order {
      Text.compare(a.playerName, b.playerName);
    };
  };

  var leaderboard : [ScoreEntry] = [];
  let playerData = Map.empty<Principal, PlayerData>();

  func getOrDefaultPlayer(caller : Principal) : PlayerData {
    switch (playerData.get(caller)) {
      case (?data) { data };
      case (null) {
        {
          coins = 0;
          lastDailyClaim = 0;
          unlockedThemes = [];
          unlockedSkins = [];
          playerName = "Anonymous";
        };
      };
    };
  };

  public shared ({ caller }) func submitScore(score : Nat, playerName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit scores");
    };
    let entry : ScoreEntry = {
      playerName;
      score;
      timestamp = Time.now();
    };
    leaderboard := leaderboard.concat([entry]);
    let currentPlayer = getOrDefaultPlayer(caller);
    let updatedPlayer = {
      currentPlayer with
      playerName
    };
    playerData.add(caller, updatedPlayer);
  };

  public query ({ caller }) func getTopScores() : async [ScoreEntry] {
    let sorted = leaderboard.sort();
    let size = sorted.size();
    if (size > 20) {
      Array.tabulate<ScoreEntry>(20, func(i) { sorted[i] });
    } else {
      sorted;
    };
  };

  public shared ({ caller }) func claimDailyReward() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim daily rewards");
    };
    let currentPlayer = getOrDefaultPlayer(caller);
    let now = Time.now();
    let dayInNanos : Int = 24 * 60 * 60 * 1000000000;
    if (now - currentPlayer.lastDailyClaim < dayInNanos) {
      Runtime.trap("Reward already claimed today!");
    };
    let newPlayerData = {
      currentPlayer with
      coins = currentPlayer.coins + 100;
      lastDailyClaim = now;
    };
    playerData.add(caller, newPlayerData);
    100;
  };

  public shared ({ caller }) func unlockTheme(themeId : ThemeId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlock themes");
    };
    let currentPlayer = getOrDefaultPlayer(caller);

    if (currentPlayer.coins < 50) {
      Runtime.trap("Not enough coins!");
    };

    switch (currentPlayer.unlockedThemes.find<ThemeId>(func(id) { themeId == id })) {
      case (?_) { Runtime.trap("Theme already unlocked!") };
      case (null) {};
    };

    let newThemes = currentPlayer.unlockedThemes.concat([themeId]);
    let newPlayerData = {
      currentPlayer with
      coins = currentPlayer.coins - 50;
      unlockedThemes = newThemes;
    };
    playerData.add(caller, newPlayerData);
  };

  public shared ({ caller }) func unlockSkin(skinId : SkinId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlock skins");
    };
    let currentPlayer = getOrDefaultPlayer(caller);

    if (currentPlayer.coins < 75) {
      Runtime.trap("Not enough coins!");
    };

    switch (currentPlayer.unlockedSkins.find<SkinId>(func(id) { skinId == id })) {
      case (?_) { Runtime.trap("Skin already unlocked!") };
      case (null) {};
    };

    let newSkins = currentPlayer.unlockedSkins.concat([skinId]);
    let newPlayerData = {
      currentPlayer with
      coins = currentPlayer.coins - 75;
      unlockedSkins = newSkins;
    };
    playerData.add(caller, newPlayerData);
  };

  public query ({ caller }) func getPlayerData() : async PlayerData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access player data");
    };
    getOrDefaultPlayer(caller);
  };
};

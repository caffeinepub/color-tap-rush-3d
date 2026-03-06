import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type PlayerData = {
    coins : Nat;
    lastDailyClaim : Int;
    unlockedCubeStyles : [Nat];
    unlockedBackgrounds : [Nat];
    equippedCubeStyle : Nat;
    equippedBackground : Nat;
    playerName : Text;
  };

  public type ScoreEntry = {
    playerName : Text;
    score : Nat;
    timestamp : Int;
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
  let userProfiles = Map.empty<Principal, UserProfile>();

  func defaultPlayerData() : PlayerData {
    {
      coins = 0;
      lastDailyClaim = 0;
      unlockedCubeStyles = [0];
      unlockedBackgrounds = [0];
      equippedCubeStyle = 0;
      equippedBackground = 0;
      playerName = "Anonymous";
    };
  };

  func getOrDefaultPlayer(caller : Principal) : PlayerData {
    switch (playerData.get(caller)) {
      case (?data) { data };
      case (null) { defaultPlayerData() };
    };
  };

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Game Functions
  public shared ({ caller }) func submitScore(score : Nat, playerName : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can submit scores");
    };

    let entry : ScoreEntry = {
      playerName;
      score;
      timestamp = Time.now();
    };

    // Add new entry to leaderboard
    let entries = leaderboard.concat([entry]);
    let sortedEntries = entries.sort();
    leaderboard := if (sortedEntries.size() > 100) {
      sortedEntries.sliceToArray(0, 100);
    } else {
      sortedEntries;
    };

    // Update player's name in PlayerData
    let currentPlayer = getOrDefaultPlayer(caller);
    let updatedPlayer = {
      currentPlayer with playerName;
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can claim daily rewards");
    };

    let currentPlayer = getOrDefaultPlayer(caller);
    let now = Time.now();
    let dayInNanos : Int = 24 * 60 * 60 * 1_000_000_000;
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

  public shared ({ caller }) func awardGameCoins(coinsEarned : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can earn coins");
    };

    let currentPlayer = getOrDefaultPlayer(caller);
    let newPlayerData = {
      currentPlayer with
      coins = currentPlayer.coins + coinsEarned;
    };
    playerData.add(caller, newPlayerData);
    coinsEarned;
  };

  public shared ({ caller }) func unlockCubeStyle(styleId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can unlock cube styles");
    };

    let currentPlayer = getOrDefaultPlayer(caller);
    let styleCost = switch (styleId) {
      case (0) { 0 };
      case (1) { 80 };
      case (2) { 120 };
      case (3) { 150 };
      case (4) { 200 };
      case (5) { 250 };
      case (_) { Runtime.trap("Invalid style ID"); 0 };
    };

    switch (currentPlayer.unlockedCubeStyles.find(func(id) { id == styleId })) {
      case (?_) { Runtime.trap("Style already unlocked!") };
      case (null) {};
    };

    if (currentPlayer.coins < styleCost) {
      Runtime.trap("Not enough coins!");
    };

    let newStyles = currentPlayer.unlockedCubeStyles.concat([styleId]);
    let newPlayerData = {
      currentPlayer with
      coins = currentPlayer.coins - styleCost;
      unlockedCubeStyles = newStyles;
    };
    playerData.add(caller, newPlayerData);
  };

  public shared ({ caller }) func unlockBackground(bgId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can unlock backgrounds");
    };

    let currentPlayer = getOrDefaultPlayer(caller);
    let bgCost = switch (bgId) {
      case (0) { 0 };
      case (1) { 100 };
      case (2) { 175 };
      case (3) { 225 };
      case (4) { 300 };
      case (_) { Runtime.trap("Invalid background ID"); 0 };
    };

    switch (currentPlayer.unlockedBackgrounds.find(func(id) { id == bgId })) {
      case (?_) { Runtime.trap("Background already unlocked!") };
      case (null) {};
    };

    if (currentPlayer.coins < bgCost) {
      Runtime.trap("Not enough coins!");
    };

    let newBackgrounds = currentPlayer.unlockedBackgrounds.concat([bgId]);
    let newPlayerData = {
      currentPlayer with
      coins = currentPlayer.coins - bgCost;
      unlockedBackgrounds = newBackgrounds;
    };
    playerData.add(caller, newPlayerData);
  };

  public shared ({ caller }) func equipCubeStyle(styleId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can equip cube styles");
    };

    let currentPlayer = getOrDefaultPlayer(caller);
    switch (currentPlayer.unlockedCubeStyles.find(func(id) { id == styleId })) {
      case (?_) {
        let newPlayerData = {
          currentPlayer with equippedCubeStyle = styleId;
        };
        playerData.add(caller, newPlayerData);
      };
      case (null) { Runtime.trap("Style not unlocked") };
    };
  };

  public shared ({ caller }) func equipBackground(bgId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can equip backgrounds");
    };

    let currentPlayer = getOrDefaultPlayer(caller);
    switch (currentPlayer.unlockedBackgrounds.find(func(id) { id == bgId })) {
      case (?_) {
        let newPlayerData = {
          currentPlayer with equippedBackground = bgId;
        };
        playerData.add(caller, newPlayerData);
      };
      case (null) { Runtime.trap("Background not unlocked") };
    };
  };

  public query ({ caller }) func getPlayerData() : async PlayerData {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access player data");
    };
    getOrDefaultPlayer(caller);
  };
};

import { useEffect, useRef } from "react";
import { useGameStore } from "../useGameStore";
import { useRewardedAd } from "../useRewardedAd";

export function RewardedAdModal() {
  const { showRewardedAd, setShowRewardedAd, continueGame, adScoreSnapshot } =
    useGameStore();

  const adContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rewardGrantedRef = useRef(false);

  const { status, errorMessage, requestAd, cleanup } = useRewardedAd({
    adContainerRef,
    videoRef,
    onRewarded: () => {
      rewardGrantedRef.current = true;
    },
    onSkipped: () => {
      // Ad was skipped -- do not grant reward automatically
    },
    onError: (msg) => {
      console.warn("[RewardedAd] Error:", msg);
    },
  });

  // Request ad whenever modal opens
  useEffect(() => {
    if (!showRewardedAd) {
      cleanup();
      rewardGrantedRef.current = false;
      return;
    }
    // Small delay to let DOM mount the ad container
    const t = setTimeout(() => requestAd(), 150);
    return () => clearTimeout(t);
  }, [showRewardedAd, requestAd, cleanup]);

  if (!showRewardedAd) return null;

  const isRewarded = status === "rewarded";
  const isUnavailable = status === "unavailable";
  const isError = status === "error";
  const isLoading = status === "loading" || status === "idle";
  const isPlaying = status === "playing" || status === "ready";
  const showContinue = isRewarded || isUnavailable || isError;

  // Status label for the info bar
  let statusLabel = "";
  if (isLoading) statusLabel = "Loading ad...";
  else if (isPlaying) statusLabel = "Watch the full ad to continue";
  else if (isRewarded) statusLabel = "Ad complete!";
  else if (isUnavailable || isError)
    statusLabel = errorMessage || "No ad available";

  return (
    <div
      data-ocid="rewarded_ad.dialog"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        background: "rgba(0,0,0,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "20px",
        flexDirection: "column",
      }}
    >
      {/* Ad container -- IMA SDK renders the actual ad video here */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          position: "relative",
          borderRadius: isPlaying ? 0 : 16,
          overflow: "hidden",
          background: "#000",
          aspectRatio: "16/9",
          display: isLoading && !isPlaying ? "none" : "block",
        }}
      >
        {/* Hidden video element required by IMA SDK */}
        {/* biome-ignore lint/a11y/useMediaCaption: ad content from IMA SDK, captions not available */}
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: "#000",
          }}
          playsInline
        />
        {/* IMA renders its own UI layer over this div */}
        <div
          ref={adContainerRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
          }}
        />
      </div>

      {/* Loading spinner */}
      {isLoading && (
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            aspectRatio: "16/9",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,15,35,0.95)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Spinner ring */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "3px solid rgba(0,122,255,0.2)",
              borderTop: "3px solid #007AFF",
              animation: "spin 0.9s linear infinite",
              marginBottom: 16,
            }}
          />
          <style>
            {"@keyframes spin { to { transform: rotate(360deg); } }"}
          </style>
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.04em",
            }}
          >
            Loading ad...
          </div>
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              fontFamily: "Outfit, sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            AD
          </div>
        </div>
      )}

      {/* Bottom panel */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(15,15,35,0.98)",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "20px 24px 24px",
          textAlign: "center",
        }}
      >
        {/* Status bar */}
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: isRewarded
              ? "rgba(0,255,136,0.9)"
              : isUnavailable || isError
                ? "rgba(255,200,60,0.8)"
                : "rgba(255,255,255,0.45)",
            marginBottom: 14,
            minHeight: 20,
          }}
        >
          {statusLabel}
        </div>

        {/* Score restore info */}
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#fff",
            marginBottom: 4,
          }}
        >
          Continue from score{" "}
          <span style={{ color: "#FFD60A" }}>{adScoreSnapshot}</span>
        </div>
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
            marginBottom: 18,
          }}
        >
          Your progress will be fully restored
        </div>

        {/* Continue button -- only enabled after reward or fallback */}
        <button
          type="button"
          data-ocid="rewarded_ad.confirm_button"
          disabled={!showContinue}
          onClick={() => {
            cleanup();
            continueGame();
          }}
          style={{
            width: "100%",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: "0.08em",
            color: showContinue ? "#0A0A1A" : "rgba(255,255,255,0.25)",
            background: showContinue
              ? isRewarded
                ? "linear-gradient(135deg, #00FF88, #00CC66)"
                : "linear-gradient(135deg, #FFD60A, #FF9500)"
              : "rgba(255,255,255,0.06)",
            border: showContinue ? "none" : "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "16px",
            cursor: showContinue ? "pointer" : "not-allowed",
            touchAction: "manipulation",
            transition:
              "background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
            boxShadow: showContinue
              ? isRewarded
                ? "0 0 24px rgba(0,255,136,0.5), 0 4px 15px rgba(0,255,136,0.3)"
                : "0 0 24px rgba(255,214,10,0.4), 0 4px 15px rgba(255,150,0,0.3)"
              : "none",
          }}
          onPointerDown={(e) => {
            if (!showContinue) return;
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(0.97)";
          }}
          onPointerUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "";
          }}
        >
          {isPlaying || isLoading ? "Watch the full ad..." : "▶ CONTINUE GAME"}
        </button>

        {/* Dismiss without continuing */}
        <button
          type="button"
          data-ocid="rewarded_ad.cancel_button"
          onClick={() => {
            cleanup();
            setShowRewardedAd(false);
          }}
          style={{
            marginTop: 10,
            width: "100%",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: "rgba(255,255,255,0.3)",
            background: "transparent",
            border: "none",
            borderRadius: 12,
            padding: "10px",
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          No thanks, go back
        </button>
      </div>
    </div>
  );
}

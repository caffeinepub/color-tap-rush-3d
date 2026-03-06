import { useCallback, useEffect, useRef, useState } from "react";

// Google IMA SDK rewarded ad tag.
// Using Google's official test rewarded ad tag.
// Replace with your own ad tag from Google Ad Manager for production.
const REWARDED_AD_TAG_URL =
  "https://pubads.g.doubleclick.net/gampad/ads?" +
  "iu=/21775744923/external/rewarded_ad_examples&" +
  "sz=640x480&gdfp_req=1&output=vast&unviewed_position_start=1&" +
  "env=vp&impl=s&correlator=";

export type AdStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "rewarded"
  | "skipped"
  | "error"
  | "unavailable";

interface UseRewardedAdOptions {
  adContainerRef: React.RefObject<HTMLDivElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onRewarded: () => void;
  onSkipped?: () => void;
  onError?: (message: string) => void;
}

function isIMAAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as typeof window & { google?: { ima?: unknown } }).google !==
      "undefined" &&
    !!(window as typeof window & { google?: { ima?: unknown } }).google?.ima
  );
}

export function useRewardedAd({
  adContainerRef,
  videoRef,
  onRewarded,
  onSkipped,
  onError,
}: UseRewardedAdOptions) {
  const [status, setStatus] = useState<AdStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const adDisplayContainerRef = useRef<google.ima.AdDisplayContainer | null>(
    null,
  );
  const adsLoaderRef = useRef<google.ima.AdsLoader | null>(null);
  const adsManagerRef = useRef<google.ima.AdsManager | null>(null);
  const initializedRef = useRef(false);
  const rewardedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (adsManagerRef.current) {
      try {
        adsManagerRef.current.destroy();
      } catch (_) {}
      adsManagerRef.current = null;
    }
    if (adsLoaderRef.current) {
      try {
        adsLoaderRef.current.destroy();
      } catch (_) {}
      adsLoaderRef.current = null;
    }
    if (adDisplayContainerRef.current) {
      try {
        adDisplayContainerRef.current.destroy();
      } catch (_) {}
      adDisplayContainerRef.current = null;
    }
    initializedRef.current = false;
    rewardedRef.current = false;
  }, []);

  const requestAd = useCallback(() => {
    if (!isIMAAvailable()) {
      setStatus("unavailable");
      setErrorMessage("Ad SDK not available. You can still continue!");
      onError?.("IMA SDK not loaded");
      return;
    }

    if (!adContainerRef.current || !videoRef.current) {
      setStatus("error");
      setErrorMessage("Ad container not ready.");
      return;
    }

    setStatus("loading");
    rewardedRef.current = false;

    try {
      // Create AdDisplayContainer
      adDisplayContainerRef.current = new google.ima.AdDisplayContainer(
        adContainerRef.current,
        videoRef.current,
      );
      adDisplayContainerRef.current.initialize();

      // Create AdsLoader
      adsLoaderRef.current = new google.ima.AdsLoader(
        adDisplayContainerRef.current,
      );

      // Handle ads manager loaded
      adsLoaderRef.current.addEventListener(
        "adsManagerLoaded",
        (e) => handleAdsManagerLoaded(e as google.ima.AdsManagerLoadedEvent),
        false,
      );
      // Handle ad error at loader level
      adsLoaderRef.current.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        (e) => handleAdError(e as google.ima.AdErrorEvent),
        false,
      );

      // Build and send ad request
      const adsRequest = new google.ima.AdsRequest();
      adsRequest.adTagUrl = REWARDED_AD_TAG_URL + Math.random();
      adsRequest.linearAdSlotWidth = adContainerRef.current.clientWidth || 640;
      adsRequest.linearAdSlotHeight =
        adContainerRef.current.clientHeight || 480;
      adsRequest.nonLinearAdSlotWidth =
        adContainerRef.current.clientWidth || 640;
      adsRequest.nonLinearAdSlotHeight = 150;

      adsLoaderRef.current.requestAds(adsRequest);
      initializedRef.current = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load ad";
      setStatus("error");
      setErrorMessage(msg);
      onError?.(msg);
    }
  }, [adContainerRef, videoRef, onError]);

  function handleAdsManagerLoaded(
    loadedEvent: google.ima.AdsManagerLoadedEvent,
  ) {
    if (!videoRef.current) return;

    try {
      adsManagerRef.current = loadedEvent.getAdsManager(videoRef.current);

      // Bind ad events
      adsManagerRef.current.addEventListener(
        google.ima.AdEvent.Type.AD_REWARDED,
        () => {
          rewardedRef.current = true;
          setStatus("rewarded");
          onRewarded();
        },
      );

      adsManagerRef.current.addEventListener(
        google.ima.AdEvent.Type.STARTED,
        () => setStatus("playing"),
      );

      adsManagerRef.current.addEventListener(
        google.ima.AdEvent.Type.SKIPPED,
        () => {
          setStatus("skipped");
          onSkipped?.();
        },
      );

      adsManagerRef.current.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        () => {
          if (!rewardedRef.current) {
            setStatus("skipped");
            onSkipped?.();
          }
        },
      );

      adsManagerRef.current.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        (e) => handleAdError(e as google.ima.AdErrorEvent),
      );

      // Init and start the ads manager
      const width = adContainerRef.current?.clientWidth || 640;
      const height = adContainerRef.current?.clientHeight || 480;
      adsManagerRef.current.init(width, height, google.ima.ViewMode.NORMAL);
      adsManagerRef.current.start();
      setStatus("ready");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ad manager error";
      setStatus("error");
      setErrorMessage(msg);
      onError?.(msg);
    }
  }

  function handleAdError(errorEvent: google.ima.AdErrorEvent) {
    const msg =
      errorEvent?.getError?.()?.getMessage?.() || "Ad not available right now";
    console.warn("[IMA] Ad error:", msg);
    setStatus("unavailable");
    setErrorMessage("No ad available. You can still continue!");
    onError?.(msg);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    status,
    errorMessage,
    requestAd,
    cleanup,
  };
}

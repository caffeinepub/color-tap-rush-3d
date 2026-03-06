// Google IMA SDK type declarations
// https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side

declare namespace google {
  namespace ima {
    class AdDisplayContainer {
      constructor(
        adContainer: HTMLElement,
        videoElement?: HTMLVideoElement,
        clickTrackingElement?: HTMLElement,
      );
      initialize(): void;
      destroy(): void;
    }

    class AdsLoader {
      constructor(container: AdDisplayContainer);
      addEventListener(
        event: string,
        handler: (e: AdsManagerLoadedEvent | AdErrorEvent) => void,
        useCapture?: boolean,
      ): void;
      removeEventListener(event: string, handler: () => void): void;
      requestAds(request: AdsRequest): void;
      contentComplete(): void;
      destroy(): void;
    }

    class AdsRequest {
      adTagUrl: string;
      linearAdSlotWidth: number;
      linearAdSlotHeight: number;
      nonLinearAdSlotWidth: number;
      nonLinearAdSlotHeight: number;
      forceNonLinearFullSlot: boolean;
    }

    class AdsManager {
      addEventListener(
        event: string,
        handler: (e: AdEvent | AdErrorEvent) => void,
      ): void;
      removeEventListener(event: string, handler: () => void): void;
      init(width: number, height: number, viewMode: ViewMode): void;
      start(): void;
      pause(): void;
      resume(): void;
      stop(): void;
      destroy(): void;
    }

    interface AdsManagerLoadedEvent {
      type: string;
      getAdsManager(
        contentElement: HTMLVideoElement,
        adsRenderingSettings?: AdsRenderingSettings,
      ): AdsManager;
    }

    interface AdEvent {
      type: string;
      getAd(): Ad;
    }

    interface Ad {
      getAdId(): string;
      getAdSystem(): string;
      getAdTitle(): string;
      getApiFramework(): string | null;
      getCreativeAdId(): string;
      getDuration(): number;
      getSkipTimeOffset(): number;
      getSurveyUrl(): string | null;
      getTitle(): string;
      getTraffickingParameters(): Record<string, string>;
      getUiElements(): string[];
      getMinSuggestedDuration(): number;
      getSkipTimeOffset(): number;
      isLinear(): boolean;
    }

    interface AdErrorEvent {
      type: string;
      getError(): AdError;
    }

    interface AdError {
      getErrorCode(): number;
      getInnerError(): Error | null;
      getMessage(): string;
      getType(): string;
      getVastErrorCode(): number;
    }

    class AdsRenderingSettings {
      enablePreloading: boolean;
      useStyledLinearAds: boolean;
      useStyledNonLinearAds: boolean;
    }

    namespace AdEvent {
      enum Type {
        CONTENT_PAUSE_REQUESTED = "contentPauseRequested",
        CONTENT_RESUME_REQUESTED = "contentResumeRequested",
        ALL_ADS_COMPLETED = "allAdsCompleted",
        CLICK = "click",
        COMPLETE = "complete",
        FIRST_QUARTILE = "firstQuartile",
        LOADED = "loaded",
        MIDPOINT = "midpoint",
        PAUSED = "paused",
        RESUMED = "resumed",
        STARTED = "started",
        THIRD_QUARTILE = "thirdQuartile",
        SKIPPED = "skipped",
        AD_REWARDED = "adRewarded",
        USER_CLOSE = "userClose",
        VIDEO_CLICKED = "videoClicked",
        VIDEO_ICON_CLICKED = "videoIconClicked",
        VIEWABLE_IMPRESSION = "viewableImpression",
        VOLUME_CHANGED = "volumeChanged",
        VOLUME_MUTED = "volumeMuted",
        LOG = "log",
        AD_BREAK_READY = "adBreakReady",
        AD_METADATA = "adMetadata",
        AD_PROGRESS = "adProgress",
        DURATION_CHANGE = "durationChange",
        EXPANDED_CHANGED = "expandedChanged",
        IMPRESSION = "impression",
        INTERACTION = "interaction",
        LINEAR_CHANGED = "linearChanged",
        SKIP_CLICKED = "skipClicked",
        AD_BUFFERING = "adBuffering",
      }
    }

    namespace AdErrorEvent {
      enum Type {
        AD_ERROR = "adError",
      }
    }

    enum ViewMode {
      FULLSCREEN = "fullscreen",
      NORMAL = "normal",
    }

    namespace settings {
      function setVpaidMode(mode: VpaidMode): void;
      function setLocale(locale: string): void;
      function setNumRedirects(numRedirects: number): void;
      function setPlayerVersion(version: string): void;
      function setPlayerType(type: string): void;
      function setDisableCustomPlaybackForIOS10Plus(disable: boolean): void;
    }

    enum VpaidMode {
      DISABLED = 0,
      ENABLED = 1,
      INSECURE = 2,
    }
  }
}

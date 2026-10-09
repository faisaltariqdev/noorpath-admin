"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Extend global Window interface for YouTube IFrame API
declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: YTPlayerOptions,
      ) => YTPlayerInstance;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerOptions {
  videoId?: string;
  width?: string | number;
  height?: string | number;
  playerVars?: {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    enablejsapi?: 0 | 1;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
    modestbranding?: 0 | 1;
    origin?: string;
    fs?: 0 | 1;
    iv_load_policy?: 1 | 3;
    mute?: 0 | 1;
    [key: string]: unknown;
  };
  events?: {
    onReady?: (event: { target: YTPlayerInstance }) => void;
    onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
    onError?: (event: { data: number; target: YTPlayerInstance }) => void;
  };
}

export interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  unMute: () => void;
  mute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getPlayerState: () => number;
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
}

// Global script loader tracking (ensures script is injected once across entire app)
let ytScriptLoadingPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  // If already loaded and available
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  // If already in flight, reuse existing promise
  if (ytScriptLoadingPromise) {
    return ytScriptLoadingPromise;
  }

  ytScriptLoadingPromise = new Promise<void>((resolve) => {
    // Check if script tag already exists in document
    const existingScript = document.getElementById("youtube-iframe-api-singleton");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api-singleton";
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) {
        try {
          previousCallback();
        } catch {
          // Ignore legacy callback errors
        }
      }
      resolve();
    };

    // Fallback polling in case callback fired before listener attached
    const pollInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(pollInterval);
        resolve();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(pollInterval);
      resolve();
    }, 10000); // 10s timeout safety net
  });

  return ytScriptLoadingPromise;
}

export interface UseNoorPathPlayerOptions {
  videoId?: string | null;
  autoResumeOnScreenShare?: boolean;
  onStateChange?: (state: number) => void;
}

export interface UseNoorPathPlayerReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  mountPlayer: () => Promise<void>;
  isMounted: boolean;
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  isPaused: boolean;
  error: string | null;
  antiPauseShield: boolean;
  setAntiPauseShield: (active: boolean) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
}

/**
 * Custom React hook for controlling YouTube IFrame Player with Screen Share Anti-Pause Watchdog
 */
export function useNoorPathPlayer({
  videoId,
  autoResumeOnScreenShare = true,
  onStateChange: externalStateChange,
}: UseNoorPathPlayerOptions): UseNoorPathPlayerReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Status flags
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [antiPauseShield, setAntiPauseShield] = useState(autoResumeOnScreenShare);

  // Mutable refs for asynchronous event handlers & watchdog checks
  const isBufferingRef = useRef(false);
  const userManuallyPausedRef = useRef(false);
  const antiPauseShieldRef = useRef(antiPauseShield);
  antiPauseShieldRef.current = antiPauseShield;

  // Safe resume helper
  const safeResumeVideo = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    // RULE: Never interrupt buffering (State 3)
    if (isBufferingRef.current) return;

    try {
      if (typeof player.getPlayerState === "function") {
        const state = player.getPlayerState();
        // Only resume if state is PAUSED (2) or CUED (5)
        if (state === 2 || state === 5) {
          player.playVideo();
        }
      }
    } catch {
      // Catch transient cross-origin postMessage drops
    }
  }, []);

  // Watchdog Heartbeat (2500ms): Rescues unmuted playback when Android/iOS silently suspends it
  const startWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearInterval(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }

    watchdogTimerRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      // If tutor intentionally paused, respect user choice
      if (userManuallyPausedRef.current) return;
      // If shield is toggled off, do not force
      if (!antiPauseShieldRef.current) return;
      // Critical: If video is buffering, do not spam playVideo
      if (isBufferingRef.current) return;

      try {
        if (typeof player.getPlayerState === "function") {
          const state = player.getPlayerState();
          if (state === 2) {
            // PAUSED (2) detected while shield is ON and tutor did not manually pause
            player.playVideo();
          }
        }
      } catch {
        // Safe fail
      }
    }, 2500);
  }, []);

  const stopWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearInterval(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  // Mount player logic
  const mountPlayer = useCallback(async () => {
    if (!videoId) {
      setError("No valid YouTube Video ID provided.");
      return;
    }

    if (!containerRef.current) return;

    setError(null);
    setIsMounted(true);

    try {
      await loadYouTubeIframeApi();

      if (!window.YT || !window.YT.Player) {
        setError("YouTube Player API failed to initialize.");
        return;
      }

      // Cleanup prior instance if re-mounting
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
        playerRef.current = null;
      }

      const origin =
        typeof window !== "undefined" && window.location.origin.startsWith("http")
          ? window.location.origin
          : "https://noorpath.com";

      // Instantiate new YT.Player
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          enablejsapi: 1,
          playsinline: 1, // Crucial for iOS to play inline without hijacking fullscreen
          rel: 0,
          modestbranding: 1,
          origin: origin,
          controls: 1,
          fs: 1,
        },
        events: {
          onReady: (event) => {
            setIsLoaded(true);
            setIsBuffering(false);
            isBufferingRef.current = false;

            // Attempt unmuted auto-playback with max volume
            try {
              event.target.unMute();
              event.target.setVolume(100);
              event.target.playVideo();
            } catch {
              // Browser may enforce muted start; will catch on user interaction
            }

            // Explicitly verify iframe permissions
            try {
              const iframe = event.target.getIframe();
              if (iframe) {
                iframe.setAttribute(
                  "allow",
                  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                );
                iframe.setAttribute("allowfullscreen", "true");
              }
            } catch {
              // Ignore postMessage permission set failure
            }

            startWatchdog();
          },
          onStateChange: (event) => {
            const state = event.data;
            externalStateChange?.(state);

            if (state === 3) {
              // BUFFERING (3)
              isBufferingRef.current = true;
              setIsBuffering(true);
            } else if (state === 1) {
              // PLAYING (1)
              isBufferingRef.current = false;
              setIsBuffering(false);
              setIsPlaying(true);
              setIsPaused(false);
              userManuallyPausedRef.current = false;
            } else if (state === 2) {
              // PAUSED (2)
              isBufferingRef.current = false;
              setIsBuffering(false);
              setIsPlaying(false);
              setIsPaused(true);

              // If tutor clicked pause directly inside the YouTube iframe, respect user choice
              const isIframeInteracted =
                typeof document !== "undefined" &&
                document.activeElement &&
                document.activeElement.tagName === "IFRAME";

              if (isIframeInteracted) {
                userManuallyPausedRef.current = true;
              }

              // If paused automatically and shield is active, auto-resume
              if (antiPauseShieldRef.current && !userManuallyPausedRef.current) {
                safeResumeVideo();
              }
            } else if (state === 0) {
              // ENDED (0)
              isBufferingRef.current = false;
              setIsBuffering(false);
              setIsPlaying(false);
              setIsPaused(false);
              stopWatchdog();
            }
          },
          onError: (event) => {
            console.warn(`[NoorPathPlayer] Error event code:`, event.data);
            setError(`Playback error code: ${event.data}`);
          },
        },
      });
    } catch (err: unknown) {
      console.error("[NoorPathPlayer] Mount failed:", err);
      setError("Failed to mount YouTube player.");
    }
  }, [
    videoId,
    externalStateChange,
    safeResumeVideo,
    startWatchdog,
    stopWatchdog,
  ]);

  // Global Visibility & Focus listeners (wakes up player after tutor dismisses Meet overlays)
  useEffect(() => {
    if (!isMounted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (antiPauseShieldRef.current && !userManuallyPausedRef.current && !isBufferingRef.current) {
          safeResumeVideo();
        }
      }
    };

    const handleFocus = () => {
      if (antiPauseShieldRef.current && !userManuallyPausedRef.current && !isBufferingRef.current) {
        safeResumeVideo();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isMounted, safeResumeVideo]);

  // Clean-up on unmount (React 18 StrictMode safe)
  useEffect(() => {
    return () => {
      stopWatchdog();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
        playerRef.current = null;
      }
    };
  }, [stopWatchdog]);

  // Manual Controls
  const play = useCallback(() => {
    userManuallyPausedRef.current = false;
    try {
      playerRef.current?.playVideo();
    } catch {
      // Ignore
    }
  }, []);

  const pause = useCallback(() => {
    userManuallyPausedRef.current = true;
    try {
      playerRef.current?.pauseVideo();
    } catch {
      // Ignore
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  return {
    containerRef,
    mountPlayer,
    isMounted,
    isLoaded,
    isPlaying,
    isBuffering,
    isPaused,
    error,
    antiPauseShield,
    setAntiPauseShield,
    play,
    pause,
    togglePlay,
  };
}

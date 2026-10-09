"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Loader2,
  Volume2,
} from "lucide-react";
import { useNoorPathPlayer } from "../hooks/useNoorPathPlayer";
import { getYouTubeThumbnail, getYouTubeWatchUrl } from "../../../utils/youtube";

export interface YouTubePlayerProps {
  /** 11-char YouTube ID or URL containing it */
  videoId?: string | null;
  /** Title shown in player header */
  title?: string;
  /** Optional description */
  description?: string;
  /** Extra container styling */
  className?: string;
  /** Whether Anti-Pause Shield should be enabled by default (default true) */
  autoResumeOnScreenShare?: boolean;
  /** Optional callback when tutor clicks Open in YouTube App */
  onExternalOpen?: () => void;
}

/**
 * NoorPath Anti-Pause YouTube Player Component
 * Optimized for Google Meet screen sharing on Android, iOS, and Desktop.
 * Uses the Facade Pattern for fast initial rendering and physical touch activation.
 */
export function YouTubePlayer({
  videoId,
  title = "Interactive Video Lesson",
  description,
  className = "",
  autoResumeOnScreenShare = true,
  onExternalOpen,
}: YouTubePlayerProps) {
  const [thumbUrl, setThumbUrl] = useState<string>("");
  const [hasStarted, setHasStarted] = useState(false);

  const {
    containerRef,
    mountPlayer,
    isLoaded,
    isPlaying,
    isBuffering,
    isPaused,
    error,
    antiPauseShield,
    setAntiPauseShield,
    togglePlay,
  } = useNoorPathPlayer({
    videoId,
    autoResumeOnScreenShare,
  });

  // Thumbnail fallback handling (maxresdefault -> hqdefault)
  useEffect(() => {
    if (!videoId) {
      setThumbUrl("");
      return;
    }

    const maxRes = getYouTubeThumbnail(videoId, "maxresdefault");
    const hq = getYouTubeThumbnail(videoId, "hqdefault");

    const img = new Image();
    img.src = maxRes;
    img.onload = () => {
      // YouTube returns a 120px gray placeholder if maxres does not exist
      if (img.naturalWidth <= 120) {
        setThumbUrl(hq);
      } else {
        setThumbUrl(maxRes);
      }
    };
    img.onerror = () => {
      setThumbUrl(hq);
    };
  }, [videoId]);

  // When tutor taps thumbnail facade, mount player with physical user activation
  const handleFacadeClick = async () => {
    if (!videoId) return;
    setHasStarted(true);
    await mountPlayer();
  };

  // Helper badge text & style
  const getBadge = () => {
    if (error) {
      return { text: "Error", color: "bg-red-500/20 text-red-300 border-red-500/40" };
    }
    if (isBuffering) {
      return { text: "Buffering...", color: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse" };
    }
    if (isPlaying) {
      return { text: "Live Video", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
    }
    if (isPaused) {
      return { text: "Paused", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
    }
    if (hasStarted && !isLoaded) {
      return { text: "Connecting...", color: "bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse" };
    }
    return { text: "Ready to Play", color: "bg-slate-700/50 text-slate-300 border-slate-600/40" };
  };

  const badge = getBadge();
  const directWatchUrl = videoId ? getYouTubeWatchUrl(videoId) : "";

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-base">🎬</span>
          <h4 className="text-xs font-bold text-slate-200 truncate">{title}</h4>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.color}`}
        >
          {badge.text}
        </span>
      </div>

      {/* Video Container (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full bg-black overflow-hidden">
        {/* Lazy Facade (Shown until user taps play) */}
        {!hasStarted && (
          <div
            onClick={handleFacadeClick}
            className="group absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-cover bg-center transition-all select-none"
            style={{
              backgroundImage: thumbUrl ? `url('${thumbUrl}')` : undefined,
              backgroundColor: "#090d16",
            }}
            role="button"
            tabIndex={0}
            aria-label={`Play ${title}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleFacadeClick();
              }
            }}
          >
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 transition group-hover:from-black/70 group-hover:via-black/30" />

            {/* Glowing YouTube-styled Play Button */}
            <div className="relative flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-2xl bg-red-600 shadow-xl shadow-red-600/30 transition duration-200 group-hover:scale-110 group-hover:bg-red-500">
              <Play className="ml-1 h-8 w-8 fill-white text-white" />
            </div>

            {/* Tap to Play prompt */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-white/90">
              <span className="rounded-md bg-black/60 px-2 py-1 backdrop-blur-xs font-medium">
                Tap to Play with Audio
              </span>
              <span className="flex items-center gap-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 text-emerald-300 backdrop-blur-xs font-semibold">
                <Volume2 size={12} /> HQ Sound
              </span>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {hasStarted && !isLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/80 text-white">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">Loading Player...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/90 p-4 text-center text-red-400">
            <p className="text-xs font-semibold">{error}</p>
            {directWatchUrl && (
              <a
                href={directWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500"
              >
                <ExternalLink size={12} /> Open in YouTube
              </a>
            )}
          </div>
        )}

        {/* Target container for YouTube IFrame */}
        <div ref={containerRef} className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0" />
      </div>

      {/* Footer with Anti-Pause Shield and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {/* Play / Pause toggle */}
          {hasStarted && isLoaded && (
            <button
              type="button"
              onClick={togglePlay}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition active:scale-95 border ${
                isPlaying
                  ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30"
                  : "bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-400/40"
              }`}
              title={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <>
                  <Pause size={12} className="fill-amber-300" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={12} className="fill-white" />
                  <span>Play</span>
                </>
              )}
            </button>
          )}

          {/* Anti-Pause Shield Toggle */}
          <label
            className="inline-flex cursor-pointer items-center gap-2 select-none"
            title="Keeps video playing and resumes automatically when screen sharing on Google Meet"
          >
            <input
              type="checkbox"
              checked={antiPauseShield}
              onChange={(e) => setAntiPauseShield(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
            />
            <span
              className={`flex items-center gap-1 text-[11px] font-bold ${
                antiPauseShield ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {antiPauseShield ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
              Anti-Pause Shield {antiPauseShield ? "Active" : "Off"}
            </span>
          </label>
        </div>

        {/* Description or Escape Hatch */}
        <div className="flex items-center gap-3">
          {description && (
            <span className="hidden md:inline text-[11px] text-slate-400 max-w-[260px] truncate">
              {description}
            </span>
          )}
          {directWatchUrl && (
            <a
              href={directWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onExternalOpen}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white transition active:scale-95"
            >
              <ExternalLink size={12} />
              <span>YouTube App</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default YouTubePlayer;

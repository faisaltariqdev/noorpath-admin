"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useState, type RefObject } from "react";

interface FullscreenButtonProps {
  targetRef: RefObject<HTMLElement>;
  label: string;
  className?: string;
}

export default function FullscreenButton({
  targetRef,
  label,
  className = "",
}: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(document.fullscreenEnabled);
    const syncFullscreenState = () => setIsFullscreen(document.fullscreenElement === targetRef.current);
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, [targetRef]);

  const toggleFullscreen = useCallback(async () => {
    if (!isSupported || !targetRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await targetRef.current.requestFullscreen();
      }
    } catch {
      // Browser or device policy can reject fullscreen requests.
    }
  }, [isSupported, targetRef]);

  return (
    <button
      type="button"
      onClick={() => void toggleFullscreen()}
      disabled={!isSupported}
      aria-label={`${isFullscreen ? "Exit" : "Open"} ${label} fullscreen`}
      aria-pressed={isFullscreen}
      title={isSupported ? `${isFullscreen ? "Exit" : "Open"} fullscreen` : "Fullscreen is not supported on this device"}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-black shadow-sm transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${className}`}
    >
      {isFullscreen ? <Minimize2 aria-hidden="true" size={17} /> : <Maximize2 aria-hidden="true" size={17} />}
      <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
    </button>
  );
}

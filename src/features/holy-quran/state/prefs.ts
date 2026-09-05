import { DEFAULT_RECITER, parseReciterId } from "../data/reciters";
import type { HolyQuranPrefs, InkMode, ReaderLayout } from "../types";

export const HQ_PREFS_KEY = "noorpath-holy-quran-prefs-v1";
export const ZOOM_MIN = 80;
export const ZOOM_MAX = 180;
export const ZOOM_STEP = 10;

export function createDefaultPrefs(): HolyQuranPrefs {
  return { layout: "line", ink: "normal", zoom: 100, muted: false, reciter: DEFAULT_RECITER, practice: false };
}

function clampZoom(value: number): number {
  if (!Number.isFinite(value)) return 100;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value / ZOOM_STEP) * ZOOM_STEP));
}

export function loadPrefs(): HolyQuranPrefs {
  const fallback = createDefaultPrefs();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(HQ_PREFS_KEY);
    if (!raw) {
      const legacy = window.localStorage.getItem("noorpath-holy-quran-layout-v1");
      if (legacy === "line" || legacy === "page") return { ...fallback, layout: legacy };
      return fallback;
    }
    const parsed = JSON.parse(raw) as {
      layout?: string;
      ink?: string;
      zoom?: number;
      muted?: unknown;
      reciter?: string;
      practice?: unknown;
    };
    const layout: ReaderLayout = parsed.layout === "page" ? "page" : "line";
    const ink: InkMode = parsed.ink === "tajweed"
      ? "tajweed"
      : parsed.ink === "letters" || parsed.ink === "colorful"
        ? "letters"
        : "normal";
    return {
      layout,
      ink,
      zoom: clampZoom(Number(parsed.zoom)),
      muted: parsed.muted === true,
      reciter: parseReciterId(parsed.reciter),
      practice: parsed.practice === true,
    };
  } catch {
    return fallback;
  }
}

export function savePrefs(prefs: HolyQuranPrefs): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HQ_PREFS_KEY, JSON.stringify(prefs));
}

export function bumpZoom(zoom: number, direction: 1 | -1): number {
  return clampZoom(zoom + direction * ZOOM_STEP);
}

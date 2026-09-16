import { LETTERS } from "../data/curriculum";
import { TOPIC_LESSONS } from "../data/modules";
import type { QaidaAudioAssets } from "./QaidaAudioService";

export interface QaidaAudioManifestEntry {
  key: string;
  fallbackText: string;
  normal?: string;
  slow?: string;
  preload: "critical" | "adjacent" | "lazy";
  reviewStatus: "pending-qari-review" | "qari-reviewed";
}

export interface QaidaAudioManifest {
  version: 1;
  fallback: "device-arabic-voice";
  entries: QaidaAudioManifestEntry[];
}

/**
 * Real recitation recordings (served from /public). Keyed by lesson id; both the
 * `lesson-<id>` and `example-<id>` audio keys resolve to the same file.
 * "slow" is intentionally omitted — QaidaAudioService plays the normal file at a
 * reduced playbackRate instead of falling back to device speech.
 */
const LESSON_RECORDINGS: Record<string, string> = {
  "kalima-tayyabah": "/audio/kalmas/kalima-tayyabah.mp3",
  "kalima-shahadat": "/audio/kalmas/kalima-shahadat.mp3",
  "kalima-tamjeed": "/audio/kalmas/kalima-tamjeed.mp3",
  "kalima-tawheed": "/audio/kalmas/kalima-tawheed.mp3",
  "kalima-istighfar": "/audio/kalmas/kalima-istighfar.mp3",
  "kalima-radd-e-kufr": "/audio/kalmas/kalima-radd-e-kufr.mp3",
};

function recordingFor(audioKey: string): string | undefined {
  return LESSON_RECORDINGS[audioKey.replace(/^(lesson|example)-/, "")];
}

export const QAIDA_AUDIO_MANIFEST: QaidaAudioManifest = {
  version: 1,
  fallback: "device-arabic-voice",
  entries: [
    ...LETTERS.map((letter, index) => ({
      key: letter.audioKey,
      fallbackText: letter.letter,
      preload: (index < 2 ? "adjacent" : "lazy") as "adjacent" | "lazy",
      reviewStatus: letter.reviewStatus,
    })),
    ...TOPIC_LESSONS.flatMap((lesson) => [
      {
        key: lesson.audioKey,
        fallbackText: lesson.examples[0]?.arabic ?? lesson.arabicTitle,
        normal: recordingFor(lesson.audioKey),
        preload: "lazy" as const,
        reviewStatus: lesson.reviewStatus,
      },
      ...lesson.examples.map((item) => ({
        key: item.audioKey,
        fallbackText: item.arabic,
        normal: recordingFor(item.audioKey),
        preload: "lazy" as const,
        reviewStatus: lesson.reviewStatus,
      })),
    ]),
  ],
};

/**
 * Reviewed recordings can be added to manifest entries without changing any
 * lesson component. Until then, absent URLs deliberately use device speech.
 */
export function manifestToAudioAssets(manifest: QaidaAudioManifest): QaidaAudioAssets {
  return {
    pronunciations: Object.fromEntries(
      manifest.entries
        .filter((entry) => entry.normal || entry.slow)
        .map((entry) => [entry.key, { normal: entry.normal, slow: entry.slow }]),
    ),
  };
}

export function preloadQaidaAudio(keys: string[]) {
  if (typeof Audio === "undefined") return;
  const entries = QAIDA_AUDIO_MANIFEST.entries.filter((entry) => keys.includes(entry.key));
  entries.forEach((entry) => {
    const source = entry.normal;
    if (!source) return;
    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = source;
  });
}


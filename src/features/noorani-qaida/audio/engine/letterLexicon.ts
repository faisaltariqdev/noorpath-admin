/**
 * Canonical Arabic speech text for Qaida letters.
 * Uses Arabic script only (never English transliteration for letter playback).
 * A short fatha (َ) is appended to isolated letters so TTS engines vocalize
 * the letter rather than skipping a silent grapheme — the glyph spoken is still Arabic.
 */
import { LETTERS } from "../../data/curriculum";

const FATHA = "\u064E";

/** Isolated Arabic letter → preferred spoken Arabic form */
export const ARABIC_LETTER_SPEECH: Record<string, string> = Object.fromEntries(
  LETTERS.map((letter) => [letter.letter, `${letter.letter}${FATHA}`]),
);

export function arabicSpeechForKey(key: string, fallbackText: string): string {
  const letter = LETTERS.find((item) => item.audioKey === key || `letter-${item.id}` === key);
  if (letter) return ARABIC_LETTER_SPEECH[letter.letter] || `${letter.letter}${FATHA}`;

  const trimmed = fallbackText.trim();
  if (!trimmed) return "";

  // Single Arabic letter → add fatha for reliable TTS
  const chars = [...trimmed];
  if (chars.length === 1 && /[\u0600-\u06FF]/.test(chars[0]!)) {
    return `${chars[0]}${FATHA}`;
  }

  return trimmed;
}

export function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

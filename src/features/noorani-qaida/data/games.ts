import type { GameId, Letter } from "../types";
import { LETTERS } from "./curriculum";

export interface GameMeta {
  id: GameId;
  /** Generic display label used in the general Games hub. */
  label: string;
  /** Letter-specific label, e.g. "Find Alif". */
  letterLabel: (name: string) => string;
  icon: string;
  /** Tailwind gradient classes for the card accent. */
  accent: string;
  desc: string;
  /**
   * When true the game trains a single target letter (the current lesson letter).
   * When false the game works across the current letter's family/group.
   */
  singleLetter: boolean;
}

export const GAME_CATALOG: GameMeta[] = [
  {
    id: "bubble-pop",
    label: "Bubble Pop",
    letterLabel: (name) => `Pop ${name}`,
    icon: "🫧",
    accent: "from-fuchsia-400 to-violet-600",
    desc: "Pop the bubbles that carry this letter.",
    singleLetter: true,
  },
  {
    id: "find-letter",
    label: "Find the Letter",
    letterLabel: (name) => `Find ${name}`,
    icon: "🔍",
    accent: "from-sky-400 to-blue-600",
    desc: "Spot this letter among lookalikes.",
    singleLetter: true,
  },
  {
    id: "sound-match",
    label: "Sound Match",
    letterLabel: (name) => `Hear ${name}`,
    icon: "🎵",
    accent: "from-pink-400 to-rose-600",
    desc: "Listen, then tap the matching letter.",
    singleLetter: true,
  },
  {
    id: "memory-match",
    label: "Memory Match",
    letterLabel: (name) => `${name} Memory`,
    icon: "🃏",
    accent: "from-emerald-400 to-teal-600",
    desc: "Match letters with their names.",
    singleLetter: false,
  },
  {
    id: "letter-train",
    label: "Letter Train",
    letterLabel: (name) => `${name} Train`,
    icon: "🚂",
    accent: "from-orange-400 to-rose-500",
    desc: "Place the letters in the right order.",
    singleLetter: false,
  },
  {
    id: "puzzle",
    label: "Letter Puzzle",
    letterLabel: (name) => `${name} Puzzle`,
    icon: "🧩",
    accent: "from-indigo-400 to-purple-600",
    desc: "Find the missing letter in the sequence.",
    singleLetter: false,
  },
  {
    id: "quick-challenge",
    label: "Quick Quiz",
    letterLabel: (name) => `${name} Quiz`,
    icon: "⚡",
    accent: "from-amber-400 to-pink-500",
    desc: "Name the letter before time runs out.",
    singleLetter: false,
  },
];

export const ALL_GAME_IDS: GameId[] = GAME_CATALOG.map((game) => game.id);

export const GAME_BY_ID = Object.fromEntries(
  GAME_CATALOG.map((game) => [game.id, game]),
) as Record<GameId, GameMeta>;

/**
 * Returns a contiguous, id-sorted window of letters that always includes the
 * active letter. Games need at least four letters for distractors and the
 * puzzle game needs ordered neighbours, so we default to a six-letter window.
 */
export function letterWindow(activeId: number, size = 6): Letter[] {
  const total = LETTERS.length;
  const span = Math.min(size, total);
  let start = Math.max(0, activeId - 1 - Math.floor(span / 2));
  start = Math.min(start, total - span);
  start = Math.max(0, start);
  return LETTERS.slice(start, start + span);
}

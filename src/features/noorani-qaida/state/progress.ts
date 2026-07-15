import type { Badge, QaidaAction, QaidaProgress } from "../types";

export const PROGRESS_STORAGE_KEY = "noorpath-qaida-v4";
export const LEGACY_PROGRESS_KEYS = ["noorpath-qaida-v3", "noorpath-qaida-v2", "noorpath-qaida-progress"];

const XP_PER_LEVEL = 300;

function calcLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

const ALL_BADGES: Badge[] = [
  { id: "first-letter", label: "First Step", icon: "🌱", description: "Completed your first letter lesson", earned: false },
  { id: "five-letters", label: "Rising Star", icon: "⭐", description: "Completed 5 letter lessons", earned: false },
  { id: "ten-letters", label: "Letter Scholar", icon: "📚", description: "Completed 10 letter lessons", earned: false },
  { id: "all-letters", label: "Alphabet Master", icon: "🏆", description: "Completed all 28 Arabic letters", earned: false },
  { id: "first-game", label: "Game On!", icon: "🎮", description: "Completed your first mini-game", earned: false },
  { id: "five-games", label: "Game Champion", icon: "🎯", description: "Completed 5 mini-games", earned: false },
  { id: "streak-3", label: "3-Day Streak", icon: "🔥", description: "Studied 3 days in a row", earned: false },
  { id: "streak-7", label: "Week Warrior", icon: "⚡", description: "Studied 7 days in a row", earned: false },
  { id: "level-2", label: "Level Up!", icon: "🚀", description: "Reached Level 2", earned: false },
  { id: "level-5", label: "Qaida Star", icon: "🌟", description: "Reached Level 5", earned: false },
  { id: "coins-100", label: "Rich Learner", icon: "🪙", description: "Earned 100 coins", earned: false },
  { id: "perfect-game", label: "Perfectionist", icon: "💎", description: "Got 3 stars in a game", earned: false },
];

export const DEFAULT_PROGRESS: QaidaProgress = {
  hydrated: false,
  version: 4,
  xp: 0,
  coins: 0,
  stars: 0,
  level: 1,
  xpMax: XP_PER_LEVEL,
  streak: 0,
  lastStudyDate: null,
  completed: [],
  ratings: {},
  badges: ALL_BADGES.map((b) => ({ ...b })),
  gamesCompleted: 0,
  totalPracticeSeconds: 0,
  settings: {
    previewMode: "child",
    theme: "light",
    audioEnabled: true,
    reducedMotion: false,
  },
};

function awardBadgesForState(progress: QaidaProgress): QaidaProgress {
  const letterCompleted = progress.completed.filter((id) => id.startsWith("letter-")).length;
  const conditions: Record<string, boolean> = {
    "first-letter": letterCompleted >= 1,
    "five-letters": letterCompleted >= 5,
    "ten-letters": letterCompleted >= 10,
    "all-letters": letterCompleted >= 28,
    "first-game": progress.gamesCompleted >= 1,
    "five-games": progress.gamesCompleted >= 5,
    "streak-3": progress.streak >= 3,
    "streak-7": progress.streak >= 7,
    "level-2": progress.level >= 2,
    "level-5": progress.level >= 5,
    "coins-100": progress.coins >= 100,
  };

  const now = new Date().toISOString();
  const badges = progress.badges.map((b) => {
    if (!b.earned && conditions[b.id]) {
      return { ...b, earned: true, earnedAt: now };
    }
    return b;
  });

  return { ...progress, badges };
}

export function progressReducer(state: QaidaProgress, action: QaidaAction): QaidaProgress {
  switch (action.type) {
    case "hydrate": {
      return awardBadgesForState({ ...DEFAULT_PROGRESS, ...action.value, hydrated: true });
    }

    case "complete_screen": {
      if (state.completed.includes(action.id)) return state;
      const completed = [...state.completed, action.id];
      const xp = state.xp + 25;
      const coins = state.coins + 10;
      const level = calcLevel(xp);
      return awardBadgesForState({ ...state, completed, xp, coins, level });
    }

    case "earn_xp": {
      const xp = state.xp + action.amount;
      const level = calcLevel(xp);
      return awardBadgesForState({ ...state, xp, level });
    }

    case "earn_coins": {
      const coins = state.coins + action.amount;
      return awardBadgesForState({ ...state, coins });
    }

    case "rate_screen": {
      const ratings = { ...state.ratings, [action.id]: action.stars };
      const totalStars = Object.values(ratings).reduce((sum, s) => sum + s, 0);
      return awardBadgesForState({ ...state, ratings, stars: totalStars });
    }

    case "game_completed": {
      const gamesCompleted = state.gamesCompleted + 1;
      return awardBadgesForState({ ...state, gamesCompleted });
    }

    case "update_streak": {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (state.lastStudyDate === today) return state;
      const streak = state.lastStudyDate === yesterday ? state.streak + 1 : 1;
      return awardBadgesForState({ ...state, streak, lastStudyDate: today });
    }

    case "update_settings": {
      return { ...state, settings: { ...state.settings, ...action.settings } };
    }

    case "reset": {
      return { ...DEFAULT_PROGRESS, hydrated: true };
    }

    default:
      return state;
  }
}

export function parseProgress(raw: string | null): Partial<QaidaProgress> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as Partial<QaidaProgress>;
  } catch {
    return {};
  }
}

export function isScreenUnlocked(progress: QaidaProgress, id: string): boolean {
  if (id === "cover" || id === "toc") return true;
  if (progress.completed.length === 0 && id === "letter-1") return true;
  if (id.startsWith("letter-")) {
    const num = parseInt(id.replace("letter-", ""), 10);
    return num === 1 || progress.completed.includes(`letter-${num - 1}`);
  }
  return progress.completed.length > 0;
}

export function getCurrentLesson(progress: QaidaProgress): string {
  for (let i = 1; i <= 28; i++) {
    if (!progress.completed.includes(`letter-${i}`)) return `letter-${i}`;
  }
  return "certificate";
}

import type { Badge, QaidaAction, QaidaProgress } from "../types";
import { getCurrentCurriculumScreen, isCurriculumScreenUnlocked, isModuleComplete } from "./curriculumProgress";

export const PROGRESS_STORAGE_KEY = "noorpath-qaida-v5";
export const LEGACY_PROGRESS_KEYS = ["noorpath-qaida-v4", "noorpath-qaida-v3", "noorpath-qaida-v2", "noorpath-qaida-progress"];

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
  { id: "vowel-explorer", label: "Vowel Explorer", icon: "🎵", description: "Completed the Harakaat module", earned: false },
  { id: "word-reader", label: "Word Reader", icon: "📖", description: "Completed progressive word reading", earned: false },
  { id: "quran-ready", label: "Quran Ready", icon: "🌙", description: "Completed Quranic practice", earned: false },
  { id: "qaida-graduate", label: "Qaida Graduate", icon: "🏅", description: "Passed the final review", earned: false },
];

export const DEFAULT_PROGRESS: QaidaProgress = {
  hydrated: false,
  version: 5,
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
  currentScreenId: "letter-1",
  assessmentAttempts: [],
  reviewSummaries: [],
  settings: {
    previewMode: "child",
    theme: "light",
    audioEnabled: true,
    reducedMotion: false,
  },
};

/** Merge saved badge flags onto the canonical catalog — never trust stored shape. */
function normalizeBadges(raw: unknown): Badge[] {
  const stored = Array.isArray(raw)
    ? raw.filter((badge): badge is Partial<Badge> & { id: string } =>
        Boolean(badge) && typeof badge === "object" && typeof (badge as Badge).id === "string",
      )
    : [];

  return ALL_BADGES.map((defaultBadge) => {
    const saved = stored.find((badge) => badge.id === defaultBadge.id);
    return {
      ...defaultBadge,
      earned: Boolean(saved?.earned),
      earnedAt: typeof saved?.earnedAt === "string" ? saved.earnedAt : undefined,
    };
  });
}

function awardBadgesForState(progress: QaidaProgress): QaidaProgress {
  const completed = Array.isArray(progress.completed) ? progress.completed : [];
  const attempts = Array.isArray(progress.assessmentAttempts) ? progress.assessmentAttempts : [];
  const letterCompleted = completed.filter((id) => typeof id === "string" && id.startsWith("letter-")).length;
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
    "vowel-explorer": isModuleComplete(progress, "harakaat"),
    "word-reader": isModuleComplete(progress, "word-reading"),
    "quran-ready": isModuleComplete(progress, "quranic-practice"),
    "qaida-graduate": attempts.some((attempt) => attempt?.screenId === "final-assessment" && attempt.passed),
  };

  const now = new Date().toISOString();
  const badges = normalizeBadges(progress.badges).map((b) => {
    if (!b.earned && conditions[b.id]) {
      return { ...b, earned: true, earnedAt: now };
    }
    return b;
  });

  return { ...progress, completed, assessmentAttempts: attempts, badges };
}

export function progressReducer(state: QaidaProgress, action: QaidaAction): QaidaProgress {
  switch (action.type) {
    case "hydrate": {
      try {
        const badges = normalizeBadges(action.value.badges);
        const completed = Array.isArray(action.value.completed)
          ? action.value.completed.filter((id): id is string => typeof id === "string")
          : [];
        return awardBadgesForState({
          ...DEFAULT_PROGRESS,
          ...action.value,
          version: DEFAULT_PROGRESS.version,
          hydrated: true,
          completed,
          ratings: action.value.ratings && typeof action.value.ratings === "object" ? action.value.ratings : {},
          badges,
          currentScreenId: typeof action.value.currentScreenId === "string"
            ? action.value.currentScreenId
            : getCurrentCurriculumScreen({ ...DEFAULT_PROGRESS, ...action.value, completed, badges } as QaidaProgress),
          assessmentAttempts: Array.isArray(action.value.assessmentAttempts)
            ? action.value.assessmentAttempts.filter((attempt) => Boolean(attempt) && typeof attempt === "object")
            : [],
          reviewSummaries: Array.isArray(action.value.reviewSummaries)
            ? action.value.reviewSummaries.filter((summary) => Boolean(summary) && typeof summary === "object")
            : [],
          settings: {
            ...DEFAULT_PROGRESS.settings,
            ...(action.value.settings && typeof action.value.settings === "object"
              ? action.value.settings
              : {}),
          },
        });
      } catch (error) {
        console.error("[Noorani Qaida] Corrupt progress payload — using defaults", error);
        return {
          ...DEFAULT_PROGRESS,
          hydrated: true,
          badges: ALL_BADGES.map((b) => ({ ...b })),
          settings: { ...DEFAULT_PROGRESS.settings },
        };
      }
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

    case "set_current_screen":
      return { ...state, currentScreenId: action.id };

    case "record_assessment":
      return awardBadgesForState({
        ...state,
        assessmentAttempts: [...state.assessmentAttempts, action.attempt],
      });

    case "record_review":
      return {
        ...state,
        reviewSummaries: [...state.reviewSummaries, action.summary],
      };

    case "add_practice_time":
      return {
        ...state,
        totalPracticeSeconds: state.totalPracticeSeconds + Math.max(0, action.seconds),
      };

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
      return {
        ...DEFAULT_PROGRESS,
        hydrated: true,
        completed: [],
        ratings: {},
        badges: ALL_BADGES.map((b) => ({ ...b })),
        assessmentAttempts: [],
        reviewSummaries: [],
        settings: { ...DEFAULT_PROGRESS.settings },
      };
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
  return isCurriculumScreenUnlocked(progress, id);
}

export function getCurrentLesson(progress: QaidaProgress): string {
  for (let i = 1; i <= 28; i++) {
    if (!progress.completed.includes(`letter-${i}`)) return `letter-${i}`;
  }
  return "letter-28";
}

export { getCurrentCurriculumScreen };

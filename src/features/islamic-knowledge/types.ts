export type Difficulty = "easy" | "medium" | "hard";
export type TrackLevel = "beginner" | "intermediate" | "advanced";
export type AgeBand = "young" | "mid" | "older";

export type QuestionKind =
  | "mcq"
  | "true_false"
  | "fill_blank"
  | "matching"
  | "sorting"
  | "tap_select";

export interface IKOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface IKQuestion {
  id: string;
  kind: QuestionKind;
  difficulty: Difficulty;
  prompt: string;
  /** Shown after a first wrong attempt — nudges without giving the answer away. */
  hint?: string;
  /** Shown after the answer is settled — the "why", never a copy of the hint. */
  explanation?: string;
  /**
   * Concept key (e.g. "allah-creator"). A quiz session never asks two questions
   * with the same concept, which is what stops "the same fact asked twice".
   */
  concept?: string;
  /** Correct option id(s) or fill text / ordered ids */
  answer: string | string[];
  options?: IKOption[];
  /** Matching pairs: left id → right id */
  pairs?: { left: string; right: string }[];
  /** Sorting: correct order of option ids */
  order?: string[];
}

export interface LessonStep {
  id: string;
  type: "intro" | "card" | "tap" | "mascot" | "fact";
  title?: string;
  text: string;
  emoji?: string;
  illustration?: string;
  mascotMood?: "happy" | "think" | "cheer" | "hint";
  /** Optional YouTube video URL (e.g. https://youtu.be/xxx). When set the step visual shows an embedded video. */
  videoUrl?: string;
}

export interface IKLesson {
  id: string;
  topicId: string;
  title: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  ageMin: number;
  ageMax: number;
  estimatedMinutes: number;
  steps: LessonStep[];
  questions: IKQuestion[];
  badgeId?: string;
}

export interface IKTopic {
  id: string;
  level: TrackLevel;
  order: number;
  title: string;
  shortTitle: string;
  emoji: string;
  color: string;
  summary: string;
  lessonIds: string[];
}

export interface IKBadge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  earned?: boolean;
  earnedAt?: string;
}

/** The learner's animated buddy. Both share one rig; only the art layer differs. */
export type IKCompanionId = "noori" | "noora";

export interface IKProgress {
  xp: number;
  coins: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  completedLessonIds: string[];
  lessonStars: Record<string, 1 | 2 | 3>;
  quizScores: Record<string, { correct: number; total: number; at: string }>;
  weakTopicIds: string[];
  badges: IKBadge[];
  dailyChallengeDone: boolean;
  dailyChallengeDate: string | null;
  /** Result of the most recent daily challenge (kept for the home card). */
  dailyChallengeScore: { correct: number; total: number } | null;
  /** Question ids served in the previous session per lesson — the engine avoids them next time. */
  questionHistory: Record<string, string[]>;
  /** How many times each lesson quiz has been played (drives difficulty ramp). */
  lessonAttempts: Record<string, number>;
  /** Last lesson the learner opened — powers "Continue where you left off". */
  lastLessonId: string | null;
  companion: IKCompanionId;
  /** Lifetime quiz stats. */
  totalAnswered: number;
  totalCorrect: number;
  bestCombo: number;
}

export type IKView =
  | "home"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "lesson"
  | "challenge"
  | "rewards"
  | "manage";

export interface TopicToggleState {
  disabledTopicIds: string[];
  updatedAt?: string;
}

export interface IKLessonReward {
  stars: 1 | 2 | 3;
  earnedXp: number;
  earnedCoins: number;
  levelUp: boolean;
  newBadges: string[];
}

/** What the lesson player reports back when a quiz finishes. */
export interface IKQuizOutcome {
  correct: number;
  total: number;
  /** Ids of every question served, in order (stored as history). */
  servedQuestionIds: string[];
  /** Ids the learner got wrong on first try. */
  missedQuestionIds: string[];
  bestCombo: number;
}

export type Difficulty = "easy" | "medium" | "hard";
export type TrackLevel = "beginner" | "intermediate" | "advanced";

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
  hint?: string;
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
}

export type IKView =
  | "home"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "lesson"
  | "rewards"
  | "manage";

export interface TopicToggleState {
  disabledTopicIds: string[];
  updatedAt?: string;
}

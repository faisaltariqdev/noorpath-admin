export interface Letter {
  id: number;
  letter: string;
  name: string;
  sound: string;
  forms: [string, string, string, string];
  example: string;
  meaning: string;
  makharij: string;
  mouthPosition: string;
  childExplanation: string;
  teacherNote: string;
  parentNote: string;
  writingHint: string;
  audioKey: string;
  reviewStatus: ReviewStatus;
}

export type ScreenId = string;
export type ReviewStatus = "pending-qari-review" | "qari-reviewed";
export type ModuleId =
  | "alphabet"
  | "harakaat"
  | "double-harakaat"
  | "sukoon"
  | "shaddah"
  | "madd"
  | "joining"
  | "word-reading"
  | "quranic-practice"
  | "revision"
  | "final-review"
  | "daily-duas"
  | "namaz";

export type LessonKind =
  | "letter"
  | "mark"
  | "madd"
  | "joining"
  | "reading"
  | "quranic"
  | "revision"
  | "assessment"
  | "dua"
  | "salah";

/** Visual posture used for Namaz / Wudu step illustration */
export type SalahPosture =
  | "overview"
  | "standing"
  | "takbir"
  | "bowing"
  | "rising"
  | "prostration"
  | "sitting"
  | "salam"
  | "wudu-hands"
  | "wudu-mouth"
  | "wudu-nose"
  | "wudu-face"
  | "wudu-arms"
  | "wudu-head"
  | "wudu-ears"
  | "wudu-feet";

export interface SalahStep {
  id: string;
  order: number;
  title: string;
  arabicTitle?: string;
  arabic?: string;
  transliteration?: string;
  translation: string;
  visualCue: string;
  posture: SalahPosture;
  teacherNote?: string;
}

export interface InteractiveExample {
  id: string;
  arabic: string;
  transliteration: string;
  meaning?: string;
  audioKey: string;
  segments?: string[];
}

export interface TopicLesson {
  id: ScreenId;
  moduleId: ModuleId;
  kind: LessonKind;
  title: string;
  arabicTitle: string;
  summary: string;
  childExplanation: string;
  teacherTip: string;
  parentTip: string;
  mouthPosition?: string;
  writingHint?: string;
  traceValue?: string;
  audioKey: string;
  examples: InteractiveExample[];
  /** Step-by-step guided flow for Namaz / Wudu lessons */
  steps?: SalahStep[];
  whenToSay?: string;
  reviewStatus: ReviewStatus;
}

export interface QaidaModule {
  id: ModuleId;
  order: number;
  title: string;
  arabicTitle: string;
  description: string;
  icon: string;
  accent: string;
  prerequisite?: ModuleId;
  screenIds: ScreenId[];
  reviewStatus: ReviewStatus;
}

export interface AssessmentAttempt {
  screenId: ScreenId;
  score: number;
  total: number;
  passed: boolean;
  completedAt: string;
}

export interface ReviewSummary {
  screenId: ScreenId;
  correct: number;
  total: number;
  completedAt: string;
}

export interface CurriculumItem {
  id: ScreenId;
  title: string;
  unit: string;
  arabic?: string;
  summary: string;
}

export interface Badge {
  id: string;
  label: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export interface QaidaSettings {
  previewMode: "child" | "parent" | "teacher";
  theme: "light" | "dark";
  audioEnabled: boolean;
  reducedMotion: boolean;
}

export interface QaidaProgress {
  hydrated: boolean;
  version: number;
  xp: number;
  coins: number;
  stars: number;
  level: number;
  xpMax: number;
  streak: number;
  lastStudyDate: string | null;
  completed: ScreenId[];
  ratings: Record<ScreenId, 1 | 2 | 3>;
  badges: Badge[];
  gamesCompleted: number;
  totalPracticeSeconds: number;
  currentScreenId: ScreenId;
  assessmentAttempts: AssessmentAttempt[];
  reviewSummaries: ReviewSummary[];
  settings: QaidaSettings;
}

export type QaidaAction =
  | { type: "hydrate"; value: Partial<QaidaProgress> }
  | { type: "complete_screen"; id: ScreenId }
  | { type: "earn_xp"; amount: number }
  | { type: "earn_coins"; amount: number }
  | { type: "rate_screen"; id: ScreenId; stars: 1 | 2 | 3 }
  | { type: "game_completed" }
  | { type: "set_current_screen"; id: ScreenId }
  | { type: "record_assessment"; attempt: AssessmentAttempt }
  | { type: "record_review"; summary: ReviewSummary }
  | { type: "add_practice_time"; seconds: number }
  | { type: "update_streak" }
  | { type: "update_settings"; settings: Partial<QaidaSettings> }
  | { type: "reset" };

export type GameId = "bubble-pop" | "find-letter" | "memory-match" | "quick-challenge" | "sound-match" | "letter-train" | "puzzle";

export interface GameResult {
  gameId: GameId;
  score: number;
  stars: 1 | 2 | 3;
  xpEarned: number;
  coinsEarned: number;
  timeSeconds: number;
}

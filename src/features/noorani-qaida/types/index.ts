export interface Letter {
  id: number;
  letter: string;
  name: string;
  sound: string;
  forms: [string, string, string, string];
  example: string;
  meaning: string;
  makharij: string;
}

export type ScreenId = string;

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
  settings: QaidaSettings;
}

export type QaidaAction =
  | { type: "hydrate"; value: Partial<QaidaProgress> }
  | { type: "complete_screen"; id: ScreenId }
  | { type: "earn_xp"; amount: number }
  | { type: "earn_coins"; amount: number }
  | { type: "rate_screen"; id: ScreenId; stars: 1 | 2 | 3 }
  | { type: "game_completed" }
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

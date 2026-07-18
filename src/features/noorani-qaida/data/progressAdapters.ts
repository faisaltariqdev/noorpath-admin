import { LETTERS } from "./curriculum";
import { DEFAULT_PROGRESS, parseProgress, progressReducer } from "../state/progress";
import type { QaidaProgress } from "../types";
import { CURRICULUM_MODULES } from "./modules";
import { getModuleProgress, getOverallCurriculumProgress } from "../state/curriculumProgress";

export interface ParentProgressSnapshot {
  source: "device";
  progress: QaidaProgress;
  lettersCompleted: number;
  completionPercent: number;
  nextLetterName: string | null;
  earnedBadges: number;
  overallCurriculumPercent: number;
  currentModuleTitle: string;
  modulesCompleted: number;
  practiceMinutes: number;
  homeworkReady: boolean;
}

export type TutorProgressSnapshot =
  | { status: "available"; students: never[] }
  | {
      status: "unavailable";
      reason: string;
      requiredIntegration: string;
    };

export function createParentProgressSnapshot(raw: string | null): ParentProgressSnapshot {
  const progress = progressReducer(DEFAULT_PROGRESS, { type: "hydrate", value: parseProgress(raw) });
  const lettersCompleted = LETTERS.filter((letter) =>
    progress.completed.includes(`letter-${letter.id}`),
  ).length;
  const nextLetter = LETTERS.find((letter) => !progress.completed.includes(`letter-${letter.id}`));
  const overall = getOverallCurriculumProgress(progress);
  const moduleStates = CURRICULUM_MODULES.map((module) => ({
    module,
    state: getModuleProgress(progress, module.id),
  }));
  const currentModule = moduleStates.find(({ state }) => state.unlocked && !state.complete)?.module
    ?? CURRICULUM_MODULES[CURRICULUM_MODULES.length - 1];

  return {
    source: "device",
    progress,
    lettersCompleted,
    completionPercent: Math.round((lettersCompleted / LETTERS.length) * 100),
    nextLetterName: nextLetter?.name ?? null,
    earnedBadges: progress.badges.filter((badge) => badge?.earned).length,
    overallCurriculumPercent: overall.percent,
    currentModuleTitle: currentModule.title,
    modulesCompleted: moduleStates.filter(({ state }) => state.complete).length,
    practiceMinutes: Math.round(progress.totalPracticeSeconds / 60),
    homeworkReady: progress.completed.length > 0,
  };
}

export function createTutorProgressSnapshot(): TutorProgressSnapshot {
  return {
    status: "unavailable",
    reason: "No shared Noorani Qaida student progress records are connected yet.",
    requiredIntegration: "Connect verified student progress records before class analytics can be shown.",
  };
}

import { ALL_CURRICULUM_SCREEN_IDS, CURRICULUM_MODULES, moduleForScreen } from "../data/modules";
import type { ModuleId, QaidaProgress, ScreenId } from "../types";

export interface ModuleProgress {
  id: ModuleId;
  completed: number;
  total: number;
  percent: number;
  unlocked: boolean;
  complete: boolean;
}

export function isModuleComplete(progress: QaidaProgress, moduleId: ModuleId): boolean {
  const moduleDefinition = CURRICULUM_MODULES.find((item) => item.id === moduleId);
  if (!moduleDefinition) return false;
  const required = moduleDefinition.screenIds.filter((id) => id !== "certificate");
  return required.length > 0 && required.every((id) => progress.completed.includes(id));
}

export function isModuleUnlocked(progress: QaidaProgress, moduleId: ModuleId): boolean {
  const moduleDefinition = CURRICULUM_MODULES.find((item) => item.id === moduleId);
  if (!moduleDefinition) return false;
  return !moduleDefinition.prerequisite || isModuleComplete(progress, moduleDefinition.prerequisite);
}

export function isCurriculumScreenUnlocked(progress: QaidaProgress, id: ScreenId): boolean {
  if (id === "cover" || id === "toc") return true;
  const moduleDefinition = moduleForScreen(id);
  if (!moduleDefinition || !isModuleUnlocked(progress, moduleDefinition.id)) return false;

  if (id === "letter-1") return true;
  if (id.startsWith("letter-")) {
    const number = Number(id.slice(7));
    return number === 1 || progress.completed.includes(`letter-${number - 1}`);
  }
  if (id === "certificate") {
    return progress.assessmentAttempts.some((attempt) =>
      attempt.screenId === "final-assessment" && attempt.passed
    );
  }

  const index = moduleDefinition.screenIds.indexOf(id);
  return index <= 0 || progress.completed.includes(moduleDefinition.screenIds[index - 1]);
}

export function getCurrentCurriculumScreen(progress: QaidaProgress): ScreenId {
  return ALL_CURRICULUM_SCREEN_IDS.find((id) =>
    !progress.completed.includes(id) && isCurriculumScreenUnlocked(progress, id)
  ) ?? "certificate";
}

export function getModuleProgress(progress: QaidaProgress, moduleId: ModuleId): ModuleProgress {
  const moduleDefinition = CURRICULUM_MODULES.find((item) => item.id === moduleId);
  if (!moduleDefinition) return { id: moduleId, completed: 0, total: 0, percent: 0, unlocked: false, complete: false };
  const required = moduleDefinition.screenIds.filter((id) => id !== "certificate");
  const completed = required.filter((id) => progress.completed.includes(id)).length;
  return {
    id: moduleId,
    completed,
    total: required.length,
    percent: required.length ? Math.round((completed / required.length) * 100) : 0,
    unlocked: isModuleUnlocked(progress, moduleId),
    complete: required.length > 0 && completed === required.length,
  };
}

export function getOverallCurriculumProgress(progress: QaidaProgress) {
  const required = ALL_CURRICULUM_SCREEN_IDS.filter((id) => id !== "certificate");
  const completed = required.filter((id) => progress.completed.includes(id)).length;
  return {
    completed,
    total: required.length,
    percent: required.length ? Math.round((completed / required.length) * 100) : 0,
  };
}


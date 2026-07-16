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

// Every module in the Noorani Qaida is freely accessible; progress is still
// tracked, but no chapter, lesson, or letter is gated behind another.
export function isModuleUnlocked(progress: QaidaProgress, moduleId: ModuleId): boolean {
  void progress;
  return CURRICULUM_MODULES.some((item) => item.id === moduleId);
}

export function isCurriculumScreenUnlocked(progress: QaidaProgress, id: ScreenId): boolean {
  void progress;
  return id === "cover" || id === "toc" || Boolean(moduleForScreen(id));
}

export function getCurrentCurriculumScreen(progress: QaidaProgress): ScreenId {
  return ALL_CURRICULUM_SCREEN_IDS.find((id) =>
    id !== "certificate" && !progress.completed.includes(id)
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


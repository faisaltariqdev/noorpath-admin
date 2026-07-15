export const LESSON_STEPS = [
  "welcome",
  "introduce",
  "listen",
  "trace",
  "repeat",
  "game",
  "reward",
  "complete",
] as const;

export type LessonStep = (typeof LESSON_STEPS)[number];

export interface LessonFlowState {
  step: LessonStep;
  completedSteps: LessonStep[];
  attempts: number;
}

export type LessonFlowAction =
  | { type: "go"; step: LessonStep }
  | { type: "complete"; step: LessonStep }
  | { type: "retry" }
  | { type: "reset" };

export const INITIAL_LESSON_FLOW: LessonFlowState = {
  step: "welcome",
  completedSteps: [],
  attempts: 0,
};

export function nextLessonStep(step: LessonStep): LessonStep {
  const index = LESSON_STEPS.indexOf(step);
  return LESSON_STEPS[Math.min(LESSON_STEPS.length - 1, index + 1)];
}

export function lessonFlowReducer(state: LessonFlowState, action: LessonFlowAction): LessonFlowState {
  switch (action.type) {
    case "go":
      return { ...state, step: action.step };
    case "complete": {
      const completedSteps = state.completedSteps.includes(action.step)
        ? state.completedSteps
        : [...state.completedSteps, action.step];
      const currentIndex = LESSON_STEPS.indexOf(state.step);
      const completedIndex = LESSON_STEPS.indexOf(action.step);
      return {
        ...state,
        completedSteps,
        step: completedIndex >= currentIndex ? nextLessonStep(action.step) : state.step,
      };
    }
    case "retry":
      return { ...state, attempts: state.attempts + 1 };
    case "reset":
      return INITIAL_LESSON_FLOW;
    default:
      return state;
  }
}

export function lessonStepProgress(state: LessonFlowState) {
  const meaningfulSteps = LESSON_STEPS.filter((step) => step !== "welcome" && step !== "complete");
  const completeCount = meaningfulSteps.filter((step) => state.completedSteps.includes(step)).length;
  return Math.round((completeCount / meaningfulSteps.length) * 100);
}

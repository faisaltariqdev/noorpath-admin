import type { AgeBand, IKQuestion } from "../types";

export function pickQuestions(questions: IKQuestion[], ageBand: AgeBand): IKQuestion[] {
  const easy = questions.filter((question) => question.difficulty === "easy");
  const medium = questions.filter((question) => question.difficulty === "medium");
  const hard = questions.filter((question) => question.difficulty === "hard");
  if (ageBand === "young") return [...easy, ...medium].slice(0, 3);
  if (ageBand === "mid") return [...easy, ...medium, ...hard].slice(0, 4);
  return [...medium, ...hard, ...easy].slice(0, 5);
}

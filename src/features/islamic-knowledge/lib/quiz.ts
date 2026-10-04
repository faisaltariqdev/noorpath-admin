import type { AgeBand, Difficulty, IKLesson, IKQuestion, QuestionKind } from "../types";

/* ------------------------------------------------------------------ */
/*  Deterministic randomness (mulberry32) so a session can be replayed */
/* ------------------------------------------------------------------ */

export function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ------------------------------------------------------------------ */
/*  Session building                                                   */
/* ------------------------------------------------------------------ */

export const QUESTIONS_PER_SESSION: Record<AgeBand, number> = { young: 4, mid: 5, older: 6 };

const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

/** Which difficulties each age band should see, with a soft weight. Higher weight = preferred. */
const AGE_WEIGHTS: Record<AgeBand, Record<Difficulty, number>> = {
  young: { easy: 3, medium: 1.2, hard: 0 },
  mid: { easy: 1.4, medium: 2, hard: 1.4 },
  older: { easy: 0.6, medium: 1.6, hard: 2.4 },
};

export interface QuizSessionOptions {
  ageBand: AgeBand;
  /** Question ids served last time for this lesson — avoided unless the bank is too small. */
  recentIds?: string[];
  /** How many times this quiz has been played before — ramps difficulty a little. */
  attempt?: number;
  seed?: number;
  /** Override the session length (used by the daily challenge and "practice missed"). */
  count?: number;
  /** Restrict to these ids (e.g. practise only the missed questions). */
  onlyIds?: string[];
}

/**
 * Builds one quiz session:
 *  - never asks two questions that test the same `concept`
 *  - prefers questions the learner did NOT see in their previous attempt
 *  - shuffles order, then re-orders so the session opens gently and ends with the hardest item
 *  - shuffles answer options (MCQ / tap-select / sorting / matching) per session
 */
export function buildQuizSession(questions: IKQuestion[], options: QuizSessionOptions): IKQuestion[] {
  const rng = createRng(options.seed ?? Date.now());
  // Never ask more questions than there are distinct facts to test — a shorter quiz beats a repeated one.
  const distinctConcepts = new Set(questions.map((q) => q.concept ?? q.id)).size;
  const wanted = Math.max(1, Math.min(options.count ?? QUESTIONS_PER_SESSION[options.ageBand], distinctConcepts));
  const recent = new Set(options.recentIds ?? []);
  const attempt = options.attempt ?? 0;

  let pool = options.onlyIds ? questions.filter((q) => options.onlyIds!.includes(q.id)) : questions;
  // Little ones never get "hard"; on replay we allow one step harder so the quiz keeps growing with the child.
  pool = pool.filter((q) => {
    const weight = AGE_WEIGHTS[options.ageBand][q.difficulty];
    if (weight > 0) return true;
    return attempt >= 2 && q.difficulty === "medium";
  });
  if (pool.length === 0) pool = questions;

  const weighted = pool.map((question) => {
    const base = AGE_WEIGHTS[options.ageBand][question.difficulty] || 0.5;
    // Fresh questions form a strict upper tier: anything asked last time only appears
    // once every unseen question has been considered.
    const freshness = recent.has(question.id) ? 0 : 10;
    // Small attempt ramp: after the 2nd replay nudge toward harder items.
    const ramp = attempt >= 2 ? 1 + DIFFICULTY_RANK[question.difficulty] * 0.25 : 1;
    return { question, score: freshness + rng() * base * ramp };
  });
  weighted.sort((a, b) => b.score - a.score);

  const picked: IKQuestion[] = [];
  const usedConcepts = new Set<string>();
  const usedKinds: QuestionKind[] = [];

  const tryPick = (allowConceptRepeat: boolean, enforceKindVariety: boolean) => {
    for (const { question } of weighted) {
      if (picked.length >= wanted) break;
      if (picked.includes(question)) continue;
      const concept = question.concept;
      if (!allowConceptRepeat && concept && usedConcepts.has(concept)) continue;
      // Avoid three of the same kind in a row for variety.
      const lastTwo = usedKinds.slice(-2);
      if (enforceKindVariety && lastTwo.length === 2 && lastTwo.every((kind) => kind === question.kind)) continue;
      picked.push(question);
      usedKinds.push(question.kind);
      if (concept) usedConcepts.add(concept);
    }
  };
  // Priority: unique concepts first (with kind variety), then unique concepts regardless
  // of kind, and only if the bank is genuinely too small do we allow a concept to repeat.
  tryPick(false, true);
  if (picked.length < wanted) tryPick(false, false);
  if (picked.length < wanted) tryPick(true, false);

  // Gentle arc: easiest first, hardest last, middle shuffled.
  const byRank = [...picked].sort((a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]);
  const first = byRank.shift();
  const last = byRank.length > 0 ? byRank.pop() : undefined;
  const middle = shuffle(byRank, rng);
  const ordered = [first, ...middle, last].filter((q): q is IKQuestion => Boolean(q));

  return ordered.map((question) => randomizeQuestion(question, rng));
}

/** Per-session option shuffling so answer positions never become memorised. */
export function randomizeQuestion(question: IKQuestion, rng: () => number): IKQuestion {
  if (question.kind === "true_false") return question;
  if (question.kind === "sorting" && question.options) {
    let options = shuffle(question.options, rng);
    // Don't hand the child the already-correct order.
    if (question.order && options.every((option, index) => option.id === question.order![index]) && options.length > 1) {
      options = [...options.slice(1), options[0]];
    }
    return { ...question, options };
  }
  if (question.kind === "matching" && question.pairs) {
    return { ...question, pairs: shuffle(question.pairs, rng) };
  }
  if (question.options) return { ...question, options: shuffle(question.options, rng) };
  return question;
}

/* ------------------------------------------------------------------ */
/*  Daily challenge                                                    */
/* ------------------------------------------------------------------ */

export const DAILY_CHALLENGE_SIZE = 5;

/**
 * Cross-topic challenge, identical for the whole day (seeded by date) so a child
 * can't refresh for an easier set. Uses lessons the learner has completed; if
 * they're brand new, it samples the first beginner lessons instead.
 */
export function buildDailyChallenge(
  lessons: IKLesson[],
  completedLessonIds: string[],
  ageBand: AgeBand,
  dateKey: string,
): { lesson: IKLesson; sourceLessonIds: string[] } {
  const completed = lessons.filter((lesson) => completedLessonIds.includes(lesson.id));
  const source = completed.length >= 2 ? completed : lessons.slice(0, 6);
  const rng = createRng(hashString(`${dateKey}:${ageBand}:${source.map((l) => l.id).join(",")}`));

  const perLesson = shuffle(source, rng).slice(0, DAILY_CHALLENGE_SIZE);
  const candidates = perLesson.flatMap((lesson) =>
    buildQuizSession(lesson.questions, { ageBand, seed: Math.floor(rng() * 1e9), count: 2 })
      .map((question) => ({ ...question, id: `${lesson.id}::${question.id}` })),
  );
  const questions = buildQuizSession(candidates, { ageBand, seed: Math.floor(rng() * 1e9), count: DAILY_CHALLENGE_SIZE });

  return {
    sourceLessonIds: perLesson.map((lesson) => lesson.id),
    lesson: {
      id: `daily-${dateKey}`,
      topicId: "daily-challenge",
      title: "Daily Challenge",
      subtitle: "Five quick questions from what you've learned",
      seoTitle: "Daily Islamic Knowledge Challenge",
      seoDescription: "A short daily quiz for children.",
      ageMin: 3,
      ageMax: 12,
      estimatedMinutes: 3,
      steps: [],
      questions,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers used by the player                                         */
/* ------------------------------------------------------------------ */

export const KIND_LABELS: Record<QuestionKind, string> = {
  mcq: "Pick one",
  true_false: "True or false",
  fill_blank: "Type the word",
  matching: "Match the pairs",
  sorting: "Put in order",
  tap_select: "Tap the picture",
};

/** Human answer text for feedback/speech (e.g. "The answer is Allah."). */
export function correctAnswerLabel(question: IKQuestion): string {
  if (question.kind === "fill_blank") return String(question.answer);
  if (question.kind === "sorting" && question.order && question.options) {
    return question.order.map((id) => question.options!.find((o) => o.id === id)?.label ?? "").filter(Boolean).join(" → ");
  }
  if (question.kind === "matching" && question.pairs) {
    return question.pairs.map((pair) => `${pair.left} = ${pair.right}`).join(", ");
  }
  const expected = Array.isArray(question.answer) ? question.answer[0] : question.answer;
  return question.options?.find((option) => option.id === expected)?.label ?? "";
}

/** Speech-friendly reading of a question — no "Option 1 / Option 2" robotic list. */
export function speakableQuestion(question: IKQuestion): string {
  if (question.kind === "true_false") return `${question.prompt} True, or false?`;
  if (question.kind === "fill_blank") return `${question.prompt} Type the missing word.`;
  if (question.kind === "sorting") return `${question.prompt} Move the cards until they are in the right order.`;
  if (question.kind === "matching") return `${question.prompt} Tap an item, then tap its match.`;
  const labels = question.options?.map((option) => option.label) ?? [];
  if (labels.length === 0) return question.prompt;
  const list = labels.length > 1 ? `${labels.slice(0, -1).join(", ")}, or ${labels[labels.length - 1]}` : labels[0];
  return `${question.prompt} Is it ${list}?`;
}

/**
 * @deprecated kept for older callers/tests — new code should use buildQuizSession.
 */
export function pickQuestions(questions: IKQuestion[], ageBand: AgeBand): IKQuestion[] {
  return buildQuizSession(questions, { ageBand, seed: 1 });
}

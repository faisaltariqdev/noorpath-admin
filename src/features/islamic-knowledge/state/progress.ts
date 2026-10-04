import { BEGINNER_TOPICS, IK_BADGES } from "../data/curriculum";
import type { IKBadge, IKCompanionId, IKLessonReward, IKProgress, IKQuizOutcome } from "../types";

export const IK_STORAGE_KEY = "noorpath-islamic-knowledge-v1";
export const XP_PER_LESSON = 25;
export const COINS_PER_LESSON = 10;
export const XP_PER_LEVEL = 300;
export const XP_PER_CHALLENGE_QUESTION = 6;
export const COINS_PER_CHALLENGE = 8;

export function createInitialProgress(): IKProgress {
  return {
    xp: 0,
    coins: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    completedLessonIds: [],
    lessonStars: {},
    quizScores: {},
    weakTopicIds: [],
    badges: IK_BADGES.map((b) => ({ ...b, earned: false })),
    dailyChallengeDone: false,
    dailyChallengeDate: null,
    dailyChallengeScore: null,
    questionHistory: {},
    lessonAttempts: {},
    lastLessonId: null,
    companion: "noori",
    totalAnswered: 0,
    totalCorrect: 0,
    bestCombo: 0,
  };
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function earnBadge(badges: IKBadge[], id: string): IKBadge[] {
  return badges.map((b) =>
    b.id === id && !b.earned
      ? { ...b, earned: true, earnedAt: new Date().toISOString() }
      : b,
  );
}

export function applyStreak(progress: IKProgress): IKProgress {
  const today = todayKey();
  if (progress.lastActiveDate === today) return progress;
  const streak =
    progress.lastActiveDate === yesterdayKey() ? progress.streak + 1 : 1;
  let badges = progress.badges;
  if (streak >= 3) badges = earnBadge(badges, "streak-3");
  if (streak >= 7) badges = earnBadge(badges, "streak-7");
  return { ...progress, streak, lastActiveDate: today, badges };
}

export function starsForRatio(ratio: number): 1 | 2 | 3 {
  return ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
}

function applyQuizStats(progress: IKProgress, outcome: Pick<IKQuizOutcome, "correct" | "total" | "bestCombo">): IKProgress {
  return {
    ...progress,
    totalAnswered: progress.totalAnswered + outcome.total,
    totalCorrect: progress.totalCorrect + outcome.correct,
    bestCombo: Math.max(progress.bestCombo, outcome.bestCombo),
  };
}

function applyStatBadges(progress: IKProgress): IKProgress {
  let badges = progress.badges;
  if (progress.totalAnswered >= 50) badges = earnBadge(badges, "fifty-answers");
  if (progress.bestCombo >= 5) badges = earnBadge(badges, "combo-5");
  return { ...progress, badges };
}

export function completeLesson(
  progress: IKProgress,
  lessonId: string,
  topicId: string,
  correct: number,
  total: number,
  relatedBadgeId?: string,
  outcome?: Partial<IKQuizOutcome>,
): { progress: IKProgress } & IKLessonReward {
  const ratio = total > 0 ? correct / total : 1;
  const stars = starsForRatio(ratio);
  const already = progress.completedLessonIds.includes(lessonId);
  const bonusXp = already ? Math.round(XP_PER_LESSON / 2) : XP_PER_LESSON;
  const bonusCoins = already ? Math.round(COINS_PER_LESSON / 2) : COINS_PER_LESSON;
  const starBonus = stars * 5;

  let next = applyStreak(progress);
  const levelBefore = next.level;
  const xp = next.xp + bonusXp + starBonus;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const completedLessonIds = already
    ? next.completedLessonIds
    : [...next.completedLessonIds, lessonId];

  let badges = next.badges;
  const beforeIds = new Set(badges.filter((b) => b.earned).map((b) => b.id));

  const beginnerLessonIds = new Set(BEGINNER_TOPICS.flatMap((topic) => topic.lessonIds));
  const beginnerCompleted = completedLessonIds.filter((id) => beginnerLessonIds.has(id)).length;
  if (completedLessonIds.length >= 1) badges = earnBadge(badges, "first-lesson");
  if (beginnerCompleted >= 5) badges = earnBadge(badges, "beginner-5");
  if (beginnerCompleted >= 10) badges = earnBadge(badges, "beginner-10");
  if (beginnerCompleted >= 20) badges = earnBadge(badges, "beginner-all");
  if (ratio >= 1) badges = earnBadge(badges, "quiz-ace");
  if (relatedBadgeId) badges = earnBadge(badges, relatedBadgeId);

  // Kind heart: kindness + sharing
  const done = new Set(completedLessonIds);
  if (done.has("kindness-1") && done.has("sharing-1")) {
    badges = earnBadge(badges, "kind-heart");
  }
  if (done.has("who-is-allah-1") && done.has("who-is-prophet-1") && done.has("five-pillars-1")) {
    badges = earnBadge(badges, "iman-builder");
  }

  const weakTopicIds = [...next.weakTopicIds];
  if (ratio < 0.6 && !weakTopicIds.includes(topicId)) weakTopicIds.push(topicId);
  if (ratio >= 0.8) {
    const idx = weakTopicIds.indexOf(topicId);
    if (idx >= 0) weakTopicIds.splice(idx, 1);
  }

  const previousScore = next.quizScores[lessonId];
  const previousRatio = previousScore?.total ? previousScore.correct / previousScore.total : -1;
  const bestScore = ratio >= previousRatio
    ? { correct, total, at: new Date().toISOString() }
    : previousScore!;

  next = {
    ...next,
    xp,
    coins: next.coins + bonusCoins + stars * 2,
    level,
    completedLessonIds,
    lessonStars: {
      ...next.lessonStars,
      [lessonId]: Math.max(next.lessonStars[lessonId] ?? 0, stars) as 1 | 2 | 3,
    },
    quizScores: {
      ...next.quizScores,
      [lessonId]: bestScore,
    },
    weakTopicIds,
    badges,
    lessonAttempts: {
      ...next.lessonAttempts,
      [lessonId]: (next.lessonAttempts[lessonId] ?? 0) + 1,
    },
    questionHistory: outcome?.servedQuestionIds
      ? { ...next.questionHistory, [lessonId]: outcome.servedQuestionIds }
      : next.questionHistory,
  };
  next = applyStatBadges(applyQuizStats(next, { correct, total, bestCombo: outcome?.bestCombo ?? 0 }));

  const newBadges = next.badges
    .filter((b) => b.earned && !beforeIds.has(b.id))
    .map((b) => b.id);

  return {
    progress: next,
    stars,
    earnedXp: bonusXp + starBonus,
    earnedCoins: bonusCoins + stars * 2,
    levelUp: next.level > levelBefore,
    newBadges,
  };
}

/** Daily challenge: once per calendar day, rewards scale with correct answers. */
export function completeDailyChallenge(
  progress: IKProgress,
  correct: number,
  total: number,
  bestCombo = 0,
): { progress: IKProgress } & IKLessonReward {
  const today = todayKey();
  const alreadyToday = progress.dailyChallengeDone && progress.dailyChallengeDate === today;
  const ratio = total > 0 ? correct / total : 1;
  const stars = starsForRatio(ratio);

  let next = applyStreak(progress);
  const levelBefore = next.level;
  const beforeIds = new Set(next.badges.filter((b) => b.earned).map((b) => b.id));

  const earnedXp = alreadyToday ? 0 : correct * XP_PER_CHALLENGE_QUESTION + (ratio >= 1 ? 10 : 0);
  const earnedCoins = alreadyToday ? 0 : COINS_PER_CHALLENGE + stars;
  const xp = next.xp + earnedXp;

  let badges = next.badges;
  if (!alreadyToday) badges = earnBadge(badges, "daily-first");
  if (ratio >= 1) badges = earnBadge(badges, "quiz-ace");

  next = {
    ...next,
    xp,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    coins: next.coins + earnedCoins,
    badges,
    dailyChallengeDone: true,
    dailyChallengeDate: today,
    dailyChallengeScore: { correct, total },
  };
  next = applyStatBadges(applyQuizStats(next, { correct, total, bestCombo }));

  return {
    progress: next,
    stars,
    earnedXp,
    earnedCoins,
    levelUp: next.level > levelBefore,
    newBadges: next.badges.filter((b) => b.earned && !beforeIds.has(b.id)).map((b) => b.id),
  };
}

export function isDailyChallengeDoneToday(progress: IKProgress): boolean {
  return progress.dailyChallengeDone && progress.dailyChallengeDate === todayKey();
}

export function setCompanion(progress: IKProgress, companion: IKCompanionId): IKProgress {
  return { ...progress, companion };
}

export function markLessonOpened(progress: IKProgress, lessonId: string): IKProgress {
  if (progress.lastLessonId === lessonId) return progress;
  return { ...progress, lastLessonId: lessonId };
}

export function loadProgress(): IKProgress {
  if (typeof window === "undefined") return createInitialProgress();
  try {
    const raw = localStorage.getItem(IK_STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as Partial<IKProgress>;
    const base = createInitialProgress();
    return {
      ...base,
      ...parsed,
      // Older saves may miss newer maps — never let them be undefined.
      questionHistory: parsed.questionHistory ?? {},
      lessonAttempts: parsed.lessonAttempts ?? {},
      companion: parsed.companion === "noora" ? "noora" : "noori",
      badges: base.badges.map((b) => {
        const earned = parsed.badges?.find((x) => x.id === b.id);
        return earned ? { ...b, ...earned } : b;
      }),
    };
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(progress: IKProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(IK_STORAGE_KEY, JSON.stringify(progress));
}

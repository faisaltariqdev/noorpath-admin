import { IK_BADGES } from "../data/curriculum";
import type { IKBadge, IKProgress } from "../types";

export const IK_STORAGE_KEY = "noorpath-islamic-knowledge-v1";
export const XP_PER_LESSON = 25;
export const COINS_PER_LESSON = 10;
export const XP_PER_LEVEL = 300;

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
  };
}

function todayKey(): string {
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
  return { ...progress, streak, lastActiveDate: today, badges };
}

export function completeLesson(
  progress: IKProgress,
  lessonId: string,
  topicId: string,
  correct: number,
  total: number,
  relatedBadgeId?: string,
): { progress: IKProgress; stars: 1 | 2 | 3; levelUp: boolean; newBadges: string[] } {
  const ratio = total > 0 ? correct / total : 1;
  const stars: 1 | 2 | 3 = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
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

  if (completedLessonIds.length >= 1) badges = earnBadge(badges, "first-lesson");
  if (completedLessonIds.length >= 5) badges = earnBadge(badges, "beginner-5");
  if (completedLessonIds.length >= 10) badges = earnBadge(badges, "beginner-10");
  if (completedLessonIds.length >= 20) badges = earnBadge(badges, "beginner-all");
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
      [lessonId]: { correct, total, at: new Date().toISOString() },
    },
    weakTopicIds,
    badges,
  };

  const newBadges = next.badges
    .filter((b) => b.earned && !beforeIds.has(b.id))
    .map((b) => b.id);

  return {
    progress: next,
    stars,
    levelUp: next.level > levelBefore,
    newBadges,
  };
}

export function loadProgress(): IKProgress {
  if (typeof window === "undefined") return createInitialProgress();
  try {
    const raw = localStorage.getItem(IK_STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as IKProgress;
    const base = createInitialProgress();
    return {
      ...base,
      ...parsed,
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

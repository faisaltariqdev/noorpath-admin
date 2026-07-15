import type { GameId, GameResult, QaidaProgress } from "../types";

export interface RewardSummary {
  xp: number;
  coins: number;
  stars: 1 | 2 | 3;
  levelBefore: number;
  levelAfter: number;
  levelUp: boolean;
  newlyEarnedBadgeIds: string[];
}

export function calculateGameReward(
  gameId: GameId,
  score: number,
  total: number,
  timeSeconds: number,
): GameResult {
  const ratio = total > 0 ? score / total : 0;
  const stars: 1 | 2 | 3 = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
  return {
    gameId,
    score,
    stars,
    xpEarned: stars * 15,
    coinsEarned: stars * 5,
    timeSeconds: Math.max(0, Math.round(timeSeconds)),
  };
}

export function summarizeReward(
  before: QaidaProgress,
  after: QaidaProgress,
  stars: 1 | 2 | 3,
): RewardSummary {
  const beforeBadgeIds = new Set(before.badges.filter((badge) => badge.earned).map((badge) => badge.id));
  return {
    xp: Math.max(0, after.xp - before.xp),
    coins: Math.max(0, after.coins - before.coins),
    stars,
    levelBefore: before.level,
    levelAfter: after.level,
    levelUp: after.level > before.level,
    newlyEarnedBadgeIds: after.badges
      .filter((badge) => badge.earned && !beforeBadgeIds.has(badge.id))
      .map((badge) => badge.id),
  };
}

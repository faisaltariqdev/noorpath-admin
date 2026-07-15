export interface TraceMetrics {
  matchingPoints: number;
  totalPoints: number;
  distance: number;
  targetDistance: number;
  strokeCount: number;
}

export interface TraceValidation {
  accuracy: number;
  score: number;
  complete: boolean;
}

export function validateTrace(metrics: TraceMetrics, completionScore = 68): TraceValidation {
  if (metrics.totalPoints <= 0) return { accuracy: 0, score: 0, complete: false };
  const accuracy = Math.max(0, Math.min(1, metrics.matchingPoints / metrics.totalPoints));
  const lengthScore = Math.max(0, Math.min(1, metrics.distance / Math.max(1, metrics.targetDistance)));
  const score = Math.round(accuracy * 76 + lengthScore * 24);
  return {
    accuracy,
    score,
    complete: score >= completionScore && metrics.strokeCount >= 2,
  };
}

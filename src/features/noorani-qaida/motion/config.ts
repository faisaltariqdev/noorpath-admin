import type { Variants } from "framer-motion";

export interface MotionBudget {
  reduced: boolean;
  ambientParticles: number;
  celebrationParticles: number;
  allowParallax: boolean;
  allowInfiniteMotion: boolean;
}

export function createMotionBudget(reduced: boolean, viewportWidth: number): MotionBudget {
  if (reduced) {
    return {
      reduced: true,
      ambientParticles: 0,
      celebrationParticles: 12,
      allowParallax: false,
      allowInfiniteMotion: false,
    };
  }

  if (viewportWidth < 480) {
    return {
      reduced: false,
      ambientParticles: 5,
      celebrationParticles: 32,
      allowParallax: false,
      allowInfiniteMotion: true,
    };
  }

  if (viewportWidth < 1024) {
    return {
      reduced: false,
      ambientParticles: 8,
      celebrationParticles: 48,
      allowParallax: false,
      allowInfiniteMotion: true,
    };
  }

  return {
    reduced: false,
    ambientParticles: 12,
    celebrationParticles: 72,
    allowParallax: true,
    allowInfiniteMotion: true,
  };
}

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

export const childStaggerVariants: Variants = {
  initial: {},
  enter: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

export const cardVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 26 },
  },
};

export const tapScale = { scale: 0.96 };

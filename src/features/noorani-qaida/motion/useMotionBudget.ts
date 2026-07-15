"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { createMotionBudget } from "./config";

export function useMotionBudget(forceReduced = false) {
  const systemReduced = useReducedMotion();
  const [viewportWidth, setViewportWidth] = useState(1024);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");

    updateWidth();
    updateVisibility();
    window.addEventListener("resize", updateWidth, { passive: true });
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      window.removeEventListener("resize", updateWidth);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return useMemo(() => {
    const budget = createMotionBudget(forceReduced || Boolean(systemReduced), viewportWidth);
    return {
      ...budget,
      pageVisible,
      allowInfiniteMotion: budget.allowInfiniteMotion && pageVisible,
    };
  }, [forceReduced, pageVisible, systemReduced, viewportWidth]);
}

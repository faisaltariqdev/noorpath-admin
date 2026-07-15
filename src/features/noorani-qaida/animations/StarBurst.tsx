"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface StarBurstProps {
  active: boolean;
  count?: number;
  size?: "sm" | "md" | "lg";
}

export default function StarBurst({ active, count = 8, size = "md" }: StarBurstProps) {
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (360 / count) * i,
      distance: size === "sm" ? 40 : size === "md" ? 60 : 90,
      delay: i * 0.05,
      color: i % 3 === 0 ? "#f5c518" : i % 3 === 1 ? "#60a5fa" : "#f472b6",
    })),
  [count, size]);

  const starSize = size === "sm" ? 12 : size === "md" ? 16 : 22;

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          {stars.map((star) => {
            const rad = (star.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * star.distance;
            const ty = Math.sin(rad) * star.distance;
            return (
              <motion.div
                key={star.id}
                className="absolute"
                style={{ fontSize: starSize }}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 1, 0], x: tx, y: ty, scale: [0, 1.2, 1, 0] }}
                transition={{ duration: 0.8, delay: star.delay, ease: "easeOut" }}
              >
                ⭐
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

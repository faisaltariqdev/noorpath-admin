"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface SparkleBurstProps {
  active: boolean;
  x?: number;
  y?: number;
}

function SparkleShape({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 0 L9 7 L16 8 L9 9 L8 16 L7 9 L0 8 L7 7 Z" fill={color} />
    </svg>
  );
}

const SPARKLE_COLORS = ["#f5c518", "#ffffff", "#60a5fa", "#f472b6", "#4ade80"];

export default function SparkleBurst({ active }: SparkleBurstProps) {
  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 120,
      y: (Math.random() - 0.5) * 120,
      delay: Math.random() * 0.3,
      scale: 0.5 + Math.random() * 1,
      color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
    })),
  []);

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          {sparkles.map((s) => (
            <motion.div
              key={s.id}
              className="absolute"
              style={{ originX: "50%", originY: "50%" }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                x: s.x,
                y: s.y,
                scale: [0, s.scale, s.scale * 0.8, 0],
                rotate: [0, 180],
              }}
              transition={{ duration: 0.7, delay: s.delay, ease: "easeOut" }}
            >
              <SparkleShape color={s.color} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

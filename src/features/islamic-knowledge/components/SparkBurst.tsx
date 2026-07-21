"use client";

import { motion } from "framer-motion";

const PARTICLES = [
  { x: -60, y: -40, c: "#c9922a", d: 0 },
  { x: 50, y: -55, c: "#0a6e4f", d: 0.05 },
  { x: -30, y: -70, c: "#ff6b6b", d: 0.08 },
  { x: 70, y: -20, c: "#5b6cff", d: 0.1 },
  { x: -80, y: -10, c: "#f4a261", d: 0.12 },
  { x: 20, y: -80, c: "#52b788", d: 0.04 },
  { x: -10, y: -50, c: "#e9c46a", d: 0.15 },
  { x: 40, y: -35, c: "#2a9d8f", d: 0.07 },
];

export default function SparkBurst({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="ik-spark-burst" aria-hidden>
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="ik-spark"
          style={{ background: p.c }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.2 }}
          transition={{ duration: 0.7, delay: p.d, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

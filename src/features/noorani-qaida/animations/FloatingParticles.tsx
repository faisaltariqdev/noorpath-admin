"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  type: "star" | "dot" | "sparkle";
  color: string;
  opacity: number;
}

const COLORS = ["#f5c518", "#60a5fa", "#4ade80", "#f472b6", "#a78bfa", "#34d399"];

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export default function FloatingParticles({ count = 20, className = "" }: FloatingParticlesProps) {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 31 + 7) % 100}%`,
      top: `${(i * 53 + 13) % 100}%`,
      size: 3 + (i % 6),
      duration: 4 + (i % 6),
      delay: (i % 8) * 0.7,
      type: i % 3 === 0 ? "star" : i % 3 === 1 ? "dot" : "sparkle",
      color: COLORS[i % COLORS.length],
      opacity: 0.3 + (i % 5) * 0.1,
    })),
  [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: p.left, top: p.top, opacity: p.opacity }}
          animate={{
            y: [0, -20, 0],
            x: [0, p.id % 2 === 0 ? 10 : -10, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.type === "star" ? (
            <svg width={p.size * 2} height={p.size * 2} viewBox="0 0 10 10">
              <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill={p.color} />
            </svg>
          ) : p.type === "dot" ? (
            <div
              className="rounded-full"
              style={{ width: p.size, height: p.size, background: p.color }}
            />
          ) : (
            <div style={{ fontSize: p.size + 4, lineHeight: 1 }}>✨</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/** Soft parallax atmosphere behind dialogue — GPU transforms only. */
export default function MagicalScene() {
  const reduce = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      setOffset({ x, y });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce]);

  return (
    <div className="ik-magic" aria-hidden>
      <div className="ik-magic-sky" />
      <motion.div
        className="ik-magic-sun"
        style={{ x: offset.x * 0.2, y: offset.y * 0.15 }}
        animate={reduce ? undefined : { opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="ik-magic-clouds"
        style={{ x: offset.x * 0.4 }}
        animate={reduce ? undefined : { x: [0, 24, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="ik-cloud-blob a" />
        <span className="ik-cloud-blob b" />
        <span className="ik-cloud-blob c" />
      </motion.div>
      <motion.div className="ik-magic-mosque" style={{ x: offset.x * 0.55, y: offset.y * 0.2 }}>
        <svg viewBox="0 0 320 90" className="ik-mosque-svg">
          <path
            d="M20 90 V55 H50 V40 Q70 18 90 40 V55 H130 V35 Q160 8 190 35 V55 H230 V42 Q250 22 270 42 V55 H300 V90 Z"
            fill="rgba(10,110,79,0.18)"
          />
          <circle cx="160" cy="22" r="10" fill="rgba(201,146,42,0.35)" />
        </svg>
      </motion.div>
      <motion.div className="ik-magic-trees" style={{ x: offset.x * 0.7 }}>
        <span>🌴</span>
        <span>🌳</span>
        <span>🌴</span>
      </motion.div>
      <div className="ik-magic-grass" />
      {!reduce &&
        Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            className="ik-firefly"
            style={{ left: `${8 + i * 9}%`, top: `${20 + (i % 5) * 10}%` }}
            animate={{ opacity: [0.15, 0.9, 0.15], y: [0, -10, 0] }}
            transition={{ duration: 2.4 + i * 0.2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      {!reduce &&
        [0, 1, 2, 3].map((i) => (
          <motion.span
            key={`s${i}`}
            className="ik-float-star"
            style={{ left: `${15 + i * 20}%`, top: `${12 + i * 6}%` }}
            animate={{ opacity: [0.2, 1, 0.2], rotate: [0, 20, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity }}
          >
            ✦
          </motion.span>
        ))}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type NooriMood = "idle" | "happy" | "cheer" | "think" | "hint" | "sad";
export type NooriAction = "idle" | "wave" | "bounce" | "clap" | "point";

interface NooriMascotProps {
  mood?: NooriMood;
  action?: NooriAction;
  size?: number;
  speech?: string;
  /** Where the speech bubble sits relative to the character */
  speechSide?: "top" | "right";
  className?: string;
}

/** Cartoon guide for Islamic Knowledge — kept on the side of the lesson stage. */
export default function NooriMascot({
  mood = "happy",
  action = "idle",
  size = 140,
  speech,
  speechSide = "top",
  className = "",
}: NooriMascotProps) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 140);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  const bounceY =
    action === "bounce" || mood === "cheer"
      ? [0, -10, 0, -6, 0]
      : action === "wave"
        ? [0, -3, 0]
        : [0, -5, 0];

  const armWave =
    action === "wave" || mood === "cheer"
      ? [0, -32, 8, -36, 0]
      : action === "clap"
        ? [0, -22, 0, -22, 0]
        : action === "point"
          ? [-12, -18, -12]
          : [0, -5, 0];

  return (
    <div
      className={`ik-noori ik-noori-${speechSide} ${className}`}
      style={{ width: size, position: "relative", flexShrink: 0 }}
    >
      {speech && (
        <motion.div
          className={`ik-noori-speech ik-noori-speech-${speechSide}`}
          initial={{ opacity: 0, y: 6, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          key={speech}
        >
          {speech}
        </motion.div>
      )}
      <motion.svg
        viewBox="0 0 120 160"
        width={size}
        height={size * 1.33}
        style={{ overflow: "visible", display: "block", margin: "0 auto" }}
        animate={{ y: bounceY }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <ellipse cx="60" cy="152" rx="28" ry="6" fill="#00000018" />
        <rect x="42" y="118" width="14" height="28" rx="7" fill="#0a6e4f" />
        <rect x="64" y="118" width="14" height="28" rx="7" fill="#0a6e4f" />
        <ellipse cx="49" cy="146" rx="10" ry="5" fill="#3d2914" />
        <ellipse cx="71" cy="146" rx="10" ry="5" fill="#3d2914" />
        <path
          d="M34 78 C34 68 46 62 60 62 C74 62 86 68 86 78 L90 118 C90 124 84 128 60 128 C36 128 30 124 30 118 Z"
          fill="#ffffff"
          stroke="#0a6e4f"
          strokeWidth="2"
        />
        <path d="M48 64 L48 118 M72 64 L72 118" stroke="#c9922a" strokeWidth="2" opacity="0.7" />
        <circle cx="60" cy="88" r="5" fill="#c9922a" />
        <motion.g
          style={{ transformOrigin: "38px 82px" }}
          animate={{ rotate: armWave }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="22" y="78" width="14" height="32" rx="7" fill="#f5d0b0" />
          <circle cx="29" cy="112" r="8" fill="#f5d0b0" />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "82px 82px" }}
          animate={{ rotate: action === "clap" ? [0, 25, 0, 25, 0] : [0, 8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="84" y="78" width="14" height="32" rx="7" fill="#f5d0b0" />
          <circle cx="91" cy="112" r="8" fill="#f5d0b0" />
        </motion.g>
        <circle cx="60" cy="42" r="28" fill="#f5d0b0" />
        <path d="M34 36 C36 18 84 18 86 36 L84 42 C70 38 50 38 36 42 Z" fill="#0a6e4f" />
        <ellipse cx="60" cy="28" rx="18" ry="6" fill="#0d805c" />
        <rect x="40" y="34" width="40" height="5" rx="2" fill="#c9922a" />
        <ellipse cx="50" cy="44" rx="5" ry={blink ? 0.8 : 6} fill="#1a2e28" />
        <ellipse cx="70" cy="44" rx="5" ry={blink ? 0.8 : 6} fill="#1a2e28" />
        {!blink && (
          <>
            <circle cx="51.5" cy="42.5" r="1.6" fill="#fff" />
            <circle cx="71.5" cy="42.5" r="1.6" fill="#fff" />
          </>
        )}
        <ellipse cx="42" cy="52" rx="5" ry="3" fill="#ff8a80" opacity="0.45" />
        <ellipse cx="78" cy="52" rx="5" ry="3" fill="#ff8a80" opacity="0.45" />
        {mood === "sad" ? (
          <path d="M52 58 Q60 52 68 58" stroke="#1a2e28" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        ) : mood === "think" || mood === "hint" ? (
          <circle cx="60" cy="58" r="2.2" fill="#1a2e28" />
        ) : (
          <path d="M50 56 Q60 66 70 56" stroke="#1a2e28" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        )}
        <motion.circle
          cx="96"
          cy="24"
          r="3"
          fill="#c9922a"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      </motion.svg>
    </div>
  );
}

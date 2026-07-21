"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export type NooriMood = "idle" | "happy" | "cheer" | "think" | "hint" | "sad" | "listen" | "surprise";
export type NooriAction = "idle" | "wave" | "bounce" | "clap" | "point" | "walk" | "listen";

interface NooriMascotProps {
  mood?: NooriMood;
  action?: NooriAction;
  size?: number;
  /** Optional tiny caption under feet — main dialogue is elsewhere */
  caption?: string;
  lookAt?: "left" | "center" | "right";
  className?: string;
}

/** Alive cartoon guide — breathing, blink, tilt, wave. Speech lives in DialogueBubble. */
export default function NooriMascot({
  mood = "happy",
  action = "idle",
  size = 150,
  caption,
  lookAt = "right",
  className = "",
}: NooriMascotProps) {
  const reduce = useReducedMotion();
  const [blink, setBlink] = useState(false);
  const [smileBurst, setSmileBurst] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const blinkId = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 130);
    }, 2800 + Math.random() * 1200);
    const smileId = window.setInterval(() => {
      setSmileBurst(true);
      window.setTimeout(() => setSmileBurst(false), 700);
    }, 5000);
    return () => {
      window.clearInterval(blinkId);
      window.clearInterval(smileId);
    };
  }, [reduce]);

  const gaze = lookAt === "left" ? -2.2 : lookAt === "right" ? 2.2 : 0;
  const headTilt =
    mood === "think" || mood === "hint" ? [-4, 4, -2] : mood === "surprise" ? [0, -8, 0] : [0, -3, 2, 0];

  const bounceY = reduce
    ? 0
    : action === "bounce" || mood === "cheer"
      ? [0, -14, 0, -9, 0]
      : action === "walk"
        ? [0, -3, 0, -3, 0]
        : action === "wave"
          ? [0, -4, 0]
          : [0, -5, 0, -3, 0];

  const armWave = reduce
    ? 0
    : action === "wave" || mood === "cheer"
      ? [0, -38, 10, -42, 0]
      : action === "clap"
        ? [0, -28, 0, -28, 0]
        : action === "point" || action === "listen"
          ? [-8, -18, -10]
          : [0, -8, 0];

  const bodyX = !reduce && action === "walk" ? [0, 6, 0, -4, 0] : 0;

  return (
    <div className={`ik-noori-live ${className}`} style={{ width: size }}>
      <motion.div
        className="ik-noori-shadow"
        animate={reduce ? undefined : { scaleX: [1, 0.88, 1], opacity: [0.22, 0.14, 0.22] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.svg
        viewBox="0 0 120 160"
        width={size}
        height={size * 1.33}
        style={{ overflow: "visible", display: "block", margin: "0 auto" }}
        animate={{ y: bounceY, x: bodyX }}
        transition={{ duration: action === "walk" ? 0.7 : 2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <ellipse cx="60" cy="152" rx="26" ry="5" fill="#00000018" />

        <motion.g
          animate={reduce ? undefined : { rotate: headTilt }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 42px" }}
        >
          <circle cx="60" cy="42" r="28" fill="#f5d0b0" />
          <path d="M34 36 C36 18 84 18 86 36 L84 42 C70 38 50 38 36 42 Z" fill="#0a6e4f" />
          <ellipse cx="60" cy="28" rx="18" ry="6" fill="#0d805c" />
          <rect x="40" y="34" width="40" height="5" rx="2" fill="#c9922a" />

          <ellipse cx={50 + gaze} cy="44" rx="5" ry={blink ? 0.7 : 6} fill="#1a2e28" />
          <ellipse cx={70 + gaze} cy="44" rx="5" ry={blink ? 0.7 : 6} fill="#1a2e28" />
          {!blink && (
            <>
              <circle cx={51.5 + gaze} cy="42.5" r="1.6" fill="#fff" />
              <circle cx={71.5 + gaze} cy="42.5" r="1.6" fill="#fff" />
            </>
          )}

          <ellipse cx="42" cy="52" rx="5" ry="3" fill="#ff8a80" opacity={smileBurst ? 0.7 : 0.4} />
          <ellipse cx="78" cy="52" rx="5" ry="3" fill="#ff8a80" opacity={smileBurst ? 0.7 : 0.4} />

          {mood === "sad" ? (
            <path d="M52 58 Q60 52 68 58" stroke="#1a2e28" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ) : mood === "think" || mood === "hint" || mood === "listen" ? (
            <ellipse cx="60" cy="58" rx="4" ry="2.2" fill="#1a2e28" />
          ) : mood === "surprise" ? (
            <ellipse cx="60" cy="58" rx="3.5" ry="4.5" fill="#1a2e28" />
          ) : (
            <path
              d={smileBurst ? "M48 54 Q60 70 72 54" : "M50 56 Q60 66 70 56"}
              stroke="#1a2e28"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </motion.g>

        {/* Breath body */}
        <motion.g
          animate={reduce ? undefined : { scaleY: [1, 1.03, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 100px" }}
        >
          <path
            d="M34 78 C34 68 46 62 60 62 C74 62 86 68 86 78 L90 118 C90 124 84 128 60 128 C36 128 30 124 30 118 Z"
            fill="#ffffff"
            stroke="#0a6e4f"
            strokeWidth="2"
          />
          <path d="M48 64 L48 118 M72 64 L72 118" stroke="#c9922a" strokeWidth="2" opacity="0.7" />
          <circle cx="60" cy="88" r="5" fill="#c9922a" />
        </motion.g>

        <rect x="42" y="118" width="14" height="28" rx="7" fill="#0a6e4f" />
        <rect x="64" y="118" width="14" height="28" rx="7" fill="#0a6e4f" />
        <ellipse cx="49" cy="146" rx="10" ry="5" fill="#3d2914" />
        <ellipse cx="71" cy="146" rx="10" ry="5" fill="#3d2914" />

        <motion.g
          style={{ transformOrigin: "38px 82px" }}
          animate={{ rotate: armWave }}
          transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="22" y="78" width="14" height="32" rx="7" fill="#f5d0b0" />
          <circle cx="29" cy="112" r="8" fill="#f5d0b0" />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "82px 82px" }}
          animate={{ rotate: action === "clap" ? [0, 28, 0, 28, 0] : [0, 10, 0] }}
          transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="84" y="78" width="14" height="32" rx="7" fill="#f5d0b0" />
          <circle cx="91" cy="112" r="8" fill="#f5d0b0" />
        </motion.g>

        {(mood === "cheer" || action === "clap") && !reduce && (
          <>
            <motion.circle cx="18" cy="40" r="3" fill="#c9922a" animate={{ y: [0, -12, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity }} />
            <motion.circle cx="102" cy="36" r="2.5" fill="#7dd3a8" animate={{ y: [0, -10, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} />
          </>
        )}
      </motion.svg>
      {caption && <div className="ik-noori-caption">{caption}</div>}
    </div>
  );
}

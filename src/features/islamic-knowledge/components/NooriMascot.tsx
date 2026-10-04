"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { IKCompanionId } from "../types";

export type NooriMood = "idle" | "happy" | "cheer" | "think" | "hint" | "sad" | "listen" | "surprise";
export type NooriAction = "idle" | "wave" | "bounce" | "clap" | "point" | "walk" | "listen" | "thumbs" | "chin";

interface NooriMascotProps {
  mood?: NooriMood;
  action?: NooriAction;
  /** Animates the mouth in sync with the voice — set while text-to-speech is running. */
  speaking?: boolean;
  character?: IKCompanionId;
  size?: number;
  /** Optional tiny caption under feet — main dialogue is elsewhere */
  caption?: string;
  lookAt?: "left" | "center" | "right";
  className?: string;
}

export const COMPANIONS: Record<IKCompanionId, { name: string; blurb: string }> = {
  noori: { name: "Noori", blurb: "Curious, cheerful and loves stories." },
  noora: { name: "Noora", blurb: "Gentle, clever and full of questions." },
};

const PALETTE: Record<IKCompanionId, {
  skin: string; skinShade: string; cloth: string; clothDark: string; clothLight: string; trim: string; hair: string; shoe: string; blush: string;
}> = {
  noori: { skin: "#f6d3b3", skinShade: "#e8b995", cloth: "#ffffff", clothDark: "#0a6e4f", clothLight: "#0d805c", trim: "#c9922a", hair: "#3b2416", shoe: "#3d2914", blush: "#ff8a80" },
  noora: { skin: "#f6d3b3", skinShade: "#e8b995", cloth: "#f7edff", clothDark: "#7a4fb5", clothLight: "#9b6fd1", trim: "#e0a5c9", hair: "#3b2416", shoe: "#4a2c5a", blush: "#ff9aa2" },
};

/**
 * Alive cartoon guide — breathing, blink, tilt, wave, and a mouth that moves while
 * the lesson is being read out. Two companions share one rig (Noori with a kufi,
 * Noora with a hijab) so every animation works for both.
 */
export default function NooriMascot({
  mood = "happy",
  action = "idle",
  speaking = false,
  character = "noori",
  size = 150,
  caption,
  lookAt = "right",
  className = "",
}: NooriMascotProps) {
  const reduce = useReducedMotion();
  const [blink, setBlink] = useState(false);
  const [smileBurst, setSmileBurst] = useState(false);
  const [mouthPhase, setMouthPhase] = useState(0);
  const p = PALETTE[character];

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

  // Mouth flap while speaking — pseudo lip-sync with a natural, irregular rhythm.
  useEffect(() => {
    if (!speaking || reduce) {
      setMouthPhase(0);
      return;
    }
    let cancelled = false;
    let timer: number;
    const tick = () => {
      if (cancelled) return;
      setMouthPhase((phase) => (phase + 1 + Math.floor(Math.random() * 2)) % 4);
      timer = window.setTimeout(tick, 90 + Math.random() * 110);
    };
    tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [speaking, reduce]);

  const gaze = lookAt === "left" ? -2.2 : lookAt === "right" ? 2.2 : 0;
  const headTilt =
    mood === "think" || mood === "hint" ? [-4, 4, -2] : mood === "surprise" ? [0, -8, 0] : speaking ? [0, -2, 1, 0] : [0, -3, 2, 0];

  const bounceY = reduce
    ? 0
    : action === "bounce" || mood === "cheer"
      ? [0, -14, 0, -9, 0]
      : action === "walk"
        ? [0, -3, 0, -3, 0]
        : action === "wave"
          ? [0, -4, 0]
          : [0, -5, 0, -3, 0];

  const leftArm = reduce
    ? 0
    : action === "wave" || mood === "cheer"
      ? [0, -38, 10, -42, 0]
      : action === "clap"
        ? [0, -28, 0, -28, 0]
        : action === "thumbs"
          ? [-70, -75, -70]
          : action === "chin"
            ? [-95, -98, -95]
            : action === "point" || action === "listen"
              ? [-8, -18, -10]
              : speaking
                ? [0, -14, -4, -12, 0]
                : [0, -8, 0];

  const rightArm = reduce
    ? 0
    : action === "clap"
      ? [0, 28, 0, 28, 0]
      : speaking
        ? [0, 10, 2, 12, 0]
        : [0, 10, 0];

  const bodyX = !reduce && action === "walk" ? [0, 6, 0, -4, 0] : 0;

  // Mouth shapes: closed smile → small "o" → wide → mid.
  const mouth = (() => {
    if (mood === "sad") return <path d="M52 58 Q60 52 68 58" stroke="#1a2e28" strokeWidth="2.2" fill="none" strokeLinecap="round" />;
    if (speaking && !reduce) {
      const shapes = [
        <path key="m0" d="M52 57 Q60 63 68 57" stroke="#1a2e28" strokeWidth="2.4" fill="none" strokeLinecap="round" />,
        <ellipse key="m1" cx="60" cy="59" rx="3.4" ry="3" fill="#7a2f3a" />,
        <path key="m2" d="M52 55 Q60 68 68 55 Z" fill="#7a2f3a" stroke="#1a2e28" strokeWidth="1.5" strokeLinejoin="round" />,
        <ellipse key="m3" cx="60" cy="58.5" rx="5" ry="2.2" fill="#7a2f3a" />,
      ];
      return shapes[mouthPhase];
    }
    if (mood === "think" || mood === "hint" || mood === "listen") return <ellipse cx="60" cy="58" rx="4" ry="2.2" fill="#1a2e28" />;
    if (mood === "surprise") return <ellipse cx="60" cy="58" rx="3.5" ry="4.5" fill="#1a2e28" />;
    return (
      <path
        d={smileBurst ? "M48 54 Q60 70 72 54" : "M50 56 Q60 66 70 56"}
        stroke="#1a2e28"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    );
  })();

  const browLeft = mood === "think" || mood === "hint" ? "M44 35 Q50 31 56 35" : mood === "sad" ? "M44 33 Q50 35 56 36" : mood === "surprise" ? "M44 32 Q50 29 56 32" : "M44 35 Q50 33 56 35";
  const browRight = mood === "surprise" ? "M64 32 Q70 29 76 32" : mood === "sad" ? "M64 36 Q70 35 76 33" : "M64 35 Q70 33 76 35";

  return (
    <div className={`ik-noori-live ${className}`} style={{ width: size }} data-character={character}>
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
        <defs>
          <radialGradient id={`ik-face-${character}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={p.skin} />
            <stop offset="100%" stopColor={p.skinShade} />
          </radialGradient>
          <linearGradient id={`ik-cloth-${character}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.cloth} />
            <stop offset="100%" stopColor={character === "noora" ? "#ead9ff" : "#f2f7f4"} />
          </linearGradient>
        </defs>

        <ellipse cx="60" cy="152" rx="26" ry="5" fill="#00000018" />

        {/* Hijab back layer (behind head) */}
        {character === "noora" && (
          <path d="M28 46 C26 30 40 14 60 14 C80 14 94 30 92 46 L96 92 C96 100 84 104 60 104 C36 104 24 100 24 92 Z" fill={p.clothDark} />
        )}

        <motion.g
          animate={reduce ? undefined : { rotate: headTilt }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 42px" }}
        >
          {/* Ears */}
          <ellipse cx="32" cy="46" rx="4" ry="5.5" fill={p.skinShade} />
          <ellipse cx="88" cy="46" rx="4" ry="5.5" fill={p.skinShade} />

          <circle cx="60" cy="42" r="28" fill={`url(#ik-face-${character})`} />

          {character === "noori" ? (
            <>
              {/* Hair peeking under the kufi */}
              <path d="M34 40 C36 30 44 24 60 24 C76 24 84 30 86 40 L84 44 C70 40 50 40 36 44 Z" fill={p.hair} />
              {/* Kufi */}
              <path d="M33 36 C35 16 85 16 87 36 L85 41 C70 37 50 37 35 41 Z" fill={p.clothDark} />
              <ellipse cx="60" cy="27" rx="19" ry="6.5" fill={p.clothLight} />
              <rect x="39" y="33" width="42" height="5.5" rx="2.4" fill={p.trim} />
              <path d="M45 27 l3 -3 m6 3 l3 -3 m6 3 l3 -3 m6 3 l3 -3" stroke="#ffffff55" strokeWidth="1.4" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Hijab front — frames the face */}
              <path d="M31 48 C28 24 44 12 60 12 C76 12 92 24 89 48 C84 40 72 34 60 34 C48 34 36 40 31 48 Z" fill={p.clothDark} />
              <path d="M34 44 C36 30 46 22 60 22 C74 22 84 30 86 44 C80 38 70 35 60 35 C50 35 40 38 34 44 Z" fill={p.clothLight} />
              {/* Under-chin fold */}
              <path d="M36 56 C42 70 78 70 84 56 C78 66 42 66 36 56 Z" fill={p.clothDark} />
              <circle cx="82" cy="30" r="3.2" fill={p.trim} />
            </>
          )}

          {/* Eyes */}
          <ellipse cx={50 + gaze} cy="44" rx="5" ry={blink ? 0.7 : 6} fill="#1a2e28" />
          <ellipse cx={70 + gaze} cy="44" rx="5" ry={blink ? 0.7 : 6} fill="#1a2e28" />
          {!blink && (
            <>
              <circle cx={51.5 + gaze} cy="42.5" r="1.7" fill="#fff" />
              <circle cx={71.5 + gaze} cy="42.5" r="1.7" fill="#fff" />
              <circle cx={48.8 + gaze} cy="46" r="0.8" fill="#ffffffaa" />
              <circle cx={68.8 + gaze} cy="46" r="0.8" fill="#ffffffaa" />
            </>
          )}
          {/* Lashes for Noora */}
          {character === "noora" && !blink && (
            <g stroke="#1a2e28" strokeWidth="1.3" strokeLinecap="round">
              <path d={`M${45 + gaze} 39 l-2 -2`} />
              <path d={`M${75 + gaze} 39 l2 -2`} />
            </g>
          )}
          <path d={browLeft} stroke="#6b4630" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <path d={browRight} stroke="#6b4630" strokeWidth="1.7" fill="none" strokeLinecap="round" />

          {/* Nose + cheeks */}
          <path d="M58 50 q2 3 4 0" stroke={p.skinShade} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <ellipse cx="42" cy="52" rx="5" ry="3" fill={p.blush} opacity={smileBurst || mood === "cheer" ? 0.7 : 0.4} />
          <ellipse cx="78" cy="52" rx="5" ry="3" fill={p.blush} opacity={smileBurst || mood === "cheer" ? 0.7 : 0.4} />

          {mouth}
        </motion.g>

        {/* Breath body */}
        <motion.g
          animate={reduce ? undefined : { scaleY: [1, 1.03, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 100px" }}
        >
          <path
            d="M34 78 C34 68 46 62 60 62 C74 62 86 68 86 78 L90 118 C90 124 84 128 60 128 C36 128 30 124 30 118 Z"
            fill={`url(#ik-cloth-${character})`}
            stroke={p.clothDark}
            strokeWidth="2"
          />
          {character === "noori" ? (
            <>
              <path d="M48 64 L48 118 M72 64 L72 118" stroke={p.trim} strokeWidth="2" opacity="0.7" />
              <path d="M52 63 L60 74 L68 63" stroke={p.clothDark} strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <path d="M40 124 q20 -6 40 0" stroke={p.trim} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          )}
          <circle cx="60" cy="90" r="5.5" fill={p.trim} />
          <path d="M60 82l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#fff4c2" />
        </motion.g>

        {/* Legs / dress hem */}
        {character === "noori" ? (
          <>
            <rect x="42" y="118" width="14" height="28" rx="7" fill={p.clothDark} />
            <rect x="64" y="118" width="14" height="28" rx="7" fill={p.clothDark} />
          </>
        ) : (
          <>
            <path d="M31 118 L28 142 C28 146 34 148 60 148 C86 148 92 146 92 142 L89 118 Z" fill={p.clothLight} />
            <rect x="44" y="138" width="10" height="10" rx="5" fill={p.clothDark} />
            <rect x="66" y="138" width="10" height="10" rx="5" fill={p.clothDark} />
          </>
        )}
        <ellipse cx="49" cy="146" rx="10" ry="5" fill={p.shoe} />
        <ellipse cx="71" cy="146" rx="10" ry="5" fill={p.shoe} />

        {/* Left arm (viewer's left) */}
        <motion.g
          style={{ transformOrigin: "38px 82px" }}
          animate={{ rotate: leftArm }}
          transition={{ duration: action === "thumbs" || action === "chin" ? 0.5 : 1.15, repeat: action === "thumbs" || action === "chin" ? 0 : Infinity, ease: "easeInOut" }}
        >
          <rect x="22" y="78" width="14" height="32" rx="7" fill={character === "noora" ? p.clothLight : p.skin} />
          {character === "noora" && <rect x="22" y="100" width="14" height="10" rx="5" fill={p.skin} />}
          <circle cx="29" cy="112" r="8" fill={p.skin} />
          {action === "thumbs" && <rect x="26" y="98" width="5" height="10" rx="2.5" fill={p.skin} />}
        </motion.g>
        {/* Right arm */}
        <motion.g
          style={{ transformOrigin: "82px 82px" }}
          animate={reduce ? undefined : { rotate: rightArm }}
          transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="84" y="78" width="14" height="32" rx="7" fill={character === "noora" ? p.clothLight : p.skin} />
          {character === "noora" && <rect x="84" y="100" width="14" height="10" rx="5" fill={p.skin} />}
          <circle cx="91" cy="112" r="8" fill={p.skin} />
        </motion.g>

        {/* Mood effects */}
        {(mood === "cheer" || action === "clap") && !reduce && (
          <>
            <motion.circle cx="18" cy="40" r="3" fill="#c9922a" animate={{ y: [0, -12, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity }} />
            <motion.circle cx="102" cy="36" r="2.5" fill="#7dd3a8" animate={{ y: [0, -10, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} />
            <motion.path d="M12 60 l1.5 3 3 .4-2.2 2.1.5 3-2.8-1.5-2.8 1.5.5-3-2.2-2.1 3-.4z" fill="#f4a261" animate={{ rotate: [0, 30, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.4 }} />
          </>
        )}
        {(mood === "think" || mood === "hint") && (
          <g>
            <circle cx="103" cy="18" r="13" fill="#fff9e8" stroke="#c9922a" strokeWidth="2" />
            <text x="103" y="23" textAnchor="middle" fontSize="16" fontWeight="900" fill="#0a6e4f">?</text>
          </g>
        )}
        {mood === "listen" && (
          <g fill="none" stroke="#2d9cdb" strokeWidth="2.5" strokeLinecap="round">
            <path d="M92 44q12 7 0 14" />
            <path d="M98 39q20 12 0 24" opacity=".65" />
          </g>
        )}
        {mood === "sad" && !reduce && (
          <motion.path d="M84 60 q-3 6 0 8 q3 -2 0 -8z" fill="#6ec1ff" animate={{ y: [0, 6], opacity: [1, 0] }} transition={{ duration: 1.1, repeat: Infinity }} />
        )}
        {speaking && !reduce && (
          <g fill="none" stroke={p.trim} strokeWidth="2" strokeLinecap="round" opacity="0.8">
            <motion.path d="M96 52q6 4 0 8" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 0.8, repeat: Infinity }} />
            <motion.path d="M100 48q10 8 0 16" animate={{ opacity: [0.1, 0.8, 0.1] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} />
          </g>
        )}
      </motion.svg>
      {caption && <div className="ik-noori-caption">{caption}</div>}
    </div>
  );
}

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type ZaydMood = "idle" | "happy" | "excited" | "thinking" | "celebrating";
export type ZaydAction = "idle" | "wave" | "point" | "clap" | "jump" | "dance";

interface ZaydMascotProps {
  mood?: ZaydMood;
  speechBubble?: string;
  size?: number;
  className?: string;
  action?: ZaydAction;
  lookAt?: "left" | "center" | "right";
}

function ZaydSVG({
  mood,
  blinkPhase,
  action,
  lookAt,
}: {
  mood: ZaydMood;
  blinkPhase: boolean;
  action: ZaydAction;
  lookAt: "left" | "center" | "right";
}) {
  const eyeScaleY = blinkPhase ? 0.1 : 1;
  const gazeOffset = lookAt === "left" ? -1.5 : lookAt === "right" ? 1.5 : 0;
  const mouthPath = mood === "happy" || mood === "celebrating" || mood === "excited"
    ? "M 42 68 Q 50 76 58 68"
    : mood === "thinking"
    ? "M 42 70 Q 50 70 58 70"
    : "M 44 70 Q 50 74 56 70";

  const bodyRotate = action === "dance"
    ? [0, -8, 8, -6, 6, 0]
    : mood === "excited"
      ? [0, -5, 5, -3, 3, 0]
      : mood === "celebrating"
        ? [0, 10, -10, 5, -5, 0]
        : [0, -2, 2, 0];

  return (
    <motion.svg
      viewBox="0 0 100 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: bodyRotate }}
      transition={{ duration: mood === "excited" ? 0.6 : 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
    >
      {/* Shadow */}
      <ellipse cx="50" cy="155" rx="22" ry="5" fill="#00000015" />

      {/* Feet */}
      <rect x="33" y="138" width="14" height="8" rx="4" fill="#4a3728" />
      <rect x="53" y="138" width="14" height="8" rx="4" fill="#4a3728" />

      {/* Pants */}
      <rect x="32" y="118" width="36" height="24" rx="6" fill="#1e40af" />
      <line x1="50" y1="118" x2="50" y2="142" stroke="#1e3a8a" strokeWidth="1.5" />

      {/* Shirt/Qamees - white */}
      <rect x="28" y="85" width="44" height="40" rx="8" fill="#ffffff" />
      {/* Green vest overlay */}
      <path d="M28 85 Q28 95 35 98 L42 98 L42 125 L58 125 L58 98 L65 98 Q72 95 72 85 Z" fill="#166534" opacity="0.85" />
      {/* Gold trim */}
      <path d="M42 98 L42 125 L58 125 L58 98" stroke="#f5c518" strokeWidth="1.5" fill="none" />
      <rect x="45" y="88" width="10" height="5" rx="2" fill="#f5c518" opacity="0.7" />

      {/* Left arm */}
      <motion.g
        animate={{
          rotate: action === "wave"
            ? [0, 38, 12, 42, 8, 34, 0]
            : action === "clap"
              ? [0, -32, 0, -32, 0]
              : mood === "celebrating"
                ? [0, 30, -10, 20, 0]
                : mood === "happy"
                  ? [0, 15, 0]
                  : [0, 5, 0],
        }}
        transition={{ duration: mood === "celebrating" ? 1 : 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ transformOrigin: "30px 90px" }}
      >
        <rect x="18" y="88" width="13" height="28" rx="6" fill="#c68642" />
        {/* Hand */}
        <circle cx="24" cy="120" r="7" fill="#c68642" />
        {mood === "celebrating" && (
          <>
            <circle cx="20" cy="116" r="3" fill="#c68642" />
            <circle cx="26" cy="115" r="3" fill="#c68642" />
            <circle cx="22" cy="114" r="2.5" fill="#c68642" />
            <circle cx="28" cy="118" r="2.5" fill="#c68642" />
          </>
        )}
      </motion.g>

      {/* Right arm */}
      <motion.g
        animate={{
          rotate: action === "point"
            ? [0, -58, -52]
            : action === "clap"
              ? [0, 32, 0, 32, 0]
              : mood === "celebrating"
                ? [0, -30, 10, -20, 0]
                : mood === "happy"
                  ? [0, -10, 0]
                  : [0, -3, 0],
        }}
        transition={{ duration: mood === "celebrating" ? 1 : 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.3 }}
        style={{ transformOrigin: "70px 90px" }}
      >
        <rect x="69" y="88" width="13" height="28" rx="6" fill="#c68642" />
        <circle cx="76" cy="120" r="7" fill="#c68642" />
      </motion.g>

      {/* Neck */}
      <rect x="44" y="74" width="12" height="14" rx="4" fill="#c68642" />

      {/* Head */}
      <ellipse cx="50" cy="55" rx="26" ry="28" fill="#c68642" />

      {/* Kufi hat */}
      <ellipse cx="50" cy="31" rx="22" ry="8" fill="#14532d" />
      <rect x="28" y="26" width="44" height="10" rx="5" fill="#166534" />
      {/* Hat pattern */}
      <path d="M32 28 Q38 24 44 28 Q50 24 56 28 Q62 24 68 28" stroke="#f5c518" strokeWidth="1" fill="none" opacity="0.6" />

      {/* Eyes */}
      <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: "40px 56px" }}>
        <ellipse cx="40" cy="56" rx="6" ry="7" fill="white" />
        <ellipse cx={41 + gazeOffset} cy="57" rx="4" ry="4.5" fill="#2d1b0e" />
        <ellipse cx={42.5 + gazeOffset} cy="55.5" rx="1.5" ry="1.5" fill="white" />
      </motion.g>
      <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: "60px 56px" }}>
        <ellipse cx="60" cy="56" rx="6" ry="7" fill="white" />
        <ellipse cx={61 + gazeOffset} cy="57" rx="4" ry="4.5" fill="#2d1b0e" />
        <ellipse cx={62.5 + gazeOffset} cy="55.5" rx="1.5" ry="1.5" fill="white" />
      </motion.g>

      {/* Eyebrows */}
      <path d={mood === "thinking" ? "M35 48 Q40 47 45 49" : "M35 48 Q40 46 45 47"} stroke="#2d1b0e" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d={mood === "thinking" ? "M55 49 Q60 47 65 48" : "M55 47 Q60 46 65 48"} stroke="#2d1b0e" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Nose */}
      <circle cx="50" cy="63" r="2.5" fill="#a0692e" />

      {/* Mouth */}
      <motion.path
        d={mouthPath}
        stroke="#2d1b0e"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        animate={{ d: mouthPath }}
        transition={{ duration: 0.4 }}
      />

      {/* Cheeks */}
      {(mood === "happy" || mood === "excited" || mood === "celebrating") && (
        <>
          <ellipse cx="34" cy="67" rx="6" ry="4" fill="#f87171" opacity="0.4" />
          <ellipse cx="66" cy="67" rx="6" ry="4" fill="#f87171" opacity="0.4" />
        </>
      )}

      {/* Ear */}
      <ellipse cx="24" cy="55" rx="4" ry="6" fill="#c68642" />
      <ellipse cx="76" cy="55" rx="4" ry="6" fill="#c68642" />
    </motion.svg>
  );
}

export default function ZaydMascot({
  mood = "idle",
  speechBubble,
  size = 160,
  className = "",
  action = "idle",
  lookAt = "center",
}: ZaydMascotProps) {
  const [blinkPhase, setBlinkPhase] = useState(false);

  useEffect(() => {
    function blink() {
      setBlinkPhase(true);
      setTimeout(() => setBlinkPhase(false), 120);
    }
    const interval = setInterval(blink, 2800 + Math.random() * 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative flex flex-col items-center ${className}`}
      style={{ width: size }}
      role="img"
      aria-label={`Zayd learning companion is ${mood}`}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {speechBubble && (
          <motion.div
            className="absolute -top-2 left-1/2 z-10 max-w-[200px] -translate-x-1/2 -translate-y-full rounded-2xl bg-white px-3 py-2 text-center text-sm font-semibold text-gray-800 shadow-xl"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            role="status"
            aria-live="polite"
          >
            {speechBubble}
            {/* Bubble tail */}
            <div className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character */}
      <motion.div
        style={{ width: size, height: size * 1.6 }}
        animate={{
          y: action === "jump"
            ? [0, -24, 0, -12, 0]
            : mood === "idle"
              ? [0, -6, 0]
              : mood === "celebrating"
                ? [0, -12, 0, -8, 0]
                : [0, -4, 0],
          scale: action === "clap" ? [1, 1.03, 1] : 1,
        }}
        transition={{ duration: action === "jump" ? 0.9 : mood === "celebrating" ? 0.6 : 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <ZaydSVG mood={mood} blinkPhase={blinkPhase} action={action} lookAt={lookAt} />
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { SalahPosture } from "../types";

type WuduPosture = Extract<SalahPosture, `wudu-${string}`> | "overview";

interface WuduVisualProps {
  posture: WuduPosture;
  reducedMotion: boolean;
  className?: string;
}

const SKIN = "#f5c9a3";
const SKIN_DARK = "#e0a97e";
const OUTLINE = "#0a3d3a";
const WATER = "#38bdf8";
const WATER_DARK = "#0284c7";
const KUFI = "#d4a017";
const THOBE = "#0f766e";

export const WUDU_META: Record<WuduPosture, { name: string; arabic: string; times: string; checks: string[] }> = {
  overview: { name: "At the sink", arabic: "الاِسْتِعْدَاد", times: "Start", checks: ["Say Bismillah", "Intend wudu in the heart", "Don't waste water"] },
  "wudu-hands": { name: "Wash the hands", arabic: "غَسْلُ اليَدَيْن", times: "×3", checks: ["Up to the wrists", "Between the fingers", "Right hand first"] },
  "wudu-mouth": { name: "Rinse the mouth", arabic: "المَضْمَضَة", times: "×3", checks: ["Water in the right hand", "Swish gently", "Spit it out"] },
  "wudu-nose": { name: "Clean the nose", arabic: "الاِسْتِنْشَاق", times: "×3", checks: ["Sniff lightly", "Blow out with the left hand", "Be gentle"] },
  "wudu-face": { name: "Wash the face", arabic: "غَسْلُ الوَجْه", times: "×3", checks: ["Forehead to chin", "Ear to ear", "Both hands together"] },
  "wudu-arms": { name: "Wash the arms", arabic: "غَسْلُ الذِّرَاعَيْن", times: "×3", checks: ["Right arm first", "Up to & including the elbow", "Then the left arm"] },
  "wudu-head": { name: "Wipe the head", arabic: "مَسْحُ الرَّأْس", times: "×1", checks: ["Wet hands", "Front to back", "Light wipe, no scrubbing"] },
  "wudu-ears": { name: "Wipe the ears", arabic: "مَسْحُ الأُذُنَيْن", times: "×1", checks: ["Index finger inside", "Thumb behind the ear", "Both ears together"] },
  "wudu-feet": { name: "Wash the feet", arabic: "غَسْلُ الرِّجْلَيْن", times: "×3", checks: ["Right foot first", "Up to the ankles", "Between the toes"] },
};

/** Falling water drops that loop — positioned in viewBox units. */
function Drops({ x, y, count = 3, reducedMotion, spread = 14 }: { x: number; y: number; count?: number; reducedMotion: boolean; spread?: number }) {
  if (reducedMotion) {
    return (
      <g>
        {Array.from({ length: count }).map((_, i) => (
          <path key={i} d={dropPath(x + (i - (count - 1) / 2) * spread, y + 10)} fill={WATER} />
        ))}
      </g>
    );
  }
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => (
        <motion.path
          key={i}
          d={dropPath(x + (i - (count - 1) / 2) * spread, y)}
          fill={WATER}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: [0, 1, 1, 0], y: [-6, 6, 18, 28] }}
          transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.28, ease: "easeIn" }}
        />
      ))}
    </g>
  );
}

function dropPath(x: number, y: number) {
  return `M ${x} ${y - 6} C ${x + 4} ${y - 1} ${x + 4} ${y + 3} ${x} ${y + 4} C ${x - 4} ${y + 3} ${x - 4} ${y - 1} ${x} ${y - 6} Z`;
}

/** Pulsing highlight ring around the part being washed. */
function Highlight({ cx, cy, r, reducedMotion }: { cx: number; cy: number; r: number; reducedMotion: boolean }) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={WATER_DARK}
      strokeWidth="2.5"
      strokeDasharray="5 4"
      initial={{ opacity: 0.5, scale: 0.95 }}
      animate={reducedMotion ? { opacity: 0.8 } : { opacity: [0.35, 0.9, 0.35], scale: [0.96, 1.04, 0.96] }}
      transition={{ duration: 1.8, repeat: Infinity }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    />
  );
}

/** Front-facing child head, reused across face/mouth/nose/head/ears steps. */
function Head({ cx = 100, cy = 78, r = 34 }: { cx?: number; cy?: number; r?: number }) {
  return (
    <g>
      {/* ears */}
      <ellipse cx={cx - r + 2} cy={cy + 2} rx="6" ry="9" fill={SKIN_DARK} stroke={OUTLINE} strokeWidth="1" />
      <ellipse cx={cx + r - 2} cy={cy + 2} rx="6" ry="9" fill={SKIN_DARK} stroke={OUTLINE} strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r} fill={SKIN} stroke={OUTLINE} strokeWidth="1.2" />
      {/* kufi cap sitting on top of the head */}
      <path d={`M ${cx - r + 5} ${cy - r * 0.45} Q ${cx} ${cy - r - 6} ${cx + r - 5} ${cy - r * 0.45} Q ${cx} ${cy - r * 0.62} ${cx - r + 5} ${cy - r * 0.45} Z`} fill={KUFI} stroke={OUTLINE} strokeWidth="0.8" />
      {/* eyes */}
      <circle cx={cx - 11} cy={cy - 2} r="2.4" fill={OUTLINE} />
      <circle cx={cx + 11} cy={cy - 2} r="2.4" fill={OUTLINE} />
      {/* nose */}
      <path d={`M ${cx} ${cy + 2} q -3 7 2 8`} fill="none" stroke={OUTLINE} strokeWidth="1.2" strokeLinecap="round" />
      {/* smile */}
      <path d={`M ${cx - 9} ${cy + 15} Q ${cx} ${cy + 22} ${cx + 9} ${cy + 15}`} fill="none" stroke={OUTLINE} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

/** Simple open hand (palm) — pointing up by default; rotate via transform. */
function Hand({ x, y, scale = 1, flip = false, transform }: { x: number; y: number; scale?: number; flip?: boolean; transform?: string }) {
  const s = scale * (flip ? -1 : 1);
  return (
    <g transform={`${transform ?? ""} translate(${x} ${y}) scale(${s} ${scale})`}>
      <path
        d="M -12 12 L -12 -6 Q -12 -12 -7 -12 Q -3 -12 -3 -6 L -3 -14 Q -3 -20 2 -20 Q 6 -20 6 -14 L 6 -8 Q 8 -16 12 -14 Q 15 -12 14 -6 L 14 10 Q 14 22 2 24 L -6 24 Q -12 22 -12 12 Z"
        fill={SKIN}
        stroke={OUTLINE}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M -12 4 q -7 -4 -8 -12 q 4 -2 8 2" fill={SKIN} stroke={OUTLINE} strokeWidth="1.1" />
    </g>
  );
}

function Tap({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 5} y={y - 40} width="10" height="30" rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
      <path d={`M ${x} ${y - 40} q 0 -14 18 -14 q 14 0 14 12 l 0 10`} fill="none" stroke="#64748b" strokeWidth="9" strokeLinecap="round" />
      <rect x={x + 26} y={y - 34} width="12" height="8" rx="2" fill="#475569" />
      <circle cx={x - 10} cy={y - 42} r="5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
    </g>
  );
}

export default function WuduVisual({ posture, reducedMotion, className }: WuduVisualProps) {
  const vb = "0 0 200 170";

  switch (posture) {
    case "wudu-hands":
      return (
        <svg viewBox={vb} className={className} role="img" aria-label="Washing both hands under running water">
          <rect x="20" y="130" width="160" height="26" rx="10" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" />
          <Tap x={70} y={110} />
          <Hand x={88} y={112} scale={1.15} transform="rotate(20 88 112)" />
          <Hand x={122} y={112} scale={1.15} flip transform="rotate(-20 122 112)" />
          <Drops x={102} y={68} count={4} reducedMotion={reducedMotion} spread={10} />
          <Highlight cx={104} cy={112} r={40} reducedMotion={reducedMotion} />
        </svg>
      );
    case "wudu-mouth":
      return (
        <svg viewBox={vb} className={className} role="img" aria-label="Rinsing the mouth with water from the right hand">
          <Head cx={100} cy={70} />
          <Hand x={112} y={110} scale={0.95} transform="rotate(-160 112 110)" />
          <Drops x={98} y={86} count={2} reducedMotion={reducedMotion} spread={10} />
          <Highlight cx={100} cy={88} r={16} reducedMotion={reducedMotion} />
          <text x="100" y="158" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0c4a6e" fontFamily="ui-sans-serif, system-ui">swish · then spit out</text>
        </svg>
      );
    case "wudu-nose":
      return (
        <svg viewBox={vb} className={className} role="img" aria-label="Sniffing water lightly into the nose">
          <Head cx={100} cy={70} />
          <Hand x={116} y={104} scale={0.9} transform="rotate(-150 116 104)" />
          <Drops x={100} y={60} count={2} reducedMotion={reducedMotion} spread={8} />
          <Highlight cx={101} cy={76} r={12} reducedMotion={reducedMotion} />
          <text x="100" y="158" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0c4a6e" fontFamily="ui-sans-serif, system-ui">sniff lightly · blow out gently</text>
        </svg>
      );
    case "wudu-face":
      return (
        <svg viewBox={vb} className={className} role="img" aria-label="Washing the whole face with both hands">
          <defs>
            <marker id="np-arrow" markerUnits="userSpaceOnUse" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 z" fill={WATER_DARK} />
            </marker>
          </defs>
          <Head cx={100} cy={76} />
          <Hand x={66} y={96} scale={0.95} transform="rotate(28 66 96)" />
          <Hand x={134} y={96} scale={0.95} flip transform="rotate(-28 134 96)" />
          <Drops x={100} y={38} count={4} reducedMotion={reducedMotion} spread={16} />
          <Highlight cx={100} cy={78} r={40} reducedMotion={reducedMotion} />
          {/* forehead→chin, ear→ear guide arrows */}
          <path d="M 100 44 L 100 108" stroke={WATER_DARK} strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#np-arrow)" opacity="0.7" />
          <path d="M 64 78 L 136 78" stroke={WATER_DARK} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
        </svg>
      );
    case "wudu-arms":
      return (
        <svg viewBox={vb} className={className} role="img" aria-label="Washing the right arm up to the elbow">
          {/* forearm horizontal with elbow on the left */}
          <path d="M 40 96 L 150 96" stroke={OUTLINE} strokeWidth="28" strokeLinecap="round" fill="none" />
          <path d="M 40 96 L 150 96" stroke={SKIN} strokeWidth="26" strokeLinecap="round" fill="none" />
          <circle cx="40" cy="96" r="15" fill={SKIN_DARK} stroke={OUTLINE} strokeWidth="1" />
          <Hand x={156} y={96} scale={0.9} transform="rotate(90 156 96)" />
          {/* other hand rubbing */}
          <motion.g
            animate={reducedMotion ? undefined : { x: [0, 26, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Hand x={96} y={78} scale={0.85} transform="rotate(180 96 78)" />
          </motion.g>
          <Drops x={90} y={50} count={4} reducedMotion={reducedMotion} spread={20} />
          <Highlight cx={42} cy={96} r={20} reducedMotion={reducedMotion} />
          <text x="40" y="132" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#0c4a6e" fontFamily="ui-sans-serif, system-ui">elbow included</text>
          <text x="150" y="132" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#0c4a6e" fontFamily="ui-sans-serif, system-ui">fingertips</text>
        </svg>
      );
    case "wudu-head":
      return (
        <svg viewBox={vb} className={className} role="img" aria-label="Wiping the head with wet hands from front to back">
          <defs>
            <marker id="np-arrow" markerUnits="userSpaceOnUse" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 z" fill={WATER_DARK} />
            </marker>
          </defs>
          <Head cx={100} cy={82} />
          <motion.g
            animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Hand x={80} y={46} scale={0.85} transform="rotate(100 80 46)" />
            <Hand x={120} y={46} scale={0.85} flip transform="rotate(-100 120 46)" />
          </motion.g>
          <path d="M 70 40 Q 100 26 130 40" fill="none" stroke={WATER_DARK} strokeWidth="1.6" strokeDasharray="3 3" markerEnd="url(#np-arrow)" />
          <Highlight cx={100} cy={52} r={30} reducedMotion={reducedMotion} />
          <text x="100" y="158" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0c4a6e" fontFamily="ui-sans-serif, system-ui">front → back, once</text>
        </svg>
      );
    case "wudu-ears":
      return (
        <svg viewBox={vb} className={className} role="img" aria-label="Wiping inside and behind both ears">
          <Head cx={100} cy={82} />
          <Hand x={54} y={90} scale={0.8} transform="rotate(60 54 90)" />
          <Hand x={146} y={90} scale={0.8} flip transform="rotate(-60 146 90)" />
          <Highlight cx={68} cy={84} r={13} reducedMotion={reducedMotion} />
          <Highlight cx={132} cy={84} r={13} reducedMotion={reducedMotion} />
          <text x="100" y="158" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0c4a6e" fontFamily="ui-sans-serif, system-ui">index inside · thumb behind</text>
        </svg>
      );
    case "wudu-feet":
      return (
        <svg viewBox={vb} className={className} role="img" aria-label="Washing both feet up to the ankles">
          <rect x="20" y="126" width="160" height="26" rx="10" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" />
          {/* two feet, side view, toes to the right */}
          {[0, 1].map((i) => {
            const y = 108 + i * 10;
            const x = 56 + i * 8;
            return (
              <g key={i}>
                <path d={`M ${x} ${y - 30} L ${x} ${y} Q ${x} ${y + 12} ${x + 14} ${y + 12} L ${x + 74} ${y + 12} Q ${x + 84} ${y + 12} ${x + 82} ${y + 2} Q ${x + 74} ${y - 6} ${x + 40} ${y - 6} L ${x + 22} ${y - 6} L ${x + 22} ${y - 30} Z`} fill={i === 0 ? SKIN_DARK : SKIN} stroke={OUTLINE} strokeWidth="1.1" />
                {/* toes */}
                {[0, 1, 2, 3].map((t) => (
                  <circle key={t} cx={x + 66 + t * 5} cy={y + 2 - t * 1.2} r="2.2" fill="none" stroke={OUTLINE} strokeWidth="0.8" />
                ))}
              </g>
            );
          })}
          <Drops x={104} y={64} count={4} reducedMotion={reducedMotion} spread={22} />
          <Highlight cx={70} cy={88} r={16} reducedMotion={reducedMotion} />
          <text x="70" y="70" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#0c4a6e" fontFamily="ui-sans-serif, system-ui">ankle</text>
          <text x="152" y="152" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#0c4a6e" fontFamily="ui-sans-serif, system-ui">between the toes</text>
        </svg>
      );
    case "overview":
    default:
      return (
        <svg viewBox={vb} className={className} role="img" aria-label="Child standing at the sink ready to start wudu">
          {/* sink */}
          <rect x="70" y="112" width="120" height="14" rx="6" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
          <path d="M 84 126 L 176 126 L 168 150 L 92 150 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
          <Tap x={150} y={112} />
          <Drops x={168} y={78} count={3} reducedMotion={reducedMotion} spread={0} />
          {/* child (front) */}
          <path d="M 42 100 L 42 160 L 90 160 L 90 100 Q 66 84 42 100 Z" fill={THOBE} />
          <Head cx={66} cy={64} r={26} />
          <path d="M 44 108 Q 30 124 44 140" fill="none" stroke={SKIN} strokeWidth="9" strokeLinecap="round" />
          <path d="M 88 108 Q 108 116 118 116" fill="none" stroke={SKIN} strokeWidth="9" strokeLinecap="round" />
          <circle cx="120" cy="116" r="6" fill={SKIN} stroke={OUTLINE} strokeWidth="0.8" />
          <text x="150" y="30" textAnchor="middle" fontSize="12" fontWeight="900" fill="#134e4a" fontFamily="ui-sans-serif, system-ui">بِسْمِ اللّٰهِ</text>
        </svg>
      );
  }
}

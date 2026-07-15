"use client";

import { motion } from "framer-motion";
import { useMotionBudget } from "../motion/useMotionBudget";

export default function ScenicLearningBackground({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const budget = useMotionBudget(reducedMotion);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-[#bcecff] via-[#e8f8cf] to-[#83bd58]" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(circle_at_52%_24%,rgba(255,255,255,0.9),transparent_32%)]" />

      <motion.div
        className="absolute left-[8%] top-[10%] h-8 w-24 rounded-full bg-white/75 blur-[1px] after:absolute after:-top-4 after:left-5 after:h-10 after:w-10 after:rounded-full after:bg-white/80 before:absolute before:-top-6 before:right-4 before:h-12 before:w-12 before:rounded-full before:bg-white/80"
        animate={budget.allowInfiniteMotion ? { x: [0, 24, 0] } : undefined}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[12%] top-[16%] h-7 w-20 rounded-full bg-white/70 after:absolute after:-top-4 after:left-4 after:h-9 after:w-9 after:rounded-full after:bg-white/75 before:absolute before:-top-5 before:right-3 before:h-11 before:w-11 before:rounded-full before:bg-white/75"
        animate={budget.allowInfiniteMotion ? { x: [0, -20, 0] } : undefined}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        className="absolute inset-x-0 bottom-0 h-[72%] w-full"
        viewBox="0 0 1400 620"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="qaida-hills" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7fc54c" />
            <stop offset="100%" stopColor="#3d842f" />
          </linearGradient>
          <linearGradient id="qaida-path" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7e5a7" />
            <stop offset="100%" stopColor="#d4b45e" />
          </linearGradient>
          <filter id="qaida-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <path d="M0 250C170 120 310 180 455 255C620 110 790 115 925 245C1110 135 1240 145 1400 235V620H0Z" fill="#b7dc7a" opacity=".62" />
        <path d="M0 330C185 225 335 252 500 350C690 235 850 230 1010 350C1170 255 1300 270 1400 330V620H0Z" fill="url(#qaida-hills)" />

        <g opacity=".78">
          <path d="M570 300V210H600V300ZM800 300V210H830V300Z" fill="#d0a55b" />
          <path d="M565 210Q585 165 605 210ZM795 210Q815 165 835 210Z" fill="#e5c36f" />
          <rect x="615" y="235" width="170" height="100" rx="8" fill="#d8b66c" />
          <path d="M635 235Q700 145 765 235Z" fill="#e7c978" />
          <circle cx="700" cy="174" r="7" fill="#f5ce55" />
          <rect x="685" y="278" width="30" height="57" rx="15" fill="#8d6837" />
        </g>

        <path d="M545 620C575 475 660 390 720 352C795 410 850 505 875 620Z" fill="url(#qaida-path)" opacity=".78" />

        {[
          [115, 340, 1.1],
          [260, 410, 0.8],
          [1060, 350, 1],
          [1230, 420, 0.82],
        ].map(([x, y, s]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x="-7" y="22" width="14" height="80" rx="7" fill="#87552c" />
            <path d="M0 36C-68 12-72-18-28-2C-45-45-12-55 0-17C15-60 50-42 27-3C73-21 65 18 0 36Z" fill="#2f8d45" />
          </g>
        ))}

        <g opacity=".42" filter="url(#qaida-soft)">
          <ellipse cx="300" cy="565" rx="180" ry="36" fill="#2c6c2a" />
          <ellipse cx="1110" cy="565" rx="210" ry="42" fill="#2c6c2a" />
        </g>
      </svg>

      {budget.allowInfiniteMotion && (
        <>
          <motion.svg
            className="absolute left-[-8%] top-[22%] h-8 w-16 text-emerald-900/45"
            viewBox="0 0 64 32"
            animate={{ x: ["0vw", "118vw"], y: [0, -12, 4, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          >
            <path d="M4 18Q15 5 28 18Q41 5 56 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </motion.svg>
          <motion.svg
            className="absolute left-[-12%] top-[31%] h-6 w-12 text-emerald-900/35"
            viewBox="0 0 64 32"
            animate={{ x: ["0vw", "122vw"], y: [0, 8, -5, 0] }}
            transition={{ duration: 27, repeat: Infinity, ease: "linear", delay: 4 }}
          >
            <path d="M4 18Q15 5 28 18Q41 5 56 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </motion.svg>
        </>
      )}

      {Array.from({ length: budget.ambientParticles }, (_, index) => (
        <motion.span
          key={index}
          className={`absolute ${index % 4 === 0 ? "h-2.5 w-1.5 rounded-[80%_20%_70%_30%] bg-emerald-500/60" : "h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(250,204,21,0.95)]"}`}
          style={{
            left: `${12 + ((index * 17) % 78)}%`,
            top: `${12 + ((index * 23) % 54)}%`,
          }}
          animate={budget.allowInfiniteMotion ? {
            opacity: [0.25, 1, 0.25],
            scale: [0.8, 1.35, 0.8],
            y: index % 4 === 0 ? [0, 22, 0] : [0, -8, 0],
            rotate: index % 4 === 0 ? [0, 70, 150] : 0,
          } : undefined}
          transition={{ duration: 2.4 + (index % 3), repeat: Infinity, delay: index * 0.18 }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0b4f35]/25 via-transparent to-white/5" />
    </div>
  );
}

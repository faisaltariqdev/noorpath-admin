"use client";
import { motion } from "framer-motion";
import type { QaidaProgress } from "../types";

interface QaidaHUDProps {
  progress: QaidaProgress;
  onBack?: () => void;
  breadcrumb?: string;
  title?: string;
  onAudioToggle?: () => void;
  audioEnabled?: boolean;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

function Badge({
  icon,
  value,
  label,
  className = "",
}: {
  icon: string;
  value: string | number;
  label: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#0a493f] to-[#123c4b] px-2.5 py-2 shadow-md ring-1 ring-white/15 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
    >
      <span className="text-sm">{icon}</span>
      <motion.span
        key={String(value)}
        className="qaida-progress-value text-sm font-bold text-white"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.span>
      <span className="hidden text-xs text-white/70 sm:inline">{label}</span>
    </motion.div>
  );
}

export default function QaidaHUD({ progress, onBack, breadcrumb, title, onAudioToggle, audioEnabled = true, onMenuToggle, menuOpen = false }: QaidaHUDProps) {
  return (
    <motion.header
      className="flex min-h-16 flex-none items-center gap-2 border-b border-emerald-900/10 bg-white/[0.94] px-3 py-2.5 shadow-sm backdrop-blur-md sm:gap-3 sm:px-5"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Back button */}
      {onBack && (
        <motion.button
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-900/10 text-lg text-emerald-950 hover:bg-emerald-900/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          aria-label="Go back"
        >
          ←
        </motion.button>
      )}

      <motion.button
        id="qaida-menu-button"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#123c4b] text-white shadow-md hover:bg-[#185468] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 lg:hidden"
        onClick={onMenuToggle}
        whileTap={{ scale: 0.9 }}
        aria-label="Open menu"
        aria-controls="qaida-mobile-navigation"
        aria-expanded={menuOpen}
      >
        ☰
      </motion.button>

      {/* Breadcrumb + title */}
      <div className="min-w-0 flex-1">
        {breadcrumb && <div className="text-[10px] uppercase tracking-wider text-gray-400">{breadcrumb}</div>}
        {title && <div className="truncate text-base font-bold text-gray-900 sm:text-lg">{title}</div>}
      </div>

      {/* Badges row */}
      <div className="flex flex-none items-center gap-1.5 sm:gap-2">
        <Badge icon="🌟" value={`Level ${progress.level}`} label="" className="hidden min-[480px]:flex" />
        <Badge icon="⭐" value={`${progress.xp} XP`} label="" className="hidden sm:flex" />
        <Badge icon="🪙" value={progress.coins} label="Coins" className="hidden md:flex" />
        <Badge icon="🔥" value={`${progress.streak} Day`} label="Streak" className="hidden xl:flex" />

        {/* Audio toggle */}
        <motion.button
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#123c4b] text-white shadow-md hover:bg-[#185468] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
          onClick={onAudioToggle}
          whileTap={{ scale: 0.9 }}
          aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
        >
          {audioEnabled ? "🔊" : "🔇"}
        </motion.button>
      </div>
    </motion.header>
  );
}

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
      className={`inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-[#0a493f] to-[#123c4b] px-2 py-1.5 shadow-md ring-1 ring-white/15 sm:gap-1.5 sm:px-2.5 sm:py-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
    >
      <span className="text-sm" aria-hidden="true">{icon}</span>
      <motion.span
        key={String(value)}
        className="qaida-progress-value text-xs font-bold text-white sm:text-sm"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.span>
      {label ? <span className="hidden text-xs text-white/70 lg:inline">{label}</span> : null}
    </motion.div>
  );
}

export default function QaidaHUD({ progress, onBack, breadcrumb, title, onAudioToggle, audioEnabled = true, onMenuToggle, menuOpen = false }: QaidaHUDProps) {
  return (
    <motion.header
      className="qaida-hud flex min-h-14 flex-none items-center gap-1.5 border-b border-emerald-900/10 bg-white/[0.94] py-2 shadow-sm backdrop-blur-md sm:min-h-16 sm:gap-3 sm:py-2.5"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
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

      <div className="min-w-0 flex-1 overflow-hidden pr-1">
        {breadcrumb && (
          <div className="truncate text-[10px] uppercase tracking-wider text-gray-400">{breadcrumb}</div>
        )}
        {title && (
          <div className="qaida-hud-title truncate text-sm font-bold text-gray-900 sm:text-base md:text-lg">
            {title}
          </div>
        )}
      </div>

      <div className="qaida-hud-stats flex flex-none items-center gap-1 sm:gap-1.5 md:gap-2">
        {/* Always keep one progress signal on the smallest phones */}
        <Badge icon="⭐" value={progress.xp} label="XP" className="flex" />
        <Badge icon="🌟" value={`L${progress.level}`} label="Level" className="hidden min-[380px]:inline-flex" />
        <Badge icon="🪙" value={progress.coins} label="Coins" className="hidden sm:inline-flex" />
        <Badge icon="🔥" value={progress.streak} label="Streak" className="hidden md:inline-flex" />

        <motion.button
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#123c4b] text-white shadow-md hover:bg-[#185468] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
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

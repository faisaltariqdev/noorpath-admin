"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Menu, Volume2, VolumeX } from "lucide-react";
import React from "react";
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

function StatBadge({
  icon,
  value,
  label,
  tint = "gold",
  className = "",
}: {
  icon: string;
  value: string | number;
  label: string;
  tint?: "gold" | "sky" | "amber" | "emerald";
  className?: string;
}) {
  const tintClasses = {
    gold: "border-amber-200/90 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-950",
    sky: "border-sky-200/90 bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-950",
    amber: "border-orange-200/90 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950",
    emerald: "border-emerald-200/90 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-950",
  }[tint];

  return (
    <motion.div
      className={`inline-flex min-h-8 sm:min-h-9 items-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-full border px-2.5 sm:px-3 py-1 shadow-2xs font-extrabold ${tintClasses} ${className}`}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <span className="text-xs sm:text-sm" aria-hidden="true">{icon}</span>
      <motion.span
        key={String(value)}
        className="qaida-progress-value text-xs sm:text-sm font-black"
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.span>
      <span className="text-[10px] sm:text-xs opacity-75 font-bold uppercase tracking-wider">{label}</span>
    </motion.div>
  );
}

export default function QaidaHUD({
  progress,
  onBack,
  breadcrumb,
  title,
  onAudioToggle,
  audioEnabled = true,
  onMenuToggle,
  menuOpen = false,
}: QaidaHUDProps) {
  return (
    <motion.header
      className="qaida-hud flex min-h-14 sm:min-h-16 flex-none items-center gap-2 sm:gap-3 border-b border-emerald-900/10 bg-white/[0.96] px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 shadow-xs backdrop-blur-md w-full max-w-full"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {onBack && (
        <motion.button
          className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-900/10 text-emerald-950 hover:bg-emerald-900/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 transition cursor-pointer"
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </motion.button>
      )}

      <motion.button
        id="qaida-menu-button"
        className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#123c4b] text-white shadow-sm hover:bg-[#185468] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 lg:hidden transition cursor-pointer active:scale-95"
        onClick={onMenuToggle}
        whileTap={{ scale: 0.9 }}
        aria-label="Open menu"
        aria-controls="qaida-mobile-navigation"
        aria-expanded={menuOpen}
      >
        <Menu size={18} />
      </motion.button>

      <div className="min-w-0 flex-1 overflow-hidden pr-1">
        {breadcrumb && (
          <div className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {breadcrumb}
          </div>
        )}
        {title && (
          <div className="qaida-hud-title truncate text-sm font-black text-slate-900 sm:text-base md:text-lg">
            {title}
          </div>
        )}
      </div>

      <div className="qaida-hud-stats flex flex-none items-center gap-1.5 sm:gap-2">
        {/* Sleek Golden XP Pill Badge */}
        <StatBadge icon="⭐" value={progress.xp} label="XP" tint="gold" className="flex" />
        <StatBadge icon="🌟" value={`L${progress.level}`} label="Level" tint="sky" className="hidden min-[400px]:inline-flex" />
        <StatBadge icon="🪙" value={progress.coins} label="Coins" tint="amber" className="hidden sm:inline-flex" />
        <StatBadge icon="🔥" value={progress.streak} label="Streak" tint="emerald" className="hidden md:inline-flex" />

        <motion.button
          className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#123c4b] text-white shadow-sm hover:bg-[#185468] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 active:scale-95 cursor-pointer"
          onClick={onAudioToggle}
          whileTap={{ scale: 0.9 }}
          aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
          title={audioEnabled ? "Sound enabled (tap to mute)" : "Sound muted (tap to enable)"}
        >
          {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </motion.button>
      </div>
    </motion.header>
  );
}

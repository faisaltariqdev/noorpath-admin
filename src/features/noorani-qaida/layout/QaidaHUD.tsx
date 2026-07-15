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
}

function Badge({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <motion.div
      className={`flex items-center gap-1.5 rounded-full ${color} px-3 py-1.5 shadow-md`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-sm font-bold text-white">{value}</span>
      <span className="hidden text-xs text-white/70 sm:inline">{label}</span>
    </motion.div>
  );
}

export default function QaidaHUD({ progress, onBack, breadcrumb, title, onAudioToggle, audioEnabled = true, onMenuToggle }: QaidaHUDProps) {
  return (
    <motion.header
      className="flex items-center gap-2 border-b border-white/20 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm sm:gap-3 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Back button */}
      {onBack && (
        <motion.button
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          aria-label="Go back"
        >
          ←
        </motion.button>
      )}

      {/* Breadcrumb + title */}
      <div className="min-w-0 flex-1">
        {breadcrumb && <div className="text-[10px] uppercase tracking-wider text-gray-400">{breadcrumb}</div>}
        {title && <div className="truncate text-base font-bold text-gray-900 sm:text-lg">{title}</div>}
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Badge icon="⭐" value={`Level ${progress.level}`} label="" color="bg-gradient-to-r from-violet-500 to-purple-600" />
        <Badge icon="⚡" value={`${progress.xp} XP`} label="" color="bg-gradient-to-r from-yellow-500 to-amber-500" />
        <Badge icon="🪙" value={progress.coins} label="Coins" color="bg-gradient-to-r from-yellow-400 to-orange-500" />
        <Badge icon="🔥" value={`${progress.streak} Day`} label="Streak" color="bg-gradient-to-r from-orange-500 to-red-500" />

        {/* Audio toggle */}
        <motion.button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          onClick={onAudioToggle}
          whileTap={{ scale: 0.9 }}
          aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
        >
          {audioEnabled ? "🔊" : "🔇"}
        </motion.button>

        {/* Menu */}
        <motion.button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          onClick={onMenuToggle}
          whileTap={{ scale: 0.9 }}
          aria-label="Open menu"
        >
          ☰
        </motion.button>
      </div>
    </motion.header>
  );
}

"use client";

import { motion } from "framer-motion";
import type { InteractiveExample } from "../types";

type ExampleTileProps = {
  item: Pick<InteractiveExample, "id" | "arabic" | "transliteration" | "meaning">;
  selected?: boolean;
  disabled?: boolean;
  reducedMotion?: boolean;
  showSpeaker?: boolean;
  className?: string;
  onClick?: () => void;
};

/**
 * Shared Arabic + English practice tile.
 * Keeps a dedicated glyph zone so Arabic descenders never cover transliteration
 * (Harakaat, Tanween, Sukoon, Shaddah, Madd, reading pages, etc.).
 */
export default function ExampleTile({
  item,
  selected = false,
  disabled = false,
  reducedMotion = false,
  showSpeaker = false,
  className = "",
  onClick,
}: ExampleTileProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled || reducedMotion ? undefined : { y: -3, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`qaida-example-tile relative flex min-h-[8.5rem] flex-col items-center rounded-2xl border px-3 pb-3 pt-4 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-55 ${
        selected
          ? "border-emerald-500 bg-emerald-50"
          : "border-amber-200 bg-white/80 hover:border-emerald-300 hover:bg-white"
      } ${className}`}
      aria-label={`Hear ${item.transliteration}`}
      aria-pressed={selected || undefined}
    >
      {showSpeaker && (
        <span className="absolute right-2 top-2 text-sm" aria-hidden="true">🔊</span>
      )}

      <span className="qaida-example-glyph flex h-[3.5rem] w-full items-center justify-center sm:h-[3.85rem]" aria-hidden="true">
        <span className="qaida-arabic block text-4xl font-black leading-[1.45] text-emerald-900" lang="ar" dir="rtl">
          {item.arabic}
        </span>
      </span>

      <span className="mt-1 flex w-full flex-col items-center gap-0.5 border-t border-amber-100/90 pt-2 text-center">
        <span className="max-w-full truncate text-sm font-black leading-tight text-slate-700" dir="ltr">
          {item.transliteration}
        </span>
        {item.meaning ? (
          <span className="max-w-full truncate text-xs leading-tight text-slate-500" dir="ltr">
            {item.meaning}
          </span>
        ) : null}
      </span>
    </motion.button>
  );
}

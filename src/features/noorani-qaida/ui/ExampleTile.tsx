"use client";

import { motion } from "framer-motion";
import type { InteractiveExample } from "../types";

type ExampleTileProps = {
  item: Pick<InteractiveExample, "id" | "arabic" | "transliteration" | "meaning">;
  selected?: boolean;
  disabled?: boolean;
  reducedMotion?: boolean;
  showSpeaker?: boolean;
  /** Full wrapping layout for long duas / translations (no ellipsis, flexible height). */
  fullText?: boolean;
  className?: string;
  onClick?: () => void;
};

/**
 * Shared Arabic + English practice tile.
 * Compact mode keeps a dedicated glyph zone for short Qaida drills.
 * fullText mode expands for long duas so Arabic, transliteration, and English stay fully readable.
 */
export default function ExampleTile({
  item,
  selected = false,
  disabled = false,
  reducedMotion = false,
  showSpeaker = false,
  fullText = false,
  className = "",
  onClick,
}: ExampleTileProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled || reducedMotion ? undefined : { y: -3, scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`qaida-example-tile relative flex flex-col items-center rounded-2xl border px-3 pb-3 pt-4 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-55 ${
        fullText ? "min-h-[10rem] gap-2 px-4 pb-4 pt-5 text-left sm:px-5" : "min-h-[8.5rem]"
      } ${
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

      <span
        className={`qaida-example-glyph flex w-full items-center justify-center ${
          fullText
            ? "min-h-[4.5rem] py-2"
            : "h-[3.5rem] sm:h-[3.85rem]"
        }`}
        aria-hidden="true"
      >
        <span
          className={`qaida-arabic block font-black text-emerald-900 ${
            fullText
              ? "w-full text-center text-2xl leading-[1.85] sm:text-3xl"
              : "text-4xl leading-[1.45]"
          }`}
          lang="ar"
          dir="rtl"
        >
          {item.arabic}
        </span>
      </span>

      <span
        className={`mt-1 flex w-full flex-col border-t border-amber-100/90 pt-2 ${
          fullText ? "items-stretch gap-1.5 text-left" : "items-center gap-0.5 text-center"
        }`}
      >
        <span
          className={`w-full font-black text-slate-700 ${
            fullText ? "text-sm leading-relaxed whitespace-normal" : "max-w-full truncate text-sm leading-tight"
          }`}
          dir="ltr"
        >
          {item.transliteration}
        </span>
        {item.meaning ? (
          <span
            className={`w-full text-slate-500 ${
              fullText ? "text-xs leading-relaxed whitespace-normal sm:text-sm" : "max-w-full truncate text-xs leading-tight"
            }`}
            dir="ltr"
          >
            {item.meaning}
          </span>
        ) : null}
      </span>
    </motion.button>
  );
}

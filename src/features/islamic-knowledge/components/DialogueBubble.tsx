"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import TypewriterText from "./TypewriterText";

interface DialogueBubbleProps {
  text: string;
  emoji?: string;
  kind?: "talk" | "challenge" | "cheer" | "recap" | "hint" | "why";
  /** Name shown in the little tag above the bubble (e.g. "Noori"). */
  speaker?: string;
  onTyped?: () => void;
  /** When false the text renders instantly (used for feedback bubbles). */
  typewriter?: boolean;
}

export default function DialogueBubble({
  text,
  emoji,
  kind = "talk",
  speaker,
  onTyped,
  typewriter = true,
}: DialogueBubbleProps) {
  const reduce = useReducedMotion();
  const [skipped, setSkipped] = useState(false);
  const animated = typewriter && !skipped;

  return (
    <motion.div
      className={`ik-dialog-bubble ik-dialog-${kind}`}
      role="status"
      initial={reduce ? false : { opacity: 0, y: 18, scale: 0.86 }}
      // Spring only supports 2 keyframes — let the spring overshoot from 0.86 → 1
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      onClick={() => setSkipped(true)}
      title={animated ? "Tap to show the whole sentence" : undefined}
    >
      <span className="ik-dialog-tail" aria-hidden />
      {speaker && <span className="ik-dialog-speaker">{speaker}</span>}
      {emoji && (
        <motion.span
          className="ik-dialog-emoji"
          animate={reduce ? undefined : { rotate: [-6, 6, -4, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {emoji}
        </motion.span>
      )}
      <p className="ik-dialog-text">
        <TypewriterText text={text} active={animated} onDone={onTyped} />
      </p>
    </motion.div>
  );
}

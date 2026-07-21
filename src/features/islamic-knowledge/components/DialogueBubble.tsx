"use client";

import { motion, useReducedMotion } from "framer-motion";
import TypewriterText from "./TypewriterText";

interface DialogueBubbleProps {
  text: string;
  emoji?: string;
  kind?: "talk" | "challenge" | "cheer";
  onTyped?: () => void;
}

export default function DialogueBubble({
  text,
  emoji,
  kind = "talk",
  onTyped,
}: DialogueBubbleProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`ik-dialog-bubble ik-dialog-${kind}`}
      role="status"
      initial={reduce ? false : { opacity: 0, y: 18, scale: 0.86 }}
      animate={{ opacity: 1, y: 0, scale: [0.96, 1.04, 1] }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
    >
      <span className="ik-dialog-tail" aria-hidden />
      {emoji && (
        <motion.span
          className="ik-dialog-emoji"
          animate={reduce ? undefined : { rotate: [-6, 6, -4, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 0.7 }}
        >
          {emoji}
        </motion.span>
      )}
      <p className="ik-dialog-text">
        <TypewriterText text={text} onDone={onTyped} />
      </p>
    </motion.div>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { highlightKeywords } from "../lib/dialogue";

interface TypewriterTextProps {
  text: string;
  active?: boolean;
  onDone?: () => void;
  speedMs?: number;
}

export default function TypewriterText({
  text,
  active = true,
  onDone,
  speedMs = 26,
}: TypewriterTextProps) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (reduce || !active) {
      setCount(text.length);
      doneRef.current?.();
      return;
    }
    setCount(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        window.clearInterval(id);
        doneRef.current?.();
      }
    }, speedMs);
    return () => window.clearInterval(id);
  }, [text, active, reduce, speedMs]);

  const visible = text.slice(0, count);
  const parts = highlightKeywords(visible);

  return (
    <span className="ik-typewriter" aria-live="polite">
      {parts.map((p, idx) => (
        <motion.span
          key={`${idx}-${p.t.slice(0, 8)}`}
          className={p.hot ? "ik-hot-word" : undefined}
          initial={reduce ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
        >
          {p.t}
        </motion.span>
      ))}
      {!reduce && count < text.length && <span className="ik-caret" aria-hidden>|</span>}
    </span>
  );
}

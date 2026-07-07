"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, Play, Pause, ChevronLeft, ChevronRight, Repeat } from "lucide-react";
import type { Lesson } from "@/data/kidsStudio";
import { speakArabic, playPop, preloadArabic } from "@/lib/kidsAudio";
import Mascot from "@/components/Mascot";

interface Props {
  lesson: Lesson | null;
  onClose: () => void;
}

// ── Floating particles background ──────────────────────────────────────────
function Particles() {
  const dots = Array.from({ length: 24 });
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {dots.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.15, 0.7, 0.15],
            y: [0, -18, 0],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 5 + 2}px`,
            height: `${Math.random() * 5 + 2}px`,
            borderRadius: "50%",
            background: `hsl(${Math.random() * 60 + 40}, 100%, 75%)`,
          }}
        />
      ))}
    </div>
  );
}

export default function LessonPreviewModal({ lesson, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((arabic: string, withPop = false) => {
    if (withPop) playPop();
    speakArabic(arabic);
  }, []);

  // Reset + warm audio cache on lesson change
  useEffect(() => {
    if (lesson) {
      setIndex(0); setPlaying(true); setDirection(1);
      preloadArabic(lesson.items.map(i => i.arabic));
    }
  }, [lesson]);

  const goNext = useCallback((auto = false) => {
    if (!lesson) return;
    setDirection(1);
    setIndex(prev => {
      const next = prev + 1;
      if (next >= lesson.items.length) {
        if (auto) { setPlaying(false); return prev; }
        return 0;
      }
      return next;
    });
  }, [lesson]);

  const goPrev = useCallback(() => {
    if (!lesson) return;
    setDirection(-1);
    setIndex(prev => (prev - 1 < 0 ? lesson.items.length - 1 : prev - 1));
  }, [lesson]);

  // Speak current letter whenever index changes
  useEffect(() => {
    if (!lesson) return;
    const item = lesson.items[index];
    if (item) say(item.arabic);
  }, [index, lesson, say]);

  // Autoplay
  useEffect(() => {
    if (!lesson || !playing) return;
    timerRef.current = setTimeout(() => goNext(true), 2200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [index, playing, lesson, goNext]);

  // Keyboard
  useEffect(() => {
    if (!lesson) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose();
      else if (e.key === " ") { e.preventDefault(); setPlaying(p => !p); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lesson, goNext, goPrev, onClose]);

  if (!lesson) return null;
  const item = lesson.items[index];
  const progress = ((index + 1) / lesson.items.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16,
          background: "rgba(6, 2, 20, 0.7)", backdropFilter: "blur(6px)",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          onClick={e => e.stopPropagation()}
          style={{
            position: "relative",
            width: "100%", maxWidth: 620,
            borderRadius: 28, overflow: "hidden",
            background: lesson.bgGradient,
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Particles />

          {/* Header */}
          <div style={{
            position: "relative", zIndex: 2,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.5rem" }}>{lesson.emoji}</span>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.1 }}>
                  Lesson {lesson.id}: {lesson.title}
                </div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem" }}>
                  Live preview — this is what your students see ✨
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer",
                borderRadius: 10, width: 34, height: 34, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ position: "relative", zIndex: 2, padding: "0 20px" }}>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                style={{ height: "100%", background: "linear-gradient(90deg,#fbbf24,#f59e0b)", borderRadius: 3 }}
              />
            </div>
          </div>

          {/* Big animated letter */}
          <div style={{
            position: "relative", zIndex: 2,
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "28px 20px 8px", minHeight: 320,
          }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                initial={{ opacity: 0, x: direction * 80, scale: 0.6, rotate: direction * 8 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, x: direction * -80, scale: 0.6, rotate: direction * -8 }}
                transition={{ type: "spring", stiffness: 180, damping: 18 }}
                style={{ textAlign: "center", width: "100%" }}
              >
                {/* Cartoon sticker letter — tap to hear */}
                <motion.div
                  onClick={() => say(item.arabic, true)}
                  whileTap={{ scale: 0.86, rotate: -4 }}
                  animate={{
                    y: [0, -12, 0],
                    boxShadow: [
                      `0 10px 0 ${item.color}aa, 0 0 40px ${item.color}66`,
                      `0 14px 0 ${item.color}aa, 0 0 70px ${item.color}99`,
                      `0 10px 0 ${item.color}aa, 0 0 40px ${item.color}66`,
                    ],
                  }}
                  transition={{ y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" }, boxShadow: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }}
                  style={{
                    width: 220, height: 220, borderRadius: "42% 58% 55% 45% / 55% 45% 55% 45%",
                    margin: "0 auto 24px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#ffffff",
                    border: `8px solid ${item.color}`,
                    cursor: "pointer",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-amiri, 'Amiri', serif)",
                    fontSize: "clamp(90px, 22vw, 140px)",
                    color: item.color,
                    direction: "rtl", lineHeight: 1,
                    fontWeight: 700,
                  }}>
                    {item.arabic}
                  </span>
                </motion.div>

                {/* Label */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{ color: "#fff", fontWeight: 800, fontSize: "1.8rem", letterSpacing: "0.5px" }}
                >
                  {item.label}
                </motion.div>
                {item.urdu && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      color: "rgba(255,255,255,0.6)", fontSize: "1.3rem", marginTop: 2,
                      fontFamily: "var(--font-amiri, serif)", direction: "rtl",
                    }}
                  >
                    {item.urdu}
                  </motion.div>
                )}

                {/* Tap to hear */}
                <motion.button
                  onClick={() => say(item.arabic, true)}
                  whileTap={{ scale: 0.92 }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ opacity: { duration: 2, repeat: Infinity } }}
                  style={{
                    marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 20, padding: "7px 16px", color: "#fff", cursor: "pointer",
                    fontSize: "0.82rem", fontWeight: 600,
                  }}
                >
                  <Volume2 size={14} /> Tap to hear
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div style={{
            position: "relative", zIndex: 2,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
            padding: "8px 20px 20px",
          }}>
            <button onClick={goPrev} style={ctrlBtn}>
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() => setPlaying(p => !p)}
              style={{ ...ctrlBtn, width: 54, height: 54, background: "rgba(255,255,255,0.2)" }}
            >
              {playing ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 2 }} />}
            </button>

            <button onClick={() => goNext()} style={ctrlBtn}>
              <ChevronRight size={20} />
            </button>

            <button
              onClick={() => { setIndex(0); setPlaying(true); }}
              style={{ ...ctrlBtn, marginLeft: 8 }}
              title="Restart"
            >
              <Repeat size={17} />
            </button>
          </div>

          {/* Dots */}
          <div style={{
            position: "relative", zIndex: 2,
            display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center",
            padding: "0 24px 22px",
          }}>
            {lesson.items.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                style={{
                  width: i === index ? 22 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
                  background: i === index ? "#fbbf24" : i < index ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>

          {/* Noori peeking in the corner */}
          <div style={{ position: "absolute", left: 8, bottom: 6, zIndex: 3 }}>
            <Mascot mood="happy" size={70} position="inline" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const ctrlBtn: React.CSSProperties = {
  width: 44, height: 44, borderRadius: "50%",
  background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
  color: "#fff", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

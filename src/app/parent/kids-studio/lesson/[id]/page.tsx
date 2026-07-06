"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import LESSONS, { getLessonById } from "@/data/kidsStudio";
import type { QaidaItem, Lesson } from "@/data/kidsStudio";
import { ArrowLeft, Star, Volume2, RotateCcw, Trophy, ChevronRight } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type GamePhase = "learn" | "quiz" | "result";

interface QuizQuestion {
  correct: QaidaItem;
  options: QaidaItem[];
}

// ── Utility: shuffle array ─────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Confetti Burst ─────────────────────────────────────────────────────────
function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = Array.from({ length: 40 });
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      {pieces.map((_, i) => {
        const colors = ["#FFD700", "#FF6B9D", "#7C3AED", "#22C55E", "#F97316", "#06B6D4", "#EF4444"];
        const color  = colors[i % colors.length];
        const left   = `${Math.random() * 100}%`;
        const delay  = Math.random() * 0.5;
        const dur    = Math.random() * 1.5 + 1;
        return (
          <motion.div
            key={i}
            initial={{ y: "-10%", x: left, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ y: "110vh", opacity: [1, 1, 0], rotate: Math.random() * 720 - 360, scale: [1, 1.2, 0.5] }}
            transition={{ duration: dur, delay, ease: "easeIn" }}
            style={{
              position: "absolute", top: 0, left,
              width: Math.random() * 10 + 6 + "px",
              height: Math.random() * 10 + 6 + "px",
              background: color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        );
      })}
    </div>
  );
}

// ── Star Burst (inline) ────────────────────────────────────────────────────
function StarBurst({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={i <= count ? { scale: [0, 1.4, 1], rotate: 0 } : { scale: 0.4, rotate: 0 }}
          transition={{ delay: (i - 1) * 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
          style={{ fontSize: "2.5rem", filter: i <= count ? "none" : "grayscale(1) opacity(0.3)" }}
        >⭐</motion.div>
      ))}
    </div>
  );
}

// ── Main Game Component ─────────────────────────────────────────────────────
export default function LessonGamePage() {
  const { id }  = useParams();
  const router  = useRouter();
  const lessonId = parseInt(String(id));
  const lesson  = getLessonById(lessonId) as Lesson | undefined;

  const [studentId,   setStudentId]   = useState<string | null>(null);
  const [phase,       setPhase]       = useState<GamePhase>("learn");
  const [learnIndex,  setLearnIndex]  = useState(0);
  const [questions,   setQuestions]   = useState<QuizQuestion[]>([]);
  const [qIndex,      setQIndex]      = useState(0);
  const [selected,    setSelected]    = useState<string | null>(null);
  const [isCorrect,   setIsCorrect]   = useState<boolean | null>(null);
  const [score,       setScore]       = useState(0);
  const [showConfetti,setShowConfetti]= useState(false);
  const [saving,      setSaving]      = useState(false);
  const [prevStars,   setPrevStars]   = useState(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Check lesson access & get student
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("parent_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!student) { router.replace("/parent/kids-studio"); return; }

      const { data: asgn } = await supabase
        .from("kids_studio_assignments")
        .select("lesson_unlocked_up_to")
        .eq("student_id", student.id)
        .eq("is_active", true)
        .single();

      if (!asgn || lessonId > asgn.lesson_unlocked_up_to) {
        router.replace("/parent/kids-studio");
        return;
      }

      setStudentId(student.id);

      // Fetch previous stars
      const { data: prog } = await supabase
        .from("kids_studio_progress")
        .select("stars_earned")
        .eq("student_id", student.id)
        .eq("lesson_id", lessonId)
        .single();

      setPrevStars(prog?.stars_earned || 0);
    }
    init();
    synthRef.current = window.speechSynthesis;
  }, [lessonId, router]);

  // Build quiz questions from lesson items
  const buildQuiz = useCallback(() => {
    if (!lesson) return;
    const allItems = lesson.items;
    const pool = allItems.length >= 4 ? allItems : [...allItems, ...allItems, ...allItems].slice(0, Math.max(allItems.length, 8));
    const qs: QuizQuestion[] = shuffle(pool.slice(0, Math.min(pool.length, 10))).map(correct => {
      const distractors = shuffle(allItems.filter(it => it.arabic !== correct.arabic)).slice(0, 2);
      const options = shuffle([correct, ...distractors]);
      return { correct, options };
    });
    setQuestions(qs);
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setIsCorrect(null);
  }, [lesson]);

  // ── Speak a word via Web Speech API ──────────────────────────────────────
  function speak(text: string) {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ar-SA";
    utt.rate = 0.75;
    utt.pitch = 1.1;
    synthRef.current.speak(utt);
  }

  // ── Answer a quiz question ────────────────────────────────────────────────
  function handleAnswer(arabic: string) {
    if (selected !== null) return;
    const correct = questions[qIndex]?.correct.arabic;
    const right   = arabic === correct;
    setSelected(arabic);
    setIsCorrect(right);
    if (right) {
      setScore(s => s + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    // Auto advance
    setTimeout(() => {
      setSelected(null);
      setIsCorrect(null);
      if (qIndex + 1 >= questions.length) {
        finishQuiz(right ? score + 1 : score);
      } else {
        setQIndex(i => i + 1);
      }
    }, 1100);
  }

  // ── Finish quiz & save progress ───────────────────────────────────────────
  async function finishQuiz(finalScore: number) {
    setPhase("result");
    const starsEarned = finalScore >= questions.length * 0.85
      ? 3 : finalScore >= questions.length * 0.6 ? 2 : 1;

    if (!studentId) return;
    setSaving(true);

    const bestStars = Math.max(starsEarned, prevStars);
    const xp = starsEarned * 10 + finalScore * 5;

    await supabase.from("kids_studio_progress").upsert({
      student_id: studentId,
      lesson_id: lessonId,
      stars_earned: bestStars,
      xp_earned: xp,
      is_completed: true,
      attempts: 1,
      last_played: new Date().toISOString(),
    }, { onConflict: "student_id,lesson_id" });

    setSaving(false);
    setPrevStars(bestStars);

    // Trigger final confetti for 3 stars
    if (starsEarned === 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }

  if (!lesson) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1e0a3d" }}>
        <div style={{ color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>😕</div>
          <p>Lesson not found.</p>
          <button onClick={() => router.back()} style={{ marginTop: 12, color: "#a78bfa", background: "none", border: "none", cursor: "pointer" }}>← Go Back</button>
        </div>
      </div>
    );
  }

  const currentItem    = lesson.items[learnIndex];
  const currentQ       = questions[qIndex];
  const finalScore     = score;
  const starsEarned    = finalScore >= questions.length * 0.85 ? 3 : finalScore >= questions.length * 0.6 ? 2 : 1;
  const nextLesson     = getLessonById(lessonId + 1);

  return (
    <div style={{
      minHeight: "100vh",
      background: lesson.bgGradient,
      position: "relative", overflowX: "hidden",
    }}>
      <ConfettiBurst active={showConfetti} />

      {/* ── Top Bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button
          onClick={() => router.push("/parent/kids-studio")}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}
        >
          <ArrowLeft size={14} /> Map
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>
            {lesson.emoji} {lesson.title}
          </span>
        </div>
        {/* Phase tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["learn", "quiz"] as const).map(p => (
            <div key={p} style={{
              padding: "4px 12px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 600,
              background: phase === p ? "rgba(255,255,255,0.2)" : "transparent",
              color: phase === p ? "#fff" : "rgba(255,255,255,0.4)",
              border: phase === p ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
            }}>{p === "learn" ? "📖 Learn" : "🎯 Quiz"}</div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* ══════════════════════════════════════════════════════
            PHASE: LEARN
        ══════════════════════════════════════════════════════ */}
        {phase === "learn" && (
          <motion.div
            key={`learn-${learnIndex}`}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 18 }}
          >
            {/* Progress dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
              {lesson.items.map((_, i) => (
                <div key={i} style={{
                  width: i === learnIndex ? 20 : 8, height: 8, borderRadius: 4,
                  background: i < learnIndex ? "#22c55e" : i === learnIndex ? "#fff" : "rgba(255,255,255,0.25)",
                  transition: "all 0.3s ease",
                }} />
              ))}
            </div>

            {/* Letter Card */}
            <div
              onClick={() => speak(currentItem.label)}
              style={{
                textAlign: "center",
                background: `linear-gradient(145deg, ${currentItem.color}25, rgba(255,255,255,0.08))`,
                border: `2px solid ${currentItem.color}60`,
                borderRadius: 28,
                padding: "48px 32px",
                cursor: "pointer",
                boxShadow: `0 0 40px ${currentItem.color}30, 0 20px 60px rgba(0,0,0,0.4)`,
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                marginBottom: 20,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1.03)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "";
              }}
            >
              {/* Arabic letter */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                style={{
                  fontFamily: "var(--font-amiri, 'Amiri', serif)",
                  fontSize: "clamp(100px, 20vw, 160px)",
                  lineHeight: 1.1,
                  color: currentItem.color,
                  textShadow: `0 0 40px ${currentItem.color}80, 0 0 80px ${currentItem.color}40`,
                  direction: "rtl",
                  marginBottom: 16,
                  display: "block",
                }}
              >
                {currentItem.arabic}
              </motion.div>

              {/* Label */}
              <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "0.02em", marginBottom: 6 }}>
                {currentItem.label}
              </div>
              {currentItem.urdu && (
                <div style={{
                  color: "rgba(255,255,255,0.5)", fontSize: "1.1rem",
                  fontFamily: "var(--font-amiri, serif)", direction: "rtl",
                }}>
                  {currentItem.urdu}
                </div>
              )}

              {/* Tap hint */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ marginTop: 20, color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Volume2 size={14} /> Tap to hear
              </motion.div>
            </div>

            {/* Item counter */}
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: 20 }}>
              {learnIndex + 1} / {lesson.items.length}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 12 }}>
              {learnIndex > 0 && (
                <button
                  onClick={() => setLearnIndex(i => i - 1)}
                  style={{
                    flex: 1, padding: "14px", borderRadius: 14,
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
                  }}
                >
                  ← Back
                </button>
              )}

              {learnIndex < lesson.items.length - 1 ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setLearnIndex(i => i + 1); speak(lesson.items[learnIndex + 1].label); }}
                  style={{
                    flex: 2, padding: "14px", borderRadius: 14,
                    background: `linear-gradient(135deg, ${currentItem.color}, ${currentItem.color}cc)`,
                    border: "none", color: "#fff", fontWeight: 800, cursor: "pointer",
                    fontSize: "0.95rem", boxShadow: `0 8px 24px ${currentItem.color}40`,
                  }}
                >
                  Next Letter →
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { buildQuiz(); setPhase("quiz"); }}
                  style={{
                    flex: 2, padding: "14px", borderRadius: 14,
                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                    border: "none", color: "#fff", fontWeight: 800, cursor: "pointer",
                    fontSize: "0.95rem", boxShadow: "0 8px 24px rgba(124,58,237,0.5)",
                  }}
                >
                  🎯 Start Quiz!
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════
            PHASE: QUIZ
        ══════════════════════════════════════════════════════ */}
        {phase === "quiz" && currentQ && (
          <motion.div
            key={`quiz-${qIndex}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            {/* Quiz header */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginBottom: 6 }}>
                Question {qIndex + 1} of {questions.length}
              </div>
              {/* Quiz progress bar */}
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)", overflow: "hidden", maxWidth: 300, margin: "0 auto 16px" }}>
                <motion.div
                  initial={{ width: `${((qIndex) / questions.length) * 100}%` }}
                  animate={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
                  style={{
                    height: "100%", borderRadius: 3,
                    background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                  }}
                />
              </div>
              {/* Score */}
              <div style={{
                display: "inline-flex", gap: 6, alignItems: "center",
                background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "6px 14px",
              }}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <span style={{ color: "#FFD700", fontWeight: 700, fontSize: "0.85rem" }}>{score} correct</span>
              </div>
            </div>

            {/* Question: big letter display */}
            <div style={{
              textAlign: "center",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 24, padding: "32px",
              marginBottom: 24,
            }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: 12 }}>
                Which one is this?
              </div>
              <div style={{
                fontFamily: "var(--font-amiri, 'Amiri', serif)",
                fontSize: "clamp(80px, 18vw, 130px)",
                lineHeight: 1.1,
                color: "#FFD700",
                textShadow: "0 0 30px rgba(255,215,0,0.5)",
                direction: "rtl",
              }}>
                {currentQ.correct.arabic}
              </div>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
              >
                <Volume2 size={12} />
                <button
                  onClick={() => speak(currentQ.correct.label)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "0.75rem" }}
                >
                  Hear sound
                </button>
              </motion.div>
            </div>

            {/* Answer options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {currentQ.options.map((opt) => {
                const isSelected = selected === opt.arabic;
                const isRight    = opt.arabic === currentQ.correct.arabic;
                let bg = "rgba(255,255,255,0.08)";
                let border = "1px solid rgba(255,255,255,0.15)";
                let glow = "";
                if (isSelected && isRight)  { bg = "rgba(34,197,94,0.25)";  border = "2px solid #22c55e"; glow = "0 0 20px rgba(34,197,94,0.5)"; }
                if (isSelected && !isRight) { bg = "rgba(239,68,68,0.25)";  border = "2px solid #ef4444"; glow = "0 0 20px rgba(239,68,68,0.4)"; }
                if (!isSelected && selected && isRight) { bg = "rgba(34,197,94,0.15)"; border = "2px solid #22c55e44"; }

                return (
                  <motion.button
                    key={opt.arabic}
                    whileTap={selected === null ? { scale: 0.95 } : {}}
                    animate={isSelected && !isRight ? { x: [-6, 6, -6, 6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleAnswer(opt.arabic)}
                    style={{
                      padding: "20px 12px", borderRadius: 18, cursor: selected ? "default" : "pointer",
                      background: bg, border,
                      boxShadow: glow || "none",
                      textAlign: "center", transition: "background 0.2s, border 0.2s",
                      position: "relative",
                    }}
                  >
                    {/* Letter */}
                    <div style={{
                      fontFamily: "var(--font-amiri, 'Amiri', serif)",
                      fontSize: "clamp(36px, 9vw, 56px)",
                      lineHeight: 1.2,
                      color: isSelected && isRight ? "#22c55e" : isSelected && !isRight ? "#ef4444" : opt.color,
                      direction: "rtl",
                      marginBottom: 6,
                    }}>
                      {opt.arabic}
                    </div>
                    {/* Label */}
                    <div style={{
                      fontSize: "0.75rem", fontWeight: 600,
                      color: "rgba(255,255,255,0.7)",
                    }}>
                      {opt.label}
                    </div>
                    {/* Tick / Cross */}
                    {isSelected && (
                      <div style={{
                        position: "absolute", top: 8, right: 10,
                        fontSize: "1.1rem",
                      }}>
                        {isRight ? "✅" : "❌"}
                      </div>
                    )}
                    {!isSelected && selected && isRight && (
                      <div style={{ position: "absolute", top: 8, right: 10, fontSize: "1.1rem" }}>✅</div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════
            PHASE: RESULT
        ══════════════════════════════════════════════════════ */}
        {phase === "result" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            style={{ textAlign: "center" }}
          >
            {/* Trophy / result emoji */}
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0], y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              style={{ fontSize: "5rem", marginBottom: 16 }}
            >
              {starsEarned === 3 ? "🏆" : starsEarned === 2 ? "🎉" : "💪"}
            </motion.div>

            <h2 style={{
              color: "#fff", fontFamily: "Georgia, serif",
              fontSize: "1.8rem", marginBottom: 8,
            }}>
              {starsEarned === 3 ? "Amazing! Perfect!" : starsEarned === 2 ? "Great Job!" : "Well Done!"}
            </h2>

            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24, fontSize: "0.9rem" }}>
              You got <strong style={{ color: "#FFD700" }}>{finalScore}</strong> out of <strong style={{ color: "#FFD700" }}>{questions.length}</strong> correct
            </p>

            {/* Stars */}
            <div style={{ marginBottom: 28 }}>
              <StarBurst count={starsEarned} />
            </div>

            {/* XP earned */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))",
                border: "1px solid rgba(251,191,36,0.4)", borderRadius: 20, padding: "10px 24px",
                marginBottom: 32,
              }}
            >
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <span style={{ color: "#FFD700", fontWeight: 800, fontSize: "1rem" }}>
                +{starsEarned * 10 + finalScore * 5} XP earned!
              </span>
            </motion.div>

            {saving && (
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", marginBottom: 16 }}>Saving progress...</p>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320, margin: "0 auto" }}>
              {/* Next lesson */}
              {nextLesson && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push(`/parent/kids-studio/lesson/${lessonId + 1}`)}
                  style={{
                    padding: "14px 24px", borderRadius: 14,
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    border: "none", color: "#fff", fontWeight: 800, cursor: "pointer",
                    fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
                  }}
                >
                  Next Lesson: {nextLesson.emoji} {nextLesson.title} <ChevronRight size={16} />
                </motion.button>
              )}

              {/* Replay */}
              <button
                onClick={() => { setPhase("learn"); setLearnIndex(0); setScore(0); setSelected(null); setIsCorrect(null); }}
                style={{
                  padding: "12px 24px", borderRadius: 14,
                  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff", fontWeight: 600, cursor: "pointer",
                  fontSize: "0.88rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <RotateCcw size={14} /> Play Again
              </button>

              {/* Back to map */}
              <button
                onClick={() => router.push("/parent/kids-studio")}
                style={{
                  padding: "12px 24px", borderRadius: 14,
                  background: "transparent", border: "none",
                  color: "rgba(255,255,255,0.5)", cursor: "pointer",
                  fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <Trophy size={14} /> Back to Map
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

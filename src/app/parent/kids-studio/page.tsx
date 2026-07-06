"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LESSONS, { TOTAL_LESSONS } from "@/data/kidsStudio";
import { Lock, Star, Play, BookOpen, Trophy } from "lucide-react";

interface Progress {
  lesson_id: number;
  stars_earned: number;
  is_completed: boolean;
}

interface Assignment {
  lesson_unlocked_up_to: number;
  is_active: boolean;
  tutor_name: string;
}

// ── Stars display ──────────────────────────────────────────────────────────
function Stars({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ fontSize: "1.1rem", filter: i < count ? "none" : "grayscale(1) opacity(0.3)" }}>⭐</span>
      ))}
    </div>
  );
}

// ── Animated background particles ─────────────────────────────────────────
function StarParticles() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${Math.random() * 4 + 2}px`,
          height: `${Math.random() * 4 + 2}px`,
          borderRadius: "50%",
          background: `hsl(${Math.random() * 60 + 40}, 100%, 80%)`,
          animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 3}s`,
          opacity: Math.random() * 0.7 + 0.3,
        }} />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes bounceIn {
          0%   { transform: scale(0.5) translateY(20px); opacity: 0; }
          70%  { transform: scale(1.1) translateY(-4px); }
          100% { transform: scale(1)   translateY(0);    opacity: 1; }
        }
        @keyframes shimmer {
          0%, 100% { box-shadow: 0 0 15px rgba(196,181,253,0.4); }
          50%       { box-shadow: 0 0 30px rgba(196,181,253,0.9), 0 0 60px rgba(168,85,247,0.4); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(168,85,247,0.5); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 12px rgba(168,85,247,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(168,85,247,0); }
        }
      `}</style>
    </div>
  );
}

export default function KidsStudioMapPage() {
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [progress,   setProgress]   = useState<Record<number, Progress>>({});
  const [studentName, setStudentName] = useState("Explorer");
  const [loading,    setLoading]    = useState(true);
  const [noAccess,   setNoAccess]   = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      // Get parent's student
      const { data: profile } = await supabase.from("profiles").select("id, role, full_name").eq("id", user.id).single();
      if (!profile) { router.replace("/login"); return; }

      let studentId: string | null = null;

      if (profile.role === "parent") {
        const { data: student } = await supabase
          .from("students")
          .select("id, full_name")
          .eq("parent_id", user.id)
          .eq("is_active", true)
          .order("created_at")
          .limit(1)
          .single();
        if (student) {
          studentId = student.id;
          setStudentName(student.full_name.split(" ")[0]);
        }
      }

      if (!studentId) { setNoAccess(true); setLoading(false); return; }

      // Get assignment
      const { data: asgn } = await supabase
        .from("kids_studio_assignments")
        .select("lesson_unlocked_up_to, is_active, tutor:profiles!kids_studio_assignments_tutor_id_fkey(full_name)")
        .eq("student_id", studentId)
        .eq("is_active", true)
        .single();

      if (!asgn) { setNoAccess(true); setLoading(false); return; }

      setAssignment({
        lesson_unlocked_up_to: asgn.lesson_unlocked_up_to,
        is_active: asgn.is_active,
        tutor_name: (asgn as any).tutor?.full_name || "Your Tutor",
      });

      // Get progress
      const { data: prog } = await supabase
        .from("kids_studio_progress")
        .select("lesson_id, stars_earned, is_completed")
        .eq("student_id", studentId);

      const map: Record<number, Progress> = {};
      (prog || []).forEach((p: Progress) => { map[p.lesson_id] = p; });
      setProgress(map);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #0a0020 0%, #1e0a3d 50%, #0d0d2b 100%)",
        flexDirection: "column", gap: 20,
      }}>
        <div style={{ fontSize: "4rem", animation: "float 2s ease-in-out infinite" }}>🌙</div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif" }}>Loading your adventure...</p>
        <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }`}</style>
      </div>
    );
  }

  if (noAccess || !assignment) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #0a0020 0%, #1e0a3d 50%, #0d0d2b 100%)",
        flexDirection: "column", gap: 16, padding: 24, textAlign: "center",
      }}>
        <div style={{ fontSize: "4rem" }}>🔒</div>
        <h2 style={{ color: "#fff", fontFamily: "Georgia, serif", fontSize: "1.5rem" }}>Kids Studio Not Yet Active</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 400 }}>
          Your child has not been assigned to Kids Studio yet. Please ask your NoorPath admin or tutor to activate it.
        </p>
      </div>
    );
  }

  const totalStars = Object.values(progress).reduce((s, p) => s + p.stars_earned, 0);
  const completedCount = Object.values(progress).filter(p => p.is_completed).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0020 0%, #1e0a3d 40%, #0d1b4b 70%, #0a2233 100%)",
      position: "relative", overflowX: "hidden",
    }}>
      <StarParticles />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {/* Moon + Title */}
          <div style={{ fontSize: "3.5rem", animation: "float 3s ease-in-out infinite", display: "inline-block", marginBottom: 8 }}>🌙</div>
          <h1 style={{
            fontFamily: "'Georgia', serif",
            fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
            color: "#fff",
            margin: 0, lineHeight: 1.2,
            textShadow: "0 0 30px rgba(196,181,253,0.5)",
          }}>
            {studentName}&apos;s Quran Adventure
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: "0.9rem" }}>
            Tap a lesson to start learning ✨
          </p>

          {/* Stats bar */}
          <div style={{
            display: "inline-flex", gap: 24, marginTop: 20,
            background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 50, padding: "12px 28px",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#FFD700", fontWeight: 800, fontSize: "1.2rem" }}>⭐ {totalStars}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.68rem" }}>Stars</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#34d399", fontWeight: 800, fontSize: "1.2rem" }}>✅ {completedCount}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.68rem" }}>Done</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#a78bfa", fontWeight: 800, fontSize: "1.2rem" }}>📖 {assignment.lesson_unlocked_up_to}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.68rem" }}>Unlocked</div>
            </div>
          </div>
        </div>

        {/* ── Overall Progress Bar ── */}
        <div style={{
          background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: "16px 20px", marginBottom: 32,
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", fontWeight: 600 }}>
              Overall Journey
            </span>
            <span style={{ color: "#a78bfa", fontSize: "0.82rem", fontWeight: 700 }}>
              {completedCount}/{TOTAL_LESSONS} Lessons
            </span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 5,
              background: "linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)",
              width: `${Math.round((completedCount / TOTAL_LESSONS) * 100)}%`,
              transition: "width 0.6s ease",
              boxShadow: "0 0 10px rgba(168,85,247,0.6)",
            }} />
          </div>
        </div>

        {/* ── Lesson Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 16,
        }}>
          {LESSONS.map((lesson, index) => {
            const isUnlocked  = lesson.id <= assignment.lesson_unlocked_up_to;
            const prog        = progress[lesson.id];
            const isCompleted = prog?.is_completed || false;
            const stars       = prog?.stars_earned || 0;
            const isCurrent   = !isCompleted && isUnlocked && (lesson.id === 1 || progress[lesson.id - 1]?.is_completed);

            return (
              <div
                key={lesson.id}
                onClick={() => isUnlocked && router.push(`/parent/kids-studio/lesson/${lesson.id}`)}
                style={{
                  borderRadius: 20,
                  padding: "20px 16px",
                  textAlign: "center",
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  animation: isUnlocked ? `bounceIn 0.5s ease both ${index * 0.05}s` : "none",
                  background: isUnlocked
                    ? isCompleted
                      ? `linear-gradient(135deg, ${lesson.color}25, ${lesson.color}15)`
                      : isCurrent
                        ? `linear-gradient(135deg, ${lesson.color}40, ${lesson.color}20)`
                        : `linear-gradient(135deg, ${lesson.color}20, rgba(255,255,255,0.05))`
                    : "rgba(255,255,255,0.04)",
                  border: isUnlocked
                    ? isCurrent
                      ? `2px solid ${lesson.color}`
                      : isCompleted
                        ? `1px solid ${lesson.color}60`
                        : `1px solid ${lesson.color}30`
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isCurrent ? `0 0 20px ${lesson.color}40, 0 8px 24px rgba(0,0,0,0.3)` : "0 4px 16px rgba(0,0,0,0.2)",
                  ...(isCurrent ? { animation: `shimmer 2s ease-in-out infinite` } : {}),
                }}
                onMouseEnter={e => {
                  if (isUnlocked) {
                    (e.currentTarget as HTMLDivElement).style.transform = "scale(1.06) translateY(-4px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${lesson.color}60, 0 16px 32px rgba(0,0,0,0.4)`;
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = isCurrent
                    ? `0 0 20px ${lesson.color}40, 0 8px 24px rgba(0,0,0,0.3)`
                    : "0 4px 16px rgba(0,0,0,0.2)";
                }}
              >
                {/* Completed ribbon */}
                {isCompleted && (
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    background: "#22c55e", borderRadius: 50, width: 22, height: 22,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.7rem", fontWeight: 900, color: "#fff",
                  }}>✓</div>
                )}

                {/* Current indicator */}
                {isCurrent && (
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    background: lesson.color, borderRadius: 50, width: 10, height: 10,
                    animation: "pulse-ring 1.5s ease-in-out infinite",
                  }} />
                )}

                {/* Lesson number */}
                <div style={{
                  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em",
                  color: isUnlocked ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                  marginBottom: 4,
                }}>
                  LESSON {lesson.id}
                </div>

                {/* Emoji */}
                <div style={{
                  fontSize: "2.2rem", marginBottom: 8,
                  filter: isUnlocked ? "none" : "grayscale(1) opacity(0.3)",
                }}>
                  {isUnlocked ? lesson.emoji : "🔒"}
                </div>

                {/* Title */}
                <div style={{
                  fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.3, marginBottom: 8,
                  color: isUnlocked ? "#fff" : "rgba(255,255,255,0.25)",
                }}>
                  {lesson.title}
                </div>

                {/* Stars */}
                {isUnlocked && <Stars count={stars} />}

                {/* Play button for current / unlocked */}
                {isUnlocked && (
                  <div style={{
                    marginTop: 12,
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: isCurrent ? lesson.color : "rgba(255,255,255,0.12)",
                    borderRadius: 20, padding: "6px 14px",
                    color: "#fff", fontSize: "0.72rem", fontWeight: 700,
                  }}>
                    {isCompleted
                      ? <><BookOpen size={12} /> Replay</>
                      : isCurrent
                        ? <><Play size={12} style={{ fill: "#fff" }} /> Play Now!</>
                        : <><Play size={12} /> Start</>
                    }
                  </div>
                )}

                {/* Locked */}
                {!isUnlocked && (
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                    <Lock size={16} color="rgba(255,255,255,0.2)" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Trophy section (all complete) ── */}
        {completedCount === assignment.lesson_unlocked_up_to && completedCount > 0 && (
          <div style={{
            marginTop: 32, textAlign: "center",
            background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))",
            border: "1px solid rgba(251,191,36,0.3)", borderRadius: 20, padding: 24,
          }}>
            <div style={{ fontSize: "3rem", marginBottom: 8 }}>🏆</div>
            <h3 style={{ color: "#fbbf24", fontFamily: "Georgia, serif", fontSize: "1.3rem", marginBottom: 8 }}>
              Amazing! You finished all unlocked lessons!
            </h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
              Ask your teacher to unlock more lessons for you 🌟
            </p>
          </div>
        )}

        {/* ── Tutor info footer ── */}
        <div style={{
          marginTop: 32, textAlign: "center",
          color: "rgba(255,255,255,0.3)", fontSize: "0.75rem",
        }}>
          <Trophy size={12} style={{ display: "inline", marginRight: 4 }} />
          Your tutor: <span style={{ color: "rgba(255,255,255,0.5)" }}>{assignment.tutor_name}</span>
        </div>

      </div>
    </div>
  );
}

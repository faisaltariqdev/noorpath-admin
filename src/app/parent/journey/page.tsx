"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import ParentStudentSwitcher from "@/components/ParentStudentSwitcher";
import { Star, Trophy, Zap, BookOpen, CheckCircle, Lock, Award, TrendingUp } from "lucide-react";

interface StudentSummary {
  id: string;
  full_name: string;
  level?: string | null;
  course?: string | null;
}

interface Report {
  id: string;
  overall_rating: string;
  tajweed_stars?: number;
  surah_covered?: string;
  pages_covered?: string;
  created_at: string;
}

interface Attendance {
  id: string;
  status: string;
  session_date?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  achieved: boolean;
  xp: number;
  color: string;
  badge?: string;
}

const LEVEL_THRESHOLDS = [
  { level: 1, title: "Seeker of Light",    arabic: "طالب النور",    minXP: 0,    color: "#94a3b8", bg: "#f8fafc" },
  { level: 2, title: "Student of Quran",   arabic: "طالب القرآن",   minXP: 100,  color: "#3b82f6", bg: "#eff6ff" },
  { level: 3, title: "Quran Explorer",     arabic: "مستكشف القرآن", minXP: 250,  color: "#8b5cf6", bg: "#f5f3ff" },
  { level: 4, title: "Hafiz Aspirant",     arabic: "متحفظ القرآن",  minXP: 500,  color: "#f59e0b", bg: "#fffbeb" },
  { level: 5, title: "Tajweed Master",     arabic: "ماهر التجويد",  minXP: 800,  color: "#10b981", bg: "#ecfdf5" },
  { level: 6, title: "Quran Scholar",      arabic: "عالم القرآن",   minXP: 1200, color: "#1b5e42", bg: "#f0fdf4" },
  { level: 7, title: "Noor Ambassador",    arabic: "سفير النور",    minXP: 2000, color: "#c9a84c", bg: "#fffbeb" },
];

function StarRating({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < count ? "#c9a84c" : "none"}
          stroke={i < count ? "#c9a84c" : "#cbd5e1"}
        />
      ))}
    </span>
  );
}

export default function JourneyPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: studs } = await supabase
        .from("students")
        .select("id, full_name, level, course")
        .eq("parent_id", user.id)
        .eq("is_active", true)
        .order("full_name");
      const mapped = (studs || []) as StudentSummary[];
      setStudents(mapped);
      setSelectedId(mapped[0]?.id || "");
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    async function loadData() {
      const [{ data: rpts }, { data: att }] = await Promise.all([
        supabase.from("progress_reports").select("id,overall_rating,tajweed_stars,surah_covered,pages_covered,created_at").eq("student_id", selectedId).order("created_at"),
        supabase.from("attendance").select("id,status,session_date").eq("student_id", selectedId),
      ]);
      setReports((rpts || []) as Report[]);
      setAttendance((att || []) as Attendance[]);
    }
    loadData();
  }, [selectedId]);

  const totalReports = reports.length;
  const excellentCount = reports.filter(r => r.overall_rating === "excellent").length;
  const avgTajweed = reports.length > 0 ? reports.reduce((s, r) => s + (r.tajweed_stars || 0), 0) / reports.length : 0;
  const presentCount = attendance.filter(a => a.status === "present").length;
  const totalAtt = attendance.length;
  const attendanceRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;
  const uniqueSurahs = [...new Set(reports.map(r => r.surah_covered).filter(Boolean))].length;

  // XP Calculation
  const xp = (totalReports * 20) + (excellentCount * 30) + (presentCount * 15) + (uniqueSurahs * 25) + (Math.round(avgTajweed) * 10);

  // Current level
  const currentLevel = LEVEL_THRESHOLDS.slice().reverse().find(l => xp >= l.minXP) || LEVEL_THRESHOLDS[0];
  const nextLevel = LEVEL_THRESHOLDS[currentLevel.level] || null;
  const progressToNext = nextLevel ? Math.min(100, Math.round(((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100)) : 100;

  const milestones: Milestone[] = [
    {
      id: "first_class",
      title: "First Class Completed",
      description: "Attended the very first Quran class",
      icon: <BookOpen size={20} />,
      achieved: totalReports >= 1,
      xp: 50,
      color: "#3b82f6",
      badge: "🌱",
    },
    {
      id: "five_classes",
      title: "5 Classes Strong",
      description: "Completed 5 Quran lessons",
      icon: <Zap size={20} />,
      achieved: totalReports >= 5,
      xp: 100,
      color: "#8b5cf6",
      badge: "⚡",
    },
    {
      id: "first_surah",
      title: "First Surah Mastered",
      description: "Covered a complete Surah in class",
      icon: <Star size={20} />,
      achieved: uniqueSurahs >= 1,
      xp: 80,
      color: "#f59e0b",
      badge: "⭐",
    },
    {
      id: "attendance_streak",
      title: "Perfect Attendee",
      description: "90%+ attendance rate achieved",
      icon: <CheckCircle size={20} />,
      achieved: attendanceRate >= 90,
      xp: 150,
      color: "#10b981",
      badge: "✅",
    },
    {
      id: "tajweed_star",
      title: "Tajweed Star",
      description: "Average Tajweed rating of 4+ stars",
      icon: <Star size={20} />,
      achieved: avgTajweed >= 4,
      xp: 200,
      color: "#c9a84c",
      badge: "🌟",
    },
    {
      id: "ten_reports",
      title: "Dedicated Learner",
      description: "Completed 10 progress reports",
      icon: <TrendingUp size={20} />,
      achieved: totalReports >= 10,
      xp: 200,
      color: "#1b5e42",
      badge: "📚",
    },
    {
      id: "excellent_streak",
      title: "Excellence Award",
      description: "Received 3 Excellent ratings",
      icon: <Trophy size={20} />,
      achieved: excellentCount >= 3,
      xp: 250,
      color: "#c9a84c",
      badge: "🏆",
    },
    {
      id: "five_surahs",
      title: "Surah Champion",
      description: "Covered 5 different Surahs",
      icon: <Award size={20} />,
      achieved: uniqueSurahs >= 5,
      xp: 300,
      color: "#7c3aed",
      badge: "🏅",
    },
  ];

  const achievedMilestones = milestones.filter(m => m.achieved).length;

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Learning Journey" subtitle="Gamified progress tracker" />

      <div className="page-content">
        {students.length > 1 && (
          <ParentStudentSwitcher
            students={students}
            selectedId={selectedId}
            onChange={setSelectedId}
          />
        )}

        {/* XP & Level Card */}
        <div style={{
          background: `linear-gradient(135deg, ${currentLevel.color}22, ${currentLevel.color}08)`,
          border: `2px solid ${currentLevel.color}33`,
          borderRadius: "var(--radius-lg)",
          padding: "28px 32px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, fontSize: 120, opacity: 0.06, userSelect: "none" }}>
            🌟
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: currentLevel.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, flexShrink: 0,
              boxShadow: `0 0 0 6px ${currentLevel.color}22`,
            }}>
              🌙
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: currentLevel.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Level {currentLevel.level}
              </div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: 2, color: "var(--charcoal)" }}>{currentLevel.title}</h2>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "1rem", color: currentLevel.color, marginBottom: 12, direction: "rtl", textAlign: "right" }}>
                {currentLevel.arabic}
              </div>
              {nextLevel && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.78rem", color: "var(--muted)" }}>
                    <span>{xp} XP earned</span>
                    <span>{nextLevel.minXP} XP for Level {nextLevel.level}</span>
                  </div>
                  <div style={{ background: "#e2e8f0", borderRadius: 999, height: 10, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${progressToNext}%`,
                      background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}cc)`,
                      borderRadius: 999,
                      transition: "width 1s ease",
                    }} />
                  </div>
                  <div style={{ marginTop: 6, fontSize: "0.75rem", color: "var(--muted)" }}>
                    {progressToNext}% to {nextLevel.title}
                  </div>
                </>
              )}
              {!nextLevel && (
                <div style={{ marginTop: 8, color: "#c9a84c", fontWeight: 700, fontSize: "0.88rem" }}>
                  🎉 Maximum Level Achieved — True Noor Ambassador!
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: currentLevel.color, lineHeight: 1 }}>{xp}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total XP</div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: "Classes Done",     value: totalReports,     icon: "📖", color: "#3b82f6" },
            { label: "Attendance Rate",  value: `${attendanceRate}%`, icon: "✅", color: "#10b981" },
            { label: "Surahs Covered",   value: uniqueSurahs,     icon: "📿", color: "#8b5cf6" },
            { label: "Avg Tajweed",      value: `${avgTajweed.toFixed(1)}★`, icon: "⭐", color: "#c9a84c" },
          ].map(stat => (
            <div key={stat.label} className="stat-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Achievement Badges</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>
                {achievedMilestones} of {milestones.length} badges unlocked
              </p>
            </div>
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#15803d",
            }}>
              {Math.round((achievedMilestones / milestones.length) * 100)}% Complete
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {milestones.map(m => (
              <div key={m.id} style={{
                background: m.achieved ? `${m.color}0a` : "#f8fafc",
                border: `1.5px solid ${m.achieved ? m.color + "44" : "#e2e8f0"}`,
                borderRadius: "var(--radius)",
                padding: "20px 16px",
                textAlign: "center",
                transition: "transform 0.2s, box-shadow 0.2s",
                opacity: m.achieved ? 1 : 0.55,
                cursor: "default",
              }}>
                <div style={{
                  fontSize: 40,
                  marginBottom: 8,
                  filter: m.achieved ? "none" : "grayscale(1)",
                }}>
                  {m.badge}
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: m.achieved ? m.color : "#e2e8f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: m.achieved ? "#fff" : "#94a3b8",
                  margin: "0 auto 10px",
                }}>
                  {m.achieved ? m.icon : <Lock size={16} />}
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: m.achieved ? m.color : "var(--muted)", marginBottom: 4 }}>
                  {m.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", lineHeight: 1.4 }}>
                  {m.description}
                </div>
                {m.achieved && (
                  <div style={{ marginTop: 10, fontSize: "0.72rem", fontWeight: 700, color: m.color }}>
                    +{m.xp} XP
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Learning Timeline</h3>
          </div>
          {reports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
              <p>No classes completed yet. Journey begins with the first lesson!</p>
            </div>
          ) : (
            <div style={{ position: "relative", paddingLeft: 32 }}>
              <div style={{
                position: "absolute", left: 16, top: 0, bottom: 0, width: 2,
                background: "linear-gradient(to bottom, #1b5e42, #c9a84c, #e2e8f0)",
                borderRadius: 1,
              }} />
              {reports.slice().reverse().map((r, idx) => {
                const ratingColor = r.overall_rating === "excellent" ? "#15803d" : r.overall_rating === "good" ? "#3b82f6" : r.overall_rating === "average" ? "#d97706" : "#dc2626";
                return (
                  <div key={r.id} style={{ position: "relative", marginBottom: 20, paddingLeft: 20 }}>
                    <div style={{
                      position: "absolute", left: -20, top: 6,
                      width: 12, height: 12, borderRadius: "50%",
                      background: ratingColor,
                      border: "2px solid #fff",
                      boxShadow: `0 0 0 3px ${ratingColor}33`,
                    }} />
                    <div style={{
                      background: "#f8fafc",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "14px 16px",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--charcoal)" }}>
                          Class #{reports.length - idx}
                          {r.surah_covered && ` — ${r.surah_covered}`}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                          {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: ratingColor, textTransform: "capitalize" }}>
                          {r.overall_rating?.replace("_", " ")}
                        </span>
                        {r.tajweed_stars && <StarRating count={r.tajweed_stars} />}
                        {r.pages_covered && (
                          <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                            {r.pages_covered} pages
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

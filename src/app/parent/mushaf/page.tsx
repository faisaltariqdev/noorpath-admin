"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import ParentStudentSwitcher from "@/components/ParentStudentSwitcher";
import { SURAHS } from "@/data/surahs";
import type { SurahStatus } from "@/data/surahs";
import { BookOpen, CheckCircle, Clock, Lock, Search } from "lucide-react";

interface StudentSummary {
  id: string;
  full_name: string;
  level?: string | null;
  course?: string | null;
}

export default function MushafPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [coveredSurahs, setCoveredSurahs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "not_started">("all");
  const [hoveredSurah, setHoveredSurah] = useState<number | null>(null);

  useEffect(() => {
    async function loadStudents() {
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
    loadStudents();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    async function loadReports() {
      const { data: rpts } = await supabase
        .from("progress_reports")
        .select("surah_covered")
        .eq("student_id", selectedId)
        .not("surah_covered", "is", null);

      const covered = new Set<string>();
      (rpts || []).forEach((r: { surah_covered?: string }) => {
        if (r.surah_covered) {
          const normalized = r.surah_covered.toLowerCase().trim();
          covered.add(normalized);
        }
      });
      setCoveredSurahs(covered);
    }
    loadReports();
  }, [selectedId]);

  function getSurahStatus(surahName: string): SurahStatus {
    const normalized = surahName.toLowerCase().trim();
    if (coveredSurahs.has(normalized)) return "completed";
    return "not_started";
  }

  const STATUS_CONFIG: Record<SurahStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    completed:   { label: "Completed",   color: "#15803d", bg: "#dcfce7", border: "#86efac", icon: <CheckCircle size={10} /> },
    in_progress: { label: "In Progress", color: "#d97706", bg: "#fef9c3", border: "#fde047", icon: <Clock size={10} /> },
    not_started: { label: "Not Started", color: "#94a3b8", bg: "#f1f5f9", border: "#e2e8f0", icon: <Lock size={10} /> },
  };

  const completedCount = SURAHS.filter(s => getSurahStatus(s.name) === "completed").length;
  const completionPct = Math.round((completedCount / 114) * 100);

  const filteredSurahs = SURAHS.filter(s => {
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.arabic.includes(search) ||
      s.number.toString().includes(search);
    const status = getSurahStatus(s.name);
    const matchesFilter = filter === "all" || filter === status;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Digital Mushaf Tracker" subtitle="114 Surahs — track your child's Quran journey" />
      <div className="page-content">
        {students.length > 1 && (
          <ParentStudentSwitcher students={students} selectedId={selectedId} onChange={setSelectedId} />
        )}

        {/* Progress Banner */}
        <div style={{
          background: "linear-gradient(135deg, #1b5e42, #134430)",
          borderRadius: "var(--radius-lg)",
          padding: "28px 32px",
          marginBottom: 24,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", fontSize: 120, opacity: 0.05, userSelect: "none", fontFamily: "Georgia, serif" }}>
            ﷽
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Quran Completion Progress
              </div>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>
                {completedCount}<span style={{ fontSize: "1rem", opacity: 0.7 }}> / 114 Surahs</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, height: 12, marginBottom: 8 }}>
                <div style={{
                  height: "100%", width: `${completionPct}%`,
                  background: "linear-gradient(90deg, #c9a84c, #e2c06a)",
                  borderRadius: 999,
                  transition: "width 1s ease",
                }} />
              </div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.75)" }}>
                {completionPct}% of the Holy Quran covered
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#c9a84c" }}>{completedCount}</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>Completed</div>
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{114 - completedCount}</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>Remaining</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          {(Object.entries(STATUS_CONFIG) as Array<[SurahStatus, typeof STATUS_CONFIG[SurahStatus]]>).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? "all" : key as "all" | "completed" | "not_started")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 999,
                border: `1.5px solid ${filter === key ? cfg.color : cfg.border}`,
                background: filter === key ? cfg.bg : "white",
                color: cfg.color, fontSize: "0.78rem", fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {cfg.icon} {cfg.label}
            </button>
          ))}
          <div style={{ marginLeft: "auto", position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search Surah..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                paddingLeft: 32, paddingRight: 12, height: 36, borderRadius: 999,
                border: "1.5px solid var(--border)", fontSize: "0.82rem",
                outline: "none", width: 180,
              }}
            />
          </div>
        </div>

        {/* Surah Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 10,
        }}>
          {filteredSurahs.map(surah => {
            const status = getSurahStatus(surah.name);
            const cfg = STATUS_CONFIG[status];
            const isHovered = hoveredSurah === surah.number;
            return (
              <div
                key={surah.number}
                onMouseEnter={() => setHoveredSurah(surah.number)}
                onMouseLeave={() => setHoveredSurah(null)}
                style={{
                  background: isHovered ? cfg.bg : (status === "completed" ? cfg.bg : "#fff"),
                  border: `1.5px solid ${isHovered || status === "completed" ? cfg.border : "var(--border)"}`,
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 10px",
                  cursor: "default",
                  transition: "all 0.15s",
                  transform: isHovered ? "translateY(-2px)" : "none",
                  boxShadow: isHovered ? "var(--shadow)" : "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 4,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: cfg.bg,
                  border: `1.5px solid ${cfg.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: cfg.color, fontSize: "0.7rem", fontWeight: 700,
                }}>
                  {surah.number}
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", color: cfg.color, direction: "rtl" }}>
                  {surah.arabic}
                </div>
                <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--charcoal)" }}>
                  {surah.name}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
                  {surah.verses} verses · {surah.type}
                </div>
                {status === "completed" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3, color: "#15803d", fontSize: "0.65rem", fontWeight: 700, marginTop: 2 }}>
                    <CheckCircle size={10} /> Done
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredSurahs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            <BookOpen size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>No Surahs match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

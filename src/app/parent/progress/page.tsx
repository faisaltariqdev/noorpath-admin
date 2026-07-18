"use client";
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import ParentStudentSwitcher from "@/components/ParentStudentSwitcher";
import { formatStudentLevel } from "@/lib/portal";
import { unwrapOne } from "@/lib/currency";
import { Star, BookOpen, CheckCircle, XCircle, Clock, Play, Volume2 } from "lucide-react";

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
  tutor_notes?: string;
  surah_covered?: string;
  pages_covered?: string;
  homework?: string;
  mistakes?: string;
  tajweed_rules?: string[];
  audio_note_url?: string;
  created_at: string;
  tutor_name: string;
}

const RATING_CONFIG: Record<string, { color: string; bg: string; emoji: string }> = {
  excellent:         { color: "#15803d", bg: "#dcfce7", emoji: "⭐⭐⭐⭐⭐" },
  good:              { color: "#1d4ed8", bg: "#dbeafe", emoji: "⭐⭐⭐⭐" },
  average:           { color: "#a16207", bg: "#fef9c3", emoji: "⭐⭐⭐" },
  needs_improvement: { color: "#b91c1c", bg: "#fee2e2", emoji: "⭐⭐" },
};

export default function ParentProgressPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Report | null>(null);

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
      setSelectedStudentId((current) => current || mapped[0]?.id || "");
      setLoading(false);
    }
    loadStudents();
  }, []);

  useEffect(() => {
    async function loadReports() {
      if (!selectedStudentId) return;
      setLoading(true);
      const { data: reps } = await supabase
        .from("progress_reports")
        .select("id, overall_rating, tajweed_stars, tutor_notes, surah_covered, pages_covered, homework, mistakes, tajweed_rules, audio_note_url, created_at, tutor:profiles(full_name)")
        .eq("student_id", selectedStudentId)
        .order("created_at", { ascending: false });
      setReports((reps || []).map((report: any) => ({
        ...report,
        tutor_name: unwrapOne<{ full_name?: string }>(report.tutor)?.full_name || "—",
      })));
      setSelected(null);
      setLoading(false);
    }
    loadReports();
  }, [selectedStudentId]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [selectedStudentId, students]
  );

  const avgTajweed = reports.length
    ? (reports.reduce((sum, report) => sum + Number(report.tajweed_stars || 0), 0) / reports.length).toFixed(1)
    : "—";

  return (
    <>
      <TopBar title="Progress & Reports" subtitle={selectedStudent?.full_name || "Student"} />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Progress & Reports</h1>
        <p className="page-subtitle">
          {reports.length} reports available
          {selectedStudent ? ` for ${selectedStudent.full_name}` : ""}
        </p>
      </div>
      <div className="page-body">
        <ParentStudentSwitcher
          students={students}
          selectedId={selectedStudentId}
          onChange={setSelectedStudentId}
        />

        {selectedStudent && (
          <div
            className="card"
            style={{ marginBottom: 20, background: "linear-gradient(135deg, #f8fafc, #ffffff)" }}
          >
            <div className="card-body" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {selectedStudent.full_name}
                </div>
                <div style={{ marginTop: 4, fontSize: "0.8rem", color: "#64748b" }}>
                  {formatStudentLevel(selectedStudent.level)}
                  {selectedStudent.course ? ` · ${selectedStudent.course}` : ""}
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Latest learning history and tutor feedback
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: "Total Reports", value: reports.length, icon: BookOpen, color: "#1b5e42", bg: "#f0fdf4" },
            { label: "Avg Tajweed Stars", value: `${avgTajweed}/5`, icon: Star, color: "#c9a84c", bg: "#fffbeb" },
            { label: "Latest Rating", value: reports[0]?.overall_rating?.replace("_", " ") || "—", icon: CheckCircle, color: "#2563eb", bg: "#eff6ff" },
            { label: "Homework Mentions", value: reports.filter(r => r.homework).length, icon: Clock, color: "#7c3aed", bg: "#f5f3ff" },
          ].map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-icon" style={{ background: c.bg, marginBottom: 12 }}><c.icon size={20} color={c.color} /></div>
              <div className="stat-value" style={{ fontSize: "1.4rem" }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 20 }}>
          {/* Report list */}
          <div className="card">
            <div className="card-header"><h3 className="card-title"><Star size={15} color="#c9a84c" /> All Progress Reports</h3></div>
            {loading ? <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
              : reports.length === 0 ? <div className="empty-state"><Star size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No reports yet</h3><p>Reports will appear after your first class.</p></div>
              : (
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Tutor</th><th>Coverage</th><th>Tajweed</th><th>Rating</th><th>Homework</th></tr></thead>
                  <tbody>
                    {reports.map(r => {
                      const cfg = RATING_CONFIG[r.overall_rating] || { color: "#64748b", bg: "#f1f5f9", emoji: "—" };
                      return (
                        <tr key={r.id} onClick={() => setSelected(selected?.id === r.id ? null : r)} style={{ cursor: "pointer", background: selected?.id === r.id ? "#f8fafc" : "transparent" }}>
                          <td style={{ whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                          <td style={{ color: "#64748b" }}>{r.tutor_name}</td>
                          <td style={{ color: "#64748b" }}>{r.surah_covered || r.pages_covered || "—"}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, maxWidth: 80, height: 6, background: "#f1f5f9", borderRadius: 6 }}>
                                <div style={{ height: "100%", width: `${((r.tajweed_stars || 0) / 5) * 100}%`, background: "#1b5e42", borderRadius: 6 }} />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#1b5e42" }}>{r.tajweed_stars || 0}/5</span>
                            </div>
                          </td>
                          <td><span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.emoji} {r.overall_rating?.replace("_", " ")}</span></td>
                          <td>{r.homework ? <CheckCircle size={15} color="#16a34a" /> : <XCircle size={15} color="#94a3b8" />}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="card" style={{ height: "fit-content" }}>
              <div className="card-header">
                <h3 className="card-title">Report Details</h3>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1.2rem" }}>×</button>
              </div>
              <div className="card-body">
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: 12 }}>
                  {new Date(selected.created_at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
                {(selected.surah_covered || selected.pages_covered) && (
                  <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Coverage</div>
                    <div style={{ fontWeight: 700, color: "#1b5e42" }}>{selected.surah_covered || selected.pages_covered}</div>
                  </div>
                )}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Tajweed Stars</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 8, background: "#f1f5f9", borderRadius: 8 }}>
                      <div style={{ height: "100%", width: `${((selected.tajweed_stars || 0) / 5) * 100}%`, background: "linear-gradient(90deg, #1b5e42, #c9a84c)", borderRadius: 8 }} />
                    </div>
                    <span style={{ fontWeight: 800, color: "#1b5e42", fontSize: "1rem" }}>{selected.tajweed_stars || 0}/5</span>
                  </div>
                </div>
                {(selected.tajweed_rules || []).length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Tajweed Issues to Practice</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(selected.tajweed_rules || []).map(rule => <span key={rule} className="badge badge-red">{rule}</span>)}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 12, marginBottom: 14, fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{selected.homework ? <CheckCircle size={15} color="#16a34a" /> : <XCircle size={15} color="#94a3b8" />} Homework given</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{selected.mistakes ? <Clock size={15} color="#d97706" /> : <CheckCircle size={15} color="#16a34a" />} Review notes</div>
                </div>
                {selected.homework && (
                  <div style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 14px", fontSize: "0.82rem", color: "#1e3a5f", lineHeight: 1.7, borderLeft: "3px solid #2563eb", marginBottom: 12 }}>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Homework</div>
                    {selected.homework}
                  </div>
                )}
                {selected.mistakes && (
                  <div style={{ background: "#fff7ed", borderRadius: 10, padding: "12px 14px", fontSize: "0.82rem", color: "#9a3412", lineHeight: 1.7, borderLeft: "3px solid #ea580c", marginBottom: 12 }}>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Mistakes / Focus</div>
                    {selected.mistakes}
                  </div>
                )}
                {selected.tutor_notes && (
                  <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", fontSize: "0.82rem", color: "#475569", lineHeight: 1.7, borderLeft: "3px solid #1b5e42", marginBottom: 12 }}>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Tutor Notes</div>
                    {selected.tutor_notes}
                  </div>
                )}
                {selected.audio_note_url && (
                  <div style={{ background: "#fffbeb", border: "1px solid #fde047", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <Volume2 size={14} style={{ color: "#d97706" }} />
                      <div style={{ fontSize: "0.7rem", color: "#d97706", fontWeight: 700, textTransform: "uppercase" }}>Tutor Audio Note</div>
                    </div>
                    <audio controls src={selected.audio_note_url} style={{ width: "100%", height: 36 }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

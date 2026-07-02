"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { FileText, CheckCircle, XCircle, Star, TrendingUp } from "lucide-react";

interface Report {
  id: string;
  student_name: string;
  tutor_name: string;
  overall_rating: string;
  tajweed_stars?: number;
  surah_covered?: string;
  pages_covered?: string;
  homework?: string;
  tutor_notes?: string;
  mistakes?: string;
  tajweed_rules?: string[];
  created_at: string;
}

const RATING_CFG: Record<string, { color: string; bg: string }> = {
  excellent:         { color: "#15803d", bg: "#dcfce7" },
  good:              { color: "#1d4ed8", bg: "#dbeafe" },
  average:           { color: "#a16207", bg: "#fef9c3" },
  needs_improvement: { color: "#b91c1c", bg: "#fee2e2" },
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Report | null>(null);
  const [filterRating, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("progress_reports")
        .select("id, overall_rating, tajweed_stars, surah_covered, pages_covered, homework, tutor_notes, mistakes, tajweed_rules, created_at, student:students(full_name), tutor:profiles(full_name)")
        .order("created_at", { ascending: false });
      setReports((data || []).map((r: any) => ({ ...r, student_name: r.student?.full_name || "—", tutor_name: r.tutor?.full_name || "—" })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filterRating === "all" ? reports : reports.filter(r => r.overall_rating === filterRating);
  const avgScore = reports.length ? (reports.reduce((s, r) => s + (r.tajweed_stars || 0), 0) / reports.length).toFixed(1) : "0";

  return (
    <>
      <TopBar title="Progress Reports" subtitle="All student progress reports" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Progress Reports</h1>
        <p className="page-subtitle">{reports.length} total reports submitted</p>
      </div>
      <div className="page-body">
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: "Total Reports", value: reports.length, icon: FileText, color: "#1b5e42", bg: "#f0fdf4" },
            { label: "Excellent", value: reports.filter(r => r.overall_rating === "excellent").length, icon: Star, color: "#15803d", bg: "#dcfce7" },
            { label: "Avg Tajweed Stars", value: `${avgScore}/5`, icon: TrendingUp, color: "#7c3aed", bg: "#f5f3ff" },
            { label: "HW Assigned", value: reports.filter(r => r.homework).length, icon: CheckCircle, color: "#d97706", bg: "#fffbeb" },
          ].map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-icon" style={{ background: c.bg, marginBottom: 12 }}><c.icon size={20} color={c.color} /></div>
              <div className="stat-value" style={{ fontSize: "1.5rem" }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {["all", "excellent", "good", "average", "needs_improvement"].map(r => (
            <button key={r} onClick={() => setFilter(r)} className={`btn btn-sm ${filterRating === r ? "btn-primary" : "btn-ghost"}`} style={{ textTransform: "capitalize" }}>{r.replace("_", " ")}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 20 }}>
          <div className="card">
            {loading ? <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
              : filtered.length === 0 ? <div className="empty-state"><FileText size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No reports found</h3></div>
              : (
                <table className="data-table">
                  <thead><tr><th>Student</th><th>Tutor</th><th>Coverage</th><th>Tajweed</th><th>Rating</th><th>HW</th><th>Date</th></tr></thead>
                  <tbody>
                    {filtered.map(r => {
                      const cfg = RATING_CFG[r.overall_rating] || { color: "#64748b", bg: "#f1f5f9" };
                      return (
                        <tr key={r.id} onClick={() => setSelected(selected?.id === r.id ? null : r)} style={{ cursor: "pointer", background: selected?.id === r.id ? "#f8fafc" : "transparent" }}>
                          <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><div className="avatar" style={{ width: 28, height: 28, fontSize: "0.7rem" }}>{r.student_name.charAt(0)}</div><span style={{ fontWeight: 600 }}>{r.student_name}</span></div></td>
                          <td style={{ color: "#64748b" }}>{r.tutor_name}</td>
                          <td style={{ color: "#64748b", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.surah_covered || r.pages_covered || "—"}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 50, height: 5, background: "#f1f5f9", borderRadius: 4 }}><div style={{ height: "100%", width: `${((r.tajweed_stars || 0) / 5) * 100}%`, background: "#1b5e42", borderRadius: 4 }} /></div>
                              <span style={{ fontWeight: 700, fontSize: "0.78rem", color: "#1b5e42" }}>{r.tajweed_stars || 0}</span>
                            </div>
                          </td>
                          <td><span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{r.overall_rating?.replace("_", " ") || "—"}</span></td>
                          <td>{r.homework ? <CheckCircle size={14} color="#16a34a" /> : <XCircle size={14} color="#94a3b8" />}</td>
                          <td style={{ color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
          </div>
          {selected && (
            <div className="card" style={{ height: "fit-content" }}>
              <div className="card-header">
                <h3 className="card-title">Report Details</h3>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1.3rem", lineHeight: 1 }}>×</button>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "0.95rem", color: "#0f172a" }}>{selected.student_name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 3 }}>Tutor: {selected.tutor_name} · {new Date(selected.created_at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
                {(selected.surah_covered || selected.pages_covered) && <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}><div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Coverage</div><div style={{ fontWeight: 700, color: "#1b5e42" }}>{selected.surah_covered || selected.pages_covered}</div></div>}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Tajweed {selected.tajweed_stars || 0}/5</div>
                  <div style={{ height: 8, background: "#f1f5f9", borderRadius: 8 }}><div style={{ height: "100%", width: `${((selected.tajweed_stars || 0) / 5) * 100}%`, background: "linear-gradient(90deg, #1b5e42, #c9a84c)", borderRadius: 8 }} /></div>
                </div>
                {(selected.tajweed_rules || []).length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Issues</div><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{(selected.tajweed_rules || []).map(r => <span key={r} className="badge badge-red">{r}</span>)}</div></div>}
                <div style={{ display: "flex", gap: 16, fontSize: "0.82rem", marginBottom: selected.tutor_notes || selected.mistakes ? 14 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>{selected.homework ? <CheckCircle size={14} color="#16a34a" /> : <XCircle size={14} color="#94a3b8" />} Homework</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>{selected.mistakes ? <XCircle size={14} color="#d97706" /> : <CheckCircle size={14} color="#16a34a" />} Review</div>
                </div>
                {(selected.tutor_notes || selected.mistakes) && <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", fontSize: "0.82rem", color: "#475569", lineHeight: 1.7, borderLeft: "3px solid #1b5e42", marginTop: 14 }}><div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>Tutor Notes</div>{selected.tutor_notes || selected.mistakes}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

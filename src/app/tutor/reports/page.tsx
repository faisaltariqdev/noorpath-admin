"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  student_name: string;
  overall_rating: string;
  tajweed_stars: number;
  homework?: string;
  surah_covered?: string;
  tutor_notes?: string;
  created_at: string;
}
const RATING_CFG: Record<string, { color: string; bg: string }> = {
  excellent: { color: "#15803d", bg: "#dcfce7" }, good: { color: "#1d4ed8", bg: "#dbeafe" },
  average: { color: "#a16207", bg: "#fef9c3" }, needs_improvement: { color: "#b91c1c", bg: "#fee2e2" },
};

export default function TutorReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("progress_reports")
        .select("id, overall_rating, tajweed_stars, homework, surah_covered, tutor_notes, created_at, student:students(full_name)")
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false });
      setReports((data || []).map((r: any) => ({ ...r, student_name: r.student?.full_name || "—" })));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <TopBar title="My Reports" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><h1 className="page-title">Progress Reports</h1><p className="page-subtitle">{reports.length} reports submitted by you</p></div>
          <Link href="/tutor/reports/new" className="btn btn-primary"><Plus size={15} /> New Report</Link>
        </div>
      </div>
      <div className="page-body">
        <div className="card">
          {loading ? <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
            : reports.length === 0 ? <div className="empty-state"><FileText size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No reports yet</h3><p>Submit your first progress report after a class.</p><Link href="/tutor/reports/new" className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={14} /> Submit Report</Link></div>
            : (
              <table className="data-table">
                <thead><tr><th>Student</th><th>Surah</th><th>Tajweed</th><th>Rating</th><th>HW</th><th>Notes</th><th>Date</th></tr></thead>
                <tbody>
                  {reports.map(r => {
                    const cfg = RATING_CFG[r.overall_rating] || { color: "#64748b", bg: "#f1f5f9" };
                    return (
                      <tr key={r.id}>
                        <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><div className="avatar" style={{ width: 28, height: 28, fontSize: "0.7rem" }}>{r.student_name.charAt(0)}</div><span style={{ fontWeight: 600 }}>{r.student_name}</span></div></td>
                        <td style={{ color: "#64748b" }}>{r.surah_covered || "—"}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 48, height: 5, background: "#f1f5f9", borderRadius: 4 }}><div style={{ height: "100%", width: `${((r.tajweed_stars || 0) / 5) * 100}%`, background: "#1b5e42", borderRadius: 4 }} /></div>
                            <span style={{ fontWeight: 700, fontSize: "0.75rem", color: "#1b5e42" }}>{r.tajweed_stars || 0}/5</span>
                          </div>
                        </td>
                        <td><span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{r.overall_rating?.replace("_", " ") || "—"}</span></td>
                        <td style={{ color: "#64748b", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.homework || "—"}</td>
                        <td style={{ color: "#64748b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.tutor_notes || "—"}</td>
                        <td style={{ color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </>
  );
}

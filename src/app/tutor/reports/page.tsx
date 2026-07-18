"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { unwrapOne } from "@/lib/currency";
import { Eye, FileText, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  student_id: string;
  student_name: string;
  overall_rating: string;
  tajweed_stars: number;
  homework?: string;
  surah_covered?: string;
  pages_covered?: string;
  tutor_notes?: string;
  mistakes?: string;
  created_at: string;
}

const RATING_CFG: Record<string, { color: string; bg: string }> = {
  excellent: { color: "#15803d", bg: "#dcfce7" },
  good: { color: "#1d4ed8", bg: "#dbeafe" },
  average: { color: "#a16207", bg: "#fef9c3" },
  needs_improvement: { color: "#b91c1c", bg: "#fee2e2" },
};

const emptyEdit = {
  overall_rating: "good",
  tajweed_stars: 3,
  surah_covered: "",
  pages_covered: "",
  homework: "",
  tutor_notes: "",
  mistakes: "",
};

export default function TutorReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [viewing, setViewing] = useState<Report | null>(null);
  const [editing, setEditing] = useState<Report | null>(null);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("progress_reports")
      .select("id, student_id, overall_rating, tajweed_stars, homework, surah_covered, pages_covered, tutor_notes, mistakes, created_at, student:students(full_name)")
      .eq("tutor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMsg(error.message);
      setReports([]);
    } else {
      setReports((data || []).map((r: any) => ({
        ...r,
        student_name: unwrapOne<{ full_name?: string }>(r.student)?.full_name || "—",
      })));
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  function openEdit(report: Report) {
    setEditing(report);
    setEditForm({
      overall_rating: report.overall_rating || "good",
      tajweed_stars: report.tajweed_stars || 3,
      surah_covered: report.surah_covered || "",
      pages_covered: report.pages_covered || "",
      homework: report.homework || "",
      tutor_notes: report.tutor_notes || "",
      mistakes: report.mistakes || "",
    });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.from("progress_reports").update({
      overall_rating: editForm.overall_rating,
      tajweed_stars: editForm.tajweed_stars,
      surah_covered: editForm.surah_covered || null,
      pages_covered: editForm.pages_covered || null,
      homework: editForm.homework || null,
      tutor_notes: editForm.tutor_notes || null,
      mistakes: editForm.mistakes || null,
    }).eq("id", editing.id);

    setSaving(false);
    if (error) {
      setMsg("Could not update report: " + error.message);
      return;
    }
    setEditing(null);
    setMsg("Report updated.");
    setTimeout(() => setMsg(""), 2500);
    await load();
  }

  async function deleteReport(report: Report) {
    if (!window.confirm(`Delete report for ${report.student_name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("progress_reports").delete().eq("id", report.id);
    if (error) {
      setMsg("Could not delete: " + error.message);
      return;
    }
    setViewing(null);
    setMsg("Report deleted.");
    setTimeout(() => setMsg(""), 2500);
    await load();
  }

  return (
    <>
      <TopBar title="My Reports" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Progress Reports</h1>
            <p className="page-subtitle">{reports.length} reports · view, edit or delete your submissions</p>
          </div>
          <Link href="/tutor/reports/new" className="btn btn-primary"><Plus size={15} /> New Report</Link>
        </div>
      </div>
      <div className="page-body">
        {msg && (
          <div className="card" style={{ marginBottom: 14, padding: "12px 16px", fontSize: "0.85rem", fontWeight: 600, color: msg.includes("Could not") ? "#b91c1c" : "#166534", background: msg.includes("Could not") ? "#fef2f2" : "#f0fdf4" }}>
            {msg}
          </div>
        )}
        <div className="card">
          {loading ? (
            <div className="empty-state">
              <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <FileText size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
              <h3>No reports yet</h3>
              <p>Submit your first progress report after a class. Parents will see it on their dashboard.</p>
              <Link href="/tutor/reports/new" className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={14} /> Submit Report</Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Surah</th>
                  <th>Tajweed</th>
                  <th>Rating</th>
                  <th>HW</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const cfg = RATING_CFG[r.overall_rating] || { color: "#64748b", bg: "#f1f5f9" };
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.7rem" }}>{r.student_name.charAt(0)}</div>
                          <span style={{ fontWeight: 600 }}>{r.student_name}</span>
                        </div>
                      </td>
                      <td style={{ color: "#64748b" }}>{r.surah_covered || "—"}</td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: "0.75rem", color: "#1b5e42" }}>{r.tajweed_stars || 0}/5</span>
                      </td>
                      <td><span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{r.overall_rating?.replace("_", " ") || "—"}</span></td>
                      <td style={{ color: "#64748b", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.homework || "—"}</td>
                      <td style={{ color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                          <button type="button" className="btn btn-outline btn-xs" onClick={() => setViewing(r)} aria-label="View report"><Eye size={13} /></button>
                          <button type="button" className="btn btn-outline btn-xs" onClick={() => openEdit(r)} aria-label="Edit report"><Pencil size={13} /></button>
                          <button type="button" className="btn btn-outline btn-xs" onClick={() => void deleteReport(r)} aria-label="Delete report" style={{ color: "#b91c1c" }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {viewing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="card" style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.05rem" }}>{viewing.student_name}</h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#64748b" }}>{new Date(viewing.created_at).toLocaleString("en-GB")}</p>
              </div>
              <button type="button" onClick={() => setViewing(null)} style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Close"><X size={18} /></button>
            </div>
            <div style={{ padding: 20, display: "grid", gap: 12, fontSize: "0.88rem" }}>
              <div><strong>Rating:</strong> {viewing.overall_rating?.replace("_", " ")}</div>
              <div><strong>Tajweed:</strong> {viewing.tajweed_stars}/5</div>
              <div><strong>Surah:</strong> {viewing.surah_covered || "—"}</div>
              <div><strong>Pages:</strong> {viewing.pages_covered || "—"}</div>
              <div><strong>Homework:</strong> {viewing.homework || "—"}</div>
              <div><strong>Notes:</strong> {viewing.tutor_notes || "—"}</div>
              <div><strong>Mistakes:</strong> {viewing.mistakes || "—"}</div>
            </div>
            <div style={{ padding: "12px 20px 20px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setViewing(null); openEdit(viewing); }}>Edit</button>
              <button type="button" className="btn btn-outline btn-sm" style={{ color: "#b91c1c" }} onClick={() => void deleteReport(viewing)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 130, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <form onSubmit={saveEdit} className="card" style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Edit · {editing.student_name}</h2>
              <button type="button" onClick={() => setEditing(null)} style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Close"><X size={18} /></button>
            </div>
            <div style={{ padding: 20, display: "grid", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Overall rating</label>
                <select className="form-input form-select" value={editForm.overall_rating} onChange={(e) => setEditForm((p) => ({ ...p, overall_rating: e.target.value }))}>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="needs_improvement">Needs improvement</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tajweed stars (1–5)</label>
                <input className="form-input" type="number" min={1} max={5} value={editForm.tajweed_stars} onChange={(e) => setEditForm((p) => ({ ...p, tajweed_stars: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Surah covered</label>
                <input className="form-input" value={editForm.surah_covered} onChange={(e) => setEditForm((p) => ({ ...p, surah_covered: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Pages covered</label>
                <input className="form-input" value={editForm.pages_covered} onChange={(e) => setEditForm((p) => ({ ...p, pages_covered: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Homework</label>
                <textarea className="form-input" rows={3} value={editForm.homework} onChange={(e) => setEditForm((p) => ({ ...p, homework: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tutor notes</label>
                <textarea className="form-input" rows={3} value={editForm.tutor_notes} onChange={(e) => setEditForm((p) => ({ ...p, tutor_notes: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Mistakes</label>
                <textarea className="form-input" rows={2} value={editForm.mistakes} onChange={(e) => setEditForm((p) => ({ ...p, mistakes: e.target.value }))} />
              </div>
            </div>
            <div style={{ padding: "0 20px 20px", display: "flex", gap: 8 }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

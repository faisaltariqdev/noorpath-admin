"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { getSessionSubject } from "@/lib/portal";
import { formatTimePair } from "@/lib/timezones";
import { Calendar, Plus, X, Video, Search } from "lucide-react";

interface Session { id: string; student_name: string; tutor_name: string; scheduled_at: string; duration: number; status: string; course?: string; meeting_link: string; notes?: string; student_timezone?: string; tutor_timezone?: string; }
const STATUS_BADGE: Record<string, string> = { scheduled: "badge badge-blue", completed: "badge badge-green", cancelled: "badge badge-red", no_show: "badge badge-gray" };

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string }[]>([]);
  const [tutors, setTutors] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [filterTutor, setFilterTutor] = useState("all");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ student_id: "", tutor_id: "", scheduled_at: "", duration_minutes: "30", meeting_link: "", notes: "" });

  async function load() {
    setLoading(true);
    const [{ data: sess }, { data: studs }, { data: profs }] = await Promise.all([
      supabase.from("class_sessions").select("id, scheduled_at, duration_minutes, status, meeting_link, notes, student:students(full_name, course, timezone), tutor:profiles(full_name, timezone)").order("scheduled_at", { ascending: false }).limit(100),
      supabase.from("students").select("id, full_name").eq("is_active", true),
      supabase.from("profiles").select("id, full_name").eq("role", "tutor"),
    ]);
    setSessions((sess || []).map((s: any) => ({
      id: s.id,
      student_name: s.student?.full_name || "—",
      tutor_name: s.tutor?.full_name || "—",
      scheduled_at: s.scheduled_at,
      duration: s.duration_minutes || 30,
      status: s.status,
      course: s.student?.course || "",
      student_timezone: s.student?.timezone || "",
      tutor_timezone: s.tutor?.timezone || "",
      meeting_link: s.meeting_link || "",
      notes: s.notes || "",
    })));
    setStudents(studs || []);
    setTutors(profs || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = sessions.filter(s => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q
      || s.student_name.toLowerCase().includes(q)
      || s.tutor_name.toLowerCase().includes(q)
      || s.course?.toLowerCase().includes(q)
      || s.notes?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    const matchesTutor = filterTutor === "all" || s.tutor_name === filterTutor;
    return matchesSearch && matchesStatus && matchesTutor;
  });
  const tutorNames = Array.from(new Set(sessions.map(s => s.tutor_name || "Unassigned"))).sort();

  async function addSession(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("class_sessions").insert({
      student_id: form.student_id,
      tutor_id: form.tutor_id || null,
      scheduled_at: form.scheduled_at,
      duration_minutes: parseInt(form.duration_minutes),
      meeting_link: form.meeting_link || null,
      status: "scheduled",
      notes: form.notes || null,
    });
    setShowForm(false);
    setForm({ student_id: "", tutor_id: "", scheduled_at: "", duration_minutes: "30", meeting_link: "", notes: "" });
    setSaving(false);
    await load();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("class_sessions").update({ status }).eq("id", id);
    setSessions(p => p.map(s => s.id === id ? { ...s, status } : s));
  }

  return (
    <>
      <TopBar title="All Sessions" subtitle="Schedule and track all classes" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><h1 className="page-title">All Sessions</h1><p className="page-subtitle">{sessions.length} total sessions</p></div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> Schedule Class</button>
        </div>
      </div>
      <div className="page-body">
        <div className="filter-toolbar">
          <div className="search-field">
            <Search size={16} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student, tutor, surah, class focus..." />
          </div>
          <select className="filter-select" value={filterTutor} onChange={e => setFilterTutor(e.target.value)}>
            <option value="all">All tutors</option>
            {tutorNames.map(tutor => <option key={tutor} value={tutor}>{tutor}</option>)}
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All status</option>
            {["scheduled", "completed", "cancelled", "no_show"].map(status => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
          </select>
        </div>
        <div className="card">
          {loading ? <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
            : filtered.length === 0 ? <div className="empty-state"><Calendar size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No sessions found</h3><p>Schedule your first class.</p></div>
            : (
              <div className="table-shell">
              <table className="data-table">
                <thead><tr><th>Student</th><th>Tutor</th><th>Class Focus</th><th>Local / PKT Time</th><th>Duration</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {filtered.map(s => {
                    const studentTime = formatTimePair(s.scheduled_at, s.student_timezone);
                    const tutorTime = formatTimePair(s.scheduled_at, s.tutor_timezone);
                    return (
                    <tr key={s.id}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><div className="avatar" style={{ width: 28, height: 28, fontSize: "0.7rem" }}>{s.student_name.charAt(0)}</div><span style={{ fontWeight: 600 }}>{s.student_name}</span></div></td>
                      <td style={{ color: "#64748b" }}>{s.tutor_name}</td>
                      <td><span className="badge badge-purple">{getSessionSubject(s.course, s.notes)}</span></td>
                      <td style={{ color: "#64748b", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>Student: {studentTime.local}</div>
                        <div style={{ fontSize: "0.72rem", marginTop: 2 }}>Tutor: {tutorTime.local}</div>
                        <div style={{ fontSize: "0.72rem", color: "#1b5e42", marginTop: 2 }}>PKT: {studentTime.pkt}</div>
                      </td>
                      <td style={{ color: "#64748b" }}>{s.duration} min</td>
                      <td><span className={STATUS_BADGE[s.status] || "badge badge-gray"}>{s.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 5, flexWrap: "nowrap" }}>
                          {s.meeting_link && <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-primary"><Video size={11} /></a>}
                          {s.status === "scheduled" && <button onClick={() => updateStatus(s.id, "completed")} className="btn btn-xs btn-ghost">Done</button>}
                          {s.status === "scheduled" && <button onClick={() => updateStatus(s.id, "cancelled")} className="btn btn-xs btn-danger">Cancel</button>}
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
              </div>
            )}
        </div>

        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, overflow: "hidden", margin: "auto" }}>
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1b5e42)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Schedule New Class</h2>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <form onSubmit={addSession} style={{ padding: 24 }}>
                <div className="form-group">
                  <label className="form-label">Student *</label>
                  <select className="form-input form-select" value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))} required>
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tutor</label>
                  <select className="form-input form-select" value={form.tutor_id} onChange={e => setForm(p => ({ ...p, tutor_id: e.target.value }))}>
                    <option value="">Select tutor</option>
                    {tutors.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Date & Time *</label>
                    <input type="datetime-local" className="form-input" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (min)</label>
                    <select className="form-input form-select" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))}>
                      {["30", "45", "60", "90"].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Meeting Link</label>
                  <input className="form-input" value={form.meeting_link} onChange={e => setForm(p => ({ ...p, meeting_link: e.target.value }))} placeholder="https://zoom.us/j/..." />
                </div>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Class Focus / Notes</label>
                  <textarea className="form-input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional: revision focus, surah, or teacher note..." rows={3} style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>{saving ? "Saving..." : "Schedule Class"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

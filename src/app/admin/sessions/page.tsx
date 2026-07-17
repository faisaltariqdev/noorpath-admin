"use client";
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { getSessionSubject } from "@/lib/portal";
import { formatTimePair } from "@/lib/timezones";
import { Calendar, Plus, X, Video, Search, Pencil, Trash2 } from "lucide-react";

interface SessionRow {
  id: string;
  session_group_id?: string | null;
  student_ids: string[];
  student_name: string;
  tutor_id?: string | null;
  tutor_name: string;
  scheduled_at: string;
  duration: number;
  status: string;
  course?: string;
  meeting_link: string;
  notes?: string;
  student_timezone?: string;
  tutor_timezone?: string;
  member_ids: string[];
}

const STATUS_BADGE: Record<string, string> = {
  scheduled: "badge badge-blue",
  completed: "badge badge-green",
  cancelled: "badge badge-red",
  no_show: "badge badge-gray",
};

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const emptyForm = {
  student_ids: [] as string[],
  tutor_id: "",
  scheduled_at: "",
  duration_minutes: "30",
  meeting_link: "",
  notes: "",
  status: "scheduled",
  schedule_mode: "once" as "once" | "weekly",
  weekdays: [] as number[],
  weeks_count: "8",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Build local datetime strings (YYYY-MM-DDTHH:mm) for weekly recurrence. */
function buildWeeklyOccurrences(startLocal: string, weekdays: number[], weeksCount: number): string[] {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(startLocal);
  if (!match || !weekdays.length) return [];
  const [, y, m, d, hh, mm] = match;
  const startDate = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm));
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + weeksCount * 7);

  const out: string[] = [];
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  while (cursor <= endDate) {
    if (weekdays.includes(cursor.getDay()) && cursor >= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) {
      out.push(
        `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}T${pad(Number(hh))}:${pad(Number(mm))}`,
      );
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function toIsoFromLocal(local: string) {
  return new Date(local).toISOString();
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string }[]>([]);
  const [tutors, setTutors] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [editingMemberIds, setEditingMemberIds] = useState<string[]>([]);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [filterTutor, setFilterTutor] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    const [{ data: sess }, { data: studs }, { data: profs }] = await Promise.all([
      supabase
        .from("class_sessions")
        .select("id, session_group_id, scheduled_at, duration_minutes, status, meeting_link, notes, student_id, tutor_id, student:students(full_name, course, timezone), tutor:profiles(full_name, timezone)")
        .order("scheduled_at", { ascending: false })
        .limit(300),
      supabase.from("students").select("id, full_name").eq("is_active", true).order("full_name"),
      supabase.from("profiles").select("id, full_name").eq("role", "tutor"),
    ]);

    const raw = (sess || []) as any[];
    const grouped = new Map<string, SessionRow>();

    for (const s of raw) {
      const key = s.session_group_id || s.id;
      const existing = grouped.get(key);
      const studentName = s.student?.full_name || "—";
      if (existing) {
        if (!existing.student_ids.includes(s.student_id)) {
          existing.student_ids.push(s.student_id);
          existing.student_name = `${existing.student_name}, ${studentName}`;
          existing.member_ids.push(s.id);
        }
        continue;
      }
      grouped.set(key, {
        id: s.id,
        session_group_id: s.session_group_id,
        student_ids: s.student_id ? [s.student_id] : [],
        student_name: studentName,
        tutor_id: s.tutor_id,
        tutor_name: s.tutor?.full_name || "—",
        scheduled_at: s.scheduled_at,
        duration: s.duration_minutes || 30,
        status: s.status,
        course: s.student?.course || "",
        student_timezone: s.student?.timezone || "",
        tutor_timezone: s.tutor?.timezone || "",
        meeting_link: s.meeting_link || "",
        notes: s.notes || "",
        member_ids: [s.id],
      });
    }

    setSessions(Array.from(grouped.values()));
    setStudents(studs || []);
    setTutors(profs || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const list = sessions.filter(s => {
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
    return list.sort((a, b) => {
      const diff = +new Date(a.scheduled_at) - +new Date(b.scheduled_at);
      return sortOrder === "asc" ? diff : -diff;
    });
  }, [sessions, search, filterStatus, filterTutor, sortOrder]);
  const tutorNames = Array.from(new Set(sessions.map(s => s.tutor_name || "Unassigned"))).sort();

  const previewCount = useMemo(() => {
    if (editingGroupKey) return form.student_ids.length;
    if (!form.student_ids.length || !form.scheduled_at) return 0;
    if (form.schedule_mode === "once") return form.student_ids.length;
    const occ = buildWeeklyOccurrences(form.scheduled_at, form.weekdays, Math.max(1, parseInt(form.weeks_count) || 8));
    return occ.length * form.student_ids.length;
  }, [form, editingGroupKey]);

  function toggleStudent(id: string) {
    setForm(p => ({
      ...p,
      student_ids: p.student_ids.includes(id)
        ? p.student_ids.filter(x => x !== id)
        : [...p.student_ids, id],
    }));
  }

  function toggleWeekday(day: number) {
    setForm(p => ({
      ...p,
      weekdays: p.weekdays.includes(day)
        ? p.weekdays.filter(d => d !== day)
        : [...p.weekdays, day].sort((a, b) => a - b),
    }));
  }

  function openCreateForm() {
    setEditingGroupKey(null);
    setEditingMemberIds([]);
    setEditingGroupId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(row: SessionRow) {
    setEditingGroupKey(row.session_group_id || row.id);
    setEditingMemberIds(row.member_ids);
    setEditingGroupId(row.session_group_id || null);
    setForm({
      ...emptyForm,
      student_ids: [...row.student_ids],
      tutor_id: row.tutor_id || "",
      scheduled_at: toLocalInput(row.scheduled_at),
      duration_minutes: String(row.duration || 30),
      meeting_link: row.meeting_link || "",
      notes: row.notes || "",
      status: row.status || "scheduled",
      schedule_mode: "once",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingGroupKey(null);
    setEditingMemberIds([]);
    setEditingGroupId(null);
    setForm(emptyForm);
  }

  async function saveSession(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_ids.length) {
      setMsg("Error: Select at least one student.");
      return;
    }
    if (!editingGroupKey && form.schedule_mode === "weekly" && !form.weekdays.length) {
      setMsg("Error: Select at least one weekday for recurring classes.");
      return;
    }

    setSaving(true);
    setMsg("");

    if (editingGroupKey) {
      const groupId = editingGroupId || crypto.randomUUID();
      const scheduled_at = toIsoFromLocal(form.scheduled_at);
      const rows = form.student_ids.map(student_id => ({
        student_id,
        tutor_id: form.tutor_id || null,
        scheduled_at,
        duration_minutes: parseInt(form.duration_minutes),
        meeting_link: form.meeting_link || null,
        status: form.status || "scheduled",
        notes: form.notes || null,
        session_group_id: groupId,
      }));

      if (editingMemberIds.length) {
        const { error: delError } = await supabase.from("class_sessions").delete().in("id", editingMemberIds);
        if (delError) {
          setMsg("Error: " + delError.message);
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase.from("class_sessions").insert(rows);
      if (error) {
        setMsg("Error: " + error.message);
      } else {
        setMsg("Class updated successfully.");
        closeForm();
        await load();
      }
      setSaving(false);
      setTimeout(() => setMsg(""), 4000);
      return;
    }

    const occurrenceLocals = form.schedule_mode === "once"
      ? [form.scheduled_at]
      : buildWeeklyOccurrences(form.scheduled_at, form.weekdays, Math.max(1, parseInt(form.weeks_count) || 8));

    if (!occurrenceLocals.length) {
      setMsg("Error: No class dates generated. Check start date and weekdays.");
      setSaving(false);
      return;
    }

    const rows = occurrenceLocals.flatMap(local => {
      const groupId = crypto.randomUUID();
      const scheduled_at = toIsoFromLocal(local);
      return form.student_ids.map(student_id => ({
        student_id,
        tutor_id: form.tutor_id || null,
        scheduled_at,
        duration_minutes: parseInt(form.duration_minutes),
        meeting_link: form.meeting_link || null,
        status: "scheduled" as const,
        notes: form.notes || null,
        session_group_id: groupId,
      }));
    });

    const { error } = await supabase.from("class_sessions").insert(rows);
    if (error) {
      setMsg("Error: " + error.message);
    } else {
      setMsg(`Scheduled ${rows.length} class slot(s) successfully.`);
      closeForm();
      await load();
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  }

  async function updateStatus(row: SessionRow, status: string) {
    const ids = row.member_ids.length ? row.member_ids : [row.id];
    const { error } = await supabase.from("class_sessions").update({ status }).in("id", ids);
    if (error) {
      setMsg("Error: " + error.message);
      return;
    }
    setSessions(p => p.map(s => (s.id === row.id || (row.session_group_id && s.session_group_id === row.session_group_id)) ? { ...s, status } : s));
  }

  async function deleteSession(row: SessionRow) {
    const label = row.student_name;
    if (!window.confirm(`Delete class for ${label}? This cannot be undone.`)) return;
    const ids = row.member_ids.length ? row.member_ids : [row.id];
    const { error } = await supabase.from("class_sessions").delete().in("id", ids);
    if (error) {
      setMsg("Error: " + error.message);
      return;
    }
    setMsg("Class deleted.");
    setSessions(p => p.filter(s => s.id !== row.id && !(row.session_group_id && s.session_group_id === row.session_group_id)));
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <>
      <TopBar title="Live Classes" subtitle="Schedule and track all classes" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><h1 className="page-title">Live Classes</h1><p className="page-subtitle">{sessions.length} class groups</p></div>
          <button className="btn btn-primary" onClick={openCreateForm}><Plus size={15} /> Schedule Class</button>
        </div>
      </div>
      <div className="page-body">
        {msg && (
          <div style={{ background: msg.startsWith("Error") ? "#fef2f2" : "#f0fdf4", border: `1px solid ${msg.startsWith("Error") ? "#fecaca" : "#bbf7d0"}`, color: msg.startsWith("Error") ? "#b91c1c" : "#15803d", borderRadius: 10, padding: "11px 16px", marginBottom: 16, fontSize: "0.83rem" }}>
            {msg}
          </div>
        )}
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
          <select className="filter-select" value={sortOrder} onChange={e => setSortOrder(e.target.value as "asc" | "desc")}>
            <option value="desc">Newest first (descending)</option>
            <option value="asc">Oldest first (ascending)</option>
          </select>
        </div>
        <div className="card">
          {loading ? <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
            : filtered.length === 0 ? <div className="empty-state"><Calendar size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No sessions found</h3><p>Schedule your first class.</p></div>
            : (
              <div className="table-shell">
              <table className="data-table">
                <thead><tr><th>Student(s)</th><th>Tutor</th><th>Class Focus</th><th>Local / PKT Time</th><th>Duration</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {filtered.map(s => {
                    const studentTime = formatTimePair(s.scheduled_at, s.student_timezone);
                    const tutorTime = formatTimePair(s.scheduled_at, s.tutor_timezone);
                    const multi = s.student_ids.length > 1;
                    return (
                    <tr key={s.session_group_id || s.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.7rem" }}>{s.student_name.charAt(0)}</div>
                          <div>
                            <span style={{ fontWeight: 600 }}>{s.student_name}</span>
                            {multi && <div style={{ fontSize: "0.7rem", color: "#1b5e42", fontWeight: 700 }}>{s.student_ids.length} students · group class</div>}
                          </div>
                        </div>
                      </td>
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
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          <button type="button" onClick={() => openEditForm(s)} className="btn btn-xs btn-ghost"><Pencil size={11} /> Edit</button>
                          {s.meeting_link && <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-primary"><Video size={11} /></a>}
                          {s.status === "scheduled" && <button onClick={() => updateStatus(s, "completed")} className="btn btn-xs btn-ghost">Done</button>}
                          {s.status === "scheduled" && <button onClick={() => updateStatus(s, "cancelled")} className="btn btn-xs btn-danger">Cancel</button>}
                          <button type="button" onClick={() => deleteSession(s)} className="btn btn-xs btn-danger"><Trash2 size={11} /> Delete</button>
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
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, overflow: "hidden", margin: "auto", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1b5e42)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <h2 style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                  {editingGroupKey ? "Edit Class" : "Schedule New Class"}
                </h2>
                <button onClick={closeForm} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <form onSubmit={saveSession} style={{ padding: 24, overflowY: "auto" }}>
                <div className="form-group">
                  <label className="form-label">Students * (select one or more)</label>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, maxHeight: 160, overflowY: "auto", padding: 10 }}>
                    {students.length === 0 ? (
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8" }}>No active students found.</p>
                    ) : students.map(s => (
                      <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", cursor: "pointer", fontSize: "0.86rem" }}>
                        <input
                          type="checkbox"
                          checked={form.student_ids.includes(s.id)}
                          onChange={() => toggleStudent(s.id)}
                        />
                        {s.full_name}
                      </label>
                    ))}
                  </div>
                  {form.student_ids.length > 0 && (
                    <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#1b5e42", fontWeight: 700 }}>
                      {form.student_ids.length} student{form.student_ids.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Tutor</label>
                  <select className="form-input form-select" value={form.tutor_id} onChange={e => setForm(p => ({ ...p, tutor_id: e.target.value }))}>
                    <option value="">Select tutor</option>
                    {tutors.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>

                {!editingGroupKey && (
                  <div className="form-group">
                    <label className="form-label">Schedule type</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <button
                        type="button"
                        className={`btn ${form.schedule_mode === "once" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setForm(p => ({ ...p, schedule_mode: "once" }))}
                        style={{ justifyContent: "center" }}
                      >
                        One-time
                      </button>
                      <button
                        type="button"
                        className={`btn ${form.schedule_mode === "weekly" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setForm(p => ({ ...p, schedule_mode: "weekly" }))}
                        style={{ justifyContent: "center" }}
                      >
                        Weekly recurring
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">
                      {editingGroupKey || form.schedule_mode === "once" ? "Date & Time *" : "Start date & time *"}
                    </label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={form.scheduled_at}
                      onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (min)</label>
                    <select className="form-input form-select" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))}>
                      {["30", "45", "60", "90"].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                </div>

                {editingGroupKey && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                      {["scheduled", "completed", "cancelled", "no_show", "rescheduled"].map(status => (
                        <option key={status} value={status}>{status.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                )}

                {!editingGroupKey && form.schedule_mode === "weekly" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Class days *</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {WEEKDAYS.map(day => {
                          const active = form.weekdays.includes(day.value);
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => toggleWeekday(day.value)}
                              className={`btn btn-xs ${active ? "btn-primary" : "btn-ghost"}`}
                              style={{ minWidth: 44 }}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                      <p style={{ margin: "8px 0 0", fontSize: "0.72rem", color: "#64748b" }}>
                        Classes will repeat on selected days at the same time.
                      </p>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Repeat for (weeks)</label>
                      <select className="form-input form-select" value={form.weeks_count} onChange={e => setForm(p => ({ ...p, weeks_count: e.target.value }))}>
                        {["1", "2", "4", "6", "8", "12", "16", "24"].map(w => (
                          <option key={w} value={w}>{w} week{w === "1" ? "" : "s"}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Meeting Link</label>
                  <input className="form-input" value={form.meeting_link} onChange={e => setForm(p => ({ ...p, meeting_link: e.target.value }))} placeholder="https://zoom.us/j/..." />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Class Focus / Notes</label>
                  <textarea className="form-input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional: revision focus, surah, or teacher note..." rows={3} style={{ resize: "vertical" }} />
                </div>

                {previewCount > 0 && !editingGroupKey && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 12px", marginBottom: 16, fontSize: "0.8rem", color: "#166534", fontWeight: 600 }}>
                    Will create {previewCount} session record{previewCount === 1 ? "" : "s"}
                    {form.schedule_mode === "weekly" ? " (students × recurring dates)" : form.student_ids.length > 1 ? " (group class)" : ""}.
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={closeForm} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving || !form.student_ids.length} style={{ flex: 1, justifyContent: "center" }}>
                    {saving ? "Saving..." : editingGroupKey ? "Save Changes" : "Schedule Class"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

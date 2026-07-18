"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { formatStudentLevel, getPeriodRange, isWithinPeriod, PROGRESS_PERIODS, ProgressPeriod } from "@/lib/portal";
import {
  ArrowLeft, CheckCircle2, Circle, ListChecks, CalendarClock, Sparkles,
  FileText, Star, Plus, BookOpen, Map, GraduationCap, Loader2, Pencil, X,
} from "lucide-react";
import { TIMEZONE_OPTIONS, timezoneForCountry } from "@/lib/timezones";
import { unwrapOne } from "@/lib/currency";

interface StudentDetail {
  id: string;
  full_name: string;
  age?: number;
  gender?: string | null;
  country?: string;
  level: string;
  course?: string;
  timezone?: string;
  source?: string | null;
  is_active: boolean;
  tutor_id?: string | null;
  parent_id?: string | null;
  tutor_name?: string;
  parent_name?: string;
}

interface WorkNote {
  id: string;
  student_id: string;
  tutor_id?: string;
  work_date: string;
  work_text: string;
  status: "pending" | "completed";
  completed_at?: string;
  created_at: string;
}

interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  surah?: string;
  lesson_type: string;
  planned_date?: string;
  completed_date?: string;
  status: string;
}

interface ReportItem {
  id: string;
  overall_rating?: string;
  tajweed_stars?: number;
  surah_covered?: string;
  pages_covered?: string;
  tutor_notes?: string;
  homework?: string;
  created_at: string;
  tutor_name?: string;
}

const RATING_CFG: Record<string, { color: string; bg: string }> = {
  excellent: { color: "#15803d", bg: "#dcfce7" },
  good: { color: "#1d4ed8", bg: "#dbeafe" },
  average: { color: "#a16207", bg: "#fef9c3" },
  needs_improvement: { color: "#b91c1c", bg: "#fee2e2" },
};

export default function StudentProgressHub({
  studentId,
  role,
  backHref,
}: {
  studentId: string;
  role: "admin" | "tutor";
  backHref: string;
}) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [notes, setNotes] = useState<WorkNote[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<ProgressPeriod>("today");
  const [currentUserId, setCurrentUserId] = useState("");
  const [assignedTutorId, setAssignedTutorId] = useState<string | undefined>(undefined);
  const [noteText, setNoteText] = useState("");
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [tutors, setTutors] = useState<{ id: string; full_name: string }[]>([]);
  const [parents, setParents] = useState<{ id: string; full_name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string; level: string }[]>([]);
  const [editForm, setEditForm] = useState({
    full_name: "",
    age: "",
    gender: "",
    country: "",
    level: "beginner",
    course: "",
    tutor_id: "",
    parent_id: "",
    timezone: "",
    source: "organic",
    is_active: true,
  });

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);

    const [{ data: studentRow }, { data: noteRows }, { data: roadmapRows }, { data: reportRows }] = await Promise.all([
      supabase.from("students")
        .select("id, full_name, age, gender, country, level, course, timezone, source, is_active, tutor_id, parent_id, tutor:profiles!students_tutor_id_fkey(full_name), parent:profiles!students_parent_id_fkey(full_name)")
        .eq("id", studentId)
        .maybeSingle(),
      supabase.from("daily_work_notes").select("id, student_id, tutor_id, work_date, work_text, status, completed_at, created_at").eq("student_id", studentId).order("work_date", { ascending: false }),
      supabase.from("course_roadmaps").select("id, title, description, surah, lesson_type, planned_date, completed_date, status").eq("student_id", studentId).order("planned_date", { ascending: true }),
      supabase.from("progress_reports").select("id, overall_rating, tajweed_stars, surah_covered, pages_covered, tutor_notes, homework, created_at, tutor:profiles(full_name)").eq("student_id", studentId).order("created_at", { ascending: false }).limit(30),
    ]);

    if (studentRow) {
      const s: any = studentRow;
      const tutor = unwrapOne<{ full_name?: string }>(s.tutor);
      const parent = unwrapOne<{ full_name?: string }>(s.parent);

      // Admin can always resolve names by id if the embed shape/RLS omits them.
      let tutorName = tutor?.full_name || "";
      let parentName = parent?.full_name || "";
      if (role === "admin") {
        const lookups: PromiseLike<{ data: { full_name: string } | null }>[] = [];
        if (s.tutor_id && !tutorName) {
          lookups.push(supabase.from("profiles").select("full_name").eq("id", s.tutor_id).maybeSingle());
        } else {
          lookups.push(Promise.resolve({ data: null }));
        }
        if (s.parent_id && !parentName) {
          lookups.push(supabase.from("profiles").select("full_name").eq("id", s.parent_id).maybeSingle());
        } else {
          lookups.push(Promise.resolve({ data: null }));
        }
        const [tutorLookup, parentLookup] = await Promise.all(lookups);
        if (!tutorName && tutorLookup.data?.full_name) tutorName = tutorLookup.data.full_name;
        if (!parentName && parentLookup.data?.full_name) parentName = parentLookup.data.full_name;
      }

      setStudent({
        id: s.id,
        full_name: s.full_name,
        age: s.age,
        gender: s.gender,
        country: s.country,
        level: s.level,
        course: s.course,
        timezone: s.timezone,
        source: s.source,
        is_active: s.is_active,
        tutor_id: s.tutor_id,
        parent_id: s.parent_id,
        tutor_name: tutorName || (s.tutor_id ? "Assigned" : "Unassigned"),
        parent_name: parentName || (s.parent_id ? "Linked" : "Unlinked"),
      });
      setAssignedTutorId(s.tutor_id || undefined);
    }
    setNotes(noteRows || []);
    setRoadmap(roadmapRows || []);
    setReports((reportRows || []).map((r: any) => ({
      ...r,
      tutor_name: unwrapOne<{ full_name?: string }>(r.tutor)?.full_name || "—",
    })));
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [studentId]);

  async function openEditModal() {
    if (!student) return;
    if (role === "admin") {
      const [{ data: tutorProfiles }, { data: parentProfiles }, { data: courseRows }] = await Promise.all([
        supabase.from("profiles").select("id, full_name").eq("role", "tutor"),
        supabase.from("profiles").select("id, full_name").eq("role", "parent"),
        supabase.from("courses").select("id, title, level").eq("is_active", true).order("sort_order"),
      ]);
      setTutors(tutorProfiles || []);
      setParents(parentProfiles || []);
      setCourses(courseRows || []);
    }
    setEditForm({
      full_name: student.full_name || "",
      age: student.age != null ? String(student.age) : "",
      gender: student.gender || "",
      country: student.country || "",
      level: student.level || "beginner",
      course: student.course || "",
      tutor_id: student.tutor_id || "",
      parent_id: student.parent_id || "",
      timezone: student.timezone || "",
      source: student.source || "organic",
      is_active: student.is_active,
    });
    setShowEdit(true);
  }

  async function saveStudentInfo(e: React.FormEvent) {
    e.preventDefault();
    if (role !== "admin") return;
    setEditSaving(true);
    const ageNum = Number.parseFloat(editForm.age);
    const { error } = await supabase.from("students").update({
      full_name: editForm.full_name.trim(),
      age: editForm.age.trim() === "" || Number.isNaN(ageNum) ? null : ageNum,
      gender: editForm.gender || null,
      country: editForm.country || null,
      level: editForm.level,
      course: editForm.course || null,
      tutor_id: editForm.tutor_id || null,
      parent_id: editForm.parent_id || null,
      timezone: editForm.timezone || "UTC",
      source: editForm.source,
      is_active: editForm.is_active,
    }).eq("id", studentId);

    if (error) {
      setMsg("Error: " + error.message);
    } else {
      // Keep upcoming sessions in sync when a student tutor is assigned.
      if (editForm.tutor_id) {
        await supabase
          .from("class_sessions")
          .update({ tutor_id: editForm.tutor_id })
          .eq("student_id", studentId)
          .eq("status", "scheduled")
          .is("tutor_id", null)
          .gte("scheduled_at", new Date().toISOString());
      }
      setMsg("Student info updated.");
      setShowEdit(false);
      await load();
    }
    setEditSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  const pendingItems = useMemo(() => {
    const noteItems = notes
      .filter(n => n.status === "pending" && (period === "all" || isWithinPeriod(n.work_date, period)))
      .map(n => ({ kind: "note" as const, id: n.id, text: n.work_text, date: n.work_date, raw: n }));
    const roadmapItems = roadmap
      .filter(r => r.status !== "completed" && r.status !== "skipped" && r.planned_date && (period === "all" || isWithinPeriod(r.planned_date, period)))
      .map(r => ({ kind: "roadmap" as const, id: r.id, text: r.title + (r.surah ? ` · ${r.surah}` : ""), date: r.planned_date!, raw: r }));
    return [...noteItems, ...roadmapItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [notes, roadmap, period]);

  const completedItems = useMemo(() => {
    const noteItems = notes
      .filter(n => n.status === "completed" && (period === "all" || isWithinPeriod(n.completed_at || n.work_date, period)))
      .map(n => ({ kind: "note" as const, id: n.id, text: n.work_text, date: n.completed_at || n.work_date, raw: n }));
    const roadmapItems = roadmap
      .filter(r => r.status === "completed" && r.completed_date && (period === "all" || isWithinPeriod(r.completed_date, period)))
      .map(r => ({ kind: "roadmap" as const, id: r.id, text: r.title + (r.surah ? ` · ${r.surah}` : ""), date: r.completed_date!, raw: r }));
    return [...noteItems, ...roadmapItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notes, roadmap, period]);

  const periodReports = useMemo(() => reports.filter(r => period === "all" || isWithinPeriod(r.created_at, period)), [reports, period]);

  async function toggleNote(note: WorkNote) {
    const nextStatus = note.status === "pending" ? "completed" : "pending";
    const { error } = await supabase.from("daily_work_notes").update({
      status: nextStatus,
      completed_at: nextStatus === "completed" ? new Date().toISOString() : null,
    }).eq("id", note.id);
    if (!error) {
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, status: nextStatus, completed_at: nextStatus === "completed" ? new Date().toISOString() : undefined } : n));
    }
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    setMsg("");
    const tutorIdForNote = role === "tutor" ? currentUserId : assignedTutorId;
    const { data, error } = await supabase.from("daily_work_notes").insert({
      student_id: studentId,
      tutor_id: tutorIdForNote || null,
      work_date: noteDate,
      work_text: noteText.trim(),
      status: "pending",
    }).select("id, student_id, tutor_id, work_date, work_text, status, completed_at, created_at").maybeSingle();
    if (error) {
      setMsg("Error: " + error.message);
    } else if (data) {
      setNotes(prev => [data as WorkNote, ...prev]);
      setNoteText("");
      setNoteDate(new Date().toISOString().split("T")[0]);
      setMsg("Daily work note added.");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  const { start: periodStart } = getPeriodRange(period);

  return (
    <>
      <TopBar title="Student Progress" subtitle={student?.full_name || "Loading..."} />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <Link href={backHref} className="btn btn-ghost btn-sm" style={{ marginBottom: 14, width: "fit-content" }}>
          <ArrowLeft size={14} /> Back to Students
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">{student?.full_name || "Student"}</h1>
            <p className="page-subtitle">
              {student ? `${formatStudentLevel(student.level)}${student.course ? ` · ${student.course}` : ""}${student.country ? ` · ${student.country}` : ""}` : "Loading student details..."}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {role === "admin" && student && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => void openEditModal()}>
                <Pencil size={14} /> Edit Info
              </button>
            )}
            {role === "tutor" && (
              <Link href={`/tutor/reports/new?student=${studentId}`} className="btn btn-outline btn-sm">
                <FileText size={14} /> Submit Full Report
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="empty-state"><Loader2 size={30} style={{ margin: "0 auto", animation: "spin 0.8s linear infinite" }} /></div>
        ) : !student ? (
          <div className="empty-state"><GraduationCap size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>Student not found</h3></div>
        ) : (
          <>
            {msg && (
              <div style={{ background: msg.startsWith("Error") ? "#fef2f2" : "#f0fdf4", border: `1px solid ${msg.startsWith("Error") ? "#fecaca" : "#bbf7d0"}`, color: msg.startsWith("Error") ? "#b91c1c" : "#15803d", borderRadius: 10, padding: "11px 16px", marginBottom: 16, fontSize: "0.83rem" }}>
                {msg}
              </div>
            )}

            <div className="student-hub-info-card">
              <div className="avatar" style={{ width: 52, height: 52, fontSize: "1.1rem" }}>{student.full_name.charAt(0)}</div>
              <div className="student-hub-info-grid">
                <div><span>Age</span><strong>{student.age != null ? student.age : "—"}</strong></div>
                <div><span>Gender</span><strong style={{ textTransform: "capitalize" }}>{student.gender || "—"}</strong></div>
                <div><span>Country</span><strong>{student.country || "—"}</strong></div>
                <div><span>Timezone</span><strong>{student.timezone || "—"}</strong></div>
                <div><span>Tutor</span><strong>{student.tutor_name}</strong></div>
                <div><span>Parent</span><strong>{student.parent_name}</strong></div>
                <div><span>Status</span><strong style={{ color: student.is_active ? "#15803d" : "#94a3b8" }}>{student.is_active ? "Active" : "Inactive"}</strong></div>
              </div>
            </div>

            <div className="period-tabs">
              {PROGRESS_PERIODS.map(p => (
                <button key={p.value} className={`period-tab ${period === p.value ? "active" : ""}`} onClick={() => setPeriod(p.value)}>
                  {p.label}
                </button>
              ))}
              {period !== "all" && (
                <span className="period-tab-hint">
                  <CalendarClock size={13} /> Since {periodStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>

            <div className="progress-hub-grid">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title"><ListChecks size={16} color="#1b5e42" /> To Do</h3>
                  <span className="badge badge-blue">{pendingItems.length} pending</span>
                </div>
                <div className="card-body" style={{ paddingBottom: pendingItems.length ? 8 : 20 }}>
                  {(role === "tutor" || role === "admin") && (
                    <form onSubmit={addNote} className="daily-note-form">
                      <textarea
                        className="form-input"
                        rows={2}
                        placeholder="e.g. Revise Surah Al-Mulk verses 1-10 with tajweed focus on Ghunnah"
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        required
                      />
                      <div className="daily-note-form-row">
                        <input type="date" className="form-input" value={noteDate} onChange={e => setNoteDate(e.target.value)} />
                        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                          <Plus size={14} /> {saving ? "Adding..." : "Add Daily Work"}
                        </button>
                      </div>
                    </form>
                  )}

                  {pendingItems.length === 0 ? (
                    <div className="progress-empty"><Sparkles size={22} style={{ opacity: 0.3 }} /> Nothing pending for this period.</div>
                  ) : (
                    <div className="progress-task-list">
                      {pendingItems.map(item => (
                        <div key={`${item.kind}-${item.id}`} className="progress-task-row">
                          <button
                            className="progress-task-check"
                            onClick={() => item.kind === "note" ? toggleNote(item.raw as WorkNote) : undefined}
                            disabled={item.kind !== "note"}
                            title={item.kind === "note" ? "Mark as done" : "Manage in Roadmap"}
                          >
                            <Circle size={18} color={item.kind === "note" ? "#1b5e42" : "#94a3b8"} />
                          </button>
                          <div className="progress-task-body">
                            <div className="progress-task-text">{item.text}</div>
                            <div className="progress-task-meta">
                              {item.kind === "roadmap" ? <span className="badge badge-purple">Roadmap</span> : <span className="badge badge-blue">Daily Work</span>}
                              <span>{new Date(item.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title"><CheckCircle2 size={16} color="#15803d" /> Completed</h3>
                  <span className="badge badge-green">{completedItems.length} done</span>
                </div>
                <div className="card-body">
                  {completedItems.length === 0 ? (
                    <div className="progress-empty"><CheckCircle2 size={22} style={{ opacity: 0.3 }} /> Nothing completed in this period yet.</div>
                  ) : (
                    <div className="progress-task-list">
                      {completedItems.map(item => (
                        <div key={`${item.kind}-${item.id}`} className="progress-task-row">
                          <button
                            className="progress-task-check"
                            onClick={() => item.kind === "note" ? toggleNote(item.raw as WorkNote) : undefined}
                            disabled={item.kind !== "note"}
                            title={item.kind === "note" ? "Mark as pending" : "Manage in Roadmap"}
                          >
                            <CheckCircle2 size={18} color="#15803d" />
                          </button>
                          <div className="progress-task-body">
                            <div className="progress-task-text" style={{ textDecoration: "line-through", color: "#94a3b8" }}>{item.text}</div>
                            <div className="progress-task-meta">
                              {item.kind === "roadmap" ? <span className="badge badge-purple">Roadmap</span> : <span className="badge badge-blue">Daily Work</span>}
                              <span>{new Date(item.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 18 }}>
              <div className="card-header">
                <h3 className="card-title"><BookOpen size={16} color="#1b5e42" /> Recent Progress Reports</h3>
                <Link href={role === "admin" ? "/admin/reports" : "/tutor/reports"} className="card-link">
                  {role === "admin" ? "All Reports" : "Manage reports"} →
                </Link>
              </div>
              {periodReports.length === 0 ? (
                <div className="empty-state"><FileText size={36} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No reports in this period</h3><p>Session progress reports will appear here for parents after you submit them.</p></div>
              ) : (
                <div className="table-shell">
                  <table className="data-table">
                    <thead><tr><th>Coverage</th><th>Tajweed</th><th>Rating</th><th>Tutor</th><th>Date</th>{role === "tutor" ? <th></th> : null}</tr></thead>
                    <tbody>
                      {periodReports.map(r => {
                        const cfg = RATING_CFG[r.overall_rating || ""] || { color: "#64748b", bg: "#f1f5f9" };
                        return (
                          <tr key={r.id}>
                            <td>{r.surah_covered || r.pages_covered || "—"}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <Star size={13} color="#c9a84c" /> {r.tajweed_stars || 0}/5
                              </div>
                            </td>
                            <td><span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{r.overall_rating?.replace("_", " ") || "—"}</span></td>
                            <td style={{ color: "#64748b" }}>{r.tutor_name}</td>
                            <td style={{ color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                            {role === "tutor" ? (
                              <td>
                                <Link href="/tutor/reports" className="btn btn-outline btn-xs">Open</Link>
                              </td>
                            ) : null}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showEdit && role === "admin" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, overflow: "hidden", margin: "auto", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "linear-gradient(135deg, #0f172a, #1b5e42)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <h2 style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Edit Student Info</h2>
              <button type="button" onClick={() => setShowEdit(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={saveStudentInfo} style={{ padding: 24, overflowY: "auto" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input type="number" className="form-input" value={editForm.age} onChange={e => setEditForm(p => ({ ...p, age: e.target.value }))} min={3} max={60} step="0.1" placeholder="e.g. 4.5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input form-select" value={editForm.gender} onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  className="form-input"
                  list="hub-student-country"
                  value={editForm.country}
                  onChange={e => {
                    const country = e.target.value;
                    setEditForm(p => ({ ...p, country, timezone: timezoneForCountry(country) || p.timezone }));
                  }}
                />
                <datalist id="hub-student-country">
                  {TIMEZONE_OPTIONS.map(option => <option key={option.country} value={option.country}>{option.label}</option>)}
                </datalist>
              </div>
              <div className="form-group">
                <label className="form-label">Level</label>
                <select className="form-input form-select" value={editForm.level} onChange={e => setEditForm(p => ({ ...p, level: e.target.value }))}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <select className="form-input form-select" value={editForm.course} onChange={e => setEditForm(p => ({ ...p, course: e.target.value }))}>
                  <option value="">Select course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.title}>{course.title} · {course.level}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Parent</label>
                <select className="form-input form-select" value={editForm.parent_id} onChange={e => setEditForm(p => ({ ...p, parent_id: e.target.value }))}>
                  <option value="">Unlinked</option>
                  {parents.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tutor</label>
                <select className="form-input form-select" value={editForm.tutor_id} onChange={e => setEditForm(p => ({ ...p, tutor_id: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {tutors.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <input className="form-input" list="hub-student-tz" value={editForm.timezone} onChange={e => setEditForm(p => ({ ...p, timezone: e.target.value }))} />
                <datalist id="hub-student-tz">
                  {TIMEZONE_OPTIONS.map(option => <option key={option.timezone} value={option.timezone}>{option.label}</option>)}
                </datalist>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input form-select" value={editForm.is_active ? "active" : "inactive"} onChange={e => setEditForm(p => ({ ...p, is_active: e.target.value === "active" }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowEdit(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editSaving} style={{ flex: 1, justifyContent: "center" }}>
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

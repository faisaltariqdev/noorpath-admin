"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { Sparkles, Plus, X, Search, Edit2, Power, Users, BookOpen, Star, ChevronDown, ChevronUp, Grid, Play } from "lucide-react";
import LESSONS, { TOTAL_LESSONS } from "@/data/kidsStudio";
import LessonPreviewModal from "@/components/LessonPreviewModal";

type Tab = "assignments" | "lessons";

interface Assignment {
  id: string;
  student_id: string;
  tutor_id: string | null;
  lesson_unlocked_up_to: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  student_name: string;
  student_age: number | null;
  parent_name: string;
  tutor_name: string;
  stars_total: number;
  lessons_done: number;
}

interface Student { id: string; full_name: string; age: number | null; parent_name: string }
interface Tutor   { id: string; full_name: string }

function StatCard({ value, label, icon, color }: { value: string | number; label: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="stat-icon" style={{ background: color + "20" }}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function KidsStudioAdminPage() {
  const [tab,         setTab]         = useState<Tab>("assignments");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filtered,    setFiltered]    = useState<Assignment[]>([]);
  const [students,    setStudents]    = useState<Student[]>([]);
  const [tutors,      setTutors]      = useState<Tutor[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editRow,     setEditRow]     = useState<Assignment | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState("");
  const [search,      setSearch]      = useState("");
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [previewLesson, setPreviewLesson] = useState<number | null>(null);

  const [form, setForm] = useState({
    student_id: "", tutor_id: "",
    lesson_unlocked_up_to: 1, notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [
      { data: rows },
      { data: tutorProfiles },
      { data: studs },
    ] = await Promise.all([
      supabase
        .from("kids_studio_assignments")
        .select(`
          id, student_id, tutor_id, lesson_unlocked_up_to, is_active, notes, created_at,
          student:students!kids_studio_assignments_student_id_fkey(full_name, age, parent:profiles!students_parent_id_fkey(full_name)),
          tutor:profiles!kids_studio_assignments_tutor_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name").eq("role", "tutor"),
      supabase
        .from("students")
        .select("id, full_name, age, parent:profiles!students_parent_id_fkey(full_name)")
        .eq("is_active", true),
    ]);

    // Fetch progress stats
    const studentIds = (rows || []).map((r: any) => r.student_id);
    let progressMap: Record<string, { stars: number; done: number }> = {};
    if (studentIds.length) {
      const { data: progress } = await supabase
        .from("kids_studio_progress")
        .select("student_id, stars_earned, is_completed")
        .in("student_id", studentIds);
      (progress || []).forEach((p: any) => {
        if (!progressMap[p.student_id]) progressMap[p.student_id] = { stars: 0, done: 0 };
        progressMap[p.student_id].stars += p.stars_earned || 0;
        if (p.is_completed) progressMap[p.student_id].done++;
      });
    }

    const mapped: Assignment[] = (rows || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      tutor_id: r.tutor_id,
      lesson_unlocked_up_to: r.lesson_unlocked_up_to,
      is_active: r.is_active,
      notes: r.notes,
      created_at: r.created_at,
      student_name: r.student?.full_name || "—",
      student_age: r.student?.age ?? null,
      parent_name: r.student?.parent?.full_name || "No parent",
      tutor_name: r.tutor?.full_name || "Unassigned",
      stars_total: progressMap[r.student_id]?.stars || 0,
      lessons_done: progressMap[r.student_id]?.done || 0,
    }));

    setAssignments(mapped);
    setFiltered(mapped);
    setTutors(tutorProfiles || []);
    setStudents(
      (studs || []).map((s: any) => ({
        id: s.id, full_name: s.full_name, age: s.age,
        parent_name: s.parent?.full_name || "—",
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) { setFiltered(assignments); return; }
    setFiltered(assignments.filter(a =>
      a.student_name.toLowerCase().includes(q) ||
      a.parent_name.toLowerCase().includes(q) ||
      a.tutor_name.toLowerCase().includes(q)
    ));
  }, [search, assignments]);

  function openAdd() {
    setEditRow(null);
    setForm({ student_id: "", tutor_id: "", lesson_unlocked_up_to: 1, notes: "" });
    setShowForm(true);
  }

  function openEdit(a: Assignment) {
    setEditRow(a);
    setForm({ student_id: a.student_id, tutor_id: a.tutor_id || "", lesson_unlocked_up_to: a.lesson_unlocked_up_to, notes: a.notes || "" });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id) { setMsg("Please select a student."); return; }
    setSaving(true);
    const payload = {
      student_id: form.student_id,
      tutor_id:   form.tutor_id || null,
      lesson_unlocked_up_to: form.lesson_unlocked_up_to,
      notes:      form.notes || null,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (editRow) {
      ({ error } = await supabase.from("kids_studio_assignments").update(payload).eq("id", editRow.id));
    } else {
      ({ error } = await supabase.from("kids_studio_assignments").insert({ ...payload, is_active: true }));
    }
    if (error) setMsg("Error: " + error.message);
    else {
      setMsg(editRow ? "Updated successfully!" : "Student assigned to Kids Studio!");
      setShowForm(false);
      await load();
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("kids_studio_assignments").update({ is_active: !current }).eq("id", id);
    setAssignments(p => p.map(a => a.id === id ? { ...a, is_active: !current } : a));
  }

  const totalActive   = assignments.filter(a => a.is_active).length;
  const totalStars    = assignments.reduce((s, a) => s + a.stars_total, 0);
  const totalLessDone = assignments.reduce((s, a) => s + a.lessons_done, 0);

  return (
    <>
      <TopBar title="Kids Studio" subtitle="Noorani Qaida assignments" />

      {/* ── Page Header ── */}
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <h1 className="page-title" style={{ margin: 0 }}>🎮 Kids Studio</h1>
            </div>
            <p className="page-subtitle">
              Assign students to the animated Noorani Qaida game · control lesson access · track progress
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={15} /> Assign Student
          </button>
        </div>
      </div>

      <div className="page-body">

        {/* ── Tab Switcher ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "2px solid #e2e8f0", paddingBottom: 0 }}>
          {([
            { key: "assignments", label: "Assignments", icon: <Users size={14} /> },
            { key: "lessons",     label: "All 18 Lessons",  icon: <Grid size={14} /> },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 18px", borderRadius: "10px 10px 0 0",
                border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
                background: tab === t.key ? "#fff" : "transparent",
                color: tab === t.key ? "#7c3aed" : "#64748b",
                borderBottom: tab === t.key ? "2px solid #7c3aed" : "2px solid transparent",
                marginBottom: "-2px",
                transition: "all 0.15s",
              }}
            >
              {t.icon} {t.label}
              {t.key === "lessons" && (
                <span style={{ background: "#7c3aed20", color: "#7c3aed", borderRadius: 8, padding: "1px 7px", fontSize: "0.72rem" }}>
                  {TOTAL_LESSONS}
                </span>
              )}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{
            background: msg.startsWith("Error") ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${msg.startsWith("Error") ? "#fecaca" : "#bbf7d0"}`,
            color: msg.startsWith("Error") ? "#b91c1c" : "#15803d",
            borderRadius: 10, padding: "11px 16px", marginBottom: 16, fontSize: "0.83rem",
          }}>{msg}</div>
        )}

        {/* ══ TAB: ASSIGNMENTS ══════════════════════════════════════ */}
        {tab === "assignments" && (<>

        {/* ── Stats ── */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: 20 }}>
          <StatCard value={assignments.length} label="Total Assigned"   icon={<Sparkles size={18} color="#7c3aed" />} color="#7c3aed" />
          <StatCard value={totalActive}        label="Active Now"       icon={<Power size={18} color="#16a34a" />}    color="#16a34a" />
          <StatCard value={`${totalStars}⭐`}  label="Stars Earned"     icon={<Star size={18} color="#d97706" />}     color="#d97706" />
          <StatCard value={totalLessDone}      label="Lessons Completed" icon={<BookOpen size={18} color="#2563eb" />}  color="#2563eb" />
        </div>

        {/* ── How it works banner ── */}
        <div style={{
          background: "linear-gradient(135deg, #1e0a3d 0%, #2d1b69 100%)",
          borderRadius: 14, padding: "16px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ fontSize: "2rem" }}>🎮</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>How Kids Studio Works</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", lineHeight: 1.6 }}>
              1. Assign a student below → 2. Set how many lessons they can access → 3. Student/Parent opens Kids Studio in their portal →
              4. Child plays the animated Noorani Qaida game → 5. Track their stars &amp; progress here
            </div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px",
            color: "#c4b5fd", fontSize: "0.78rem", fontWeight: 600,
          }}>
            {TOTAL_LESSONS} Lessons Available
          </div>
        </div>

        {/* ── Search ── */}
        <div className="filter-toolbar" style={{ marginBottom: 16 }}>
          <div className="search-field">
            <Search size={16} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student, parent, tutor..." />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div className="empty-state">
              <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={44} style={{ opacity: 0.15, margin: "0 auto 12px", display: "block" }} />
              <h3>No students assigned yet</h3>
              <p>Click &quot;Assign Student&quot; to get started.</p>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openAdd}>
                <Plus size={14} /> Assign First Student
              </button>
            </div>
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Parent / Family</th>
                    <th>Tutor</th>
                    <th>Lessons Unlocked</th>
                    <th>Progress</th>
                    <th>Stars</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <>
                      <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 10,
                              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
                            }}>
                              {a.student_name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{a.student_name}</div>
                              {a.student_age && <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>Age {a.student_age}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ color: "#64748b", fontSize: "0.83rem" }}>{a.parent_name}</td>
                        <td>
                          {a.tutor_id ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Users size={13} color="#7c3aed" />
                              <span style={{ fontSize: "0.83rem", color: "#1e293b" }}>{a.tutor_name}</span>
                            </div>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                              background: "#f5f3ff", border: "1px solid #c4b5fd",
                              borderRadius: 8, padding: "3px 10px",
                              color: "#7c3aed", fontWeight: 700, fontSize: "0.82rem",
                            }}>
                              Lesson 1–{a.lesson_unlocked_up_to}
                            </div>
                            <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>of {TOTAL_LESSONS}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 100 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b" }}>
                              <span>{a.lessons_done} done</span>
                              <span>{a.lesson_unlocked_up_to} unlocked</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
                              <div style={{
                                height: "100%", borderRadius: 3,
                                background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                                width: `${a.lesson_unlocked_up_to > 0 ? Math.round((a.lessons_done / a.lesson_unlocked_up_to) * 100) : 0}%`,
                                transition: "width 0.4s ease",
                              }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: "1rem" }}>⭐</span>
                            <span style={{ fontWeight: 700, color: "#d97706", fontSize: "0.88rem" }}>{a.stars_total}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${a.is_active ? "badge-green" : "badge-gray"}`}>
                            {a.is_active ? "Active" : "Paused"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={e => { e.stopPropagation(); openEdit(a); }}
                              title="Edit"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={e => { e.stopPropagation(); toggleActive(a.id, a.is_active); }}
                              title={a.is_active ? "Pause" : "Activate"}
                              style={{ color: a.is_active ? "#dc2626" : "#16a34a" }}
                            >
                              <Power size={12} /> {a.is_active ? "Pause" : "Activate"}
                            </button>
                            {expandedId === a.id
                              ? <ChevronUp size={14} color="#94a3b8" />
                              : <ChevronDown size={14} color="#94a3b8" />
                            }
                          </div>
                        </td>
                      </tr>

                      {/* ── Expanded lesson grid ── */}
                      {expandedId === a.id && (
                        <tr key={`${a.id}-expanded`}>
                          <td colSpan={8} style={{ padding: "0 16px 16px", background: "#faf5ff" }}>
                            <div style={{ paddingTop: 12 }}>
                              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#7c3aed", marginBottom: 10 }}>
                                🎮 Lesson Access for {a.student_name}
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {LESSONS.map(lesson => {
                                  const unlocked = lesson.id <= a.lesson_unlocked_up_to;
                                  return (
                                    <div key={lesson.id} style={{
                                      padding: "6px 12px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600,
                                      background: unlocked ? lesson.color + "20" : "#f1f5f9",
                                      border: `1px solid ${unlocked ? lesson.color + "50" : "#e2e8f0"}`,
                                      color: unlocked ? lesson.color : "#94a3b8",
                                      opacity: unlocked ? 1 : 0.6,
                                    }}>
                                      {lesson.emoji} L{lesson.id}: {lesson.title.length > 18 ? lesson.title.slice(0, 18) + "…" : lesson.title}
                                      {!unlocked && " 🔒"}
                                    </div>
                                  );
                                })}
                              </div>
                              {a.notes && (
                                <div style={{ marginTop: 10, fontSize: "0.78rem", color: "#64748b", fontStyle: "italic" }}>
                                  📝 Note: {a.notes}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        </>) /* end tab: assignments */}

        {/* ══ TAB: ALL LESSONS ══════════════════════════════════════ */}
        {tab === "lessons" && (
          <div>
            <div style={{
              background: "linear-gradient(135deg, #1e0a3d 0%, #2d1b69 100%)",
              borderRadius: 14, padding: "18px 22px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{ fontSize: "2rem" }}>🎬</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.92rem" }}>Complete Noorani Qaida — 18 Animated Lessons</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem", marginTop: 2 }}>
                  Click any lesson to launch the <b style={{ color: "#c4b5fd" }}>live animated preview</b> — exactly what your students see 🎮
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
              {LESSONS.map(lesson => (
                <div
                  key={lesson.id}
                  onClick={() => setPreviewLesson(lesson.id)}
                  className="ks-lesson-card"
                  style={{
                    borderRadius: 16, overflow: "hidden", cursor: "pointer",
                    background: lesson.bgGradient,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    position: "relative",
                  }}
                >
                  {/* Header */}
                  <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: "rgba(255,255,255,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem",
                    }}>
                      {lesson.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#fff" }}>
                        L{lesson.id}: {lesson.title}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.7rem", direction: "rtl", marginTop: 1 }}>
                        {lesson.titleUrdu}
                      </div>
                    </div>
                  </div>

                  {/* Letter strip — big & clear */}
                  <div style={{ display: "flex", gap: 6, padding: "4px 16px 12px", overflow: "hidden" }}>
                    {lesson.items.slice(0, 5).map((item, i) => (
                      <div key={i} style={{
                        flex: 1, textAlign: "center",
                        background: "rgba(255,255,255,0.1)",
                        border: `1px solid ${item.color}55`,
                        borderRadius: 10, padding: "8px 2px",
                      }}>
                        <div style={{
                          fontFamily: "var(--font-amiri, 'Amiri', serif)",
                          fontSize: "1.7rem", lineHeight: 1, color: "#fff",
                          direction: "rtl",
                          textShadow: `0 0 12px ${item.color}`,
                        }}>
                          {item.arabic}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer: play button */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 16px", background: "rgba(0,0,0,0.2)",
                  }}>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", fontWeight: 600 }}>
                      {lesson.items.length} letters
                    </span>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: "rgba(255,255,255,0.9)", color: "#1e0a3d",
                      borderRadius: 20, padding: "5px 14px", fontSize: "0.76rem", fontWeight: 800,
                    }}>
                      <Play size={12} style={{ fill: "#1e0a3d" }} /> Play Preview
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Animated Lesson Preview Modal ── */}
      <LessonPreviewModal
        lesson={previewLesson ? LESSONS.find(l => l.id === previewLesson) ?? null : null}
        onClose={() => setPreviewLesson(null)}
      />

      {/* ── Modal Form ── */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto",
        }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 500, overflow: "hidden", margin: "auto" }}>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #1e0a3d, #4c1d95)",
              padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Sparkles size={18} color="#c4b5fd" />
                <h2 style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                  {editRow ? "Edit Kids Studio Assignment" : "Assign Student to Kids Studio"}
                </h2>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: 24 }}>
              {msg && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 8, padding: "9px 14px", marginBottom: 16, fontSize: "0.82rem" }}>{msg}</div>
              )}

              {/* Student */}
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select
                  className="form-input form-select"
                  value={form.student_id}
                  onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))}
                  required
                  disabled={!!editRow}
                >
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}{s.age ? ` (Age ${s.age})` : ""} — {s.parent_name}
                    </option>
                  ))}
                </select>
                {editRow && <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 4 }}>Student cannot be changed. Create a new assignment if needed.</p>}
              </div>

              {/* Tutor */}
              <div className="form-group">
                <label className="form-label">Assign Tutor (optional)</label>
                <select
                  className="form-input form-select"
                  value={form.tutor_id}
                  onChange={e => setForm(p => ({ ...p, tutor_id: e.target.value }))}
                >
                  <option value="">No tutor assigned</option>
                  {tutors.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
                <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>The tutor can monitor this student&apos;s progress in their portal.</p>
              </div>

              {/* Lesson unlock */}
              <div className="form-group">
                <label className="form-label">
                  Unlock Lessons Up To: &nbsp;
                  <span style={{ color: "#7c3aed", fontWeight: 700 }}>Lesson {form.lesson_unlocked_up_to} — {LESSONS[form.lesson_unlocked_up_to - 1]?.emoji} {LESSONS[form.lesson_unlocked_up_to - 1]?.title}</span>
                </label>
                <input
                  type="range" min={1} max={TOTAL_LESSONS}
                  value={form.lesson_unlocked_up_to}
                  onChange={e => setForm(p => ({ ...p, lesson_unlocked_up_to: parseInt(e.target.value) }))}
                  style={{ width: "100%", accentColor: "#7c3aed" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8", marginTop: 2 }}>
                  <span>Lesson 1</span>
                  <span>Lesson {TOTAL_LESSONS}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                  {LESSONS.slice(0, form.lesson_unlocked_up_to).map(l => (
                    <span key={l.id} style={{
                      fontSize: "0.68rem", padding: "2px 8px", borderRadius: 6,
                      background: l.color + "20", color: l.color, border: `1px solid ${l.color}40`,
                    }}>{l.emoji} L{l.id}</span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="e.g. Focus on Lesson 3 this week, child is 5 years old..."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff",
                  border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontSize: "0.88rem",
                }}>
                  <Sparkles size={15} />
                  {saving ? "Saving..." : editRow ? "Update Assignment" : "Assign to Kids Studio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

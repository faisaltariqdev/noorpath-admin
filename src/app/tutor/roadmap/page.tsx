"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import {
  Plus, X, CheckCircle, Clock, BookOpen, Star, AlertCircle,
  ChevronDown, ChevronUp, GripVertical, Calendar, Edit2, Trash2,
  PlayCircle, SkipForward,
} from "lucide-react";
import { SURAHS } from "@/data/surahs";

interface Student {
  id: string;
  full_name: string;
  course?: string;
  level?: string;
}

type LessonType = "lesson" | "revision" | "test" | "milestone" | "holiday";
type RoadmapStatus = "pending" | "in_progress" | "completed" | "skipped";

interface RoadmapItem {
  id: string;
  student_id: string;
  title: string;
  description?: string;
  surah?: string;
  lesson_type: LessonType;
  planned_date?: string;
  completed_date?: string;
  order_index: number;
  status: RoadmapStatus;
  duration_minutes: number;
  notes?: string;
  created_at: string;
}

const TYPE_CONFIG: Record<LessonType, { label: string; color: string; bg: string; icon: React.ReactNode; border: string }> = {
  lesson:    { label: "Lesson",    color: "#1b5e42", bg: "#f0fdf4", border: "#bbf7d0", icon: <BookOpen size={13} /> },
  revision:  { label: "Revision",  color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", icon: <Clock size={13} /> },
  test:      { label: "Test",      color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: <Star size={13} /> },
  milestone: { label: "Milestone", color: "#c9a84c", bg: "#fffbeb", border: "#fde68a", icon: <CheckCircle size={13} /> },
  holiday:   { label: "Holiday",   color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", icon: <SkipForward size={13} /> },
};

const STATUS_CONFIG: Record<RoadmapStatus, { label: string; color: string; bg: string }> = {
  pending:     { label: "Upcoming",    color: "#64748b", bg: "#f1f5f9" },
  in_progress: { label: "In Progress", color: "#d97706", bg: "#fef9c3" },
  completed:   { label: "Completed",   color: "#15803d", bg: "#dcfce7" },
  skipped:     { label: "Skipped",     color: "#9f1239", bg: "#ffe4e6" },
};

const EMPTY_FORM = {
  title: "",
  description: "",
  surah: "",
  lesson_type: "lesson" as LessonType,
  planned_date: "",
  duration_minutes: 30,
  notes: "",
  status: "pending" as RoadmapStatus,
};

export default function TutorRoadmapPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<RoadmapItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | RoadmapStatus>("all");

  useEffect(() => {
    async function loadStudents() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: studs } = await supabase
        .from("students")
        .select("id, full_name, course, level")
        .eq("tutor_id", user.id)
        .eq("is_active", true)
        .order("full_name");
      const mapped = (studs || []) as Student[];
      setStudents(mapped);
      setSelectedId(mapped[0]?.id || "");
      setLoading(false);
    }
    loadStudents();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadRoadmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function loadRoadmap() {
    const { data } = await supabase
      .from("course_roadmaps")
      .select("*")
      .eq("student_id", selectedId)
      .order("order_index")
      .order("planned_date");
    setItems((data || []) as RoadmapItem[]);
  }

  function openAddForm() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(item: RoadmapItem) {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || "",
      surah: item.surah || "",
      lesson_type: item.lesson_type,
      planned_date: item.planned_date || "",
      duration_minutes: item.duration_minutes,
      notes: item.notes || "",
      status: item.status,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      student_id: selectedId,
      tutor_id: user?.id,
      title: form.title,
      description: form.description || null,
      surah: form.surah || null,
      lesson_type: form.lesson_type,
      planned_date: form.planned_date || null,
      duration_minutes: form.duration_minutes,
      notes: form.notes || null,
      status: form.status,
      order_index: editItem ? editItem.order_index : items.length,
      completed_date: form.status === "completed" ? new Date().toISOString().split("T")[0] : null,
      updated_at: new Date().toISOString(),
    };

    if (editItem) {
      await supabase.from("course_roadmaps").update(payload).eq("id", editItem.id);
    } else {
      await supabase.from("course_roadmaps").insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    setEditItem(null);
    await loadRoadmap();
  }

  async function updateStatus(id: string, status: RoadmapStatus) {
    const update: Partial<RoadmapItem> = { status, updated_at: new Date().toISOString() } as Partial<RoadmapItem> & { updated_at: string };
    if (status === "completed") (update as Record<string, string>).completed_date = new Date().toISOString().split("T")[0];
    await supabase.from("course_roadmaps").update(update).eq("id", id);
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...update } : it));
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this lesson from the roadmap?")) return;
    await supabase.from("course_roadmaps").delete().eq("id", id);
    setItems(prev => prev.filter(it => it.id !== id));
  }

  const selectedStudent = students.find(s => s.id === selectedId);

  const filteredItems = filterStatus === "all"
    ? items
    : items.filter(it => it.status === filterStatus);

  const completedCount = items.filter(it => it.status === "completed").length;
  const totalCount = items.filter(it => it.status !== "skipped").length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayItems = items.filter(it => it.planned_date === todayStr);

  if (loading) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Course Roadmap" subtitle="Plan and track lessons for each student" />
      <div className="page-content">

        {/* Student Selector */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--charcoal)", flexShrink: 0 }}>Select Student:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  style={{
                    padding: "7px 16px", borderRadius: 999, fontSize: "0.82rem", fontWeight: 600,
                    cursor: "pointer", transition: "all 0.15s",
                    border: selectedId === s.id ? "2px solid #1b5e42" : "2px solid var(--border)",
                    background: selectedId === s.id ? "#f0fdf4" : "#fff",
                    color: selectedId === s.id ? "#1b5e42" : "var(--muted)",
                  }}
                >
                  {s.full_name}
                  {s.course && <span style={{ marginLeft: 6, opacity: 0.6, fontWeight: 400 }}>· {s.course}</span>}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={openAddForm} style={{ flexShrink: 0 }}>
              <Plus size={14} /> Add Lesson
            </button>
          </div>
        </div>

        {selectedId && (
          <>
            {/* Progress Banner */}
            <div style={{
              background: "linear-gradient(135deg, #0f172a, #1b5e42)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 28px",
              marginBottom: 20,
              color: "#fff",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Roadmap Progress — {selectedStudent?.full_name}
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>
                    {completedCount} <span style={{ fontSize: "1rem", opacity: 0.6 }}>/ {totalCount} lessons done</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, height: 10 }}>
                    <div style={{
                      height: "100%", width: `${progressPct}%`,
                      background: "linear-gradient(90deg, #c9a84c, #e2c06a)",
                      borderRadius: 999, transition: "width 0.6s ease",
                    }} />
                  </div>
                  <div style={{ marginTop: 6, fontSize: "0.78rem", color: "rgba(255,255,255,0.55)" }}>
                    {progressPct}% complete
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "center" }}>
                  {[
                    { label: "Today", value: todayItems.length, color: "#c9a84c" },
                    { label: "Pending", value: items.filter(it => it.status === "pending").length, color: "#94a3b8" },
                    { label: "In Progress", value: items.filter(it => it.status === "in_progress").length, color: "#f59e0b" },
                    { label: "Total", value: items.length, color: "#fff" },
                  ].map(kpi => (
                    <div key={kpi.label}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                      <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Plan */}
            {todayItems.length > 0 && (
              <div style={{
                background: "#fffbeb", border: "1px solid #fde68a",
                borderRadius: "var(--radius)", padding: "14px 18px", marginBottom: 20,
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <Calendar size={18} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#92400e", marginBottom: 6 }}>
                    Today&apos;s Lessons ({todayItems.length})
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {todayItems.map(it => (
                      <span key={it.id} style={{
                        padding: "4px 12px", borderRadius: 999,
                        background: it.status === "completed" ? "#dcfce7" : "#fef3c7",
                        border: `1px solid ${it.status === "completed" ? "#86efac" : "#fde68a"}`,
                        color: it.status === "completed" ? "#15803d" : "#92400e",
                        fontSize: "0.78rem", fontWeight: 600,
                      }}>
                        {it.status === "completed" ? "✅" : "📖"} {it.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {(["all", "pending", "in_progress", "completed", "skipped"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  style={{
                    padding: "6px 14px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 600,
                    cursor: "pointer", transition: "all 0.15s",
                    border: `1.5px solid ${filterStatus === f ? "#1b5e42" : "var(--border)"}`,
                    background: filterStatus === f ? "#f0fdf4" : "#fff",
                    color: filterStatus === f ? "#1b5e42" : "var(--muted)",
                  }}
                >
                  {f === "all" ? `All (${items.length})` : `${STATUS_CONFIG[f]?.label || f} (${items.filter(it => it.status === f).length})`}
                </button>
              ))}
            </div>

            {/* Roadmap Items */}
            {filteredItems.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🗺️</div>
                <h3 style={{ marginBottom: 8 }}>No lessons in roadmap</h3>
                <p style={{ color: "var(--muted)", marginBottom: 20 }}>Start building your student&apos;s course plan</p>
                <button className="btn btn-primary" onClick={openAddForm}><Plus size={14} /> Add First Lesson</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredItems.map((item, idx) => {
                  const type = TYPE_CONFIG[item.lesson_type];
                  const status = STATUS_CONFIG[item.status];
                  const isExpanded = expandedId === item.id;
                  const isToday = item.planned_date === todayStr;
                  const isPast = item.planned_date && item.planned_date < todayStr && item.status === "pending";

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: "#fff",
                        border: `1.5px solid ${isToday ? "#c9a84c" : isPast ? "#fca5a5" : "var(--border)"}`,
                        borderRadius: "var(--radius)",
                        overflow: "hidden",
                        boxShadow: isToday ? "0 0 0 3px rgba(201,168,76,0.12)" : "var(--shadow-sm)",
                        transition: "all 0.2s",
                      }}
                    >
                      {/* Item Header */}
                      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                        {/* Number */}
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                          background: item.status === "completed" ? "#1b5e42" : "#f1f5f9",
                          color: item.status === "completed" ? "#fff" : "#64748b",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: 800,
                        }}>
                          {item.status === "completed" ? <CheckCircle size={16} /> : idx + 1}
                        </div>

                        {/* Type badge */}
                        <div style={{
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "3px 10px", borderRadius: 999, flexShrink: 0,
                          background: type.bg, border: `1px solid ${type.border}`,
                          color: type.color, fontSize: "0.72rem", fontWeight: 700,
                        }}>
                          {type.icon} {type.label}
                        </div>

                        {/* Title */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 700, fontSize: "0.9rem", color: "var(--charcoal)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {item.title}
                            {item.surah && <span style={{ color: "var(--muted)", fontWeight: 400, marginLeft: 6 }}>· {item.surah}</span>}
                            {isToday && <span style={{ marginLeft: 8, fontSize: "0.7rem", background: "#fef3c7", color: "#92400e", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>TODAY</span>}
                            {isPast && <span style={{ marginLeft: 8, fontSize: "0.7rem", background: "#fee2e2", color: "#dc2626", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>OVERDUE</span>}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2, display: "flex", gap: 10 }}>
                            {item.planned_date && (
                              <span>📅 {new Date(item.planned_date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
                            )}
                            <span>⏱ {item.duration_minutes} min</span>
                          </div>
                        </div>

                        {/* Status */}
                        <div style={{
                          padding: "4px 10px", borderRadius: 999, flexShrink: 0,
                          background: status.bg, color: status.color,
                          fontSize: "0.72rem", fontWeight: 700,
                        }}>
                          {status.label}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          {item.status !== "completed" && (
                            <button
                              onClick={() => updateStatus(item.id, "completed")}
                              title="Mark Complete"
                              style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #86efac", background: "#f0fdf4", color: "#15803d", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {item.status === "pending" && (
                            <button
                              onClick={() => updateStatus(item.id, "in_progress")}
                              title="Mark In Progress"
                              style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #fde68a", background: "#fffbeb", color: "#d97706", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <PlayCircle size={14} />
                            </button>
                          )}
                          <button onClick={() => openEdit(item)} title="Edit" style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid var(--border)", background: "#f8fafc", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => deleteItem(item.id)} title="Delete" style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Trash2 size={13} />
                          </button>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid var(--border)", background: "#f8fafc", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div style={{ padding: "0 18px 16px 18px", borderTop: "1px solid var(--border)" }}>
                          {item.description && (
                            <div style={{ marginTop: 12, marginBottom: 8 }}>
                              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Description</div>
                              <p style={{ fontSize: "0.82rem", color: "var(--charcoal)", lineHeight: 1.5, margin: 0 }}>{item.description}</p>
                            </div>
                          )}
                          {item.notes && (
                            <div style={{ marginTop: 10 }}>
                              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Tutor Notes</div>
                              <p style={{ fontSize: "0.82rem", color: "var(--charcoal)", lineHeight: 1.5, margin: 0, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, borderLeft: "3px solid #1b5e42" }}>{item.notes}</p>
                            </div>
                          )}
                          {item.completed_date && (
                            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, color: "#15803d", fontSize: "0.78rem", fontWeight: 600 }}>
                              <CheckCircle size={14} />
                              Completed on {new Date(item.completed_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                          )}
                          {/* Status buttons */}
                          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                            {(["pending", "in_progress", "completed", "skipped"] as RoadmapStatus[]).map(s => (
                              <button
                                key={s}
                                onClick={() => updateStatus(item.id, s)}
                                style={{
                                  padding: "4px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700,
                                  cursor: "pointer",
                                  border: `1.5px solid ${item.status === s ? STATUS_CONFIG[s].color : "var(--border)"}`,
                                  background: item.status === s ? STATUS_CONFIG[s].bg : "#fff",
                                  color: item.status === s ? STATUS_CONFIG[s].color : "var(--muted)",
                                }}
                              >
                                {STATUS_CONFIG[s].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1b5e42)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 1 }}>
                <h2 style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                  {editItem ? "Edit Lesson" : "Add Lesson to Roadmap"}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} style={{ padding: 24 }}>
                <div className="form-group">
                  <label className="form-label">Lesson Type</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {(Object.entries(TYPE_CONFIG) as Array<[LessonType, typeof TYPE_CONFIG[LessonType]]>).map(([key, cfg]) => (
                      <button
                        key={key} type="button"
                        onClick={() => setForm(p => ({ ...p, lesson_type: key }))}
                        style={{
                          padding: "8px 4px", borderRadius: 8, textAlign: "center",
                          border: `2px solid ${form.lesson_type === key ? cfg.color : "var(--border)"}`,
                          background: form.lesson_type === key ? cfg.bg : "#fff",
                          color: form.lesson_type === key ? cfg.color : "var(--muted)",
                          fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                        }}
                      >
                        {cfg.icon} {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lesson Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to Tajweed, Al-Fatiha Memorization..." required />
                </div>

                <div className="form-group">
                  <label className="form-label">Surah / Topic</label>
                  <input
                    className="form-input"
                    value={form.surah}
                    onChange={e => setForm(p => ({ ...p, surah: e.target.value }))}
                    placeholder="e.g. Al-Fatiha, Juz 1, Noon Sakinah..."
                    list="surah-list"
                  />
                  <datalist id="surah-list">
                    {SURAHS.map(s => <option key={s.number} value={s.name} />)}
                  </datalist>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What will be covered in this lesson..." rows={2} style={{ resize: "vertical" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Planned Date</label>
                    <input type="date" className="form-input" value={form.planned_date} onChange={e => setForm(p => ({ ...p, planned_date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <select className="form-input form-select" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))}>
                      {[15, 20, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as RoadmapStatus }))}>
                    {(Object.entries(STATUS_CONFIG) as Array<[RoadmapStatus, typeof STATUS_CONFIG[RoadmapStatus]]>).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Tutor Notes</label>
                  <textarea className="form-input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Private notes for this lesson..." rows={2} style={{ resize: "vertical" }} />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                    {saving ? "Saving..." : editItem ? "Update Lesson" : "Add to Roadmap"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

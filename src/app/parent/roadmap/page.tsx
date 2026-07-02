"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import ParentStudentSwitcher from "@/components/ParentStudentSwitcher";
import { CheckCircle, Clock, BookOpen, Star, Calendar, ChevronDown, ChevronUp, Lock, Zap } from "lucide-react";

interface StudentSummary {
  id: string;
  full_name: string;
  level?: string | null;
  course?: string | null;
}

type LessonType = "lesson" | "revision" | "test" | "milestone" | "holiday";
type RoadmapStatus = "pending" | "in_progress" | "completed" | "skipped";

interface RoadmapItem {
  id: string;
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
}

const TYPE_CONFIG: Record<LessonType, { label: string; color: string; bg: string; border: string; icon: React.ReactNode; emoji: string }> = {
  lesson:    { label: "Lesson",    color: "#1b5e42", bg: "#f0fdf4", border: "#bbf7d0", icon: <BookOpen size={14} />, emoji: "📖" },
  revision:  { label: "Revision",  color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", icon: <Clock size={14} />,    emoji: "🔄" },
  test:      { label: "Test",      color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: <Star size={14} />,     emoji: "📝" },
  milestone: { label: "Milestone", color: "#c9a84c", bg: "#fffbeb", border: "#fde68a", icon: <Zap size={14} />,      emoji: "🏆" },
  holiday:   { label: "Holiday",   color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", icon: <Calendar size={14} />, emoji: "🌙" },
};

export default function ParentRoadmapPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    async function loadRoadmap() {
      const { data } = await supabase
        .from("course_roadmaps")
        .select("id, title, description, surah, lesson_type, planned_date, completed_date, order_index, status, duration_minutes, notes")
        .eq("student_id", selectedId)
        .order("order_index")
        .order("planned_date");
      setItems((data || []) as RoadmapItem[]);
    }
    loadRoadmap();
  }, [selectedId]);

  const completedCount = items.filter(it => it.status === "completed").length;
  const totalCount = items.filter(it => it.status !== "skipped" && it.lesson_type !== "holiday").length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const todayStr = new Date().toISOString().split("T")[0];

  const upcomingItems = useMemo(() =>
    items.filter(it => it.status !== "completed" && it.status !== "skipped").slice(0, 3),
    [items]
  );

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, RoadmapItem[]> = {};
    const ungrouped: RoadmapItem[] = [];
    items.forEach(item => {
      if (item.planned_date) {
        const monthKey = new Date(item.planned_date + "T00:00:00").toLocaleDateString("en-GB", { month: "long", year: "numeric" });
        if (!groups[monthKey]) groups[monthKey] = [];
        groups[monthKey].push(item);
      } else {
        ungrouped.push(item);
      }
    });
    return { groups, ungrouped };
  }, [items]);

  if (loading) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Course Roadmap" subtitle="Your child's complete learning plan" />
      <div className="page-content">
        {students.length > 1 && (
          <ParentStudentSwitcher students={students} selectedId={selectedId} onChange={setSelectedId} />
        )}

        {items.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
            <h3 style={{ marginBottom: 8 }}>Roadmap Coming Soon</h3>
            <p style={{ color: "var(--muted)" }}>Your child&apos;s tutor hasn&apos;t created a roadmap yet. It will appear here once they plan the lessons.</p>
          </div>
        ) : (
          <>
            {/* Progress Hero */}
            <div style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1b5e42 60%, #134430 100%)",
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
              <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Learning Roadmap Progress
                  </div>
                  <div style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, marginBottom: 10 }}>
                    {progressPct}%
                    <span style={{ fontSize: "1rem", opacity: 0.6, marginLeft: 8 }}>complete</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, height: 12, marginBottom: 8 }}>
                    <div style={{
                      height: "100%", width: `${progressPct}%`,
                      background: "linear-gradient(90deg, #c9a84c, #e2c06a)",
                      borderRadius: 999, transition: "width 0.8s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
                    {completedCount} of {totalCount} lessons completed
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, textAlign: "center" }}>
                  {[
                    { label: "Completed",   value: completedCount,                                          color: "#86efac" },
                    { label: "Remaining",   value: items.filter(it => it.status === "pending").length,      color: "#94a3b8" },
                    { label: "In Progress", value: items.filter(it => it.status === "in_progress").length,  color: "#fde68a" },
                    { label: "Milestones",  value: items.filter(it => it.lesson_type === "milestone").length, color: "#c9a84c" },
                  ].map(kpi => (
                    <div key={kpi.label}>
                      <div style={{ fontSize: "1.8rem", fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                      <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Up */}
            {upcomingItems.length > 0 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Coming Up Next</h3>
                    <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 4 }}>The next lessons in your child&apos;s plan</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {upcomingItems.map((item, idx) => {
                    const type = TYPE_CONFIG[item.lesson_type];
                    const isToday = item.planned_date === todayStr;
                    return (
                      <div key={item.id} style={{
                        background: isToday ? "#fffbeb" : type.bg,
                        border: `1.5px solid ${isToday ? "#fde68a" : type.border}`,
                        borderRadius: "var(--radius-sm)",
                        padding: "16px",
                        position: "relative",
                      }}>
                        {idx === 0 && (
                          <div style={{ position: "absolute", top: -8, left: 12, background: "#1b5e42", color: "#fff", fontSize: "0.62rem", fontWeight: 800, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>
                            Next
                          </div>
                        )}
                        <div style={{ fontSize: 24, marginBottom: 8 }}>{type.emoji}</div>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: type.color, marginBottom: 4 }}>{item.title}</div>
                        {item.surah && <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{item.surah}</div>}
                        {item.planned_date && (
                          <div style={{ fontSize: "0.72rem", color: isToday ? "#92400e" : "var(--muted)", marginTop: 6, fontWeight: isToday ? 700 : 400 }}>
                            {isToday ? "📅 Today!" : new Date(item.planned_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full Roadmap Timeline */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Full Course Roadmap</h3>
                <div style={{ display: "flex", gap: 6 }}>
                  {(Object.entries(TYPE_CONFIG) as Array<[LessonType, typeof TYPE_CONFIG[LessonType]]>).slice(0, 3).map(([k, cfg]) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: cfg.color }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} /> {cfg.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Grouped by month */}
              {Object.entries(groupedByMonth.groups).map(([month, monthItems]) => (
                <div key={month} style={{ marginBottom: 8 }}>
                  <div style={{ padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid var(--border)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                    <Calendar size={14} style={{ color: "var(--muted)" }} />
                    <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--charcoal)" }}>{month}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)", marginLeft: "auto" }}>
                      {monthItems.filter(it => it.status === "completed").length}/{monthItems.length} done
                    </span>
                  </div>
                  {monthItems.map((item, idx) => (
                    <RoadmapRow
                      key={item.id}
                      item={item}
                      idx={idx}
                      todayStr={todayStr}
                      isExpanded={expandedId === item.id}
                      onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    />
                  ))}
                </div>
              ))}

              {/* Ungrouped items */}
              {groupedByMonth.ungrouped.length > 0 && (
                <div>
                  <div style={{ padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--charcoal)" }}>Unscheduled Lessons</span>
                  </div>
                  {groupedByMonth.ungrouped.map((item, idx) => (
                    <RoadmapRow
                      key={item.id}
                      item={item}
                      idx={idx}
                      todayStr={todayStr}
                      isExpanded={expandedId === item.id}
                      onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RoadmapRow({ item, idx, todayStr, isExpanded, onToggle }: {
  item: RoadmapItem;
  idx: number;
  todayStr: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const type = TYPE_CONFIG[item.lesson_type];
  const isToday = item.planned_date === todayStr;
  const isCompleted = item.status === "completed";
  const isMilestone = item.lesson_type === "milestone";

  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <div
        onClick={onToggle}
        style={{
          padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 14,
          cursor: "pointer",
          background: isToday ? "#fffbeb" : isCompleted ? "#f0fdf4" : "#fff",
          transition: "background 0.15s",
        }}
      >
        {/* Step indicator */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: isCompleted ? "#1b5e42" : isMilestone ? "#c9a84c" : "#f1f5f9",
          color: isCompleted ? "#fff" : isMilestone ? "#fff" : "var(--muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.88rem", fontWeight: 800,
          boxShadow: isMilestone ? "0 0 0 4px rgba(201,168,76,0.2)" : "none",
        }}>
          {isCompleted ? <CheckCircle size={16} /> : isMilestone ? "🏆" : idx + 1}
        </div>

        {/* Connector placeholder */}
        <div style={{ display: "none" }} />

        {/* Type tag */}
        <div style={{
          padding: "2px 8px", borderRadius: 999,
          background: type.bg, border: `1px solid ${type.border}`,
          color: type.color, fontSize: "0.7rem", fontWeight: 700,
          display: "flex", alignItems: "center", gap: 3, flexShrink: 0,
        }}>
          {type.emoji} {type.label}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: "0.88rem",
            color: isCompleted ? "#15803d" : "var(--charcoal)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {item.title}
            {item.surah && <span style={{ color: "var(--muted)", fontWeight: 400, marginLeft: 6 }}>· {item.surah}</span>}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {item.planned_date && (
              <span style={{ fontWeight: isToday ? 700 : 400, color: isToday ? "#d97706" : "var(--muted)" }}>
                📅 {isToday ? "Today" : new Date(item.planned_date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            )}
            <span>⏱ {item.duration_minutes} min</span>
          </div>
        </div>

        {/* Status badge */}
        <div style={{ flexShrink: 0 }}>
          {isCompleted ? (
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center", gap: 3 }}>
              <CheckCircle size={13} /> Done
            </span>
          ) : item.status === "in_progress" ? (
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#d97706", display: "flex", alignItems: "center", gap: 3 }}>
              <Clock size={13} /> In Progress
            </span>
          ) : item.status === "skipped" ? (
            <span style={{ fontSize: "0.72rem", color: "#9f1239" }}>Skipped</span>
          ) : (
            <Lock size={14} style={{ color: "var(--muted)", opacity: 0.5 }} />
          )}
        </div>

        <div style={{ color: "var(--muted)", flexShrink: 0 }}>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: "12px 20px 16px 66px", background: isCompleted ? "#f0fdf4" : "#f8fafc" }}>
          {item.description && (
            <p style={{ fontSize: "0.82rem", color: "var(--charcoal)", lineHeight: 1.6, margin: "0 0 10px" }}>
              {item.description}
            </p>
          )}
          {item.notes && (
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Tutor Note</div>
              <p style={{ fontSize: "0.82rem", color: "var(--charcoal)", lineHeight: 1.5, margin: 0 }}>{item.notes}</p>
            </div>
          )}
          {item.completed_date && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#15803d", fontSize: "0.78rem", fontWeight: 600 }}>
              <CheckCircle size={13} />
              Completed on {new Date(item.completed_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

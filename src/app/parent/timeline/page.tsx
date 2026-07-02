"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import ParentStudentSwitcher from "@/components/ParentStudentSwitcher";
import { Star, BookOpen, CheckCircle, Clock, Calendar, Heart, MessageCircle } from "lucide-react";

interface StudentSummary {
  id: string;
  full_name: string;
  level?: string | null;
  course?: string | null;
}

interface TimelineItem {
  id: string;
  type: "report" | "attendance" | "homework";
  date: string;
  title: string;
  subtitle?: string;
  rating?: string;
  tajweed_stars?: number;
  status?: string;
  notes?: string;
  emoji: string;
  color: string;
}

const RATING_EMOJI: Record<string, string> = {
  excellent: "🌟", good: "👍", average: "📈", needs_improvement: "💪",
};
const RATING_COLOR: Record<string, string> = {
  excellent: "#15803d", good: "#3b82f6", average: "#d97706", needs_improvement: "#dc2626",
};
const STATUS_EMOJI: Record<string, string> = {
  present: "✅", absent: "❌", late: "⏰", leave: "🏖️",
};
const STATUS_COLOR: Record<string, string> = {
  present: "#15803d", absent: "#dc2626", late: "#d97706", leave: "#3b82f6",
};

function StarRow({ count }: { count: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, verticalAlign: "middle" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={13} fill={i <= count ? "#c9a84c" : "none"} stroke={i <= count ? "#c9a84c" : "#cbd5e1"} />
      ))}
    </span>
  );
}

export default function TimelinePage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [items, setItems] = useState<TimelineItem[]>([]);
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
    async function loadData() {
      const [{ data: reports }, { data: attendance }, { data: homework }] = await Promise.all([
        supabase.from("progress_reports").select("id,overall_rating,tajweed_stars,surah_covered,tutor_notes,created_at").eq("student_id", selectedId).order("created_at", { ascending: false }).limit(20),
        supabase.from("attendance").select("id,status,notes,session_date").eq("student_id", selectedId).order("session_date", { ascending: false }).limit(20),
        supabase.from("homework_logs").select("id,homework_text,title,is_completed,created_at").eq("student_id", selectedId).order("created_at", { ascending: false }).limit(20),
      ]);

      const timeline: TimelineItem[] = [
        ...(reports || []).map((r: { id: string; overall_rating: string; tajweed_stars?: number; surah_covered?: string; tutor_notes?: string; created_at: string }) => ({
          id: `r-${r.id}`,
          type: "report" as const,
          date: r.created_at,
          title: `Class Report — ${r.surah_covered || "Quran Lesson"}`,
          subtitle: `Rating: ${(r.overall_rating || "").replace("_", " ")}`,
          rating: r.overall_rating,
          tajweed_stars: r.tajweed_stars,
          notes: r.tutor_notes,
          emoji: RATING_EMOJI[r.overall_rating] || "📋",
          color: RATING_COLOR[r.overall_rating] || "#64748b",
        })),
        ...(attendance || []).map((a: { id: string; status: string; notes?: string; session_date?: string }) => ({
          id: `a-${a.id}`,
          type: "attendance" as const,
          date: a.session_date || new Date().toISOString(),
          title: `Attendance — ${(a.status || "").charAt(0).toUpperCase() + (a.status || "").slice(1)}`,
          status: a.status,
          notes: a.notes,
          emoji: STATUS_EMOJI[a.status] || "📅",
          color: STATUS_COLOR[a.status] || "#64748b",
        })),
        ...(homework || []).map((h: { id: string; homework_text?: string; title?: string; is_completed: boolean; created_at: string }) => ({
          id: `h-${h.id}`,
          type: "homework" as const,
          date: h.created_at,
          title: `Homework — ${h.title || "Assigned Task"}`,
          subtitle: h.homework_text,
          status: h.is_completed ? "completed" : "pending",
          emoji: h.is_completed ? "✅" : "📝",
          color: h.is_completed ? "#15803d" : "#d97706",
        })),
      ];

      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setItems(timeline);
    }
    loadData();
  }, [selectedId]);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function groupByDate(items: TimelineItem[]) {
    const groups: Record<string, TimelineItem[]> = {};
    items.forEach(item => {
      const dateKey = new Date(item.date).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return Object.entries(groups);
  }

  const grouped = groupByDate(items);

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Class Timeline" subtitle="A daily story of your child's learning" />
      <div className="page-content">
        {students.length > 1 && (
          <ParentStudentSwitcher students={students} selectedId={selectedId} onChange={setSelectedId} />
        )}

        {items.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📖</div>
            <h3 style={{ marginBottom: 8, color: "var(--charcoal)" }}>Your Story Begins Here</h3>
            <p style={{ color: "var(--muted)" }}>Once your child starts classes, their daily learning story will appear here.</p>
          </div>
        ) : (
          <div>
            {grouped.map(([dateStr, dayItems]) => (
              <div key={dateStr} style={{ marginBottom: 32 }}>
                {/* Date Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    background: "var(--charcoal)",
                    color: "#fff",
                    padding: "4px 16px",
                    borderRadius: 999,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}>
                    {formatDate(dayItems[0].date)}
                  </div>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                    <Calendar size={12} style={{ display: "inline", marginRight: 4 }} />
                    {new Date(dayItems[0].date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                  </div>
                </div>

                {/* Story Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {dayItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      style={{
                        background: "#fff",
                        border: `1.5px solid ${item.color}33`,
                        borderRadius: "var(--radius)",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: expandedId === item.id ? "var(--shadow)" : "var(--shadow-sm)",
                      }}
                    >
                      {/* Story Header — Instagram-style gradient */}
                      <div style={{
                        background: `linear-gradient(135deg, ${item.color}22, ${item.color}08)`,
                        borderBottom: `1px solid ${item.color}22`,
                        padding: "16px 16px 12px",
                        display: "flex", alignItems: "flex-start", gap: 12,
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: `${item.color}15`,
                          border: `2px solid ${item.color}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20, flexShrink: 0,
                        }}>
                          {item.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 700, fontSize: "0.85rem", color: "var(--charcoal)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
                            {item.type === "report" && item.rating && (
                              <span style={{ color: item.color, fontWeight: 600, textTransform: "capitalize" }}>
                                {item.rating.replace("_", " ")}
                              </span>
                            )}
                            {item.type === "homework" && (
                              <span style={{ color: item.color, fontWeight: 600 }}>
                                {item.status === "completed" ? "Homework Done!" : "Homework Pending"}
                              </span>
                            )}
                            {item.type === "attendance" && item.status && (
                              <span style={{ color: item.color, fontWeight: 600, textTransform: "capitalize" }}>
                                {item.status}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{
                          fontSize: "0.65rem", color: "var(--muted)",
                          flexShrink: 0,
                          marginTop: 2,
                        }}>
                          {new Date(item.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>

                      {/* Tajweed Stars */}
                      {item.type === "report" && item.tajweed_stars && (
                        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${item.color}11` }}>
                          <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 4 }}>Tajweed</div>
                          <StarRow count={item.tajweed_stars} />
                        </div>
                      )}

                      {/* Expanded notes */}
                      {expandedId === item.id && item.notes && (
                        <div style={{
                          padding: "12px 16px",
                          background: `${item.color}06`,
                          borderTop: `1px solid ${item.color}15`,
                        }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                            <MessageCircle size={13} style={{ color: item.color, flexShrink: 0, marginTop: 1 }} />
                            <p style={{ fontSize: "0.8rem", color: "var(--charcoal)", lineHeight: 1.5, margin: 0 }}>
                              {item.notes}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                        <Heart size={13} style={{ color: "#f87171", opacity: 0.7 }} />
                        <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>Tap to see details</span>
                        <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: `${item.color}`, fontWeight: 700 }}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

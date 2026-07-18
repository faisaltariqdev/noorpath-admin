"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import DashboardAnnouncementBanner from "@/features/announcements/DashboardAnnouncementBanner";
import { getSessionSubject } from "@/lib/portal";
import { unwrapOne } from "@/lib/currency";
import { Calendar, Clock, BookOpen, Users, Video, CheckCircle, ArrowUpRight, Star, FileText } from "lucide-react";
import Link from "next/link";

interface ClassSession {
  id: string;
  student: string;
  course?: string;
  scheduled_at: string;
  duration: number;
  status: string;
  meeting_link: string;
  notes?: string;
}
interface TutorStats { todayCount: number; completedCount: number; studentsCount: number; pendingReports: number; }

const STATUS_BADGE: Record<string, string> = {
  scheduled: "badge badge-blue", completed: "badge badge-green",
  cancelled: "badge badge-red", no_show: "badge badge-gray",
};

export default function TutorDashboard() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [upcoming, setUpcoming] = useState<ClassSession[]>([]);
  const [stats, setStats] = useState<TutorStats>({ todayCount: 0, completedCount: 0, studentsCount: 0, pendingReports: 0 });
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const [{ data: todaySessions }, { data: upcomingSessions }, { count: studentsCount }, { data: completedSessions }, { data: reports }] = await Promise.all([
        supabase.from("class_sessions")
          .select("id, scheduled_at, duration_minutes, status, meeting_link, notes, student:students(full_name, course)")
          .eq("tutor_id", user.id)
          .gte("scheduled_at", todayStart.toISOString())
          .lte("scheduled_at", todayEnd.toISOString())
          .order("scheduled_at", { ascending: true }),
        supabase.from("class_sessions")
          .select("id, scheduled_at, duration_minutes, status, meeting_link, notes, student:students(full_name, course)")
          .eq("tutor_id", user.id)
          .eq("status", "scheduled")
          .gte("scheduled_at", now.toISOString())
          .lte("scheduled_at", weekEnd.toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(8),
        supabase.from("students").select("*", { count: "exact", head: true }).eq("tutor_id", user.id).eq("is_active", true),
        supabase.from("class_sessions").select("id").eq("tutor_id", user.id).eq("status", "completed"),
        supabase.from("progress_reports").select("session_id").eq("tutor_id", user.id).not("session_id", "is", null),
      ]);
      const reportedSessionIds = new Set((reports || []).map((report: any) => report.session_id));
      const pendingReports = (completedSessions || []).filter((session: any) => !reportedSessionIds.has(session.id)).length;
      const mapSession = (s: any): ClassSession => {
        const student = unwrapOne(s.student);
        return {
          id: s.id,
          student: student?.full_name || "—",
          course: student?.course || "",
          scheduled_at: s.scheduled_at,
          duration: s.duration_minutes || 30,
          status: s.status,
          meeting_link: s.meeting_link || "",
          notes: s.notes || "",
        };
      };
      const mapped = (todaySessions || []).map(mapSession)
        .sort((a, b) => {
          const aUpcoming = a.status === "scheduled" ? 0 : 1;
          const bUpcoming = b.status === "scheduled" ? 0 : 1;
          if (aUpcoming !== bUpcoming) return aUpcoming - bUpcoming;
          return +new Date(a.scheduled_at) - +new Date(b.scheduled_at);
        });
      const upcomingMapped = (upcomingSessions || []).map(mapSession)
        .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at));
      const completed = mapped.filter(s => s.status === "completed").length;
      setSessions(mapped);
      setUpcoming(upcomingMapped);
      setStats({ todayCount: mapped.length, completedCount: completed, studentsCount: studentsCount || 0, pendingReports });
      setLoading(false);
    }
    load();
  }, []);

  async function markDone(id: string) {
    await supabase.from("class_sessions").update({ status: "completed" }).eq("id", id);
    setSessions(p => p.map(s => s.id === id ? { ...s, status: "completed" } : s));
    setStats(p => ({ ...p, completedCount: p.completedCount + 1 }));
  }

  const statCards = [
    { label: "Today's Classes", value: stats.todayCount, icon: Calendar, color: "#1b5e42", bg: "#f0fdf4" },
    { label: "Completed", value: stats.completedCount, icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
    { label: "My Students", value: stats.studentsCount, icon: Users, color: "#2563eb", bg: "#eff6ff" },
    { label: "Reports Pending", value: stats.pendingReports, icon: FileText, color: "#d97706", bg: "#fffbeb" },
  ];

  if (loading) return (
    <>
      <TopBar title="Tutor Dashboard" />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #1b5e42", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );

  return (
    <>
      <TopBar title="Tutor Dashboard" subtitle={today} />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>Teacher Dashboard</h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.8rem" }}>{today}</p>
          </div>
          <Link href="/tutor/reports/new" className="btn btn-primary btn-sm">
            <FileText size={14} /> Submit Report
          </Link>
        </div>
      </div>
      <div className="page-body">
        <DashboardAnnouncementBanner inboxHref="/tutor/messages" />
        <div className="stats-grid">
          {statCards.map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-icon" style={{ background: c.bg, marginBottom: 12 }}>
                <c.icon size={20} color={c.color} />
              </div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="portal-dashboard-split">
          {/* Sessions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Calendar size={15} color="#1b5e42" /> Today&apos;s Schedule</h3>
              <Link href="/tutor/classes" className="card-link">Full Calendar →</Link>
            </div>
            {sessions.length === 0 ? (
              <div className="empty-state">
                <Calendar size={40} /><h3>No classes today</h3><p>You have no scheduled classes for today. Enjoy your time off!</p>
              </div>
            ) : (
              <div style={{ padding: "8px 0" }}>
                {sessions.map(s => (
                  <div key={s.id} style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <BookOpen size={20} color="#1b5e42" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>{s.student}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <Clock size={12} />
                        {new Date(s.scheduled_at).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })} · {s.duration} min · {getSessionSubject(s.course, s.notes)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span className={STATUS_BADGE[s.status] || "badge badge-gray"}>{s.status}</span>
                      {s.status !== "completed" && (
                        <>
                          {s.meeting_link && (
                            <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-xs">
                              <Video size={12} /> Join
                            </a>
                          )}
                          <button onClick={() => markDone(s.id)} className="btn btn-ghost btn-xs">
                            <CheckCircle size={12} /> Done
                          </button>
                        </>
                      )}
                      {s.status === "completed" && (
                        <Link href={`/tutor/reports/new?student_name=${encodeURIComponent(s.student)}&session=${s.id}`} className="btn btn-outline btn-xs">
                          <FileText size={12} /> Report
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {upcoming.length > 0 && (
              <div style={{ borderTop: "1px solid #f1f5f9", padding: "14px 20px 8px" }}>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0f172a", marginBottom: 8 }}>
                  Upcoming (next 7 days) · soonest first
                </div>
                {upcoming.map((s) => (
                  <div key={`up-${s.id}`} style={{ padding: "10px 0", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.84rem" }}>{s.student}</div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        {new Date(s.scheduled_at).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}
                        {" · "}{getSessionSubject(s.course, s.notes)}
                      </div>
                    </div>
                    {s.meeting_link && (
                      <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs">
                        <Video size={12} /> Join
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "My Students", href: "/tutor/students", icon: Users, color: "#2563eb", bg: "#eff6ff" },
              { label: "Submit Report", href: "/tutor/reports/new", icon: Star, color: "#d97706", bg: "#fffbeb" },
              { label: "Homework Templates", href: "/tutor/homework", icon: BookOpen, color: "#7c3aed", bg: "#f5f3ff" },
              { label: "My Earnings", href: "/tutor/earnings", icon: ArrowUpRight, color: "#1b5e42", bg: "#f0fdf4" },
            ].map(a => (
              <Link key={a.label} href={a.href} className="action-card">
                <div style={{ width: 34, height: 34, borderRadius: 10, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <a.icon size={16} color={a.color} />
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{a.label}</span>
                <ArrowUpRight size={14} style={{ color: "#94a3b8", marginLeft: "auto" }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

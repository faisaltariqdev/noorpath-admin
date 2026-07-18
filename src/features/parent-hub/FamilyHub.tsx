"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Star,
  TrendingUp,
  Users,
  Flame,
  BarChart2,
  X,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { MetricCard, PortalGrid, SectionCard, LoadingState, EmptyState } from "@/components/ui/PortalUI";
import DashboardAnnouncementBanner from "@/features/announcements/DashboardAnnouncementBanner";
import { supabase } from "@/lib/supabase";
import { formatStudentLevel } from "@/lib/portal";
import { loadFamilyData } from "./loadFamilyData";
import type {
  ChildCardData,
  ChildFilter,
  FamilyChild,
  FamilyMetrics,
  HubAttendance,
  HubHomework,
  HubReport,
  HubSection,
  HubSession,
} from "./types";

const SECTIONS: { id: HubSection; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "today", label: "Today's Class" },
  { id: "homework", label: "Homework" },
  { id: "progress", label: "Progress" },
  { id: "attendance", label: "Attendance" },
  { id: "history", label: "Class History" },
  { id: "reports", label: "Reports" },
];

function pctBar(value: number, color = "#1b5e42") {
  return (
    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: "100%", background: color }} />
    </div>
  );
}

function hwBucket(item: HubHomework): "pending" | "completed" | "overdue" | "submitted" {
  if (item.is_completed || item.status === "completed") return "completed";
  if (item.status === "submitted" || item.submitted_at) return "submitted";
  if (item.due_date && new Date(item.due_date) < new Date() && !item.is_completed) return "overdue";
  return "pending";
}

export default function FamilyHub() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const childParam = searchParams.get("child") || "all";
  const sectionParam = (searchParams.get("section") as HubSection) || "overview";

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<FamilyChild[]>([]);
  const [metrics, setMetrics] = useState<FamilyMetrics | null>(null);
  const [cards, setCards] = useState<ChildCardData[]>([]);
  const [homework, setHomework] = useState<HubHomework[]>([]);
  const [attendance, setAttendance] = useState<HubAttendance[]>([]);
  const [reports, setReports] = useState<HubReport[]>([]);
  const [sessions, setSessions] = useState<HubSession[]>([]);
  const [todaySessions, setTodaySessions] = useState<HubSession[]>([]);
  const [profileChild, setProfileChild] = useState<ChildCardData | null>(null);
  const [hwTab, setHwTab] = useState<"pending" | "completed" | "overdue" | "submitted">("pending");
  const [marking, setMarking] = useState<string | null>(null);

  const childFilter: ChildFilter = childParam === "all" || !childParam ? "all" : childParam;
  const section: HubSection = SECTIONS.some((s) => s.id === sectionParam) ? sectionParam : "overview";

  const setQuery = useCallback(
    (next: { child?: string; section?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.child !== undefined) params.set("child", next.child);
      if (next.section !== undefined) params.set("section", next.section);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const reload = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const data = await loadFamilyData(user.id);
    setChildren(data.children);
    setMetrics(data.metrics);
    setCards(data.cards);
    setHomework(data.homework);
    setAttendance(data.attendance);
    setReports(data.reports);
    setSessions(data.sessions);
    setTodaySessions(data.todaySessions);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filteredIds = useMemo(
    () => (childFilter === "all" ? children.map((c) => c.id) : [childFilter]),
    [childFilter, children]
  );

  const scopedMetrics = useMemo(() => {
    if (!metrics || childFilter === "all") return metrics;
    const card = cards.find((c) => c.id === childFilter);
    if (!card) return metrics;
    const childHw = homework.filter((h) => h.student_id === childFilter);
    const childAtt = attendance.filter((a) => a.student_id === childFilter);
    const present = childAtt.filter((a) => a.status === "present" || a.status === "late").length;
    const childReports = reports.filter((r) => r.student_id === childFilter);
    const scores = childReports.map((r) => Number(r.tajweed_stars || 0)).filter((n) => n > 0);
    return {
      ...metrics,
      totalChildren: 1,
      todaysClasses: todaySessions.filter((s) => s.student_id === childFilter).length,
      completedLessons: sessions.filter((s) => s.student_id === childFilter && s.status === "completed").length,
      pendingHomework: childHw.filter((h) => !h.is_completed).length,
      averageAttendance: childAtt.length ? Math.round((present / childAtt.length) * 100) : 0,
      overallProgress: card.progressPct,
      averageScore: scores.length
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 20)
        : 0,
    };
  }, [metrics, childFilter, cards, homework, attendance, reports, todaySessions, sessions]);

  const scopedHomework = homework.filter((h) => filteredIds.includes(h.student_id));
  const scopedAttendance = attendance.filter((a) => filteredIds.includes(a.student_id));
  const scopedReports = reports.filter((r) => filteredIds.includes(r.student_id));
  const scopedHistory = sessions
    .filter((s) => filteredIds.includes(s.student_id) && s.status === "completed")
    .slice(0, 30);
  const scopedToday = todaySessions.filter((s) => filteredIds.includes(s.student_id));
  const scopedCards = childFilter === "all" ? cards : cards.filter((c) => c.id === childFilter);

  const visibleHw = scopedHomework.filter((h) => hwBucket(h) === hwTab);

  async function markHomeworkDone(id: string) {
    setMarking(id);
    const { error } = await supabase
      .from("homework_logs")
      .update({
        is_completed: true,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);
    setMarking(null);
    if (error) {
      alert("Could not update homework: " + error.message);
      return;
    }
    await reload();
  }

  if (loading || !scopedMetrics) {
    return (
      <>
        <TopBar title="Family Hub" subtitle="Loading your children…" />
        <div className="page-body"><LoadingState label="Loading family dashboard…" /></div>
      </>
    );
  }

  if (!children.length) {
    return (
      <>
        <TopBar title="Family Hub" />
        <div className="page-body">
          <EmptyState
            icon={Users}
            title="No children linked"
            description="Ask your academy admin to link your children to this parent account."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="Family Hub"
        subtitle={childFilter === "all" ? "All children" : children.find((c) => c.id === childFilter)?.full_name}
      />
      <div className="page-body" style={{ paddingTop: 20 }}>
        <DashboardAnnouncementBanner inboxHref="/parent/messages" />

        {/* Child tabs */}
        <div
          role="tablist"
          aria-label="Children"
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
            marginBottom: 18,
            WebkitOverflowScrolling: "touch",
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={childFilter === "all"}
            className={`btn ${childFilter === "all" ? "btn-primary" : "btn-outline"} btn-sm`}
            onClick={() => setQuery({ child: "all" })}
            style={{ flexShrink: 0, minHeight: 44 }}
          >
            All Children
          </button>
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              role="tab"
              aria-selected={childFilter === child.id}
              className={`btn ${childFilter === child.id ? "btn-primary" : "btn-outline"} btn-sm`}
              onClick={() => setQuery({ child: child.id })}
              style={{ flexShrink: 0, minHeight: 44 }}
            >
              {child.full_name}
            </button>
          ))}
        </div>

        {/* Section tabs */}
        <div
          role="tablist"
          aria-label="Dashboard sections"
          style={{
            display: "flex",
            gap: 0,
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            overflowX: "auto",
            marginBottom: 20,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={section === s.id}
              onClick={() => setQuery({ section: s.id })}
              style={{
                padding: "12px 16px",
                border: "none",
                background: section === s.id ? "#1b5e42" : "transparent",
                color: section === s.id ? "#fff" : "#64748b",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                minHeight: 44,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Family summary */}
        <div style={{ marginBottom: 20 }}>
          <PortalGrid className="family-metrics">
            <MetricCard label="Total Children" value={scopedMetrics.totalChildren} icon={Users} tone="green" />
            <MetricCard label="Today's Classes" value={scopedMetrics.todaysClasses} icon={Calendar} tone="blue" />
            <MetricCard label="Completed Lessons" value={scopedMetrics.completedLessons} icon={CheckCircle} tone="green" />
            <MetricCard label="Pending Homework" value={scopedMetrics.pendingHomework} icon={BookOpen} tone="gold" />
            <MetricCard label="Avg Attendance" value={`${scopedMetrics.averageAttendance}%`} icon={Clock} tone="blue" />
            <MetricCard label="Overall Progress" value={`${scopedMetrics.overallProgress}%`} icon={TrendingUp} tone="violet" />
            <MetricCard label="Streak" value={`${scopedMetrics.overallStreak}d`} icon={Flame} tone="gold" />
            <MetricCard label="Avg Score" value={`${scopedMetrics.averageScore}%`} icon={Star} tone="gold" />
            <MetricCard label="Badges" value={scopedMetrics.badgesEarned} icon={Award} tone="violet" />
          </PortalGrid>
        </div>

        {(section === "overview") && (
          <>
            <SectionCard title="Children" description="Tap View Profile for a focused snapshot" className="portal-section-card--full">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 14,
                }}
              >
                {scopedCards.map((card) => (
                  <article
                    key={card.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 14,
                      padding: 16,
                      background: "#fff",
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <div
                        className="avatar"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: "#ecfdf5",
                          color: "#047857",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "1.1rem",
                        }}
                      >
                        {card.avatar_initial}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>{card.full_name}</div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          {card.age ? `Age ${card.age}` : "—"} · {card.course || formatStudentLevel(card.level)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: 8, fontSize: "0.8rem", color: "#475569", marginBottom: 12 }}>
                      <div><strong>Lesson:</strong> {card.currentLesson}</div>
                      <div><strong>Teacher:</strong> {card.tutor_name}</div>
                      <div><strong>Attendance:</strong> {card.attendanceRate}%</div>
                      <div><strong>Homework:</strong> {card.homeworkStatus}</div>
                      <div><strong>Last class:</strong> {card.lastClass}</div>
                      <div><strong>Next class:</strong> {card.nextClass}</div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <strong>Progress</strong><span>{card.progressPct}%</span>
                        </div>
                        {pctBar(card.progressPct)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ width: "100%", minHeight: 44 }}
                      onClick={() => {
                        setProfileChild(card);
                        setQuery({ child: card.id, section: "overview" });
                      }}
                    >
                      View Profile
                    </button>
                  </article>
                ))}
              </div>
            </SectionCard>
          </>
        )}

        {section === "today" && (
          <SectionCard title="Today's Class" description="Lesson summary, notes, and homework" className="portal-section-card--full">
            {scopedToday.length === 0 ? (
              <EmptyState icon={Calendar} title="No classes today" description="Enjoy the day off — check upcoming sessions later." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {scopedToday.map((s) => {
                  const report = scopedReports.find((r) => r.student_id === s.student_id);
                  const hw = scopedHomework.filter((h) => h.student_id === s.student_id && !h.is_completed).slice(0, 2);
                  return (
                    <div key={s.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>
                        {s.student_name} · {new Date(s.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: 8 }}>
                        {s.course} · {s.tutor_name} · {s.duration_minutes} min · {s.status}
                      </div>
                      {report?.tutor_notes && (
                        <p style={{ fontSize: "0.85rem", color: "#334155", marginBottom: 8 }}>
                          <strong>Teacher notes:</strong> {report.tutor_notes}
                        </p>
                      )}
                      {hw.length > 0 && (
                        <div style={{ fontSize: "0.82rem" }}>
                          <strong>Homework:</strong> {hw.map((h) => h.title || h.homework_text).join(" · ")}
                        </div>
                      )}
                      {s.meeting_link && s.status === "scheduled" && (
                        <a href={s.meeting_link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ marginTop: 10 }}>
                          Join class
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        )}

        {section === "homework" && (
          <SectionCard title="Homework" description="Pending, completed, overdue, and submitted work" className="portal-section-card--full">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {(["pending", "overdue", "submitted", "completed"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn ${hwTab === t ? "btn-primary" : "btn-outline"} btn-sm`}
                  onClick={() => setHwTab(t)}
                  style={{ textTransform: "capitalize", minHeight: 40 }}
                >
                  {t} ({scopedHomework.filter((h) => hwBucket(h) === t).length})
                </button>
              ))}
            </div>
            {visibleHw.length === 0 ? (
              <EmptyState icon={BookOpen} title={`No ${hwTab} homework`} description="Assignments from tutors appear here." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {visibleHw.map((h) => (
                  <div key={h.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{h.title || h.homework_text}</div>
                        {childFilter === "all" && (
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{h.student_name}</div>
                        )}
                        {h.title && h.homework_text && h.title !== h.homework_text && (
                          <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: 4 }}>{h.homework_text}</div>
                        )}
                      </div>
                      {!h.is_completed && hwTab !== "completed" && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={marking === h.id}
                          onClick={() => void markHomeworkDone(h.id)}
                        >
                          {marking === h.id ? "…" : "Mark done"}
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8, fontSize: "0.75rem", color: "#64748b" }}>
                      {h.due_date && <span>Due {new Date(h.due_date).toLocaleDateString("en-GB")}</span>}
                      {h.submitted_at && <span>Submitted {new Date(h.submitted_at).toLocaleDateString("en-GB")}</span>}
                      {(h.marks != null) && <span>Marks {h.marks}{h.max_marks != null ? `/${h.max_marks}` : ""}</span>}
                    </div>
                    {h.teacher_feedback && (
                      <div style={{ marginTop: 8, padding: 10, background: "#f8fafc", borderRadius: 8, fontSize: "0.82rem" }}>
                        <strong>Teacher feedback:</strong> {h.teacher_feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {section === "progress" && (
          <SectionCard title="Progress" description="Completion and learning trends" className="portal-section-card--full">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 18 }}>
              {[
                { label: "Course completion", value: scopedMetrics.overallProgress },
                { label: "Homework completion", value: scopedHomework.length
                  ? Math.round((scopedHomework.filter((h) => h.is_completed).length / scopedHomework.length) * 100)
                  : 0 },
                { label: "Attendance", value: scopedMetrics.averageAttendance },
                { label: "Average score", value: scopedMetrics.averageScore },
              ].map((row) => (
                <div key={row.label} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 6 }}>{row.label}</div>
                  <div style={{ fontWeight: 800, fontSize: "1.4rem", marginBottom: 8 }}>{row.value}%</div>
                  {pctBar(row.value)}
                </div>
              ))}
            </div>
            <div style={{ fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart2 size={16} /> Recent scores (tajweed)
            </div>
            {scopedReports.slice(0, 8).length === 0 ? (
              <EmptyState icon={TrendingUp} title="No progress data yet" description="Scores appear after tutors submit reports." />
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                {scopedReports.slice(0, 8).reverse().map((r) => {
                  const h = ((Number(r.tajweed_stars || 0) / 5) * 100) || 8;
                  return (
                    <div key={r.id} title={`${r.student_name}: ${r.tajweed_stars || 0}/5`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", maxWidth: 36, height: `${h}%`, minHeight: 8, background: "#1b5e42", borderRadius: 6 }} />
                      <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>
                        {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        )}

        {section === "attendance" && (
          <SectionCard title="Attendance" description="Class presence with schedule details" className="portal-section-card--full">
            {scopedAttendance.length === 0 ? (
              <EmptyState icon={Clock} title="No attendance yet" description="Records appear after tutors mark class." />
            ) : (
              <div className="table-shell" style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      {childFilter === "all" && <th>Student</th>}
                      <th>Class</th>
                      <th>Course</th>
                      <th>Teacher</th>
                      <th>Scheduled</th>
                      <th>Joined</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedAttendance.slice(0, 40).map((row) => (
                      <tr key={row.id}>
                        <td>{row.session_date || (row.scheduled_at ? new Date(row.scheduled_at).toLocaleDateString("en-GB") : "—")}</td>
                        {childFilter === "all" && <td>{row.student_name}</td>}
                        <td>{row.class_label || "Class"}</td>
                        <td>{row.course || "—"}</td>
                        <td>{row.tutor_name || "—"}</td>
                        <td>
                          {row.scheduled_at
                            ? new Date(row.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td>
                          {row.actual_join_at
                            ? new Date(row.actual_join_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td>{row.actual_duration_minutes != null ? `${row.actual_duration_minutes}m` : "—"}</td>
                        <td style={{ textTransform: "capitalize" }}>{row.status}{row.late_minutes ? ` (+${row.late_minutes}m)` : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        )}

        {section === "history" && (
          <SectionCard title="Class History" description="Completed lessons as a timeline" className="portal-section-card--full">
            {scopedHistory.length === 0 ? (
              <EmptyState icon={FileText} title="No completed classes yet" description="History builds as sessions are marked complete." />
            ) : (
              <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 0 }}>
                {scopedHistory.map((s, i) => (
                  <li
                    key={s.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "16px 1fr",
                      gap: 12,
                      paddingBottom: i < scopedHistory.length - 1 ? 16 : 0,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1b5e42", marginTop: 4 }} />
                      {i < scopedHistory.length - 1 && <div style={{ width: 2, flex: 1, background: "#e2e8f0", marginTop: 4 }} />}
                    </div>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
                      <div style={{ fontWeight: 700 }}>{s.student_name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {new Date(s.scheduled_at).toLocaleString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" · "}{s.duration_minutes} min · {s.tutor_name}
                      </div>
                      {s.notes && <div style={{ fontSize: "0.82rem", marginTop: 6 }}>{s.notes}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
        )}

        {section === "reports" && (
          <SectionCard title="Reports" description="Daily and progress reports from tutors" className="portal-section-card--full">
            {scopedReports.length === 0 ? (
              <EmptyState icon={FileText} title="No reports yet" description="Tutor daily and progress reports show here." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {scopedReports.map((r) => (
                  <article key={r.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 700 }}>
                        {r.student_name}
                        <span style={{ marginLeft: 8, fontWeight: 500, fontSize: "0.75rem", color: "#64748b", textTransform: "capitalize" }}>
                          {r.report_kind || "daily"}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: 6 }}>
                      {r.surah_covered || r.topics_covered || r.pages_covered || "Session report"}
                      {" · "}{r.tajweed_stars || 0}/5 stars · {r.tutor_name}
                    </div>
                    {r.tutor_notes && <p style={{ fontSize: "0.82rem", marginTop: 8 }}>{r.tutor_notes}</p>}
                    {r.homework && <p style={{ fontSize: "0.8rem", marginTop: 6 }}><strong>Homework:</strong> {r.homework}</p>}
                    {r.next_lesson_plan && <p style={{ fontSize: "0.8rem", marginTop: 4 }}><strong>Next:</strong> {r.next_lesson_plan}</p>}
                  </article>
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </div>

      {profileChild && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${profileChild.full_name} profile`}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setProfileChild(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 16, maxWidth: 420, width: "100%", padding: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{profileChild.full_name}</h2>
              <button type="button" className="btn btn-ghost btn-sm" aria-label="Close" onClick={() => setProfileChild(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#475569", display: "grid", gap: 8 }}>
              <div>Age: {profileChild.age ?? "—"}</div>
              <div>Course: {profileChild.course || "—"}</div>
              <div>Level: {formatStudentLevel(profileChild.level)}</div>
              <div>Teacher: {profileChild.tutor_name}</div>
              <div>Current lesson: {profileChild.currentLesson}</div>
              <div>Progress: {profileChild.progressPct}%</div>
              <div>Next class: {profileChild.nextClass}</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => { setProfileChild(null); setQuery({ child: profileChild.id, section: "progress" }); }}>
                Progress
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setProfileChild(null); setQuery({ child: profileChild.id, section: "homework" }); }}>
                Homework
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setProfileChild(null); setQuery({ child: profileChild.id, section: "attendance" }); }}>
                Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

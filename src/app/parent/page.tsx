"use client";
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import ParentStudentSwitcher from "@/components/ParentStudentSwitcher";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatStudentLevel } from "@/lib/portal";

interface ParentStudent {
  id: string;
  full_name: string;
  level?: string | null;
  course?: string | null;
  tutor_name?: string | null;
}

interface DashboardHomework {
  id: string;
  homework_text: string;
  due_date?: string | null;
  is_completed: boolean;
}

interface DashboardReport {
  overall_rating?: string;
  created_at: string;
  tajweed_stars?: number;
  tutor_notes?: string | null;
  homework?: string | null;
  mistakes?: string | null;
}

interface FeeInfo {
  pending: number;
  total: number;
  overdueCount: number;
}

const RATING_COLOR: Record<string, string> = {
  excellent: "#16a34a",
  good: "#2563eb",
  average: "#d97706",
  needs_improvement: "#dc2626",
};

const RATING_BG: Record<string, string> = {
  excellent: "#dcfce7",
  good: "#dbeafe",
  average: "#fef9c3",
  needs_improvement: "#fee2e2",
};

export default function ParentDashboard() {
  const [students, setStudents] = useState<ParentStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [latestReport, setLatestReport] = useState<DashboardReport | null>(null);
  const [homework, setHomework] = useState<DashboardHomework[]>([]);
  const [fees, setFees] = useState<FeeInfo>({ pending: 0, total: 0, overdueCount: 0 });
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [nextSessionLabel, setNextSessionLabel] = useState("");
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [selectedStudentId, students]
  );

  useEffect(() => {
    async function loadStudents() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("students")
        .select("id, full_name, level, course, tutor:profiles!students_tutor_id_fkey(full_name)")
        .eq("parent_id", user.id)
        .eq("is_active", true)
        .order("full_name");

      const mapped = (data || []).map((student: any) => ({
        id: student.id,
        full_name: student.full_name,
        level: student.level,
        course: student.course,
        tutor_name: student.tutor?.full_name || "Not assigned",
      }));

      setStudents(mapped);
      setSelectedStudentId((current) => current || mapped[0]?.id || "");
      setLoading(false);
    }

    loadStudents();
  }, []);

  useEffect(() => {
    async function loadStudentDashboard() {
      if (!selectedStudentId) return;

      const nowIso = new Date().toISOString();
      const [{ data: reports }, { data: homeworkData }, { data: feeData }, { data: sessionData }] =
        await Promise.all([
          supabase
            .from("progress_reports")
            .select("overall_rating, created_at, tajweed_stars, tutor_notes, homework, mistakes")
            .eq("student_id", selectedStudentId)
            .order("created_at", { ascending: false })
            .limit(1),
          supabase
            .from("homework_logs")
            .select("id, homework_text, due_date, is_completed")
            .eq("student_id", selectedStudentId)
            .eq("is_completed", false)
            .order("due_date", { ascending: true })
            .limit(5),
          supabase
            .from("fees")
            .select("amount, status, due_date")
            .eq("student_id", selectedStudentId),
          supabase
            .from("class_sessions")
            .select("scheduled_at, notes")
            .eq("student_id", selectedStudentId)
            .eq("status", "scheduled")
            .gte("scheduled_at", nowIso)
            .order("scheduled_at", { ascending: true })
            .limit(3),
        ]);

      setLatestReport(reports?.[0] || null);
      setHomework((homeworkData || []) as DashboardHomework[]);

      const pending = (feeData || [])
        .filter((fee: any) => fee.status !== "paid" && fee.status !== "waived")
        .reduce((sum: number, fee: any) => sum + Number(fee.amount || 0), 0);
      const total = (feeData || []).reduce(
        (sum: number, fee: any) => sum + Number(fee.amount || 0),
        0
      );
      const overdueCount = (feeData || []).filter((fee: any) => {
        if (!fee.due_date || fee.status === "paid" || fee.status === "waived") return false;
        return new Date(fee.due_date) < new Date();
      }).length;

      setFees({ pending, total, overdueCount });
      setUpcomingCount(sessionData?.length || 0);
      setNextSessionLabel(
        sessionData?.[0]?.scheduled_at
          ? new Date(sessionData[0].scheduled_at).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""
      );
    }

    loadStudentDashboard();
  }, [selectedStudentId]);

  async function markHomeworkDone(id: string) {
    await supabase
      .from("homework_logs")
      .update({
        is_completed: true,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);
    setHomework((current) => current.filter((item) => item.id !== id));
  }

  if (loading) {
    return (
      <>
        <TopBar title="Parent Portal" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #1b5e42",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Parent Portal" subtitle={today} />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">
          {selectedStudent ? `${selectedStudent.full_name}'s Dashboard` : "Parent Portal"}
        </h1>
        <p className="page-subtitle">Track learning, fees, schedule, and homework in one place</p>
      </div>

      <div className="page-body">
        {students.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <BookOpen size={48} />
              <h3>No student linked yet</h3>
              <p>Your child&apos;s account has not been linked yet. Please contact admin.</p>
            </div>
          </div>
        ) : (
          <>
            <ParentStudentSwitcher
              students={students}
              selectedId={selectedStudentId}
              onChange={setSelectedStudentId}
            />

            {selectedStudent && (
              <>
                <div
                  style={{
                    background: "linear-gradient(135deg, #0f172a, #1b5e42)",
                    borderRadius: 16,
                    padding: "22px 24px",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #c9a84c, #e2c06a)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.35rem",
                        fontWeight: 800,
                        color: "#fff",
                      }}
                    >
                      {selectedStudent.full_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem" }}>
                        {selectedStudent.full_name}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.78rem" }}>
                        Level:{" "}
                        <span style={{ color: "#e2c06a", fontWeight: 600 }}>
                          {formatStudentLevel(selectedStudent.level)}
                        </span>
                        {selectedStudent.course ? ` · ${selectedStudent.course}` : ""}
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                        Tutor: {selectedStudent.tutor_name}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Link href="/parent/sessions" className="btn btn-gold btn-sm">
                      <Calendar size={14} /> View Schedule
                    </Link>
                    <Link
                      href="/parent/progress"
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
                    >
                      <Star size={14} /> Full Report
                    </Link>
                  </div>
                </div>

                <div className="stats-grid" style={{ marginBottom: 20 }}>
                  {[
                    {
                      label: "Pending Fees",
                      value: formatCurrency(fees.pending, "GBP"),
                      icon: DollarSign,
                      color: fees.pending > 0 ? "#dc2626" : "#16a34a",
                      bg: fees.pending > 0 ? "#fee2e2" : "#dcfce7",
                    },
                    {
                      label: "Homework Due",
                      value: homework.length,
                      icon: BookOpen,
                      color: "#7c3aed",
                      bg: "#f5f3ff",
                    },
                    {
                      label: "Latest Rating",
                      value:
                        latestReport?.overall_rating?.replace("_", " ") || "No report",
                      icon: Star,
                      color:
                        RATING_COLOR[latestReport?.overall_rating || ""] || "#64748b",
                      bg: RATING_BG[latestReport?.overall_rating || ""] || "#f1f5f9",
                    },
                    {
                      label: "Upcoming Classes",
                      value: upcomingCount,
                      icon: Calendar,
                      color: "#1b5e42",
                      bg: "#f0fdf4",
                    },
                  ].map((card) => (
                    <div key={card.label} className="stat-card">
                      <div className="stat-icon" style={{ background: card.bg, marginBottom: 12 }}>
                        <card.icon size={20} color={card.color} />
                      </div>
                      <div className="stat-value" style={{ fontSize: "1.3rem" }}>
                        {card.value}
                      </div>
                      <div className="stat-label">{card.label}</div>
                    </div>
                  ))}
                </div>

                {(fees.overdueCount > 0 || nextSessionLabel) && (
                  <div
                    className="card"
                    style={{
                      marginBottom: 20,
                      background:
                        fees.overdueCount > 0
                          ? "linear-gradient(135deg, #fff7ed, #fffbeb)"
                          : "#fff",
                    }}
                  >
                    <div
                      className="card-body"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: fees.overdueCount > 0 ? "#b45309" : "#0f172a",
                            fontFamily: "var(--font-playfair), Georgia, serif",
                          }}
                        >
                          {fees.overdueCount > 0
                            ? `${fees.overdueCount} invoice${fees.overdueCount > 1 ? "s are" : " is"} overdue`
                            : "Next class reminder"}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            color: "#64748b",
                            fontSize: "0.8rem",
                            fontFamily: "var(--font-jakarta), sans-serif",
                          }}
                        >
                          {fees.overdueCount > 0
                            ? "Please review dues and contact the academy if you need help."
                            : `Next scheduled class: ${nextSessionLabel}`}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {fees.overdueCount > 0 && (
                          <Link href="/parent/fees" className="btn btn-gold btn-sm">
                            <DollarSign size={14} /> View Invoices
                          </Link>
                        )}
                        {nextSessionLabel && (
                          <Link href="/parent/sessions" className="btn btn-ghost btn-sm">
                            <Calendar size={14} /> Schedule
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="portal-dashboard-halves">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">
                        <BookOpen size={15} color="#1b5e42" /> Homework To Do
                      </h3>
                      <Link href="/parent/homework" className="card-link">
                        View all →
                      </Link>
                    </div>
                    {homework.length === 0 ? (
                      <div className="empty-state">
                        <CheckCircle size={40} />
                        <h3>All done!</h3>
                        <p>No pending homework for this child.</p>
                      </div>
                    ) : (
                      <div style={{ padding: "8px 0" }}>
                        {homework.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              padding: "12px 20px",
                              borderBottom: "1px solid #f1f5f9",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: "0.85rem",
                                  color: "#0f172a",
                                }}
                              >
                                {item.homework_text}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  color: "#64748b",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  marginTop: 2,
                                }}
                              >
                                <Clock size={11} />
                                Due:{" "}
                                {item.due_date
                                  ? new Date(item.due_date).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                    })
                                  : "No date"}
                              </div>
                            </div>
                            <button
                              onClick={() => markHomeworkDone(item.id)}
                              className="btn btn-ghost btn-xs"
                              style={{ flexShrink: 0 }}
                            >
                              <CheckCircle size={12} /> Done
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">
                        <Star size={15} color="#1b5e42" /> Latest Progress Report
                      </h3>
                      <Link href="/parent/progress" className="card-link">
                        History →
                      </Link>
                    </div>
                    {!latestReport ? (
                      <div className="empty-state">
                        <Star size={40} />
                        <h3>No reports yet</h3>
                        <p>Reports will appear after the first completed class.</p>
                      </div>
                    ) : (
                      <div className="card-body">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 16,
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                            {new Date(latestReport.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <span
                            className="badge"
                            style={{
                              background:
                                RATING_BG[latestReport.overall_rating || ""] || "#f1f5f9",
                              color:
                                RATING_COLOR[latestReport.overall_rating || ""] || "#64748b",
                            }}
                          >
                            {latestReport.overall_rating?.replace("_", " ") || "Pending"}
                          </span>
                          <span className="badge badge-gold">
                            {latestReport.tajweed_stars || 0}/5 stars
                          </span>
                        </div>
                        {latestReport.homework && (
                          <div
                            style={{
                              background: "#fffbeb",
                              borderRadius: 10,
                              padding: "10px 14px",
                              marginBottom: 12,
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.72rem",
                                color: "#92400e",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                marginBottom: 4,
                              }}
                            >
                              Homework Focus
                            </div>
                            <div style={{ color: "#7c2d12", fontSize: "0.8rem" }}>
                              {latestReport.homework}
                            </div>
                          </div>
                        )}
                        {(latestReport.tutor_notes || latestReport.mistakes) && (
                          <div
                            style={{
                              background: "#f8fafc",
                              borderRadius: 10,
                              padding: "12px 14px",
                              fontSize: "0.8rem",
                              color: "#475569",
                              lineHeight: 1.6,
                              borderLeft: "3px solid #1b5e42",
                            }}
                          >
                            {latestReport.tutor_notes || latestReport.mistakes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 12,
                    marginTop: 20,
                  }}
                >
                  {[
                    {
                      label: "Attendance",
                      href: "/parent/attendance",
                      icon: Calendar,
                      color: "#7c3aed",
                      bg: "#f5f3ff",
                    },
                    {
                      label: "Invoices",
                      href: "/parent/fees",
                      icon: DollarSign,
                      color: "#d97706",
                      bg: "#fffbeb",
                    },
                    {
                      label: "Messages",
                      href: "/parent/messages",
                      icon: AlertCircle,
                      color: "#2563eb",
                      bg: "#eff6ff",
                    },
                  ].map((action) => (
                    <Link key={action.label} href={action.href} className="action-card">
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: action.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <action.icon size={16} color={action.color} />
                      </div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                        {action.label}
                      </span>
                      <ArrowUpRight
                        size={14}
                        style={{ color: "#94a3b8", marginLeft: "auto" }}
                      />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

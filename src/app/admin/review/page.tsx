"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, FileText, BookOpen, Clock } from "lucide-react";
import TopBar from "@/components/TopBar";
import { EmptyState, LoadingState, MetricCard, PortalGrid, SectionCard } from "@/components/ui/PortalUI";
import { unwrapOne } from "@/lib/currency";
import { supabase } from "@/lib/supabase";

export default function AdminReviewPage() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [{ data: att }, { data: hw }, { data: reps }] = await Promise.all([
        supabase
          .from("attendance")
          .select("id, status, session_date, class_label, scheduled_at, actual_join_at, actual_duration_minutes, student:students(full_name), tutor:profiles!attendance_tutor_id_fkey(full_name)")
          .order("session_date", { ascending: false })
          .limit(25),
        supabase
          .from("homework_logs")
          .select("id, title, status, is_completed, due_date, assignment_type, created_at, student:students(full_name), tutor:profiles!homework_logs_tutor_id_fkey(full_name)")
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("progress_reports")
          .select("id, report_kind, overall_rating, surah_covered, topics_covered, created_at, student:students(full_name), tutor:profiles(full_name)")
          .order("created_at", { ascending: false })
          .limit(25),
      ]);
      setAttendance(att || []);
      setHomework(hw || []);
      setReports(reps || []);
      setLoading(false);
    }
    void load();
  }, []);

  if (loading) {
    return (
      <>
        <TopBar title="Review Queue" />
        <div className="page-body"><LoadingState label="Loading review queue…" /></div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Review Queue" subtitle="Attendance, homework, and reports from tutors" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="page-title">Admin Review</h1>
            <p className="page-subtitle">Everything tutors submit, linked for oversight</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/admin/attendance" className="btn btn-outline btn-sm">Attendance</Link>
            <Link href="/admin/assignments" className="btn btn-outline btn-sm">Assignments</Link>
            <Link href="/admin/reports" className="btn btn-outline btn-sm">Reports</Link>
          </div>
        </div>
      </div>
      <div className="page-body">
        <PortalGrid>
          <MetricCard label="Recent attendance" value={attendance.length} icon={Clock} tone="blue" />
          <MetricCard label="Recent homework" value={homework.length} icon={BookOpen} tone="gold" />
          <MetricCard label="Recent reports" value={reports.length} icon={FileText} tone="green" />
          <MetricCard label="Pending HW" value={homework.filter((h) => !h.is_completed).length} icon={ClipboardCheck} tone="violet" />
        </PortalGrid>

        <div style={{ height: 16 }} />

        <SectionCard title="Attendance" className="portal-section-card--full">
          {attendance.length === 0 ? (
            <EmptyState icon={Clock} title="No attendance rows" description="Tutor session attendance appears here." />
          ) : (
            <div className="table-shell" style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Student</th><th>Tutor</th><th>Class</th><th>Scheduled</th><th>Joined</th><th>Duration</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((row) => (
                    <tr key={row.id}>
                      <td>{row.session_date || "—"}</td>
                      <td>{unwrapOne(row.student)?.full_name || "—"}</td>
                      <td>{unwrapOne(row.tutor)?.full_name || "—"}</td>
                      <td>{row.class_label || "—"}</td>
                      <td>{row.scheduled_at ? new Date(row.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                      <td>{row.actual_join_at ? new Date(row.actual_join_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                      <td>{row.actual_duration_minutes != null ? `${row.actual_duration_minutes}m` : "—"}</td>
                      <td style={{ textTransform: "capitalize" }}>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <div style={{ height: 16 }} />

        <SectionCard title="Homework & assignments" className="portal-section-card--full">
          <div className="table-shell" style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr><th>Student</th><th>Title</th><th>Type</th><th>Tutor</th><th>Due</th><th>Status</th></tr>
              </thead>
              <tbody>
                {homework.map((row) => (
                  <tr key={row.id}>
                    <td>{unwrapOne(row.student)?.full_name || "—"}</td>
                    <td>{row.title || "—"}</td>
                    <td style={{ textTransform: "capitalize" }}>{row.assignment_type || "homework"}</td>
                    <td>{unwrapOne(row.tutor)?.full_name || "—"}</td>
                    <td>{row.due_date || "—"}</td>
                    <td>{row.is_completed ? "Completed" : (row.status || "Pending")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div style={{ height: 16 }} />

        <SectionCard title="Daily & progress reports" className="portal-section-card--full">
          <div className="table-shell" style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Student</th><th>Tutor</th><th>Kind</th><th>Coverage</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {reports.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.created_at).toLocaleDateString("en-GB")}</td>
                    <td>{unwrapOne(row.student)?.full_name || "—"}</td>
                    <td>{unwrapOne(row.tutor)?.full_name || "—"}</td>
                    <td style={{ textTransform: "capitalize" }}>{row.report_kind || "daily"}</td>
                    <td>{row.surah_covered || row.topics_covered || "—"}</td>
                    <td style={{ textTransform: "capitalize" }}>{row.overall_rating?.replace("_", " ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

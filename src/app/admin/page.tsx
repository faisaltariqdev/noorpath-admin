"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  CalendarCheck2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  GraduationCap,
  ReceiptText,
  UserPlus,
  Users,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { supabase } from "@/lib/supabase";
import {
  EmptyState,
  LoadingState,
  MetricCard,
  PageHeader,
  PortalGrid,
  SectionCard,
  StatusBadge,
} from "@/components/ui/PortalUI";

interface DashboardData {
  activeStudents: number;
  activeTeachers: number;
  todayClasses: number;
  trialStudents: number;
  monthlyRevenue: number;
  attendanceRate: number;
  enrollments: Array<{ id: string; full_name: string; course?: string; trial_status?: string; enrolled_at: string }>;
  payments: Array<{ id: string; amount: number; currency: string; paid_date?: string; student_name: string }>;
  classes: Array<{ id: string; scheduled_at: string; status: string; student_name: string; teacher_name: string }>;
  announcements: Array<{ id: string; title: string; body?: string; message?: string; created_at: string }>;
  activity: Array<{ id: string; student_name: string; teacher_name: string; rating?: string; created_at: string }>;
}

const initialData: DashboardData = {
  activeStudents: 0,
  activeTeachers: 0,
  todayClasses: 0,
  trialStudents: 0,
  monthlyRevenue: 0,
  attendanceRate: 0,
  enrollments: [],
  payments: [],
  classes: [],
  announcements: [],
  activity: [],
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    async function load() {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        { count: activeStudents },
        { count: activeTeachers },
        { count: todayClasses },
        { count: trialStudents },
        { data: paidFees },
        { data: attendance },
        { data: enrollments },
        { data: payments },
        { data: classes },
        { data: announcements },
        { data: reports },
      ] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "tutor").eq("is_active", true),
        supabase.from("class_sessions").select("*", { count: "exact", head: true }).gte("scheduled_at", todayStart).lt("scheduled_at", tomorrowStart),
        supabase.from("students").select("*", { count: "exact", head: true }).in("trial_status", ["booked", "attended"]),
        supabase.from("fees").select("amount").eq("status", "paid").gte("paid_date", monthStart),
        supabase.from("attendance").select("status").gte("session_date", monthStart.slice(0, 10)),
        supabase.from("students").select("id,full_name,course,trial_status,enrolled_at").order("enrolled_at", { ascending: false }).limit(6),
        supabase.from("fees").select("id,amount,currency,paid_date,student:students(full_name)").eq("status", "paid").order("paid_date", { ascending: false }).limit(6),
        supabase.from("class_sessions").select("id,scheduled_at,status,student:students(full_name),tutor:profiles(full_name)").gte("scheduled_at", todayStart).lt("scheduled_at", tomorrowStart).order("scheduled_at").limit(8),
        supabase.from("announcements").select("id,title,message,created_at").order("created_at", { ascending: false }).limit(4),
        supabase.from("progress_reports").select("id,overall_rating,created_at,student:students(full_name),tutor:profiles(full_name)").order("created_at", { ascending: false }).limit(5),
      ]);

      const attendanceRows = attendance || [];
      const attended = attendanceRows.filter((row) => row.status === "present" || row.status === "late").length;

      setData({
        activeStudents: activeStudents || 0,
        activeTeachers: activeTeachers || 0,
        todayClasses: todayClasses || 0,
        trialStudents: trialStudents || 0,
        monthlyRevenue: (paidFees || []).reduce((total, fee) => total + Number(fee.amount || 0), 0),
        attendanceRate: attendanceRows.length ? Math.round((attended / attendanceRows.length) * 100) : 0,
        enrollments: enrollments || [],
        payments: (payments || []).map((row: any) => ({ ...row, student_name: row.student?.full_name || "Unknown student" })),
        classes: (classes || []).map((row: any) => ({
          ...row,
          student_name: row.student?.full_name || "Unknown student",
          teacher_name: row.tutor?.full_name || "Unassigned",
        })),
        announcements: announcements || [],
        activity: (reports || []).map((row: any) => ({
          ...row,
          student_name: row.student?.full_name || "Unknown student",
          teacher_name: row.tutor?.full_name || "Unknown teacher",
          rating: row.overall_rating,
        })),
      });
      setLoading(false);
    }

    load();
  }, []);

  return (
    <>
      <TopBar title="Dashboard" subtitle={todayLabel} />
      <main className="portal-page">
        <PageHeader
          eyebrow="Academy overview"
          title="Good day, Admin"
          description="Live operational data for classes, people, attendance, learning, and payments."
          actions={(
            <>
              <Link href="/admin/live-classes" className="btn btn-ghost"><Calendar size={14} /> Schedule class</Link>
              <Link href="/admin/students" className="btn btn-primary"><UserPlus size={14} /> Add student</Link>
            </>
          )}
        />

        {loading ? <LoadingState label="Loading academy overview…" /> : (
          <>
            <PortalGrid className="mb-6">
              <MetricCard label="Today's Classes" value={data.todayClasses} helper="Scheduled today" icon={Calendar} tone="violet" />
              <MetricCard label="Active Students" value={data.activeStudents} helper="No presence tracking is configured" icon={GraduationCap} />
              <MetricCard label="Active Teachers" value={data.activeTeachers} helper="Enabled teacher accounts" icon={Users} tone="blue" />
              <MetricCard label="Revenue This Month" value={`$${data.monthlyRevenue.toLocaleString()}`} helper="Paid invoices" icon={CircleDollarSign} tone="gold" />
              <MetricCard label="Attendance" value={`${data.attendanceRate}%`} helper="Present and late this month" icon={CalendarCheck2} />
              <MetricCard label="Trial Students" value={data.trialStudents} helper="Booked or attended trials" icon={Clock3} tone="violet" />
            </PortalGrid>

            <PortalGrid className="mb-6">
              <SectionCard
                title="Today's calendar"
                description="Classes scheduled for today"
                className="portal-section-card--wide"
                action={<Link href="/admin/live-classes" className="card-link">View schedule →</Link>}
              >
                {data.classes.length === 0 ? (
                  <EmptyState icon={Calendar} title="No classes today" description="Newly scheduled classes will appear here." />
                ) : (
                  <div className="portal-table-scroll">
                    <table className="data-table">
                      <thead><tr><th>Time</th><th>Student</th><th>Teacher</th><th>Status</th></tr></thead>
                      <tbody>{data.classes.map((item) => (
                        <tr key={item.id}>
                          <td>{new Date(item.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</td>
                          <td><strong>{item.student_name}</strong></td>
                          <td>{item.teacher_name}</td>
                          <td><StatusBadge tone={item.status === "completed" ? "success" : item.status === "cancelled" ? "danger" : "info"}>{item.status}</StatusBadge></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Quick actions" description="Frequent academy workflows" className="portal-section-card--narrow">
                <div className="list-stack">
                  {[
                    { label: "Enroll a student", href: "/admin/students", icon: UserPlus },
                    { label: "Manage teachers", href: "/admin/teachers", icon: Users },
                    { label: "Review queue", href: "/admin/review", icon: ClipboardList },
                    { label: "Open payments", href: "/admin/payments", icon: ReceiptText },
                  ].map((action) => (
                    <Link key={action.href} href={action.href} className="action-card">
                      <span className="portal-empty-icon"><action.icon size={16} aria-hidden="true" /></span>
                      <strong className="text-sm">{action.label}</strong>
                    </Link>
                  ))}
                </div>
              </SectionCard>
            </PortalGrid>

            <PortalGrid className="mb-6">
              <SectionCard title="Recent enrollments" description="Newest student records">
                {data.enrollments.length === 0 ? <EmptyState icon={GraduationCap} title="No enrollments" description="New students will appear here." /> : (
                  <div className="portal-table-scroll">
                    <table className="data-table">
                      <thead><tr><th>Student</th><th>Course</th><th>Trial</th><th>Enrolled</th></tr></thead>
                      <tbody>{data.enrollments.map((student) => (
                        <tr key={student.id}>
                          <td><strong>{student.full_name}</strong></td>
                          <td>{student.course || "—"}</td>
                          <td><StatusBadge tone={student.trial_status === "converted" ? "success" : "info"}>{student.trial_status || "—"}</StatusBadge></td>
                          <td>{new Date(student.enrolled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Recent payments" description="Latest paid family invoices" action={<Link href="/admin/payments" className="card-link">View all →</Link>}>
                {data.payments.length === 0 ? <EmptyState icon={ReceiptText} title="No recent payments" description="Paid invoices will appear here." /> : (
                  <div className="portal-table-scroll">
                    <table className="data-table">
                      <thead><tr><th>Student</th><th>Amount</th><th>Paid</th></tr></thead>
                      <tbody>{data.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td><strong>{payment.student_name}</strong></td>
                          <td>{payment.currency} {Number(payment.amount).toLocaleString()}</td>
                          <td>{payment.paid_date ? new Date(payment.paid_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </PortalGrid>

            <PortalGrid>
              <SectionCard title="Announcements" description="Latest academy broadcasts" className="portal-section-card--narrow" action={<Link href="/admin/announcements" className="card-link">Manage →</Link>}>
                {data.announcements.length === 0 ? <EmptyState icon={Bell} title="No announcements" description="Broadcasts will appear here." /> : (
                  <div className="list-stack">
                    {data.announcements.map((announcement) => (
                      <article className="list-row" key={announcement.id}>
                        <div>
                          <strong className="list-title">{announcement.title}</strong>
                          <p className="list-meta">{announcement.body || announcement.message || "No message preview"}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Recent activity" description="Latest teacher progress reports" className="portal-section-card--wide" action={<Link href="/admin/reports" className="card-link">View reports →</Link>}>
                {data.activity.length === 0 ? <EmptyState icon={ClipboardList} title="No recent activity" description="Progress reports will appear here." /> : (
                  <div className="portal-table-scroll">
                    <table className="data-table">
                      <thead><tr><th>Student</th><th>Teacher</th><th>Rating</th><th>Date</th></tr></thead>
                      <tbody>{data.activity.map((activity) => (
                        <tr key={activity.id}>
                          <td><strong>{activity.student_name}</strong></td>
                          <td>{activity.teacher_name}</td>
                          <td><StatusBadge tone={activity.rating === "excellent" ? "success" : "neutral"}>{activity.rating?.replace("_", " ") || "Not rated"}</StatusBadge></td>
                          <td>{new Date(activity.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </PortalGrid>
          </>
        )}
      </main>
    </>
  );
}

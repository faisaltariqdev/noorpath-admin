"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import {
  Users, GraduationCap, DollarSign, Calendar,
  CheckCircle, AlertCircle, BookOpen,
  ArrowUpRight, Clock, Star, Activity,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalStudents: number; activeStudents: number; totalTutors: number;
  todaySessions: number; feesThisMonth: number; pendingFees: number;
  recentReports: Array<{ id: string; student: string; tutor: string; rating: string; created_at: string }>;
  recentSessions: Array<{ id: string; student: string; tutor: string; scheduled_at: string; status: string }>;
}

const RATING_BADGE: Record<string, string> = {
  excellent: "badge badge-green", good: "badge badge-blue",
  average: "badge badge-yellow", needs_improvement: "badge badge-red",
};
const SESSION_BADGE: Record<string, string> = {
  scheduled: "badge badge-blue", completed: "badge badge-green",
  cancelled: "badge badge-red", no_show: "badge badge-gray",
};

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 44, height: 44, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#64748b", fontSize: "0.85rem", fontFamily: "var(--font-jakarta), sans-serif" }}>Loading dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0, activeStudents: 0, totalTutors: 0, todaySessions: 0,
    feesThisMonth: 0, pendingFees: 0, recentReports: [], recentSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    async function load() {
      const todayStr = new Date().toISOString().split("T")[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const [
        { count: totalStudents }, { count: activeStudents }, { count: totalTutors },
        { count: todaySessions }, { data: feesData }, { data: pendingData },
        { data: recentSessions }, { data: recentReports },
      ] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("students").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "tutor"),
        supabase.from("class_sessions").select("*", { count: "exact", head: true }).gte("scheduled_at", todayStr).lt("scheduled_at", todayStr + "T23:59:59"),
        supabase.from("fees").select("amount").eq("status", "paid").gte("created_at", monthStart),
        supabase.from("fees").select("amount").eq("status", "pending"),
        supabase.from("class_sessions").select("id, scheduled_at, status, student:students(full_name), tutor:profiles(full_name)").order("scheduled_at", { ascending: false }).limit(5),
        supabase.from("progress_reports").select("id, overall_rating, created_at, student:students(full_name), tutor:profiles(full_name)").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        totalStudents: totalStudents || 0, activeStudents: activeStudents || 0,
        totalTutors: totalTutors || 0, todaySessions: todaySessions || 0,
        feesThisMonth: feesData?.reduce((s, f) => s + (f.amount || 0), 0) || 0,
        pendingFees: pendingData?.reduce((s, f) => s + (f.amount || 0), 0) || 0,
        recentSessions: (recentSessions || []).map((s: any) => ({
          id: s.id, student: s.student?.full_name || "—",
          tutor: s.tutor?.full_name || "—", scheduled_at: s.scheduled_at, status: s.status,
        })),
        recentReports: (recentReports || []).map((r: any) => ({
          id: r.id, student: r.student?.full_name || "—",
          tutor: r.tutor?.full_name || "—", rating: r.overall_rating, created_at: r.created_at,
        })),
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <><TopBar title="Dashboard" subtitle={today} /><LoadingSpinner /></>;

  const statCards = [
    { label: "Total Students", value: stats.totalStudents, sub: `${stats.activeStudents} active`, icon: GraduationCap, color: "#1b5e42", bg: "#f0fdf4", trend: "+12%", trendClass: "trend-up" },
    { label: "Certified Tutors", value: stats.totalTutors, sub: "All active", icon: Users, color: "#2563eb", bg: "#eff6ff", trend: "+2", trendClass: "trend-up" },
    { label: "Today's Classes", value: stats.todaySessions, sub: "Scheduled", icon: Calendar, color: "#7c3aed", bg: "#f5f3ff", trend: "Live", trendClass: "trend-flat" },
    { label: "Fees This Month", value: `$${stats.feesThisMonth.toFixed(0)}`, sub: `$${stats.pendingFees.toFixed(0)} pending`, icon: DollarSign, color: "#b45309", bg: "#fffbeb", trend: "+8%", trendClass: "trend-up" },
  ];

  const quickActions = [
    { label: "Send Fee Reminder", href: "/admin/fees", icon: DollarSign, color: "#b45309", bg: "#fffbeb" },
    { label: "View Today's Trials", href: "/admin/students", icon: Clock, color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Pending Reports", href: "/admin/reports", icon: BookOpen, color: "#1b5e42", bg: "#f0fdf4" },
    { label: "Overdue Payments", href: "/admin/fees", icon: AlertCircle, color: "#dc2626", bg: "#fef2f2" },
  ];

  return (
    <>
      <TopBar title="Admin Dashboard" subtitle={today} />

      <div className="page-header" style={{ paddingTop: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="page-title">Welcome back, Admin 👋</h1>
            <p className="page-subtitle">{today}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/admin/students" className="btn btn-ghost btn-sm">
              <GraduationCap size={14} /> Add Student
            </Link>
            <Link href="/admin/users" className="btn btn-primary btn-sm">
              <Users size={14} /> Add Tutor
            </Link>
          </div>
        </div>
      </div>

      <div className="page-body">

        {/* Stat Cards */}
        <div className="stats-grid">
          {statCards.map((c) => (
            <div key={c.label} className="stat-card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div className="stat-icon" style={{ background: c.bg }}>
                  <c.icon size={20} color={c.color} />
                </div>
                <span className={`stat-trend ${c.trendClass}`}>{c.trend}</span>
              </div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-sub">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href} className="action-card">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <a.icon size={18} color={a.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-jakarta), sans-serif" }}>{a.label}</div>
              </div>
              <ArrowUpRight size={14} style={{ color: "#cbd5e1", flexShrink: 0 }} />
            </Link>
          ))}
        </div>

        {/* Tables Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Recent Sessions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Calendar size={16} color="#1b5e42" /> Recent Sessions</h3>
              <Link href="/admin/sessions" className="card-link">View all →</Link>
            </div>
            {stats.recentSessions.length === 0 ? (
              <div className="empty-state">
                <Calendar size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
                <h3>No sessions yet</h3>
                <p>Sessions will appear here once scheduled.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Student</th><th>Tutor</th><th>When</th><th>Status</th></tr></thead>
                <tbody>
                  {stats.recentSessions.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.7rem" }}>{s.student.charAt(0)}</div>
                          <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{s.student}</span>
                        </div>
                      </td>
                      <td style={{ color: "#64748b" }}>{s.tutor}</td>
                      <td style={{ color: "#94a3b8", whiteSpace: "nowrap" }}>
                        {new Date(s.scheduled_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td><span className={SESSION_BADGE[s.status] || "badge badge-gray"}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Reports */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Activity size={16} color="#1b5e42" /> Recent Reports</h3>
              <Link href="/admin/reports" className="card-link">View all →</Link>
            </div>
            {stats.recentReports.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
                <h3>No reports yet</h3>
                <p>Progress reports will appear here.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Student</th><th>Tutor</th><th>Rating</th><th>Date</th></tr></thead>
                <tbody>
                  {stats.recentReports.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: "0.7rem" }}>{r.student.charAt(0)}</div>
                          <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{r.student}</span>
                        </div>
                      </td>
                      <td style={{ color: "#64748b" }}>{r.tutor}</td>
                      <td><span className={RATING_BADGE[r.rating] || "badge badge-gray"}>{r.rating?.replace("_", " ") || "—"}</span></td>
                      <td style={{ color: "#94a3b8", whiteSpace: "nowrap" }}>
                        {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Banner */}
        <div style={{
          marginTop: 20,
          background: "linear-gradient(135deg, #0f172a 0%, #1b5e42 100%)",
          borderRadius: 16, padding: "22px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14,
        }}>
          <div>
            <div style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1rem", fontWeight: 700, marginBottom: 4 }}>
              🌙 NoorPath Academy — Admin Control Center
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem", fontFamily: "var(--font-jakarta), sans-serif" }}>
              Manage tutors, students, classes and payments from one place.
            </div>
          </div>
          <Link href="/admin/students" className="btn btn-gold btn-sm">
            <Star size={14} /> Add New Student
          </Link>
        </div>

      </div>
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users, GraduationCap, DollarSign, Calendar, TrendingUp,
  Clock, CheckCircle, AlertCircle, BookOpen, ArrowUpRight
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalStudents: number;
  activeStudents: number;
  totalTutors: number;
  todaySessions: number;
  feesThisMonth: number;
  pendingFees: number;
  trialsToday: number;
  recentReports: Array<{
    id: string;
    student: string;
    tutor: string;
    rating: string;
    created_at: string;
  }>;
  recentSessions: Array<{
    id: string;
    student: string;
    tutor: string;
    scheduled_at: string;
    status: string;
  }>;
}

const RATING_BADGE: Record<string, string> = {
  excellent: "badge badge-green",
  good: "badge badge-blue",
  average: "badge badge-yellow",
  needs_improvement: "badge badge-red",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0, activeStudents: 0, totalTutors: 0,
    todaySessions: 0, feesThisMonth: 0, pendingFees: 0,
    trialsToday: 0, recentReports: [], recentSessions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split("T")[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const [
        { count: totalStudents },
        { count: activeStudents },
        { count: totalTutors },
        { count: todaySessions },
        { data: feesData },
        { data: pendingData },
        { data: recentSessions },
        { data: recentReports },
      ] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("students").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "tutor"),
        supabase.from("class_sessions").select("*", { count: "exact", head: true })
          .gte("scheduled_at", today).lt("scheduled_at", today + "T23:59:59"),
        supabase.from("fees").select("amount").eq("status", "paid").gte("created_at", monthStart),
        supabase.from("fees").select("amount").eq("status", "pending"),
        supabase.from("class_sessions").select("id, scheduled_at, status, student:students(full_name), tutor:profiles(full_name)")
          .order("scheduled_at", { ascending: false }).limit(5),
        supabase.from("progress_reports").select("id, overall_rating, created_at, student:students(full_name), tutor:profiles(full_name)")
          .order("created_at", { ascending: false }).limit(5),
      ]);

      const feesThisMonth = feesData?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
      const pendingFees = pendingData?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;

      setStats({
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        totalTutors: totalTutors || 0,
        todaySessions: todaySessions || 0,
        feesThisMonth,
        pendingFees,
        trialsToday: 0,
        recentSessions: (recentSessions || []).map((s: any) => ({
          id: s.id,
          student: s.student?.full_name || "—",
          tutor: s.tutor?.full_name || "—",
          scheduled_at: s.scheduled_at,
          status: s.status,
        })),
        recentReports: (recentReports || []).map((r: any) => ({
          id: r.id,
          student: r.student?.full_name || "—",
          tutor: r.tutor?.full_name || "—",
          rating: r.overall_rating,
          created_at: r.created_at,
        })),
      });
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: "Total Students", value: stats.totalStudents, sub: `${stats.activeStudents} active`, icon: GraduationCap, color: "#1b5e42" },
    { label: "Tutors", value: stats.totalTutors, sub: "All active", icon: Users, color: "#2563eb" },
    { label: "Today's Classes", value: stats.todaySessions, sub: "Scheduled", icon: Calendar, color: "#7c3aed" },
    { label: "Fees This Month", value: `$${stats.feesThisMonth.toFixed(0)}`, sub: `$${stats.pendingFees.toFixed(0)} pending`, icon: DollarSign, color: "#d97706" },
  ];

  const SESSION_BADGE: Record<string, string> = {
    scheduled: "badge badge-blue",
    completed: "badge badge-green",
    cancelled: "badge badge-red",
    no_show: "badge badge-gray",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/students/new" className="btn-primary flex items-center gap-2">
            <GraduationCap size={16} /> Add Student
          </Link>
          <Link href="/admin/users/new" className="btn-outline flex items-center gap-2">
            <Users size={16} /> Add Tutor
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: card.color + "15" }}>
                <card.icon size={20} color={card.color} />
              </div>
              <TrendingUp size={14} className="text-green-500" />
            </div>
            <div className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
            <div className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Fee Reminders", href: "/admin/fees", icon: DollarSign, color: "#d97706" },
          { label: "Today's Trials", href: "/admin/students?filter=trial", icon: Clock, color: "#7c3aed" },
          { label: "Pending Reports", href: "/admin/reports", icon: BookOpen, color: "#1b5e42" },
          { label: "Overdue Fees", href: "/admin/fees?filter=overdue", icon: AlertCircle, color: "#dc2626" },
        ].map((action) => (
          <Link key={action.label} href={action.href}
            className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: action.color + "15" }}>
              <action.icon size={18} color={action.color} />
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
            <ArrowUpRight size={14} className="ml-auto text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={16} color="#1b5e42" /> Recent Sessions
            </h2>
            <Link href="/admin/sessions" className="text-xs text-emerald-700 font-medium">View all →</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Tutor</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSessions.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-gray-400">No sessions yet</td></tr>
              ) : stats.recentSessions.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.student}</td>
                  <td className="text-gray-500">{s.tutor}</td>
                  <td className="text-gray-500 text-xs">
                    {new Date(s.scheduled_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td><span className={SESSION_BADGE[s.status] || "badge badge-gray"}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Progress Reports */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle size={16} color="#1b5e42" /> Recent Reports
            </h2>
            <Link href="/admin/reports" className="text-xs text-emerald-700 font-medium">View all →</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Tutor</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentReports.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-gray-400">No reports yet</td></tr>
              ) : stats.recentReports.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.student}</td>
                  <td className="text-gray-500">{r.tutor}</td>
                  <td>
                    <span className={RATING_BADGE[r.rating] || "badge badge-gray"}>
                      {r.rating?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="text-gray-500 text-xs">
                    {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

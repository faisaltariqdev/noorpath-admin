"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar, Users, Star, Clock, CheckCircle, BookOpen, Mic, Send } from "lucide-react";
import Link from "next/link";
import type { ClassSession } from "@/types/database";

interface TodayClass extends ClassSession {
  student_name: string;
  report_submitted: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  scheduled: "badge badge-blue",
  completed: "badge badge-green",
  cancelled: "badge badge-red",
  no_show: "badge badge-gray",
};

export default function TutorDashboard() {
  const [classes, setClasses] = useState<TodayClass[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setUserId(session.user.id);

      const today = new Date().toISOString().split("T")[0];

      const [{ data: sessions }, { count }] = await Promise.all([
        supabase.from("class_sessions")
          .select("*, student:students(full_name, course, level)")
          .eq("tutor_id", session.user.id)
          .gte("scheduled_at", today)
          .lt("scheduled_at", today + "T23:59:59")
          .order("scheduled_at"),
        supabase.from("students").select("*", { count: "exact", head: true })
          .eq("tutor_id", session.user.id).eq("is_active", true),
      ]);

      setClasses(
        (sessions || []).map((s: any) => ({
          ...s,
          student_name: s.student?.full_name || "—",
          report_submitted: false,
        }))
      );
      setStudentCount(count || 0);
      setLoading(false);
    });
  }, []);

  async function markComplete(sessionId: string) {
    await supabase.from("class_sessions").update({ status: "completed" }).eq("id", sessionId);
    setClasses((prev) => prev.map((c) => c.id === sessionId ? { ...c, status: "completed" } : c));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>Tutor Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Classes", value: classes.length, icon: Calendar, color: "#1b5e42" },
          { label: "Completed", value: classes.filter(c => c.status === "completed").length, icon: CheckCircle, color: "#16a34a" },
          { label: "My Students", value: studentCount, icon: Users, color: "#2563eb" },
          { label: "Pending Reports", value: classes.filter(c => c.status === "completed" && !c.report_submitted).length, icon: BookOpen, color: "#d97706" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.color + "15" }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Today's Classes */}
      <div className="card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Calendar size={16} color="#1b5e42" /> Today&apos;s Classes
          </h2>
          <Link href="/tutor/classes" className="text-xs text-emerald-700 font-medium">Full schedule →</Link>
        </div>

        {classes.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Calendar size={36} className="mx-auto mb-3 opacity-30" />
            <p>No classes scheduled for today</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {classes.map((cls) => (
              <div key={cls.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ background: "#1b5e42" }}>
                      {cls.student_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{cls.student_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <Clock size={11} />
                        {new Date(cls.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        <span>·</span>
                        {cls.duration_minutes} min
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className={STATUS_BADGE[cls.status] || "badge badge-gray"}>{cls.status}</span>

                    {cls.meeting_link && (
                      <a href={cls.meeting_link} target="_blank" rel="noreferrer"
                        className="badge badge-green cursor-pointer hover:opacity-80">
                        Join Class →
                      </a>
                    )}

                    {cls.status === "scheduled" && (
                      <button onClick={() => markComplete(cls.id)}
                        className="btn-primary text-xs py-1 px-3 flex items-center gap-1">
                        <CheckCircle size={12} /> Mark Done
                      </button>
                    )}

                    {cls.status === "completed" && (
                      <Link href={`/tutor/reports/new?session=${cls.id}`}
                        className="btn-outline text-xs py-1 px-3 flex items-center gap-1">
                        <Send size={12} /> Submit Report
                      </Link>
                    )}
                  </div>
                </div>

                {/* Pre-class notes box */}
                {cls.notes && (
                  <div className="mt-3 p-3 rounded-lg text-xs text-gray-600" style={{ background: "#f0fdf4" }}>
                    <strong>Prep note:</strong> {cls.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Submit Progress Report", href: "/tutor/reports/new", icon: BookOpen, desc: "After every class" },
          { label: "Homework Templates", href: "/tutor/homework", icon: CheckCircle, desc: "Reusable templates" },
          { label: "My Earnings", href: "/tutor/earnings", icon: Star, desc: "Monthly summary" },
        ].map((action) => (
          <Link key={action.label} href={action.href}
            className="card p-5 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "#1b5e4215" }}>
              <action.icon size={20} color="#1b5e42" />
            </div>
            <div className="font-semibold text-gray-800 text-sm">{action.label}</div>
            <div className="text-xs text-gray-500 mt-1">{action.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

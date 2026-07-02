"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BookOpen, Calendar, CheckCircle, Star, DollarSign, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Student, Fee, ProgressReport, Attendance } from "@/types/database";

const RATING_STARS: Record<string, number> = {
  excellent: 5, good: 4, average: 3, needs_improvement: 2,
};

const RATING_COLOR: Record<string, string> = {
  excellent: "#16a34a", good: "#2563eb", average: "#d97706", needs_improvement: "#dc2626",
};

export default function ParentDashboard() {
  const [children, setChildren] = useState<Student[]>([]);
  const [latestReport, setLatestReport] = useState<ProgressReport | null>(null);
  const [pendingFees, setPendingFees] = useState<Fee[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0 });
  const [homework, setHomework] = useState<{ text: string; completed: boolean; id: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const uid = session.user.id;

      const [{ data: kids }, { data: fees }, { data: reports }, { data: hwLogs }] = await Promise.all([
        supabase.from("students").select("*").eq("parent_id", uid).eq("is_active", true),
        supabase.from("fees").select("*").eq("parent_id", uid).in("status", ["pending", "overdue"]),
        supabase.from("progress_reports").select("*").order("created_at", { ascending: false }).limit(1),
        supabase.from("homework_logs").select("*").order("created_at", { ascending: false }).limit(10),
      ]);

      if (kids && kids.length > 0) {
        const studentIds = kids.map(k => k.id);
        const { data: attData } = await supabase
          .from("attendance").select("status").in("student_id", studentIds);
        const present = attData?.filter(a => a.status === "present").length || 0;
        const absent = attData?.filter(a => a.status === "absent").length || 0;
        const late = attData?.filter(a => a.status === "late").length || 0;
        setAttendanceStats({ present, absent, late });
      }

      setChildren(kids || []);
      setPendingFees(fees || []);
      setLatestReport(reports?.[0] || null);
      setHomework((hwLogs || []).map((h: any) => ({
        id: h.id, text: h.homework_text, completed: h.is_completed,
      })));
      setLoading(false);
    });
  }, []);

  async function markHomework(id: string, done: boolean) {
    await supabase.from("homework_logs").update({ is_completed: done, completed_at: done ? new Date().toISOString() : null }).eq("id", id);
    setHomework(prev => prev.map(h => h.id === id ? { ...h, completed: done } : h));
  }

  const totalFeesDue = pendingFees.reduce((s, f) => s + f.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>
          Assalamualaykum 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Children enrolled */}
      {children.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {children.map((child) => (
            <div key={child.id} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
                  style={{ background: "#1b5e42" }}>
                  {child.full_name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{child.full_name}</div>
                  <div className="text-xs text-gray-500">{child.course} · {child.level}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 rounded-lg p-2">
                  <div className="font-bold text-green-700">{attendanceStats.present}</div>
                  <div className="text-xs text-gray-500">Present</div>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <div className="font-bold text-red-700">{attendanceStats.absent}</div>
                  <div className="text-xs text-gray-500">Absent</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2">
                  <div className="font-bold text-yellow-700">{attendanceStats.late}</div>
                  <div className="text-xs text-gray-500">Late</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Latest Progress Report */}
      {latestReport && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Star size={16} color="#1b5e42" /> Latest Progress Report
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Pages Covered</div>
              <div className="font-semibold text-gray-800">{latestReport.pages_covered || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Surah</div>
              <div className="font-semibold text-gray-800">{latestReport.surah_covered || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Tajweed Stars</div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < (latestReport.tajweed_stars || 0) ? "#c9a84c" : "none"}
                    color={i < (latestReport.tajweed_stars || 0) ? "#c9a84c" : "#d1d5db"} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Overall</div>
              <div className="font-semibold capitalize"
                style={{ color: RATING_COLOR[latestReport.overall_rating || ""] || "#6b7280" }}>
                {latestReport.overall_rating?.replace("_", " ") || "—"}
              </div>
            </div>
          </div>
          {latestReport.tutor_notes && (
            <div className="mt-4 p-3 rounded-lg text-sm text-gray-600" style={{ background: "#f0fdf4" }}>
              <strong>Tutor&apos;s Note:</strong> {latestReport.tutor_notes}
            </div>
          )}
          <Link href="/parent/reports" className="text-xs text-emerald-700 font-medium mt-3 inline-block">
            View all reports →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Homework */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <BookOpen size={16} color="#1b5e42" /> Homework
          </h2>
          {homework.length === 0 ? (
            <p className="text-sm text-gray-400">No homework assigned yet</p>
          ) : (
            <div className="space-y-3">
              {homework.map((hw) => (
                <div key={hw.id} className="flex items-start gap-3">
                  <button
                    onClick={() => markHomework(hw.id, !hw.completed)}
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-colors ${hw.completed ? "bg-emerald-600 border-emerald-600" : "border-gray-300"}`}>
                    {hw.completed && <CheckCircle size={12} color="#fff" />}
                  </button>
                  <span className={`text-sm ${hw.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {hw.text}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link href="/parent/homework" className="text-xs text-emerald-700 font-medium mt-4 inline-block">
            View all homework →
          </Link>
        </div>

        {/* Fees */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <DollarSign size={16} color="#1b5e42" /> Fees & Payments
          </h2>
          {pendingFees.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle size={16} /> All fees are up to date!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: fee.status === "overdue" ? "#fef2f2" : "#fffbeb" }}>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {fee.currency} {fee.amount} — {fee.period_month}/{fee.period_year}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> Due: {new Date(fee.due_date).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <span className={fee.status === "overdue" ? "badge badge-red" : "badge badge-yellow"}>
                    {fee.status}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total Due:</span>
                  <span style={{ color: "#dc2626" }}>${totalFeesDue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          <Link href="/parent/fees" className="btn-primary text-xs py-2 px-4 mt-4 inline-flex items-center gap-1">
            <DollarSign size={12} /> Pay Fees
          </Link>
        </div>
      </div>
    </div>
  );
}

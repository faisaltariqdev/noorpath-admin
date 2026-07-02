"use client";
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import ParentStudentSwitcher from "@/components/ParentStudentSwitcher";
import { formatStudentLevel } from "@/lib/portal";
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";

interface StudentInfo {
  id: string;
  full_name: string;
  level?: string | null;
  course?: string | null;
}

interface AttendanceRow {
  id: string;
  session_date?: string;
  status: string;
  notes?: string | null;
  marked_at?: string;
}

export default function ParentAttendancePage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());

  useEffect(() => {
    async function loadStudents() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("students")
        .select("id, full_name, level, course")
        .eq("parent_id", user.id)
        .eq("is_active", true)
        .order("full_name");
      const mapped = (data || []) as StudentInfo[];
      setStudents(mapped);
      setSelectedStudentId((current) => current || mapped[0]?.id || "");
      setLoading(false);
    }
    loadStudents();
  }, []);

  useEffect(() => {
    async function loadAttendance() {
      if (!selectedStudentId) return;
      setLoading(true);
      const { data } = await supabase
        .from("attendance")
        .select("id, session_date, status, notes, marked_at")
        .eq("student_id", selectedStudentId)
        .order("session_date", { ascending: false });
      setAttendance((data || []) as AttendanceRow[]);
      setLoading(false);
    }
    loadAttendance();
  }, [selectedStudentId]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const thisYear = new Date().getFullYear();
  const filtered = attendance.filter((row) => {
    const date = row.session_date || row.marked_at;
    if (!date) return false;
    return new Date(date).getMonth() === filterMonth && new Date(date).getFullYear() === thisYear;
  });

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [selectedStudentId, students]
  );

  const attended = filtered.filter(s => s.status === "present").length;
  const missed   = filtered.filter(s => s.status === "absent" || s.status === "leave").length;
  const rate     = filtered.length ? Math.round((attended / filtered.length) * 100) : 0;
  const lateCount = filtered.filter((row) => row.status === "late").length;

  const STATUS_ICON: Record<string, React.ReactNode> = {
    present: <CheckCircle size={16} color="#16a34a" />,
    absent: <XCircle size={16} color="#dc2626" />,
    leave: <XCircle size={16} color="#94a3b8" />,
    late: <Clock size={16} color="#d97706" />,
  };
  const STATUS_BADGE: Record<string, string> = {
    present: "badge badge-green", absent: "badge badge-red",
    leave: "badge badge-gray", late: "badge badge-yellow",
  };

  return (
    <>
      <TopBar title="Attendance" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Attendance Calendar</h1>
        <p className="page-subtitle">Track class attendance month by month</p>
      </div>
      <div className="page-body">
        <ParentStudentSwitcher
          students={students}
          selectedId={selectedStudentId}
          onChange={setSelectedStudentId}
        />

        {selectedStudent && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {selectedStudent.full_name}
                </div>
                <div style={{ marginTop: 4, fontSize: "0.8rem", color: "#64748b" }}>
                  {formatStudentLevel(selectedStudent.level)}
                  {selectedStudent.course ? ` · ${selectedStudent.course}` : ""}
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Attendance records are based on marked classes</div>
            </div>
          </div>
        )}

        {/* Month tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 20 }}>
          {months.map((m, i) => (
            <button key={m} onClick={() => setFilterMonth(i)} className={`btn btn-sm ${filterMonth === i ? "btn-primary" : "btn-ghost"}`} style={{ flexShrink: 0 }}>{m}</button>
          ))}
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: "Present",            value: attended,       icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
            { label: "Missed / Leave",     value: missed,         icon: XCircle,     color: "#dc2626", bg: "#fee2e2" },
            { label: "Attendance Rate",    value: `${rate}%`,     icon: TrendingUp,  color: "#1b5e42", bg: "#f0fdf4" },
            { label: "Late Arrivals",      value: lateCount,      icon: Clock,       color: "#7c3aed", bg: "#f5f3ff" },
          ].map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-icon" style={{ background: c.bg, marginBottom: 12 }}><c.icon size={20} color={c.color} /></div>
              <div className="stat-value" style={{ fontSize: "1.4rem" }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Attendance rate bar */}
        {filtered.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-playfair), Georgia, serif" }}>Attendance Rate — {months[filterMonth]}</span>
                <span style={{ fontWeight: 800, fontSize: "1.1rem", color: rate >= 80 ? "#16a34a" : rate >= 60 ? "#d97706" : "#dc2626" }}>{rate}%</span>
              </div>
              <div style={{ height: 12, background: "#f1f5f9", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${rate}%`, background: rate >= 80 ? "linear-gradient(90deg, #1b5e42, #22c55e)" : rate >= 60 ? "linear-gradient(90deg, #d97706, #f59e0b)" : "linear-gradient(90deg, #dc2626, #f87171)", borderRadius: 12, transition: "width 0.8s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8", marginTop: 6 }}>
                <span>0%</span><span>Target: 90%</span><span>100%</span>
              </div>
            </div>
          </div>
        )}

        {/* Sessions list */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Calendar size={15} color="#1b5e42" /> {months[filterMonth]} Classes</h3>
          </div>
          {loading ? (
            <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><Calendar size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No classes in {months[filterMonth]}</h3><p>No sessions recorded for this month.</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Date</th><th>Status</th><th>Notes</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {STATUS_ICON[s.status] || <Clock size={16} color="#94a3b8" />}
                        {new Date(s.session_date || s.marked_at || "").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                      </div>
                    </td>
                    <td><span className={STATUS_BADGE[s.status] || "badge badge-gray"}>{s.status?.replace("_", " ")}</span></td>
                    <td style={{ color: "#64748b" }}>{s.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

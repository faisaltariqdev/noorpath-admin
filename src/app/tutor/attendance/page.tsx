"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, Users, XCircle, CalendarDays } from "lucide-react";
import TopBar from "@/components/TopBar";
import { supabase } from "@/lib/supabase";
import type { AttendanceStatus } from "@/types/database";

interface Student {
  id: string;
  full_name: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  status: AttendanceStatus;
  notes?: string | null;
  late_minutes?: number | null;
}

interface DaySession {
  id: string;
  student_id: string;
  student_name: string;
  scheduled_at: string;
  status: string;
}

const TODAY = new Date().toISOString().slice(0, 10);
const STATUSES: AttendanceStatus[] = ["present", "absent", "late", "leave"];

const STATUS_CONFIG: Record<AttendanceStatus, { bg: string; color: string; label: string }> = {
  present: { bg: "#1b5e42", color: "#fff", label: "Present" },
  absent: { bg: "#dc2626", color: "#fff", label: "Absent" },
  late: { bg: "#d97706", color: "#fff", label: "Late" },
  leave: { bg: "#2563eb", color: "#fff", label: "Leave" },
};

export default function TutorAttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [sessions, setSessions] = useState<DaySession[]>([]);
  const [myAttendance, setMyAttendance] = useState<{ session_date: string; status: string; notes?: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(TODAY);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [lateMinutes, setLateMinutes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMessage("");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const dayStart = `${date}T00:00:00`;
      const dayEnd = `${date}T23:59:59`;
      const monthKey = date.slice(0, 7);
      const monthStart = `${monthKey}-01`;
      const monthEndDate = new Date(`${monthKey}-01T00:00:00`);
      monthEndDate.setMonth(monthEndDate.getMonth() + 1);
      const monthEnd = monthEndDate.toISOString().slice(0, 10);

      const [{ data: studs }, { data: att }, { data: daySessions }, { data: ownAtt }] = await Promise.all([
        supabase
          .from("students")
          .select("id, full_name")
          .eq("tutor_id", user.id)
          .eq("is_active", true)
          .order("full_name"),
        supabase
          .from("attendance")
          .select("id, student_id, status, notes, late_minutes")
          .eq("tutor_id", user.id)
          .eq("session_date", date),
        supabase
          .from("class_sessions")
          .select("id, student_id, scheduled_at, status, student:students(full_name)")
          .eq("tutor_id", user.id)
          .gte("scheduled_at", dayStart)
          .lte("scheduled_at", dayEnd)
          .order("scheduled_at"),
        supabase
          .from("teacher_attendance")
          .select("session_date, status, notes")
          .eq("tutor_id", user.id)
          .gte("session_date", monthStart)
          .lt("session_date", monthEnd)
          .order("session_date", { ascending: false }),
      ]);

      const studList = (studs || []) as Student[];
      const attList = (att || []) as AttendanceRecord[];
      setStudents(studList);
      setRecords(attList);
      setMyAttendance((ownAtt || []) as { session_date: string; status: string; notes?: string | null }[]);
      setSessions(
        (daySessions || []).map((row: any) => ({
          id: row.id,
          student_id: row.student_id,
          student_name: row.student?.full_name || "Student",
          scheduled_at: row.scheduled_at,
          status: row.status,
        }))
      );

      const initStatuses: Record<string, AttendanceStatus> = {};
      const initNotes: Record<string, string> = {};
      const initLate: Record<string, string> = {};
      for (const student of studList) {
        const existing = attList.find((row) => row.student_id === student.id);
        initStatuses[student.id] = existing?.status || "present";
        initNotes[student.id] = existing?.notes || "";
        initLate[student.id] = existing?.late_minutes ? String(existing.late_minutes) : "";
      }
      setStatuses(initStatuses);
      setNotes(initNotes);
      setLateMinutes(initLate);
      setLoading(false);
    }
    load();
  }, [date]);

  async function saveAttendance() {
    setSaving(true);
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setMessage("Not signed in.");
      return;
    }

    const errors: string[] = [];
    for (const student of students) {
      const status = statuses[student.id] || "present";
      const payload = {
        student_id: student.id,
        tutor_id: user.id,
        session_date: date,
        status,
        late_minutes: status === "late" ? Number(lateMinutes[student.id] || 0) : 0,
        notes: notes[student.id]?.trim() || null,
        marked_at: new Date().toISOString(),
      };
      const existing = records.find((row) => row.student_id === student.id);
      const { error } = existing
        ? await supabase.from("attendance").update(payload).eq("id", existing.id)
        : await supabase.from("attendance").insert(payload);
      if (error) errors.push(`${student.full_name}: ${error.message}`);
    }

    setSaving(false);
    if (errors.length) {
      setMessage(errors[0]);
      return;
    }
    setMessage("Attendance saved.");
    setTimeout(() => setMessage(""), 2500);

    const { data: att } = await supabase
      .from("attendance")
      .select("id, student_id, status, notes, late_minutes")
      .eq("tutor_id", user.id)
      .eq("session_date", date);
    setRecords((att || []) as AttendanceRecord[]);
  }

  const counts = useMemo(() => ({
    present: Object.values(statuses).filter((s) => s === "present").length,
    absent: Object.values(statuses).filter((s) => s === "absent").length,
    late: Object.values(statuses).filter((s) => s === "late").length,
    leave: Object.values(statuses).filter((s) => s === "leave").length,
  }), [statuses]);

  function markAll(status: AttendanceStatus) {
    setStatuses(Object.fromEntries(students.map((s) => [s.id, status])));
  }

  return (
    <>
      <TopBar title="Attendance" subtitle="Mark your students for each class day" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Mark Student Attendance</h1>
            <p className="page-subtitle">{students.length} assigned students · {date}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              style={{ width: "auto" }}
            />
            <button type="button" className="btn btn-ghost" onClick={() => markAll("present")} disabled={!students.length}>
              All present
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={saveAttendance}
              disabled={saving || students.length === 0}
            >
              {saving ? "Saving..." : message === "Attendance saved." ? <><CheckCircle size={14} /> Saved</> : "Save Attendance"}
            </button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {message && message !== "Attendance saved." && (
          <p style={{ color: "#dc2626", marginBottom: 12, fontSize: "0.85rem" }}>{message}</p>
        )}

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Present", count: counts.present, color: "#16a34a", bg: "#dcfce7" },
            { label: "Absent", count: counts.absent, color: "#dc2626", bg: "#fee2e2" },
            { label: "Late", count: counts.late, color: "#d97706", bg: "#fef9c3" },
            { label: "Leave", count: counts.leave, color: "#2563eb", bg: "#dbeafe" },
          ].map((card) => (
            <div key={card.label} style={{ background: card.bg, borderRadius: 12, padding: "12px 18px", display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.5rem", fontWeight: 800, color: card.color }}>{card.count}</div>
              <div style={{ fontSize: "0.78rem", color: card.color, fontWeight: 600 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {sessions.length > 0 && (
          <div className="card" style={{ marginBottom: 16, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontWeight: 700, fontSize: "0.85rem" }}>
              <CalendarDays size={16} /> Classes on this date ({sessions.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sessions.map((session) => (
                <span key={session.id} className="badge badge-blue">
                  {new Date(session.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {session.student_name} · {session.status}
                </span>
              ))}
            </div>
          </div>
        )}

        {myAttendance.length > 0 && (
          <div className="card" style={{ marginBottom: 16, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 10 }}>My attendance (this month)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {myAttendance.map((row) => (
                <span key={`${row.session_date}-${row.status}`} className={`badge ${row.status === "present" ? "badge-green" : row.status === "late" ? "badge-yellow" : row.status === "leave" ? "badge-blue" : "badge-red"}`}>
                  {new Date(row.session_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {row.status}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <Users size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
            <h3>No students assigned</h3>
            <p>Students appear here once admin assigns them to you.</p>
          </div>
        ) : (
          <div className="card">
            <div style={{ display: "flex", flexDirection: "column" }}>
              {students.map((student, index) => (
                <div
                  key={student.id}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    padding: "14px 20px",
                    borderBottom: index < students.length - 1 ? "1px solid #f1f5f9" : "none",
                    flexWrap: "wrap",
                  }}
                >
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: "0.85rem", flexShrink: 0 }}>
                    {student.full_name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>{student.full_name}</div>
                    {sessions.some((s) => s.student_id === student.id) && (
                      <div style={{ fontSize: "0.7rem", color: "#15803d", marginTop: 2 }}>Has class today</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {STATUSES.map((status) => {
                      const active = statuses[student.id] === status;
                      const config = STATUS_CONFIG[status];
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStatuses((prev) => ({ ...prev, [student.id]: status }))}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 8,
                            border: `1px solid ${active ? config.bg : "#e2e8f0"}`,
                            background: active ? config.bg : "transparent",
                            color: active ? config.color : "#64748b",
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            cursor: "pointer",
                          }}
                        >
                          {status === "present" && <CheckCircle size={11} />}
                          {status === "absent" && <XCircle size={11} />}
                          {status === "late" && <Clock size={11} />}
                          {" "}{config.label}
                        </button>
                      );
                    })}
                  </div>
                  {statuses[student.id] === "late" && (
                    <input
                      type="number"
                      min={1}
                      value={lateMinutes[student.id] || ""}
                      onChange={(e) => setLateMinutes((prev) => ({ ...prev, [student.id]: e.target.value }))}
                      placeholder="Mins late"
                      className="form-input"
                      style={{ width: 100, fontSize: "0.78rem", padding: "6px 10px" }}
                    />
                  )}
                  <input
                    value={notes[student.id] || ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [student.id]: e.target.value }))}
                    placeholder="Note (optional)"
                    className="form-input"
                    style={{ width: 180, fontSize: "0.78rem", padding: "6px 10px" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

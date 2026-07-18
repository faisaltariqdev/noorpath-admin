"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, Users, XCircle, CalendarDays } from "lucide-react";
import TopBar from "@/components/TopBar";
import { unwrapOne } from "@/lib/currency";
import { supabase } from "@/lib/supabase";
import type { AttendanceStatus } from "@/types/database";

interface DaySession {
  id: string;
  student_id: string;
  student_name: string;
  course: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  attendance_id?: string;
  att_status?: AttendanceStatus;
  actual_join_at?: string | null;
  actual_duration_minutes?: number | null;
  notes?: string | null;
  late_minutes?: number | null;
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
  const [sessions, setSessions] = useState<DaySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(TODAY);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [joinTimes, setJoinTimes] = useState<Record<string, string>>({});
  const [durations, setDurations] = useState<Record<string, string>>({});
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

      const [{ data: daySessions }, { data: att }] = await Promise.all([
        supabase
          .from("class_sessions")
          .select("id, student_id, scheduled_at, duration_minutes, status, student:students(full_name, course)")
          .eq("tutor_id", user.id)
          .gte("scheduled_at", dayStart)
          .lte("scheduled_at", dayEnd)
          .order("scheduled_at"),
        supabase
          .from("attendance")
          .select("id, session_id, student_id, status, notes, late_minutes, actual_join_at, actual_duration_minutes")
          .eq("tutor_id", user.id)
          .eq("session_date", date),
      ]);

      const attBySession = new Map((att || []).filter((a: any) => a.session_id).map((a: any) => [a.session_id, a]));
      const mapped: DaySession[] = (daySessions || []).map((s: any) => {
        const student = unwrapOne<{ full_name?: string; course?: string }>(s.student);
        const existing = attBySession.get(s.id);
        return {
          id: s.id,
          student_id: s.student_id,
          student_name: student?.full_name || "—",
          course: student?.course || "—",
          scheduled_at: s.scheduled_at,
          duration_minutes: s.duration_minutes || 30,
          status: s.status,
          attendance_id: existing?.id,
          att_status: existing?.status,
          actual_join_at: existing?.actual_join_at,
          actual_duration_minutes: existing?.actual_duration_minutes,
          notes: existing?.notes,
          late_minutes: existing?.late_minutes,
        };
      });

      setSessions(mapped);
      setStatuses(Object.fromEntries(mapped.map((s) => [s.id, (s.att_status as AttendanceStatus) || "present"])));
      setJoinTimes(Object.fromEntries(mapped.map((s) => {
        if (!s.actual_join_at) return [s.id, ""];
        const d = new Date(s.actual_join_at);
        return [s.id, `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`];
      })));
      setDurations(Object.fromEntries(mapped.map((s) => [s.id, s.actual_duration_minutes != null ? String(s.actual_duration_minutes) : String(s.duration_minutes)])));
      setNotes(Object.fromEntries(mapped.map((s) => [s.id, s.notes || ""])));
      setLateMinutes(Object.fromEntries(mapped.map((s) => [s.id, s.late_minutes != null ? String(s.late_minutes) : ""])));
      setLoading(false);
    }
    void load();
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
    for (const session of sessions) {
      const status = statuses[session.id] || "present";
      let actualJoin: string | null = null;
      if (joinTimes[session.id]) {
        actualJoin = new Date(`${date}T${joinTimes[session.id]}:00`).toISOString();
      }
      const payload = {
        student_id: session.student_id,
        tutor_id: user.id,
        session_id: session.id,
        session_date: date,
        status,
        late_minutes: status === "late" ? Number(lateMinutes[session.id] || 0) : 0,
        notes: notes[session.id]?.trim() || null,
        marked_at: new Date().toISOString(),
        scheduled_at: session.scheduled_at,
        actual_join_at: actualJoin,
        actual_duration_minutes: durations[session.id] ? Number(durations[session.id]) : session.duration_minutes,
        class_label: `${session.course} · ${new Date(session.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      };
      const { error } = session.attendance_id
        ? await supabase.from("attendance").update(payload).eq("id", session.attendance_id)
        : await supabase.from("attendance").insert(payload);
      if (error) errors.push(`${session.student_name}: ${error.message}`);
    }

    setSaving(false);
    if (errors.length) {
      setMessage(errors[0]);
      return;
    }
    setMessage("Attendance saved.");
    setTimeout(() => setMessage(""), 2500);
    // Trigger reload by bumping date state through a no-op remount path
    const current = date;
    setDate("");
    requestAnimationFrame(() => setDate(current));
  }

  const counts = useMemo(() => ({
    present: Object.values(statuses).filter((s) => s === "present").length,
    absent: Object.values(statuses).filter((s) => s === "absent").length,
    late: Object.values(statuses).filter((s) => s === "late").length,
    leave: Object.values(statuses).filter((s) => s === "leave").length,
  }), [statuses]);

  return (
    <>
      <TopBar title="Attendance" subtitle="Mark each scheduled class with join time and duration" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Session Attendance</h1>
            <p className="page-subtitle">{sessions.length} classes on {date}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" style={{ width: "auto" }} />
            <button type="button" className="btn btn-primary" onClick={() => void saveAttendance()} disabled={saving || sessions.length === 0}>
              {saving ? "Saving…" : message === "Attendance saved." ? <><CheckCircle size={14} /> Saved</> : "Save Attendance"}
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
            <div key={card.label} style={{ background: card.bg, borderRadius: 12, padding: "12px 18px" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: card.color }}>{card.count}</div>
              <div style={{ fontSize: "0.78rem", color: card.color, fontWeight: 600 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
            <h3>No classes scheduled</h3>
            <p>Attendance is marked per live class session for this date.</p>
          </div>
        ) : (
          <div className="card">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                style={{
                  padding: "16px 20px",
                  borderBottom: index < sessions.length - 1 ? "1px solid #f1f5f9" : "none",
                  display: "grid",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{session.student_name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      {session.course} · Scheduled{" "}
                      {new Date(session.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {" · "}{session.duration_minutes} min planned · Class status: {session.status}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {STATUSES.map((status) => {
                      const active = statuses[session.id] === status;
                      const config = STATUS_CONFIG[status];
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStatuses((prev) => ({ ...prev, [session.id]: status }))}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: `1px solid ${active ? config.bg : "#e2e8f0"}`,
                            background: active ? config.bg : "transparent",
                            color: active ? config.color : "#64748b",
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            cursor: "pointer",
                            minHeight: 40,
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
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                  <div>
                    <label className="form-label">Actual join time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={joinTimes[session.id] || ""}
                      onChange={(e) => setJoinTimes((p) => ({ ...p, [session.id]: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Duration (min)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={durations[session.id] || ""}
                      onChange={(e) => setDurations((p) => ({ ...p, [session.id]: e.target.value }))}
                    />
                  </div>
                  {statuses[session.id] === "late" && (
                    <div>
                      <label className="form-label">Late minutes</label>
                      <input
                        type="number"
                        className="form-input"
                        value={lateMinutes[session.id] || ""}
                        onChange={(e) => setLateMinutes((p) => ({ ...p, [session.id]: e.target.value }))}
                      />
                    </div>
                  )}
                  <div>
                    <label className="form-label">Notes</label>
                    <input
                      className="form-input"
                      value={notes[session.id] || ""}
                      onChange={(e) => setNotes((p) => ({ ...p, [session.id]: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div style={{ marginTop: 12, fontSize: "0.8rem", color: "#64748b", display: "flex", gap: 6, alignItems: "center" }}>
            <Users size={14} /> Only students with a scheduled class on this date appear here.
          </div>
        )}
      </div>
    </>
  );
}

"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { Clock, CheckCircle, XCircle, Users } from "lucide-react";

interface Student { id: string; full_name: string; }
interface AttendanceRecord { id: string; student_id: string; student_name: string; session_date: string; status: "present" | "absent" | "late"; notes: string; }

const TODAY = new Date().toISOString().split("T")[0];

export default function TutorAttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [records,  setRecords]  = useState<AttendanceRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [date,    setDate]      = useState(TODAY);
  const [statuses, setStatuses] = useState<Record<string, "present" | "absent" | "late">>({});
  const [notes,    setNotes]    = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: studs }, { data: att }] = await Promise.all([
        supabase.from("students").select("id, full_name").eq("tutor_id", user.id).eq("is_active", true),
        supabase.from("attendance").select("id, student_id, session_date, status, notes").eq("tutor_id", user.id).eq("session_date", date),
      ]);
      const studList = studs || [];
      setStudents(studList);
      setRecords((att || []).map((a: any) => ({ id: a.id, student_id: a.student_id, student_name: studList.find(s => s.id === a.student_id)?.full_name || "—", session_date: a.session_date, status: a.status, notes: a.notes || "" })));
      const initStatuses: Record<string, "present" | "absent" | "late"> = {};
      const initNotes:    Record<string, string> = {};
      for (const s of studList) {
        const existing = (att || []).find((a: any) => a.student_id === s.id);
        initStatuses[s.id] = existing?.status || "present";
        initNotes[s.id]    = existing?.notes || "";
      }
      setStatuses(initStatuses);
      setNotes(initNotes);
      setLoading(false);
    }
    load();
  }, [date]);

  async function saveAttendance() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    for (const student of students) {
      const existing = records.find(r => r.student_id === student.id);
      const payload  = { student_id: student.id, tutor_id: user?.id, session_date: date, status: statuses[student.id] || "present", notes: notes[student.id] || "" };
      if (existing) await supabase.from("attendance").update(payload).eq("id", existing.id);
      else           await supabase.from("attendance").insert(payload);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const presentCount = Object.values(statuses).filter(s => s === "present").length;
  const absentCount  = Object.values(statuses).filter(s => s === "absent").length;
  const lateCount    = Object.values(statuses).filter(s => s === "late").length;

  const STATUS_CONFIG = {
    present: { bg: "#1b5e42", color: "#fff",   label: "Present" },
    absent:  { bg: "#dc2626", color: "#fff",   label: "Absent"  },
    late:    { bg: "#d97706", color: "#fff",   label: "Late"    },
  };

  return (
    <>
      <TopBar title="Attendance" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><h1 className="page-title">Mark Attendance</h1><p className="page-subtitle">{students.length} students · {date}</p></div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" style={{ width: "auto", paddingRight: 12 }} />
            <button className="btn btn-primary" onClick={saveAttendance} disabled={saving || students.length === 0}>
              {saved ? <><CheckCircle size={14} /> Saved!</> : saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[{ label: "Present", count: presentCount, color: "#16a34a", bg: "#dcfce7" }, { label: "Absent", count: absentCount, color: "#dc2626", bg: "#fee2e2" }, { label: "Late", count: lateCount, color: "#d97706", bg: "#fef9c3" }].map(c => (
            <div key={c.label} style={{ background: c.bg, borderRadius: 12, padding: "12px 18px", display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.5rem", fontWeight: 800, color: c.color }}>{c.count}</div>
              <div style={{ fontSize: "0.78rem", color: c.color, fontWeight: 600 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {loading ? <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
          : students.length === 0 ? <div className="empty-state"><Users size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No students assigned</h3><p>Students will appear here once assigned to you by admin.</p></div>
          : (
            <div className="card">
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {students.map((s, i) => (
                  <div key={s.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 20px", borderBottom: i < students.length - 1 ? "1px solid #f1f5f9" : "none", flexWrap: "wrap" }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: "0.85rem", flexShrink: 0 }}>{s.full_name.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a", fontFamily: "var(--font-jakarta), sans-serif" }}>{s.full_name}</div>
                    </div>
                    {/* Status buttons */}
                    <div style={{ display: "flex", gap: 6 }}>
                      {(["present", "absent", "late"] as const).map(st => (
                        <button key={st} onClick={() => setStatuses(p => ({ ...p, [s.id]: st }))} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${statuses[s.id] === st ? STATUS_CONFIG[st].bg : "#e2e8f0"}`, background: statuses[s.id] === st ? STATUS_CONFIG[st].bg : "transparent", color: statuses[s.id] === st ? STATUS_CONFIG[st].color : "#64748b", fontWeight: 600, fontSize: "0.72rem", cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-jakarta), sans-serif" }}>
                          {st === "present" ? <><CheckCircle size={11} /> Present</> : st === "absent" ? <><XCircle size={11} /> Absent</> : <><Clock size={11} /> Late</>}
                        </button>
                      ))}
                    </div>
                    <input value={notes[s.id] || ""} onChange={e => setNotes(p => ({ ...p, [s.id]: e.target.value }))} placeholder="Note (optional)" className="form-input" style={{ width: 180, fontSize: "0.78rem", padding: "6px 10px" }} />
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </>
  );
}

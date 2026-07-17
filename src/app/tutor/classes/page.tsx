"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { getSessionSubject } from "@/lib/portal";
import { unwrapOne } from "@/lib/currency";
import { formatTimePair } from "@/lib/timezones";
import { Calendar, Video, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface Session {
  id: string;
  student_name: string;
  course?: string;
  scheduled_at: string;
  duration: number;
  status: string;
  meeting_link: string;
  notes: string;
  student_timezone?: string;
  tutor_timezone?: string;
}
const STATUS_BADGE: Record<string, string> = { scheduled: "badge badge-blue", completed: "badge badge-green", cancelled: "badge badge-red", no_show: "badge badge-gray" };

export default function TutorClassesPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [offset, setOffset]     = useState(0); // days from today
  const [view, setView]         = useState<"day" | "week">("week");

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + offset);
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() - baseDate.getDay() + 1); // Monday

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setLoading(true);
      const start = view === "day"
        ? new Date(baseDate).toISOString().split("T")[0]
        : startOfWeek.toISOString().split("T")[0];
      const endDate = new Date(view === "day" ? baseDate : startOfWeek);
      endDate.setDate(endDate.getDate() + (view === "day" ? 1 : 7));
      const { data } = await supabase.from("class_sessions")
        .select("id, scheduled_at, duration_minutes, status, meeting_link, notes, student:students(full_name, course, timezone), tutor:profiles!class_sessions_tutor_id_fkey(timezone)")
        .eq("tutor_id", user.id)
        .gte("scheduled_at", start)
        .lt("scheduled_at", endDate.toISOString().split("T")[0])
        .order("scheduled_at");
      setSessions((data || []).map((s: any) => {
        const student = unwrapOne(s.student);
        const tutor = unwrapOne(s.tutor);
        return {
          id: s.id,
          student_name: student?.full_name || "—",
          course: student?.course || "",
          scheduled_at: s.scheduled_at,
          duration: s.duration_minutes || 30,
          status: s.status,
          meeting_link: s.meeting_link || "",
          notes: s.notes || "",
          student_timezone: student?.timezone || "",
          tutor_timezone: tutor?.timezone || "",
        };
      }).sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at)));
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, view]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("class_sessions").update({ status }).eq("id", id);
    setSessions(p => p.map(s => s.id === id ? { ...s, status } : s));
  }

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
  const sessForDay = (d: Date) =>
    sessions
      .filter(s => new Date(s.scheduled_at).toDateString() === d.toDateString())
      .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at));

  const labelDate = view === "day"
    ? baseDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    : `${startOfWeek.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekDays[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <>
      <TopBar title="Class Schedule" subtitle={labelDate} />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <h1 className="page-title">My Class Schedule</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 0, border: "1px solid #e2e8f0", borderRadius: 9, overflow: "hidden" }}>
              {(["day", "week"] as const).map(v => <button key={v} onClick={() => setView(v)} style={{ padding: "7px 16px", fontSize: "0.78rem", fontWeight: 600, border: "none", background: view === v ? "#1b5e42" : "transparent", color: view === v ? "#fff" : "#64748b", cursor: "pointer", textTransform: "capitalize", fontFamily: "var(--font-jakarta), sans-serif" }}>{v}</button>)}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setOffset(o => o - (view === "day" ? 1 : 7))}><ChevronLeft size={16} /></button>
            <button className="btn btn-ghost btn-sm" onClick={() => setOffset(0)}>Today</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setOffset(o => o + (view === "day" ? 1 : 7))}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      <div className="page-body">
        {loading ? (
          <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
        ) : view === "week" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {weekDays.map((d, i) => {
              const daySess = sessForDay(d);
              return (
                <div key={i}>
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{DAYS[i]}</div>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: isToday(d) ? "#1b5e42" : "transparent", color: isToday(d) ? "#fff" : "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", margin: "4px auto 0", fontWeight: 700, fontSize: "0.9rem", fontFamily: "var(--font-playfair), Georgia, serif" }}>{d.getDate()}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 80 }}>
                    {daySess.length === 0 ? <div style={{ border: "1px dashed #e2e8f0", borderRadius: 8, height: 60 }} /> : daySess.map(s => {
                      const times = formatTimePair(s.scheduled_at, s.student_timezone || s.tutor_timezone);
                      return (
                      <div key={s.id} style={{ background: s.status === "completed" ? "#f0fdf4" : s.status === "cancelled" ? "#f1f5f9" : "#eff6ff", border: `1px solid ${s.status === "completed" ? "#bbf7d0" : s.status === "cancelled" ? "#e2e8f0" : "#bfdbfe"}`, borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.student_name}</div>
                        <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: 2 }}>Local: {times.local}</div>
                        <div style={{ fontSize: "0.62rem", color: "#1b5e42", marginTop: 1 }}>PKT: {times.pkt}</div>
                        <div style={{ fontSize: "0.62rem", color: "#64748b", marginTop: 1 }}>{s.duration}m · {getSessionSubject(s.course, s.notes)}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                          {s.meeting_link && <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" style={{ background: "#1b5e42", color: "#fff", fontSize: "0.6rem", padding: "2px 6px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>Join</a>}
                          {s.status === "scheduled" && <button onClick={() => updateStatus(s.id, "completed")} style={{ background: "#dcfce7", color: "#16a34a", fontSize: "0.6rem", padding: "2px 5px", borderRadius: 4, border: "none", cursor: "pointer", fontWeight: 700 }}>✓</button>}
                          {s.status === "completed" && <Link href={`/tutor/reports/new?session=${s.id}`} style={{ background: "#eff6ff", color: "#2563eb", fontSize: "0.6rem", padding: "2px 6px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>Report</Link>}
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Day view
          <div className="card">
            {sessions.length === 0 ? <div className="empty-state"><Calendar size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No classes today</h3><p>Enjoy your day off! ☀️</p></div>
              : (
                <div>
                  {sessions.map(s => {
                    const times = formatTimePair(s.scheduled_at, s.student_timezone || s.tutor_timezone);
                    return (
                    <div key={s.id} style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f0fdf4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1b5e42" }}>{new Date(s.scheduled_at).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })}</div>
                        <div style={{ fontSize: "0.62rem", color: "#64748b" }}>{s.duration}m</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", fontFamily: "var(--font-playfair), Georgia, serif" }}>{s.student_name}</div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", margin: "2px 0 8px", display: "flex", gap: 10 }}>
                          <span>{getSessionSubject(s.course, s.notes)}</span>
                          <span className={STATUS_BADGE[s.status] || "badge badge-gray"}>{s.status}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                          <span className="badge badge-blue">Local: {times.local}</span>
                          <span className="badge badge-green">PKT: {times.pkt}</span>
                        </div>
                        {s.notes && <div style={{ fontSize: "0.78rem", color: "#475569", background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>{s.notes}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        {s.meeting_link && <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm"><Video size={13} /> Join</a>}
                        {s.status === "scheduled" && <>
                          <button onClick={() => updateStatus(s.id, "completed")} className="btn btn-ghost btn-sm"><CheckCircle size={13} /> Done</button>
                          <button onClick={() => updateStatus(s.id, "no_show")} className="btn btn-ghost btn-sm"><XCircle size={13} /> No Show</button>
                        </>}
                        {s.status === "completed" && <Link href={`/tutor/reports/new?session=${s.id}`} className="btn btn-outline btn-sm"><Clock size={13} /> Report</Link>}
                      </div>
                    </div>
                  )})}
                </div>
              )}
          </div>
        )}
      </div>
    </>
  );
}

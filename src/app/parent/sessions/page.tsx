"use client";
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import ParentStudentSwitcher from "@/components/ParentStudentSwitcher";
import { formatStudentLevel, getSessionSubject } from "@/lib/portal";
import { Calendar, Video, Clock, CheckCircle, XCircle } from "lucide-react";

interface StudentInfo {
  id: string;
  full_name: string;
  level?: string | null;
  course?: string | null;
}

interface Session {
  id: string;
  scheduled_at: string;
  status: string;
  duration: number;
  tutor_name: string;
  meeting_link: string;
  notes?: string | null;
}
const STATUS_BADGE: Record<string, string> = { scheduled: "badge badge-blue", completed: "badge badge-green", cancelled: "badge badge-red", no_show: "badge badge-gray" };

export default function ParentSessionsPage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"upcoming" | "past">("upcoming");

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
    async function loadSessions() {
      if (!selectedStudentId) return;
      setLoading(true);
      const { data } = await supabase
        .from("class_sessions")
        .select("id, scheduled_at, status, duration_minutes, meeting_link, notes, tutor:profiles(full_name)")
        .eq("student_id", selectedStudentId)
        .order("scheduled_at", { ascending: false });
      setSessions((data || []).map((session: any) => ({
        id: session.id,
        scheduled_at: session.scheduled_at,
        status: session.status,
        duration: session.duration_minutes || 30,
        tutor_name: session.tutor?.full_name || "—",
        meeting_link: session.meeting_link || "",
        notes: session.notes || "",
      })));
      setLoading(false);
    }
    loadSessions();
  }, [selectedStudentId]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [selectedStudentId, students]
  );

  const now = new Date();
  const upcoming = sessions.filter(s => new Date(s.scheduled_at) >= now && s.status === "scheduled");
  const past     = sessions.filter(s => new Date(s.scheduled_at) < now || s.status !== "scheduled");
  const display  = tab === "upcoming" ? upcoming : past;

  return (
    <>
      <TopBar title="Classes & Schedule" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Classes & Schedule</h1>
        <p className="page-subtitle">{upcoming.length} upcoming · {past.length} past classes</p>
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
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Live class links appear automatically when a session is scheduled
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 0, border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", width: "fit-content", marginBottom: 20 }}>
          {(["upcoming", "past"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 22px", fontSize: "0.82rem", fontWeight: 600, border: "none", background: tab === t ? "#1b5e42" : "transparent", color: tab === t ? "#fff" : "#64748b", cursor: "pointer", textTransform: "capitalize", fontFamily: "var(--font-jakarta), sans-serif" }}>{t === "upcoming" ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}</button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
        ) : display.length === 0 ? (
          <div className="empty-state"><Calendar size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>{tab === "upcoming" ? "No upcoming classes" : "No past classes"}</h3><p>{tab === "upcoming" ? "Classes will appear here once scheduled by admin." : "Past classes will appear here."}</p></div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {display.map(s => {
              const dt = new Date(s.scheduled_at);
              const isToday = dt.toDateString() === new Date().toDateString();
              return (
                <div key={s.id} className="card" style={{ overflow: "visible" }}>
                  <div style={{ padding: "16px 22px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: isToday ? "linear-gradient(135deg, #1b5e42, #c9a84c)" : "#f8fafc", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: "1rem", fontWeight: 800, color: isToday ? "#fff" : "#1b5e42", fontFamily: "var(--font-playfair), Georgia, serif", lineHeight: 1 }}>{dt.getDate()}</div>
                      <div style={{ fontSize: "0.62rem", color: isToday ? "rgba(255,255,255,0.7)" : "#94a3b8", fontWeight: 600 }}>{dt.toLocaleString("en-GB", { month: "short" })}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                          {getSessionSubject(selectedStudent?.course, s.notes)}
                        </span>
                        {isToday && <span className="badge badge-emerald">Today!</span>}
                        <span className={STATUS_BADGE[s.status] || "badge badge-gray"}>{s.status}</span>
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: "0.78rem", color: "#64748b", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={13} />{dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={13} />{s.duration} minutes</span>
                        <span>Tutor: {s.tutor_name}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      {s.status === "completed" && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "#16a34a", fontWeight: 600 }}><CheckCircle size={15} /> Completed</span>}
                      {s.status === "cancelled" && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "#94a3b8" }}><XCircle size={15} /> Cancelled</span>}
                      {s.meeting_link && s.status === "scheduled" && <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm"><Video size={13} /> Join Class</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { formatStudentLevel } from "@/lib/portal";
import { GraduationCap, Star, Clock, FileText, ClipboardList } from "lucide-react";
import Link from "next/link";

interface Student { id: string; full_name: string; age: number; country: string; level: string; course?: string; is_active: boolean; total_sessions: number; last_session?: string; }

export default function TutorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("students").select("id, full_name, age, country, level, course, is_active").eq("tutor_id", user.id).order("full_name");
      if (!data) { setLoading(false); return; }

      // Get session counts
      const ids = data.map(s => s.id);
      const { data: sessData } = await supabase.from("class_sessions").select("student_id, scheduled_at").in("student_id", ids).eq("status", "completed").order("scheduled_at", { ascending: false });

      const mapped = data.map(s => {
        const stuSessions = (sessData || []).filter(ss => ss.student_id === s.id);
        return { ...s, total_sessions: stuSessions.length, last_session: stuSessions[0]?.scheduled_at };
      });
      setStudents(mapped);
      setLoading(false);
    }
    load();
  }, []);

  const LEVEL_COLOR: Record<string, string> = { Beginner: "badge-gray", Intermediate: "badge-blue", Advanced: "badge-yellow" };

  return (
    <>
      <TopBar title="My Students" subtitle="Students assigned to you" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">My Students</h1>
        <p className="page-subtitle">{students.length} students assigned</p>
      </div>
      <div className="page-body">
        {loading ? (
          <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
        ) : students.length === 0 ? (
          <div className="empty-state"><GraduationCap size={48} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No students assigned</h3><p>Contact admin to get students assigned to you.</p></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {students.map(s => (
              <div key={s.id} className="card" style={{ transition: "box-shadow 0.2s" }}>
                <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div className="avatar" style={{ width: 48, height: 48, fontSize: "1.1rem" }}>{s.full_name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", fontFamily: "var(--font-playfair), Georgia, serif" }}>{s.full_name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>{s.country || "—"} · Age {s.age || "—"}{s.course ? ` · ${s.course}` : ""}</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span className={`badge ${LEVEL_COLOR[formatStudentLevel(s.level)] || "badge-blue"}`}>{formatStudentLevel(s.level)}</span>
                    <span className={`badge ${s.is_active ? "badge-green" : "badge-gray"}`}>{s.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: "0.78rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b" }}>
                      <Star size={13} color="#c9a84c" /> {s.total_sessions} classes done
                    </div>
                    {s.last_session && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b" }}>
                        <Clock size={13} /> Last: {new Date(s.last_session).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/tutor/students/${s.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                      <ClipboardList size={13} /> Daily Work
                    </Link>
                    <Link href={`/tutor/reports/new?student=${s.id}`} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                      <FileText size={13} /> Report
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

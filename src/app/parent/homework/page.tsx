"use client";
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import ParentStudentSwitcher from "@/components/ParentStudentSwitcher";
import { formatStudentLevel } from "@/lib/portal";
import { BookOpen, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface StudentInfo {
  id: string;
  full_name: string;
  level?: string | null;
  course?: string | null;
}

interface Homework { id: string; homework_text: string; subject: string; due_date: string | null; is_completed: boolean; parent_notes: string; created_at: string; }

export default function ParentHomeworkPage() {
  const [students, setStudents]   = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [homework, setHomework]   = useState<Homework[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<"pending"|"done">("pending");
  const [marking, setMarking]     = useState<string|null>(null);

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
    async function loadHomework() {
      if (!selectedStudentId) return;
      setLoading(true);
      const { data } = await supabase.from("homework_logs")
        .select("id, homework_text, subject, due_date, is_completed, parent_notes, created_at")
        .eq("student_id", selectedStudentId)
        .order("created_at", { ascending: false });
      setHomework(data || []);
      setLoading(false);
    }
    loadHomework();
  }, [selectedStudentId]);

  async function markDone(id: string) {
    setMarking(id);
    await supabase.from("homework_logs").update({ is_completed: true, completed_at: new Date().toISOString() }).eq("id", id);
    setHomework(p => p.map(h => h.id === id ? { ...h, is_completed: true } : h));
    setMarking(null);
  }

  const pending   = homework.filter(h => !h.is_completed);
  const completed = homework.filter(h => h.is_completed);
  const display   = tab === "pending" ? pending : completed;
  const overdue   = pending.filter(h => h.due_date && new Date(h.due_date) < new Date()).length;
  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [selectedStudentId, students]
  );

  return (
    <>
      <TopBar title="Homework" />
      <div className="page-header" style={{ paddingTop:24 }}>
        <h1 className="page-title">Homework</h1>
        <p className="page-subtitle">{pending.length} pending · {overdue > 0 ? `${overdue} overdue ⚠️` : "all on track ✓"}</p>
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
                Track homework completion for each child separately
              </div>
            </div>
          </div>
        )}

        {overdue > 0 && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:12, padding:"14px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span style={{ fontWeight:700, color:"#b91c1c", fontSize:"0.85rem" }}>{overdue} overdue task{overdue>1?"s":""}</span>
            <span style={{ fontSize:"0.8rem", color:"#7f1d1d", marginLeft:2 }}>— please complete as soon as possible</span>
          </div>
        )}
        <div style={{ display:"flex", gap:0, border:"1px solid #e2e8f0", borderRadius:10, overflow:"hidden", width:"fit-content", marginBottom:20 }}>
          {(["pending","done"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:"9px 22px", fontSize:"0.82rem", fontWeight:600, border:"none", background: tab===t?"#1b5e42":"transparent", color: tab===t?"#fff":"#64748b", cursor:"pointer", fontFamily:"var(--font-jakarta),sans-serif" }}>
              {t==="pending"?`Pending (${pending.length})`:`Completed (${completed.length})`}
            </button>
          ))}
        </div>

        {loading
          ? <div className="empty-state"><div style={{ width:36, height:36, border:"3px solid #e2e8f0", borderTopColor:"#1b5e42", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
          : display.length === 0
            ? <div className="empty-state"><BookOpen size={40} style={{ opacity:.2, margin:"0 auto" }} /><h3>{tab==="pending"?"All done! 🎉":"No completed homework yet"}</h3></div>
            : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {display.map(h => {
                  const isOverdue = !h.is_completed && h.due_date && new Date(h.due_date) < new Date();
                  return (
                    <div key={h.id} className="card" style={{ border: isOverdue?"1px solid #fecaca":"1px solid #e2e8f0" }}>
                      <div style={{ padding:"16px 20px", display:"flex", alignItems:"flex-start", gap:14 }}>
                        <div style={{ width:40, height:40, borderRadius:11, background: isOverdue?"#fee2e2":h.is_completed?"#dcfce7":"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <BookOpen size={18} color={isOverdue?"#dc2626":h.is_completed?"#16a34a":"#1b5e42"} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:4 }}>
                            <span style={{ fontWeight:700, fontSize:"0.9rem", color:"#0f172a", fontFamily:"var(--font-playfair),Georgia,serif", textDecoration:h.is_completed?"line-through":"none", opacity:h.is_completed?.7:1 }}>{h.homework_text || "Homework task"}</span>
                            {isOverdue && <span className="badge badge-red">Overdue</span>}
                            {h.is_completed && <span className="badge badge-green">Completed</span>}
                          </div>
                          {h.subject && <div style={{ fontSize:"0.78rem", color:"#64748b", display:"flex", alignItems:"center", gap:4 }}><BookOpen size={12} />{h.subject}</div>}
                          {h.due_date && <div style={{ fontSize:"0.74rem", color: isOverdue?"#dc2626":"#94a3b8", display:"flex", alignItems:"center", gap:4, marginTop:4, fontWeight:isOverdue?700:400 }}><Clock size={12} />Due: {new Date(h.due_date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>}
                          {h.parent_notes && <div style={{ fontSize:"0.78rem", color:"#64748b", marginTop:6, fontStyle:"italic" }}>Note: {h.parent_notes}</div>}
                        </div>
                        {!h.is_completed && (
                          <button onClick={() => markDone(h.id)} className="btn btn-primary btn-sm" disabled={marking===h.id} style={{ flexShrink:0 }}>
                            {marking===h.id?"...": <><CheckCircle size={13} /> Mark Done</>}
                          </button>
                        )}
                        {h.is_completed && <CheckCircle size={20} color="#16a34a" style={{ flexShrink:0 }} />}
                      </div>
                    </div>
                  );
                })}
              </div>}
      </div>
    </>
  );
}

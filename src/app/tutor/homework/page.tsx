"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { BookOpen, Plus, X, Trash2 } from "lucide-react";

import { unwrapOne } from "@/lib/currency";

interface Template { id: string; title: string; content: string; subject: string; level: string; created_at: string; }
interface AssignedHomework {
  id: string;
  title?: string | null;
  homework_text: string;
  subject?: string | null;
  due_date?: string | null;
  is_completed: boolean;
  status?: string | null;
  assignment_type?: string | null;
  is_published?: boolean | null;
  archived_at?: string | null;
  marks?: number | null;
  max_marks?: number | null;
  teacher_feedback?: string | null;
  private_notes?: string | null;
  external_url?: string | null;
  student_name: string;
  student_id: string;
  created_at: string;
}
const SUBJECTS = ["Quran Recitation", "Tajweed", "Memorization", "Noorani Qaida", "Duas", "Islamic Studies", "Arabic"];
const LEVELS   = ["All Levels", "Beginner", "Intermediate", "Advanced", "Hifz"];
const ASSIGNMENT_TYPES = [
  { value: "homework", label: "Homework" },
  { value: "assignment", label: "Assignment" },
  { value: "reading", label: "Reading Practice" },
  { value: "pdf", label: "PDF" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "link", label: "External Link" },
];
const SUBJECT_BADGE: Record<string, string> = { "Quran Recitation":"badge-green","Tajweed":"badge-blue","Memorization":"badge-purple","Noorani Qaida":"badge-emerald","Duas":"badge-yellow","Islamic Studies":"badge-orange","Arabic":"badge-blue" };

export default function HomeworkPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assigned, setAssigned] = useState<AssignedHomework[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ title: "", content: "", subject: "Quran Recitation", level: "All Levels" });
  const [assignForm, setAssignForm] = useState({
    student_id: "",
    due_date: "",
    extra_note: "",
    assignment_type: "homework",
    max_marks: "",
    private_notes: "",
    external_url: "",
    publish: true,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", homework_text: "", due_date: "", teacher_feedback: "", marks: "", max_marks: "", status: "pending" });

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const [{ data: templateData }, { data: studentData }, { data: logData, error: logError }] = await Promise.all([
      supabase.from("homework_templates").select("*").eq("tutor_id", user?.id).order("created_at", { ascending: false }),
      supabase.from("students").select("id, full_name").eq("tutor_id", user?.id).eq("is_active", true).order("full_name"),
      supabase.from("homework_logs").select("id, student_id, title, homework_text, subject, due_date, is_completed, status, assignment_type, is_published, archived_at, marks, max_marks, teacher_feedback, private_notes, external_url, created_at, student:students(full_name)").eq("tutor_id", user?.id).order("created_at", { ascending: false }).limit(60),
    ]);
    setTemplates(templateData || []);
    setStudents(studentData || []);
    if (logError) setMsg(logError.message);
    setAssigned((logData || []).map((row: any) => ({
      ...row,
      student_name: unwrapOne<{ full_name?: string }>(row.student)?.full_name || "—",
    })));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveTemplate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("homework_templates").insert({ ...form, tutor_id: user?.id });
    setSaving(false);
    if (error) {
      setMsg("Could not save template: " + error.message);
      return;
    }
    setForm({ title: "", content: "", subject: "Quran Recitation", level: "All Levels" });
    setShowForm(false);
    setMsg("Template saved.");
    setTimeout(() => setMsg(""), 2500);
    await load();
  }

  async function deleteTemplate(id: string) {
    const { error } = await supabase.from("homework_templates").delete().eq("id", id);
    if (error) {
      setMsg("Could not delete template: " + error.message);
      return;
    }
    setTemplates(p => p.filter(t => t.id !== id));
  }

  async function deleteAssigned(id: string) {
    if (!window.confirm("Remove this homework assignment?")) return;
    const { error } = await supabase.from("homework_logs").delete().eq("id", id);
    if (error) {
      setMsg("Could not delete assignment: " + error.message);
      return;
    }
    setAssigned((rows) => rows.filter((row) => row.id !== id));
  }

  async function assignTemplate(template: Template) {
    if (!assignForm.student_id) return;
    setAssigning(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("homework_logs").insert({
      student_id: assignForm.student_id,
      tutor_id: user?.id,
      homework_text: `${template.content || template.title}${assignForm.extra_note ? `\n\nExtra note: ${assignForm.extra_note}` : ""}`,
      title: template.title,
      subject: template.subject,
      due_date: assignForm.due_date || null,
      status: "pending",
      is_completed: false,
      assignment_type: assignForm.assignment_type,
      max_marks: assignForm.max_marks ? Number(assignForm.max_marks) : null,
      private_notes: assignForm.private_notes || null,
      external_url: assignForm.external_url || null,
      is_published: assignForm.publish,
      published_at: assignForm.publish ? new Date().toISOString() : null,
    });
    setAssigning(false);
    if (error) {
      setMsg("Could not assign homework: " + error.message);
      return;
    }
    setAssignForm({ student_id: "", due_date: "", extra_note: "", assignment_type: "homework", max_marks: "", private_notes: "", external_url: "", publish: true });
    setShowAssign(null);
    setMsg("Assignment published — parent can see it now.");
    setTimeout(() => setMsg(""), 3000);
    await load();
  }

  async function duplicateAssigned(row: AssignedHomework) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("homework_logs").insert({
      student_id: row.student_id,
      tutor_id: user?.id,
      title: `${row.title || "Assignment"} (copy)`,
      homework_text: row.homework_text,
      subject: row.subject,
      due_date: row.due_date,
      status: "pending",
      is_completed: false,
      assignment_type: row.assignment_type || "homework",
      max_marks: row.max_marks,
      private_notes: row.private_notes,
      external_url: row.external_url,
      is_published: false,
    });
    if (error) {
      setMsg("Could not duplicate: " + error.message);
      return;
    }
    setMsg("Assignment duplicated as draft.");
    await load();
  }

  async function archiveAssigned(id: string) {
    const { error } = await supabase.from("homework_logs").update({
      status: "archived",
      archived_at: new Date().toISOString(),
      is_published: false,
    }).eq("id", id);
    if (error) {
      setMsg("Could not archive: " + error.message);
      return;
    }
    await load();
  }

  async function publishAssigned(id: string) {
    const { error } = await supabase.from("homework_logs").update({
      is_published: true,
      published_at: new Date().toISOString(),
      status: "pending",
      archived_at: null,
    }).eq("id", id);
    if (error) {
      setMsg("Could not publish: " + error.message);
      return;
    }
    await load();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    const { error } = await supabase.from("homework_logs").update({
      title: editForm.title,
      homework_text: editForm.homework_text,
      due_date: editForm.due_date || null,
      teacher_feedback: editForm.teacher_feedback || null,
      marks: editForm.marks ? Number(editForm.marks) : null,
      max_marks: editForm.max_marks ? Number(editForm.max_marks) : null,
      status: editForm.status,
      is_completed: editForm.status === "completed",
    }).eq("id", editId);
    if (error) {
      setMsg("Could not update: " + error.message);
      return;
    }
    setEditId(null);
    setMsg("Assignment updated.");
    await load();
  }

  return (
    <>
      <TopBar title="Assignments" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div><h1 className="page-title">Assignments</h1><p className="page-subtitle">Create, publish, archive, and grade student work</p></div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> New Template</button>
        </div>
      </div>
      <div className="page-body">
        {msg && (
          <div className="card" style={{ marginBottom: 14, padding: "12px 16px", fontSize: "0.85rem", fontWeight: 600, color: msg.includes("Could not") ? "#b91c1c" : "#166534", background: msg.includes("Could not") ? "#fef2f2" : "#f0fdf4" }}>
            {msg}
          </div>
        )}

        {!loading && assigned.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header" style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ margin: 0, fontSize: "0.95rem" }}>Assigned homework ({assigned.length})</h2>
            </div>
            <div className="list-stack">
              {assigned.map((row) => (
                <article key={row.id} className="list-row" style={{ gridTemplateColumns: "1fr", gap: 10 }}>
                  <div>
                    <div className="list-title">{row.title || row.homework_text?.slice(0, 64) || "Assignment"}</div>
                    <div className="list-meta">
                      {row.student_name}
                      {" · "}
                      <span style={{ textTransform: "capitalize" }}>{row.assignment_type || "homework"}</span>
                      {row.due_date ? ` · Due ${new Date(row.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}
                      {row.marks != null ? ` · Marks ${row.marks}${row.max_marks != null ? `/${row.max_marks}` : ""}` : ""}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <span className={`badge ${row.archived_at ? "badge-gray" : row.is_completed ? "badge-green" : row.is_published === false ? "badge-yellow" : "badge-blue"}`}>
                        {row.archived_at ? "Archived" : row.is_completed ? "Done" : row.is_published === false ? "Draft" : (row.status || "Pending")}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <button type="button" className="btn btn-outline btn-xs" onClick={() => {
                      setEditId(row.id);
                      setEditForm({
                        title: row.title || "",
                        homework_text: row.homework_text || "",
                        due_date: row.due_date || "",
                        teacher_feedback: row.teacher_feedback || "",
                        marks: row.marks != null ? String(row.marks) : "",
                        max_marks: row.max_marks != null ? String(row.max_marks) : "",
                        status: row.status || (row.is_completed ? "completed" : "pending"),
                      });
                    }}>Edit</button>
                    <button type="button" className="btn btn-outline btn-xs" onClick={() => void duplicateAssigned(row)}>Duplicate</button>
                    {row.is_published === false || row.archived_at
                      ? <button type="button" className="btn btn-outline btn-xs" onClick={() => void publishAssigned(row.id)}>Publish</button>
                      : <button type="button" className="btn btn-outline btn-xs" onClick={() => void archiveAssigned(row.id)}>Archive</button>}
                    <button type="button" className="btn btn-outline btn-xs" onClick={() => void deleteAssigned(row.id)} aria-label="Delete assignment"><Trash2 size={13} /></button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {loading
          ? <div className="empty-state"><div style={{ width:36, height:36, border:"3px solid #e2e8f0", borderTopColor:"#1b5e42", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
          : templates.length === 0
            ? <div className="empty-state"><BookOpen size={48} style={{ opacity:.15, margin:"0 auto" }} /><h3>No templates yet</h3><p>Create reusable homework templates to assign quickly to any student.</p><button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop:16 }}><Plus size={14} /> Create First Template</button></div>
            : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
                {templates.map(t => (
                  <div key={t.id} className="card" style={{ position:"relative" }}>
                    <button onClick={() => deleteTemplate(t.id)} style={{ position:"absolute", top:14, right:14, background:"none", border:"none", cursor:"pointer", color:"#cbd5e1", padding:4, borderRadius:6 }} onMouseOver={e=>(e.currentTarget.style.color="#dc2626")} onMouseOut={e=>(e.currentTarget.style.color="#cbd5e1")}><Trash2 size={15} /></button>
                    <div style={{ padding:"18px 20px 14px" }}>
                      <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                        <span className={`badge ${SUBJECT_BADGE[t.subject]||"badge-blue"}`}>{t.subject}</span>
                        <span className="badge badge-gray">{t.level}</span>
                      </div>
                      <h3 style={{ fontFamily:"var(--font-playfair),Georgia,serif", fontSize:"0.95rem", fontWeight:700, color:"#0f172a", margin:"0 0 8px" }}>{t.title}</h3>
                      <p style={{ fontSize:"0.8rem", color:"#64748b", lineHeight:1.6, margin:0 }}>{t.content || "No description added."}</p>
                    </div>
                    <div style={{ padding:"12px 20px", borderTop:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"0.7rem", color:"#94a3b8" }}>{new Date(t.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>
                      <button className="btn btn-outline btn-xs" onClick={() => setShowAssign(t.id)}>Assign to Student</button>
                    </div>
                  </div>
                ))}
              </div>}

        {showForm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:440, overflow:"hidden" }}>
              <div style={{ background:"linear-gradient(135deg,#0f172a,#1b5e42)", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <h2 style={{ color:"#fff", fontFamily:"var(--font-playfair),Georgia,serif", fontSize:"1rem", fontWeight:700, margin:0 }}>New Homework Template</h2>
                <button onClick={() => setShowForm(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer" }}><X size={20} /></button>
              </div>
              <form onSubmit={saveTemplate} style={{ padding:24 }}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Revise Surah Al-Fatiha 3 times" required />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="form-input form-select" value={form.subject} onChange={e => setForm(p=>({...p,subject:e.target.value}))}>
                      {SUBJECTS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Level</label>
                    <select className="form-input form-select" value={form.level} onChange={e => setForm(p=>({...p,level:e.target.value}))}>
                      {LEVELS.map(l=><option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom:24 }}>
                  <label className="form-label">Instructions</label>
                  <textarea className="form-input" value={form.content} onChange={e => setForm(p=>({...p,content:e.target.value}))} placeholder="Describe what the student needs to practice..." rows={4} style={{ resize:"vertical" }} />
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex:1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex:1, justifyContent:"center" }}>{saving?"Saving...":"Save Template"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAssign && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:460, overflow:"hidden" }}>
              <div style={{ background:"linear-gradient(135deg,#0f172a,#1b5e42)", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <h2 style={{ color:"#fff", fontFamily:"var(--font-playfair),Georgia,serif", fontSize:"1rem", fontWeight:700, margin:0 }}>Assign Homework</h2>
                <button onClick={() => setShowAssign(null)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer" }}><X size={20} /></button>
              </div>
              <div style={{ padding:24 }}>
                <div className="form-group">
                  <label className="form-label">Student *</label>
                  <select className="form-input form-select" value={assignForm.student_id} onChange={e => setAssignForm(p => ({ ...p, student_id: e.target.value }))}>
                    <option value="">Select student</option>
                    {students.map(student => <option key={student.id} value={student.id}>{student.full_name}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input" value={assignForm.due_date} onChange={e => setAssignForm(p => ({ ...p, due_date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input form-select" value={assignForm.assignment_type} onChange={e => setAssignForm(p => ({ ...p, assignment_type: e.target.value }))}>
                      {ASSIGNMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Max marks</label>
                    <input className="form-input" type="number" value={assignForm.max_marks} onChange={e => setAssignForm(p => ({ ...p, max_marks: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">External URL</label>
                    <input className="form-input" value={assignForm.external_url} onChange={e => setAssignForm(p => ({ ...p, external_url: e.target.value }))} placeholder="PDF / audio / video link" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Private notes (tutor only)</label>
                  <textarea className="form-input" value={assignForm.private_notes} onChange={e => setAssignForm(p => ({ ...p, private_notes: e.target.value }))} rows={2} />
                </div>
                <div className="form-group">
                  <label className="form-label">Extra Note for parent</label>
                  <textarea className="form-input" value={assignForm.extra_note} onChange={e => setAssignForm(p => ({ ...p, extra_note: e.target.value }))} rows={2} />
                </div>
                <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, fontSize: "0.82rem" }}>
                  <input type="checkbox" checked={assignForm.publish} onChange={e => setAssignForm(p => ({ ...p, publish: e.target.checked }))} />
                  Publish immediately
                </label>
                <div style={{ display:"flex", gap:10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAssign(null)} style={{ flex:1 }}>Cancel</button>
                  <button type="button" className="btn btn-primary" disabled={assigning || !assignForm.student_id} onClick={() => {
                    const template = templates.find(item => item.id === showAssign);
                    if (template) assignTemplate(template);
                  }} style={{ flex:1, justifyContent:"center" }}>
                    {assigning ? "Assigning..." : "Assign Homework"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editId && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <form onSubmit={saveEdit} style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:480, padding:20 }}>
              <h2 style={{ margin:"0 0 14px", fontSize:"1rem" }}>Edit assignment</h2>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <textarea className="form-input" rows={3} value={editForm.homework_text} onChange={(e) => setEditForm((p) => ({ ...p, homework_text: e.target.value }))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                <div className="form-group">
                  <label className="form-label">Due</label>
                  <input type="date" className="form-input" value={editForm.due_date} onChange={(e) => setEditForm((p) => ({ ...p, due_date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Marks</label>
                  <input className="form-input" value={editForm.marks} onChange={(e) => setEditForm((p) => ({ ...p, marks: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max</label>
                  <input className="form-input" value={editForm.max_marks} onChange={(e) => setEditForm((p) => ({ ...p, max_marks: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input form-select" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Teacher feedback</label>
                <textarea className="form-input" rows={2} value={editForm.teacher_feedback} onChange={(e) => setEditForm((p) => ({ ...p, teacher_feedback: e.target.value }))} />
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={() => setEditId(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Save</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

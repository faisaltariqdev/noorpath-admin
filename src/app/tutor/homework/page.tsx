"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { BookOpen, Plus, X, Trash2 } from "lucide-react";

interface Template { id: string; title: string; content: string; subject: string; level: string; created_at: string; }
const SUBJECTS = ["Quran Recitation", "Tajweed", "Memorization", "Noorani Qaida", "Duas", "Islamic Studies", "Arabic"];
const LEVELS   = ["All Levels", "Beginner", "Intermediate", "Advanced", "Hifz"];
const SUBJECT_BADGE: Record<string, string> = { "Quran Recitation":"badge-green","Tajweed":"badge-blue","Memorization":"badge-purple","Noorani Qaida":"badge-emerald","Duas":"badge-yellow","Islamic Studies":"badge-orange","Arabic":"badge-blue" };

export default function HomeworkPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", subject: "Quran Recitation", level: "All Levels" });
  const [assignForm, setAssignForm] = useState({ student_id: "", due_date: "", extra_note: "" });

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const [{ data: templateData }, { data: studentData }] = await Promise.all([
      supabase.from("homework_templates").select("*").eq("tutor_id", user?.id).order("created_at", { ascending: false }),
      supabase.from("students").select("id, full_name").eq("tutor_id", user?.id).eq("is_active", true).order("full_name"),
    ]);
    setTemplates(templateData || []);
    setStudents(studentData || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveTemplate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("homework_templates").insert({ ...form, tutor_id: user?.id });
    setForm({ title: "", content: "", subject: "Quran Recitation", level: "All Levels" });
    setShowForm(false);
    setSaving(false);
    await load();
  }

  async function deleteTemplate(id: string) {
    await supabase.from("homework_templates").delete().eq("id", id);
    setTemplates(p => p.filter(t => t.id !== id));
  }

  async function assignTemplate(template: Template) {
    if (!assignForm.student_id) return;
    setAssigning(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("homework_logs").insert({
      student_id: assignForm.student_id,
      tutor_id: user?.id,
      homework_text: `${template.content || template.title}${assignForm.extra_note ? `\n\nExtra note: ${assignForm.extra_note}` : ""}`,
      title: template.title,
      subject: template.subject,
      due_date: assignForm.due_date || null,
      status: "pending",
      is_completed: false,
    });
    setAssignForm({ student_id: "", due_date: "", extra_note: "" });
    setShowAssign(null);
    setAssigning(false);
  }

  return (
    <>
      <TopBar title="Homework Templates" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div><h1 className="page-title">Homework Templates</h1><p className="page-subtitle">Reusable assignments for your students</p></div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> New Template</button>
        </div>
      </div>
      <div className="page-body">
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
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={assignForm.due_date} onChange={e => setAssignForm(p => ({ ...p, due_date: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Extra Note</label>
                  <textarea className="form-input" value={assignForm.extra_note} onChange={e => setAssignForm(p => ({ ...p, extra_note: e.target.value }))} rows={3} placeholder="Optional note for this specific student..." />
                </div>
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
      </div>
    </>
  );
}

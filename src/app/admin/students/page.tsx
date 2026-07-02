"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { formatStudentLevel } from "@/lib/portal";
import { GraduationCap, Plus, Search, X, CheckCircle, XCircle } from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  age: number;
  level: string;
  course?: string;
  is_active: boolean;
  created_at: string;
  tutor_name?: string;
  parent_name?: string;
  country?: string;
}

const LEVELS = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<{ id: string; full_name: string }[]>([]);
  const [parents, setParents] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    country: "",
    level: "beginner",
    course: "",
    tutor_id: "",
    parent_id: "",
    timezone: "",
    source: "organic",
  });

  async function load() {
    setLoading(true);
    const [{ data: studs }, { data: tutorProfiles }, { data: parentProfiles }] = await Promise.all([
      supabase.from("students").select("id, full_name, age, level, course, is_active, created_at, country, tutor:profiles!students_tutor_id_fkey(full_name), parent:profiles!students_parent_id_fkey(full_name)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name").eq("role", "tutor"),
      supabase.from("profiles").select("id, full_name").eq("role", "parent"),
    ]);
    const mapped = (studs || []).map((s: any) => ({
      ...s,
      tutor_name: s.tutor?.full_name || "Unassigned",
      parent_name: s.parent?.full_name || "Unlinked",
    }));
    setStudents(mapped);
    setFiltered(mapped);
    setTutors(tutorProfiles || []);
    setParents(parentProfiles || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = students;
    if (filterActive === "active") list = list.filter(s => s.is_active);
    if (filterActive === "inactive") list = list.filter(s => !s.is_active);
    if (filterCountry !== "all") list = list.filter(s => (s.country || "Unknown") === filterCountry);
    if (filterLevel !== "all") list = list.filter(s => s.level === filterLevel);
    const q = search.toLowerCase();
    if (q) list = list.filter(s =>
      s.full_name?.toLowerCase().includes(q)
      || s.country?.toLowerCase().includes(q)
      || s.course?.toLowerCase().includes(q)
      || s.parent_name?.toLowerCase().includes(q)
      || s.tutor_name?.toLowerCase().includes(q)
    );
    setFiltered(list);
  }, [search, filterActive, filterCountry, filterLevel, students]);

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("students").insert({
      full_name: form.full_name, age: parseInt(form.age) || null,
      country: form.country,
      level: form.level,
      course: form.course || null,
      tutor_id: form.tutor_id || null,
      parent_id: form.parent_id || null,
      timezone: form.timezone || "UTC",
      source: form.source,
      trial_status: "converted",
      is_active: true,
    });
    if (error) setMsg("Error: " + error.message);
    else {
      setMsg("Student added successfully!");
      setShowForm(false);
      setForm({ full_name: "", age: "", country: "", level: "beginner", course: "", tutor_id: "", parent_id: "", timezone: "", source: "organic" });
      await load();
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("students").update({ is_active: !current }).eq("id", id);
    setStudents(p => p.map(s => s.id === id ? { ...s, is_active: !current } : s));
  }

  const activeCount = students.filter(s => s.is_active).length;
  const countries = Array.from(new Set(students.map(s => s.country || "Unknown"))).sort();

  return (
    <>
      <TopBar title="Students" subtitle="All enrolled students" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Students</h1>
            <p className="page-subtitle">{activeCount} active of {students.length} total</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> Add Student</button>
        </div>
      </div>
      <div className="page-body">
        {msg && <div style={{ background: msg.startsWith("Error") ? "#fef2f2" : "#f0fdf4", border: `1px solid ${msg.startsWith("Error") ? "#fecaca" : "#bbf7d0"}`, color: msg.startsWith("Error") ? "#b91c1c" : "#15803d", borderRadius: 10, padding: "11px 16px", marginBottom: 16, fontSize: "0.83rem" }}>{msg}</div>}

        {/* Filters */}
        <div className="filter-toolbar">
          <div className="search-field">
            <Search size={16} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student, country, parent, tutor..." />
          </div>
          <select className="filter-select" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
            <option value="all">All countries</option>
            {countries.map(country => <option key={country} value={country}>{country}</option>)}
          </select>
          <select className="filter-select" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
            <option value="all">All levels</option>
            {LEVELS.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
          </select>
          <select className="filter-select" value={filterActive} onChange={e => setFilterActive(e.target.value as "all" | "active" | "inactive")}>
            <option value="all">All status</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>

        <div className="card">
          {loading ? (
            <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><GraduationCap size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No students found</h3><p>Add your first student to get started.</p></div>
          ) : (
            <div className="table-shell">
            <table className="data-table">
                  <thead><tr><th>Student</th><th>Age</th><th>Country</th><th>Level</th><th>Course</th><th>Parent</th><th>Tutor</th><th>Status</th><th>Enrolled</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><div className="avatar">{s.full_name.charAt(0)}</div><span style={{ fontWeight: 600 }}>{s.full_name}</span></div></td>
                    <td style={{ color: "#64748b" }}>{s.age || "—"}</td>
                    <td style={{ color: "#64748b" }}>{s.country || "—"}</td>
                        <td><span className="badge badge-blue">{formatStudentLevel(s.level)}</span></td>
                        <td style={{ color: "#64748b" }}>{s.course || "—"}</td>
                        <td style={{ color: "#64748b" }}>{s.parent_name}</td>
                    <td style={{ color: "#64748b" }}>{s.tutor_name}</td>
                    <td>
                      <button onClick={() => toggleActive(s.id, s.is_active)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                        {s.is_active ? <><CheckCircle size={15} color="#16a34a" /><span className="badge badge-green">Active</span></> : <><XCircle size={15} color="#94a3b8" /><span className="badge badge-gray">Inactive</span></>}
                      </button>
                    </td>
                    <td style={{ color: "#94a3b8" }}>{new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, overflow: "hidden", margin: "auto" }}>
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1b5e42)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Add New Student</h2>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <form onSubmit={addStudent} style={{ padding: 24 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Student's full name" required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input type="number" className="form-input" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} placeholder="e.g. 8" min={3} max={60} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="UK, USA, Pakistan..." />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Learning Level</label>
                  <select className="form-input form-select" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                    {LEVELS.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <input className="form-input" value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} placeholder="Quran Recitation, Tajweed, Hifz..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Link Parent</label>
                  <select className="form-input form-select" value={form.parent_id} onChange={e => setForm(p => ({ ...p, parent_id: e.target.value }))}>
                    <option value="">Select parent (optional)</option>
                    {parents.map(parent => <option key={parent.id} value={parent.id}>{parent.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Tutor</label>
                  <select className="form-input form-select" value={form.tutor_id} onChange={e => setForm(p => ({ ...p, tutor_id: e.target.value }))}>
                    <option value="">Select tutor (optional)</option>
                    {tutors.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lead Source</label>
                  <select className="form-input form-select" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                    {["google", "facebook", "referral", "organic", "whatsapp", "other"].map(source => <option key={source}>{source}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Timezone</label>
                  <input className="form-input" value={form.timezone} onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))} placeholder="e.g. Europe/London, America/New_York" />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                    {saving ? "Saving..." : "Add Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

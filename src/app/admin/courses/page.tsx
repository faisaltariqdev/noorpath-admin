"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { BookOpen, CheckCircle, Clock, DollarSign, Layers, Pencil, Plus, Search, ToggleLeft, ToggleRight, X } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  level: string;
  duration_weeks?: number | null;
  price_amount?: number | null;
  currency: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const LEVELS = ["beginner", "intermediate", "advanced"];
const CATEGORIES = ["foundation", "quran", "tajweed", "hifz", "tafseer", "arabic", "other"];
const CURRENCIES = ["GBP", "USD", "EUR", "PKR", "AED", "CAD", "AUD"];

const emptyCourseForm = {
  title: "",
  description: "",
  category: "quran",
  level: "beginner",
  duration_weeks: "",
  price_amount: "",
  currency: "GBP",
};

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [form, setForm] = useState(emptyCourseForm);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("id,title,description,category,level,duration_weeks,price_amount,currency,is_active,sort_order,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) setMessage("Error: " + error.message);
    setCourses(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = courses.filter(course => {
      const matchesSearch = !q
        || course.title.toLowerCase().includes(q)
        || course.description?.toLowerCase().includes(q)
        || course.category.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
      const matchesLevel = levelFilter === "all" || course.level === levelFilter;
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "active" && course.is_active)
        || (statusFilter === "inactive" && !course.is_active);
      return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
    });
    return list.sort((a, b) => {
      const diff = +new Date(a.created_at) - +new Date(b.created_at);
      return sortOrder === "asc" ? diff : -diff;
    });
  }, [courses, search, categoryFilter, levelFilter, statusFilter, sortOrder]);

  const activeCount = courses.filter(c => c.is_active).length;
  const avgPrice = courses.length
    ? courses.reduce((sum, course) => sum + Number(course.price_amount || 0), 0) / courses.length
    : 0;

  async function addCourse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      level: form.level,
      duration_weeks: form.duration_weeks ? Number(form.duration_weeks) : null,
      price_amount: form.price_amount ? Number(form.price_amount) : null,
      currency: form.currency,
      updated_at: new Date().toISOString(),
    };

    const { error } = editingId
      ? await supabase.from("courses").update(payload).eq("id", editingId)
      : await supabase.from("courses").insert({
          ...payload,
          is_active: true,
          sort_order: courses.length + 1,
        });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage(editingId ? "Course updated successfully." : "Course added successfully.");
      closeForm();
      await load();
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 3500);
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyCourseForm);
    setShowForm(true);
  }

  function openEditForm(course: Course) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description || "",
      category: course.category,
      level: course.level,
      duration_weeks: course.duration_weeks != null ? String(course.duration_weeks) : "",
      price_amount: course.price_amount != null ? String(course.price_amount) : "",
      currency: course.currency || "GBP",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyCourseForm);
  }

  async function toggleCourse(id: string, isActive: boolean) {
    const { error } = await supabase.from("courses").update({ is_active: !isActive, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      setMessage("Error: " + error.message);
      return;
    }
    setCourses(prev => prev.map(course => course.id === id ? { ...course, is_active: !isActive } : course));
  }

  return (
    <>
      <TopBar title="Course Management" subtitle="Create and manage NoorPath course catalog" />

      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Course Management</h1>
            <p className="page-subtitle">Build a clean course catalog for students, parents and tutors.</p>
          </div>
          <button className="btn btn-primary" onClick={openCreateForm}>
            <Plus size={15} /> Add Course
          </button>
        </div>
      </div>

      <div className="page-body">
        {message && (
          <div style={{ background: message.startsWith("Error") ? "#fef2f2" : "#f0fdf4", border: `1px solid ${message.startsWith("Error") ? "#fecaca" : "#bbf7d0"}`, color: message.startsWith("Error") ? "#b91c1c" : "#15803d", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: "0.83rem" }}>
            {message}
          </div>
        )}

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: "Total Courses", value: courses.length, icon: BookOpen, color: "#1b5e42", bg: "#f0fdf4" },
            { label: "Active Courses", value: activeCount, icon: CheckCircle, color: "#15803d", bg: "#dcfce7" },
            { label: "Categories", value: new Set(courses.map(c => c.category)).size, icon: Layers, color: "#7c3aed", bg: "#f5f3ff" },
            { label: "Avg Price", value: `${courses[0]?.currency || "GBP"} ${avgPrice.toFixed(0)}`, icon: DollarSign, color: "#b45309", bg: "#fffbeb" },
          ].map(card => (
            <div key={card.label} className="stat-card">
              <div className="stat-icon" style={{ background: card.bg, marginBottom: 12 }}><card.icon size={20} color={card.color} /></div>
              <div className="stat-value" style={{ fontSize: "1.45rem" }}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="filter-toolbar">
          <div className="search-field">
            <Search size={16} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search course, category, description..." />
          </div>
          <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All categories</option>
            {CATEGORIES.map(category => <option key={category} value={category}>{titleCase(category)}</option>)}
          </select>
          <select className="filter-select" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
            <option value="all">All levels</option>
            {LEVELS.map(level => <option key={level} value={level}>{titleCase(level)}</option>)}
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="filter-select" value={sortOrder} onChange={e => setSortOrder(e.target.value as "asc" | "desc")}>
            <option value="desc">Newest first (descending)</option>
            <option value="asc">Oldest first (ascending)</option>
          </select>
        </div>

        <div className="card">
          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={42} style={{ opacity: 0.2, margin: "0 auto" }} />
              <h3>No courses found</h3>
              <p>Add a course or adjust your filters.</p>
            </div>
          ) : (
            <div className="course-catalog-list">
              {filtered.map(course => (
                <div key={course.id} className="course-catalog-row">
                  <div className="course-main">
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: "0.75rem" }}>{course.title.charAt(0)}</div>
                    <div>
                      <div className="course-title">{course.title}</div>
                      <div className="course-description">{course.description || "No description added"}</div>
                    </div>
                  </div>

                  <div className="course-meta">
                    <span className="badge badge-purple">{titleCase(course.category)}</span>
                    <span className="badge badge-blue">{titleCase(course.level)}</span>
                  </div>

                  <div className="course-facts">
                    <span><Clock size={12} /> {course.duration_weeks ? `${course.duration_weeks} weeks` : "No duration"}</span>
                    <strong>{course.price_amount ? `${course.currency} ${course.price_amount}` : "No price"}</strong>
                  </div>

                  <div className="course-actions">
                    <span className={`badge ${course.is_active ? "badge-green" : "badge-gray"}`}>{course.is_active ? "Active" : "Inactive"}</span>
                    <button type="button" className="btn btn-xs btn-ghost" onClick={() => openEditForm(course)}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button type="button" className="btn btn-xs btn-ghost" onClick={() => toggleCourse(course.id, course.is_active)}>
                      {course.is_active ? <><ToggleRight size={13} /> Disable</> : <><ToggleLeft size={13} /> Enable</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.58)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1b5e42)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <h2 style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                  {editingId ? "Edit Course" : "Add New Course"}
                </h2>
                <button onClick={closeForm} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.65)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <form onSubmit={addCourse} style={{ padding: 24, overflowY: "auto", flex: 1 }}>
                <div className="form-group">
                  <label className="form-label">Course Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Quran Recitation" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short course summary for admins, tutors and parents..." />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map(category => <option key={category} value={category}>{titleCase(category)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Level</label>
                    <select className="form-input form-select" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                      {LEVELS.map(level => <option key={level} value={level}>{titleCase(level)}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input type="number" min={1} className="form-input" value={form.duration_weeks} onChange={e => setForm(p => ({ ...p, duration_weeks: e.target.value }))} placeholder="Weeks" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <input type="number" min={0} className="form-input" value={form.price_amount} onChange={e => setForm(p => ({ ...p, price_amount: e.target.value }))} placeholder="50" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select className="form-input form-select" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                      {CURRENCIES.map(currency => <option key={currency}>{currency}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={closeForm} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                    {saving ? "Saving..." : editingId ? "Save Changes" : "Add Course"}
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

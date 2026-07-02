"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { Users, Plus, X, Search, CheckCircle, XCircle, Mail, Phone, ShieldOff, ShieldCheck } from "lucide-react";

interface Tutor { id: string; full_name: string; email: string; phone: string; role: string; is_active: boolean; created_at: string; }

export default function UsersPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filtered, setFiltered] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", whatsapp: "", country: "", timezone: "UTC", password: "", role: "tutor" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("id,full_name,email,phone,role,is_active,created_at").in("role", ["tutor", "admin", "parent"]).order("created_at", { ascending: false });
    setTutors(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  async function toggleActive(id: string, currentState: boolean) {
    await supabase.from("profiles").update({ is_active: !currentState }).eq("id", id);
    setTutors(prev => prev.map(t => t.id === id ? { ...t, is_active: !currentState } : t));
    setMsg({ type: "success", text: `User ${currentState ? "deactivated" : "activated"} successfully.` });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(tutors.filter(t => t.full_name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q)));
  }, [search, tutors]);

  async function createTutor(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Could not create account");
      setMsg({ type: "success", text: `${form.role} "${form.full_name}" created successfully.` });
      setForm({ full_name: "", email: "", phone: "", whatsapp: "", country: "", timezone: "UTC", password: "", role: "tutor" });
      setShowForm(false);
      await load();
    } catch (error) {
      setMsg({ type: "error", text: error instanceof Error ? error.message : "Could not create account." });
    }
    setSaving(false);
  }

  return (
    <>
      <TopBar title="Users & Tutors" subtitle="Manage all tutors and admin accounts" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Users & Tutors</h1>
            <p className="page-subtitle">{tutors.length} accounts registered</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Add User
          </button>
        </div>
      </div>
      <div className="page-body">
        {msg.text && (
          <div style={{ background: msg.type === "success" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${msg.type === "success" ? "#bbf7d0" : "#fecaca"}`, color: msg.type === "success" ? "#15803d" : "#b91c1c", borderRadius: 10, padding: "11px 16px", marginBottom: 16, fontSize: "0.83rem", display: "flex", justifyContent: "space-between" }}>
            {msg.text}
            <button onClick={() => setMsg({ type: "", text: "" })} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}><X size={14} /></button>
          </div>
        )}

        {/* Search */}
        <div className="card" style={{ marginBottom: 16, overflow: "visible" }}>
          <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <Search size={16} color="#94a3b8" />
            <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ border: "none", boxShadow: "none", padding: "4px 0", flex: 1 }} />
          </div>
        </div>

        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="empty-state">
              <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Users size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
              <h3>No users found</h3>
              <p>Add your first team or parent account to get started.</p>
            </div>
          ) : (
              <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} style={{ opacity: t.is_active === false ? 0.6 : 1 }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar" style={{ background: t.is_active === false ? "#94a3b8" : undefined }}>{(t.full_name || "?").charAt(0)}</div>
                        <span style={{ fontWeight: 600 }}>{t.full_name || "—"}</span>
                      </div>
                    </td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}><Mail size={13} />{t.email || "—"}</div></td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}><Phone size={13} />{t.phone || "—"}</div></td>
                    <td>
                      <span className={`badge ${t.role === "admin" ? "badge-yellow" : t.role === "parent" ? "badge-purple" : "badge-blue"}`}>{t.role}</span>
                    </td>
                    <td>
                      {t.is_active !== false ? (
                        <span className="badge badge-green" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle size={11} /> Active
                        </span>
                      ) : (
                        <span className="badge badge-red" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <XCircle size={11} /> Blocked
                        </span>
                      )}
                    </td>
                    <td style={{ color: "#94a3b8" }}>{new Date(t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>
                      <button
                        onClick={() => toggleActive(t.id, t.is_active !== false)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "5px 10px", borderRadius: 6, fontSize: "0.75rem",
                          fontWeight: 600, cursor: "pointer",
                          border: `1.5px solid ${t.is_active !== false ? "#fca5a5" : "#86efac"}`,
                          background: t.is_active !== false ? "#fff5f5" : "#f0fdf4",
                          color: t.is_active !== false ? "#dc2626" : "#15803d",
                          transition: "all 0.15s",
                        }}
                      >
                        {t.is_active !== false
                          ? <><ShieldOff size={12} /> Block</>
                          : <><ShieldCheck size={12} /> Activate</>
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add User Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1b5e42)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <h2 style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Add New User</h2>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <form onSubmit={createTutor} style={{ padding: 24, overflowY: "auto", flex: 1 }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="tutor">Tutor</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="e.g. Ustaz Ahmed Ali" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="tutor@noorpath.online" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+44 7700 000000" />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input className="form-input" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="+44 7700 000000" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="UK, USA, Pakistan..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <input className="form-input" value={form.timezone} onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))} placeholder="Europe/London" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Temporary Password</label>
                  <input type="password" className="form-input" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters" required />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                    {saving ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Saving...</> : "Create User"}
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

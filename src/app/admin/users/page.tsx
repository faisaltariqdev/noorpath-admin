"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import {
  TIMEZONE_OPTIONS,
  TIME_OPTIONS,
  WEEK_DAYS,
  formatClock,
  formatTimeInZone,
  getZonedDayAndMinutes,
  localWallTimeToDate,
  minutesFromTime,
  timezoneForCountry,
} from "@/lib/timezones";
import { Users, Plus, X, Search, CheckCircle, XCircle, Mail, Phone, ShieldOff, ShieldCheck, Pencil, KeyRound, Clock, CalendarDays } from "lucide-react";

interface Tutor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  country?: string;
  timezone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AvailabilitySlot {
  id?: string;
  tutor_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

const DEFAULT_SLOT: AvailabilitySlot = {
  day_of_week: 1,
  start_time: "16:00",
  end_time: "20:00",
  timezone: "Asia/Karachi",
};

export default function UsersPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filtered, setFiltered] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", whatsapp: "", country: "", timezone: "UTC", password: "", role: "tutor" });
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", full_name: "", email: "", phone: "", whatsapp: "", country: "", timezone: "UTC", password: "", role: "tutor" });
  const [editAvailability, setEditAvailability] = useState<AvailabilitySlot[]>([]);
  const [availabilityByTutor, setAvailabilityByTutor] = useState<Record<string, AvailabilitySlot[]>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [checkCountry, setCheckCountry] = useState("United States Eastern");
  const [checkTimezone, setCheckTimezone] = useState("America/New_York");
  const [checkDay, setCheckDay] = useState(1);
  const [checkTime, setCheckTime] = useState("19:00");

  async function load() {
    setLoading(true);
    const [{ data }, { data: availabilityRows }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,email,phone,whatsapp,country,timezone,role,is_active,created_at").in("role", ["tutor", "admin", "parent"]).order("created_at", { ascending: false }),
      supabase.from("tutor_availability").select("id,tutor_id,day_of_week,start_time,end_time,timezone").order("day_of_week").order("start_time"),
    ]);
    const grouped = (availabilityRows || []).reduce((acc: Record<string, AvailabilitySlot[]>, slot: any) => {
      if (!slot.tutor_id) return acc;
      acc[slot.tutor_id] = [...(acc[slot.tutor_id] || []), slot];
      return acc;
    }, {});
    setTutors(data || []);
    setFiltered(data || []);
    setAvailabilityByTutor(grouped);
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
    setFiltered(tutors.filter(t => {
      const matchesSearch = !q
        || t.full_name?.toLowerCase().includes(q)
        || t.email?.toLowerCase().includes(q)
        || t.phone?.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || t.role === roleFilter;
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "active" && t.is_active !== false)
        || (statusFilter === "blocked" && t.is_active === false);
      return matchesSearch && matchesRole && matchesStatus;
    }));
  }, [search, roleFilter, statusFilter, tutors]);

  async function createTutor(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, availability }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Could not create account");
      setMsg({ type: "success", text: `${form.role} "${form.full_name}" created successfully.` });
      setForm({ full_name: "", email: "", phone: "", whatsapp: "", country: "", timezone: "UTC", password: "", role: "tutor" });
      setAvailability([]);
      setShowForm(false);
      await load();
    } catch (error) {
      setMsg({ type: "error", text: error instanceof Error ? error.message : "Could not create account." });
    }
    setSaving(false);
  }

  function openEdit(user: Tutor) {
    setEditForm({
      id: user.id,
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      whatsapp: user.whatsapp || "",
      country: user.country || "",
      timezone: user.timezone || "UTC",
      password: "",
      role: user.role || "tutor",
    });
    setEditAvailability(availabilityByTutor[user.id] || []);
    setShowEditForm(true);
    setMsg({ type: "", text: "" });
  }

  async function updateUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, availability: editAvailability }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Could not update account");
      setMsg({ type: "success", text: `${editForm.role} "${editForm.full_name}" updated successfully.` });
      setShowEditForm(false);
      await load();
    } catch (error) {
      setMsg({ type: "error", text: error instanceof Error ? error.message : "Could not update account." });
    }
    setSaving(false);
  }

  function handleCreateCountry(country: string) {
    const timezone = timezoneForCountry(country);
    setForm(p => ({ ...p, country, timezone: timezone || p.timezone }));
    if (timezone) {
      setAvailability(prev => prev.map(slot => ({ ...slot, timezone })));
    }
  }

  function handleEditCountry(country: string) {
    const timezone = timezoneForCountry(country);
    setEditForm(p => ({ ...p, country, timezone: timezone || p.timezone }));
    if (timezone) {
      setEditAvailability(prev => prev.map(slot => ({ ...slot, timezone })));
    }
  }

  function addAvailabilitySlot(kind: "create" | "edit") {
    if (kind === "create") {
      setAvailability(prev => [...prev, { ...DEFAULT_SLOT, timezone: form.timezone || "Asia/Karachi" }]);
    } else {
      setEditAvailability(prev => [...prev, { ...DEFAULT_SLOT, timezone: editForm.timezone || "Asia/Karachi" }]);
    }
  }

  function updateAvailabilitySlot(kind: "create" | "edit", index: number, updates: Partial<AvailabilitySlot>) {
    const setter = kind === "create" ? setAvailability : setEditAvailability;
    setter(prev => prev.map((slot, i) => i === index ? { ...slot, ...updates } : slot));
  }

  function removeAvailabilitySlot(kind: "create" | "edit", index: number) {
    const setter = kind === "create" ? setAvailability : setEditAvailability;
    setter(prev => prev.filter((_, i) => i !== index));
  }

  function AvailabilityEditor({ kind, slots }: { kind: "create" | "edit"; slots: AvailabilitySlot[] }) {
    return (
      <div className="availability-editor">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: slots.length ? 12 : 0 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#0f172a", display: "flex", alignItems: "center", gap: 7 }}>
              <CalendarDays size={14} /> Tutor Availability Slots
            </div>
            <p style={{ color: "#64748b", fontSize: "0.72rem", marginTop: 3 }}>Add weekly slots when this tutor can teach.</p>
          </div>
          <button type="button" className="btn btn-xs btn-primary" onClick={() => addAvailabilitySlot(kind)}>+ Slot</button>
        </div>
        {slots.map((slot, index) => (
          <div key={index} className="availability-slot-row">
            <div className="availability-field">
              <label>Day</label>
              <select className="form-input form-select" value={slot.day_of_week} onChange={e => updateAvailabilitySlot(kind, index, { day_of_week: Number(e.target.value) })}>
                {WEEK_DAYS.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
              </select>
            </div>
            <div className="availability-field">
              <label>Start Time</label>
              <select className="form-input form-select" value={slot.start_time.slice(0, 5)} onChange={e => updateAvailabilitySlot(kind, index, { start_time: e.target.value })}>
                {TIME_OPTIONS.map(time => <option key={time.value} value={time.value}>{time.label}</option>)}
              </select>
            </div>
            <div className="availability-field">
              <label>End Time</label>
              <select className="form-input form-select" value={slot.end_time.slice(0, 5)} onChange={e => updateAvailabilitySlot(kind, index, { end_time: e.target.value })}>
                {TIME_OPTIONS.map(time => <option key={time.value} value={time.value}>{time.label}</option>)}
              </select>
            </div>
            <div className="availability-field">
              <label>Timezone</label>
              <input className="form-input" list={`${kind}-availability-timezones`} value={slot.timezone} onChange={e => updateAvailabilitySlot(kind, index, { timezone: e.target.value })} placeholder="Asia/Karachi" />
            </div>
            <div className="availability-summary">
              <span>{formatClock(slot.start_time)} - {formatClock(slot.end_time)}</span>
              <button type="button" className="btn btn-xs btn-danger" onClick={() => removeAvailabilitySlot(kind, index)}>Remove</button>
            </div>
          </div>
        ))}
        <datalist id={`${kind}-availability-timezones`}>
          {TIMEZONE_OPTIONS.map(option => <option key={option.timezone} value={option.timezone}>{option.label}</option>)}
        </datalist>
      </div>
    );
  }

  const checkInstant = localWallTimeToDate(checkDay, checkTime, checkTimezone);
  const availableTutors = tutors.filter(tutor => {
    if (tutor.role !== "tutor" || tutor.is_active === false) return false;
    return (availabilityByTutor[tutor.id] || []).some(slot => {
      const zoned = getZonedDayAndMinutes(checkInstant, slot.timezone || tutor.timezone || "Asia/Karachi");
      const start = minutesFromTime(slot.start_time);
      const end = minutesFromTime(slot.end_time);
      return zoned.dayOfWeek === Number(slot.day_of_week) && zoned.minutes >= start && zoned.minutes < end;
    });
  });

  const checkerPktTime = formatTimeInZone(checkInstant, "Asia/Karachi");

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

        <div className="filter-toolbar">
          <div className="search-field">
            <Search size={16} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or phone..." />
          </div>
          <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            <option value="admin">Admins</option>
            <option value="tutor">Tutors</option>
            <option value="parent">Parents</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title"><Clock size={16} color="#1b5e42" /> Tutor Availability Checker</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>
                Select student country/local time and see which tutors are available with PKT conversion.
              </p>
            </div>
            <span className="badge badge-green">PKT: {checkerPktTime}</span>
          </div>
          <div className="card-body">
            <div className="filter-toolbar" style={{ marginBottom: 14 }}>
              <input className="form-input" list="checker-country-suggestions" value={checkCountry} onChange={e => {
                const country = e.target.value;
                setCheckCountry(country);
                setCheckTimezone(timezoneForCountry(country) || checkTimezone);
              }} placeholder="Country e.g. United States Eastern" />
              <select className="filter-select" value={checkDay} onChange={e => setCheckDay(Number(e.target.value))}>
                {WEEK_DAYS.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
              </select>
              <input type="time" className="form-input" value={checkTime} onChange={e => setCheckTime(e.target.value)} />
              <input className="form-input" list="checker-timezone-suggestions" value={checkTimezone} onChange={e => setCheckTimezone(e.target.value)} />
            </div>
            <datalist id="checker-country-suggestions">
              {TIMEZONE_OPTIONS.map(option => <option key={option.country} value={option.country}>{option.label}</option>)}
            </datalist>
            <datalist id="checker-timezone-suggestions">
              {TIMEZONE_OPTIONS.map(option => <option key={option.timezone} value={option.timezone}>{option.label}</option>)}
            </datalist>
            {availableTutors.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: "0.82rem", background: "#f8fafc", border: "1px dashed var(--border)", borderRadius: 12, padding: 14 }}>
                No active tutor is available for {checkCountry} {formatClock(checkTime)}. Converted PKT time: <strong>{checkerPktTime}</strong>.
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {availableTutors.map(tutor => (
                  <span key={tutor.id} className="badge badge-blue">
                    {tutor.full_name} · {availabilityByTutor[tutor.id]?.length || 0} slots
                  </span>
                ))}
              </div>
            )}
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
              <div className="table-shell">
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
                      {t.role === "tutor" && (
                        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {(availabilityByTutor[t.id] || []).slice(0, 2).map(slot => (
                            <span key={slot.id || `${slot.day_of_week}-${slot.start_time}`} className="badge badge-gray">
                              {WEEK_DAYS.find(day => day.value === slot.day_of_week)?.label.slice(0, 3)} {formatClock(slot.start_time)}-{formatClock(slot.end_time)}
                            </span>
                          ))}
                          {(availabilityByTutor[t.id] || []).length > 2 && <span className="badge badge-blue">+{(availabilityByTutor[t.id] || []).length - 2}</span>}
                        </div>
                      )}
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
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={() => openEdit(t)} className="btn btn-xs btn-ghost">
                          <Pencil size={12} /> Edit
                        </button>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
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
                    <input className="form-input" list="country-suggestions" value={form.country} onChange={e => handleCreateCountry(e.target.value)} placeholder="UK, USA, Pakistan..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <input className="form-input" list="timezone-suggestions" value={form.timezone} onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))} placeholder="Europe/London" />
                  </div>
                </div>
                <datalist id="country-suggestions">
                  {TIMEZONE_OPTIONS.map(option => <option key={option.country} value={option.country}>{option.label}</option>)}
                </datalist>
                <datalist id="timezone-suggestions">
                  {TIMEZONE_OPTIONS.map(option => <option key={option.timezone} value={option.timezone}>{option.label}</option>)}
                </datalist>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Temporary Password</label>
                  <input type="password" className="form-input" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters" required />
                </div>
                {form.role === "tutor" && <AvailabilityEditor kind="create" slots={availability} />}
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

        {/* Edit User Modal */}
        {showEditForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1b5e42)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <h2 style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Edit User Details</h2>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem", marginTop: 4 }}>Update profile fields or set a new password.</p>
                </div>
                <button onClick={() => setShowEditForm(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <form onSubmit={updateUser} style={{ padding: 24, overflowY: "auto", flex: 1 }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input form-select" value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="tutor">Tutor</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="+44 7700 000000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp</label>
                    <input className="form-input" value={editForm.whatsapp} onChange={e => setEditForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="+44 7700 000000" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" list="edit-country-suggestions" value={editForm.country} onChange={e => handleEditCountry(e.target.value)} placeholder="UK, USA, Pakistan..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <input className="form-input" list="edit-timezone-suggestions" value={editForm.timezone} onChange={e => setEditForm(p => ({ ...p, timezone: e.target.value }))} placeholder="Europe/London" />
                  </div>
                </div>
                <datalist id="edit-country-suggestions">
                  {TIMEZONE_OPTIONS.map(option => <option key={option.country} value={option.country}>{option.label}</option>)}
                </datalist>
                <datalist id="edit-timezone-suggestions">
                  {TIMEZONE_OPTIONS.map(option => <option key={option.timezone} value={option.timezone}>{option.label}</option>)}
                </datalist>
                <div className="form-group" style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 14, padding: 14, marginBottom: 24 }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <KeyRound size={14} /> New Password
                  </label>
                  <input type="password" className="form-input" value={editForm.password} onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} placeholder="Leave empty to keep current password" minLength={8} />
                  <p style={{ color: "#64748b", fontSize: "0.72rem", marginTop: 8 }}>Only enter a password if you want to reset/change this user's login password.</p>
                </div>
                {editForm.role === "tutor" && <AvailabilityEditor kind="edit" slots={editAvailability} />}
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowEditForm(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                    {saving ? "Saving..." : "Save Changes"}
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

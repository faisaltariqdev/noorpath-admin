"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle,
  Clock,
  Megaphone,
  Plus,
  Send,
  X,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { EmptyState, LoadingState, MetricCard, PortalGrid, SectionCard } from "@/components/ui/PortalUI";
import { supabase } from "@/lib/supabase";

type TargetType = "all" | "parents" | "tutors" | "individual" | "course" | "country";

interface AnnouncementRow {
  id: string;
  title: string;
  message: string;
  priority: string;
  target_type: string;
  target_user_id?: string | null;
  target_course?: string | null;
  target_country?: string | null;
  scheduled_at?: string | null;
  expires_at?: string | null;
  published_at?: string | null;
  image_url?: string | null;
  pdf_url?: string | null;
  send_push: boolean;
  send_email: boolean;
  send_dashboard: boolean;
  created_at: string;
  read_count?: number;
  recipient_estimate?: number;
}

const emptyForm = {
  title: "",
  message: "",
  priority: "normal",
  target_type: "all" as TargetType,
  target_user_id: "",
  target_course: "",
  target_country: "",
  scheduled_at: "",
  expires_at: "",
  image_url: "",
  pdf_url: "",
  send_push: false,
  send_email: false,
  send_dashboard: true,
  publish_now: true,
};

export default function AnnouncementCenter() {
  const [rows, setRows] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [users, setUsers] = useState<{ id: string; full_name: string; role: string }[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const [{ data }, { data: reads }, { data: profiles }] = await Promise.all([
      supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(80),
      supabase.from("announcement_reads").select("announcement_id"),
      supabase.from("profiles").select("id, full_name, role").eq("is_active", true).order("full_name"),
    ]);

    const readMap = new Map<string, number>();
    (reads || []).forEach((r: any) => {
      readMap.set(r.announcement_id, (readMap.get(r.announcement_id) || 0) + 1);
    });

    setUsers((profiles || []) as any);
    setRows(
      (data || []).map((row: any) => ({
        ...row,
        read_count: readMap.get(row.id) || 0,
      }))
    );
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const analytics = useMemo(() => {
    const now = Date.now();
    const published = rows.filter((r) => r.published_at);
    const scheduled = rows.filter((r) => r.scheduled_at && new Date(r.scheduled_at).getTime() > now && !r.published_at);
    const expired = rows.filter((r) => r.expires_at && new Date(r.expires_at).getTime() < now);
    const totalReads = rows.reduce((sum, r) => sum + (r.read_count || 0), 0);
    const denom = Math.max(published.length * Math.max(users.length, 1), 1);
    const readPct = Math.min(100, Math.round((totalReads / denom) * 100));
    return {
      total: rows.length,
      scheduled: scheduled.length,
      expired: expired.length,
      readPct,
      unreadPct: Math.max(0, 100 - readPct),
    };
  }, [rows, users.length]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      priority: form.priority,
      target_type: form.target_type,
      target_user_id: form.target_type === "individual" ? form.target_user_id || null : null,
      target_course: form.target_type === "course" ? form.target_course || null : null,
      target_country: form.target_type === "country" ? form.target_country || null : null,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      published_at: form.publish_now && !form.scheduled_at ? new Date().toISOString() : null,
      image_url: form.image_url || null,
      pdf_url: form.pdf_url || null,
      send_push: form.send_push,
      send_email: form.send_email,
      send_dashboard: form.send_dashboard,
      created_by: user?.id,
    };

    const { error } = await supabase.from("announcements").insert(payload);
    setSaving(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setShowForm(false);
    setForm(emptyForm);
    setMsg("Announcement saved.");
    await load();
  }

  return (
    <>
      <TopBar title="Announcement Center" subtitle="Broadcast-only — no replies" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="page-title">Announcement Center</h1>
            <p className="page-subtitle">Parents and tutors can read, mark read, and download attachments only.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> New announcement
          </button>
        </div>
      </div>
      <div className="page-body">
        {msg && (
          <div className="card" style={{ marginBottom: 14, padding: "12px 16px", fontWeight: 600, color: msg.includes("saved") ? "#166534" : "#b91c1c" }}>
            {msg}
          </div>
        )}

        <PortalGrid>
          <MetricCard label="Total" value={analytics.total} icon={Megaphone} tone="green" />
          <MetricCard label="Read %" value={`${analytics.readPct}%`} icon={CheckCircle} tone="blue" />
          <MetricCard label="Unread %" value={`${analytics.unreadPct}%`} icon={Bell} tone="gold" />
          <MetricCard label="Scheduled" value={analytics.scheduled} icon={Clock} tone="violet" />
          <MetricCard label="Expired" value={analytics.expired} icon={X} tone="red" />
        </PortalGrid>

        <div style={{ height: 16 }} />

        <SectionCard title="All announcements" className="portal-section-card--full">
          {loading ? (
            <LoadingState />
          ) : rows.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements yet" description="Create a broadcast for parents, tutors, or individuals." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map((row) => (
                <article key={row.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{row.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4, textTransform: "capitalize" }}>
                        {row.target_type} · {row.priority} · {row.read_count || 0} reads
                        {row.published_at ? " · Published" : row.scheduled_at ? " · Scheduled" : " · Draft"}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      {new Date(row.created_at).toLocaleString("en-GB")}
                    </div>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#475569", marginTop: 8, whiteSpace: "pre-wrap" }}>{row.message}</p>
                  {(row.image_url || row.pdf_url) && (
                    <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: "0.8rem" }}>
                      {row.image_url && <a href={row.image_url} target="_blank" rel="noreferrer">Image</a>}
                      {row.pdf_url && <a href={row.pdf_url} target="_blank" rel="noreferrer">PDF</a>}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <form
            onSubmit={submit}
            style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", padding: 20 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: "1.05rem" }}>New announcement</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-input" required rows={4} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Audience</label>
                <select className="form-input form-select" value={form.target_type} onChange={(e) => setForm((p) => ({ ...p, target_type: e.target.value as TargetType }))}>
                  <option value="all">Broadcast (all)</option>
                  <option value="parents">Parents</option>
                  <option value="tutors">Tutors</option>
                  <option value="individual">Individual user</option>
                  <option value="course">Course</option>
                  <option value="country">Country</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input form-select" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            {form.target_type === "individual" && (
              <div className="form-group">
                <label className="form-label">User</label>
                <select className="form-input form-select" required value={form.target_user_id} onChange={(e) => setForm((p) => ({ ...p, target_user_id: e.target.value }))}>
                  <option value="">Select user</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                  ))}
                </select>
              </div>
            )}
            {form.target_type === "course" && (
              <div className="form-group">
                <label className="form-label">Course name</label>
                <input className="form-input" value={form.target_course} onChange={(e) => setForm((p) => ({ ...p, target_course: e.target.value }))} placeholder="e.g. Noorani Qaida" />
              </div>
            )}
            {form.target_type === "country" && (
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-input" value={form.target_country} onChange={(e) => setForm((p) => ({ ...p, target_country: e.target.value }))} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Schedule (optional)</label>
                <input type="datetime-local" className="form-input" value={form.scheduled_at} onChange={(e) => setForm((p) => ({ ...p, scheduled_at: e.target.value, publish_now: !e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry (optional)</label>
                <input type="datetime-local" className="form-input" value={form.expires_at} onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">PDF URL</label>
              <input className="form-input" value={form.pdf_url} onChange={(e) => setForm((p) => ({ ...p, pdf_url: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14, fontSize: "0.82rem" }}>
              <label><input type="checkbox" checked={form.send_dashboard} onChange={(e) => setForm((p) => ({ ...p, send_dashboard: e.target.checked }))} /> Dashboard</label>
              <label><input type="checkbox" checked={form.send_push} onChange={(e) => setForm((p) => ({ ...p, send_push: e.target.checked }))} /> Push</label>
              <label><input type="checkbox" checked={form.send_email} onChange={(e) => setForm((p) => ({ ...p, send_email: e.target.checked }))} /> Email</label>
              <label><input type="checkbox" checked={form.publish_now && !form.scheduled_at} onChange={(e) => setForm((p) => ({ ...p, publish_now: e.target.checked }))} /> Publish now</label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>
              <Send size={14} /> {saving ? "Saving…" : "Save announcement"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

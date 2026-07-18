"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  DollarSign,
  Megaphone,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { EmptyState, LoadingState, MetricCard, PortalGrid, SectionCard } from "@/components/ui/PortalUI";
import { supabase } from "@/lib/supabase";

type TargetType = "all" | "parents" | "tutors" | "individual";
type AnnouncementKind = "general" | "fee_reminder" | "alert";

interface AnnouncementRow {
  id: string;
  title: string;
  message: string;
  kind: string;
  priority: string;
  target_type: string;
  target_user_id?: string | null;
  expires_at?: string | null;
  published_at?: string | null;
  show_days?: number | null;
  created_at: string;
  read_count?: number;
}

const emptyForm = {
  kind: "general" as AnnouncementKind,
  title: "",
  message: "",
  target_type: "all" as TargetType,
  target_user_id: "",
  show_days: "7",
};

const KIND_META: Record<AnnouncementKind, { label: string; helper: string; defaultTitle: string }> = {
  general: {
    label: "General notice",
    helper: "Academy news, holiday, schedule update",
    defaultTitle: "",
  },
  fee_reminder: {
    label: "Fee reminder",
    helper: "Remind parents about pending fees",
    defaultTitle: "Fee payment reminder",
  },
  alert: {
    label: "Alert",
    helper: "Important warning shown prominently",
    defaultTitle: "Important alert",
  },
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
    const [{ data, error }, { data: reads }, { data: profiles }] = await Promise.all([
      supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(80),
      supabase.from("announcement_reads").select("announcement_id"),
      supabase.from("profiles").select("id, full_name, role").eq("is_active", true).in("role", ["parent", "tutor"]).order("full_name"),
    ]);

    if (error) setMsg(error.message);

    const readMap = new Map<string, number>();
    (reads || []).forEach((r: { announcement_id: string }) => {
      readMap.set(r.announcement_id, (readMap.get(r.announcement_id) || 0) + 1);
    });

    setUsers((profiles || []) as { id: string; full_name: string; role: string }[]);
    setRows(
      (data || []).map((row: AnnouncementRow) => ({
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
    const active = rows.filter((r) => r.published_at && (!r.expires_at || new Date(r.expires_at).getTime() > now));
    const fee = rows.filter((r) => r.kind === "fee_reminder").length;
    const alerts = rows.filter((r) => r.kind === "alert").length;
    const totalReads = rows.reduce((sum, r) => sum + (r.read_count || 0), 0);
    return { active: active.length, fee, alerts, totalReads, total: rows.length };
  }, [rows]);

  function openForm(kind: AnnouncementKind = "general") {
    setForm({
      ...emptyForm,
      kind,
      title: KIND_META[kind].defaultTitle,
      target_type: kind === "fee_reminder" ? "parents" : "all",
      show_days: kind === "alert" ? "3" : "7",
    });
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    const days = Math.max(1, Number(form.show_days) || 7);
    const expires = new Date();
    expires.setDate(expires.getDate() + days);

    const priority = form.kind === "alert" ? "urgent" : form.kind === "fee_reminder" ? "high" : "normal";

    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      kind: form.kind,
      priority,
      target_type: form.target_type,
      target_user_id: form.target_type === "individual" ? form.target_user_id || null : null,
      target_course: null,
      target_country: null,
      scheduled_at: null,
      expires_at: expires.toISOString(),
      published_at: new Date().toISOString(),
      show_days: days,
      send_push: false,
      send_email: false,
      send_dashboard: true,
      created_by: user?.id,
    };

    const { error } = await supabase.from("announcements").insert(payload);
    setSaving(false);
    if (error) {
      setMsg("Could not send: " + error.message);
      return;
    }
    setShowForm(false);
    setForm(emptyForm);
    setMsg("Announcement sent. It will show on the selected users’ dashboards.");
    await load();
  }

  async function removeAnnouncement(id: string) {
    if (!window.confirm("Remove this announcement? Recipients will no longer see it.")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <>
      <TopBar title="Announcement Center" subtitle="Send notices to parents and tutors — dashboard only, no chat" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="page-title">Announcements</h1>
            <p className="page-subtitle">Simple broadcasts that appear on parent & tutor dashboards</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => openForm("general")}>
            <Plus size={15} /> New announcement
          </button>
        </div>
      </div>
      <div className="page-body">
        {msg && (
          <div
            className="card"
            style={{
              marginBottom: 14,
              padding: "12px 16px",
              fontWeight: 600,
              color: msg.includes("Could not") || msg.includes("error") ? "#b91c1c" : "#166534",
              background: msg.includes("Could not") ? "#fef2f2" : "#f0fdf4",
            }}
          >
            {msg}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          {(
            [
              { kind: "general" as const, icon: Megaphone, title: "General notice", desc: "News & updates" },
              { kind: "fee_reminder" as const, icon: DollarSign, title: "Fee reminder", desc: "Parents only by default" },
              { kind: "alert" as const, icon: AlertTriangle, title: "Alert", desc: "Urgent banner" },
            ] as const
          ).map((card) => (
            <button
              key={card.kind}
              type="button"
              onClick={() => openForm(card.kind)}
              style={{
                textAlign: "left",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: 16,
                background: "#fff",
                cursor: "pointer",
                minHeight: 88,
              }}
            >
              <card.icon size={18} color="#1b5e42" />
              <div style={{ fontWeight: 700, marginTop: 8 }}>{card.title}</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{card.desc}</div>
            </button>
          ))}
        </div>

        <PortalGrid>
          <MetricCard label="Active" value={analytics.active} icon={Bell} tone="green" />
          <MetricCard label="Fee reminders" value={analytics.fee} icon={DollarSign} tone="gold" />
          <MetricCard label="Alerts" value={analytics.alerts} icon={AlertTriangle} tone="red" />
          <MetricCard label="Total reads" value={analytics.totalReads} icon={CheckCircle} tone="blue" />
        </PortalGrid>

        <div style={{ height: 16 }} />

        <SectionCard title="Sent announcements" description="Who can see them and for how long" className="portal-section-card--full">
          {loading ? (
            <LoadingState />
          ) : rows.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements yet" description="Send a notice — it appears on dashboards immediately." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map((row) => {
                const expired = row.expires_at && new Date(row.expires_at).getTime() < Date.now();
                return (
                  <article key={row.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, opacity: expired ? 0.55 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{row.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4, textTransform: "capitalize" }}>
                          {(row.kind || "general").replace("_", " ")} · Show to: {row.target_type}
                          {row.expires_at
                            ? ` · Until ${new Date(row.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                            : ""}
                          {" · "}{row.read_count || 0} reads
                          {expired ? " · Expired" : " · Live"}
                        </div>
                      </div>
                      <button type="button" className="btn btn-outline btn-xs" onClick={() => void removeAnnouncement(row.id)} aria-label="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#475569", marginTop: 8, whiteSpace: "pre-wrap" }}>{row.message}</p>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="announce-form-title"
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <form
            onSubmit={submit}
            style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto", padding: 20 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 id="announce-form-title" style={{ margin: 0, fontSize: "1.05rem" }}>
                {KIND_META[form.kind].label}
              </h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: "0.8rem", color: "#64748b" }}>{KIND_META[form.kind].helper}</p>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-input form-select"
                value={form.kind}
                onChange={(e) => {
                  const kind = e.target.value as AnnouncementKind;
                  setForm((p) => ({
                    ...p,
                    kind,
                    title: p.title || KIND_META[kind].defaultTitle,
                    target_type: kind === "fee_reminder" ? "parents" : p.target_type,
                  }));
                }}
              >
                <option value="general">General notice</option>
                <option value="fee_reminder">Fee reminder</option>
                <option value="alert">Alert</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Short clear title" />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-input" required rows={4} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="What should people know?" />
            </div>

            <div className="form-group">
              <label className="form-label">Who should see this?</label>
              <select
                className="form-input form-select"
                value={form.target_type}
                onChange={(e) => setForm((p) => ({ ...p, target_type: e.target.value as TargetType }))}
              >
                <option value="all">Everyone (parents + tutors)</option>
                <option value="parents">Parents only</option>
                <option value="tutors">Tutors only</option>
                <option value="individual">One person</option>
              </select>
            </div>

            {form.target_type === "individual" && (
              <div className="form-group">
                <label className="form-label">Select person</label>
                <select
                  className="form-input form-select"
                  required
                  value={form.target_user_id}
                  onChange={(e) => setForm((p) => ({ ...p, target_user_id: e.target.value }))}
                >
                  <option value="">Choose…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Show on dashboard for</label>
              <select
                className="form-input form-select"
                value={form.show_days}
                onChange={(e) => setForm((p) => ({ ...p, show_days: e.target.value }))}
              >
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>

            <p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: 14 }}>
              Sends immediately to dashboards. No email or push — users see a banner and open Announcements to read it.
            </p>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%", minHeight: 44 }}>
              <Send size={14} /> {saving ? "Sending…" : "Send announcement"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

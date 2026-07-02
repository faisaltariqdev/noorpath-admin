"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { Bell, Send, X, Users, Check } from "lucide-react";

interface Notif { id: string; title: string; body: string; type: string; is_read: boolean; created_at: string; }
const TYPE_BADGE: Record<string, string> = { info: "badge badge-blue", warning: "badge badge-yellow", success: "badge badge-green", alert: "badge badge-red" };

export default function NotificationsPage() {
  const [notifs, setNotifs]     = useState<Notif[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending]   = useState(false);
  const [form, setForm]         = useState({ title: "", body: "", type: "info", target: "all" });

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    setNotifs(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function sendNotif(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    let recipientQuery = supabase.from("profiles").select("id");
    if (form.target !== "all") {
      recipientQuery = recipientQuery.eq("role", form.target);
    }
    const { data: recipients } = await recipientQuery;
    const payload = (recipients || []).map((recipient: any) => ({
      title: form.title,
      body: form.body,
      message: form.body,
      type: form.type,
      sender_id: user?.id,
      target_role: form.target,
      is_read: false,
      recipient_id: recipient.id,
    }));
    if (payload.length > 0) {
      await supabase.from("notifications").insert(payload);
    }
    setForm({ title: "", body: "", type: "info", target: "all" });
    setShowForm(false);
    setSending(false);
    await load();
  }

  async function markRead(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    setNotifs(p => p.map(n => ({ ...n, is_read: true })));
  }

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <>
      <TopBar title="Notifications" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">{unread} unread · {notifs.length} total</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {unread > 0 && <button className="btn btn-ghost btn-sm" onClick={markAllRead}><Check size={14} /> Mark All Read</button>}
            <button className="btn btn-primary" onClick={() => setShowForm(true)}><Send size={15} /> Send Notification</button>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="card">
          {loading ? <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
            : notifs.length === 0 ? <div className="empty-state"><Bell size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No notifications</h3><p>Send your first notification to parents and tutors.</p></div>
            : (
              <div>
                {notifs.map(n => (
                  <div key={n.id} onClick={() => markRead(n.id)} style={{ display: "flex", gap: 14, padding: "16px 22px", borderBottom: "1px solid #f1f5f9", background: n.is_read ? "transparent" : "#f8fafc", cursor: "pointer", transition: "background 0.15s" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: n.is_read ? "transparent" : "#1b5e42", marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontWeight: n.is_read ? 500 : 700, fontSize: "0.88rem", color: "#0f172a", fontFamily: "var(--font-jakarta), sans-serif" }}>{n.title}</span>
                        <span className={TYPE_BADGE[n.type] || "badge badge-gray"}>{n.type}</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.5, fontFamily: "var(--font-jakarta), sans-serif" }}>{n.body}</div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 6 }}>{new Date(n.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1b5e42)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Send Notification</h2>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <form onSubmit={sendNotif} style={{ padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Send To</label>
                    <select className="form-input form-select" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))}>
                      <option value="all">Everyone</option>
                      <option value="parent">Parents Only</option>
                      <option value="tutor">Tutors Only</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="alert">Alert</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notification title" required />
                </div>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Message *</label>
                  <textarea className="form-input" value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Write your message here..." rows={4} style={{ resize: "vertical" }} required />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={sending} style={{ flex: 1, justifyContent: "center" }}>
                    <Send size={14} /> {sending ? "Sending..." : "Send"}
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

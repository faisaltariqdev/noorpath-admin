"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { Bell, MessageCircle, Clock, DollarSign, CheckCircle, AlertTriangle, Phone, Search, Filter } from "lucide-react";

interface PendingFee {
  id: string;
  amount: number;
  period_month?: number;
  period_year?: number;
  student_name: string;
  parent_name?: string;
  parent_whatsapp?: string;
}

interface UpcomingClass {
  id: string;
  scheduled_at: string;
  student_name: string;
  tutor_name?: string;
  meeting_link?: string;
  parent_whatsapp?: string;
}

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SettingsPage() {
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  // Reminder toggles stored in localStorage
  const [feeReminderEnabled, setFeeReminderEnabled] = useState(true);
  const [classReminderEnabled, setClassReminderEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);
  const [feeSearch, setFeeSearch] = useState("");
  const [feeAmountFilter, setFeeAmountFilter] = useState("all");
  const [feePhoneFilter, setFeePhoneFilter] = useState("all");
  const [classSearch, setClassSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("noorpath_settings");
    if (stored) {
      try {
        const s = JSON.parse(stored);
        setFeeReminderEnabled(s.feeReminderEnabled ?? true);
        setClassReminderEnabled(s.classReminderEnabled ?? true);
        setReminderDays(s.reminderDays ?? 3);
      } catch { /* ignore */ }
    }
  }, []);

  function saveSettings(updates: { feeReminderEnabled?: boolean; classReminderEnabled?: boolean; reminderDays?: number }) {
    const current = { feeReminderEnabled, classReminderEnabled, reminderDays };
    const merged = { ...current, ...updates };
    localStorage.setItem("noorpath_settings", JSON.stringify(merged));
    if ("feeReminderEnabled" in updates) setFeeReminderEnabled(updates.feeReminderEnabled!);
    if ("classReminderEnabled" in updates) setClassReminderEnabled(updates.classReminderEnabled!);
    if ("reminderDays" in updates) setReminderDays(updates.reminderDays!);
  }

  useEffect(() => {
    async function loadData() {
      const now = new Date().toISOString();
      const next48h = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      const [{ data: fees }, { data: sessions }] = await Promise.all([
        supabase
          .from("fees")
          .select(`id, amount, period_month, period_year, student:students(full_name, parent:profiles!students_parent_id_fkey(full_name, whatsapp))`)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("class_sessions")
          .select(`id, scheduled_at, meeting_link, student:students(full_name, parent:profiles!students_parent_id_fkey(whatsapp)), tutor:profiles!class_sessions_tutor_id_fkey(full_name)`)
          .eq("status", "scheduled")
          .gte("scheduled_at", now)
          .lte("scheduled_at", next48h)
          .order("scheduled_at")
          .limit(15),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPendingFees((fees || []).map((f: any) => ({
        id: f.id,
        amount: f.amount,
        period_month: f.period_month,
        period_year: f.period_year,
        student_name: Array.isArray(f.student) ? (f.student[0]?.full_name || "Unknown Student") : (f.student?.full_name || "Unknown Student"),
        parent_name: Array.isArray(f.student) ? f.student[0]?.parent?.[0]?.full_name || f.student[0]?.parent?.full_name : f.student?.parent?.full_name,
        parent_whatsapp: Array.isArray(f.student) ? f.student[0]?.parent?.[0]?.whatsapp || f.student[0]?.parent?.whatsapp : f.student?.parent?.whatsapp,
      })));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setUpcomingClasses((sessions || []).map((s: any) => ({
        id: s.id,
        scheduled_at: s.scheduled_at,
        meeting_link: s.meeting_link,
        student_name: Array.isArray(s.student) ? (s.student[0]?.full_name || "Unknown") : (s.student?.full_name || "Unknown"),
        tutor_name: Array.isArray(s.tutor) ? s.tutor[0]?.full_name : s.tutor?.full_name,
        parent_whatsapp: Array.isArray(s.student) ? s.student[0]?.parent?.[0]?.whatsapp || s.student[0]?.parent?.whatsapp : s.student?.parent?.whatsapp,
      })));

      setLoading(false);
    }
    loadData();
  }, []);

  function sendFeeReminder(fee: PendingFee) {
    const wa = fee.parent_whatsapp?.replace(/[^0-9]/g, "");
    if (!wa) { alert("No WhatsApp number for this parent."); return; }
    const period = fee.period_month ? `${MONTH_NAMES[fee.period_month]} ${fee.period_year}` : "this period";
    const msg = encodeURIComponent(
      `Assalamu Alaikum${fee.parent_name ? ` ${fee.parent_name}` : ""},\n\nThis is a friendly reminder that the tuition fee of $${fee.amount} for *${fee.student_name}* (${period}) is currently pending.\n\nPlease arrange payment at your earliest convenience.\n\nJazakAllah Khair,\n*NoorPath Academy*\n🌙 noorpath.online`
    );
    window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
    setSentIds(prev => new Set([...prev, fee.id]));
  }

  function sendClassReminder(cls: UpcomingClass) {
    const wa = cls.parent_whatsapp?.replace(/[^0-9]/g, "");
    if (!wa) { alert("No WhatsApp number for this parent."); return; }
    const classTime = new Date(cls.scheduled_at).toLocaleString("en-GB", {
      weekday: "long", day: "numeric", month: "long",
      hour: "2-digit", minute: "2-digit",
    });
    const msg = encodeURIComponent(
      `Assalamu Alaikum! 🌙\n\nJust a reminder that *${cls.student_name}* has a Quran class scheduled:\n\n📅 *${classTime}*${cls.tutor_name ? `\n👨‍🏫 Tutor: *${cls.tutor_name}*` : ""}${cls.meeting_link ? `\n🔗 Join: ${cls.meeting_link}` : ""}\n\nPlease make sure your child is ready 5 minutes early.\n\nJazakAllah Khair,\n*NoorPath Academy* 📖`
    );
    window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
    setSentIds(prev => new Set([...prev, cls.id]));
  }

  function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!enabled)}
        style={{
          width: 52, height: 28, borderRadius: 999, border: "none",
          background: enabled ? "#1b5e42" : "#e2e8f0",
          cursor: "pointer", position: "relative", transition: "background 0.25s",
          flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 3, left: enabled ? 24 : 3,
          width: 22, height: 22, borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "left 0.25s",
        }} />
      </button>
    );
  }

  const filteredFees = pendingFees.filter((fee) => {
    const q = feeSearch.trim().toLowerCase();
    const matchesSearch = !q
      || fee.student_name.toLowerCase().includes(q)
      || fee.parent_name?.toLowerCase().includes(q)
      || `${MONTH_NAMES[fee.period_month || 0]} ${fee.period_year || ""}`.toLowerCase().includes(q);
    const matchesAmount = feeAmountFilter === "all"
      || (feeAmountFilter === "under50" && fee.amount < 50)
      || (feeAmountFilter === "50to100" && fee.amount >= 50 && fee.amount <= 100)
      || (feeAmountFilter === "over100" && fee.amount > 100);
    const matchesPhone = feePhoneFilter === "all"
      || (feePhoneFilter === "hasPhone" && Boolean(fee.parent_whatsapp))
      || (feePhoneFilter === "missingPhone" && !fee.parent_whatsapp);
    return matchesSearch && matchesAmount && matchesPhone;
  });

  const filteredClasses = upcomingClasses.filter((cls) => {
    const q = classSearch.trim().toLowerCase();
    return !q
      || cls.student_name.toLowerCase().includes(q)
      || cls.tutor_name?.toLowerCase().includes(q);
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Settings" subtitle="System configuration and automated reminders" />
      <div className="page-content">

        {/* Reminder Settings */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Automated Reminder Settings</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>
                Control when WhatsApp reminders are sent to parents
              </p>
            </div>
            <Bell size={18} style={{ color: "var(--muted)" }} />
          </div>

          <div style={{ display: "grid", gap: 14, padding: 18 }}>
            {/* Fee Reminders */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, padding: 18, border: "1px solid var(--border)", borderRadius: 14, background: "#fbfefc", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign size={18} style={{ color: "#1b5e42" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--charcoal)" }}>Fee Payment Reminders</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>
                    Send WhatsApp reminder to parents with pending fees
                  </div>
                  {feeReminderEnabled && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Remind after</span>
                      <select
                        value={reminderDays}
                        onChange={e => saveSettings({ reminderDays: Number(e.target.value) })}
                        style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: "0.78rem" }}
                      >
                        {[1, 2, 3, 5, 7, 14].map(d => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""} overdue</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <ToggleSwitch enabled={feeReminderEnabled} onChange={v => saveSettings({ feeReminderEnabled: v })} />
            </div>

            {/* Class Reminders */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, padding: 18, border: "1px solid var(--border)", borderRadius: 14, background: "#fffdf7", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={18} style={{ color: "#d97706" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--charcoal)" }}>30-Min Before Class Reminders</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>
                    Send class reminder to parents with upcoming sessions in the next 48 hours
                  </div>
                </div>
              </div>
              <ToggleSwitch enabled={classReminderEnabled} onChange={v => saveSettings({ classReminderEnabled: v })} />
            </div>
          </div>
        </div>

        {/* Pending Fee Reminders */}
        {feeReminderEnabled && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Pending Fee Reminders</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>
                  {filteredFees.length} of {pendingFees.length} pending fee{pendingFees.length !== 1 ? "s" : ""} — click to send WhatsApp reminder
                </p>
              </div>
              {pendingFees.length > 0 && (
                <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 999, padding: "4px 12px", fontSize: "0.75rem", color: "#a16207", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertTriangle size={12} /> {pendingFees.length} pending
                </div>
              )}
            </div>

            <div style={{ padding: "16px 22px 0" }}>
              <div className="filter-toolbar">
                <div className="search-field">
                  <Search size={16} color="#94a3b8" />
                  <input value={feeSearch} onChange={e => setFeeSearch(e.target.value)} placeholder="Search student, parent, or month..." />
                </div>
                <select className="filter-select" value={feeAmountFilter} onChange={e => setFeeAmountFilter(e.target.value)}>
                  <option value="all">All amounts</option>
                  <option value="under50">Under 50</option>
                  <option value="50to100">50 to 100</option>
                  <option value="over100">Over 100</option>
                </select>
                <select className="filter-select" value={feePhoneFilter} onChange={e => setFeePhoneFilter(e.target.value)}>
                  <option value="all">All contacts</option>
                  <option value="hasPhone">WhatsApp available</option>
                  <option value="missingPhone">Missing number</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 32 }}><div className="spinner" /></div>
            ) : filteredFees.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
                <CheckCircle size={36} style={{ color: "#86efac", marginBottom: 12 }} />
                <p>{pendingFees.length === 0 ? "All fees are up to date! No reminders needed." : "No fee reminders match the selected filters."}</p>
              </div>
            ) : (
              <div className="list-stack">
                {filteredFees.map((fee) => (
                  <div key={fee.id} className="list-row">
                    <div>
                      <div className="list-title">{fee.student_name}</div>
                      <div className="list-meta">
                        {fee.parent_name && <span>Parent: {fee.parent_name}</span>}
                        <span>{fee.period_month ? `${MONTH_NAMES[fee.period_month]} ${fee.period_year}` : "Pending fee"}</span>
                        <span className={fee.parent_whatsapp ? "badge badge-green" : "badge badge-gray"}>
                          {fee.parent_whatsapp ? "WhatsApp ready" : "No number"}
                        </span>
                      </div>
                    </div>
                    <div className="metric-pill">${fee.amount}</div>
                    {fee.parent_whatsapp ? (
                      <button
                        onClick={() => sendFeeReminder(fee)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "7px 14px", borderRadius: 8,
                          border: sentIds.has(fee.id) ? "1.5px solid #86efac" : "1.5px solid #25D366",
                          background: sentIds.has(fee.id) ? "#f0fdf4" : "#f0fff4",
                          color: sentIds.has(fee.id) ? "#15803d" : "#128C7E",
                          fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {sentIds.has(fee.id) ? <><CheckCircle size={13} /> Sent</> : <><MessageCircle size={13} /> Send WhatsApp</>}
                      </button>
                    ) : (
                      <div className="action-muted">
                        <Phone size={12} /> No number
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upcoming Class Reminders */}
        {classReminderEnabled && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Upcoming Classes — Send Reminders</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>
                  Classes in the next 48 hours — send WhatsApp reminder to parents
                </p>
              </div>
            </div>

            <div style={{ padding: "16px 22px 0" }}>
              <div className="filter-toolbar" style={{ gridTemplateColumns: "1fr" }}>
                <div className="search-field">
                  <Search size={16} color="#94a3b8" />
                  <input value={classSearch} onChange={e => setClassSearch(e.target.value)} placeholder="Search student or tutor..." />
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 32 }}><div className="spinner" /></div>
            ) : filteredClasses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
                <Clock size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p>{upcomingClasses.length === 0 ? "No classes scheduled in the next 48 hours." : "No classes match the search."}</p>
              </div>
            ) : (
              <div className="list-stack">
                {filteredClasses.map((cls) => {
                  const timeUntil = Math.round((new Date(cls.scheduled_at).getTime() - Date.now()) / 60000);
                  const isUrgent = timeUntil <= 30;
                  return (
                    <div key={cls.id} className="list-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: "var(--radius-sm)",
                          background: isUrgent ? "#fef9c3" : "#f8fafc",
                          border: `1px solid ${isUrgent ? "#fde047" : "var(--border)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {isUrgent ? <AlertTriangle size={16} style={{ color: "#d97706" }} /> : <Clock size={16} style={{ color: "#64748b" }} />}
                        </div>
                        <div>
                          <div className="list-title">{cls.student_name}</div>
                          <div className="list-meta">
                          {new Date(cls.scheduled_at).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          {cls.tutor_name && ` · ${cls.tutor_name}`}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: isUrgent ? "#d97706" : "var(--muted)" }}>
                        {timeUntil > 0 ? `In ${timeUntil}m` : "Now"}
                      </div>
                      {cls.parent_whatsapp ? (
                        <button
                          onClick={() => sendClassReminder(cls)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "7px 14px", borderRadius: 8,
                            border: sentIds.has(cls.id) ? "1.5px solid #86efac" : "1.5px solid #25D366",
                            background: sentIds.has(cls.id) ? "#f0fdf4" : "#f0fff4",
                            color: sentIds.has(cls.id) ? "#15803d" : "#128C7E",
                            fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                          }}
                        >
                          {sentIds.has(cls.id) ? <><CheckCircle size={13} /> Sent</> : <><MessageCircle size={13} /> Send WhatsApp</>}
                        </button>
                      ) : (
                        <div className="action-muted">No number</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

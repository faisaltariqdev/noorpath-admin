"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, DollarSign, Plus, X } from "lucide-react";
import TopBar from "@/components/TopBar";
import { EmptyState, LoadingState } from "@/components/ui/PortalUI";
import { currencyForCountry } from "@/lib/currency";
import { formatCurrency } from "@/lib/portal";
import { supabase } from "@/lib/supabase";

interface Earning {
  id: string;
  tutor_id: string;
  tutor_name: string;
  tutor_country?: string | null;
  month: string;
  year: number;
  total_classes: number;
  total_hours: number;
  rate_per_hour: number;
  total_amount: number;
  currency: string;
  status: string;
  paid_date: string | null;
}

interface Tutor {
  id: string;
  full_name: string;
  country?: string | null;
}

const MONTHS = [
  { v: "01", l: "January" }, { v: "02", l: "February" }, { v: "03", l: "March" },
  { v: "04", l: "April" }, { v: "05", l: "May" }, { v: "06", l: "June" },
  { v: "07", l: "July" }, { v: "08", l: "August" }, { v: "09", l: "September" },
  { v: "10", l: "October" }, { v: "11", l: "November" }, { v: "12", l: "December" },
];
const MONTH_LABEL: Record<string, string> = Object.fromEntries(MONTHS.map((m) => [m.v, m.l.slice(0, 3)]));

export default function AdminEarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);
  const [filterStatus, setFilter] = useState("all");
  const [msg, setMsg] = useState("");
  const now = new Date();
  const [form, setForm] = useState({
    tutor_id: "",
    month: String(now.getMonth() + 1).padStart(2, "0"),
    year: now.getFullYear(),
    total_amount: "",
    currency: "USD",
  });

  async function load() {
    setLoading(true);
    const [{ data: earn }, { data: tuts }] = await Promise.all([
      supabase
        .from("tutor_earnings")
        .select("*, tutor:profiles(full_name, country)")
        .order("year", { ascending: false })
        .order("month", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, country")
        .eq("role", "tutor")
        .eq("is_active", true)
        .order("full_name"),
    ]);

    setEarnings(
      (earn || []).map((e: any) => {
        const tutor = Array.isArray(e.tutor) ? e.tutor[0] : e.tutor;
        const countryCurrency = currencyForCountry(tutor?.country);
        return {
          ...e,
          month: String(e.month).padStart(2, "0"),
          tutor_name: tutor?.full_name || "—",
          tutor_country: tutor?.country,
          currency: e.currency || countryCurrency,
        };
      })
    );
    setTutors(tuts || []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const display = useMemo(
    () => (filterStatus === "all" ? earnings : earnings.filter((e) => e.status === filterStatus)),
    [earnings, filterStatus]
  );

  function onTutorChange(tutorId: string) {
    const tutor = tutors.find((t) => t.id === tutorId);
    setForm((p) => ({
      ...p,
      tutor_id: tutorId,
      currency: currencyForCountry(tutor?.country),
    }));
  }

  async function addEarning(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const tutor = tutors.find((t) => t.id === form.tutor_id);
    const currency = currencyForCountry(tutor?.country) || form.currency;
    const { error } = await supabase.from("tutor_earnings").insert({
      tutor_id: form.tutor_id,
      month: parseInt(form.month, 10),
      year: form.year,
      total_classes: 0,
      total_hours: 0,
      rate_per_hour: 0,
      total_amount: parseFloat(form.total_amount) || 0,
      currency,
      status: "pending",
    });
    setSaving(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setShowForm(false);
    setForm((p) => ({ ...p, tutor_id: "", total_amount: "" }));
    await load();
  }

  async function markPaid(id: string) {
    setMarking(id);
    setMsg("");
    const paidAt = new Date().toISOString();
    const row = earnings.find((e) => e.id === id);
    const currency = row?.currency || currencyForCountry(row?.tutor_country);
    const { error } = await supabase
      .from("tutor_earnings")
      .update({
        status: "paid",
        paid_date: paidAt,
        invoice_generated: true,
        currency,
      })
      .eq("id", id);
    setMarking(null);
    if (error) {
      setMsg(error.message);
      return;
    }
    setEarnings((p) =>
      p.map((e) => (e.id === id ? { ...e, status: "paid", paid_date: paidAt, currency } : e))
    );
    setMsg("Marked paid — tutor will see a transfer confirmation on their Payments page.");
  }

  return (
    <>
      <TopBar title="Tutor Payments" subtitle="Transfer salary — tutors see confirmation only" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Tutor Payments</h1>
            <p className="page-subtitle">Record and confirm salary transfers in each tutor&apos;s country currency</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> New transfer record
          </button>
        </div>
      </div>
      <div className="page-body">
        {msg && (
          <div className="card" style={{ marginBottom: 14, padding: "12px 16px", fontWeight: 600, color: "#166534", background: "#f0fdf4" }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {["all", "pending", "paid"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`btn btn-sm ${filterStatus === s ? "btn-primary" : "btn-ghost"}`}
              style={{ textTransform: "capitalize" }}
            >
              {s}
              {s !== "all" && ` (${earnings.filter((e) => e.status === s).length})`}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <LoadingState />
          ) : display.length === 0 ? (
            <EmptyState icon={DollarSign} title="No payment records" description="Create a transfer record, then mark it paid when salary is sent." />
          ) : (
            <div className="list-stack">
              {display.map((e) => {
                const currency = e.currency || currencyForCountry(e.tutor_country);
                return (
                  <div key={e.id} className="list-row" style={{ gridTemplateColumns: "1fr auto", gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="list-title">{e.tutor_name}</div>
                      <div className="list-meta">
                        {MONTH_LABEL[e.month] || e.month} {e.year}
                        {" · "}
                        {formatCurrency(e.total_amount, currency)}
                        {e.status === "paid" && e.paid_date
                          ? ` · Transferred ${new Date(e.paid_date).toLocaleString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : " · Awaiting transfer"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                      {e.status !== "paid" ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={marking === e.id}
                          onClick={() => void markPaid(e.id)}
                        >
                          <Check size={13} /> {marking === e.id ? "…" : "Mark transferred"}
                        </button>
                      ) : (
                        <span style={{ color: "#15803d", fontSize: "0.78rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={14} /> Sent
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showForm && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            role="dialog"
            aria-modal="true"
          >
            <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: "1rem" }}>New salary transfer</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={addEarning}>
                <div className="form-group">
                  <label className="form-label">Tutor *</label>
                  <select className="form-input form-select" value={form.tutor_id} onChange={(e) => onTutorChange(e.target.value)} required>
                    <option value="">Select tutor</option>
                    {tutors.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                        {t.country ? ` · ${currencyForCountry(t.country)}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Month</label>
                    <select className="form-input form-select" value={form.month} onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))}>
                      {MONTHS.map((m) => (
                        <option key={m.v} value={m.v}>{m.l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select className="form-input form-select" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: +e.target.value }))}>
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Total amount ({form.currency}) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.total_amount}
                    onChange={(e) => setForm((p) => ({ ...p, total_amount: e.target.value }))}
                    min={0}
                    step="0.01"
                    required
                    placeholder="0"
                  />
                  <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 6 }}>
                    Currency is set from the tutor&apos;s country profile automatically.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                    {saving ? "Saving…" : "Save record"}
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

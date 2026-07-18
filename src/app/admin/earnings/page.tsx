"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, DollarSign, Pencil, Plus, Trash2, X } from "lucide-react";
import TopBar from "@/components/TopBar";
import { EmptyState, LoadingState } from "@/components/ui/PortalUI";
import { currencyForCountry } from "@/lib/currency";
import { formatCurrency } from "@/lib/portal";
import { supabase } from "@/lib/supabase";

interface TutorOption {
  id: string;
  full_name: string;
  country?: string | null;
}

interface EarningRow {
  id: string;
  tutor_id: string;
  tutor_name: string;
  tutor_country?: string | null;
  month: number;
  year: number;
  total_amount: number;
  currency: string;
  status: string;
  paid_date?: string | null;
  notes?: string | null;
}

const MONTHS = [
  { v: "1", l: "January" }, { v: "2", l: "February" }, { v: "3", l: "March" },
  { v: "4", l: "April" }, { v: "5", l: "May" }, { v: "6", l: "June" },
  { v: "7", l: "July" }, { v: "8", l: "August" }, { v: "9", l: "September" },
  { v: "10", l: "October" }, { v: "11", l: "November" }, { v: "12", l: "December" },
];
const MONTH_LABEL: Record<number, string> = Object.fromEntries(
  MONTHS.map((m) => [Number(m.v), m.l.slice(0, 3)])
);

type FormState = {
  tutor_id: string;
  month: string;
  year: number;
  total_amount: string;
  currency: string;
  notes: string;
};

const emptyForm = (): FormState => ({
  tutor_id: "",
  month: String(new Date().getMonth() + 1),
  year: new Date().getFullYear(),
  total_amount: "",
  currency: "USD",
  notes: "",
});

export default function AdminEarningsPage() {
  const [earnings, setEarnings] = useState<EarningRow[]>([]);
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EarningRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editForm, setEditForm] = useState({
    month: "1",
    year: new Date().getFullYear(),
    total_amount: "",
    notes: "",
    status: "pending",
  });
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: earn }, { data: tutorRows }] = await Promise.all([
      supabase
        .from("tutor_earnings")
        .select("id, tutor_id, month, year, total_amount, currency, status, paid_date, notes")
        .order("year", { ascending: false })
        .order("month", { ascending: false }),
      supabase.from("profiles").select("id, full_name, country").eq("role", "tutor").order("full_name"),
    ]);

    const tutorList = (tutorRows || []) as TutorOption[];
    setTutors(tutorList);
    const tutorMap = Object.fromEntries(tutorList.map((t) => [t.id, t]));

    setEarnings(
      (earn || []).map((row: any) => ({
        id: row.id,
        tutor_id: row.tutor_id,
        tutor_name: tutorMap[row.tutor_id]?.full_name || "Tutor",
        tutor_country: tutorMap[row.tutor_id]?.country,
        month: Number(row.month),
        year: Number(row.year),
        total_amount: Number(row.total_amount || 0),
        currency: row.currency || currencyForCountry(tutorMap[row.tutor_id]?.country),
        status: row.status,
        paid_date: row.paid_date,
        notes: row.notes,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
      notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setShowForm(false);
    setForm(emptyForm());
    setMsg("Transfer record created.");
    await load();
  }

  function openEdit(row: EarningRow) {
    setEditing(row);
    setEditForm({
      month: String(row.month),
      year: row.year,
      total_amount: String(row.total_amount),
      notes: row.notes || "",
      status: row.status,
    });
    setMsg("");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setMsg("");
    const currency = editing.currency || currencyForCountry(editing.tutor_country);
    const nextStatus = editForm.status;
    const payload: Record<string, unknown> = {
      month: parseInt(editForm.month, 10),
      year: editForm.year,
      total_amount: parseFloat(editForm.total_amount) || 0,
      notes: editForm.notes.trim() || null,
      currency,
      status: nextStatus,
    };
    if (nextStatus === "paid" && !editing.paid_date) {
      payload.paid_date = new Date().toISOString();
      payload.invoice_generated = true;
    }
    if (nextStatus !== "paid") {
      payload.paid_date = null;
    }
    const { error } = await supabase.from("tutor_earnings").update(payload).eq("id", editing.id);
    setSaving(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setEditing(null);
    setMsg("Payment updated.");
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
    setMsg("Marked transferred — tutor can see amount, date/time, and your note.");
    await load();
  }

  async function deleteEarning(id: string) {
    if (!window.confirm("Delete this payment record? This cannot be undone.")) return;
    setDeleting(id);
    setMsg("");
    const { error } = await supabase.from("tutor_earnings").delete().eq("id", id);
    setDeleting(null);
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg("Payment record deleted.");
    setEarnings((p) => p.filter((e) => e.id !== id));
  }

  return (
    <>
      <TopBar title="Tutor Payments" subtitle="Transfer salary — tutors see confirmation only" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Tutor Payments</h1>
            <p className="page-subtitle">Record transfers with notes · edit or delete anytime</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setForm(emptyForm());
              setShowForm(true);
            }}
          >
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
            <EmptyState icon={DollarSign} title="No payment records" description="Create a transfer record with an optional note, then mark it paid." />
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tutor</th>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Note</th>
                    <th>Status / transferred</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {display.map((e) => {
                    const currency = e.currency || currencyForCountry(e.tutor_country);
                    return (
                      <tr key={e.id}>
                        <td data-label="Tutor" style={{ fontWeight: 600 }}>{e.tutor_name}</td>
                        <td data-label="Period">
                          {MONTH_LABEL[e.month] || e.month} {e.year}
                        </td>
                        <td data-label="Amount" style={{ fontWeight: 700 }}>
                          {formatCurrency(e.total_amount, currency)}
                        </td>
                        <td data-label="Note" style={{ color: "#475569", maxWidth: 220 }}>
                          {e.notes?.trim() || "—"}
                        </td>
                        <td data-label="Status">
                          {e.status === "paid" && e.paid_date ? (
                            <div>
                              <span className="badge badge-green" style={{ marginBottom: 4 }}>Transferred</span>
                              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                {new Date(e.paid_date).toLocaleString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="badge badge-yellow">Pending</span>
                          )}
                        </td>
                        <td data-label="Actions">
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {e.status !== "paid" && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                disabled={marking === e.id}
                                onClick={() => void markPaid(e.id)}
                              >
                                <Check size={13} /> {marking === e.id ? "…" : "Mark transferred"}
                              </button>
                            )}
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ color: "#b91c1c" }}
                              disabled={deleting === e.id}
                              onClick={() => void deleteEarning(e.id)}
                            >
                              <Trash2 size={13} /> {deleting === e.id ? "…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            role="dialog"
            aria-modal="true"
          >
            <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, padding: 20, maxHeight: "90vh", overflow: "auto" }}>
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
                </div>
                <div className="form-group">
                  <label className="form-label">Note to tutor</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Optional message shown on tutor Payments page"
                  />
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

        {editing && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            role="dialog"
            aria-modal="true"
          >
            <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, padding: 20, maxHeight: "90vh", overflow: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: "1rem" }}>Edit payment — {editing.tutor_name}</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={saveEdit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Month</label>
                    <select className="form-input form-select" value={editForm.month} onChange={(e) => setEditForm((p) => ({ ...p, month: e.target.value }))}>
                      {MONTHS.map((m) => (
                        <option key={m.v} value={m.v}>{m.l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select className="form-input form-select" value={editForm.year} onChange={(e) => setEditForm((p) => ({ ...p, year: +e.target.value }))}>
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Amount ({editing.currency || currencyForCountry(editing.tutor_country)})
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={editForm.total_amount}
                    onChange={(e) => setEditForm((p) => ({ ...p, total_amount: e.target.value }))}
                    min={0}
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Transferred</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Note to tutor</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Message shown on tutor Payments page"
                  />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
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

"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { formatCurrency, formatFeePeriod } from "@/lib/portal";
import { currencyForCountry } from "@/lib/currency";
import { DollarSign, Plus, X, AlertCircle, CheckCircle, Clock, Search } from "lucide-react";

interface Fee {
  id: string;
  student_name: string;
  parent_name?: string;
  parent_whatsapp?: string;
  parent_phone?: string;
  country?: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  period_month?: number;
  period_year?: number;
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
}

const STATUS_BADGE: Record<string, string> = { paid: "badge badge-green", pending: "badge badge-yellow", overdue: "badge badge-red", waived: "badge badge-gray" };

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string; country?: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [filterCurrency, setFilterCurrency] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [form, setForm] = useState({
    student_id: "",
    amount: "",
    currency: "USD",
    notes: "",
    due_date: "",
    status: "pending",
    period_month: String(new Date().getMonth() + 1),
    period_year: String(new Date().getFullYear()),
    payment_method: "",
  });

  async function load() {
    setLoading(true);
    const [{ data: feesData }, { data: studs }] = await Promise.all([
      supabase.from("fees").select("id, amount, currency, status, due_date, period_month, period_year, payment_method, notes, created_at, student:students(full_name, country), parent:profiles!fees_parent_id_fkey(full_name, whatsapp, phone)").order("created_at", { ascending: false }),
      supabase.from("students").select("id, full_name, country").eq("is_active", true),
    ]);
    setFees((feesData || []).map((f: any) => ({
      ...f,
      student_name: f.student?.full_name || "—",
      country: f.student?.country || "Unknown",
      parent_name: f.parent?.full_name || "",
      parent_whatsapp: f.parent?.whatsapp || "",
      parent_phone: f.parent?.phone || "",
    })));
    setStudents(studs || []);
    setLoading(false);
  }

  function selectStudentForFee(studentId: string) {
    const student = students.find((s) => s.id === studentId);
    setForm((prev) => ({
      ...prev,
      student_id: studentId,
      currency: currencyForCountry(student?.country) || prev.currency,
    }));
  }

  useEffect(() => { load(); }, []);

  const filtered = fees.filter(f => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q
      || f.student_name.toLowerCase().includes(q)
      || f.parent_name?.toLowerCase().includes(q)
      || f.notes?.toLowerCase().includes(q)
      || f.country?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" || f.status === filterStatus;
    const matchesCurrency = filterCurrency === "all" || f.currency === filterCurrency;
    const matchesCountry = filterCountry === "all" || (f.country || "Unknown") === filterCountry;
    return matchesSearch && matchesStatus && matchesCurrency && matchesCountry;
  }).sort((a, b) => {
    const diff = +new Date(a.created_at) - +new Date(b.created_at);
    return sortOrder === "asc" ? diff : -diff;
  });
  const totalPaid = fees.filter(f => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter(f => f.status === "pending").reduce((s, f) => s + f.amount, 0);
  const totalOverdue = fees.filter(f => f.status === "overdue").reduce((s, f) => s + f.amount, 0);
  const currencies = Array.from(new Set(fees.map(f => f.currency || "USD"))).sort();
  const countries = Array.from(new Set(fees.map(f => f.country || "Unknown"))).sort();

  async function addFee(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: student } = await supabase.from("students").select("parent_id").eq("id", form.student_id).single();
    await supabase.from("fees").insert({
      student_id: form.student_id,
      parent_id: student?.parent_id || null,
      amount: parseFloat(form.amount),
      currency: form.currency,
      notes: form.notes || null,
      due_date: form.due_date || null,
      status: form.status,
      period_month: parseInt(form.period_month),
      period_year: parseInt(form.period_year),
      payment_method: form.payment_method || null,
    });
    setShowForm(false);
    setForm({ student_id: "", amount: "", currency: "USD", notes: "", due_date: "", status: "pending", period_month: String(new Date().getMonth() + 1), period_year: String(new Date().getFullYear()), payment_method: "" });
    setSaving(false);
    await load();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("fees").update({ status }).eq("id", id);
    setFees(p => p.map(f => f.id === id ? { ...f, status } : f));
  }

  return (
    <>
      <TopBar title="Fee Management" subtitle="Track and manage student fees" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><h1 className="page-title">Fee Management</h1><p className="page-subtitle">All fee records</p></div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> Add Fee Record</button>
        </div>
      </div>
      <div className="page-body">
        {/* Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: "Total Collected", value: formatCurrency(totalPaid, fees[0]?.currency || "USD"), icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
            { label: "Pending", value: formatCurrency(totalPending, fees[0]?.currency || "USD"), icon: Clock, color: "#d97706", bg: "#fef9c3" },
            { label: "Overdue", value: formatCurrency(totalOverdue, fees[0]?.currency || "USD"), icon: AlertCircle, color: "#dc2626", bg: "#fee2e2" },
            { label: "Total Records", value: fees.length, icon: DollarSign, color: "#2563eb", bg: "#dbeafe" },
          ].map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-icon" style={{ background: c.bg, marginBottom: 12 }}><c.icon size={20} color={c.color} /></div>
              <div className="stat-value" style={{ fontSize: "1.4rem" }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="filter-toolbar">
          <div className="search-field">
            <Search size={16} color="#94a3b8" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice, student, parent, country..." />
          </div>
          <select className="filter-select" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
            <option value="all">All countries</option>
            {countries.map(country => <option key={country} value={country}>{country}</option>)}
          </select>
          <select className="filter-select" value={filterCurrency} onChange={e => setFilterCurrency(e.target.value)}>
            <option value="all">All currencies</option>
            {currencies.map(currency => <option key={currency} value={currency}>{currency}</option>)}
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All status</option>
            {["paid", "pending", "overdue", "waived"].map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <select className="filter-select" value={sortOrder} onChange={e => setSortOrder(e.target.value as "asc" | "desc")}>
            <option value="desc">Newest first (descending)</option>
            <option value="asc">Oldest first (ascending)</option>
          </select>
        </div>

        <div className="card">
          {loading ? <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
            : filtered.length === 0 ? <div className="empty-state"><DollarSign size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No fee records</h3><p>Add your first fee record.</p></div>
            : (
              <div className="table-shell">
              <table className="data-table">
                <thead><tr><th>Student</th><th>Country</th><th>Invoice</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {filtered.map(f => (
                    <tr key={f.id}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><div className="avatar" style={{ width: 28, height: 28, fontSize: "0.7rem" }}>{f.student_name.charAt(0)}</div><span style={{ fontWeight: 600 }}>{f.student_name}</span></div></td>
                      <td style={{ color: "#64748b" }}>{f.country || "—"}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{formatFeePeriod(f.period_month, f.period_year)}</div>
                        <div style={{ color: "#64748b", fontSize: "0.72rem", marginTop: 2 }}>{f.notes || "Monthly tuition invoice"}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(f.amount, f.currency || "USD")}</td>
                      <td style={{ color: f.due_date && new Date(f.due_date) < new Date() && f.status === "pending" ? "#dc2626" : "#94a3b8" }}>{f.due_date ? new Date(f.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                      <td><span className={STATUS_BADGE[f.status] || "badge badge-gray"}>{f.status}</span></td>
                      <td>
                        {f.status === "pending" && (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button onClick={() => updateStatus(f.id, "paid")} className="btn btn-xs btn-primary">Mark Paid</button>
                            <button onClick={() => updateStatus(f.id, "overdue")} className="btn btn-xs btn-danger">Overdue</button>
                            {(f.parent_whatsapp || f.parent_phone) && (
                              <a
                                href={`https://wa.me/${(f.parent_whatsapp || f.parent_phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Assalam o Alaikum ${f.parent_name || ""}, this is a reminder for ${formatFeePeriod(f.period_month, f.period_year)} fee invoice of ${formatCurrency(f.amount, f.currency || "USD")} for ${f.student_name}. Due date: ${f.due_date || "N/A"}.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-ghost"
                              >
                                Remind
                              </a>
                            )}
                          </div>
                        )}
                        {f.status === "paid" && <span style={{ fontSize: "0.75rem", color: "#16a34a" }}>✓ Received</span>}
                        {f.status === "overdue" && <button onClick={() => updateStatus(f.id, "paid")} className="btn btn-xs btn-primary">Mark Paid</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
        </div>

        {showForm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420, overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1b5e42)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ color: "#fff", fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Add Fee Record</h2>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <form onSubmit={addFee} style={{ padding: 24 }}>
                <div className="form-group">
                  <label className="form-label">Student *</label>
                  <select className="form-input form-select" value={form.student_id} onChange={e => selectStudentForFee(e.target.value)} required>
                    <option value="">Select student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.full_name}{s.country ? ` · ${s.country} (${currencyForCountry(s.country)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Amount *</label>
                    <input type="number" className="form-input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 50" required min={0} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select className="form-input form-select" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                      {["USD", "GBP", "EUR", "PKR", "AED", "CAD", "AUD"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Invoice Notes</label>
                  <input className="form-input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Monthly tuition - July 2026" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Invoice Month</label>
                    <input type="number" className="form-input" value={form.period_month} onChange={e => setForm(p => ({ ...p, period_month: e.target.value }))} min={1} max={12} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Invoice Year</label>
                    <input type="number" className="form-input" value={form.period_year} onChange={e => setForm(p => ({ ...p, period_year: e.target.value }))} min={2024} max={2035} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Payment Method</label>
                  <input className="form-input" value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))} placeholder="Bank transfer, Stripe, cash..." />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>{saving ? "Saving..." : "Add Record"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

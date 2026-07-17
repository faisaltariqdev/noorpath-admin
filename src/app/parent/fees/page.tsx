"use client";
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import ParentStudentSwitcher from "@/components/ParentStudentSwitcher";
import { formatCurrency, formatFeePeriod, formatStudentLevel } from "@/lib/portal";
import { currencyForCountry } from "@/lib/currency";
import { DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface StudentInfo {
  id: string;
  full_name: string;
  level?: string | null;
  course?: string | null;
  country?: string | null;
  currency: string;
}

interface Fee {
  id: string;
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  created_at: string;
  period_month?: number;
  period_year?: number;
  payment_method?: string | null;
  notes?: string | null;
}

const STATUS_CONFIG: Record<string, { badge: string; icon: React.ReactNode; label: string }> = {
  paid:    { badge: "badge badge-green",  icon: <CheckCircle size={14} color="#16a34a" />, label: "Paid" },
  pending: { badge: "badge badge-yellow", icon: <Clock size={14} color="#d97706" />,       label: "Pending" },
  overdue: { badge: "badge badge-red",    icon: <AlertCircle size={14} color="#dc2626" />,  label: "Overdue" },
  waived:  { badge: "badge badge-gray",   icon: <CheckCircle size={14} color="#64748b" />, label: "Waived" },
};

export default function ParentFeesPage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data }, { data: parentProfile }] = await Promise.all([
        supabase
          .from("students")
          .select("id, full_name, level, course, country")
          .eq("parent_id", user.id)
          .eq("is_active", true)
          .order("full_name"),
        supabase.from("profiles").select("country").eq("id", user.id).maybeSingle(),
      ]);
      const parentCountry = parentProfile?.country || "";
      const mapped = (data || []).map((student: any) => {
        const country = student.country || parentCountry || "";
        return {
          id: student.id,
          full_name: student.full_name,
          level: student.level,
          course: student.course,
          country,
          currency: currencyForCountry(country),
        } as StudentInfo;
      });
      setStudents(mapped);
      setSelectedStudentId((current) => current || mapped[0]?.id || "");
      setLoading(false);
    }
    loadStudents();
  }, []);

  useEffect(() => {
    async function loadFees() {
      if (!selectedStudentId) return;
      setLoading(true);
      const { data } = await supabase
        .from("fees")
        .select("id, amount, currency, status, due_date, created_at, period_month, period_year, payment_method, notes")
        .eq("student_id", selectedStudentId)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });
      setFees((data || []) as Fee[]);
      setLoading(false);
    }
    loadFees();
  }, [selectedStudentId]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [selectedStudentId, students]
  );

  const currency = selectedStudent?.currency || "USD";
  const totalPaid = fees.filter(f => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter(f => f.status !== "paid" && f.status !== "waived").reduce((s, f) => s + f.amount, 0);

  return (
    <>
      <TopBar title="Fees & Payments" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Fees & Payments</h1>
        <p className="page-subtitle">Your payment history and pending dues</p>
      </div>
      <div className="page-body">
        <ParentStudentSwitcher
          students={students}
          selectedId={selectedStudentId}
          onChange={setSelectedStudentId}
        />

        {selectedStudent && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {selectedStudent.full_name}
                </div>
                <div style={{ marginTop: 4, fontSize: "0.8rem", color: "#64748b" }}>
                  {formatStudentLevel(selectedStudent.level)}
                  {selectedStudent.course ? ` · ${selectedStudent.course}` : ""}
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Fee records are grouped by invoice month
              </div>
            </div>
          </div>
        )}

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: "Total Paid", value: formatCurrency(totalPaid, currency), icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
            { label: "Amount Due", value: formatCurrency(totalPending, currency), icon: AlertCircle, color: totalPending > 0 ? "#dc2626" : "#16a34a", bg: totalPending > 0 ? "#fee2e2" : "#dcfce7" },
            { label: "Total Records", value: fees.length, icon: DollarSign, color: "#2563eb", bg: "#eff6ff" },
            { label: "Overdue", value: fees.filter(f => f.status === "overdue").length, icon: Clock, color: "#d97706", bg: "#fef9c3" },
          ].map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-icon" style={{ background: c.bg, marginBottom: 12 }}><c.icon size={20} color={c.color} /></div>
              <div className="stat-value" style={{ fontSize: "1.4rem" }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <div className="empty-state"><div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
          ) : fees.length === 0 ? (
            <div className="empty-state"><DollarSign size={40} style={{ opacity: 0.2, margin: "0 auto" }} /><h3>No fee records</h3><p>Your payment records will appear here.</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Invoice</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Payment</th></tr></thead>
              <tbody>
                {fees.map(f => {
                  const cfg = STATUS_CONFIG[f.status] || STATUS_CONFIG.pending;
                  const isOverdue = f.due_date && new Date(f.due_date) < new Date() && f.status === "pending";
                  return (
                    <tr key={f.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{formatFeePeriod(f.period_month, f.period_year)}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>
                          {f.notes || "Monthly tuition invoice"}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(f.amount, currency)}</td>
                      <td style={{ color: isOverdue ? "#dc2626" : "#94a3b8", fontWeight: isOverdue ? 700 : 400 }}>
                        {f.due_date ? new Date(f.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        {isOverdue && " ⚠️"}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {cfg.icon}
                          <span className={cfg.badge}>{cfg.label}</span>
                        </div>
                      </td>
                      <td style={{ color: "#94a3b8" }}>{f.payment_method || (f.status === "paid" ? "Recorded payment" : "Pending" )}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPending > 0 && (
          <div style={{ marginTop: 16, background: "linear-gradient(135deg, #fef9c3, #fffbeb)", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700, color: "#a16207", fontSize: "0.9rem", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                {formatCurrency(totalPending, currency)} payment due
              </div>
              <div style={{ fontSize: "0.78rem", color: "#92400e", marginTop: 3, fontFamily: "var(--font-jakarta), sans-serif" }}>
                Please contact your academy to confirm payment arrangements or request an invoice reminder.
              </div>
            </div>
            <a href="https://wa.me/447700000000" target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-sm">WhatsApp Admin</a>
          </div>
        )}
      </div>
    </>
  );
}

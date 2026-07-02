"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { DollarSign, Clock, CheckCircle, TrendingUp, FileText } from "lucide-react";

interface Earning { id: string; month: string; year: number; total_classes: number; total_hours: number; rate_per_hour: number; total_amount: number; currency: string; status: string; paid_date: string | null; invoice_generated: boolean; }

export default function TutorEarningsPage() {
  const [earnings, setEarnings]   = useState<Earning[]>([]);
  const [sessions, setSessions]   = useState({ completed: 0, totalMinutes: 0 });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: earn }, { data: sess }] = await Promise.all([
        supabase.from("tutor_earnings").select("*").eq("tutor_id", user.id).order("year", { ascending: false }).order("month", { ascending: false }),
        supabase.from("class_sessions").select("status, duration_minutes").eq("tutor_id", user.id),
      ]);
      setEarnings(earn || []);
      const done = (sess || []).filter(s => s.status === "completed");
      setSessions({ completed: done.length, totalMinutes: done.reduce((s, c) => s + (c.duration_minutes || 30), 0) });
      setLoading(false);
    }
    load();
  }, []);

  const totalEarned  = earnings.filter(e => e.status === "paid").reduce((s, e) => s + (e.total_amount || 0), 0);
  const totalPending = earnings.filter(e => e.status === "pending").reduce((s, e) => s + (e.total_amount || 0), 0);
  const hoursWorked  = Math.round(sessions.totalMinutes / 60);

  const STATUS_BADGE: Record<string, string> = { paid: "badge badge-green", pending: "badge badge-yellow", processing: "badge badge-blue" };
  const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <>
      <TopBar title="My Earnings" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Earnings & Salary</h1>
        <p className="page-subtitle">Your payment history and earnings overview</p>
      </div>
      <div className="page-body">
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: "Total Earned",     value: `$${totalEarned.toFixed(0)}`,  icon: DollarSign, color: "#16a34a", bg: "#dcfce7" },
            { label: "Pending Payment",  value: `$${totalPending.toFixed(0)}`, icon: Clock,       color: "#d97706", bg: "#fef9c3" },
            { label: "Classes Done",     value: sessions.completed,             icon: CheckCircle, color: "#1b5e42", bg: "#f0fdf4" },
            { label: "Hours Taught",     value: `${hoursWorked}h`,             icon: TrendingUp,  color: "#7c3aed", bg: "#f5f3ff" },
          ].map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-icon" style={{ background: c.bg, marginBottom: 12 }}><c.icon size={20} color={c.color} /></div>
              <div className="stat-value" style={{ fontSize: "1.5rem" }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title"><FileText size={15} color="#1b5e42" /> Payment History</h3></div>
          {loading
            ? <div className="empty-state"><div style={{ width:36, height:36, border:"3px solid #e2e8f0", borderTopColor:"#1b5e42", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
            : earnings.length === 0
              ? <div className="empty-state"><DollarSign size={40} style={{ opacity:0.2, margin:"0 auto" }} /><h3>No payment records yet</h3><p>Your salary records will appear here once admin processes payments.</p></div>
              : (
                <table className="data-table">
                  <thead><tr><th>Month</th><th>Classes</th><th>Hours</th><th>Rate/hr</th><th>Amount</th><th>Status</th><th>Paid On</th></tr></thead>
                  <tbody>
                    {earnings.map(e => (
                      <tr key={e.id}>
                        <td style={{ fontWeight:600 }}>{MONTHS[+e.month] || e.month} {e.year}</td>
                        <td style={{ color:"#64748b" }}>{e.total_classes || "—"}</td>
                        <td style={{ color:"#64748b" }}>{e.total_hours || "—"}h</td>
                        <td style={{ color:"#64748b" }}>${e.rate_per_hour || "—"}/hr</td>
                        <td style={{ fontWeight:700, color:"#0f172a" }}>{e.currency || "USD"} {(e.total_amount||0).toFixed(0)}</td>
                        <td><span className={STATUS_BADGE[e.status] || "badge badge-gray"}>{e.status}</span></td>
                        <td style={{ color:"#94a3b8" }}>{e.paid_date ? new Date(e.paid_date).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
        </div>

        <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ background:"linear-gradient(135deg,#0f172a,#1b5e42)", borderRadius:16, padding:"20px 24px", color:"#fff" }}>
            <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.5)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Total Paid Sessions</div>
            <div style={{ fontFamily:"var(--font-playfair),Georgia,serif", fontSize:"2rem", fontWeight:700 }}>{sessions.completed}</div>
            <div style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.55)", marginTop:4 }}>classes completed to date</div>
          </div>
          <div style={{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", borderRadius:16, padding:"20px 24px", color:"#fff" }}>
            <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.6)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Total Teaching Time</div>
            <div style={{ fontFamily:"var(--font-playfair),Georgia,serif", fontSize:"2rem", fontWeight:700 }}>{hoursWorked}h</div>
            <div style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.6)", marginTop:4 }}>{sessions.totalMinutes} minutes of Quran teaching</div>
          </div>
        </div>
      </div>
    </>
  );
}

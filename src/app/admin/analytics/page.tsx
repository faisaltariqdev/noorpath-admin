"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, DollarSign, Users, Clock, Globe, AlertTriangle } from "lucide-react";
import { MONTH_NAMES } from "@/lib/portal";

interface MonthlyRevenue {
  month: string;
  revenue: number;
  count: number;
}

interface CountryData {
  country: string;
  students: number;
}

interface LateData {
  week: string;
  lateMinutes: number;
  lateCount: number;
}

interface AttendanceMonthly {
  month: string;
  rate: number;
  present: number;
  total: number;
}

const COLORS = ["#1b5e42", "#c9a84c", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

export default function AnalyticsPage() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [lateData, setLateData] = useState<LateData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceMonthly[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [totalLateMinutes, setTotalLateMinutes] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);

  useEffect(() => {
    async function loadData() {
      const [{ data: fees }, { data: students }, { data: attendance }] = await Promise.all([
        supabase.from("fees").select("amount,currency,status,period_month,period_year,created_at").eq("status", "paid"),
        supabase.from("students").select("id,country,is_active,enrolled_at"),
        supabase.from("attendance").select("id,status,late_minutes,session_date"),
      ]);

      // Monthly Revenue
      const revenueMap: Record<string, { revenue: number; count: number }> = {};
      (fees || []).forEach((f: { amount: number; period_month?: number; period_year?: number; created_at: string }) => {
        const month = f.period_month
          ? `${MONTH_NAMES[f.period_month]} ${f.period_year}`
          : new Date(f.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
        if (!revenueMap[month]) revenueMap[month] = { revenue: 0, count: 0 };
        revenueMap[month].revenue += Number(f.amount || 0);
        revenueMap[month].count += 1;
      });
      const revData = Object.entries(revenueMap).map(([month, d]) => ({ month, ...d }));
      setMonthlyRevenue(revData);
      setTotalRevenue(revData.reduce((s, d) => s + d.revenue, 0));

      // Country Data
      const countryMap: Record<string, { students: number }> = {};
      (students || []).forEach((s: { country?: string }) => {
        const c = s.country || "Unknown";
        if (!countryMap[c]) countryMap[c] = { students: 0 };
        countryMap[c].students += 1;
      });
      const cData = Object.entries(countryMap).map(([country, d]) => ({ country, ...d })).sort((a, b) => b.students - a.students).slice(0, 8);
      setCountryData(cData);
      setActiveStudents((students || []).filter((s: { is_active: boolean }) => s.is_active).length);

      // Attendance Monthly
      const attMap: Record<string, { present: number; total: number }> = {};
      let lateMins = 0;
      (attendance || []).forEach((a: { status: string; late_minutes?: number; session_date?: string }) => {
        const month = a.session_date
          ? new Date(a.session_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
          : "Unknown";
        if (!attMap[month]) attMap[month] = { present: 0, total: 0 };
        attMap[month].total += 1;
        if (a.status === "present") attMap[month].present += 1;
        if (a.status === "late") lateMins += Number(a.late_minutes || 0);
      });
      const attData = Object.entries(attMap).map(([month, d]) => ({
        month, ...d,
        rate: Math.round((d.present / d.total) * 100),
      }));
      setAttendanceData(attData);
      setTotalLateMinutes(lateMins);
      const avgRate = attData.length > 0 ? Math.round(attData.reduce((s, d) => s + d.rate, 0) / attData.length) : 0;
      setAvgAttendance(avgRate);

      // Late data by week (last 8 weeks)
      const lateByWeek: Record<string, { lateMinutes: number; lateCount: number }> = {};
      (attendance || []).forEach((a: { status: string; late_minutes?: number; session_date?: string }) => {
        if (!a.session_date) return;
        const d = new Date(a.session_date);
        const weekNum = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000));
        const weekLabel = `W${weekNum % 100}`;
        if (!lateByWeek[weekLabel]) lateByWeek[weekLabel] = { lateMinutes: 0, lateCount: 0 };
        if (a.status === "late") {
          lateByWeek[weekLabel].lateMinutes += Number(a.late_minutes || 0);
          lateByWeek[weekLabel].lateCount += 1;
        }
      });
      setLateData(Object.entries(lateByWeek).map(([week, d]) => ({ week, ...d })).slice(-8));

      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Analytics & Reports" subtitle="Business insights, revenue trends, and discipline data" />
      <div className="page-content">

        {/* KPI Row */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: "Total Revenue (Paid)", value: `$${totalRevenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: "#1b5e42", bg: "#f0fdf4" },
            { label: "Active Students",      value: activeStudents,                      icon: <Users size={20} />,      color: "#3b82f6", bg: "#eff6ff" },
            { label: "Avg Attendance Rate",  value: `${avgAttendance}%`,                 icon: <TrendingUp size={20} />, color: "#8b5cf6", bg: "#f5f3ff" },
            { label: "Total Late Minutes",   value: totalLateMinutes,                    icon: <Clock size={20} />,      color: "#d97706", bg: "#fffbeb" },
          ].map(kpi => (
            <div key={kpi.label} className="stat-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "var(--radius-sm)", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", color: kpi.color, flexShrink: 0 }}>
                  {kpi.icon}
                </div>
                <div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>{kpi.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Monthly Revenue</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>Paid fees collected per month</p>
            </div>
          </div>
          {monthlyRevenue.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>No paid fees recorded yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                  contentStyle={{ borderRadius: 8, fontSize: "0.82rem", border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="revenue" fill="#1b5e42" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          {/* Attendance Rate Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Attendance Rate</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>Monthly attendance %</p>
              </div>
            </div>
            {attendanceData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>No attendance data.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={attendanceData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, "Attendance"]}
                    contentStyle={{ borderRadius: 8, fontSize: "0.82rem", border: "1px solid #e2e8f0" }}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#1b5e42" strokeWidth={2.5} dot={{ fill: "#1b5e42", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Students by Country */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Students by Country</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>Geographic distribution</p>
              </div>
              <Globe size={18} style={{ color: "var(--muted)" }} />
            </div>
            {countryData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>No country data.</div>
            ) : (
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <PieChart width={140} height={140}>
                  <Pie data={countryData} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="students" paddingAngle={2}>
                    {countryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  {countryData.slice(0, 6).map((c, i) => (
                    <div key={c.country} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: "0.78rem", color: "var(--charcoal)", flex: 1 }}>{c.country}</span>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: COLORS[i % COLORS.length] }}>{c.students}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Late Minutes Analytics */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Discipline Analytics — Late Arrivals</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>Weekly late minutes and late student count</p>
            </div>
            {totalLateMinutes > 60 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef9c3", border: "1px solid #fde047", borderRadius: 999, padding: "4px 12px", fontSize: "0.75rem", color: "#a16207", fontWeight: 600 }}>
                <AlertTriangle size={13} /> {totalLateMinutes} total late minutes
              </div>
            )}
          </div>
          {lateData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
              <Clock size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>No late attendance records found. Great discipline!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={lateData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: "0.82rem", border: "1px solid #e2e8f0" }} />
                <Legend />
                <Bar dataKey="lateMinutes" name="Late Minutes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lateCount" name="Late Count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Student distribution by country */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Student Distribution by Country</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Students</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {countryData.map((c, i) => (
                  <tr key={c.country}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                        {c.country}
                      </div>
                    </td>
                    <td>{c.students}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3 }}>
                          <div style={{
                            height: "100%",
                            width: `${Math.round((c.students / Math.max(...countryData.map(x => x.students))) * 100)}%`,
                            background: COLORS[i % COLORS.length],
                            borderRadius: 3,
                          }} />
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                          {Math.round((c.students / countryData.reduce((s, d) => s + d.students, 0)) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

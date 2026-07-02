"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { DollarSign, Plus, X, Check, TrendingUp, Users, Clock } from "lucide-react";

interface Earning { id: string; tutor_id: string; tutor_name: string; month: string; year: number; total_classes: number; total_hours: number; rate_per_hour: number; total_amount: number; currency: string; status: string; paid_date: string | null; }
interface Tutor   { id: string; full_name: string; }

const MONTHS = [{ v:"01",l:"January"},{v:"02",l:"February"},{v:"03",l:"March"},{v:"04",l:"April"},{v:"05",l:"May"},{v:"06",l:"June"},{v:"07",l:"July"},{v:"08",l:"August"},{v:"09",l:"September"},{v:"10",l:"October"},{v:"11",l:"November"},{v:"12",l:"December"}];
const STATUS_BADGE: Record<string,string> = { paid:"badge badge-green", pending:"badge badge-yellow" };
const MONTH_LABEL: Record<string,string> = Object.fromEntries(MONTHS.map(m=>[m.v,m.l.slice(0,3)]));

export default function AdminEarningsPage() {
  const [earnings, setEarnings]   = useState<Earning[]>([]);
  const [tutors, setTutors]       = useState<Tutor[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [marking, setMarking]     = useState<string|null>(null);
  const [filterStatus, setFilter] = useState("all");
  const now = new Date();
  const [form, setForm] = useState({
    tutor_id: "", month: String(now.getMonth()+1).padStart(2,"0"),
    year: now.getFullYear(), total_classes: "", total_hours: "",
    rate_per_hour: "10", currency: "USD",
  });

  async function load() {
    setLoading(true);
    const [{ data: earn }, { data: tuts }] = await Promise.all([
      supabase.from("tutor_earnings").select("*, tutor:profiles(full_name)").order("year",{ascending:false}).order("month",{ascending:false}),
      supabase.from("profiles").select("id, full_name").eq("role","tutor").eq("is_active",true),
    ]);
    setEarnings((earn||[]).map((e:any)=>({...e, month: String(e.month).padStart(2, "0"), tutor_name: e.tutor?.full_name||"—"})));
    setTutors(tuts||[]);
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  const total_amount_computed = () => {
    const h = parseFloat(form.total_hours)||0;
    const r = parseFloat(form.rate_per_hour)||0;
    return (h * r).toFixed(2);
  };

  async function addEarning(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const total_amount = parseFloat(total_amount_computed());
    await supabase.from("tutor_earnings").insert({
      tutor_id: form.tutor_id, month: parseInt(form.month), year: form.year,
      total_classes: parseInt(form.total_classes)||0,
      total_hours: parseFloat(form.total_hours)||0,
      rate_per_hour: parseFloat(form.rate_per_hour)||0,
      total_amount, currency: form.currency, status: "pending",
    });
    setSaving(false);
    setShowForm(false);
    await load();
  }

  async function markPaid(id: string) {
    setMarking(id);
    await supabase.from("tutor_earnings").update({ status:"paid", paid_date: new Date().toISOString(), invoice_generated: true }).eq("id",id);
    setEarnings(p=>p.map(e=>e.id===id?{...e,status:"paid",paid_date:new Date().toISOString()}:e));
    setMarking(null);
  }

  const display = filterStatus==="all" ? earnings : earnings.filter(e=>e.status===filterStatus);
  const totalPaid    = earnings.filter(e=>e.status==="paid").reduce((s,e)=>s+(e.total_amount||0),0);
  const totalPending = earnings.filter(e=>e.status==="pending").reduce((s,e)=>s+(e.total_amount||0),0);
  const totalTutors  = [...new Set(earnings.map(e=>e.tutor_id))].length;

  return (
    <>
      <TopBar title="Tutor Earnings" />
      <div className="page-header" style={{ paddingTop:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div><h1 className="page-title">Tutor Earnings</h1><p className="page-subtitle">Manage and process tutor salary payments</p></div>
          <button className="btn btn-primary" onClick={()=>setShowForm(true)}><Plus size={15} /> Add Payment Record</button>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-grid" style={{ marginBottom:20 }}>
          {[
            { label:"Total Paid Out",    value:`$${totalPaid.toFixed(0)}`,    icon:DollarSign, color:"#16a34a", bg:"#dcfce7" },
            { label:"Pending Payments",  value:`$${totalPending.toFixed(0)}`, icon:Clock,      color:"#d97706", bg:"#fef9c3" },
            { label:"Active Tutors",     value:totalTutors,                   icon:Users,      color:"#1b5e42", bg:"#f0fdf4" },
            { label:"Total Records",     value:earnings.length,               icon:TrendingUp, color:"#7c3aed", bg:"#f5f3ff" },
          ].map(c=>(
            <div key={c.label} className="stat-card">
              <div className="stat-icon" style={{ background:c.bg, marginBottom:12 }}><c.icon size={20} color={c.color} /></div>
              <div className="stat-value" style={{ fontSize:"1.5rem" }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
          {["all","pending","paid"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`btn btn-sm ${filterStatus===s?"btn-primary":"btn-ghost"}`} style={{ textTransform:"capitalize" }}>{s} {s!=="all"&&`(${earnings.filter(e=>e.status===s).length})`}</button>
          ))}
        </div>

        <div className="card">
          {loading
            ? <div className="empty-state"><div style={{ width:36, height:36, border:"3px solid #e2e8f0", borderTopColor:"#1b5e42", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
            : display.length===0
              ? <div className="empty-state"><DollarSign size={40} style={{ opacity:.2, margin:"0 auto" }} /><h3>No earning records</h3><p>Add tutor payment records to track salary.</p></div>
              : (
                <table className="data-table">
                  <thead><tr><th>Tutor</th><th>Month</th><th>Classes</th><th>Hours</th><th>Rate</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {display.map(e=>(
                      <tr key={e.id}>
                        <td><div style={{ display:"flex", alignItems:"center", gap:9 }}><div className="avatar" style={{ width:28, height:28, fontSize:"0.7rem" }}>{e.tutor_name.charAt(0)}</div><span style={{ fontWeight:600 }}>{e.tutor_name}</span></div></td>
                        <td style={{ color:"#64748b" }}>{MONTH_LABEL[e.month]||e.month} {e.year}</td>
                        <td style={{ color:"#64748b" }}>{e.total_classes||"—"}</td>
                        <td style={{ color:"#64748b" }}>{e.total_hours||"—"}h</td>
                        <td style={{ color:"#64748b" }}>${e.rate_per_hour||"—"}/hr</td>
                        <td style={{ fontWeight:700, color:"#0f172a" }}>{e.currency||"USD"} {(e.total_amount||0).toFixed(0)}</td>
                        <td><span className={STATUS_BADGE[e.status]||"badge badge-gray"}>{e.status}</span></td>
                        <td>
                          <div style={{ display:"flex", gap:6 }}>
                            {e.status!=="paid" && <button onClick={()=>markPaid(e.id)} className="btn btn-outline btn-xs" disabled={marking===e.id} title="Mark Paid"><Check size={12} /> {marking===e.id?"...":"Pay"}</button>}
                            {e.status==="paid" && <span style={{ color:"#16a34a", fontSize:"0.75rem", fontWeight:600 }}>✓ Paid {e.paid_date?new Date(e.paid_date).toLocaleDateString("en-GB",{day:"numeric",month:"short"}):""}</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
        </div>

        {showForm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:460, overflow:"hidden" }}>
              <div style={{ background:"linear-gradient(135deg,#0f172a,#1b5e42)", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <h2 style={{ color:"#fff", fontFamily:"var(--font-playfair),Georgia,serif", fontSize:"1rem", fontWeight:700, margin:0 }}>Add Earning Record</h2>
                <button onClick={()=>setShowForm(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer" }}><X size={20} /></button>
              </div>
              <form onSubmit={addEarning} style={{ padding:24 }}>
                <div className="form-group">
                  <label className="form-label">Tutor *</label>
                  <select className="form-input form-select" value={form.tutor_id} onChange={e=>setForm(p=>({...p,tutor_id:e.target.value}))} required>
                    <option value="">Select Tutor</option>
                    {tutors.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div className="form-group">
                    <label className="form-label">Month *</label>
                    <select className="form-input form-select" value={form.month} onChange={e=>setForm(p=>({...p,month:e.target.value}))}>
                      {MONTHS.map(m=><option key={m.v} value={m.v}>{m.l}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year *</label>
                    <select className="form-input form-select" value={form.year} onChange={e=>setForm(p=>({...p,year:+e.target.value}))}>
                      {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Classes</label>
                    <input type="number" className="form-input" value={form.total_classes} onChange={e=>setForm(p=>({...p,total_classes:e.target.value}))} placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Hours *</label>
                    <input type="number" className="form-input" value={form.total_hours} onChange={e=>setForm(p=>({...p,total_hours:e.target.value}))} placeholder="0.0" step="0.5" min="0" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rate / Hour ($) *</label>
                    <input type="number" className="form-input" value={form.rate_per_hour} onChange={e=>setForm(p=>({...p,rate_per_hour:e.target.value}))} placeholder="10" min="0" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select className="form-input form-select" value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))}>
                      {["USD","GBP","EUR","PKR","AED"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ background:"#f0fdf4", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"0.82rem", color:"#64748b", fontFamily:"var(--font-jakarta),sans-serif" }}>Calculated Total:</span>
                  <span style={{ fontWeight:800, fontSize:"1.2rem", color:"#1b5e42", fontFamily:"var(--font-playfair),Georgia,serif" }}>{form.currency} {total_amount_computed()}</span>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button type="button" className="btn btn-ghost" onClick={()=>setShowForm(false)} style={{ flex:1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex:1, justifyContent:"center" }}>{saving?"Adding...":"Add Record"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

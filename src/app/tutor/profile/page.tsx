"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { User, Save, Lock, Check, Eye, EyeOff } from "lucide-react";

interface Profile { id: string; full_name: string; email: string; phone: string; whatsapp: string; country: string; timezone: string; role: string; }

export default function AdminProfilePage() {
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [tab, setTab]             = useState<"profile"|"password">("profile");
  const [pwForm, setPwForm]       = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw]       = useState({ current:false, new:false, confirm:false });
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwSaved, setPwSaved]     = useState(false);
  const [pwError, setPwError]     = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: profile.full_name, phone: profile.phone, whatsapp: profile.whatsapp, country: profile.country, timezone: profile.timezone, updated_at: new Date().toISOString() }).eq("id", profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (pwForm.newPw !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    if (pwForm.newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
    setPwSaving(false);
    if (error) { setPwError(error.message); return; }
    setPwForm({ current:"", newPw:"", confirm:"" });
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 3000);
  }

  const TIMEZONES = ["UTC","Europe/London","Europe/Paris","America/New_York","America/Chicago","America/Los_Angeles","Asia/Karachi","Asia/Dubai","Asia/Riyadh","Asia/Kolkata","Australia/Sydney"];
  const COUNTRIES  = ["Pakistan","United Kingdom","United States","Canada","Australia","UAE","Saudi Arabia","Qatar","Germany","France","India","Other"];

  if (loading) return <div className="empty-state" style={{ marginTop:80 }}><div style={{ width:36, height:36, border:"3px solid #e2e8f0", borderTopColor:"#1b5e42", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <>
      <TopBar title="My Profile" />
      <div className="page-header" style={{ paddingTop:24 }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account information and security</p>
      </div>
      <div className="page-body">
        <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:20, alignItems:"start" }}>
          {/* Left — Avatar + role */}
          <div className="card" style={{ textAlign:"center", padding:"28px 20px" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#1b5e42,#c9a84c)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:"2rem", fontFamily:"var(--font-playfair),Georgia,serif", fontWeight:800, color:"#fff" }}>
              {profile?.full_name?.charAt(0)||"?"}
            </div>
            <div style={{ fontFamily:"var(--font-playfair),Georgia,serif", fontSize:"0.95rem", fontWeight:700, color:"#0f172a", marginBottom:4 }}>{profile?.full_name}</div>
            <div style={{ fontSize:"0.75rem" }}><span className={`badge badge-${profile?.role==="admin"?"gold":profile?.role==="tutor"?"blue":"green"}`} style={{ textTransform:"capitalize" }}>{profile?.role}</span></div>
            <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:6 }}>
              {(["profile","password"] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{ width:"100%", padding:"9px 12px", borderRadius:9, border:"none", background: tab===t?"#f0fdf4":"transparent", color: tab===t?"#1b5e42":"#64748b", fontWeight: tab===t?700:500, fontSize:"0.83rem", cursor:"pointer", fontFamily:"var(--font-jakarta),sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                  {t==="profile"?<User size={14}/>:<Lock size={14}/>} {t==="profile"?"Profile Info":"Change Password"}
                </button>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          {tab==="profile" ? (
            <div className="card">
              <div className="card-header"><h3 className="card-title"><User size={15} color="#1b5e42" /> Profile Information</h3></div>
              <div className="card-body">
                <form onSubmit={saveProfile}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input className="form-input" value={profile?.full_name||""} onChange={e=>setProfile(p=>p?{...p,full_name:e.target.value}:p)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input className="form-input" value={profile?.email||""} disabled style={{ opacity:.6, cursor:"not-allowed" }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" value={profile?.phone||""} onChange={e=>setProfile(p=>p?{...p,phone:e.target.value}:p)} placeholder="+44..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">WhatsApp</label>
                      <input className="form-input" value={profile?.whatsapp||""} onChange={e=>setProfile(p=>p?{...p,whatsapp:e.target.value}:p)} placeholder="+44..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <select className="form-input form-select" value={profile?.country||""} onChange={e=>setProfile(p=>p?{...p,country:e.target.value}:p)}>
                        <option value="">Select Country</option>
                        {COUNTRIES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Timezone</label>
                      <select className="form-input form-select" value={profile?.timezone||"UTC"} onChange={e=>setProfile(p=>p?{...p,timezone:e.target.value}:p)}>
                        {TIMEZONES.map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop:8 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saved?<><Check size={14} /> Saved!</>:saving?"Saving...":<><Save size={14} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header"><h3 className="card-title"><Lock size={15} color="#1b5e42" /> Change Password</h3></div>
              <div className="card-body">
                <form onSubmit={changePassword} style={{ maxWidth:420 }}>
                  {(["new","confirm"] as const).map(k=>(
                    <div key={k} className="form-group">
                      <label className="form-label">{k==="new"?"New Password":"Confirm New Password"} *</label>
                      <div style={{ position:"relative" }}>
                        <input type={showPw[k]?"text":"password"} className="form-input" value={pwForm[k==="new"?"newPw":"confirm"]} onChange={e=>setPwForm(p=>({...p,[k==="new"?"newPw":"confirm"]:e.target.value}))} placeholder={k==="new"?"Min 8 characters":"Repeat new password"} required style={{ paddingRight:44 }} />
                        <button type="button" onClick={()=>setShowPw(p=>({...p,[k]:!p[k]}))} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#94a3b8" }}>
                          {showPw[k]?<EyeOff size={16}/>:<Eye size={16}/>}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwError && <div style={{ background:"#fee2e2", color:"#b91c1c", borderRadius:8, padding:"10px 14px", fontSize:"0.82rem", marginBottom:16 }}>{pwError}</div>}
                  {pwSaved && <div style={{ background:"#dcfce7", color:"#15803d", borderRadius:8, padding:"10px 14px", fontSize:"0.82rem", marginBottom:16, display:"flex", alignItems:"center", gap:6 }}><Check size={14}/>Password changed successfully!</div>}
                  <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:"0.78rem", color:"#64748b", lineHeight:1.6 }}>
                    Password must be at least 8 characters with a mix of letters, numbers, and symbols for best security.
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                    <Lock size={14}/> {pwSaving?"Changing...":"Change Password"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

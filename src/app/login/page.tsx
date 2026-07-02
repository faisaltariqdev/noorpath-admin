"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, BookOpen, Heart } from "lucide-react";

type Role = "admin" | "tutor" | "parent";

const ROLES: { id: Role; label: string; subtitle: string; icon: React.ReactNode; color: string; border: string; bg: string }[] = [
  { id: "admin",  label: "Admin",  subtitle: "Full control panel",  icon: <ShieldCheck size={22} />, color: "#c9a84c", border: "rgba(201,168,76,0.6)",  bg: "rgba(201,168,76,0.1)" },
  { id: "tutor",  label: "Tutor",  subtitle: "Manage your classes", icon: <BookOpen size={22} />,   color: "#3b82f6", border: "rgba(59,130,246,0.6)",  bg: "rgba(59,130,246,0.08)" },
  { id: "parent", label: "Parent", subtitle: "Track your child",    icon: <Heart size={22} />,      color: "#22c55e", border: "rgba(34,197,94,0.6)",   bg: "rgba(34,197,94,0.08)" },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRole) { setError("Please select your role first."); return; }
    setLoading(true);
    setError("");

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) {
        setError(authErr.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : authErr.message);
        setLoading(false);
        return;
      }

      // Role from user_metadata (set at account creation) - no DB query needed
      const metaRole = data.user?.user_metadata?.role as Role | undefined;

      // Fallback: try profiles table with authenticated session
      let actualRole: Role = metaRole || selectedRole;
      if (!metaRole) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
        if (profile?.role) actualRole = profile.role as Role;
      }

      router.replace(`/${actualRole}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1a2744 50%, #0f2718 100%)",
      padding: "24px 16px", fontFamily: "var(--font-jakarta), sans-serif",
    }}>
      {/* bg rings */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.06)", top: -200, right: -200 }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(27,94,66,0.1)", bottom: -100, left: -100 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 460, background: "#fff", borderRadius: 24, boxShadow: "0 24px 80px rgba(0,0,0,0.4)", overflow: "hidden" }}>
        <div style={{ height: 4, background: "linear-gradient(90deg, #1b5e42, #c9a84c)" }} />

        <div style={{ padding: "36px 40px 40px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Image src="/favicon.png" alt="NoorPath" width={44} height={44} style={{ borderRadius: 11, boxShadow: "0 4px 14px rgba(27,94,66,0.25)" }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.5px" }}>
                  <span style={{ color: "#1b5e42" }}>Noor</span><span style={{ color: "#c9a84c" }}>Path</span>
                </div>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>Academy Portal</div>
              </div>
            </div>
            <h1 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "#0f172a", margin: "0 0 5px" }}>Sign in to your account</h1>
            <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>Select your role and enter your credentials</p>
          </div>

          {/* Role Selector */}
          <div style={{ marginBottom: 22 }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>I am logging in as</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {ROLES.map(r => (
                <button key={r.id} type="button" onClick={() => { setSelectedRole(r.id); setError(""); }} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "14px 8px 12px", borderRadius: 12, cursor: "pointer",
                  border: selectedRole === r.id ? `2px solid ${r.border}` : "2px solid #e2e8f0",
                  background: selectedRole === r.id ? r.bg : "transparent",
                  transition: "all 0.18s ease", gap: 7,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: selectedRole === r.id ? r.color : "#f1f5f9", color: selectedRole === r.id ? "#fff" : "#94a3b8", transition: "all 0.18s" }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: selectedRole === r.id ? "#0f172a" : "#64748b" }}>{r.label}</div>
                    <div style={{ fontSize: "0.63rem", color: "#94a3b8", marginTop: 1 }}>{r.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "11px 14px", fontSize: "0.8rem", color: "#b91c1c", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0 }}>⚠️</span> {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="your@email.com" style={{ paddingLeft: 40 }} required />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 22 }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="form-input" placeholder="••••••••" style={{ paddingLeft: 40, paddingRight: 44 }} required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !selectedRole} style={{ width: "100%", justifyContent: "center", opacity: (!selectedRole || loading) ? 0.65 : 1, cursor: (!selectedRole || loading) ? "not-allowed" : "pointer" }}>
              {loading ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Signing in...</>
                : selectedRole ? `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                : "Select a role to continue"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>🔒 Secure access · NoorPath Academy &copy; 2025</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

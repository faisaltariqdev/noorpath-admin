"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.session) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.session.user.id)
      .single();

    if (profile?.role === "admin") router.replace("/admin");
    else if (profile?.role === "tutor") router.replace("/tutor");
    else router.replace("/parent");
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #1b5e42 100%)" }}>
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "rgba(255,255,255,0.1)" }}>
            <BookOpen size={32} color="#c9a84c" />
          </div>
          <h1 className="text-2xl font-bold text-white">NoorPath Academy</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            Admin · Tutor · Parent Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold mb-1" style={{ color: "#1a1a2e" }}>Sign In</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your credentials to access your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-200">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-6">
            Contact admin if you don&apos;t have access.
          </p>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.4)" }}>
          © 2026 NoorPath Academy · Secure Portal
        </p>
      </div>
    </div>
  );
}

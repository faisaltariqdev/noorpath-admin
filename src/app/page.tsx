"use client";
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { parseRole, withTimeout } from "@/lib/auth-session";
import { supabase } from "@/lib/supabase";

export default function Home() {
  useEffect(() => {
    let cancelled = false;
    const go = (path: string) => {
      if (!cancelled) window.location.replace(path);
    };

    const timeout = window.setTimeout(() => go("/login"), 4000);

    void (async () => {
      const result = await withTimeout(supabase.auth.getSession(), 2500);
      if (cancelled) return;
      const session = result?.data.session;
      if (!session) {
        go("/login");
        return;
      }

      const metaRole = parseRole(session.user.user_metadata?.role);
      if (metaRole) {
        go(`/${metaRole}`);
        return;
      }

      const profile = await withTimeout(
        supabase.from("profiles").select("role").eq("id", session.user.id).single(),
        2000,
      );
      if (cancelled) return;
      const role = parseRole(profile?.data?.role) || "parent";
      go(`/${role}`);
    })().finally(() => window.clearTimeout(timeout));

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "3px solid #1b5e42", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 500 }}>Loading NoorPath Academy...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

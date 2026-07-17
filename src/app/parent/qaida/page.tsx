"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import ParentQaidaDashboard from "@/features/noorani-qaida/screens/ParentDashboard";
import { qaidaFontVariables } from "@/features/noorani-qaida/fonts";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";

export default function ParentQaidaPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAllowed(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("qaida_enabled")
        .eq("id", user.id)
        .maybeSingle();
      setAllowed(Boolean(data?.qaida_enabled));
    }
    checkAccess();
  }, []);

  if (allowed === null) {
    return (
      <>
        <TopBar title="Noorani Qaida" />
        <div className="empty-state" style={{ marginTop: 80 }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#1b5e42", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </>
    );
  }

  if (!allowed) {
    return (
      <>
        <TopBar title="Noorani Qaida" />
        <div className="page-body">
          <div className="empty-state" style={{ marginTop: 60 }}>
            <BookOpen size={40} style={{ opacity: 0.2, margin: "0 auto" }} />
            <h3>Noorani Qaida is not enabled</h3>
            <p>Ask the academy admin to allow Qaida access for your account.</p>
            <Link href="/parent" className="btn btn-primary" style={{ marginTop: 12 }}>Back to dashboard</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={qaidaFontVariables}>
      <ParentQaidaDashboard />
    </div>
  );
}

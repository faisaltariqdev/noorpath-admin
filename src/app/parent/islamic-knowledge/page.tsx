"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BookMarked } from "lucide-react";
import { supabase } from "@/lib/supabase";

const IslamicKnowledgeShell = dynamic(
  () => import("@/features/islamic-knowledge/layout/IslamicKnowledgeShell"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(165deg, #eefaf4, #fff9f0)",
          fontWeight: 800,
          color: "#0a6e4f",
        }}
      >
        📖 Loading Islamic Knowledge…
      </div>
    ),
  },
);

export default function ParentIslamicKnowledgePage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAllowed(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("islamic_knowledge_enabled")
        .eq("id", user.id)
        .maybeSingle();
      setAllowed(Boolean(data?.islamic_knowledge_enabled));
    }
    void checkAccess();
  }, []);

  if (allowed === null) {
    return (
      <div
        style={{
          height: "100dvh",
          display: "grid",
          placeItems: "center",
          fontWeight: 700,
          color: "#0a6e4f",
        }}
      >
        Checking access…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex h-[100dvh] min-h-[100svh] items-center justify-center bg-emerald-50 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <BookMarked size={40} style={{ opacity: 0.25, margin: "0 auto 12px" }} />
          <h1 className="text-xl font-black text-slate-900">Islamic Knowledge is not enabled</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ask the academy admin to allow Islamic Knowledge for your account in Permissions.
          </p>
          <Link
            href="/parent"
            className="mt-5 inline-flex rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            Back to parent portal
          </Link>
        </div>
      </div>
    );
  }

  return <IslamicKnowledgeShell surface="parent" />;
}

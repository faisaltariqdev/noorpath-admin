"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Book } from "lucide-react";
import { supabase } from "@/lib/supabase";

const HolyQuranShell = dynamic(
  () => import("@/features/holy-quran/layout/HolyQuranShell"),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: "100dvh", display: "grid", placeItems: "center", fontWeight: 800, color: "#0f5c44" }}>
        Loading Holy Quran…
      </div>
    ),
  },
);

export default function ParentHolyQuranPage() {
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
        .select("holy_quran_enabled")
        .eq("id", user.id)
        .maybeSingle();
      setAllowed(Boolean(data?.holy_quran_enabled));
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
          <Book size={40} style={{ opacity: 0.25, margin: "0 auto 12px" }} />
          <h1 className="text-xl font-black text-slate-900">Holy Quran is not enabled</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ask the academy admin to allow Holy Quran for your account in Permissions. The public reader stays free on noorpath.online.
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

  return <HolyQuranShell surface="parent" />;
}

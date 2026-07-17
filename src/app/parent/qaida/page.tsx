"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import QaidaLoader from "@/features/noorani-qaida/ui/QaidaLoader";
import { supabase } from "@/lib/supabase";

const QaidaShell = dynamic(() => import("@/features/noorani-qaida/layout/QaidaShell"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});

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
    return <QaidaLoader />;
  }

  if (!allowed) {
    return (
      <div className="flex h-[100dvh] min-h-[100svh] items-center justify-center bg-emerald-50 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <BookOpen size={40} style={{ opacity: 0.25, margin: "0 auto 12px" }} />
          <h1 className="text-xl font-black text-slate-900">Noorani Qaida is not enabled</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ask the academy admin to allow Qaida access for your account in Permissions.
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

  return <QaidaShell />;
}

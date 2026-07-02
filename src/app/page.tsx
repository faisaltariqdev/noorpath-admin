"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()
        .then(({ data }) => {
          if (data?.role === "admin") router.replace("/admin");
          else if (data?.role === "tutor") router.replace("/tutor");
          else router.replace("/parent");
        });
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading NoorPath...</p>
      </div>
    </div>
  );
}

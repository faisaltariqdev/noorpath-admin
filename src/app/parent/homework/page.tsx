"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/PortalUI";
import TopBar from "@/components/TopBar";

export default function ParentHomeworkRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/parent?section=homework&child=all");
  }, [router]);
  return (
    <>
      <TopBar title="Homework" />
      <div className="page-body"><LoadingState label="Opening Family Hub…" /></div>
    </>
  );
}

"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/PortalUI";
import TopBar from "@/components/TopBar";

export default function ParentAttendanceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/parent?section=attendance&child=all");
  }, [router]);
  return (
    <>
      <TopBar title="Attendance" />
      <div className="page-body"><LoadingState label="Opening Family Hub…" /></div>
    </>
  );
}

"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { LoadingState } from "@/components/ui/PortalUI";

export default function AdminMessagesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/announcements");
  }, [router]);
  return (
    <>
      <TopBar title="Announcements" />
      <div className="page-body"><LoadingState label="Opening Announcement Center…" /></div>
    </>
  );
}

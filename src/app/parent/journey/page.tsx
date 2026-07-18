"use client";
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { LoadingState } from "@/components/ui/PortalUI";

export default function ParentJourneyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/parent?section=progress&child=all");
  }, [router]);
  return (
    <>
      <TopBar title="Progress" />
      <div className="page-body"><LoadingState label="Opening Family Hub…" /></div>
    </>
  );
}

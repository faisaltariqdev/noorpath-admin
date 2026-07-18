"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import TopBar from "@/components/TopBar";
import { LoadingState } from "@/components/ui/PortalUI";
import FamilyHub from "@/features/parent-hub/FamilyHub";

function HubFallback() {
  return (
    <>
      <TopBar title="Family Hub" />
      <div className="page-body">
        <LoadingState label="Loading family dashboard…" />
      </div>
    </>
  );
}

export default function ParentDashboard() {
  return (
    <Suspense fallback={<HubFallback />}>
      <FamilyHub />
    </Suspense>
  );
}

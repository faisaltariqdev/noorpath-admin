"use client";

import TopBar from "@/components/TopBar";
import PeopleDirectory from "@/features/people/PeopleDirectory";

export const dynamic = "force-dynamic";

export default function ParentsPage() {
  return (
    <>
      <TopBar title="Parents" subtitle="Guardians and family accounts" />
      <main className="portal-page">
        <PeopleDirectory role="parent" />
      </main>
    </>
  );
}

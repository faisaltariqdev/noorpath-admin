"use client";

import TopBar from "@/components/TopBar";
import PeopleDirectory from "@/features/people/PeopleDirectory";

export const dynamic = "force-dynamic";

export default function TeachersPage() {
  return (
    <>
      <TopBar title="Teachers" subtitle="People and teaching capacity" />
      <main className="portal-page">
        <PeopleDirectory role="tutor" />
      </main>
    </>
  );
}

"use client";
import dynamic from "next/dynamic";
import QaidaLoader from "@/features/noorani-qaida/ui/QaidaLoader";

const QaidaShell = dynamic(() => import("@/features/noorani-qaida/layout/QaidaShell"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});

export default function QaidaPreviewClient({ enrolUrl }: { enrolUrl?: string }) {
  return <QaidaShell preview enrolUrl={enrolUrl} />;
}

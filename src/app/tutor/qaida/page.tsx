import type { Metadata } from "next";
import dynamic from "next/dynamic";
import QaidaLoader from "@/features/noorani-qaida/ui/QaidaLoader";
import QaidaErrorBoundary from "@/features/noorani-qaida/ui/QaidaErrorBoundary";

export const metadata: Metadata = {
  title: "Noorani Qaida — Teacher",
  description: "Interactive Noorani Qaida learning platform for teachers and students.",
  robots: "noindex",
};

const QaidaShell = dynamic(() => import("@/features/noorani-qaida/layout/QaidaShell"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});

export default function TeacherQaidaPage() {
  return (
    <QaidaErrorBoundary>
      <QaidaShell />
    </QaidaErrorBoundary>
  );
}

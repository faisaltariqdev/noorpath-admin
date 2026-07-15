import type { Metadata } from "next";
import dynamic from "next/dynamic";
import QaidaLoader from "@/features/noorani-qaida/ui/QaidaLoader";

export const metadata: Metadata = {
  title: "Noorani Qaida — NoorPath Admin",
  description: "Interactive Noorani Qaida learning platform for children.",
  robots: "noindex",
};

const QaidaShell = dynamic(() => import("@/features/noorani-qaida/layout/QaidaShell"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});

export default function NooraniQaidaPage() {
  return <QaidaShell />;
}

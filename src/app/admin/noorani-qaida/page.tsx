import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Noorani Qaida — NoorPath Admin",
  description: "Interactive Noorani Qaida learning platform for children.",
  robots: "noindex",
};

const QaidaShell = dynamic(() => import("@/features/noorani-qaida/layout/QaidaShell"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50">
      <div className="text-center">
        <div className="text-6xl animate-pulse" style={{ fontFamily: "serif" }}>ن</div>
        <div className="mt-3 text-sm text-gray-500">Loading Noorani Qaida…</div>
      </div>
    </div>
  ),
});

export default function NooraniQaidaPage() {
  return <QaidaShell />;
}

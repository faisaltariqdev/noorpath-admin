import type { Metadata } from "next";
import ParentQaidaDashboard from "@/features/noorani-qaida/screens/ParentDashboard";

export const metadata: Metadata = {
  title: "Qaida Progress — Parent Dashboard",
  robots: "noindex",
};

export default function ParentQaidaPage() {
  return <ParentQaidaDashboard />;
}

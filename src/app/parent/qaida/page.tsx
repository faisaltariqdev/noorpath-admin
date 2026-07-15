import type { Metadata } from "next";
import ParentQaidaDashboard from "@/features/noorani-qaida/screens/ParentDashboard";
import { qaidaFontVariables } from "@/features/noorani-qaida/fonts";

export const metadata: Metadata = {
  title: "Qaida Progress — Parent Dashboard",
  robots: "noindex",
};

export default function ParentQaidaPage() {
  return (
    <div className={qaidaFontVariables}>
      <ParentQaidaDashboard />
    </div>
  );
}

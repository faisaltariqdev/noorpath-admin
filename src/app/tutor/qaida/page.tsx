import type { Metadata } from "next";
import { qaidaFontVariables } from "@/features/noorani-qaida/fonts";
import TutorDashboard from "@/features/noorani-qaida/screens/TutorDashboard";

export const metadata: Metadata = {
  title: "Qaida Insights — Teacher Dashboard",
  robots: "noindex",
};

export default function TeacherQaidaPage() {
  return (
    <div className={qaidaFontVariables}>
      <TutorDashboard />
    </div>
  );
}

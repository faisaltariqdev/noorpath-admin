import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Holy Quran — NoorPath",
  description: "Read the Holy Quran in 30 Paras with verified Tanzil Uthmani Arabic, recitation, Knowledge Q&A, and beginner reading guidance.",
};

const HolyQuranShell = dynamic(
  () => import("@/features/holy-quran/layout/HolyQuranShell"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(165deg, #eef7f2, #f8f4ea)",
          fontWeight: 800,
          color: "#0f5c44",
        }}
      >
        Loading Holy Quran…
      </div>
    ),
  },
);

export default function HolyQuranPage() {
  return <HolyQuranShell surface="admin" />;
}

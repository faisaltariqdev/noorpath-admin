import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Islamic Knowledge for Kids — NoorPath",
  description:
    "Interactive Islamic learning for children ages 3–12: Who is Allah, Five Pillars, duas, manners, and more. Separate from Noorani Qaida.",
  keywords: [
    "Who is Allah for Kids",
    "Islam for Children",
    "Islamic Learning for Kids",
    "Islamic Quiz for Children",
    "Learn Islam Online",
    "Kids Islamic Course",
    "Interactive Islamic Learning",
    "Basic Islam for Kids",
    "Muslim Kids Learning",
  ],
};

const IslamicKnowledgeShell = dynamic(
  () => import("@/features/islamic-knowledge/layout/IslamicKnowledgeShell"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(165deg, #eefaf4, #fff9f0)",
          fontWeight: 800,
          color: "#0a6e4f",
          fontSize: "1.2rem",
        }}
      >
        📖 Loading Islamic Knowledge…
      </div>
    ),
  },
);

export default function IslamicKnowledgePage() {
  return <IslamicKnowledgeShell />;
}

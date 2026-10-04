import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Islamic Knowledge preview (dev only)",
  robots: "noindex, nofollow",
};

const IslamicKnowledgeShell = dynamic(
  () => import("@/features/islamic-knowledge/layout/IslamicKnowledgeShell"),
  { ssr: false },
);

/** Local-only harness for reviewing Islamic Knowledge without signing in. 404 in production. */
export default function IslamicKnowledgePreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <IslamicKnowledgeShell surface="admin" />;
}

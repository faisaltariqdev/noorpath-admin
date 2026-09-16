import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import NamazPreviewClient from "./NamazPreviewClient";

export const metadata: Metadata = {
  title: "Namaz lesson preview (dev only)",
  robots: "noindex, nofollow",
};

/**
 * Local-only harness for reviewing the Namaz / Wudu posture lessons without
 * signing in. Returns 404 in production builds.
 */
export default function NamazPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={null}>
      <NamazPreviewClient />
    </Suspense>
  );
}

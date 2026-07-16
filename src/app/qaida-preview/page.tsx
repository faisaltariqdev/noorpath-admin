import type { Metadata } from "next";
import QaidaPreviewClient from "./QaidaPreviewClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Interactive Noorani Qaida — Free Preview | NoorPath",
  description:
    "Try the Alif lesson from NoorPath's interactive Noorani Qaida — listen, trace, play games and see how children learn Arabic letters before you enrol.",
  robots: "noindex",
};

const ENROL_URL = "https://www.noorpath.online/courses/noorani-qaida-online";

export default function QaidaPreviewPage() {
  return <QaidaPreviewClient enrolUrl={ENROL_URL} />;
}

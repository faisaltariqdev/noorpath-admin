import { Amiri, Fredoka, Nunito } from "next/font/google";

const display = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-qaida-display",
  display: "swap",
});

const body = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-qaida-body",
  display: "swap",
});

const arabic = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-qaida-arabic",
  display: "swap",
});

/**
 * Full-screen layout — intentionally bypasses admin sidebar/chrome.
 * The Qaida module has its own navigation shell.
 */
export default function NooraniQaidaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${display.variable} ${body.variable} ${arabic.variable} qaida-root h-screen overflow-hidden`}
    >
      {children}
    </div>
  );
}

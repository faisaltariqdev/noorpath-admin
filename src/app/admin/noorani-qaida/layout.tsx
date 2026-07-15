import { qaidaFontVariables } from "@/features/noorani-qaida/fonts";

/**
 * Full-screen layout — intentionally bypasses admin sidebar/chrome.
 * The Qaida module has its own navigation shell.
 */
export default function NooraniQaidaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${qaidaFontVariables} qaida-root h-[100dvh] min-h-[100svh] overflow-hidden`}
    >
      <a className="qaida-skip" href="#qaida-main">Skip to learning content</a>
      {children}
    </div>
  );
}

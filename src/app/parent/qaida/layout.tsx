import { qaidaFontVariables } from "@/features/noorani-qaida/fonts";

/**
 * Full-screen layout — bypasses parent portal chrome via RoleChrome.
 * Uses dynamic viewport + safe-area for notch / home indicator devices.
 */
export default function ParentQaidaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${qaidaFontVariables} qaida-root h-[100dvh] max-h-[100dvh] min-h-[100svh] overflow-hidden`}
    >
      <a className="qaida-skip" href="#qaida-main">Skip to learning content</a>
      {children}
    </div>
  );
}

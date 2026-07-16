import { qaidaFontVariables } from "@/features/noorani-qaida/fonts";

/**
 * Public, unauthenticated preview of the Noorani Qaida learning platform.
 * Lives OUTSIDE the `/admin` middleware matcher, so website visitors reach it
 * without an admin/tutor/parent login. Only the Alif lesson is unlocked.
 */
export default function QaidaPreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${qaidaFontVariables} qaida-root h-[100dvh] min-h-[100svh] overflow-hidden`}>
      <a className="qaida-skip" href="#qaida-main">Skip to learning content</a>
      {children}
    </div>
  );
}

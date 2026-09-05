/** Full-screen Holy Quran layout — isolated from Noorani Qaida. */
export default function TutorHolyQuranLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] max-h-[100dvh] min-h-[100svh] overflow-hidden">
      <a href="#hq-main" style={{ position: "absolute", left: -9999 }}>
        Skip to Holy Quran
      </a>
      {children}
    </div>
  );
}

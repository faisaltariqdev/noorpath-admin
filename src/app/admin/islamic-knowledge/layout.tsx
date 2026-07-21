/**
 * Full-screen immersive layout — separate from Noorani Qaida.
 * Does not alter Qaida chrome or learning flow.
 */
export default function IslamicKnowledgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] max-h-[100dvh] min-h-[100svh] overflow-hidden">
      <a
        href="#ik-main"
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
        }}
      >
        Skip to learning content
      </a>
      {children}
    </div>
  );
}

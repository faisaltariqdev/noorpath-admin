/** Full-screen immersive layout — bypasses parent portal chrome via RoleChrome. */
export default function ParentIslamicKnowledgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] max-h-[100dvh] min-h-[100svh] overflow-hidden">
      <a href="#ik-main" style={{ position: "absolute", left: -9999 }}>
        Skip to learning content
      </a>
      {children}
    </div>
  );
}

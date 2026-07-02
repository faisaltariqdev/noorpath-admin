interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  dark?: boolean;
}

export default function NoorPathLogo({ size = "md", showTagline = false, dark = false }: LogoProps) {
  const sizes = {
    sm: { main: "1rem", tag: "0.55rem" },
    md: { main: "1.4rem", tag: "0.7rem" },
    lg: { main: "2rem", tag: "0.85rem" },
    xl: { main: "2.8rem", tag: "1rem" },
  };
  const { main, tag } = sizes[size];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "inherit", lineHeight: 1.1 }}>
      <div style={{ fontSize: main, fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1 }}>
        <span style={{ color: dark ? "#ffffff" : "#1b5e42" }}>Noor</span>
        <span style={{ color: "#c9a84c" }}>Path</span>
      </div>
      {showTagline && (
        <div style={{ fontSize: tag, color: dark ? "rgba(255,255,255,0.6)" : "#c9a84c", fontWeight: 600, marginTop: 3, letterSpacing: "0.01em" }}>
          Path to Enlightenment
        </div>
      )}
    </div>
  );
}

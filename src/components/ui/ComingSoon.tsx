import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";

interface Props { title: string; description?: string; backHref: string; backLabel?: string; }

export default function ComingSoon({ title, description, backHref, backLabel = "Back to Dashboard" }: Props) {
  return (
    <div className="coming-soon">
      <div style={{
        width: 76, height: 76, borderRadius: 22,
        background: "linear-gradient(135deg, #f0fdf4, #fffbeb)",
        border: "2px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 22,
        boxShadow: "0 4px 16px rgba(27,94,66,0.08)",
      }}>
        <Construction size={32} color="#1b5e42" />
      </div>
      <h2 style={{
        fontFamily: "var(--font-playfair), Georgia, serif",
        fontSize: "1.3rem", fontWeight: 700, color: "#0f172a", margin: "0 0 10px",
      }}>{title}</h2>
      <p style={{
        fontSize: "0.85rem", color: "#64748b",
        maxWidth: 380, margin: "0 0 28px", lineHeight: 1.7,
        fontFamily: "var(--font-jakarta), sans-serif",
      }}>
        {description || "This feature is under development and will be available soon with full functionality."}
      </p>
      <Link href={backHref} className="btn btn-outline">
        <ArrowLeft size={15} /> {backLabel}
      </Link>
    </div>
  );
}

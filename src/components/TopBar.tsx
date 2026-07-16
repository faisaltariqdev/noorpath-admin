"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageSquare } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const pathname = usePathname();
  const roleRoot = pathname.startsWith("/tutor")
    ? "/tutor"
    : pathname.startsWith("/parent")
      ? "/parent"
      : "/admin";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="hamburger"
          onClick={() => window.dispatchEvent(new Event("noorpath:sidebar-toggle"))}
          aria-label="Open navigation"
          aria-controls="portal-sidebar"
        >
          <Menu size={18} />
        </button>
        <div>
          <div className="topbar-page-title">{title}</div>
          {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
        </div>
      </div>

      <div className="topbar-right">
        <Link href={`${roleRoot}/messages`} className="topbar-icon-btn" aria-label="Open messages">
          <MessageSquare size={16} />
        </Link>
      </div>
    </header>
  );
}

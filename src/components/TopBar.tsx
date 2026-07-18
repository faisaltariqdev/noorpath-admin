"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const pathname = usePathname();
  const announceHref = pathname.startsWith("/tutor")
    ? "/tutor/messages"
    : pathname.startsWith("/parent")
      ? "/parent/messages"
      : "/admin/announcements";

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
        <Link href={announceHref} className="topbar-icon-btn" aria-label="Open announcements">
          <Bell size={16} />
        </Link>
      </div>
    </header>
  );
}

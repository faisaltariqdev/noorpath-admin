"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  const announceHref = pathname.startsWith("/tutor")
    ? "/tutor/messages"
    : pathname.startsWith("/parent")
      ? "/parent/messages"
      : "/admin/announcements";

  const isRecipient = pathname.startsWith("/tutor") || pathname.startsWith("/parent");

  useEffect(() => {
    if (!isRecipient) return;

    async function loadUnread() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: announcements }, { data: reads }] = await Promise.all([
        supabase
          .from("announcements")
          .select("id, expires_at")
          .not("published_at", "is", null)
          .limit(40),
        supabase.from("announcement_reads").select("announcement_id").eq("user_id", user.id),
      ]);

      const readSet = new Set((reads || []).map((r: { announcement_id: string }) => r.announcement_id));
      const now = Date.now();
      const count = (announcements || []).filter((a: { id: string; expires_at?: string | null }) => {
        if (readSet.has(a.id)) return false;
        if (a.expires_at && new Date(a.expires_at).getTime() < now) return false;
        return true;
      }).length;
      setUnread(count);
    }

    void loadUnread();
  }, [isRecipient, pathname]);

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
        <Link
          href={announceHref}
          className="topbar-icon-btn"
          aria-label={unread > 0 ? `${unread} unread announcements` : "Open announcements"}
          style={{ position: "relative" }}
        >
          <Bell size={16} />
          {unread > 0 && (
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                minWidth: 16,
                height: 16,
                borderRadius: 999,
                background: "#dc2626",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bell, DollarSign, Megaphone } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BannerItem {
  id: string;
  title: string;
  message: string;
  kind: string;
  priority: string;
}

export default function DashboardAnnouncementBanner({
  inboxHref,
}: {
  inboxHref: "/parent/messages" | "/tutor/messages";
}) {
  const [items, setItems] = useState<BannerItem[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: announcements, error }, { data: reads }] = await Promise.all([
        supabase
          .from("announcements")
          .select("id, title, message, kind, priority, expires_at, published_at")
          .not("published_at", "is", null)
          .order("published_at", { ascending: false })
          .limit(10),
        supabase.from("announcement_reads").select("announcement_id").eq("user_id", user.id),
      ]);

      if (error) {
        console.error("announcements banner:", error.message);
        return;
      }

      const readSet = new Set((reads || []).map((r: { announcement_id: string }) => r.announcement_id));
      const now = Date.now();
      const live = (announcements || []).filter((a: { expires_at?: string | null }) => {
        if (a.expires_at && new Date(a.expires_at).getTime() < now) return false;
        return true;
      }) as BannerItem[];

      const unreadItems = live.filter((a) => !readSet.has(a.id));
      setUnread(unreadItems.length);
      setItems(unreadItems.slice(0, 2));
    }
    void load();
  }, []);

  if (!items.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }} role="region" aria-label="New announcements">
      {items.map((item) => {
        const isFee = item.kind === "fee_reminder";
        const isAlert = item.kind === "alert" || item.priority === "urgent";
        const bg = isAlert ? "#fef2f2" : isFee ? "#fffbeb" : "#f0fdf4";
        const border = isAlert ? "#fecaca" : isFee ? "#fde68a" : "#bbf7d0";
        const color = isAlert ? "#991b1b" : isFee ? "#92400e" : "#14532d";
        const Icon = isAlert ? AlertTriangle : isFee ? DollarSign : Megaphone;

        return (
          <Link
            key={item.id}
            href={inboxHref}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: "14px 16px",
              borderRadius: 14,
              border: `1px solid ${border}`,
              background: bg,
              color,
              textDecoration: "none",
              minHeight: 56,
            }}
          >
            <Icon size={18} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: "0.88rem" }}>
                New announcement{unread > 1 ? ` (${unread})` : ""}
              </div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{item.title}</div>
              <div
                style={{
                  fontSize: "0.8rem",
                  marginTop: 4,
                  opacity: 0.9,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.message}
              </div>
              <div style={{ fontSize: "0.75rem", marginTop: 8, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <Bell size={12} /> Tap to open Announcements
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

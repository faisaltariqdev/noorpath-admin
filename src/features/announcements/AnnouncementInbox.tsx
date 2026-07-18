"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bell, DollarSign, Megaphone } from "lucide-react";
import TopBar from "@/components/TopBar";
import { EmptyState, LoadingState, SectionCard } from "@/components/ui/PortalUI";
import { supabase } from "@/lib/supabase";

interface InboxItem {
  id: string;
  title: string;
  message: string;
  kind?: string | null;
  priority: string;
  published_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  is_read: boolean;
}

export default function AnnouncementInbox({ roleLabel = "Announcements" }: { roleLabel?: string }) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setUserId(user.id);

    const [{ data: announcements, error: annError }, { data: reads }] = await Promise.all([
      supabase
        .from("announcements")
        .select("id, title, message, kind, priority, published_at, created_at, expires_at")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(50),
      supabase.from("announcement_reads").select("announcement_id").eq("user_id", user.id),
    ]);

    if (annError) {
      setError(annError.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const readSet = new Set((reads || []).map((r: { announcement_id: string }) => r.announcement_id));
    const now = Date.now();
    setItems(
      (announcements || [])
        .filter((a) => {
          if (a.expires_at && new Date(a.expires_at).getTime() < now) return false;
          return true;
        })
        .map((a) => ({
          ...a,
          is_read: readSet.has(a.id),
        }))
    );
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function markRead(id: string) {
    if (!userId) return;
    const { error: upsertError } = await supabase.from("announcement_reads").upsert(
      { announcement_id: id, user_id: userId, read_at: new Date().toISOString() },
      { onConflict: "announcement_id,user_id" }
    );
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
  }

  const unread = items.filter((i) => !i.is_read).length;

  return (
    <>
      <TopBar title={roleLabel} subtitle="Academy notices — read only" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Announcements</h1>
        <p className="page-subtitle">
          {unread > 0 ? `${unread} new` : "You're all caught up"} · no replies
        </p>
      </div>
      <div className="page-body">
        {error && (
          <div className="card" style={{ marginBottom: 12, padding: 12, color: "#b91c1c", fontWeight: 600 }}>
            {error}
          </div>
        )}
        <SectionCard title="Inbox" className="portal-section-card--full">
          {loading ? (
            <LoadingState />
          ) : items.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements" description="When admin sends a notice, it appears here and on your home dashboard." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item) => {
                const isFee = item.kind === "fee_reminder";
                const isAlert = item.kind === "alert" || item.priority === "urgent";
                const Icon = isAlert ? AlertTriangle : isFee ? DollarSign : Bell;
                return (
                  <article
                    key={item.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 14,
                      background: item.is_read ? "#fff" : isAlert ? "#fef2f2" : isFee ? "#fffbeb" : "#f8fafc",
                      cursor: "pointer",
                    }}
                    onClick={() => void markRead(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        void markRead(item.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${item.is_read ? "Read" : "Unread"}: ${item.title}`}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <Icon size={16} color={item.is_read ? "#94a3b8" : "#1b5e42"} style={{ marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: item.is_read ? 600 : 800 }}>{item.title}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2, textTransform: "capitalize" }}>
                          {(item.kind || "general").replace("_", " ")}
                          {" · "}
                          {new Date(item.published_at || item.created_at).toLocaleString("en-GB")}
                          {!item.is_read ? " · New" : ""}
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "#475569", marginTop: 8, whiteSpace: "pre-wrap" }}>{item.message}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}

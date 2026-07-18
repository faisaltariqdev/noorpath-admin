"use client";

import { useEffect, useState } from "react";
import { Bell, Download, Megaphone } from "lucide-react";
import TopBar from "@/components/TopBar";
import { EmptyState, LoadingState, SectionCard } from "@/components/ui/PortalUI";
import { supabase } from "@/lib/supabase";

interface InboxItem {
  id: string;
  title: string;
  message: string;
  priority: string;
  image_url?: string | null;
  pdf_url?: string | null;
  published_at?: string | null;
  created_at: string;
  is_read: boolean;
}

export default function AnnouncementInbox({ roleLabel = "Announcements" }: { roleLabel?: string }) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setUserId(user.id);

    const [{ data: announcements }, { data: reads }] = await Promise.all([
      supabase
        .from("announcements")
        .select("id, title, message, priority, image_url, pdf_url, published_at, created_at, expires_at, scheduled_at")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(50),
      supabase.from("announcement_reads").select("announcement_id").eq("user_id", user.id),
    ]);

    const readSet = new Set((reads || []).map((r: any) => r.announcement_id));
    const now = Date.now();
    setItems(
      (announcements || [])
        .filter((a: any) => {
          if (a.expires_at && new Date(a.expires_at).getTime() < now) return false;
          if (a.scheduled_at && new Date(a.scheduled_at).getTime() > now) return false;
          return true;
        })
        .map((a: any) => ({
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
    await supabase.from("announcement_reads").upsert(
      { announcement_id: id, user_id: userId, read_at: new Date().toISOString() },
      { onConflict: "announcement_id,user_id" }
    );
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
  }

  const unread = items.filter((i) => !i.is_read).length;

  return (
    <>
      <TopBar title={roleLabel} subtitle="Read-only academy notices" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Announcements</h1>
        <p className="page-subtitle">{unread} unread · no replies</p>
      </div>
      <div className="page-body">
        <SectionCard title="Inbox" className="portal-section-card--full">
          {loading ? (
            <LoadingState />
          ) : items.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements" description="When admin publishes a notice, it appears here." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item) => (
                <article
                  key={item.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 14,
                    background: item.is_read ? "#fff" : "#f8fafc",
                    cursor: "pointer",
                  }}
                  onClick={() => void markRead(item.id)}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Bell size={16} color={item.is_read ? "#94a3b8" : "#1b5e42"} style={{ marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: item.is_read ? 600 : 800 }}>{item.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2, textTransform: "capitalize" }}>
                        {item.priority} · {new Date(item.published_at || item.created_at).toLocaleString("en-GB")}
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "#475569", marginTop: 8, whiteSpace: "pre-wrap" }}>{item.message}</p>
                      {(item.image_url || item.pdf_url) && (
                        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                          {item.image_url && (
                            <a href={item.image_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-xs" onClick={(e) => e.stopPropagation()}>
                              <Download size={12} /> Image
                            </a>
                          )}
                          {item.pdf_url && (
                            <a href={item.pdf_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-xs" onClick={(e) => e.stopPropagation()}>
                              <Download size={12} /> PDF
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}

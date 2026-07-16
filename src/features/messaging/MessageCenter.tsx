"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, MessageSquare, Send } from "lucide-react";
import TopBar from "@/components/TopBar";
import { EmptyState, LoadingState, PageHeader } from "@/components/ui/PortalUI";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  sender_name: string;
  body: string;
  created_at: string;
  sender_role: string;
  is_me: boolean;
}

const roleColor: Record<string, string> = {
  admin: "#b45309",
  tutor: "#2563eb",
  parent: "#15803d",
};

export default function MessageCenter() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    async function start() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;
      const userId = user.id;

      async function load() {
        const { data } = await supabase
          .from("chat_messages")
          .select("id,body,created_at,sender_id,sender:profiles(full_name,role)")
          .order("created_at")
          .limit(100);
        if (!active) return;
        setMessages((data || []).map((message: any) => ({
          id: message.id,
          sender_name: message.sender?.full_name || "Unknown",
          sender_role: message.sender?.role || "unknown",
          body: message.body,
          created_at: message.created_at,
          is_me: message.sender_id === userId,
        })));
        setLoading(false);
        requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
      }

      await load();
      channel = supabase
        .channel(`portal-chat-${userId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, load)
        .subscribe();
    }

    start();
    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const body = newMessage.trim();
    if (!body || sending) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("chat_messages").insert({ sender_id: user.id, body });
    setNewMessage("");
    setSending(false);
  }

  return (
    <>
      <TopBar title="Messages" subtitle="Academy communication" />
      <main className="portal-page">
        <PageHeader
          eyebrow="Communication"
          title="Messages"
          description="A shared conversation for academy administrators, teachers, and parents."
          actions={isAdmin ? <Link href="/admin/notifications" className="btn btn-ghost"><Bell size={14} /> Announcements</Link> : undefined}
        />

        <section className="portal-section-card portal-section-card--full portal-message-shell" aria-label="Academy group conversation">
          <div className="portal-message-thread" aria-live="polite">
            {loading ? <LoadingState label="Loading messages…" /> : messages.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No messages yet" description="Start the academy conversation below." />
            ) : messages.map((message) => (
              <article key={message.id} className={`portal-message ${message.is_me ? "portal-message--mine" : ""}`}>
                {!message.is_me && (
                  <span
                    className="avatar"
                    style={{ background: `linear-gradient(135deg, ${roleColor[message.sender_role] || "#1b5e42"}, #0f172a)` }}
                    aria-hidden="true"
                  >
                    {message.sender_name.charAt(0)}
                  </span>
                )}
                <div className="portal-message-content">
                  {!message.is_me && <p className="portal-message-author">{message.sender_name} · {message.sender_role}</p>}
                  <p className="portal-message-bubble">{message.body}</p>
                  <time dateTime={message.created_at}>
                    {new Date(message.created_at).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                  </time>
                </div>
              </article>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="portal-message-composer">
            <label className="sr-only" htmlFor="portal-message-input">Write a message</label>
            <input
              id="portal-message-input"
              className="form-input"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              placeholder="Write a message…"
            />
            <button type="submit" className="btn btn-primary" disabled={sending || !newMessage.trim()} aria-label="Send message">
              <Send size={15} aria-hidden="true" />
              <span className="hidden sm:inline">{sending ? "Sending…" : "Send"}</span>
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

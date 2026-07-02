"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { MessageSquare, Send } from "lucide-react";

interface Message { id: string; sender_name: string; body: string; created_at: string; sender_role: string; is_me: boolean; }

export default function AdminMessagesPage() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [loading, setLoading]     = useState(true);
  const [newMsg, setNewMsg]       = useState("");
  const [sending, setSending]     = useState(false);
  const [myId, setMyId]           = useState("");
  const bottomRef                 = useRef<HTMLDivElement>(null);

  async function load(uid: string) {
    const { data } = await supabase.from("chat_messages")
      .select("id, body, created_at, sender_id, sender:profiles(full_name, role)")
      .order("created_at").limit(100);
    setMessages((data || []).map((m: any) => ({
      id: m.id, sender_name: m.sender?.full_name || "Unknown",
      sender_role: m.sender?.role || "—", body: m.body,
      created_at: m.created_at, is_me: m.sender_id === uid,
    })));
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setMyId(user.id);
      load(user.id);
      const sub = supabase.channel("chat")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => load(user.id))
        .subscribe();
      return () => { sub.unsubscribe(); };
    });
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("chat_messages").insert({ sender_id: user?.id, body: newMsg.trim() });
    setNewMsg("");
    setSending(false);
  }

  const ROLE_COLOR: Record<string, string> = { admin: "#c9a84c", tutor: "#3b82f6", parent: "#22c55e" };

  return (
    <>
      <TopBar title="Messages" />
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h1 className="page-title">Message Center</h1>
        <p className="page-subtitle">Group chat — Admin, Tutors & Parents</p>
      </div>
      <div className="page-body">
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 230px)", minHeight: 400 }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {loading
              ? <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%" }}><div style={{ width:32, height:32, border:"3px solid #e2e8f0", borderTopColor:"#1b5e42", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>
              : messages.length === 0
                ? <div style={{ textAlign:"center", color:"#94a3b8", marginTop:"auto", marginBottom:"auto" }}><MessageSquare size={40} style={{ opacity:0.2, margin:"0 auto 12px" }} /><p style={{ fontSize:"0.85rem" }}>No messages yet. Start the conversation!</p></div>
                : messages.map(m => (
                  <div key={m.id} style={{ display:"flex", gap:10, flexDirection: m.is_me ? "row-reverse" : "row" }}>
                    {!m.is_me && <div className="avatar" style={{ width:32, height:32, fontSize:"0.75rem", flexShrink:0, background:`linear-gradient(135deg, ${ROLE_COLOR[m.sender_role]||"#1b5e42"}, #0f172a)` }}>{m.sender_name.charAt(0)}</div>}
                    <div style={{ maxWidth:"72%" }}>
                      {!m.is_me && <div style={{ fontSize:"0.7rem", color:"#94a3b8", marginBottom:3, fontFamily:"var(--font-jakarta),sans-serif" }}>{m.sender_name} · <span style={{ color: ROLE_COLOR[m.sender_role]||"#64748b" }}>{m.sender_role}</span></div>}
                      <div style={{ background: m.is_me ? "linear-gradient(135deg,#1b5e42,#0f4028)" : "#f8fafc", color: m.is_me ? "#fff" : "#334155", borderRadius: m.is_me ? "14px 14px 4px 14px" : "4px 14px 14px 14px", padding:"11px 15px", fontSize:"0.84rem", lineHeight:1.6, fontFamily:"var(--font-jakarta),sans-serif", border: m.is_me ? "none" : "1px solid #f1f5f9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>{m.body}</div>
                      <div style={{ fontSize:"0.65rem", color:"#94a3b8", marginTop:4, textAlign: m.is_me ? "right" : "left" }}>{new Date(m.created_at).toLocaleString("en-GB",{hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"})}</div>
                    </div>
                  </div>
                ))}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding:"14px 20px", borderTop:"1px solid #f1f5f9" }}>
            <form onSubmit={send} style={{ display:"flex", gap:10 }}>
              <input className="form-input" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Write a message to all staff..." style={{ flex:1 }} />
              <button type="submit" className="btn btn-primary" disabled={sending||!newMsg.trim()} style={{ flexShrink:0, padding:"10px 16px" }}><Send size={15} /></button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

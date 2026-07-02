"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "@/components/TopBar";
import { CheckCircle, Star, Mic, MicOff, Play, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

const RATINGS = ["excellent", "good", "average", "needs_improvement"];

const TAJWEED_RULES_MATRIX = [
  { key: "makharij",    label: "Makharij",           arabic: "مخارج الحروف", desc: "Articulation points" },
  { key: "sifaat",     label: "Sifaat",              arabic: "صفات الحروف",  desc: "Letter characteristics" },
  { key: "noon_sak",   label: "Noon Sakinah",        arabic: "نون ساكنة",    desc: "Rules of Nun Sukun" },
  { key: "meem_sak",   label: "Meem Sakinah",        arabic: "ميم ساكنة",    desc: "Rules of Mim Sukun" },
  { key: "madd",       label: "Madd",                arabic: "المد",         desc: "Lengthening of letters" },
  { key: "waqf",       label: "Waqf & Ibtida",       arabic: "الوقف والابتداء", desc: "Stopping and starting" },
  { key: "qalqalah",   label: "Qalqalah",            arabic: "القلقلة",      desc: "Echo/bounce letters" },
  { key: "tafkhim",    label: "Tafkhim/Tarqeeq",     arabic: "تفخيم وترقيق", desc: "Heavy/light letters" },
];

function TajweedStarRow({
  rule,
  value,
  onChange,
}: {
  rule: (typeof TAJWEED_RULES_MATRIX)[0];
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const colorMap = [
    "", "#dc2626", "#f59e0b", "#d97706", "#16a34a", "#1b5e42",
  ];
  const labelMap = ["", "Poor", "Weak", "Average", "Good", "Excellent"];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--charcoal)" }}>{rule.label}</div>
        <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{rule.desc}</div>
      </div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#c9a84c", width: 100, textAlign: "right", direction: "rtl" }}>
        {rule.arabic}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(value === i ? 0 : i)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 1 }}
          >
            <Star
              size={18}
              fill={(hovered || value) >= i ? (colorMap[hovered || value] || "#c9a84c") : "none"}
              stroke={(hovered || value) >= i ? (colorMap[hovered || value] || "#c9a84c") : "#cbd5e1"}
            />
          </button>
        ))}
      </div>
      <div style={{ width: 56, fontSize: "0.72rem", fontWeight: 700, color: colorMap[hovered || value] || "var(--muted)" }}>
        {(hovered || value) ? labelMap[hovered || value] : "—"}
      </div>
    </div>
  );
}

export default function SubmitReportPage() {
  const router = useRouter();
  const [students, setStudents] = useState<{ id: string; full_name: string }[]>([]);
  const [sessions, setSessions] = useState<{ id: string; scheduled_at: string; label: string; student_id: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [tajweedMatrix, setTajweedMatrix] = useState<Record<string, number>>(
    Object.fromEntries(TAJWEED_RULES_MATRIX.map(r => [r.key, 0]))
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [form, setForm] = useState({
    student_id: "",
    session_id: "",
    overall_rating: "good",
    tajweed_stars: 4,
    pages_covered: "",
    surah_covered: "",
    homework: "",
    tutor_notes: "",
    mistakes: "",
    tajweed_rules: [] as string[],
    audio_note_url: "",
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: studs }, { data: sess }] = await Promise.all([
        supabase.from("students").select("id, full_name").eq("tutor_id", user.id).eq("is_active", true),
        supabase.from("class_sessions")
          .select("id, scheduled_at, notes, student_id, student:students(full_name, course)")
          .eq("tutor_id", user.id).eq("status", "completed")
          .order("scheduled_at", { ascending: false }).limit(20),
      ]);
      setStudents(studs || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSessions((sess || []).map((session: any) => {
        const stu = Array.isArray(session.student) ? session.student[0] : session.student;
        return {
          id: session.id,
          student_id: session.student_id,
          scheduled_at: session.scheduled_at,
          label: `${new Date(session.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${stu?.full_name || "Student"}${stu?.course ? ` · ${stu.course}` : ""}`,
        };
      }));
    }
    load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setForm((current) => ({
      ...current,
      student_id: current.student_id || params.get("student") || "",
      session_id: current.session_id || params.get("session") || "",
    }));
  }, []);

  useEffect(() => {
    if (!form.session_id) return;
    const selectedSession = sessions.find((s) => s.id === form.session_id);
    if (selectedSession && !form.student_id) {
      setForm((current) => ({ ...current, student_id: selectedSession.student_id }));
    }
  }, [form.session_id, form.student_id, sessions]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      alert("Microphone access denied. Please allow mic access to record audio notes.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function deleteAudio() {
    setAudioBlob(null);
    setAudioUrl(null);
    setForm(p => ({ ...p, audio_note_url: "" }));
  }

  async function uploadAudio(): Promise<string | null> {
    if (!audioBlob) return null;
    setUploadingAudio(true);
    const { data: { user } } = await supabase.auth.getUser();
    const filename = `audio-notes/${user?.id}/${Date.now()}.webm`;
    const { error } = await supabase.storage
      .from("audio-notes")
      .upload(filename, audioBlob, { contentType: "audio/webm", upsert: true });
    setUploadingAudio(false);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from("audio-notes").getPublicUrl(filename);
    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    let audioNoteUrl = form.audio_note_url;
    if (audioBlob && !audioNoteUrl) {
      audioNoteUrl = (await uploadAudio()) || "";
    }

    // Build tajweed issues list from matrix (rules with score <= 2 are problematic)
    const tajweedIssues = TAJWEED_RULES_MATRIX
      .filter(r => tajweedMatrix[r.key] > 0 && tajweedMatrix[r.key] <= 2)
      .map(r => `${r.label} (${["", "Poor", "Weak"][tajweedMatrix[r.key]]})`);

    const { data: insertedReport, error } = await supabase.from("progress_reports").insert({
      student_id: form.student_id,
      session_id: form.session_id || null,
      tutor_id: user?.id,
      overall_rating: form.overall_rating,
      tajweed_stars: form.tajweed_stars,
      pages_covered: form.pages_covered || null,
      surah_covered: form.surah_covered || null,
      homework: form.homework || null,
      tutor_notes: form.tutor_notes || null,
      mistakes: form.mistakes || null,
      tajweed_rules: tajweedIssues.length > 0 ? tajweedIssues : form.tajweed_rules,
      audio_note_url: audioNoteUrl || null,
    }).select("id").single();

    if (!error && insertedReport?.id && form.homework.trim()) {
      await supabase.from("homework_logs").insert({
        report_id: insertedReport.id,
        student_id: form.student_id,
        tutor_id: user?.id,
        homework_text: form.homework.trim(),
        title: form.surah_covered || "Practice homework",
        subject: "Quran",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "pending",
        is_completed: false,
      });
    }

    setSaved(true);
    setSaving(false);
    setTimeout(() => router.push("/tutor"), 2000);
  }

  const RATING_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    excellent:         { color: "#15803d", bg: "#dcfce7", label: "Excellent ⭐⭐⭐⭐⭐" },
    good:              { color: "#1d4ed8", bg: "#dbeafe", label: "Good ⭐⭐⭐⭐" },
    average:           { color: "#a16207", bg: "#fef9c3", label: "Average ⭐⭐⭐" },
    needs_improvement: { color: "#b91c1c", bg: "#fee2e2", label: "Needs Improvement ⭐⭐" },
  };

  const avgTajweedMatrix = (() => {
    const vals = Object.values(tajweedMatrix).filter(v => v > 0);
    return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
  })();

  if (saved) return (
    <>
      <TopBar title="Submit Report" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle size={36} color="#16a34a" />
        </div>
        <h2 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Report Submitted!</h2>
        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Redirecting to dashboard...</p>
      </div>
    </>
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="Submit Progress Report" subtitle="Record today's class performance" />
      <div className="page-content">
        <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>

          {/* Class Information */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><h3 className="card-title">Class Information</h3></div>
            <div style={{ padding: "0 20px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Student *</label>
                  <select className="form-input form-select" value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))} required>
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Session (optional)</label>
                  <select className="form-input form-select" value={form.session_id} onChange={e => setForm(p => ({ ...p, session_id: e.target.value }))}>
                    <option value="">Today's class</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Surah / Lesson Covered</label>
                  <input className="form-input" value={form.surah_covered} onChange={e => setForm(p => ({ ...p, surah_covered: e.target.value }))} placeholder="e.g. Al-Baqarah, Juz 1" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Pages / Lines Covered</label>
                  <input className="form-input" value={form.pages_covered} onChange={e => setForm(p => ({ ...p, pages_covered: e.target.value }))} placeholder="e.g. Pages 4-6 or 8 lines" />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Rating */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h3 className="card-title">Overall Performance</h3>
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
                {RATINGS.map(r => {
                  const cfg = RATING_CONFIG[r];
                  const selected = form.overall_rating === r;
                  return (
                    <button key={r} type="button" onClick={() => setForm(p => ({ ...p, overall_rating: r }))} style={{ padding: "12px 16px", borderRadius: 12, cursor: "pointer", border: selected ? `2px solid ${cfg.color}` : "2px solid #e2e8f0", background: selected ? cfg.bg : "transparent", color: selected ? cfg.color : "#64748b", fontWeight: selected ? 700 : 500, fontSize: "0.82rem", textAlign: "left", transition: "all 0.15s", fontFamily: "var(--font-jakarta), sans-serif" }}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="form-label">Overall Tajweed Stars: <strong style={{ color: "#1b5e42" }}>{form.tajweed_stars}/5</strong></label>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} type="button" onClick={() => setForm(p => ({ ...p, tajweed_stars: i }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                      <Star size={24} fill={form.tajweed_stars >= i ? "#c9a84c" : "none"} stroke={form.tajweed_stars >= i ? "#c9a84c" : "#cbd5e1"} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tajweed Star Matrix */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Tajweed Rule Performance Matrix</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 4 }}>Rate each Tajweed rule individually — parents will see this breakdown</p>
              </div>
              {avgTajweedMatrix !== "—" && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 999, padding: "4px 14px", fontSize: "0.82rem", fontWeight: 700, color: "#15803d" }}>
                  Avg: {avgTajweedMatrix}★
                </div>
              )}
            </div>
            <div style={{ padding: "0 20px 16px" }}>
              {TAJWEED_RULES_MATRIX.map(rule => (
                <TajweedStarRow
                  key={rule.key}
                  rule={rule}
                  value={tajweedMatrix[rule.key]}
                  onChange={v => setTajweedMatrix(p => ({ ...p, [rule.key]: v }))}
                />
              ))}
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#fffbeb", borderRadius: "var(--radius-sm)", border: "1px solid #fde047" }}>
                <p style={{ fontSize: "0.75rem", color: "#92400e", margin: 0 }}>
                  💡 Rules rated 1-2 stars will appear as improvement areas in the parent report.
                </p>
              </div>
            </div>
          </div>

          {/* Audio Note */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Audio Note for Parents</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 4 }}>Record a voice message — parents can listen to your feedback</p>
              </div>
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              {!audioUrl ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 0" }}>
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: isRecording ? "linear-gradient(135deg, #dc2626, #ef4444)" : "linear-gradient(135deg, #1b5e42, #134430)",
                      border: isRecording ? "3px solid #fca5a5" : "3px solid #86efac",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", color: "#fff",
                      boxShadow: isRecording ? "0 0 0 8px rgba(239,68,68,0.12)" : "0 0 0 8px rgba(27,94,66,0.08)",
                      transition: "all 0.3s",
                    }}
                  >
                    {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                  </button>
                  <div style={{ fontSize: "0.82rem", color: isRecording ? "#dc2626" : "var(--muted)", fontWeight: 600 }}>
                    {isRecording ? `🔴 Recording... ${Math.floor(recordingTime / 60)}:${String(recordingTime % 60).padStart(2, "0")}` : "Tap to record audio note"}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", maxWidth: 300, margin: 0 }}>
                    Record feedback for parents. Keep it under 2 minutes. Parents can replay this from their portal.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "var(--radius-sm)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <CheckCircle size={18} style={{ color: "#15803d", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#15803d", flex: 1 }}>Audio note recorded</span>
                    <audio controls src={audioUrl} style={{ height: 32 }} />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" onClick={deleteAudio} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#dc2626", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                      <Trash2 size={13} /> Delete
                    </button>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Upload size={13} /> Will upload on submit
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes & Homework */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header"><h3 className="card-title">Notes & Homework</h3></div>
            <div style={{ padding: "0 20px 20px" }}>
              <div className="form-group">
                <label className="form-label">Tutor Notes for Parent</label>
                <textarea className="form-input" value={form.tutor_notes} onChange={e => setForm(p => ({ ...p, tutor_notes: e.target.value }))} placeholder="Write class summary, strengths, and encouragement for the parent to read..." rows={4} style={{ resize: "vertical" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Mistakes / Improvement Areas</label>
                <textarea className="form-input" value={form.mistakes} onChange={e => setForm(p => ({ ...p, mistakes: e.target.value }))} placeholder="Pronunciation issues, fluency problems, revision needed..." rows={3} style={{ resize: "vertical" }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Homework for Parent Portal</label>
                <textarea className="form-input" value={form.homework} onChange={e => setForm(p => ({ ...p, homework: e.target.value }))} placeholder="This homework will be shown on the parent portal and marked as done when completed..." rows={3} style={{ resize: "vertical" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving || !form.student_id || uploadingAudio} style={{ flex: 1, justifyContent: "center" }}>
              {saving || uploadingAudio ? "Submitting..." : "Submit Progress Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

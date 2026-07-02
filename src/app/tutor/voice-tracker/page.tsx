"use client";
export const dynamic = "force-dynamic";
import { useState, useRef, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { SURAHS } from "@/data/surahs";
import { Mic, MicOff, Volume2, CheckCircle, Search, RotateCcw, Lightbulb } from "lucide-react";

type SurahTrackStatus = "not_started" | "in_progress" | "completed";

interface TrackedSurah {
  number: number;
  name: string;
  arabic: string;
  status: SurahTrackStatus;
  detectedAt?: Date;
}

// Build recognition patterns for each Surah
const SURAH_KEYWORDS: Record<string, number[]> = {
  "fatiha": [1], "fatihah": [1], "opening": [1],
  "baqarah": [2], "baqara": [2], "cow": [2],
  "imran": [3], "ali imran": [3],
  "nisa": [4], "nisa'": [4], "women": [4],
  "maidah": [5], "ma'idah": [5], "table": [5],
  "anam": [6], "an'am": [6], "cattle": [6],
  "araf": [7], "heights": [7],
  "anfal": [8], "spoils": [8],
  "tawbah": [9], "tauba": [9], "repentance": [9],
  "yunus": [10], "jonah": [10],
  "hud": [11],
  "yusuf": [12], "joseph": [12],
  "rad": [13], "thunder": [13],
  "ibrahim": [14], "abraham": [14],
  "hijr": [15], "rock": [15],
  "nahl": [16], "bee": [16],
  "isra": [17], "night journey": [17], "bani israel": [17],
  "kahf": [18], "cave": [18],
  "maryam": [19], "mary": [19],
  "taha": [20], "ta ha": [20],
  "anbiya": [21], "prophets": [21],
  "hajj": [22], "pilgrimage": [22],
  "muminun": [23], "believers": [23],
  "nur": [24], "light": [24],
  "furqan": [25], "criterion": [25],
  "yasin": [36], "ya sin": [36], "yaseen": [36],
  "rahman": [55], "ar rahman": [55], "merciful": [55],
  "waqiah": [56], "waqi'ah": [56], "inevitable": [56],
  "mulk": [67], "al mulk": [67], "sovereignty": [67],
  "qalam": [68], "pen": [68],
  "haqqah": [69], "reality": [69],
  "jinn": [72], "al jinn": [72],
  "muzzammil": [73], "muzzamil": [73], "wrapped": [73],
  "muddaththir": [74], "cloaked": [74],
  "qiyamah": [75], "resurrection": [75],
  "naba": [78], "an naba": [78], "tidings": [78],
  "naziat": [79], "an naziat": [79],
  "abasa": [80], "frowned": [80],
  "takwir": [81], "at takwir": [81], "rolled up": [81],
  "infitar": [82], "cleaved": [82],
  "buruj": [85], "constellations": [85],
  "tariq": [86], "night star": [86],
  "ala": [87], "al ala": [87], "most high": [87],
  "ghashiyah": [88], "overwhelming": [88],
  "fajr": [89], "dawn": [89],
  "balad": [90], "city": [90],
  "shams": [91], "sun": [91],
  "layl": [92], "night": [92],
  "duha": [93], "morning light": [93],
  "sharh": [94], "inshirah": [94], "relief": [94],
  "tin": [95], "fig": [95],
  "alaq": [96], "al alaq": [96], "clot": [96], "read in the name": [96],
  "qadr": [97], "power": [97], "decree": [97],
  "bayyinah": [98], "clear evidence": [98],
  "zalzalah": [99], "earthquake": [99],
  "adiyat": [100], "chargers": [100],
  "qariah": [101], "calamity": [101],
  "takathur": [102], "rivalry": [102],
  "asr": [103], "time": [103],
  "humazah": [104], "slanderer": [104],
  "fil": [105], "elephant": [105],
  "quraysh": [106], "quraish": [106],
  "maun": [107], "al maun": [107], "charity": [107],
  "kawthar": [108], "al kawthar": [108], "abundance": [108],
  "kafirun": [109], "disbelievers": [109],
  "nasr": [110], "an nasr": [110], "victory": [110],
  "masad": [111], "al masad": [111], "palm fiber": [111],
  "ikhlas": [112], "al ikhlas": [112], "sincerity": [112], "say he is allah one": [112],
  "falaq": [113], "al falaq": [113], "daybreak": [113],
  "nas": [114], "an nas": [114], "mankind": [114],
};

function detectSurahs(transcript: string): number[] {
  const lower = transcript.toLowerCase();
  const detected: Set<number> = new Set();
  Object.entries(SURAH_KEYWORDS).forEach(([keyword, nums]) => {
    if (lower.includes(keyword)) {
      nums.forEach(n => detected.add(n));
    }
  });
  // Also detect by number "surah 36" etc.
  const numMatches = lower.match(/surah\s+(\d+)/g) || [];
  numMatches.forEach(match => {
    const num = parseInt(match.replace(/[^0-9]/g, ""), 10);
    if (num >= 1 && num <= 114) detected.add(num);
  });
  return Array.from(detected);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionConstructor = new () => any;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export default function VoiceTrackerPage() {
  const [tracked, setTracked] = useState<Record<number, TrackedSurah>>(() => {
    const init: Record<number, TrackedSurah> = {};
    SURAHS.forEach(s => {
      init[s.number] = { number: s.number, name: s.name, arabic: s.arabic, status: "not_started" };
    });
    return init;
  });
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastDetected, setLastDetected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [supported, setSupported] = useState(true);
  const [currentSurahFilter, setCurrentSurahFilter] = useState<"all" | "completed" | "not_started">("all");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const fullTranscriptRef = useRef("");

  useEffect(() => {
    const SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SRClass) {
      setSupported(false);
      return;
    }
    const recognition = new SRClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (final) {
        fullTranscriptRef.current += " " + final;
        const detected = detectSurahs(fullTranscriptRef.current);
        if (detected.length > 0) {
          setTracked(prev => {
            const next = { ...prev };
            detected.forEach(n => {
              next[n] = { ...next[n], status: "completed", detectedAt: new Date() };
            });
            return next;
          });
          setLastDetected(detected.map(n => SURAHS[n - 1]?.name || `Surah ${n}`));
        }
      }
      setTranscript(fullTranscriptRef.current + (interim ? ` (${interim})` : ""));
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => { recognition.stop(); };
  }, []);

  function toggleListening() {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      fullTranscriptRef.current = "";
      setTranscript("");
      setLastDetected([]);
      rec.start();
      setIsListening(true);
    }
  }

  function toggleSurah(num: number) {
    setTracked(prev => ({
      ...prev,
      [num]: {
        ...prev[num],
        status: prev[num].status === "completed" ? "not_started" : "completed",
        detectedAt: new Date(),
      },
    }));
  }

  function resetAll() {
    setTracked(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { next[Number(k)].status = "not_started"; next[Number(k)].detectedAt = undefined; });
      return next;
    });
    fullTranscriptRef.current = "";
    setTranscript("");
    setLastDetected([]);
  }

  const completedCount = Object.values(tracked).filter(t => t.status === "completed").length;
  const pct = Math.round((completedCount / 114) * 100);

  const filteredSurahs = SURAHS.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.arabic.includes(search) || s.number.toString().includes(search);
    const status = tracked[s.number]?.status || "not_started";
    const matchFilter = currentSurahFilter === "all" || status === currentSurahFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title="AI Voice Mushaf Tracker" subtitle="Speak Surah names — AI marks them automatically" />
      <div className="page-content">

        {!supported && (
          <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
            <Volume2 size={18} style={{ color: "#a16207" }} />
            <div>
              <strong style={{ color: "#a16207" }}>Voice recognition not supported</strong>
              <p style={{ fontSize: "0.82rem", color: "#a16207", margin: 0 }}>Use Chrome or Edge browser for voice tracking. You can still manually mark Surahs below.</p>
            </div>
          </div>
        )}

        {/* Voice Control Card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "8px 0" }}>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ marginBottom: 8, color: "var(--charcoal)" }}>AI Surah Voice Detector</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--muted)", maxWidth: 400 }}>
                Tap the microphone and say Surah names like "Al-Fatiha", "Al-Ikhlas", or "Surah 36". 
                AI will automatically mark them as covered.
              </p>
            </div>

            {/* Big Mic Button */}
            <button
              onClick={supported ? toggleListening : undefined}
              disabled={!supported}
              style={{
                width: 96, height: 96, borderRadius: "50%",
                background: isListening
                  ? "linear-gradient(135deg, #dc2626, #ef4444)"
                  : "linear-gradient(135deg, #1b5e42, #134430)",
                border: isListening ? "4px solid #fca5a5" : "4px solid #86efac",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: supported ? "pointer" : "not-allowed",
                color: "#fff",
                boxShadow: isListening
                  ? "0 0 0 12px rgba(239,68,68,0.15), 0 8px 32px rgba(239,68,68,0.3)"
                  : "0 0 0 12px rgba(27,94,66,0.1), 0 8px 32px rgba(27,94,66,0.2)",
                transition: "all 0.3s",
                animation: isListening ? "pulse 1.5s infinite" : "none",
              }}
            >
              {isListening ? <MicOff size={36} /> : <Mic size={36} />}
            </button>

            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: isListening ? "#dc2626" : "var(--muted)" }}>
              {isListening ? "🔴 Listening... speak now" : "Click to start voice detection"}
            </div>

            {/* Transcript */}
            {transcript && (
              <div style={{
                background: "#f8fafc", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                padding: "12px 16px", width: "100%", maxWidth: 600,
                fontSize: "0.82rem", color: "var(--charcoal)",
                maxHeight: 100, overflowY: "auto",
                lineHeight: 1.6,
              }}>
                <strong style={{ color: "var(--muted)", fontSize: "0.72rem", display: "block", marginBottom: 4 }}>TRANSCRIPT</strong>
                {transcript}
              </div>
            )}

            {/* Last detected */}
            {lastDetected.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {lastDetected.map(name => (
                  <div key={name} style={{
                    background: "#dcfce7", border: "1px solid #86efac",
                    borderRadius: 999, padding: "4px 12px",
                    fontSize: "0.78rem", fontWeight: 700, color: "#15803d",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <CheckCircle size={13} /> {name} detected!
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={{
          background: "linear-gradient(135deg, #1b5e42, #134430)",
          borderRadius: "var(--radius)",
          padding: "20px 24px",
          marginBottom: 24,
          color: "#fff",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 700 }}>{completedCount} / 114 Surahs Tracked</span>
            <span style={{ color: "#c9a84c", fontWeight: 800, fontSize: "1.2rem" }}>{pct}%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, height: 10 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #c9a84c, #e2c06a)", borderRadius: 999, transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Tip */}
        <div style={{ background: "#fffbeb", border: "1px solid #fde047", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Lightbulb size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: "0.8rem", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
            <strong>Tip:</strong> Say &ldquo;In class today we covered Al-Ikhlas and An-Nas&rdquo; — AI will detect and mark both. You can also tap any Surah card to mark it manually.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          {(["all", "completed", "not_started"] as const).map(f => (
            <button
              key={f}
              onClick={() => setCurrentSurahFilter(f)}
              style={{
                padding: "6px 14px", borderRadius: 999,
                border: `1.5px solid ${currentSurahFilter === f ? "#1b5e42" : "var(--border)"}`,
                background: currentSurahFilter === f ? "#f0fdf4" : "#fff",
                color: currentSurahFilter === f ? "#1b5e42" : "var(--muted)",
                fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
              }}
            >
              {f === "all" ? "All (114)" : f === "completed" ? `Done (${completedCount})` : `Remaining (${114 - completedCount})`}
            </button>
          ))}
          <div style={{ position: "relative", marginLeft: "auto" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Surah..."
              style={{ paddingLeft: 28, paddingRight: 12, height: 34, borderRadius: 999, border: "1.5px solid var(--border)", fontSize: "0.8rem", outline: "none", width: 160 }}
            />
          </div>
          <button
            onClick={resetAll}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#dc2626", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
          >
            <RotateCcw size={13} /> Reset All
          </button>
        </div>

        {/* Surah Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
          {filteredSurahs.map(surah => {
            const t = tracked[surah.number];
            const done = t?.status === "completed";
            return (
              <button
                key={surah.number}
                onClick={() => toggleSurah(surah.number)}
                style={{
                  background: done ? "#dcfce7" : "#fff",
                  border: `1.5px solid ${done ? "#86efac" : "var(--border)"}`,
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 8px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: done ? "#15803d" : "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: done ? "#fff" : "#94a3b8",
                  fontSize: "0.68rem", fontWeight: 700,
                }}>
                  {done ? <CheckCircle size={14} /> : surah.number}
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "0.9rem", color: done ? "#15803d" : "var(--charcoal)" }}>
                  {surah.arabic}
                </div>
                <div style={{ fontSize: "0.68rem", fontWeight: 600, color: done ? "#15803d" : "var(--charcoal)" }}>
                  {surah.name}
                </div>
                <div style={{ fontSize: "0.62rem", color: "var(--muted)" }}>{surah.verses}v</div>
              </button>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 12px rgba(239,68,68,0.15), 0 8px 32px rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 0 20px rgba(239,68,68,0.08), 0 8px 32px rgba(239,68,68,0.4); }
        }
      `}</style>
    </div>
  );
}

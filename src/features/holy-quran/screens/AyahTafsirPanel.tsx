"use client";

import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchTafsirAyah, TAFSIR_EDITIONS, type TafsirLang } from "../data/tafsir";

const FONT_KEY = "noorpath-hq-tafsir-font";
const FONT_MIN = 90;
const FONT_MAX = 160;
const FONT_STEP = 10;

interface AyahTafsirPanelProps {
  surah: number;
  ayah: number;
  lang: TafsirLang;
  onLangChange: (lang: TafsirLang) => void;
  onClose: () => void;
}

function loadFontZoom(): number {
  if (typeof window === "undefined") return 100;
  try {
    const raw = Number(window.localStorage.getItem(FONT_KEY));
    if (!Number.isFinite(raw)) return 100;
    return Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(raw / FONT_STEP) * FONT_STEP));
  } catch {
    return 100;
  }
}

/** Split into readable sections without treating every short line as a separate interactive row. */
function splitTafsirSections(text: string): string[] {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (!cleaned) return [];

  // Prefer blank-line paragraphs; otherwise merge short line breaks into flowing prose.
  if (/\n\s*\n/.test(cleaned)) {
    return cleaned.split(/\n\s*\n+/).map((part) => part.replace(/\n+/g, " ").trim()).filter(Boolean);
  }

  const lines = cleaned.split("\n").map((line) => line.trim()).filter(Boolean);
  const sections: string[] = [];
  let buffer = "";

  for (const line of lines) {
    const looksLikeHeading =
      line.length < 80 &&
      !/[.!?۔؟]$/.test(line) &&
      (/^[A-Z][\w\s,'’:-]+$/.test(line) || /^[-•*]/.test(line) || /:$/.test(line));

    if (looksLikeHeading && buffer) {
      sections.push(buffer.trim());
      buffer = line;
      continue;
    }
    buffer = buffer ? `${buffer} ${line}` : line;
    if (/[.!?۔؟]$/.test(line) && buffer.length > 160) {
      sections.push(buffer.trim());
      buffer = "";
    }
  }
  if (buffer.trim()) sections.push(buffer.trim());
  return sections.length ? sections : [cleaned.replace(/\n+/g, " ")];
}

export default function AyahTafsirPanel({
  surah,
  ayah,
  lang,
  onLangChange,
  onClose,
}: AyahTafsirPanelProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fontZoom, setFontZoom] = useState(100);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const edition = TAFSIR_EDITIONS[lang];

  const sections = useMemo(() => splitTafsirSections(text), [text]);

  useEffect(() => {
    setFontZoom(loadFontZoom());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setText("");
    setFocusIndex(null);
    fetchTafsirAyah(lang, surah, ayah)
      .then((value) => {
        if (!cancelled) {
          setText(value);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Tafsir could not be loaded for this ayah. Try again or switch language.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [lang, surah, ayah]);

  function bumpFont(direction: 1 | -1) {
    setFontZoom((current) => {
      const next = Math.min(FONT_MAX, Math.max(FONT_MIN, current + direction * FONT_STEP));
      try {
        window.localStorage.setItem(FONT_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div
      className="hq-tafsir-panel"
      role="region"
      aria-label={`Tafsir for ${surah}:${ayah}`}
      dir="ltr"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="hq-tafsir-head">
        <div className="hq-tafsir-title">
          <strong>Tafsir</strong>
          <span>
            {edition.name} · {edition.author}
          </span>
        </div>
        <div className="hq-tafsir-langs" role="tablist" aria-label="Tafsir language">
          <button
            type="button"
            role="tab"
            aria-selected={lang === "ur"}
            className={lang === "ur" ? "is-on" : ""}
            onClick={() => onLangChange("ur")}
          >
            اردو
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={lang === "en"}
            className={lang === "en" ? "is-on" : ""}
            onClick={() => onLangChange("en")}
          >
            English
          </button>
        </div>
        <div className="hq-tafsir-font" role="group" aria-label="Tafsir font size">
          <button
            type="button"
            className="hq-icon-btn"
            aria-label="Decrease tafsir font size"
            disabled={fontZoom <= FONT_MIN}
            onClick={() => bumpFont(-1)}
          >
            <Minus size={14} />
          </button>
          <span aria-live="polite">{fontZoom}%</span>
          <button
            type="button"
            className="hq-icon-btn"
            aria-label="Increase tafsir font size"
            disabled={fontZoom >= FONT_MAX}
            onClick={() => bumpFont(1)}
          >
            <Plus size={14} />
          </button>
        </div>
        <button type="button" className="hq-icon-btn" aria-label="Close tafsir" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      {loading && <p className="hq-muted">Loading tafsir…</p>}
      {error && <p className="hq-tafsir-error">{error}</p>}
      {!loading && !error && text && (
        <div
          className={`hq-tafsir-body ${lang === "ur" ? "is-urdu" : "is-english"}`}
          style={{ ["--hq-tafsir-zoom" as string]: fontZoom / 100 }}
          dir={lang === "ur" ? "rtl" : "ltr"}
          lang={lang === "ur" ? "ur" : "en"}
        >
          <div className="hq-tafsir-rail" aria-hidden="true" />
          <div className="hq-tafsir-sections">
            {sections.map((section, index) => {
              const isHeading =
                section.length < 72 &&
                !/[.!?۔؟]$/.test(section) &&
                (/^[A-Z][\w\s,'’:-]+$/.test(section) || /:$/.test(section));
              return (
                <p
                  key={`${index}-${section.slice(0, 28)}`}
                  className={`hq-tafsir-section ${isHeading ? "is-heading" : ""} ${focusIndex === index ? "is-focus" : ""}`}
                  onMouseEnter={() => setFocusIndex(index)}
                  onMouseLeave={() => setFocusIndex((current) => (current === index ? null : current))}
                  onFocus={() => setFocusIndex(index)}
                  onBlur={() => setFocusIndex((current) => (current === index ? null : current))}
                  tabIndex={0}
                >
                  {section}
                </p>
              );
            })}
          </div>
        </div>
      )}
      <p className="hq-tafsir-note">
        Sunni educational reference · Not a fatwa. {surah}:{ayah}
      </p>
    </div>
  );
}

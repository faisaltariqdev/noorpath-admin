"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight, Eye, EyeOff, Minus, Pause, Play, Plus, Volume2, VolumeX } from "lucide-react";
import { loadPara } from "../data/loadPara";
import { RECITERS, recitationUrlFor } from "../data/reciters";
import { getPara, paraStartLabel, surahArabic, surahName } from "../data/paras";
import { loadTajweedMap } from "../data/tajweed";
import { hasBookmark } from "../state/progress";
import { bumpZoom, loadPrefs, savePrefs, ZOOM_MAX, ZOOM_MIN } from "../state/prefs";
import type { HolyQuranPrefs, HolyQuranProgress, InkMode, QuranAyah, ReaderLayout, ReaderTarget } from "../types";
import ColorfulLetters from "./ColorfulLetters";
import HoverLetters from "./HoverLetters";
import { wrapTajweedGlyphs } from "../data/colorfulLetters";

interface QuranReaderProps {
  target: ReaderTarget;
  progress: HolyQuranProgress;
  onRemember: (position: { para: number; surah: number; ayah: number }) => void;
  onBookmark: (bookmark: { kind: "ayah" | "para" | "surah"; para: number; surah?: number; ayah?: number }) => void;
  onChangePara: (para: number) => void;
}

export default function QuranReader({ target, progress, onRemember, onBookmark, onChangePara }: QuranReaderProps) {
  const para = getPara(target.para);
  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prefs, setPrefs] = useState<HolyQuranPrefs>(() => loadPrefs());
  const [tajweed, setTajweed] = useState<Map<string, string>>(new Map());
  const [playingGlobal, setPlayingGlobal] = useState<number | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const [toolsHidden, setToolsHidden] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<QuranAyah[]>([]);

  useEffect(() => {
    setPrefs(loadPrefs());
    try {
      setToolsHidden(window.localStorage.getItem("noorpath-hq-tools-hidden") === "1");
    } catch {
      /* keep default */
    }
  }, []);

  function updatePrefs(patch: Partial<HolyQuranPrefs>) {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      savePrefs(next);
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    audioRef.current?.pause();
    queueRef.current = [];
    setPlayingGlobal(null);
    loadPara(target.para)
      .then((file) => {
        if (cancelled) return;
        setAyahs(file.ayahs);
        const start = file.ayahs.findIndex((row) => row.surah === target.surah && row.ayah === target.ayah);
        setFocusIdx(start >= 0 ? start : 0);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("This Para could not be loaded.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [target.para]);

  useEffect(() => {
    if (prefs.ink !== "tajweed") {
      setTajweed(new Map());
      return;
    }
    let cancelled = false;
    loadTajweedMap(target.para)
      .then((map) => {
        if (!cancelled) setTajweed(map);
      })
      .catch(() => {
        if (!cancelled) setTajweed(new Map());
      });
    return () => {
      cancelled = true;
    };
  }, [prefs.ink, target.para]);

  useEffect(() => {
    if (!target.surah || !target.ayah || ayahs.length === 0) return;
    const node = document.getElementById(`hq-ayah-${target.surah}-${target.ayah}`);
    node?.scrollIntoView({ block: "center" });
  }, [ayahs, prefs.layout, target.ayah, target.surah]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = prefs.muted;
  }, [prefs.muted]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const groups = useMemo(() => {
    const map = new Map<number, QuranAyah[]>();
    ayahs.forEach((ayah) => {
      const list = map.get(ayah.surah) || [];
      list.push(ayah);
      map.set(ayah.surah, list);
    });
    return Array.from(map.entries());
  }, [ayahs]);

  function remember(ayah: QuranAyah) {
    onRemember({ para: ayah.juz, surah: ayah.surah, ayah: ayah.ayah });
  }

  function stopAudio() {
    audioRef.current?.pause();
    queueRef.current = [];
    setPlayingGlobal(null);
  }

  function playQueue(start: QuranAyah, sequential: boolean) {
    remember(start);
    if (playingGlobal === start.global && !sequential) {
      stopAudio();
      return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.muted = prefs.muted;
    const from = ayahs.findIndex((row) => row.global === start.global);
    if (from >= 0) setFocusIdx(from);
    queueRef.current = sequential && from >= 0 ? ayahs.slice(from) : [start];
    playNext();
  }

  function playNext() {
    const next = queueRef.current[0];
    if (!next || !audioRef.current) {
      setPlayingGlobal(null);
      return;
    }
    remember(next);
    const idx = ayahs.findIndex((row) => row.global === next.global);
    if (idx >= 0) setFocusIdx(idx);
    audioRef.current.muted = prefs.muted;
    audioRef.current.src = recitationUrlFor(prefs.reciter, next.global);
    setPlayingGlobal(next.global);
    void audioRef.current.play();
    audioRef.current.onended = () => {
      queueRef.current = queueRef.current.slice(1);
      playNext();
    };
  }

  if (!para) return <p className="hq-muted">Para not found.</p>;

  const letters = prefs.ink === "letters";
  const tajweedOn = prefs.ink === "tajweed";

  return (
    <div className={`hq-reader hq-ink-${prefs.ink}${toolsHidden ? " is-compact" : ""}`} style={{ "--hq-zoom": prefs.zoom / 100 } as React.CSSProperties}>
      {toolsHidden ? (
        <aside className="hq-side-dock" aria-label="Reader controls">
          <button
            type="button"
            className="hq-btn hq-btn-ghost"
            onClick={() => {
              setToolsHidden(false);
              window.localStorage.setItem("noorpath-hq-tools-hidden", "0");
            }}
          >
            <Eye size={14} /> Show
          </button>
          <button
            type="button"
            className="hq-btn hq-btn-gold"
            onClick={() => (playingGlobal ? stopAudio() : ayahs[0] && playQueue(ayahs[0], true))}
          >
            {playingGlobal ? <><Pause size={14} /> Stop</> : <><Play size={14} /> Listen</>}
          </button>
        </aside>
      ) : null}
      <div className="hq-reader-body">
      {!toolsHidden && (
      <div className="hq-reader-toolbar">
        <div>
          <p className="hq-kicker">Holy Quran · Para {para.number}</p>
          <h2>{para.name} · {para.arabicName}</h2>
          <p className="hq-muted">{paraStartLabel(para)} · {para.ayahCount} ayahs</p>
        </div>
        <div className="hq-reader-tools">
          <div className="hq-layout-switch" role="tablist" aria-label="Reading format">
            <button type="button" role="tab" aria-selected={prefs.layout === "line"} className={prefs.layout === "line" ? "is-on" : ""} onClick={() => updatePrefs({ layout: "line" as ReaderLayout })}>Line by line</button>
            <button type="button" role="tab" aria-selected={prefs.layout === "page"} className={prefs.layout === "page" ? "is-on" : ""} onClick={() => updatePrefs({ layout: "page" as ReaderLayout })}>Full page</button>
          </div>
          <div className="hq-layout-switch" role="tablist" aria-label="Text color">
            <button type="button" role="tab" aria-selected={prefs.ink === "normal"} className={prefs.ink === "normal" ? "is-on" : ""} onClick={() => updatePrefs({ ink: "normal" as InkMode })}>Normal</button>
            <button type="button" role="tab" aria-selected={letters} className={letters ? "is-on" : ""} onClick={() => updatePrefs({ ink: "letters" as InkMode })}>Colorful Letters</button>
            <button type="button" role="tab" aria-selected={tajweedOn} className={tajweedOn ? "is-on" : ""} onClick={() => updatePrefs({ ink: "tajweed" as InkMode })}>Tajweed</button>
          </div>
          <div className="hq-layout-switch" role="tablist" aria-label="Reciter">
            {RECITERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={prefs.reciter === item.id}
                aria-disabled={!item.enabled}
                disabled={!item.enabled}
                className={prefs.reciter === item.id ? "is-on" : ""}
                title={item.enabled ? item.name : `${item.shortName} — Coming soon. A complete verified Qariah edition is not available yet.`}
                onClick={() => item.enabled && updatePrefs({ reciter: item.id })}
              >
                {item.shortName}{item.enabled ? "" : " (Soon)"}
              </button>
            ))}
          </div>
          <div className="hq-zoom" role="group" aria-label="Text zoom">
            <button type="button" className="hq-icon-btn" aria-label="Zoom out" disabled={prefs.zoom <= ZOOM_MIN} onClick={() => updatePrefs({ zoom: bumpZoom(prefs.zoom, -1) })}>
              <Minus size={15} />
            </button>
            <span>{prefs.zoom}%</span>
            <button type="button" className="hq-icon-btn" aria-label="Zoom in" disabled={prefs.zoom >= ZOOM_MAX} onClick={() => updatePrefs({ zoom: bumpZoom(prefs.zoom, 1) })}>
              <Plus size={15} />
            </button>
          </div>
          <button
            type="button"
            className={`hq-icon-btn ${prefs.muted ? "is-on" : ""}`}
            aria-pressed={prefs.muted}
            aria-label={prefs.muted ? "Unmute recitation" : "Mute recitation"}
            onClick={() => updatePrefs({ muted: !prefs.muted })}
          >
            {prefs.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            type="button"
            className="hq-btn hq-btn-gold"
            onClick={() => (playingGlobal ? stopAudio() : ayahs[0] && playQueue(ayahs[0], true))}
          >
            {playingGlobal ? <><Pause size={14} /> Stop</> : <><Play size={14} /> Listen</>}
          </button>
          <button
            type="button"
            className={`hq-icon-btn ${hasBookmark(progress, "para", para.number) ? "is-on" : ""}`}
            aria-label={hasBookmark(progress, "para", para.number) ? "Remove Para bookmark" : "Bookmark this Para"}
            onClick={() => onBookmark({ kind: "para", para: para.number })}
          >
            <Bookmark size={16} />
          </button>
          <button
            type="button"
            className="hq-btn hq-btn-ghost"
            onClick={() => {
              setToolsHidden(true);
              window.localStorage.setItem("noorpath-hq-tools-hidden", "1");
            }}
          >
            <EyeOff size={14} /> Hide
          </button>
        </div>
      </div>
      )}

      {loading && <p className="hq-muted">Loading verified Uthmani text…</p>}
      {error && <p className="hq-muted">{error}</p>}
      {letters && !loading && (
        <p className="hq-muted hq-letters-legend">
          Colorful Letters — visual colors only, not Tajweed rules.
          <span className="hq-cl hq-cl-0" aria-hidden="true">●</span>
          <span className="hq-cl hq-cl-1" aria-hidden="true">●</span>
          <span className="hq-cl hq-cl-2" aria-hidden="true">●</span>
          <span className="hq-cl hq-cl-3" aria-hidden="true">●</span>
          <span className="hq-cl hq-cl-4" aria-hidden="true">●</span>
          <span className="hq-cl hq-cl-5" aria-hidden="true">●</span>
        </p>
      )}
      {tajweedOn && !loading && (
        <p className="hq-muted hq-tajweed-note">
          {tajweed.size > 0 ? "Tajweed colors mark pronunciation rules." : "Tajweed colors load when available."}
        </p>
      )}
      {!loading && (
        <p className="hq-muted hq-mode-help">
          {prefs.ink === "normal" && "Normal Arabic — traditional verified Uthmani text."}
          {letters && "Colorful Letters — visual letter colors for learners, not Tajweed rules."}
          {tajweedOn && "Tajweed — recitation-rule colors. A teacher is still needed for correct Tajweed."}
        </p>
      )}
      <div className="hq-practice">
        <button
          type="button"
          className={`hq-btn ${prefs.practice ? "hq-btn-gold" : "hq-btn-ghost"}`}
          aria-pressed={prefs.practice}
          onClick={() => updatePrefs({ practice: !prefs.practice })}
        >
          Practice
        </button>
        {prefs.practice && ayahs[focusIdx] && (
          <>
            <span className="hq-muted">
              {surahName(ayahs[focusIdx].surah)} {ayahs[focusIdx].surah}:{ayahs[focusIdx].ayah}
            </span>
            <button type="button" className="hq-btn hq-btn-ghost" disabled={focusIdx <= 0} onClick={() => {
              const next = Math.max(0, focusIdx - 1);
              setFocusIdx(next);
              remember(ayahs[next]);
            }}>
              Previous ayah
            </button>
            <button type="button" className="hq-btn hq-btn-ghost" onClick={() => playQueue(ayahs[focusIdx], false)}>
              Repeat ayah
            </button>
            <button type="button" className="hq-btn hq-btn-gold" onClick={() => playQueue(ayahs[focusIdx], true)}>
              Listen from here
            </button>
            <button type="button" className="hq-btn hq-btn-ghost" disabled={focusIdx >= ayahs.length - 1} onClick={() => {
              const next = Math.min(ayahs.length - 1, focusIdx + 1);
              setFocusIdx(next);
              remember(ayahs[next]);
            }}>
              Next ayah
            </button>
          </>
        )}
      </div>

      {!loading && !error && prefs.layout === "line" && (
        <div className="hq-reader-page" dir="rtl">
          {groups.map(([surah, rows]) => (
            <section key={surah} aria-labelledby={`hq-surah-${surah}`}>
              <SurahHead surah={surah} para={para.number} progress={progress} onBookmark={onBookmark} />
              {rows.map((ayah) => {
                const current = playingGlobal === ayah.global || (progress.lastPosition?.surah === ayah.surah && progress.lastPosition?.ayah === ayah.ayah);
                const bookmarked = hasBookmark(progress, "ayah", para.number, ayah.surah, ayah.ayah);
                return (
                  <article
                    key={`${ayah.surah}-${ayah.ayah}`}
                    id={`hq-ayah-${ayah.surah}-${ayah.ayah}`}
                    className={`hq-ayah ${current ? "is-current" : ""}`}
                    onFocus={() => remember(ayah)}
                    onClick={() => remember(ayah)}
                  >
                    <AyahBody ayah={ayah} ink={prefs.ink} tajweed={tajweed} as="p" />
                    <div className="hq-ayah-meta" dir="ltr">
                      <span className="hq-ayah-num" aria-label={`Ayah ${ayah.ayah}`}>{ayah.ayah}</span>
                      <button
                        type="button"
                        className={`hq-icon-btn ${bookmarked ? "is-on" : ""}`}
                        aria-label={bookmarked ? "Remove ayah bookmark" : "Bookmark ayah"}
                        onClick={(event) => {
                          event.stopPropagation();
                          onBookmark({ kind: "ayah", para: para.number, surah: ayah.surah, ayah: ayah.ayah });
                        }}
                      >
                        <Bookmark size={15} />
                      </button>
                      <button
                        type="button"
                        className="hq-icon-btn"
                        aria-label={playingGlobal === ayah.global ? "Pause recitation" : "Play recitation"}
                        onClick={(event) => {
                          event.stopPropagation();
                          playQueue(ayah, false);
                        }}
                      >
                        {playingGlobal === ayah.global ? <Pause size={15} /> : <Play size={15} />}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          ))}
        </div>
      )}

      {!loading && !error && prefs.layout === "page" && (
        <div className="hq-reader-page" dir="rtl">
          {groups.map(([surah, rows]) => (
            <section key={surah} aria-labelledby={`hq-surah-${surah}`}>
              <SurahHead surah={surah} para={para.number} progress={progress} onBookmark={onBookmark} />
              <p className="hq-mushaf">
                {rows.map((ayah) => (
                  <span
                    key={`${ayah.surah}-${ayah.ayah}`}
                    id={`hq-ayah-${ayah.surah}-${ayah.ayah}`}
                    className={`hq-mushaf-ayah ${playingGlobal === ayah.global ? "is-playing" : ""}`}
                    title="Listen from this ayah"
                    onClick={() => playQueue(ayah, true)}
                  >
                    <AyahBody ayah={ayah} ink={prefs.ink} tajweed={tajweed} as="span" />
                    <span className="hq-mushaf-num" dir="ltr">{ayah.ayah}</span>
                  </span>
                ))}
              </p>
            </section>
          ))}
        </div>
      )}

      <div className="hq-reader-nav">
        <button
          type="button"
          className="hq-btn hq-btn-ghost"
          disabled={para.number <= 1}
          onClick={() => onChangePara(para.number - 1)}
        >
          <ChevronLeft size={16} /> Previous Para
        </button>
        <span className="hq-muted hq-listen-hint">
          {prefs.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          {prefs.muted ? "Voice muted" : "Tap an ayah to listen"}
        </span>
        <button
          type="button"
          className="hq-btn"
          disabled={para.number >= 30}
          onClick={() => onChangePara(para.number + 1)}
        >
          Next Para <ChevronRight size={16} />
        </button>
      </div>
      </div>
    </div>
  );
}

function AyahBody({
  ayah,
  ink,
  tajweed,
  as: Tag,
}: {
  ayah: QuranAyah;
  ink: InkMode;
  tajweed: Map<string, string>;
  as: "p" | "span";
}) {
  if (ink === "tajweed") {
    const html = tajweed.get(`${ayah.surah}:${ayah.ayah}`);
    if (html) {
      return <Tag className="hq-ayah-text" dangerouslySetInnerHTML={{ __html: wrapTajweedGlyphs(html) }} />;
    }
    return <Tag className="hq-ayah-text"><HoverLetters text={ayah.text} /></Tag>;
  }
  if (ink === "letters") {
    return <Tag className="hq-ayah-text"><ColorfulLetters text={ayah.text} /></Tag>;
  }
  return <Tag className="hq-ayah-text"><HoverLetters text={ayah.text} /></Tag>;
}

function SurahHead({
  surah,
  para,
  progress,
  onBookmark,
}: {
  surah: number;
  para: number;
  progress: HolyQuranProgress;
  onBookmark: QuranReaderProps["onBookmark"];
}) {
  return (
    <div className="hq-surah-head">
      <h3 id={`hq-surah-${surah}`}>{surahArabic(surah)}</h3>
      <p className="hq-muted" dir="ltr">{surah}. {surahName(surah)}</p>
      <button
        type="button"
        className={`hq-icon-btn ${hasBookmark(progress, "surah", para, surah) ? "is-on" : ""}`}
        aria-label={`Bookmark ${surahName(surah)}`}
        onClick={() => onBookmark({ kind: "surah", para, surah })}
      >
        <Bookmark size={16} />
      </button>
    </div>
  );
}

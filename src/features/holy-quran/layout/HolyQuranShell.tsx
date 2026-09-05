"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import NoorPathLogo from "@/components/NoorPathLogo";
import { SURAHS } from "../../../data/surahs";
import { PARAS, TOTAL_AYAHS, TOTAL_PARAS, TOTAL_SURAHS, paraEndLabel, paraStartLabel, startingParaForSurah, surahArabic, surahName } from "../data/paras";
import { QURAN_FACTS, classificationLabel } from "../data/quranFacts";
import type { KnowledgeAction } from "../data/quranKnowledge";
import { searchQuranIndex } from "../data/search";
import { holyQuranFontVariables } from "../fonts";
import "../holy-quran.css";
import QuranGuide from "../screens/QuranGuide";
import QuranKnowledge from "../screens/QuranKnowledge";
import QuranReader from "../screens/QuranReader";
import { formatHistoryTime, hasBookmark, paraReadCount, progressPercent } from "../state/progress";
import { useHolyQuranState } from "../state/useHolyQuranState";
import type { HolyQuranSurface, HolyQuranView, QuranSearchHit, ReaderTarget } from "../types";

const PARA_ACCENTS = ["#1b5e42", "#c9a84c", "#0f766e", "#b45309", "#1d4ed8", "#be185d"];

function portalHome(surface: HolyQuranSurface): string {
  if (surface === "tutor") return "/tutor";
  if (surface === "parent") return "/parent";
  return "/admin";
}

export default function HolyQuranShell({ surface = "admin" }: { surface?: HolyQuranSurface }) {
  const { progress, rememberPosition, flipBookmark, wipeHistory } = useHolyQuranState();
  const [view, setView] = useState<HolyQuranView>("home");
  const [reader, setReader] = useState<ReaderTarget>({ para: 1 });
  const [query, setQuery] = useState("");
  const [surahFilter, setSurahFilter] = useState<"all" | "Meccan" | "Medinan">("all");
  const percent = progressPercent(progress);

  function openPara(para: number, surah?: number, ayah?: number) {
    setReader({ para, surah, ayah });
    setView("reader");
  }

  const searchHits = useMemo(() => searchQuranIndex(query), [query]);
  const filteredSurahs = useMemo(() => {
    if (!query.trim()) return SURAHS;
    const numbers = new Set(searchHits.filter((hit) => hit.kind === "surah" && hit.surah).map((hit) => hit.surah));
    return SURAHS.filter((surah) => numbers.has(surah.number));
  }, [query, searchHits]);
  const filteredParas = useMemo(() => {
    if (!query.trim()) return PARAS;
    const numbers = new Set(searchHits.filter((hit) => hit.kind === "para").map((hit) => hit.para));
    return PARAS.filter((para) => numbers.has(para.number));
  }, [query, searchHits]);

  function openHit(hit: QuranSearchHit) {
    openPara(hit.para, hit.surah, hit.ayah || (hit.kind === "surah" ? 1 : undefined));
    setQuery("");
  }

  function applyAction(action: KnowledgeAction) {
    if (action.view === "reader") {
      openPara(action.para || 1, action.surah, action.ayah);
      return;
    }
    setView(action.view);
  }

  return (
    <div className={`hq-root ${holyQuranFontVariables}`}>
      <div className="hq-shell">
        <aside className="hq-sidebar">
          <div className="hq-brand">
            <Image src="/favicon.png" alt="" width={40} height={40} style={{ borderRadius: 10 }} />
            <div>
              <NoorPathLogo size="sm" dark />
              <div className="hq-brand-copy">
                Holy Quran
                <small>Interactive Learning</small>
              </div>
            </div>
          </div>
          {([
            ["home", "Home"],
            ["paras", "30 Paras"],
            ["surahs", "Surahs"],
            ["knowledge", "Knowledge / Q&A"],
            ["guide", "How to Read"],
            ["history", "History"],
            ["bookmarks", "Bookmarks"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`hq-nav-btn ${view === id || (id === "paras" && view === "reader") ? "is-active" : ""}`}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
          <Link className="hq-back" href={portalHome(surface)}>← Back to portal</Link>
        </aside>

        <main id="hq-main" className="hq-main">
          <div className="hq-global-search">
            <Search size={18} aria-hidden="true" />
            <input
              className="hq-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && searchHits[0]) openHit(searchHits[0]);
                if (event.key === "Escape") setQuery("");
              }}
              placeholder="Search Surah, Para, or ayah — e.g. Yasin, para 30, 2:255"
              aria-label="Search Surah or Para"
            />
            {query.trim() && (
              <div className="hq-search-results" role="listbox" aria-label="Search results">
                {searchHits.length === 0 ? (
                  <p className="hq-muted">No Surah or Para matched "{query.trim()}".</p>
                ) : (
                  searchHits.map((hit) => (
                    <button
                      key={`${hit.kind}-${hit.para}-${hit.surah || 0}`}
                      type="button"
                      className="hq-search-hit"
                      onClick={() => openHit(hit)}
                    >
                      <span className="hq-kicker">{hit.kind === "para" ? "Para" : "Surah"}</span>
                      <strong>{hit.title}</strong>
                      <span className="hq-muted">{hit.subtitle}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {view === "home" && (
            <>
              <section className="hq-hero">
                <p className="hq-kicker">Complete Quran</p>
                <p className="hq-hero-arabic">القرآن الكريم</p>
                <h1>Holy Quran — 30 Paras</h1>
                <p className="hq-muted">
                  Verified Tanzil Uthmani Arabic text. Live 1-to-1 academy reading companion.
                </p>
                <div className="hq-stats">
                  <div className="hq-stat"><strong>{TOTAL_PARAS}</strong><span>Paras / Juz</span></div>
                  <div className="hq-stat"><strong>{TOTAL_SURAHS}</strong><span>Surahs</span></div>
                  <div className="hq-stat"><strong>{TOTAL_AYAHS}</strong><span>Ayahs</span></div>
                </div>
                <div className="hq-progress-bar" aria-label={`Quran progress ${percent}%`}>
                  <span style={{ width: `${Math.max(percent, 0)}%` }} />
                </div>
                <p className="hq-muted" style={{ marginTop: 8 }}>{percent}% opened · {progress.readAyahKeys.length} of {TOTAL_AYAHS}</p>
              </section>

              {progress.lastPosition && (
                <button
                  type="button"
                  className="hq-continue"
                  onClick={() => openPara(progress.lastPosition!.para, progress.lastPosition!.surah, progress.lastPosition!.ayah)}
                >
                  <p className="hq-kicker">Continue Reading</p>
                  <h2 style={{ margin: "8px 0" }}>
                    Para {progress.lastPosition.para} · {surahName(progress.lastPosition.surah)} {progress.lastPosition.surah}:{progress.lastPosition.ayah}
                  </h2>
                  <p className="hq-muted">Start again from the ayah you left.</p>
                  <span className="hq-btn hq-btn-gold">Continue Reading</span>
                </button>
              )}

              <div className="hq-chip-row">
                <button type="button" className="hq-btn hq-btn-ghost" onClick={() => setView("surahs")}>Surahs</button>
                <button type="button" className="hq-btn hq-btn-ghost" onClick={() => setView("paras")}>Paras</button>
                <button type="button" className="hq-btn hq-btn-ghost" onClick={() => setView("knowledge")}>Knowledge</button>
                <button type="button" className="hq-btn hq-btn-ghost" onClick={() => setView("guide")}>How to Read</button>
                {progress.lastPosition && (
                  <button type="button" className="hq-btn hq-btn-gold" onClick={() => openPara(progress.lastPosition!.para, progress.lastPosition!.surah, progress.lastPosition!.ayah)}>
                    Continue
                  </button>
                )}
              </div>

              <section className="hq-panel">
                <h2>30 Paras</h2>
                <p className="hq-muted">Open any Juz. Only that Para’s verified text is loaded.</p>
                <div className="hq-grid" style={{ marginTop: 16 }}>
                  {PARAS.slice(0, 6).map((para) => (
                    <ParaCard
                      key={para.number}
                      para={para}
                      read={paraReadCount(progress, para)}
                      bookmarked={hasBookmark(progress, "para", para.number)}
                      onOpen={() => openPara(para.number)}
                      onBookmark={() => flipBookmark({ kind: "para", para: para.number })}
                    />
                  ))}
                </div>
                <button type="button" className="hq-btn" style={{ marginTop: 16 }} onClick={() => setView("paras")}>
                  View all 30 Paras
                </button>
              </section>
            </>
          )}

          {view === "paras" && (
            <section className="hq-panel">
              <h2>30 Paras / Juz</h2>
              {filteredParas.length === 0 ? (
                <p className="hq-muted" style={{ marginTop: 16 }}>No Para matched that search.</p>
              ) : (
                <div className="hq-grid" style={{ marginTop: 16 }}>
                  {filteredParas.map((para) => (
                    <ParaCard
                      key={para.number}
                      para={para}
                      read={paraReadCount(progress, para)}
                      bookmarked={hasBookmark(progress, "para", para.number)}
                      onOpen={() => openPara(para.number)}
                      onBookmark={() => flipBookmark({ kind: "para", para: para.number })}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {view === "knowledge" && <QuranKnowledge onAction={applyAction} />}
          {view === "guide" && <QuranGuide onAction={applyAction} />}

          {view === "surahs" && (
            <section className="hq-panel">
              <h2>Browse Surahs</h2>
              <p className="hq-muted">
                {QURAN_FACTS.surahs} Surahs · {QURAN_FACTS.makki} Makki · {QURAN_FACTS.madani} Madani in this reader’s list.
              </p>
              <div className="hq-chip-row" role="tablist" aria-label="Makki or Madani">
                <button type="button" className={`hq-chip ${surahFilter === "all" ? "is-on" : ""}`} onClick={() => setSurahFilter("all")}>All</button>
                <button type="button" className={`hq-chip ${surahFilter === "Meccan" ? "is-on" : ""}`} onClick={() => setSurahFilter("Meccan")}>Makki ({QURAN_FACTS.makki})</button>
                <button type="button" className={`hq-chip ${surahFilter === "Medinan" ? "is-on" : ""}`} onClick={() => setSurahFilter("Medinan")}>Madani ({QURAN_FACTS.madani})</button>
              </div>
              {filteredSurahs.filter((surah) => surahFilter === "all" || surah.type === surahFilter).length === 0 ? (
                <p className="hq-muted" style={{ marginTop: 16 }}>No Surah matched that search.</p>
              ) : (
              <div className="hq-grid" style={{ marginTop: 16 }}>
                {filteredSurahs.filter((surah) => surahFilter === "all" || surah.type === surahFilter).map((surah) => {
                  const para = startingParaForSurah(surah.number);
                  return (
                    <button
                      key={surah.number}
                      type="button"
                      className="hq-surah-card"
                      onClick={() => openPara(para, surah.number, 1)}
                    >
                      <span className="hq-para-num">{surah.number}</span>
                      <h3>{surah.name}</h3>
                      <p className="hq-arabic-name">{surah.arabic}</p>
                      <p className="hq-muted">Surah {surah.number} · {classificationLabel(surah.type)} · {surah.verses} ayahs · Para {para}</p>
                      <div className="hq-card-actions">
                        <span className="hq-btn">Read</span>
                        <span
                          role="button"
                          tabIndex={0}
                          className={`hq-icon-btn ${hasBookmark(progress, "surah", para, surah.number) ? "is-on" : ""}`}
                          aria-label={`Bookmark ${surah.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            flipBookmark({ kind: "surah", para, surah: surah.number });
                          }}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter" && event.key !== " ") return;
                            event.preventDefault();
                            event.stopPropagation();
                            flipBookmark({ kind: "surah", para, surah: surah.number });
                          }}
                        >
                          ★
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              )}
            </section>
          )}

          {view === "history" && (
            <section className="hq-panel">
              <h2>Reading history</h2>
              <p className="hq-muted">Places you opened, and the ayah you left.</p>
              {progress.lastPosition && (
                <button
                  type="button"
                  className="hq-continue"
                  style={{ marginTop: 16 }}
                  onClick={() => openPara(progress.lastPosition!.para, progress.lastPosition!.surah, progress.lastPosition!.ayah)}
                >
                  <p className="hq-kicker">Left here</p>
                  <h2 style={{ margin: "8px 0" }}>
                    Para {progress.lastPosition.para} · {surahName(progress.lastPosition.surah)} {progress.lastPosition.surah}:{progress.lastPosition.ayah}
                  </h2>
                  <span className="hq-btn hq-btn-gold">Continue Reading</span>
                </button>
              )}
              {(progress.readingHistory || []).length === 0 ? (
                <p className="hq-muted" style={{ marginTop: 16 }}>No history yet. Open a Surah or Para and tap an ayah.</p>
              ) : (
                <>
                  <div className="hq-grid" style={{ marginTop: 16 }}>
                    {(progress.readingHistory || []).map((item) => (
                      <button
                        key={`${item.surah}:${item.ayah}:${item.leftAt}`}
                        type="button"
                        className="hq-bookmark-card"
                        onClick={() => openPara(item.para, item.surah, item.ayah)}
                      >
                        <p className="hq-kicker">Para {item.para}</p>
                        <h3>{surahName(item.surah)} {item.surah}:{item.ayah}</h3>
                        <p className="hq-arabic-name">{surahArabic(item.surah)}</p>
                        <p className="hq-muted">Left {formatHistoryTime(item.leftAt)}</p>
                      </button>
                    ))}
                  </div>
                  <button type="button" className="hq-btn hq-btn-ghost" style={{ marginTop: 16 }} onClick={wipeHistory}>
                    Clear history
                  </button>
                </>
              )}
            </section>
          )}

          {view === "bookmarks" && (
            <section className="hq-panel">
              <h2>Bookmarks</h2>
              {progress.bookmarks.length === 0 ? (
                <p className="hq-muted">No bookmarks yet. Save a Para, Surah, or ayah while reading.</p>
              ) : (
                <div className="hq-grid" style={{ marginTop: 16 }}>
                  {progress.bookmarks.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="hq-bookmark-card"
                      onClick={() => openPara(item.para, item.surah, item.ayah)}
                    >
                      <p className="hq-kicker">{item.kind}</p>
                      <h3>
                        {item.kind === "para" && `Para ${item.para}`}
                        {item.kind === "surah" && `${surahName(item.surah || 1)} · ${surahArabic(item.surah || 1)}`}
                        {item.kind === "ayah" && `${surahName(item.surah || 1)} ${item.surah}:${item.ayah}`}
                      </h3>
                      <p className="hq-muted">Open saved place</p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {view === "reader" && (
            <QuranReader
              target={reader}
              progress={progress}
              onRemember={rememberPosition}
              onBookmark={flipBookmark}
              onChangePara={(para) => openPara(para)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function ParaCard({
  para,
  read,
  bookmarked,
  onOpen,
  onBookmark,
}: {
  para: (typeof PARAS)[number];
  read: number;
  bookmarked: boolean;
  onOpen: () => void;
  onBookmark: () => void;
}) {
  const pct = Math.round((read / para.ayahCount) * 100);
  return (
    <article className="hq-para-card" style={{ "--hq-accent": PARA_ACCENTS[(para.number - 1) % PARA_ACCENTS.length] } as React.CSSProperties}>
      <button type="button" onClick={onOpen} style={{ all: "unset", cursor: "pointer", display: "block", width: "100%" }}>
        <span className="hq-para-num">{para.number}</span>
        <h3>{para.name}</h3>
        <p className="hq-arabic-name">{para.arabicName}</p>
        <p className="hq-muted">Starts {paraStartLabel(para)}</p>
        <p className="hq-muted">Ends {paraEndLabel(para)}</p>
        <div className="hq-progress-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
      </button>
      <div className="hq-card-actions">
        <button type="button" className="hq-btn" onClick={onOpen}>Continue</button>
        <button
          type="button"
          className={`hq-icon-btn ${bookmarked ? "is-on" : ""}`}
          aria-label={bookmarked ? "Remove Para bookmark" : "Bookmark Para"}
          onClick={onBookmark}
        >
          ★
        </button>
      </div>
    </article>
  );
}

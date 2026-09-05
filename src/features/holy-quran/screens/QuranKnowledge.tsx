"use client";

import { useMemo, useState } from "react";
import { KNOWLEDGE_CATEGORIES, QURAN_KNOWLEDGE, type KnowledgeAction } from "../data/quranKnowledge";
import { QURAN_FACTS } from "../data/quranFacts";

export default function QuranKnowledge({ onAction }: { onAction: (action: KnowledgeAction) => void }) {
  const [category, setCategory] = useState<string>("All");
  const items = useMemo(
    () => (category === "All" ? QURAN_KNOWLEDGE : QURAN_KNOWLEDGE.filter((item) => item.category === category)),
    [category],
  );

  return (
    <section className="hq-panel">
      <h2>Knowledge / Q&A</h2>
      <p className="hq-muted">
        Short educational answers about the Quran and this reader. This is not a fatwa or tafsir service.
      </p>
      <div className="hq-stats hq-facts-row">
        <div className="hq-stat"><strong>{QURAN_FACTS.surahs}</strong><span>Surahs</span></div>
        <div className="hq-stat"><strong>{QURAN_FACTS.paras}</strong><span>Paras / Juz</span></div>
        <div className="hq-stat"><strong>{QURAN_FACTS.ayahs.toLocaleString()}</strong><span>Ayahs in this count</span></div>
        <div className="hq-stat"><strong>{QURAN_FACTS.makki}</strong><span>Makki</span></div>
        <div className="hq-stat"><strong>{QURAN_FACTS.madani}</strong><span>Madani</span></div>
      </div>
      <div className="hq-chip-row" role="tablist" aria-label="Knowledge categories">
        <button type="button" className={`hq-chip ${category === "All" ? "is-on" : ""}`} onClick={() => setCategory("All")}>All</button>
        {KNOWLEDGE_CATEGORIES.map((name) => (
          <button key={name} type="button" className={`hq-chip ${category === name ? "is-on" : ""}`} onClick={() => setCategory(name)}>
            {name}
          </button>
        ))}
      </div>
      <div className="hq-faq-list">
        {items.map((item) => (
          <article key={item.id} className="hq-faq">
            <h3>{item.question}</h3>
            <p>{item.shortAnswer}</p>
            {item.details && <p className="hq-muted">{item.details}</p>}
            {item.relatedAction && (
              <button type="button" className="hq-btn" onClick={() => onAction(item.relatedAction!)}>
                {item.relatedAction.label}
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

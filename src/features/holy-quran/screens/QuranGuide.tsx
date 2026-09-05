"use client";

import { READING_GUIDE, READING_GUIDE_INTRO } from "../data/readingGuide";
import type { KnowledgeAction } from "../data/quranKnowledge";

export default function QuranGuide({ onAction }: { onAction: (action: KnowledgeAction) => void }) {
  return (
    <section className="hq-panel">
      <h2>How to Read Quran</h2>
      <p className="hq-muted">{READING_GUIDE_INTRO}</p>
      <div className="hq-guide-list">
        {READING_GUIDE.map((section) => (
          <article key={section.id} className="hq-faq">
            <h3>{section.title}</h3>
            {section.body.map((line) => (
              <p key={line} className="hq-muted">{line}</p>
            ))}
          </article>
        ))}
      </div>
      <div className="hq-chip-row" style={{ marginTop: 16 }}>
        <button type="button" className="hq-btn" onClick={() => onAction({ label: "Start Para 1", view: "reader", para: 1, surah: 1, ayah: 1 })}>
          Start reading
        </button>
        <button type="button" className="hq-btn hq-btn-ghost" onClick={() => onAction({ label: "Browse Surahs", view: "surahs" })}>
          Browse Surahs
        </button>
        <button type="button" className="hq-btn hq-btn-ghost" onClick={() => onAction({ label: "Open Knowledge", view: "knowledge" })}>
          Open Knowledge
        </button>
      </div>
    </section>
  );
}

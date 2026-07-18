"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface PageTurnViewerProps {
  pages: { id: string; label: string; content: ReactNode }[];
  initialPage?: number;
  reducedMotion: boolean;
  direction?: "rtl" | "ltr";
  onPageChange?: (index: number) => void;
}

export default function PageTurnViewer({
  pages,
  initialPage = 0,
  reducedMotion,
  direction = "rtl",
  onPageChange,
}: PageTurnViewerProps) {
  const [page, setPage] = useState(() => Math.max(0, Math.min(initialPage, Math.max(0, pages.length - 1))));
  const [turnDirection, setTurnDirection] = useState<1 | -1>(1);
  const [spread, setSpread] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const touchStart = useRef<number | null>(null);
  const pageStep = spread ? 2 : 1;
  const safePage = pages.length ? Math.max(0, Math.min(page, pages.length - 1)) : 0;

  const goTo = useCallback((next: number) => {
    const bounded = Math.max(0, Math.min(next, pages.length - 1));
    if (bounded === page) return;
    setTurnDirection(bounded > page ? 1 : -1);
    setPage(bounded);
    onPageChange?.(bounded);
    window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  }, [onPageChange, page, pages.length]);

  useEffect(() => {
    if (!pages.length) return;
    if (page > pages.length - 1) setPage(pages.length - 1);
  }, [page, pages.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Home") goTo(0);
      else if (event.key === "End") goTo(pages.length - 1);
      else if (event.key === "ArrowLeft") goTo(safePage + (direction === "rtl" ? pageStep : -pageStep));
      else if (event.key === "ArrowRight") goTo(safePage + (direction === "rtl" ? -pageStep : pageStep));
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [direction, goTo, pageStep, pages.length, safePage]);

  if (!pages.length) return null;
  const current = pages[safePage];
  if (!current) return null;
  const visiblePages = (spread ? pages.slice(safePage, safePage + 2) : [current]).filter(Boolean);

  return (
    <section
      className="relative"
      aria-roledescription="digital book"
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
        touchStart.current = null;
        if (Math.abs(delta) < 48) return;
        goTo(page + (delta < 0 ? pageStep : -pageStep));
      }}
    >
      <h2 ref={headingRef} tabIndex={-1} className="qaida-live-region">
        {current.label}, page {safePage + 1} of {pages.length}
      </h2>

      <div className="relative min-h-[420px] overflow-x-hidden overflow-y-visible">
        <AnimatePresence mode="wait" custom={turnDirection}>
          <motion.div
            key={current.id}
            custom={turnDirection}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: turnDirection * 8, x: turnDirection * 36 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: turnDirection * -8, x: turnDirection * -24 }}
            transition={{ duration: reducedMotion ? 0.12 : 0.34, ease: "easeOut" }}
            style={{ transformPerspective: 1200 }}
          >
            <div className={spread ? "grid gap-4 lg:grid-cols-2" : ""}>
              {visiblePages.map((visiblePage) => (
                <div key={visiblePage.id} className="min-w-0">{visiblePage.content}</div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(page - pageStep)}
          disabled={page === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-900/10 bg-white px-4 py-2 text-sm font-black text-emerald-800 shadow-sm disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
        >
          <ChevronRight size={18} aria-hidden="true" /> Previous
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSpread((value) => !value);
              setPage(0);
            }}
            className="hidden min-h-11 rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-800 lg:inline-flex lg:items-center"
            aria-pressed={spread}
          >
            {spread ? "Single page" : "Two-page spread"}
          </button>
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800" aria-live="polite">
            {spread && page + 1 < pages.length ? `${page + 1}–${page + 2}` : page + 1} / {pages.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => goTo(page + pageStep)}
          disabled={page + pageStep >= pages.length}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-black text-white shadow-sm disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
        >
          Next <ChevronLeft size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

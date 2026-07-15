"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useMemo } from "react";
import type { Letter } from "../types";
import { speakArabic } from "../audio/speech";

interface Card {
  id: string;
  letter: Letter;
  type: "arabic" | "name";
  flipped: boolean;
  matched: boolean;
}

interface MemoryMatchProps {
  letters: Letter[];
  onComplete: (stars: 1 | 2 | 3) => void;
  onClose: () => void;
}

export default function MemoryMatch({ letters, onComplete, onClose }: MemoryMatchProps) {
  const PAIR_COUNT = 4;
  const [moves, setMoves] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const [cards, setCards] = useState<Card[]>(() => {
    const pool = [...letters].sort(() => Math.random() - 0.5).slice(0, PAIR_COUNT);
    const deck: Card[] = [];
    pool.forEach((l) => {
      deck.push({ id: `ar-${l.id}`, letter: l, type: "arabic", flipped: false, matched: false });
      deck.push({ id: `nm-${l.id}`, letter: l, type: "name", flipped: false, matched: false });
    });
    return deck.sort(() => Math.random() - 0.5);
  });

  const handleFlip = useCallback((cardId: string) => {
    if (selected.length === 2) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const newSelected = [...selected, cardId];
    setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, flipped: true } : c));

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSelected.map((id) => cards.find((c) => c.id === id)!);
      speakArabic(b.letter.letter);

      if (a.letter.id === b.letter.id && a.type !== b.type) {
        // Match!
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.letter.id === a.letter.id ? { ...c, matched: true } : c
          ));
          setSelected([]);
          setCards((prev) => {
            if (prev.every((c) => c.matched)) {
              setFinished(true);
              const stars = moves <= PAIR_COUNT + 2 ? 3 : moves <= PAIR_COUNT * 2 ? 2 : 1;
              setTimeout(() => onComplete(stars as 1 | 2 | 3), 1000);
            }
            return prev;
          });
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) => prev.map((c) => newSelected.includes(c.id) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 1000);
      }
    } else {
      setSelected(newSelected);
    }
  }, [selected, cards, moves, onComplete]);

  const matchedCount = cards.filter((c) => c.matched).length / 2;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">← Back</button>
        <div className="flex gap-4 text-sm font-semibold text-gray-700">
          <span>🃏 Moves: {moves}</span>
          <span>✅ Matches: {matchedCount}/{PAIR_COUNT}</span>
        </div>
      </div>

      <div className="px-4 text-center text-sm font-medium text-gray-600">
        Match the Arabic letter with its English name!
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="grid grid-cols-4 gap-3 h-full">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              className="perspective-1000 relative"
              onClick={() => handleFlip(card.id)}
              whileTap={!card.flipped && !card.matched ? { scale: 0.97 } : {}}
              aria-label={card.flipped || card.matched ? `${card.letter.name} ${card.type === "arabic" ? "Arabic" : "name"}` : "Hidden card"}
            >
              <motion.div
                className="relative h-full w-full"
                animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                transition={{ duration: 0.4, type: "tween" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Back */}
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg" style={{ backfaceVisibility: "hidden" }}>
                  <span className="text-2xl text-white">📖</span>
                </div>

                {/* Front */}
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-2xl shadow-lg ${
                    card.matched
                      ? "bg-gradient-to-br from-yellow-200 to-amber-300"
                      : "bg-white border-2 border-green-200"
                  }`}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  {card.type === "arabic" ? (
                    <span className="text-3xl font-black text-green-800" style={{ fontFamily: "serif", direction: "rtl" }}>
                      {card.letter.letter}
                    </span>
                  ) : (
                    <span className="text-center text-xs font-bold text-gray-700 px-1">
                      {card.letter.name}
                    </span>
                  )}
                  {card.matched && (
                    <div className="absolute -right-1 -top-1 text-base">⭐</div>
                  )}
                </div>
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {finished && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="rounded-3xl bg-white p-8 text-center shadow-2xl"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="text-5xl">🎊</div>
              <h2 className="mt-2 text-xl font-black text-gray-900">All Matched!</h2>
              <p className="text-gray-500">Completed in {moves} moves</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

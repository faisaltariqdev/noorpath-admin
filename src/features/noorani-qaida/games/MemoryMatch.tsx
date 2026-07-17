"use client";
import { motion } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import type { Letter } from "../types";
import { qaidaAudio } from "../audio/QaidaAudioService";
import GameShell from "./GameShell";

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
  const [timeLeft, setTimeLeft] = useState(90);
  const [paused, setPaused] = useState(false);

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
      void qaidaAudio.pronounce({ key: `letter-${b.letter.id}`, fallbackText: b.letter.letter });

      if (a.letter.id === b.letter.id && a.type !== b.type) {
        // Match!
        setTimeout(() => {
          setCards((prev) => {
            const nextCards = prev.map((card) =>
              card.letter.id === a.letter.id ? { ...card, matched: true } : card
            );
            if (nextCards.every((card) => card.matched)) {
              setFinished(true);
              const finalMoves = moves + 1;
              const stars: 1 | 2 | 3 = finalMoves <= PAIR_COUNT + 2 ? 3 : finalMoves <= PAIR_COUNT * 2 ? 2 : 1;
              setTimeout(() => onComplete(stars as 1 | 2 | 3), 1000);
            }
            return nextCards;
          });
          setSelected([]);
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

  useEffect(() => {
    if (finished || paused) return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setFinished(true);
          const matched = cards.filter((card) => card.matched).length / 2;
          const stars: 1 | 2 | 3 = matched >= 3 ? 2 : 1;
          window.setTimeout(() => onComplete(stars), 900);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cards, finished, onComplete, paused]);

  const matchedCount = cards.filter((c) => c.matched).length / 2;

  return (
    <GameShell
      title="Memory Match"
      instruction="Match each Arabic letter with its English name."
      icon="🃏"
      round={matchedCount}
      totalRounds={PAIR_COUNT}
      score={matchedCount}
      mistakes={Math.max(0, moves - matchedCount)}
      timeLeft={timeLeft}
      timeLimit={90}
      finished={finished}
      stars={moves <= PAIR_COUNT + 2 ? 3 : moves <= PAIR_COUNT * 2 ? 2 : 1}
      resultText={`Matched ${matchedCount} pairs in ${moves} moves.`}
      onClose={onClose}
      paused={paused}
      onPauseToggle={() => setPaused((value) => !value)}
    >
      <div className="h-full min-h-[320px] overflow-hidden">
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
                    <span className="qaida-arabic block text-3xl font-black leading-[1.4] text-green-800" lang="ar" dir="rtl">
                      {card.letter.letter}
                    </span>
                  ) : (
                    <span className="flex flex-col items-center gap-0.5 px-1 text-center">
                      <span className="text-xs font-bold leading-tight text-gray-700">{card.letter.name}</span>
                      <span className="text-[10px] font-semibold leading-tight text-gray-500" dir="ltr">“{card.letter.sound}”</span>
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
    </GameShell>
  );
}

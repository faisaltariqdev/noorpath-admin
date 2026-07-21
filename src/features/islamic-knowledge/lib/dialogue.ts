import type { LessonStep } from "../types";

export interface DialogueLine {
  id: string;
  text: string;
  emoji?: string;
  kind: "talk" | "challenge" | "cheer";
}

const MAX_WORDS = 12;

/** Split long copy into kid-friendly 1–2 line dialogue chunks. */
export function splitIntoLines(text: string, maxWords = MAX_WORDS): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const sentences = cleaned.split(/(?<=[.!?…])\s+/).filter(Boolean);
  const lines: string[] = [];

  for (const sentence of sentences) {
    const words = sentence.split(" ");
    if (words.length <= maxWords) {
      lines.push(sentence);
      continue;
    }
    for (let i = 0; i < words.length; i += maxWords) {
      lines.push(words.slice(i, i + maxWords).join(" "));
    }
  }
  return lines;
}

/** Build conversation turns for one curriculum step (does not change curriculum data). */
export function buildDialogueForStep(step: LessonStep, stepIndex: number): DialogueLine[] {
  const lines: DialogueLine[] = [];
  const prefix = `${step.id}-d`;

  if (stepIndex === 0) {
    lines.push({ id: `${prefix}-hi`, text: "Assalamu Alaikum!", emoji: "👋", kind: "talk" });
    lines.push({ id: `${prefix}-hello`, text: "Hello little explorer!", emoji: "😊", kind: "talk" });
  } else {
    lines.push({
      id: `${prefix}-cont`,
      text: "Ready for the next bit?",
      emoji: "✨",
      kind: "talk",
    });
  }

  if (step.title) {
    lines.push({
      id: `${prefix}-title`,
      text: step.title.length > 40 ? step.title.slice(0, 38) + "…" : step.title,
      emoji: step.emoji || "🌟",
      kind: "talk",
    });
  }

  for (const [i, chunk] of splitIntoLines(step.text).entries()) {
    lines.push({
      id: `${prefix}-t${i}`,
      text: chunk,
      emoji: i === 0 ? step.emoji : undefined,
      kind: "talk",
    });
  }

  if (step.type === "tap" || step.type === "fact") {
    lines.push({
      id: `${prefix}-chal`,
      text: `Tap the ${step.emoji || "⭐"} to reveal!`,
      emoji: "👆",
      kind: "challenge",
    });
  } else if (step.mascotMood === "cheer") {
    lines.push({
      id: `${prefix}-cheer`,
      text: "You're doing amazing!",
      emoji: "🎉",
      kind: "cheer",
    });
  }

  return lines;
}

export function highlightKeywords(text: string): Array<{ t: string; hot?: boolean }> {
  const hot = ["Allah", "Quran", "Prophet", "Jannah", "Ramadan", "Eid", "Masjid", "Salah", "Islam", "Alif"];
  const parts: Array<{ t: string; hot?: boolean }> = [];
  const re = new RegExp(`\\b(${hot.join("|")})\\b`, "gi");
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ t: text.slice(last, m.index) });
    parts.push({ t: m[0], hot: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ t: text.slice(last) });
  return parts.length ? parts : [{ t: text }];
}

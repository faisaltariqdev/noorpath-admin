import type { AgeBand, IKLesson, LessonStep } from "../types";
import { hashString } from "./quiz";

export interface DialogueLine {
  id: string;
  text: string;
  emoji?: string;
  kind: "talk" | "challenge" | "cheer" | "recap";
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

/* ---------- Variety pools (picked by a stable hash, so no two lessons in a row sound identical) ---------- */

const OPENERS: Record<AgeBand, string[]> = {
  young: [
    "Assalamu Alaikum, little explorer!",
    "Assalamu Alaikum! Ready for a story?",
    "Assalamu Alaikum, my friend! Let's learn together.",
    "Assalamu Alaikum! Sit close — this one is special.",
  ],
  mid: [
    "Assalamu Alaikum! Let's discover something meaningful.",
    "Assalamu Alaikum! I've been waiting to show you this.",
    "Assalamu Alaikum, explorer! Today's topic is a favourite of mine.",
    "Assalamu Alaikum! Let's open this lesson together.",
  ],
  older: [
    "Assalamu Alaikum! Let's think deeply about this one.",
    "Assalamu Alaikum. Ready to build real understanding?",
    "Assalamu Alaikum! Today we go a little deeper.",
    "Assalamu Alaikum. Let's connect ideas, not just memorise them.",
  ],
};

const TIP_INTROS = [
  "Here's a tip you can use today.",
  "One small habit for you.",
  "Let me share something practical.",
  "This part is for real life.",
];

const CHALLENGES: Record<AgeBand, string[]> = {
  young: [
    "Tap the {emoji} to see the surprise!",
    "Can you tap the picture? Go on!",
    "Touch the {emoji} — something is hiding there!",
    "Your turn! Tap the picture.",
  ],
  mid: [
    "Tap the {emoji} to explore it!",
    "Explore the picture — tap it and look closely.",
    "Tap the picture, then tell me what you notice.",
    "Your turn: tap the {emoji} to discover more.",
  ],
  older: [
    "Explore the visual, then explain the key idea in your own words.",
    "Tap the picture and think: how would you teach this to a younger sibling?",
    "Tap to explore, then say the main idea in one sentence.",
    "Open the visual and find the detail that matters most.",
  ],
};

const CHEERS = [
  "You connected that idea beautifully!",
  "MashaAllah, keep building your knowledge!",
  "Strong learning — let's keep going!",
  "That's it! Your heart and mind are both learning.",
  "Wonderful. I can tell you're really listening.",
  "Excellent — you'll remember this one.",
];

function pick<T>(pool: T[], key: string): T {
  return pool[hashString(key) % pool.length];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z\u0600-\u06FF ]/g, " ").replace(/\s+/g, " ").trim();
}

/** True when the step copy itself already greets the child — avoids the "double Salam" bug. */
export function stepHasGreeting(text: string): boolean {
  return /assalamu\s*alaikum|salam\b/i.test(text);
}

/**
 * Build conversation turns for one curriculum step (does not change curriculum data).
 * Titles are NOT spoken as lines any more — they render as the scene heading — which
 * removes the "Allah is One" → "Allah is One. We only worship…" echo.
 */
export function buildDialogueForStep(step: LessonStep, stepIndex: number, ageBand: AgeBand = "mid", lessonId = ""): DialogueLine[] {
  const lines: DialogueLine[] = [];
  const prefix = `${step.id}-d`;
  const maxWords = ageBand === "young" ? 8 : ageBand === "older" ? 14 : MAX_WORDS;
  const variety = `${lessonId}:${step.id}`;

  if (stepIndex === 0 && !stepHasGreeting(step.text)) {
    lines.push({ id: `${prefix}-hi`, text: pick(OPENERS[ageBand], variety), emoji: "👋", kind: "talk" });
  } else if (stepIndex > 0 && step.type === "mascot") {
    lines.push({ id: `${prefix}-noori`, text: pick(TIP_INTROS, variety), emoji: "💡", kind: "talk" });
  }

  for (const [i, chunk] of splitIntoLines(step.text, maxWords).entries()) {
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
      text: pick(CHALLENGES[ageBand], variety).replace("{emoji}", step.emoji || "picture"),
      emoji: "👆",
      kind: "challenge",
    });
  } else if (step.mascotMood === "cheer" && stepIndex > 0) {
    lines.push({ id: `${prefix}-cheer`, text: pick(CHEERS, variety), emoji: "🎉", kind: "cheer" });
  }

  return lines;
}

/**
 * A short recap spoken before the quiz: "Today we learned: … ". Built from the step
 * titles, skipping the intro so the child hears the actual ideas.
 */
export function buildRecap(lesson: IKLesson, ageBand: AgeBand): DialogueLine[] {
  const ideas = lesson.steps
    .slice(1)
    .map((step) => step.title?.trim())
    .filter((title): title is string => Boolean(title))
    .filter((title, index, all) => all.findIndex((t) => normalize(t) === normalize(title)) === index)
    .slice(0, ageBand === "young" ? 3 : 5);

  if (ideas.length === 0) return [];
  const list = ideas.length > 1 ? `${ideas.slice(0, -1).join(", ")} and ${ideas[ideas.length - 1]}` : ideas[0];
  return [
    {
      id: `${lesson.id}-recap`,
      text: ageBand === "young" ? `We learned: ${list}.` : `Quick recap — today we learned about ${list}.`,
      emoji: "📚",
      kind: "recap",
    },
    {
      id: `${lesson.id}-recap-go`,
      text: ageBand === "older" ? "Now show me what stayed with you. Quiz time!" : "Ready to play the quiz? Let's go!",
      emoji: "🎮",
      kind: "talk",
    },
  ];
}

export function highlightKeywords(text: string): Array<{ t: string; hot?: boolean }> {
  const hot = ["Allah", "Quran", "Prophet", "Jannah", "Ramadan", "Eid", "Masjid", "Salah", "Islam", "Alif", "Sunnah", "Sabr", "Shukr", "Wudu", "Iman", "Kalima", "Adab", "Akhlaq", "Dua", "Halal", "Haram", "Seerah", "Hijrah", "Sahabah"];
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

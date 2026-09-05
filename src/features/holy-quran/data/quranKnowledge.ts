import { paraForAyah } from "./paras";
import { QURAN_FACTS } from "./quranFacts";

export type KnowledgeView = "home" | "paras" | "surahs" | "reader" | "bookmarks" | "history" | "knowledge" | "guide";

export interface KnowledgeAction {
  label: string;
  view: KnowledgeView;
  para?: number;
  surah?: number;
  ayah?: number;
}

export interface QuranKnowledgeItem {
  id: string;
  category: string;
  question: string;
  shortAnswer: string;
  details?: string;
  relatedAction?: KnowledgeAction;
}

export const KNOWLEDGE_CATEGORIES = [
  "Quran Basics",
  "Surahs",
  "Ayahs",
  "Makki & Madani",
  "Para / Juz",
  "Reading & Recitation",
  "Reader Help",
  "Bookmarks & Progress",
  "Audio & Reciters",
] as const;

export const QURAN_KNOWLEDGE: QuranKnowledgeItem[] = [
  {
    id: "surah-count",
    category: "Quran Basics",
    question: "How many Surahs are in the Quran?",
    shortAnswer: `${QURAN_FACTS.surahs} Surahs.`,
    details: "This reader uses the standard 114-chapter arrangement of the Quran.",
    relatedAction: { label: "Browse Surahs", view: "surahs" },
  },
  {
    id: "para-count",
    category: "Para / Juz",
    question: "How many Paras / Juz are there?",
    shortAnswer: `${QURAN_FACTS.paras} Paras (Juz).`,
    details: "A Juz, commonly called a Para, is one of 30 equal reading divisions used to organize completion of the Quran.",
    relatedAction: { label: "Open 30 Paras", view: "paras" },
  },
  {
    id: "ayah-count",
    category: "Ayahs",
    question: "How many Ayahs are there?",
    shortAnswer: `This application counts ${QURAN_FACTS.ayahs.toLocaleString()} ayahs.`,
    details: "Scholarly counting traditions may differ in how verse endings are numbered. NoorPath uses the Tanzil Uthmani convention of 6,236 ayahs.",
    relatedAction: { label: "Start reading", view: "reader", para: 1, surah: 1, ayah: 1 },
  },
  {
    id: "what-surah",
    category: "Surahs",
    question: "What is a Surah?",
    shortAnswer: "A Surah is a chapter of the Quran.",
    details: `There are ${QURAN_FACTS.surahs} Surahs. Each has a name, a number, and a counted number of ayahs.`,
    relatedAction: { label: "Browse Surahs", view: "surahs" },
  },
  {
    id: "what-ayah",
    category: "Ayahs",
    question: "What is an Ayah?",
    shortAnswer: "An Ayah is a verse of the Quran.",
    details: "Ayahs are numbered within each Surah. This reader also keeps a global ayah number for recitation audio.",
  },
  {
    id: "what-juz",
    category: "Para / Juz",
    question: "What is a Juz / Para?",
    shortAnswer: "A Juz, commonly called a Para, is one of the 30 divisions of the Quran used to help organize reading.",
    relatedAction: { label: "Open Para 1", view: "reader", para: 1 },
  },
  {
    id: "juz-vs-surah",
    category: "Para / Juz",
    question: "What is the difference between a Juz and a Surah?",
    shortAnswer: "A Surah is a chapter. A Juz/Para is a 30-part reading division that can start or end in the middle of a Surah.",
    relatedAction: { label: "View Paras", view: "paras" },
  },
  {
    id: "longest-surah",
    category: "Surahs",
    question: "Which is the longest Surah?",
    shortAnswer: `${QURAN_FACTS.longestSurah.name} (${QURAN_FACTS.longestSurah.arabic}) — ${QURAN_FACTS.longestSurah.verses} ayahs.`,
    relatedAction: { label: `Open ${QURAN_FACTS.longestSurah.name}`, view: "reader", para: 1, surah: QURAN_FACTS.longestSurah.number, ayah: 1 },
  },
  {
    id: "shortest-surah",
    category: "Surahs",
    question: "Which is the shortest Surah?",
    shortAnswer: `${QURAN_FACTS.shortestSurah.name} (${QURAN_FACTS.shortestSurah.arabic}) — ${QURAN_FACTS.shortestSurah.verses} ayahs.`,
    relatedAction: { label: `Open ${QURAN_FACTS.shortestSurah.name}`, view: "reader", para: paraForAyah(QURAN_FACTS.shortestSurah.number, 1), surah: QURAN_FACTS.shortestSurah.number, ayah: 1 },
  },
  {
    id: "first-surah",
    category: "Surahs",
    question: "What is the first Surah in the Quran?",
    shortAnswer: `${QURAN_FACTS.firstSurah.number}. ${QURAN_FACTS.firstSurah.name} (${QURAN_FACTS.firstSurah.arabic}).`,
    relatedAction: { label: "Open Al-Fatiha", view: "reader", para: 1, surah: 1, ayah: 1 },
  },
  {
    id: "last-surah",
    category: "Surahs",
    question: "What is the last Surah?",
    shortAnswer: `${QURAN_FACTS.lastSurah.number}. ${QURAN_FACTS.lastSurah.name} (${QURAN_FACTS.lastSurah.arabic}).`,
    relatedAction: { label: "Open An-Nas", view: "reader", para: 30, surah: 114, ayah: 1 },
  },
  {
    id: "longest-ayah",
    category: "Ayahs",
    question: "What is the longest Ayah?",
    shortAnswer: "In this counting convention, the longest ayah is commonly identified as Al-Baqarah 2:282.",
    details: "Verse-length comparisons follow the numbering used in this Uthmani text. Scholarly descriptions of “longest” can refer to words or written length.",
    relatedAction: { label: "Open 2:282", view: "reader", para: paraForAyah(2, 282), surah: 2, ayah: 282 },
  },
  {
    id: "makki-count",
    category: "Makki & Madani",
    question: "How many Makki Surahs?",
    shortAnswer: `${QURAN_FACTS.makki} Makki Surahs in this reader’s classification.`,
    details: "Classification follows this app’s Surah list. A few Surahs are discussed differently in some scholarly traditions.",
    relatedAction: { label: "Browse Makki Surahs", view: "surahs" },
  },
  {
    id: "madani-count",
    category: "Makki & Madani",
    question: "How many Madani Surahs?",
    shortAnswer: `${QURAN_FACTS.madani} Madani Surahs in this reader’s classification.`,
    relatedAction: { label: "Browse Surahs", view: "surahs" },
  },
  {
    id: "what-makki",
    category: "Makki & Madani",
    question: "What does Makki mean?",
    shortAnswer: "Makki (Meccan) Surahs are those classified as revealed before the Hijrah to Madinah.",
    details: "This is a teaching label for learning and browsing, not a detailed historical tafsir.",
  },
  {
    id: "what-madani",
    category: "Makki & Madani",
    question: "What does Madani mean?",
    shortAnswer: "Madani (Medinan) Surahs are those classified as revealed after the Hijrah to Madinah.",
  },
  {
    id: "bismillah",
    category: "Reading & Recitation",
    question: "What is Bismillah?",
    shortAnswer: "Bismillah (“In the name of Allah, the Most Merciful, the Most Compassionate”) opens most Surahs in the written Quran.",
    details: "This reader displays the verified Uthmani text as imported. It does not recreate Bismillah separately.",
  },
  {
    id: "tawbah",
    category: "Reading & Recitation",
    question: "Why is At-Tawbah different regarding Bismillah?",
    shortAnswer: "Surah At-Tawbah (9) is the Surah that does not begin with Bismillah in the standard written mushaf.",
    details: "This is a well-known feature of the written Quran. For detailed legal discussion, consult a qualified scholar.",
    relatedAction: { label: "Open At-Tawbah", view: "reader", para: 10, surah: 9, ayah: 1 },
  },
  {
    id: "search-help",
    category: "Reader Help",
    question: "How can I search the Quran?",
    shortAnswer: "Use the search bar to find a Surah or Para by name, Arabic name, or number. You can also type an ayah such as 2:255.",
  },
  {
    id: "continue-help",
    category: "Reader Help",
    question: "How can I continue from where I stopped?",
    shortAnswer: "Home and History show Continue Reading from your last ayah.",
    relatedAction: { label: "Open History", view: "history" },
  },
  {
    id: "bookmark-help",
    category: "Bookmarks & Progress",
    question: "How do bookmarks work?",
    shortAnswer: "Save a Para, Surah, or ayah with the bookmark control, then reopen it from Bookmarks.",
    relatedAction: { label: "Open Bookmarks", view: "bookmarks" },
  },
  {
    id: "normal-mode",
    category: "Reader Help",
    question: "What is Normal Arabic mode?",
    shortAnswer: "Traditional verified Uthmani Arabic text, without letter colors or Tajweed colors.",
    relatedAction: { label: "Open the reader", view: "reader", para: 1 },
  },
  {
    id: "letters-mode",
    category: "Reader Help",
    question: "What is Colorful Letters mode?",
    shortAnswer: "A learning presentation that colors Arabic letter groups so beginners can recognize letters more easily.",
    details: "It does not change the Arabic letters or harakat. Colors are visual only — not Tajweed rules.",
  },
  {
    id: "tajweed-mode",
    category: "Reader Help",
    question: "What is Tajweed mode?",
    shortAnswer: "Color-coded recitation-rule highlighting to support Tajweed learning.",
    details: "It is separate from Colorful Letters. Correct Tajweed still requires a teacher.",
  },
  {
    id: "play-ayah",
    category: "Audio & Reciters",
    question: "How do I play an Ayah?",
    shortAnswer: "In Line by line, use the play button on that ayah. In Full page, tap the ayah to listen from there.",
  },
  {
    id: "listen-para",
    category: "Audio & Reciters",
    question: "How do I listen continuously?",
    shortAnswer: "Press Listen to play the current Para from the start, or tap an ayah in Full page to continue from that ayah.",
  },
  {
    id: "change-reciter",
    category: "Audio & Reciters",
    question: "How do I change the reciter?",
    shortAnswer: "Use Male / Female in the reader toolbar. Male is Mishary Alafasy. Female is listed only when a complete verified Qariah edition is available.",
  },
  {
    id: "open-para",
    category: "Reader Help",
    question: "How do I open a Para?",
    shortAnswer: "Open 30 Paras in the sidebar, or search “para 12”.",
    relatedAction: { label: "Open Paras", view: "paras" },
  },
  {
    id: "open-surah",
    category: "Reader Help",
    question: "How do I open a Surah?",
    shortAnswer: "Open Surahs in the sidebar, or search by name or number.",
    relatedAction: { label: "Browse Surahs", view: "surahs" },
  },
];

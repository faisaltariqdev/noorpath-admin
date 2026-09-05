export interface GuideSection {
  id: string;
  title: string;
  body: string[];
}

export const READING_GUIDE_INTRO = "Educational guidance for using this Holy Quran reader. For detailed religious rulings, consult a qualified scholar.";

export const READING_GUIDE: GuideSection[] = [
  {
    id: "before",
    title: "1. Before reading",
    body: [
      "Many teachers recommend being in a state of cleanliness / wudu before reciting the Quran.",
      "Sit respectfully and choose a quiet time if you can.",
      "This is educational guidance, not a legal ruling.",
    ],
  },
  {
    id: "adab",
    title: "2. Basic adab",
    body: [
      "Read with care and without rushing.",
      "Listen attentively when recitation audio is playing.",
      "Keep the written Arabic unchanged — this reader never edits Quran letters or harakat.",
    ],
  },
  {
    id: "start",
    title: "3. Starting recitation",
    body: [
      "It is commonly taught to seek refuge with Allah (A‘udhu billahi min ash-shaytan ir-rajim) before recitation.",
      "Most Surahs in the written mushaf begin with Bismillah. Surah At-Tawbah does not.",
      "Ask a teacher if you are unsure about pronunciation.",
    ],
  },
  {
    id: "modes",
    title: "4. Choosing reader mode",
    body: [
      "Normal Arabic: traditional Uthmani text.",
      "Colorful Letters: visual letter colors for learners. Not Tajweed rules.",
      "Tajweed: recitation-rule colors to support learning. A teacher is still needed for correct Tajweed.",
    ],
  },
  {
    id: "listen",
    title: "5. Listening to recitation",
    body: [
      "Use Listen for the Para, or play a single ayah.",
      "Male reciter is Mishary Rashid Alafasy (complete, ayah-by-ayah).",
      "Female reciter appears only when a complete verified human Qariah edition is available. No AI voice is used.",
      "Mute silences the voice without changing the text.",
    ],
  },
  {
    id: "search",
    title: "6. Searching",
    body: [
      "Search by Surah name, Arabic name, or number.",
      "Search by Para name or “para 30”.",
      "Jump to an ayah with a reference such as 2:255.",
    ],
  },
  {
    id: "bookmarks",
    title: "7. Bookmarks",
    body: [
      "Bookmark a Para, Surah, or ayah while reading.",
      "Bookmarks stay separate from History and Continue Reading.",
    ],
  },
  {
    id: "continue",
    title: "8. Continue reading",
    body: [
      "When you tap or listen to an ayah, this reader remembers that place on this device.",
      "Use Continue Reading on Home or History to return there.",
    ],
  },
  {
    id: "surah-nav",
    title: "9. Surah navigation",
    body: [
      "Open Surahs to browse all 114 chapters.",
      "Filter Makki or Madani using this app’s Surah list.",
      "Each card shows name, Arabic name, ayah count, and Para.",
    ],
  },
  {
    id: "para-nav",
    title: "10. Para / Juz navigation",
    body: [
      "Open 30 Paras to see start and end points from the imported dataset.",
      "Only that Para’s verified text is loaded.",
      "Previous Para and Next Para move through the 30 Juz.",
    ],
  },
];

// ============================================================
// NoorPath Kids Studio — Noorani Qaida Lesson Data
// 18 lessons covering complete Noorani Qaida curriculum
// ============================================================

export interface QaidaItem {
  arabic: string;       // Arabic character/text
  label: string;        // Romanised name
  urdu?: string;        // Urdu name (optional)
  color: string;        // Tailwind/hex color for this letter
}

export interface Lesson {
  id: number;
  title: string;
  titleUrdu: string;
  description: string;
  emoji: string;
  color: string;        // Card accent color
  bgGradient: string;   // Background gradient for lesson screen
  items: QaidaItem[];
}

// ── Color pool for letters (cycling rainbow-ish) ──
const COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
  "#10B981", "#F59E0B", "#6366F1", "#14B8A6",
  "#E11D48", "#7C3AED", "#0EA5E9", "#16A34A",
  "#DC2626", "#9333EA", "#0284C7", "#15803D",
  "#B45309", "#4F46E5", "#0891B2", "#BE185D",
  "#047857", "#1D4ED8", "#6D28D9", "#9D174D",
];

const LESSONS: Lesson[] = [
  // ─── Lesson 1: Single Letters (Huroof) — Part 1 ───────────
  {
    id: 1,
    title: "Arabic Alphabet - Part 1",
    titleUrdu: "عربی حروف - حصہ اول",
    description: "Learn the first 14 Arabic letters with sounds",
    emoji: "🌙",
    color: "#8B5CF6",
    bgGradient: "linear-gradient(135deg, #1a0533 0%, #2d1b69 60%, #4c1d95 100%)",
    items: [
      { arabic: "ا", label: "Alif", urdu: "الف", color: COLORS[0] },
      { arabic: "ب", label: "Ba", urdu: "با", color: COLORS[1] },
      { arabic: "ت", label: "Ta", urdu: "تا", color: COLORS[2] },
      { arabic: "ث", label: "Sa", urdu: "ثا", color: COLORS[3] },
      { arabic: "ج", label: "Jeem", urdu: "جیم", color: COLORS[4] },
      { arabic: "ح", label: "Hay", urdu: "حا", color: COLORS[5] },
      { arabic: "خ", label: "Kha", urdu: "خا", color: COLORS[6] },
      { arabic: "د", label: "Dal", urdu: "دال", color: COLORS[7] },
      { arabic: "ذ", label: "Zal", urdu: "ذال", color: COLORS[8] },
      { arabic: "ر", label: "Ra", urdu: "را", color: COLORS[9] },
      { arabic: "ز", label: "Zay", urdu: "زا", color: COLORS[10] },
      { arabic: "س", label: "Seen", urdu: "سین", color: COLORS[11] },
      { arabic: "ش", label: "Sheen", urdu: "شین", color: COLORS[12] },
      { arabic: "ص", label: "Saad", urdu: "صاد", color: COLORS[13] },
    ],
  },

  // ─── Lesson 2: Single Letters — Part 2 ───────────────────
  {
    id: 2,
    title: "Arabic Alphabet - Part 2",
    titleUrdu: "عربی حروف - حصہ دوم",
    description: "Learn the remaining 14 Arabic letters",
    emoji: "⭐",
    color: "#EC4899",
    bgGradient: "linear-gradient(135deg, #1a0033 0%, #831843 60%, #9d174d 100%)",
    items: [
      { arabic: "ض", label: "Daad", urdu: "ضاد", color: COLORS[14] },
      { arabic: "ط", label: "Toay", urdu: "طوا", color: COLORS[15] },
      { arabic: "ظ", label: "Zoay", urdu: "ظوا", color: COLORS[16] },
      { arabic: "ع", label: "Ain", urdu: "عین", color: COLORS[17] },
      { arabic: "غ", label: "Ghain", urdu: "غین", color: COLORS[18] },
      { arabic: "ف", label: "Fa", urdu: "فا", color: COLORS[19] },
      { arabic: "ق", label: "Qaaf", urdu: "قاف", color: COLORS[20] },
      { arabic: "ك", label: "Kaaf", urdu: "کاف", color: COLORS[21] },
      { arabic: "ل", label: "Laam", urdu: "لام", color: COLORS[22] },
      { arabic: "م", label: "Meem", urdu: "میم", color: COLORS[23] },
      { arabic: "ن", label: "Noon", urdu: "نون", color: COLORS[24] },
      { arabic: "و", label: "Waaw", urdu: "واؤ", color: COLORS[25] },
      { arabic: "ه", label: "Ha", urdu: "ہا", color: COLORS[26] },
      { arabic: "ي", label: "Ya", urdu: "یا", color: COLORS[27] },
    ],
  },

  // ─── Lesson 3: Harakat Zabar (Fatha) ─────────────────────
  {
    id: 3,
    title: "Zabar — Fatha",
    titleUrdu: "زبر - فتحہ",
    description: "Letters with Zabar (short 'a' sound)",
    emoji: "✨",
    color: "#F97316",
    bgGradient: "linear-gradient(135deg, #431407 0%, #7c2d12 60%, #9a3412 100%)",
    items: [
      { arabic: "بَ", label: "Ba", color: COLORS[0] },
      { arabic: "تَ", label: "Ta", color: COLORS[1] },
      { arabic: "ثَ", label: "Sa", color: COLORS[2] },
      { arabic: "جَ", label: "Ja", color: COLORS[3] },
      { arabic: "حَ", label: "Ha", color: COLORS[4] },
      { arabic: "خَ", label: "Kha", color: COLORS[5] },
      { arabic: "دَ", label: "Da", color: COLORS[6] },
      { arabic: "رَ", label: "Ra", color: COLORS[7] },
      { arabic: "سَ", label: "Sa", color: COLORS[8] },
      { arabic: "فَ", label: "Fa", color: COLORS[9] },
      { arabic: "قَ", label: "Qa", color: COLORS[10] },
      { arabic: "كَ", label: "Ka", color: COLORS[11] },
      { arabic: "لَ", label: "La", color: COLORS[12] },
      { arabic: "مَ", label: "Ma", color: COLORS[13] },
      { arabic: "نَ", label: "Na", color: COLORS[14] },
    ],
  },

  // ─── Lesson 4: Harakat Zer (Kasra) ───────────────────────
  {
    id: 4,
    title: "Zer — Kasra",
    titleUrdu: "زیر - کسرہ",
    description: "Letters with Zer (short 'i' sound)",
    emoji: "💫",
    color: "#22C55E",
    bgGradient: "linear-gradient(135deg, #052e16 0%, #14532d 60%, #166534 100%)",
    items: [
      { arabic: "بِ", label: "Bi", color: COLORS[0] },
      { arabic: "تِ", label: "Ti", color: COLORS[1] },
      { arabic: "ثِ", label: "Si", color: COLORS[2] },
      { arabic: "جِ", label: "Ji", color: COLORS[3] },
      { arabic: "حِ", label: "Hi", color: COLORS[4] },
      { arabic: "خِ", label: "Khi", color: COLORS[5] },
      { arabic: "دِ", label: "Di", color: COLORS[6] },
      { arabic: "رِ", label: "Ri", color: COLORS[7] },
      { arabic: "سِ", label: "Si", color: COLORS[8] },
      { arabic: "فِ", label: "Fi", color: COLORS[9] },
      { arabic: "قِ", label: "Qi", color: COLORS[10] },
      { arabic: "كِ", label: "Ki", color: COLORS[11] },
      { arabic: "لِ", label: "Li", color: COLORS[12] },
      { arabic: "مِ", label: "Mi", color: COLORS[13] },
      { arabic: "نِ", label: "Ni", color: COLORS[14] },
    ],
  },

  // ─── Lesson 5: Harakat Pesh (Damma) ──────────────────────
  {
    id: 5,
    title: "Pesh — Damma",
    titleUrdu: "پیش - ضمہ",
    description: "Letters with Pesh (short 'u' sound)",
    emoji: "🌟",
    color: "#06B6D4",
    bgGradient: "linear-gradient(135deg, #083344 0%, #164e63 60%, #155e75 100%)",
    items: [
      { arabic: "بُ", label: "Bu", color: COLORS[0] },
      { arabic: "تُ", label: "Tu", color: COLORS[1] },
      { arabic: "ثُ", label: "Su", color: COLORS[2] },
      { arabic: "جُ", label: "Ju", color: COLORS[3] },
      { arabic: "حُ", label: "Hu", color: COLORS[4] },
      { arabic: "خُ", label: "Khu", color: COLORS[5] },
      { arabic: "دُ", label: "Du", color: COLORS[6] },
      { arabic: "رُ", label: "Ru", color: COLORS[7] },
      { arabic: "سُ", label: "Su", color: COLORS[8] },
      { arabic: "فُ", label: "Fu", color: COLORS[9] },
      { arabic: "قُ", label: "Qu", color: COLORS[10] },
      { arabic: "كُ", label: "Ku", color: COLORS[11] },
      { arabic: "لُ", label: "Lu", color: COLORS[12] },
      { arabic: "مُ", label: "Mu", color: COLORS[13] },
      { arabic: "نُ", label: "Nu", color: COLORS[14] },
    ],
  },

  // ─── Lesson 6: Tanween ───────────────────────────────────
  {
    id: 6,
    title: "Tanween",
    titleUrdu: "تنوین",
    description: "Double vowels — an, in, un sounds",
    emoji: "🎯",
    color: "#EAB308",
    bgGradient: "linear-gradient(135deg, #422006 0%, #713f12 60%, #854d0e 100%)",
    items: [
      { arabic: "بً", label: "Ban", color: COLORS[0] },
      { arabic: "بٍ", label: "Bin", color: COLORS[1] },
      { arabic: "بٌ", label: "Bun", color: COLORS[2] },
      { arabic: "تً", label: "Tan", color: COLORS[3] },
      { arabic: "تٍ", label: "Tin", color: COLORS[4] },
      { arabic: "تٌ", label: "Tun", color: COLORS[5] },
      { arabic: "رً", label: "Ran", color: COLORS[6] },
      { arabic: "رٍ", label: "Rin", color: COLORS[7] },
      { arabic: "رٌ", label: "Run", color: COLORS[8] },
      { arabic: "سً", label: "San", color: COLORS[9] },
      { arabic: "فً", label: "Fan", color: COLORS[10] },
      { arabic: "مً", label: "Man", color: COLORS[11] },
      { arabic: "نً", label: "Nan", color: COLORS[12] },
      { arabic: "لً", label: "Lan", color: COLORS[13] },
    ],
  },

  // ─── Lesson 7: Sukoon / Jazm ─────────────────────────────
  {
    id: 7,
    title: "Sukoon — Jazm",
    titleUrdu: "سکون - جزم",
    description: "Letters with no vowel — silent ending",
    emoji: "🔇",
    color: "#3B82F6",
    bgGradient: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 60%, #1e40af 100%)",
    items: [
      { arabic: "بْ", label: "B (no vowel)", color: COLORS[0] },
      { arabic: "تْ", label: "T (no vowel)", color: COLORS[1] },
      { arabic: "رْ", label: "R (no vowel)", color: COLORS[2] },
      { arabic: "سْ", label: "S (no vowel)", color: COLORS[3] },
      { arabic: "لْ", label: "L (no vowel)", color: COLORS[4] },
      { arabic: "مْ", label: "M (no vowel)", color: COLORS[5] },
      { arabic: "نْ", label: "N (no vowel)", color: COLORS[6] },
      { arabic: "كْ", label: "K (no vowel)", color: COLORS[7] },
      { arabic: "فْ", label: "F (no vowel)", color: COLORS[8] },
      { arabic: "قْ", label: "Q (no vowel)", color: COLORS[9] },
      { arabic: "هْ", label: "H (no vowel)", color: COLORS[10] },
      { arabic: "عْ", label: "Ain (no vowel)", color: COLORS[11] },
    ],
  },

  // ─── Lesson 8: Tashdeed / Shaddah ────────────────────────
  {
    id: 8,
    title: "Tashdeed — Shaddah",
    titleUrdu: "تشدید - شدہ",
    description: "Double letters — say them twice!",
    emoji: "💪",
    color: "#EF4444",
    bgGradient: "linear-gradient(135deg, #3b0000 0%, #7f1d1d 60%, #991b1b 100%)",
    items: [
      { arabic: "بَّ", label: "Bba", color: COLORS[0] },
      { arabic: "تَّ", label: "Tta", color: COLORS[1] },
      { arabic: "رَّ", label: "Rra", color: COLORS[2] },
      { arabic: "سَّ", label: "Ssa", color: COLORS[3] },
      { arabic: "لَّ", label: "Lla", color: COLORS[4] },
      { arabic: "مَّ", label: "Mma", color: COLORS[5] },
      { arabic: "نَّ", label: "Nna", color: COLORS[6] },
      { arabic: "كَّ", label: "Kka", color: COLORS[7] },
      { arabic: "فَّ", label: "Ffa", color: COLORS[8] },
      { arabic: "قَّ", label: "Qqa", color: COLORS[9] },
    ],
  },

  // ─── Lesson 9: Madd Letters ──────────────────────────────
  {
    id: 9,
    title: "Madd — Long Vowels",
    titleUrdu: "مد - لمبی حرکات",
    description: "Stretch the sound — Aa, Ee, Oo",
    emoji: "🎵",
    color: "#10B981",
    bgGradient: "linear-gradient(135deg, #022c22 0%, #065f46 60%, #047857 100%)",
    items: [
      { arabic: "بَا", label: "Baa (long a)", color: COLORS[0] },
      { arabic: "بِي", label: "Bee (long i)", color: COLORS[1] },
      { arabic: "بُو", label: "Boo (long u)", color: COLORS[2] },
      { arabic: "تَا", label: "Taa", color: COLORS[3] },
      { arabic: "تِي", label: "Tee", color: COLORS[4] },
      { arabic: "تُو", label: "Too", color: COLORS[5] },
      { arabic: "رَا", label: "Raa", color: COLORS[6] },
      { arabic: "رِي", label: "Ree", color: COLORS[7] },
      { arabic: "رُو", label: "Roo", color: COLORS[8] },
      { arabic: "سَا", label: "Saa", color: COLORS[9] },
      { arabic: "سِي", label: "See", color: COLORS[10] },
      { arabic: "سُو", label: "Soo", color: COLORS[11] },
      { arabic: "لَا", label: "Laa", color: COLORS[12] },
      { arabic: "مَا", label: "Maa", color: COLORS[13] },
      { arabic: "نَا", label: "Naa", color: COLORS[14] },
    ],
  },

  // ─── Lesson 10: Joining 2 Letters ────────────────────────
  {
    id: 10,
    title: "Join 2 Letters",
    titleUrdu: "دو حروف جوڑنا",
    description: "Read two letters together as one word",
    emoji: "🔗",
    color: "#F97316",
    bgGradient: "linear-gradient(135deg, #2c1400 0%, #7c2d12 60%, #c2410c 100%)",
    items: [
      { arabic: "بَب", label: "Ba-b", color: COLORS[0] },
      { arabic: "تَت", label: "Ta-t", color: COLORS[1] },
      { arabic: "رَر", label: "Ra-r", color: COLORS[2] },
      { arabic: "سَس", label: "Sa-s", color: COLORS[3] },
      { arabic: "لَل", label: "La-l", color: COLORS[4] },
      { arabic: "مَم", label: "Ma-m", color: COLORS[5] },
      { arabic: "نَن", label: "Na-n", color: COLORS[6] },
      { arabic: "كَك", label: "Ka-k", color: COLORS[7] },
      { arabic: "فَف", label: "Fa-f", color: COLORS[8] },
      { arabic: "قَق", label: "Qa-q", color: COLORS[9] },
    ],
  },

  // ─── Lesson 11: Joining 3 Letters ────────────────────────
  {
    id: 11,
    title: "Join 3 Letters",
    titleUrdu: "تین حروف جوڑنا",
    description: "Read three letters as one flowing word",
    emoji: "🔗🔗",
    color: "#8B5CF6",
    bgGradient: "linear-gradient(135deg, #1e0a3d 0%, #3b1b6e 60%, #5b21b6 100%)",
    items: [
      { arabic: "بَسَم", label: "Ba-sa-m", color: COLORS[0] },
      { arabic: "رَحِم", label: "Ra-hi-m", color: COLORS[1] },
      { arabic: "كَتَب", label: "Ka-ta-b", color: COLORS[2] },
      { arabic: "قَلَم", label: "Qa-la-m", color: COLORS[3] },
      { arabic: "سَمَع", label: "Sa-ma-a", color: COLORS[4] },
      { arabic: "جَلَس", label: "Ja-la-s", color: COLORS[5] },
      { arabic: "فَهِم", label: "Fa-hi-m", color: COLORS[6] },
      { arabic: "نَظَر", label: "Na-za-r", color: COLORS[7] },
      { arabic: "أَكَل", label: "A-ka-l", color: COLORS[8] },
      { arabic: "شَرِب", label: "Sha-ri-b", color: COLORS[9] },
    ],
  },

  // ─── Lesson 12: Simple Words ─────────────────────────────
  {
    id: 12,
    title: "Simple Arabic Words",
    titleUrdu: "آسان عربی الفاظ",
    description: "Read your first real Arabic words!",
    emoji: "📖",
    color: "#06B6D4",
    bgGradient: "linear-gradient(135deg, #0a2233 0%, #0e4f6a 60%, #0891b2 100%)",
    items: [
      { arabic: "بِسْم", label: "Bism (name)", color: COLORS[0] },
      { arabic: "رَبّ", label: "Rabb (Lord)", color: COLORS[1] },
      { arabic: "اللّٰه", label: "Allah", color: COLORS[2] },
      { arabic: "نُور", label: "Noor (light)", color: COLORS[3] },
      { arabic: "كِتَاب", label: "Kitaab (book)", color: COLORS[4] },
      { arabic: "بَيْت", label: "Bayt (house)", color: COLORS[5] },
      { arabic: "مَاء", label: "Maa (water)", color: COLORS[6] },
      { arabic: "سَمَاء", label: "Samaa (sky)", color: COLORS[7] },
      { arabic: "أُمّ", label: "Umm (mother)", color: COLORS[8] },
      { arabic: "أَب", label: "Ab (father)", color: COLORS[9] },
    ],
  },

  // ─── Lesson 13: Islamic Words ────────────────────────────
  {
    id: 13,
    title: "Islamic Words",
    titleUrdu: "اسلامی الفاظ",
    description: "Important words every Muslim should know",
    emoji: "☪️",
    color: "#10B981",
    bgGradient: "linear-gradient(135deg, #022c22 0%, #065f46 60%, #059669 100%)",
    items: [
      { arabic: "اَلسَّلَام", label: "Assalaam (peace)", color: COLORS[0] },
      { arabic: "اَلرَّحْمٰن", label: "Ar-Rahman (Merciful)", color: COLORS[1] },
      { arabic: "اَلرَّحِيم", label: "Ar-Raheem (Kind)", color: COLORS[2] },
      { arabic: "اَلْحَمْد", label: "Al-Hamd (praise)", color: COLORS[3] },
      { arabic: "اَلْإِيمَان", label: "Al-Imaan (faith)", color: COLORS[4] },
      { arabic: "صَلٰوة", label: "Salaah (prayer)", color: COLORS[5] },
      { arabic: "تَوْبَة", label: "Tawbah (repentance)", color: COLORS[6] },
      { arabic: "جَنَّة", label: "Jannah (paradise)", color: COLORS[7] },
      { arabic: "صَدَقَة", label: "Sadaqah (charity)", color: COLORS[8] },
      { arabic: "شُكْر", label: "Shukr (gratitude)", color: COLORS[9] },
    ],
  },

  // ─── Lesson 14: Surah Al-Fatiha ──────────────────────────
  {
    id: 14,
    title: "Surah Al-Fatiha",
    titleUrdu: "سورۃ الفاتحہ",
    description: "The Opening — recite verse by verse",
    emoji: "📿",
    color: "#EAB308",
    bgGradient: "linear-gradient(135deg, #281a00 0%, #713f12 60%, #a16207 100%)",
    items: [
      { arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", label: "Bismillah...", color: COLORS[0] },
      { arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", label: "Alhamdulillah...", color: COLORS[1] },
      { arabic: "الرَّحْمَنِ الرَّحِيمِ", label: "Ar-Rahman Ar-Raheem", color: COLORS[2] },
      { arabic: "مَالِكِ يَوْمِ الدِّينِ", label: "Maliki Yawm Ad-Deen", color: COLORS[3] },
      { arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", label: "Iyyaka Na'budu...", color: COLORS[4] },
      { arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", label: "Ihdinas Sirat...", color: COLORS[5] },
      { arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ", label: "Siratal Lazeena...", color: COLORS[6] },
      { arabic: "غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", label: "Ghayril Maghdubi...", color: COLORS[7] },
    ],
  },

  // ─── Lesson 15: Short Surahs ─────────────────────────────
  {
    id: 15,
    title: "Surah Al-Ikhlas",
    titleUrdu: "سورۃ الاخلاص",
    description: "The Sincerity — worth 1/3 of Quran!",
    emoji: "💎",
    color: "#EC4899",
    bgGradient: "linear-gradient(135deg, #2d0a1f 0%, #831843 60%, #9d174d 100%)",
    items: [
      { arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", label: "Qul Huwal Laahu Ahad", color: COLORS[0] },
      { arabic: "اللَّهُ الصَّمَدُ", label: "Allahus Samad", color: COLORS[1] },
      { arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", label: "Lam Yalid Wa Lam Yoolad", color: COLORS[2] },
      { arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", label: "Wa Lam Yakul Lahu Kufuwan Ahad", color: COLORS[3] },
    ],
  },

  // ─── Lesson 16: Surah Al-Falaq ───────────────────────────
  {
    id: 16,
    title: "Surah Al-Falaq",
    titleUrdu: "سورۃ الفلق",
    description: "The Daybreak — protection surah",
    emoji: "🌅",
    color: "#F97316",
    bgGradient: "linear-gradient(135deg, #1c0a00 0%, #7c2d12 60%, #c2410c 100%)",
    items: [
      { arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", label: "Qul A'udhu bi Rabbil Falaq", color: COLORS[0] },
      { arabic: "مِن شَرِّ مَا خَلَقَ", label: "Min Sharri Ma Khalaq", color: COLORS[1] },
      { arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", label: "Wa Min Sharri Ghasiqin Idhaa Waqab", color: COLORS[2] },
      { arabic: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", label: "Wa Min Sharrin Naffaathaati...", color: COLORS[3] },
      { arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", label: "Wa Min Sharri Haasidin Idhaa Hasad", color: COLORS[4] },
    ],
  },

  // ─── Lesson 17: Surah An-Nas ─────────────────────────────
  {
    id: 17,
    title: "Surah An-Nas",
    titleUrdu: "سورۃ الناس",
    description: "Mankind — our favourite protection surah",
    emoji: "🛡️",
    color: "#3B82F6",
    bgGradient: "linear-gradient(135deg, #0a0e2a 0%, #1e3a8a 60%, #1d4ed8 100%)",
    items: [
      { arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", label: "Qul A'udhu bi Rabbin Naas", color: COLORS[0] },
      { arabic: "مَلِكِ النَّاسِ", label: "Malikin Naas", color: COLORS[1] },
      { arabic: "إِلَٰهِ النَّاسِ", label: "Ilaahin Naas", color: COLORS[2] },
      { arabic: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", label: "Min Sharril Waswaasil Khannaas", color: COLORS[3] },
      { arabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", label: "Alladhee Yuwaswisu...", color: COLORS[4] },
      { arabic: "مِنَ الْجِنَّةِ وَالنَّاسِ", label: "Minal Jinnati Wan Naas", color: COLORS[5] },
    ],
  },

  // ─── Lesson 18: Daily Duas ───────────────────────────────
  {
    id: 18,
    title: "Daily Duas",
    titleUrdu: "روزمرہ کی دعائیں",
    description: "Important duas for every Muslim child",
    emoji: "🤲",
    color: "#10B981",
    bgGradient: "linear-gradient(135deg, #022c22 0%, #065f46 60%, #059669 100%)",
    items: [
      { arabic: "بِسْمِ اللَّه", label: "Bismillah (before eating)", color: COLORS[0] },
      { arabic: "اَلْحَمْدُ لِلَّه", label: "Alhamdulillah (after eating)", color: COLORS[1] },
      { arabic: "اَلسَّلَامُ عَلَيْكُم", label: "Assalamu Alaykum (greeting)", color: COLORS[2] },
      { arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ", label: "A'udhu Billah (protection)", color: COLORS[3] },
      { arabic: "اِنَّا لِلَّهِ وَاِنَّا اِلَيْهِ رَاجِعُونَ", label: "Inna Lillahi (loss/sadness)", color: COLORS[4] },
      { arabic: "سُبْحَانَ اللَّه", label: "SubhanAllah (wonder/praise)", color: COLORS[5] },
      { arabic: "اَللَّهُ أَكْبَر", label: "Allahu Akbar (Allah is Greatest)", color: COLORS[6] },
      { arabic: "لَا إِلَهَ إِلَّا اللَّه", label: "La Ilaha Illallah (Kalima)", color: COLORS[7] },
      { arabic: "رَبِّ اغْفِرْ لِي", label: "Rabbighfir Li (forgiveness)", color: COLORS[8] },
      { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً", label: "Rabbana Atina... (world + hereafter)", color: COLORS[9] },
    ],
  },
];

export default LESSONS;

// Helper: total lessons count
export const TOTAL_LESSONS = LESSONS.length;

// Helper: get a lesson by ID
export function getLessonById(id: number): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

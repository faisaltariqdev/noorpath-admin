import type {
  InteractiveExample,
  ModuleId,
  QaidaModule,
  ScreenId,
  TopicLesson,
} from "../types";
import { LETTERS } from "./curriculum";

const pending = "pending-qari-review" as const;

function example(
  id: string,
  arabic: string,
  transliteration: string,
  meaning?: string,
  segments?: string[],
): InteractiveExample {
  return { id, arabic, transliteration, meaning, segments, audioKey: `example-${id}` };
}

function lesson(
  data: Omit<TopicLesson, "reviewStatus" | "audioKey"> & { audioKey?: string },
): TopicLesson {
  return {
    ...data,
    audioKey: data.audioKey ?? `lesson-${data.id}`,
    reviewStatus: pending,
  };
}

// Shared Ba→Ya letter table for every mark / Madd drill page.
const DRILL_LETTERS: ReadonlyArray<readonly [arabic: string, translit: string]> = [
  ["ب", "b"], ["ت", "t"], ["ث", "th"], ["ج", "j"], ["ح", "ḥ"], ["خ", "kh"],
  ["د", "d"], ["ذ", "dh"], ["ر", "r"], ["ز", "z"], ["س", "s"], ["ش", "sh"],
  ["ص", "ṣ"], ["ض", "ḍ"], ["ط", "ṭ"], ["ظ", "ẓ"], ["ع", "ʿ"], ["غ", "gh"],
  ["ف", "f"], ["ق", "q"], ["ك", "k"], ["ل", "l"], ["م", "m"], ["ن", "n"],
  ["ه", "h"], ["و", "w"], ["ي", "y"],
];

const FATHA = "\u064E";
const KASRA = "\u0650";
const DAMMA = "\u064F";
const FATHATAIN = "\u064B";
const KASRATAIN = "\u064D";
const DAMMATAIN = "\u064C";
const SUKOON = "\u0652";
const SHADDAH = "\u0651";

const SHORT_SIGN = { fatha: FATHA, kasra: KASRA, damma: DAMMA } as const;
const SHORT_VOWEL = { fatha: "a", kasra: "i", damma: "u" } as const;
const SHORT_ALIF = { fatha: "أَ", kasra: "إِ", damma: "أُ" } as const;

function harakaatDrill(mark: keyof typeof SHORT_SIGN): InteractiveExample[] {
  const sign = SHORT_SIGN[mark];
  const vowel = SHORT_VOWEL[mark];
  return [
    example(`${mark}-alif`, SHORT_ALIF[mark], vowel),
    ...DRILL_LETTERS.map(([arabic, translit]) =>
      example(`${mark}-${translit}`, `${arabic}${sign}`, `${translit}${vowel}`),
    ),
  ];
}

/** Tanween drill: Fathatain uses Alif of tanween (بًا); Kasratain/Dammatain use the double mark alone. */
function tanweenDrill(mark: "fathatain" | "kasratain" | "dammatain"): InteractiveExample[] {
  if (mark === "fathatain") {
    return [
      example("fathatain-alif", "أً", "an"),
      ...DRILL_LETTERS.map(([arabic, translit]) =>
        example(`fathatain-${translit}`, `${arabic}${FATHATAIN}ا`, `${translit}an`),
      ),
    ];
  }
  if (mark === "kasratain") {
    return [
      example("kasratain-alif", "إٍ", "in"),
      ...DRILL_LETTERS.map(([arabic, translit]) =>
        example(`kasratain-${translit}`, `${arabic}${KASRATAIN}`, `${translit}in`),
      ),
    ];
  }
  return [
    example("dammatain-alif", "أٌ", "un"),
    ...DRILL_LETTERS.map(([arabic, translit]) =>
      example(`dammatain-${translit}`, `${arabic}${DAMMATAIN}`, `${translit}un`),
    ),
  ];
}

/** Classic Qaida Sukoon row: أَ + letter + ْ from Ba to Ya, plus a few familiar words. */
function sukoonDrill(): InteractiveExample[] {
  return [
    ...DRILL_LETTERS.map(([arabic, translit]) =>
      example(`sukoon-a${translit}`, `أَ${arabic}${SUKOON}`, `a${translit}`, undefined, ["أَ", `${arabic}${SUKOON}`]),
    ),
    example("sukoon-min", "مِنْ", "min", "from", ["مِ", "نْ"]),
    example("sukoon-qul", "قُلْ", "qul", "say", ["قُ", "لْ"]),
  ];
}

/** Shaddah + Fatha drill from Ba to Ya, plus two familiar words. */
function shaddahDrill(): InteractiveExample[] {
  return [
    ...DRILL_LETTERS.map(([arabic, translit]) =>
      example(
        `shaddah-${translit}`,
        `${arabic}${SHADDAH}${FATHA}`,
        `${translit}${translit}a`,
        undefined,
        [`${arabic}${SUKOON}`, `${arabic}${FATHA}`],
      ),
    ),
    example("shaddah-rabba", "رَبَّ", "rabba", undefined, ["رَ", "بْ", "بَ"]),
    example("shaddah-inna", "إِنَّ", "inna", "indeed", ["إِ", "نْ", "نَ"]),
  ];
}

function maddAlifDrill(): InteractiveExample[] {
  return [
    example("madd-alif-alif", "آ", "ā"),
    ...DRILL_LETTERS.map(([arabic, translit]) =>
      example(`madd-alif-${translit}`, `${arabic}${FATHA}ا`, `${translit}ā`),
    ),
    example("madd-alif-qaala", "قَالَ", "qāla", "he said", ["قَا", "لَ"]),
  ];
}

function maddWawDrill(): InteractiveExample[] {
  return [
    example("madd-waw-alif", "أُو", "ū"),
    ...DRILL_LETTERS.map(([arabic, translit]) =>
      example(`madd-waw-${translit}`, `${arabic}${DAMMA}و`, `${translit}ū`),
    ),
    example("madd-waw-nur", "نُور", "nūr", "light", ["نُو", "رْ"]),
  ];
}

function maddYaDrill(): InteractiveExample[] {
  return [
    example("madd-ya-alif", "إِي", "ī"),
    ...DRILL_LETTERS.map(([arabic, translit]) =>
      example(`madd-ya-${translit}`, `${arabic}${KASRA}ي`, `${translit}ī`),
    ),
    example("madd-ya-fil", "فِيل", "fīl", "elephant", ["فِي", "لْ"]),
  ];
}

export const TOPIC_LESSONS: TopicLesson[] = [
  lesson({
    id: "fatha", moduleId: "harakaat", kind: "mark", title: "Zabar (Fatha)", arabicTitle: "فَتْحَة",
    summary: "A small mark above a letter that gives a short ‘a’ sound.",
    childExplanation: "Fatha sits above a letter like a tiny smile. It makes a quick ‘a’ sound. Read every letter from Alif to Ya: a, ba, ta, tha …",
    teacherTip: "Keep the vowel short. Contrast بَ with an elongated بَا so the child hears that Fatha is not Madd.",
    parentTip: "Tap a few letters at a time from Alif to Ya, then let your child copy the short sound without stretching it.",
    mouthPosition: "Open the mouth gently for a brief ‘a’ sound.", writingHint: "Place the short diagonal mark above the letter.",
    traceValue: "بَ", examples: harakaatDrill("fatha"),
  }),
  lesson({
    id: "kasra", moduleId: "harakaat", kind: "mark", title: "Zer (Kasra)", arabicTitle: "كَسْرَة",
    summary: "A small mark below a letter that gives a short ‘i’ sound.",
    childExplanation: "Kasra rests below the letter. It makes a quick ‘i’ sound. Read every letter from Alif to Ya: i, bi, ti, thi …",
    teacherTip: "Avoid turning Kasra into a long English ‘ee’. Keep the jaw relaxed and the sound brief.",
    parentTip: "Point below each letter from Alif to Ya as your child says the short ‘i’ sound.",
    mouthPosition: "Relax the jaw and slightly spread the lips for a brief ‘i’.", writingHint: "Place the short diagonal mark below the letter.",
    traceValue: "بِ", examples: harakaatDrill("kasra"),
  }),
  lesson({
    id: "damma", moduleId: "harakaat", kind: "mark", title: "Pesh (Damma)", arabicTitle: "ضَمَّة",
    summary: "A small curl above a letter that gives a short ‘u’ sound.",
    childExplanation: "Damma looks like a tiny curl above the letter. Round your lips for a quick ‘u’. Read every letter from Alif to Ya: u, bu, tu, thu …",
    teacherTip: "Model rounded lips without lengthening the sound into Waw Madd.",
    parentTip: "Use a mirror and make a small round-lip shape together for each letter from Alif to Ya.",
    mouthPosition: "Round the lips briefly while keeping the sound short.", writingHint: "Draw the small Damma curl above the letter.",
    traceValue: "بُ", examples: harakaatDrill("damma"),
  }),
  lesson({
    id: "fathatain", moduleId: "double-harakaat", kind: "mark", title: "Two Zabar (Fathatain)", arabicTitle: "فَتْحَتَان",
    summary: "Two Fatha marks add a light ‘an’ ending.",
    childExplanation: "Two marks make a tiny ‘n’ sound at the end. Read every letter from Alif to Ya: an, ban, tan, than …",
    teacherTip: "Demonstrate the audible noon sound without adding a written Noon. Fathatain often sits with a following Alif in practice rows.",
    parentTip: "Clap once for the letter sound and once softly for the ‘n’ ending as you move across the row.",
    mouthPosition: "Open briefly for ‘a’, then finish with a light nasal ‘n’.", writingHint: "Place two parallel Fatha marks above, then the practice Alif where shown.",
    traceValue: "بًا", examples: tanweenDrill("fathatain"),
  }),
  lesson({
    id: "kasratain", moduleId: "double-harakaat", kind: "mark", title: "Two Zer (Kasratain)", arabicTitle: "كَسْرَتَان",
    summary: "Two Kasra marks add a light ‘in’ ending.",
    childExplanation: "Two marks below make ‘in’. Read every letter from Alif to Ya: in, bin, tin, thin …",
    teacherTip: "Keep the Kasra short and make the final noon light.",
    parentTip: "Point below each letter from Alif to Ya and repeat slowly, then normally.",
    mouthPosition: "Use a brief ‘i’ and finish with a light nasal ‘n’.", writingHint: "Place two parallel Kasra marks below.",
    traceValue: "بٍ", examples: tanweenDrill("kasratain"),
  }),
  lesson({
    id: "dammatain", moduleId: "double-harakaat", kind: "mark", title: "Two Pesh (Dammatain)", arabicTitle: "ضَمَّتَان",
    summary: "Two Damma marks add a light ‘un’ ending.",
    childExplanation: "Two curls make ‘un’. Read every letter from Alif to Ya: un, bun, tun, thun …",
    teacherTip: "Keep lip rounding brief and preserve the final noon sound.",
    parentTip: "Use the slow button first, then copy the normal speed across a few letters at a time.",
    mouthPosition: "Round briefly for ‘u’, then finish with a light nasal ‘n’.", writingHint: "Place the double Damma sign above.",
    traceValue: "بٌ", examples: tanweenDrill("dammatain"),
  }),
  lesson({
    id: "sukoon", moduleId: "sukoon", kind: "mark", title: "Sukoon", arabicTitle: "سُكُون",
    summary: "Sukoon means the letter has no vowel after it.",
    childExplanation: "The little circle tells the letter to stop. Practise the full row: ab, at, ath … ay, then a few familiar words.",
    teacherTip: "Join the sakin letter to the vowel before it; do not pronounce it as an isolated alphabet name.",
    parentTip: "Tap the two parts slowly (أَ + بْ), then blend them into one smooth sound.",
    mouthPosition: "Move to the letter’s articulation point and stop airflow cleanly.", writingHint: "Place the small circle above the still letter.",
    traceValue: "أَبْ", examples: sukoonDrill(),
  }),
  lesson({
    id: "shaddah", moduleId: "shaddah", kind: "mark", title: "Shaddah", arabicTitle: "شَدَّة",
    summary: "Shaddah makes one written letter sound like two joined letters.",
    childExplanation: "Shaddah gives the letter a strong double beat: first stop, then open. Read bba, tta, ththa … then familiar words.",
    teacherTip: "Teach the doubled structure as sakin + vowelled letter before blending.",
    parentTip: "Tap the table twice gently for each letter, then remove the taps once the child can blend.",
    mouthPosition: "Hold the articulation point for one beat, then release into the vowel.", writingHint: "Place the small Shaddah sign above the doubled letter.",
    traceValue: "بَّ", examples: shaddahDrill(),
  }),
  lesson({
    id: "madd-alif", moduleId: "madd", kind: "madd", title: "Madd Alif", arabicTitle: "مَدُّ الأَلِف",
    summary: "Fatha followed by Alif stretches ‘a’ for two counts.",
    childExplanation: "Slide the short ‘a’ into a long ‘aa’ while two stars light up. Read every letter: ā, bā, tā, thā …",
    teacherTip: "Use two equal finger counts and avoid adding a breathy break.",
    parentTip: "Move one finger across two dots while holding each long sound from Alif to Ya.",
    mouthPosition: "Keep the mouth gently open and the sound steady.", writingHint: "Read the Fatha letter together with the following Alif.",
    traceValue: "بَا", examples: maddAlifDrill(),
  }),
  lesson({
    id: "madd-waw", moduleId: "madd", kind: "madd", title: "Madd Waw", arabicTitle: "مَدُّ الوَاو",
    summary: "Damma followed by silent Waw stretches ‘u’ for two counts.",
    childExplanation: "Round your lips and stretch ‘oo’ for two gentle counts. Read every letter: ū, bū, tū, thū …",
    teacherTip: "Ensure Waw is preceded by Damma and carries no independent vowel.",
    parentTip: "Use two finger taps while keeping the lips rounded for each letter in the row.",
    mouthPosition: "Round the lips steadily without changing the sound.", writingHint: "Read the Damma letter together with the following Waw.",
    traceValue: "بُو", examples: maddWawDrill(),
  }),
  lesson({
    id: "madd-ya", moduleId: "madd", kind: "madd", title: "Madd Ya", arabicTitle: "مَدُّ اليَاء",
    summary: "Kasra followed by silent Ya stretches ‘i’ for two counts.",
    childExplanation: "Smile gently and stretch ‘ee’ for two counts. Read every letter: ī, bī, tī, thī …",
    teacherTip: "Keep the sound pure and avoid turning it into the English diphthong ‘ay’.",
    parentTip: "Trace two stars while holding each long sound from Alif to Ya.",
    mouthPosition: "Slightly spread the lips and keep the long sound even.", writingHint: "Read the Kasra letter together with the following Ya.",
    traceValue: "بِي", examples: maddYaDrill(),
  }),
  lesson({
    id: "joining-forms", moduleId: "joining", kind: "joining", title: "Joining Forms", arabicTitle: "أَشْكَالُ الحُرُوف",
    summary: "See how every Arabic letter changes at the beginning, middle, and end.",
    childExplanation: "Arabic letters hold hands. Compare all 28 letters in isolated, initial, medial, and final form.",
    teacherTip: "Compare one family at a time and explicitly identify the six non-connecting letters.",
    parentTip: "Choose a few letters a day and spot how their shapes stay similar across all four forms.",
    writingHint: "Write from right to left and keep the joining line on the baseline.",
    traceValue: "بـ ـبـ ـب", examples: LETTERS.map((item) => example(`forms-${item.id}`, item.forms.join("  "), item.name)),
  }),
  ...([
    ["reading-2", "Two-Letter Words", "كَلِمَاتٌ مِنْ حَرْفَيْنِ", "Blend two letters without pausing.", [example("read-2-ab", "أَبْ", "ab"), example("read-2-min", "مِنْ", "min", "from", ["مِ", "نْ"]), example("read-2-hal", "هَلْ", "hal", "is/do", ["هَ", "لْ"]), example("read-2-qul", "قُلْ", "qul", "say", ["قُ", "لْ"]), example("read-2-man", "مَنْ", "man", "who", ["مَ", "نْ"]), example("read-2-bal", "بَلْ", "bal", "rather", ["بَ", "لْ"])]],
    ["reading-3", "Three-Letter Words", "كَلِمَاتٌ مِنْ ثَلَاثَةِ أَحْرُفٍ", "Read three parts in one smooth voice.", [example("read-3-kataba", "كَتَبَ", "kataba", "he wrote", ["كَ", "تَ", "بَ"]), example("read-3-alima", "عَلِمَ", "alima", "he knew", ["عَ", "لِ", "مَ"]), example("read-3-qamar", "قَمَر", "qamar", "moon", ["قَ", "مَ", "رْ"]), example("read-3-walad", "وَلَد", "walad", "boy", ["وَ", "لَ", "دْ"]), example("read-3-kitab", "كِتَاب", "kitāb", "book", ["كِ", "تَا", "بْ"]), example("read-3-salam", "سَلَام", "salām", "peace", ["سَ", "لَا", "مْ"])]],
    ["reading-4", "Four-Letter Words", "كَلِمَاتٌ مِنْ أَرْبَعَةِ أَحْرُفٍ", "Keep each vowel clear as words become longer.", [example("read-4-qamar", "قَمَرٌ", "qamarun", "moon", ["قَ", "مَ", "رٌ"]), example("read-4-kitab", "كِتَابٌ", "kitābun", "book", ["كِ", "تَا", "بٌ"]), example("read-4-masjid", "مَسْجِدٌ", "masjidun", "mosque", ["مَسْ", "جِ", "دٌ"]), example("read-4-nahr", "نَهَرٌ", "naharun", "river", ["نَ", "هَ", "رٌ"]), example("read-4-bab", "بَابٌ", "bābun", "door", ["بَا", "بٌ"]), example("read-4-nur", "نُورٌ", "nūrun", "light", ["نُو", "رٌ"])]],
    ["reading-5", "Five-Letter Words", "كَلِمَاتٌ مِنْ خَمْسَةِ أَحْرُفٍ", "Use everything learned to read a longer word.", [example("read-5-rahmah", "رَحْمَةٌ", "raḥmatun", "mercy", ["رَ", "حْ", "مَ", "ةٌ"]), example("read-5-shajarah", "شَجَرَةٌ", "shajaratun", "tree", ["شَ", "جَ", "رَ", "ةٌ"]), example("read-5-madrasa", "مَدْرَسَةٌ", "madrasatun", "school", ["مَدْ", "رَ", "سَ", "ةٌ"]), example("read-5-samawat", "سَمَاوَاتٌ", "samāwātun", "heavens", ["سَ", "مَا", "وَا", "تٌ"]), example("read-5-jannat", "جَنَّاتٌ", "jannātun", "gardens", ["جَنْ", "نَا", "تٌ"]), example("read-5-salawat", "صَلَوَاتٌ", "ṣalawātun", "prayers", ["صَ", "لَ", "وَا", "تٌ"])]],
  ] as const).map(([id, title, arabicTitle, explanation, examples]) => lesson({
    id, moduleId: "word-reading", kind: "reading", title, arabicTitle,
    summary: explanation, childExplanation: explanation,
    teacherTip: "Point to each segment, model once, then reduce support as fluency improves.",
    parentTip: "Read only three words per sitting and finish with a word your child knows.",
    writingHint: "Follow the highlighted segments from right to left.", examples: [...examples],
  })),
  lesson({
    id: "quran-words", moduleId: "quranic-practice", kind: "quranic", title: "Short Quranic Words", arabicTitle: "كَلِمَاتٌ قُرْآنِيَّة",
    summary: "Recognise familiar short words using the rules already learned.",
    childExplanation: "These small words appear in the Quran. Listen with care and read one part at a time.",
    teacherTip: "Treat these as recognition practice, not independent Tajweed certification. Correct from a reviewed recitation.",
    parentTip: "Play the reviewed recording when available and avoid guessing unfamiliar sounds.",
    examples: [
      example("quran-rabb", "رَبّ", "rabb", "Lord", ["رَ", "بّ"]),
      example("quran-qul", "قُلْ", "qul", "say", ["قُ", "لْ"]),
      example("quran-nur", "نُور", "nūr", "light", ["نُو", "رْ"]),
      example("quran-min", "مِنْ", "min", "from", ["مِ", "نْ"]),
      example("quran-inna", "إِنَّ", "inna", "indeed", ["إِ", "نْ", "نَ"]),
      example("quran-alladhina", "الَّذِينَ", "alladhīna", "those who", ["الْ", "لَذِي", "نَ"]),
    ],
  }),
  lesson({
    id: "quran-recognition", moduleId: "quranic-practice", kind: "quranic", title: "Recognition Practice", arabicTitle: "تَدْرِيبُ التَّعَرُّف",
    summary: "Find Harakaat, Sukoon, Shaddah, and Madd inside short Quranic words.",
    childExplanation: "Be a reading detective. Tap the mark you recognise before reading the word.",
    teacherTip: "Ask the learner to name the sign before attempting the word.",
    parentTip: "Celebrate correct recognition even when pronunciation still needs help.",
    examples: [
      example("recognition-huda", "هُدًى", "hudan", "guidance"),
      example("recognition-rahim", "رَحِيم", "raḥīm", "merciful"),
      example("recognition-allah", "اللّٰه", "Allāh"),
      example("recognition-alhamd", "الْحَمْدُ", "al-ḥamdu", "all praise"),
      example("recognition-maliki", "مَالِكِ", "māliki", "Owner"),
      example("recognition-sirat", "صِرَاطَ", "ṣirāṭa", "path"),
    ],
  }),
  lesson({
    id: "quran-reading", moduleId: "quranic-practice", kind: "quranic", title: "Guided Quranic Reading", arabicTitle: "قِرَاءَةٌ مُوَجَّهَة",
    summary: "Blend short reviewed phrases with highlighted reading steps.",
    childExplanation: "Follow the glow from right to left and keep every sound calm and clear.",
    teacherTip: "Use only Qari-reviewed audio and pause after each highlighted segment.",
    parentTip: "Listen alongside your child and leave correction to the teacher when unsure.",
    examples: [
      example("guided-bism", "بِسْمِ اللّٰهِ", "bismi-llāh", "in the name of Allah", ["بِسْ", "مِ", "اللّٰهِ"]),
      example("guided-alhamd", "الْحَمْدُ لِلّٰهِ", "al-ḥamdu li-llāh", "all praise is for Allah", ["الْحَمْ", "دُ", "لِلّٰهِ"]),
      example("guided-rabb", "رَبِّ الْعَالَمِينَ", "rabbi-l-ʿālamīn", "Lord of the worlds", ["رَبِّ", "الْعَا", "لَمِينَ"]),
    ],
  }),
  lesson({
    id: "mixed-revision", moduleId: "revision", kind: "revision", title: "Mixed Revision", arabicTitle: "مُرَاجَعَةٌ شَامِلَة",
    summary: "Review letters, marks, joining, and words in short mixed rounds.",
    childExplanation: "Spin the review wheel and show what you remember across the full alphabet.",
    teacherTip: "Record which rule needs support; do not treat one incorrect tap as failure.",
    parentTip: "Keep revision playful and stop before the child becomes tired.",
    examples: [
      ...harakaatDrill("fatha").slice(0, 7),
      example("revision-bin", "بٍ", "bin"),
      example("revision-bun", "بٌ", "bun"),
      example("revision-ab", "أَبْ", "ab"),
      example("revision-bba", "بَّ", "bba"),
      example("revision-baa", "بَا", "bā"),
      example("revision-nur", "نُور", "nūr", "light"),
    ],
  }),
  lesson({
    id: "reading-revision", moduleId: "revision", kind: "revision", title: "Reading Revision", arabicTitle: "مُرَاجَعَةُ القِرَاءَة",
    summary: "Read a balanced set of two- to five-letter words.",
    childExplanation: "Start with an easy word, then climb one step at a time.",
    teacherTip: "Measure accuracy and confidence separately.",
    parentTip: "Let your child choose the first word to build confidence.",
    examples: [
      example("rev-min", "مِنْ", "min"),
      example("rev-qul", "قُلْ", "qul", "say"),
      example("rev-kataba", "كَتَبَ", "kataba", "he wrote"),
      example("rev-qamar", "قَمَرٌ", "qamarun", "moon"),
      example("rev-kitab", "كِتَابٌ", "kitābun", "book"),
      example("rev-rahmah", "رَحْمَةٌ", "raḥmatun", "mercy"),
      example("rev-shajarah", "شَجَرَةٌ", "shajaratun", "tree"),
    ],
  }),
  lesson({
    id: "final-assessment", moduleId: "final-review", kind: "assessment", title: "Reading Assessment", arabicTitle: "تَقْيِيمُ القِرَاءَة",
    summary: "A calm, mixed check of recognition, listening, and reading.",
    childExplanation: "Show what you know. You can listen again and take your time.",
    teacherTip: "Use the score as a guide for review, not as a Tajweed certification.",
    parentTip: "Praise effort and progress regardless of the result.",
    examples: [
      example("assessment-fatha", "تَ", "ta"),
      example("assessment-kasra", "بِ", "bi"),
      example("assessment-damma", "قُ", "qu"),
      example("assessment-tanween", "كِتَابٌ", "kitābun", "book"),
      example("assessment-sukoon", "قُلْ", "qul"),
      example("assessment-shaddah", "إِنَّ", "inna"),
      example("assessment-madd", "نُور", "nūr"),
    ],
  }),
  lesson({
    id: "teacher-review", moduleId: "final-review", kind: "assessment", title: "Teacher Review", arabicTitle: "مُرَاجَعَةُ المُعَلِّم",
    summary: "A guided checklist for articulation, blending, confidence, and next steps.",
    childExplanation: "Read with your teacher and collect your final stars.",
    teacherTip: "Verify Makharij and recitation against approved references before marking mastery.",
    parentTip: "Ask the teacher which two skills to practise next.",
    examples: [
      example("teacher-review-rabb", "رَبّ", "rabb"),
      example("teacher-review-rahim", "رَحِيم", "raḥīm"),
      example("teacher-review-bism", "بِسْمِ", "bismi"),
      example("teacher-review-qamar", "قَمَرٌ", "qamarun", "moon"),
    ],
  }),
  lesson({
    id: "parent-practice", moduleId: "final-review", kind: "assessment", title: "Parent Practice", arabicTitle: "تَدْرِيبٌ مَعَ الأُسْرَة",
    summary: "A short home routine using familiar sounds and words.",
    childExplanation: "Choose favourite cards from Alif to Ya and teach them to your family.",
    teacherTip: "Send only reviewed items for home practice.",
    parentTip: "Listen, praise, and replay the approved audio instead of modelling uncertain pronunciation.",
    examples: [
      example("parent-ba", "بَ", "ba"),
      example("parent-ta", "تَ", "ta"),
      example("parent-ab", "أَبْ", "ab"),
      example("parent-baa", "بَا", "bā"),
      example("parent-nur", "نُور", "nūr", "light"),
      example("parent-qamar", "قَمَرٌ", "qamarun", "moon"),
    ],
  }),
];

const screens = (moduleId: ModuleId) =>
  TOPIC_LESSONS.filter((item) => item.moduleId === moduleId).map((item) => item.id);

export const CURRICULUM_MODULES: QaidaModule[] = [
  { id: "alphabet", order: 1, title: "Arabic Alphabets", arabicTitle: "الحُرُوفُ العَرَبِيَّة", description: "Meet, hear, trace, and pronounce all 28 Arabic letters.", icon: "ا", accent: "from-emerald-500 to-teal-600", screenIds: LETTERS.map((item) => `letter-${item.id}`), reviewStatus: pending },
  { id: "harakaat", order: 2, title: "Harakaat", arabicTitle: "الحَرَكَات", description: "Learn the three short vowel marks.", icon: "بَ", accent: "from-sky-500 to-blue-600", prerequisite: "alphabet", screenIds: screens("harakaat"), reviewStatus: pending },
  { id: "double-harakaat", order: 3, title: "Double Harakaat", arabicTitle: "التَّنْوِين", description: "Add the gentle n-ending of Tanween.", icon: "بً", accent: "from-violet-500 to-purple-600", prerequisite: "harakaat", screenIds: screens("double-harakaat"), reviewStatus: pending },
  { id: "sukoon", order: 4, title: "Sukoon", arabicTitle: "السُّكُون", description: "Learn how a letter stops without a vowel.", icon: "بْ", accent: "from-cyan-500 to-teal-600", prerequisite: "double-harakaat", screenIds: screens("sukoon"), reviewStatus: pending },
  { id: "shaddah", order: 5, title: "Shaddah", arabicTitle: "الشَّدَّة", description: "Hear and read doubled letters.", icon: "بّ", accent: "from-rose-500 to-pink-600", prerequisite: "sukoon", screenIds: screens("shaddah"), reviewStatus: pending },
  { id: "madd", order: 6, title: "Madd", arabicTitle: "المَدّ", description: "Stretch Alif, Waw, and Ya for two counts.", icon: "بَا", accent: "from-amber-500 to-orange-600", prerequisite: "shaddah", screenIds: screens("madd"), reviewStatus: pending },
  { id: "joining", order: 7, title: "Letter Joining", arabicTitle: "وَصْلُ الحُرُوف", description: "Explore isolated, initial, medial, and final forms.", icon: "بـ", accent: "from-indigo-500 to-blue-600", prerequisite: "madd", screenIds: screens("joining"), reviewStatus: pending },
  { id: "word-reading", order: 8, title: "Word Reading", arabicTitle: "قِرَاءَةُ الكَلِمَات", description: "Progress from two-letter to five-letter words.", icon: "كَلِمَة", accent: "from-fuchsia-500 to-violet-600", prerequisite: "joining", screenIds: screens("word-reading"), reviewStatus: pending },
  { id: "quranic-practice", order: 9, title: "Quranic Practice", arabicTitle: "تَدْرِيبٌ قُرْآنِيّ", description: "Recognise and read short Quranic words carefully.", icon: "قُرْآن", accent: "from-emerald-600 to-green-700", prerequisite: "word-reading", screenIds: screens("quranic-practice"), reviewStatus: pending },
  { id: "revision", order: 10, title: "Revision", arabicTitle: "المُرَاجَعَة", description: "Mix letters, marks, joining, and reading.", icon: "↻", accent: "from-blue-500 to-indigo-600", prerequisite: "quranic-practice", screenIds: screens("revision"), reviewStatus: pending },
  { id: "final-review", order: 11, title: "Final Review", arabicTitle: "المُرَاجَعَةُ النِّهَائِيَّة", description: "Complete the assessment with teacher and parent review.", icon: "🏆", accent: "from-amber-500 to-yellow-600", prerequisite: "revision", screenIds: [...screens("final-review"), "certificate"], reviewStatus: pending },
];

export const TOPIC_LESSON_BY_ID = Object.fromEntries(
  TOPIC_LESSONS.map((item) => [item.id, item]),
) as Record<ScreenId, TopicLesson>;

export const MODULE_BY_ID = Object.fromEntries(
  CURRICULUM_MODULES.map((item) => [item.id, item]),
) as Record<ModuleId, QaidaModule>;

export const ALL_CURRICULUM_SCREEN_IDS = CURRICULUM_MODULES.flatMap((item) => item.screenIds);

export function moduleForScreen(id: ScreenId): QaidaModule | undefined {
  return CURRICULUM_MODULES.find((item) => item.screenIds.includes(id));
}

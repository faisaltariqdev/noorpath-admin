import type { CurriculumItem, Letter, ScreenId } from "../types";
import { ALIF_PRONUNCIATION, QAIDA_PRONUNCIATIONS } from "./pronunciation";

type LetterSeed = [
  id: number,
  letter: string,
  name: string,
  sound: string,
  forms: Letter["forms"],
  example: string,
  meaning: string,
  makharij: string,
];

const letterSeeds: LetterSeed[] = [
  [1, "ا", ALIF_PRONUNCIATION.name, ALIF_PRONUNCIATION.name, ["ا", "ا", "ـا", "ـا"], "أَلِف", "Alif", "Open throat and chest"],
  ...QAIDA_PRONUNCIATIONS.map((item, index): LetterSeed => {
    const formsByLetter: Record<string, Letter["forms"]> = {
      ب: ["ب", "بـ", "ـبـ", "ـب"],
      ت: ["ت", "تـ", "ـتـ", "ـت"],
      ث: ["ث", "ثـ", "ـثـ", "ـث"],
      ج: ["ج", "جـ", "ـجـ", "ـج"],
      ح: ["ح", "حـ", "ـحـ", "ـح"],
      خ: ["خ", "خـ", "ـخـ", "ـخ"],
      د: ["د", "د", "ـد", "ـد"],
      ذ: ["ذ", "ذ", "ـذ", "ـذ"],
      ر: ["ر", "ر", "ـر", "ـر"],
      ز: ["ز", "ز", "ـز", "ـز"],
      س: ["س", "سـ", "ـسـ", "ـس"],
      ش: ["ش", "شـ", "ـشـ", "ـش"],
      ص: ["ص", "صـ", "ـصـ", "ـص"],
      ض: ["ض", "ضـ", "ـضـ", "ـض"],
      ط: ["ط", "طـ", "ـطـ", "ـط"],
      ظ: ["ظ", "ظـ", "ـظـ", "ـظ"],
      ع: ["ع", "عـ", "ـعـ", "ـع"],
      غ: ["غ", "غـ", "ـغـ", "ـغ"],
      ف: ["ف", "فـ", "ـفـ", "ـف"],
      ق: ["ق", "قـ", "ـقـ", "ـق"],
      ك: ["ك", "كـ", "ـكـ", "ـك"],
      ل: ["ل", "لـ", "ـلـ", "ـل"],
      م: ["م", "مـ", "ـمـ", "ـم"],
      ن: ["ن", "نـ", "ـنـ", "ـن"],
      ه: ["ه", "هـ", "ـهـ", "ـه"],
      و: ["و", "و", "ـو", "ـو"],
      ي: ["ي", "يـ", "ـيـ", "ـي"],
    };
    const examples: Record<string, [string, string, string]> = {
      ب: ["بَيْت", "House", "Both lips together"],
      ت: ["تُفَّاح", "Apple", "Tongue tip at upper teeth"],
      ث: ["ثَلْج", "Snow", "Tongue gently between teeth"],
      ج: ["جَمَل", "Camel", "Middle tongue at palate"],
      ح: ["حِصَان", "Horse", "Middle throat"],
      خ: ["خُبْز", "Bread", "Upper throat"],
      د: ["دُجَاج", "Chicken", "Tongue tip at upper teeth"],
      ذ: ["ذَهَب", "Gold", "Tongue between teeth, voiced"],
      ر: ["رَأْس", "Head", "Tongue tip at gum ridge"],
      ز: ["زَهْرَة", "Flower", "Tongue behind lower teeth"],
      س: ["سَمَاء", "Sky", "Light hiss behind lower teeth"],
      ش: ["شَجَرَة", "Tree", "Wide airflow over tongue"],
      ص: ["صَبْر", "Patience", "Heavy emphatic S"],
      ض: ["ضَوْء", "Light", "Side of tongue at molars"],
      ط: ["طَيْر", "Bird", "Raised back tongue"],
      ظ: ["ظَبْي", "Deer", "Heavy tongue between teeth"],
      ع: ["عِنَب", "Grapes", "Middle throat"],
      غ: ["غَيْم", "Cloud", "Upper throat, voiced"],
      ف: ["فِيل", "Elephant", "Upper teeth on lower lip"],
      ق: ["قَمَر", "Moon", "Back tongue near uvula"],
      ك: ["كِتَاب", "Book", "Back tongue at soft palate"],
      ل: ["لَيْث", "Lion", "Tongue tip at gum ridge"],
      م: ["مَاء", "Water", "Both lips closed"],
      ن: ["نَجْم", "Star", "Tongue tip with nasal sound"],
      ه: ["هَوَاء", "Air", "Gentle chest breath"],
      و: ["وَرْدَة", "Rose", "Rounded lips"],
      ي: ["يَد", "Hand", "Middle tongue toward palate"],
    };
    const [example, meaning, makharij] = examples[item.arabic];
    return [
      index + 2,
      item.arabic,
      item.name,
      item.name,
      formsByLetter[item.arabic],
      example,
      meaning,
      makharij,
    ];
  }),
];

export const LETTERS: Letter[] = letterSeeds.map(
  ([id, letter, name, sound, forms, example, meaning, makharij]) => ({
    id,
    letter,
    name,
    sound,
    forms,
    example,
    meaning,
    makharij,
    mouthPosition: makharij,
    childExplanation: `This is ${name}. Look at its shape, listen carefully, and say the sound gently.`,
    teacherNote: `Model ${name} slowly from its correct articulation point, then compare the learner's sound without forcing repetition.`,
    parentNote: `Practise ${name} for two or three minutes. Praise careful listening before asking for another try.`,
    writingHint: `Begin from the top and follow the natural right-to-left Arabic writing direction for ${name}.`,
    audioKey: `letter-${id}`,
    reviewStatus: "pending-qari-review" as const,
  }),
);

const base: CurriculumItem[] = [
  { id: "cover", title: "Noorani Qaida", unit: "Start", arabic: "اقْرَأْ", summary: "An interactive admin preview of the complete learning journey." },
  { id: "toc", title: "Table of Contents", unit: "Start", summary: "Explore all seven curriculum units." },
  { id: "how-to", title: "How to Use", unit: "Guides", summary: "Listen, recognise, trace, practise, play, rate, and review." },
  { id: "teacher-guide", title: "Teacher's Guide", unit: "Guides", summary: "Model each sound clearly, then use repetition and positive correction." },
  { id: "parent-guide", title: "Parent's Guide", unit: "Guides", summary: "Use short daily practice with praise and patient repetition." },
  { id: "planner", title: "Weekly Planner", unit: "Guides", summary: "Plan five new lessons, one revision session, and Quran practice weekly." },
  { id: "alphabet-chart", title: "Alphabet Chart", unit: "Unit 1", summary: "View and open all 28 Arabic letters." },
  { id: "letter-families", title: "Letter Families", unit: "Unit 1", summary: "Compare related shapes and learn how dots change letters." },
  { id: "flashcards", title: "Flashcard Mode", unit: "Unit 1", summary: "Review letters, names, sounds, and examples." },
  { id: "progress", title: "My Progress", unit: "Progress", summary: "Review completion, ratings, rewards, and badges." },
];

const letterItems: CurriculumItem[] = LETTERS.map((letter) => ({
  id: `letter-${letter.id}` as ScreenId,
  title: `${letter.id}. ${letter.name}`,
  unit: "Unit 1 · Alphabet",
  arabic: letter.letter,
  summary: `Recognise and pronounce ${letter.name} in all four joining forms.`,
}));

const advanced: CurriculumItem[] = [
  ["harakat-intro", "Harakat Overview", "Unit 2 · Vowels", "بَ بِ بُ", "Meet the three short vowel marks."],
  ["fatha", "Fatha", "Unit 2 · Vowels", "بَ", "Short a sound, marked above a letter."],
  ["kasra", "Kasra", "Unit 2 · Vowels", "بِ", "Short i sound, marked below a letter."],
  ["damma", "Damma", "Unit 2 · Vowels", "بُ", "Short u sound, marked above a letter."],
  ["tanween", "Tanween", "Unit 3 · Diacritics", "بً بٍ بٌ", "Double vowels add an ending n sound."],
  ["sukoon", "Sukoon", "Unit 3 · Diacritics", "بْ", "A letter stops without a vowel."],
  ["shaddah", "Shaddah", "Unit 3 · Diacritics", "بّ", "A letter is doubled and stressed."],
  ["madd", "Madd", "Unit 4 · Long Vowels", "آ و ي", "Stretch long vowels for the required counts."],
  ["joining", "Joining Letters", "Unit 5 · Reading", "سلم", "Connect changing letter forms into words."],
  ["compound", "Compound Letters", "Unit 5 · Reading", "لا", "Recognise common combinations such as Lam-Alif."],
  ["reading-words", "Reading Words", "Unit 5 · Reading", "كَتَبَ", "Build fluency from short vowelled words."],
  ["reading-stories", "Reading Stories", "Unit 5 · Reading", "قَرَأَ", "Read short connected passages."],
  ["reading-sentences", "Reading Sentences", "Unit 5 · Reading", "الْعِلْمُ نُورٌ", "Read complete vowelled sentences."],
  ["quran-practice", "Quran Practice", "Unit 5 · Reading", "بِسْمِ اللَّهِ", "Apply recognition and pronunciation to short ayat."],
  ["tajweed-intro", "Tajweed Introduction", "Unit 6 · Tajweed", "ق ط ب ج د", "Meet articulation, elongation, qalqalah, ghunnah, and stopping."],
  ["revision", "Grand Revision", "Unit 7 · Assessment", "🔄", "Review letters, vowels, joining, reading, and Tajweed."],
  ["assessment", "Final Assessment", "Unit 7 · Assessment", "📋", "Check recognition, pronunciation, reading, and application."],
  ["certificate", "Certificate", "Unit 7 · Assessment", "🏆", "Celebrate completion of the preview curriculum."],
].map(([id, title, unit, arabic, summary]) => ({ id: id as ScreenId, title, unit, arabic, summary }));

export const CURRICULUM = [...base, ...letterItems, ...advanced];
export const CURRICULUM_BY_ID = Object.fromEntries(CURRICULUM.map((item) => [item.id, item])) as Record<ScreenId, CurriculumItem>;
export const ORDERED_SCREEN_IDS = CURRICULUM.map((item) => item.id);

export function screenIndex(id: ScreenId) {
  return Math.max(0, ORDERED_SCREEN_IDS.indexOf(id));
}

export function lessonLetterForScreen(screen: ScreenId): Letter {
  if (screen.startsWith("letter-")) {
    return LETTERS[Math.max(0, Math.min(27, Number(screen.slice(7)) - 1))];
  }
  const hash = Array.from(screen).reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
  return LETTERS[hash % LETTERS.length];
}

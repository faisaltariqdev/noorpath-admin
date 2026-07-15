import type { CurriculumItem, Letter, ScreenId } from "../types";

export const LETTERS: Letter[] = [
  [1,"ا","Alif","a",["ا","ا","ـا","ـا"],"أَلِف","Alif","Open throat and chest"],
  [2,"ب","Ba","b",["ب","بـ","ـبـ","ـب"],"بَيْت","House","Both lips together"],
  [3,"ت","Ta","t",["ت","تـ","ـتـ","ـت"],"تُفَّاح","Apple","Tongue tip at upper teeth"],
  [4,"ث","Tha","th",["ث","ثـ","ـثـ","ـث"],"ثَلْج","Snow","Tongue gently between teeth"],
  [5,"ج","Jeem","j",["ج","جـ","ـجـ","ـج"],"جَمَل","Camel","Middle tongue at palate"],
  [6,"ح","Haa","h",["ح","حـ","ـحـ","ـح"],"حِصَان","Horse","Middle throat"],
  [7,"خ","Kha","kh",["خ","خـ","ـخـ","ـخ"],"خُبْز","Bread","Upper throat"],
  [8,"د","Dal","d",["د","د","ـد","ـد"],"دُجَاج","Chicken","Tongue tip at upper teeth"],
  [9,"ذ","Dhal","dh",["ذ","ذ","ـذ","ـذ"],"ذَهَب","Gold","Tongue between teeth, voiced"],
  [10,"ر","Ra","r",["ر","ر","ـر","ـر"],"رَأْس","Head","Tongue tip at gum ridge"],
  [11,"ز","Zain","z",["ز","ز","ـز","ـز"],"زَهْرَة","Flower","Tongue behind lower teeth"],
  [12,"س","Seen","s",["س","سـ","ـسـ","ـس"],"سَمَاء","Sky","Light hiss behind lower teeth"],
  [13,"ش","Sheen","sh",["ش","شـ","ـشـ","ـش"],"شَجَرَة","Tree","Wide airflow over tongue"],
  [14,"ص","Saad","s",["ص","صـ","ـصـ","ـص"],"صَبْر","Patience","Heavy emphatic S"],
  [15,"ض","Daad","d",["ض","ضـ","ـضـ","ـض"],"ضَوْء","Light","Side of tongue at molars"],
  [16,"ط","Taa","t",["ط","طـ","ـطـ","ـط"],"طَيْر","Bird","Raised back tongue"],
  [17,"ظ","Dhaa","dh",["ظ","ظـ","ـظـ","ـظ"],"ظَبْي","Deer","Heavy tongue between teeth"],
  [18,"ع","Ain","ʿ",["ع","عـ","ـعـ","ـع"],"عِنَب","Grapes","Middle throat"],
  [19,"غ","Ghain","gh",["غ","غـ","ـغـ","ـغ"],"غَيْم","Cloud","Upper throat, voiced"],
  [20,"ف","Fa","f",["ف","فـ","ـفـ","ـف"],"فِيل","Elephant","Upper teeth on lower lip"],
  [21,"ق","Qaf","q",["ق","قـ","ـقـ","ـق"],"قَمَر","Moon","Back tongue near uvula"],
  [22,"ك","Kaf","k",["ك","كـ","ـكـ","ـك"],"كِتَاب","Book","Back tongue at soft palate"],
  [23,"ل","Lam","l",["ل","لـ","ـلـ","ـل"],"لَيْث","Lion","Tongue tip at gum ridge"],
  [24,"م","Meem","m",["م","مـ","ـمـ","ـم"],"مَاء","Water","Both lips closed"],
  [25,"ن","Noon","n",["ن","نـ","ـنـ","ـن"],"نَجْم","Star","Tongue tip with nasal sound"],
  [26,"ه","Ha","h",["ه","هـ","ـهـ","ـه"],"هَوَاء","Air","Gentle chest breath"],
  [27,"و","Waw","w",["و","و","ـو","ـو"],"وَرْدَة","Rose","Rounded lips"],
  [28,"ي","Ya","y",["ي","يـ","ـيـ","ـي"],"يَد","Hand","Middle tongue toward palate"],
].map(([id, letter, name, sound, forms, example, meaning, makharij]) => ({
  id: id as number, letter: letter as string, name: name as string, sound: sound as string,
  forms: forms as Letter["forms"], example: example as string, meaning: meaning as string,
  makharij: makharij as string,
  mouthPosition: makharij as string,
  childExplanation: `This is ${name}. Look at its shape, listen carefully, and say the sound gently.`,
  teacherNote: `Model ${name} slowly from its correct articulation point, then compare the learner's sound without forcing repetition.`,
  parentNote: `Practise ${name} for two or three minutes. Praise careful listening before asking for another try.`,
  writingHint: `Begin from the top and follow the natural right-to-left Arabic writing direction for ${name}.`,
  audioKey: `letter-${id}`,
  reviewStatus: "pending-qari-review" as const,
}));

const base: CurriculumItem[] = [
  { id:"cover",title:"Noorani Qaida",unit:"Start",arabic:"اقْرَأْ",summary:"An interactive admin preview of the complete learning journey." },
  { id:"toc",title:"Table of Contents",unit:"Start",summary:"Explore all seven curriculum units." },
  { id:"how-to",title:"How to Use",unit:"Guides",summary:"Listen, recognise, trace, practise, play, rate, and review." },
  { id:"teacher-guide",title:"Teacher's Guide",unit:"Guides",summary:"Model each sound clearly, then use repetition and positive correction." },
  { id:"parent-guide",title:"Parent's Guide",unit:"Guides",summary:"Use short daily practice with praise and patient repetition." },
  { id:"planner",title:"Weekly Planner",unit:"Guides",summary:"Plan five new lessons, one revision session, and Quran practice weekly." },
  { id:"alphabet-chart",title:"Alphabet Chart",unit:"Unit 1",summary:"View and open all 28 Arabic letters." },
  { id:"letter-families",title:"Letter Families",unit:"Unit 1",summary:"Compare related shapes and learn how dots change letters." },
  { id:"flashcards",title:"Flashcard Mode",unit:"Unit 1",summary:"Review letters, names, sounds, and examples." },
  { id:"progress",title:"My Progress",unit:"Progress",summary:"Review completion, ratings, rewards, and badges." },
];

const letterItems: CurriculumItem[] = LETTERS.map((letter) => ({
  id: `letter-${letter.id}` as ScreenId,
  title: `${letter.id}. ${letter.name}`,
  unit: "Unit 1 · Alphabet",
  arabic: letter.letter,
  summary: `Recognise and pronounce ${letter.name} in all four joining forms.`,
}));

const advanced: CurriculumItem[] = [
  ["harakat-intro","Harakat Overview","Unit 2 · Vowels","بَ بِ بُ","Meet the three short vowel marks."],
  ["fatha","Fatha","Unit 2 · Vowels","بَ","Short a sound, marked above a letter."],
  ["kasra","Kasra","Unit 2 · Vowels","بِ","Short i sound, marked below a letter."],
  ["damma","Damma","Unit 2 · Vowels","بُ","Short u sound, marked above a letter."],
  ["tanween","Tanween","Unit 3 · Diacritics","بً بٍ بٌ","Double vowels add an ending n sound."],
  ["sukoon","Sukoon","Unit 3 · Diacritics","بْ","A letter stops without a vowel."],
  ["shaddah","Shaddah","Unit 3 · Diacritics","بّ","A letter is doubled and stressed."],
  ["madd","Madd","Unit 4 · Long Vowels","آ و ي","Stretch long vowels for the required counts."],
  ["joining","Joining Letters","Unit 5 · Reading","سلم","Connect changing letter forms into words."],
  ["compound","Compound Letters","Unit 5 · Reading","لا","Recognise common combinations such as Lam-Alif."],
  ["reading-words","Reading Words","Unit 5 · Reading","كَتَبَ","Build fluency from short vowelled words."],
  ["reading-stories","Reading Stories","Unit 5 · Reading","قَرَأَ","Read short connected passages."],
  ["reading-sentences","Reading Sentences","Unit 5 · Reading","الْعِلْمُ نُورٌ","Read complete vowelled sentences."],
  ["quran-practice","Quran Practice","Unit 5 · Reading","بِسْمِ اللَّهِ","Apply recognition and pronunciation to short ayat."],
  ["tajweed-intro","Tajweed Introduction","Unit 6 · Tajweed","ق ط ب ج د","Meet articulation, elongation, qalqalah, ghunnah, and stopping."],
  ["revision","Grand Revision","Unit 7 · Assessment","🔄","Review letters, vowels, joining, reading, and Tajweed."],
  ["assessment","Final Assessment","Unit 7 · Assessment","📋","Check recognition, pronunciation, reading, and application."],
  ["certificate","Certificate","Unit 7 · Assessment","🏆","Celebrate completion of the preview curriculum."],
].map(([id,title,unit,arabic,summary]) => ({ id:id as ScreenId,title,unit,arabic,summary }));

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

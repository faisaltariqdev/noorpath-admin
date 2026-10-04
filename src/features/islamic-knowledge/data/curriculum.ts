import type { IKBadge, IKLesson, IKQuestion, IKTopic, LessonStep } from "../types";

/* ------------------------------------------------------------------------------------------------
 * Authoring helpers
 *
 * Every question carries three separate pieces of teaching copy:
 *   hint        → shown after the FIRST wrong try, nudges without revealing the answer
 *   why         → shown once the answer is settled (correct or second miss) — the actual teaching
 *   concept     → a key for the fact being tested; the quiz engine never asks two questions with the
 *                 same concept in one session (this is what stops "the same fact asked twice")
 * ---------------------------------------------------------------------------------------------- */

interface QMeta {
  hint?: string;
  why?: string;
  concept?: string;
}

/** Shorthand: c(concept, hint, why). */
function c(concept: string, hint?: string, why?: string): QMeta {
  return { concept, hint, why };
}

function metaFields(meta?: string | QMeta): Pick<IKQuestion, "hint" | "explanation" | "concept"> {
  if (!meta) return {};
  if (typeof meta === "string") return { hint: meta };
  return { hint: meta.hint, explanation: meta.why, concept: meta.concept };
}

function steps(rows: Array<[string, string, string?, LessonStep["type"]?, LessonStep["mascotMood"]?, string?]>): LessonStep[] {
  return rows.map(([emoji, text, title, type = "card", mood, videoUrl], i) => ({
    id: `s${i + 1}`,
    type: i === 0 ? "intro" : type,
    emoji,
    text,
    title,
    mascotMood: mood ?? (i === 0 ? "happy" : "think"),
    ...(videoUrl ? { videoUrl } : {}),
  }));
}

function mcq(id: string, difficulty: IKQuestion["difficulty"], prompt: string, options: string[], correctIndex: number, meta?: string | QMeta): IKQuestion {
  const prepared = options.map((label, i) => ({ id: `${id}-o${i}`, label }));
  const shift = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % Math.max(prepared.length, 1);
  return {
    id,
    kind: "mcq",
    difficulty,
    prompt,
    ...metaFields(meta),
    options: [...prepared.slice(shift), ...prepared.slice(0, shift)],
    answer: `${id}-o${correctIndex}`,
  };
}

function tf(id: string, difficulty: IKQuestion["difficulty"], prompt: string, isTrue: boolean, meta?: string | QMeta): IKQuestion {
  return {
    id,
    kind: "true_false",
    difficulty,
    prompt,
    ...metaFields(meta),
    options: [
      { id: `${id}-t`, label: "True", emoji: "✅" },
      { id: `${id}-f`, label: "False", emoji: "❌" },
    ],
    answer: isTrue ? `${id}-t` : `${id}-f`,
  };
}

function fill(id: string, difficulty: IKQuestion["difficulty"], prompt: string, answer: string, meta?: string | QMeta): IKQuestion {
  return { id, kind: "fill_blank", difficulty, prompt, answer: answer.toLowerCase(), ...metaFields(meta) };
}

function matching(
  id: string,
  difficulty: IKQuestion["difficulty"],
  prompt: string,
  pairs: Array<[string, string]>,
  meta?: string | QMeta,
): IKQuestion {
  return {
    id,
    kind: "matching",
    difficulty,
    prompt,
    ...metaFields(meta),
    pairs: pairs.map(([left, right]) => ({ left, right })),
    answer: pairs.map(([left, right]) => `${left}:${right}`),
  };
}

function sorting(
  id: string,
  difficulty: IKQuestion["difficulty"],
  prompt: string,
  labelsInCorrectOrder: string[],
  meta?: string | QMeta,
): IKQuestion {
  const options = labelsInCorrectOrder.map((label, index) => ({ id: `${id}-o${index}`, label }));
  return {
    id,
    kind: "sorting",
    difficulty,
    prompt,
    ...metaFields(meta),
    options: [...options].reverse(),
    order: options.map((option) => option.id),
    answer: options.map((option) => option.id),
  };
}

function tapSelect(
  id: string,
  difficulty: IKQuestion["difficulty"],
  prompt: string,
  options: Array<[string, string]>,
  correctIndex: number,
  meta?: string | QMeta,
): IKQuestion {
  return {
    id,
    kind: "tap_select",
    difficulty,
    prompt,
    ...metaFields(meta),
    options: options.map(([emoji, label], index) => ({ id: `${id}-o${index}`, emoji, label })),
    answer: `${id}-o${correctIndex}`,
  };
}

function lesson(
  id: string,
  topicId: string,
  title: string,
  subtitle: string,
  seo: [string, string],
  stepRows: Parameters<typeof steps>[0],
  questions: IKQuestion[],
  badgeId?: string,
): IKLesson {
  return {
    id,
    topicId,
    title,
    subtitle,
    seoTitle: seo[0],
    seoDescription: seo[1],
    ageMin: 3,
    ageMax: 12,
    estimatedMinutes: 8,
    steps: steps(stepRows),
    questions,
    badgeId,
  };
}

/** Beginner track — 20 interactive Islamic Knowledge topics */
export const BEGINNER_TOPICS: IKTopic[] = [
  { id: "who-is-allah", level: "beginner", order: 1, title: "Who is Allah?", shortTitle: "Allah", emoji: "🌙", color: "#0A6E4F", summary: "Meet our Creator with love and wonder.", lessonIds: ["who-is-allah-1"] },
  { id: "who-is-prophet", level: "beginner", order: 2, title: "Who is Our Prophet?", shortTitle: "Our Prophet", emoji: "💚", color: "#1B7A5A", summary: "Prophet Muhammad (peace be upon him) — our beloved Messenger.", lessonIds: ["who-is-prophet-1"] },
  { id: "five-pillars", level: "beginner", order: 3, title: "The Five Pillars", shortTitle: "5 Pillars", emoji: "🕌", color: "#C9922A", summary: "Five special pillars that hold up Islam.", lessonIds: ["five-pillars-1"] },
  { id: "six-articles", level: "beginner", order: 4, title: "The Six Articles of Faith", shortTitle: "Iman", emoji: "⭐", color: "#5B6CFF", summary: "Six beautiful things every Muslim believes.", lessonIds: ["six-articles-1"] },
  { id: "kalimas", level: "beginner", order: 5, title: "The Kalimas", shortTitle: "Kalimas", emoji: "📿", color: "#0A6E4F", summary: "Special words that light up the heart.", lessonIds: ["kalimas-1"] },
  { id: "basic-duas", level: "beginner", order: 6, title: "Basic Duas", shortTitle: "Duas", emoji: "🤲", color: "#2D9CDB", summary: "Short duas for everyday moments.", lessonIds: ["basic-duas-1"] },
  { id: "islamic-greetings", level: "beginner", order: 7, title: "Islamic Greetings", shortTitle: "Salam", emoji: "👋", color: "#27AE60", summary: "Assalamu Alaikum — peace for everyone.", lessonIds: ["islamic-greetings-1"] },
  { id: "good-manners", level: "beginner", order: 8, title: "Good Manners", shortTitle: "Adab", emoji: "🌸", color: "#E07A5F", summary: "Kind words and gentle hearts.", lessonIds: ["good-manners-1"] },
  { id: "respect-parents", level: "beginner", order: 9, title: "Respect Parents", shortTitle: "Parents", emoji: "👨‍👩‍👧", color: "#9B59B6", summary: "Loving Mum and Dad the Islamic way.", lessonIds: ["respect-parents-1"] },
  { id: "cleanliness", level: "beginner", order: 10, title: "Cleanliness in Islam", shortTitle: "Clean", emoji: "🧼", color: "#16A085", summary: "Clean body, clean clothes, clean heart.", lessonIds: ["cleanliness-1"] },
  { id: "kindness", level: "beginner", order: 11, title: "Kindness", shortTitle: "Kind", emoji: "💛", color: "#F4A261", summary: "Soft hearts make the world bright.", lessonIds: ["kindness-1"] },
  { id: "sharing", level: "beginner", order: 12, title: "Sharing", shortTitle: "Share", emoji: "🎁", color: "#E76F51", summary: "Sharing brings barakah and smiles.", lessonIds: ["sharing-1"] },
  { id: "truthfulness", level: "beginner", order: 13, title: "Truthfulness", shortTitle: "Truth", emoji: "✨", color: "#457B9D", summary: "Always tell the truth — it is light.", lessonIds: ["truthfulness-1"] },
  { id: "helping-others", level: "beginner", order: 14, title: "Helping Others", shortTitle: "Help", emoji: "🤝", color: "#2A9D8F", summary: "Helping is a form of worship.", lessonIds: ["helping-others-1"] },
  { id: "mosque-etiquette", level: "beginner", order: 15, title: "Mosque Etiquette", shortTitle: "Masjid", emoji: "🕌", color: "#0A6E4F", summary: "Quiet feet and respectful hearts in the masjid.", lessonIds: ["mosque-etiquette-1"] },
  { id: "ramadan", level: "beginner", order: 16, title: "Ramadan", shortTitle: "Ramadan", emoji: "🌙", color: "#264653", summary: "The blessed month of fasting and care.", lessonIds: ["ramadan-1"] },
  { id: "eid", level: "beginner", order: 17, title: "Eid", shortTitle: "Eid", emoji: "🎉", color: "#E9C46A", summary: "Happy Eid — thank Allah and share joy.", lessonIds: ["eid-1"] },
  { id: "angels", level: "beginner", order: 18, title: "Angels", shortTitle: "Angels", emoji: "🪽", color: "#A8DADC", summary: "Allah’s special servants made of light.", lessonIds: ["angels-1"] },
  { id: "prophets", level: "beginner", order: 19, title: "Prophets", shortTitle: "Prophets", emoji: "📜", color: "#6D597A", summary: "Messengers who taught us about Allah.", lessonIds: ["prophets-1"] },
  { id: "jannah", level: "beginner", order: 20, title: "Jannah", shortTitle: "Jannah", emoji: "🏡", color: "#52B788", summary: "The beautiful forever home with Allah.", lessonIds: ["jannah-1"] },
];

export const INTERMEDIATE_TOPICS: IKTopic[] = [
  { id: "stories-prophets", level: "intermediate", order: 1, title: "Stories of the Prophets", shortTitle: "Stories", emoji: "📖", color: "#0A6E4F", summary: "Adventure stories that teach iman.", lessonIds: ["stories-prophets-1"] },
  { id: "sahabah", level: "intermediate", order: 2, title: "The Sahabah", shortTitle: "Sahabah", emoji: "🌟", color: "#C9922A", summary: "Friends of the Prophet ﷺ.", lessonIds: ["sahabah-1"] },
  { id: "animals-quran", level: "intermediate", order: 3, title: "Animals in the Quran", shortTitle: "Animals", emoji: "🐝", color: "#2A9D8F", summary: "Bee, ant, bird — Allah’s signs.", lessonIds: ["animals-quran-1"] },
  { id: "daily-sunnah", level: "intermediate", order: 4, title: "Daily Sunnah", shortTitle: "Sunnah", emoji: "☀️", color: "#F4A261", summary: "Little Sunnahs for every day.", lessonIds: ["daily-sunnah-1"] },
  { id: "halal-haram", level: "intermediate", order: 5, title: "Halal vs Haram", shortTitle: "Halal", emoji: "✅", color: "#27AE60", summary: "What is good for us, and what to avoid.", lessonIds: ["halal-haram-1"] },
  { id: "wudu-prayer", level: "intermediate", order: 6, title: "Wudu & Prayer", shortTitle: "Salah", emoji: "🧼", color: "#457B9D", summary: "Clean for prayer, stand for Allah.", lessonIds: ["wudu-prayer-1"] },
];

export const ADVANCED_TOPICS: IKTopic[] = [
  { id: "seerah-timeline", level: "advanced", order: 1, title: "Seerah Timeline", shortTitle: "Seerah", emoji: "🗺️", color: "#0A6E4F", summary: "Walk the path of the Prophet ﷺ.", lessonIds: ["seerah-timeline-1"] },
  { id: "islamic-ethics", level: "advanced", order: 2, title: "Islamic Ethics", shortTitle: "Ethics", emoji: "🧭", color: "#5B6CFF", summary: "Character that shines for Allah.", lessonIds: ["islamic-ethics-1"] },
  { id: "patience-gratitude", level: "advanced", order: 3, title: "Patience & Gratitude", shortTitle: "Sabr", emoji: "🌱", color: "#52B788", summary: "Sabr and shukr — twin lights.", lessonIds: ["patience-gratitude-1"] },
  { id: "honesty-leadership", level: "advanced", order: 4, title: "Honesty & Leadership", shortTitle: "Lead", emoji: "🦁", color: "#C9922A", summary: "Lead with truth and responsibility.", lessonIds: ["honesty-leadership-1"] },
];

export const ALL_TOPICS: IKTopic[] = [
  ...BEGINNER_TOPICS,
  ...INTERMEDIATE_TOPICS,
  ...ADVANCED_TOPICS,
];

export const IK_BADGES: IKBadge[] = [
  { id: "first-lesson", title: "First Spark", emoji: "✨", description: "Complete your first Islamic Knowledge lesson" },
  { id: "beginner-5", title: "Little Seeker", emoji: "🌙", description: "Finish 5 beginner topics" },
  { id: "beginner-10", title: "Star Student", emoji: "⭐", description: "Finish 10 beginner topics" },
  { id: "beginner-all", title: "Beginner Champion", emoji: "🏆", description: "Complete all 20 beginner topics" },
  { id: "quiz-ace", title: "Quiz Ace", emoji: "🎯", description: "Score 100% on any quiz" },
  { id: "streak-3", title: "3-Day Streak", emoji: "🔥", description: "Learn 3 days in a row" },
  { id: "streak-7", title: "Week of Light", emoji: "🌟", description: "Learn 7 days in a row" },
  { id: "kind-heart", title: "Kind Heart", emoji: "💛", description: "Complete Kindness & Sharing" },
  { id: "iman-builder", title: "Iman Builder", emoji: "🕌", description: "Complete Allah, Prophet ﷺ & Five Pillars" },
  { id: "daily-first", title: "Daily Hero", emoji: "📅", description: "Finish your first Daily Challenge" },
  { id: "combo-5", title: "On Fire", emoji: "⚡", description: "Answer 5 questions in a row correctly" },
  { id: "fifty-answers", title: "Fifty Thinker", emoji: "🧠", description: "Answer 50 quiz questions" },
];

export const LESSONS: IKLesson[] = [
  lesson(
    "who-is-allah-1",
    "who-is-allah",
    "Who is Allah?",
    "Our Creator who loves us",
    ["Who is Allah for Kids", "A gentle interactive lesson for children about who Allah is — Creator, One, and Most Merciful."],
    [
      ["🌙", "Assalamu Alaikum! Today we learn about Allah — the One who made everything.", "Hello little star!", "intro", "happy"],
      ["🌍", "Allah made the sky, the sun, the trees, the animals… and YOU!", "Allah created us", "card", "cheer"],
      ["☝️", "Allah is One. We only worship Allah — no one else.", "Allah is One", "tap", "think"],
      ["💚", "Allah is Ar-Rahman — the Most Merciful. He loves us so much!", "Allah loves you", "mascot", "happy"],
      ["👂", "Allah hears every dua — even a tiny whisper in your heart.", "Allah hears you", "fact", "hint"],
    ],
    [
      mcq("a1e", "easy", "Who created the sky and the earth?", ["Allah", "People", "The moon"], 0, c("creator", "Think of who made everything — even the moon itself.", "Allah alone created the heavens, the earth and everything in them.")),
      tf("a1m", "medium", "Muslims worship only Allah.", true, c("one", "How many gods do Muslims believe in?", "Allah is One. We worship Him alone and no one else.")),
      mcq("a1h", "hard", "Which name means the Most Merciful?", ["Ar-Rahman", "Al-Malik", "As-Sami"], 0, c("rahman", "It begins with 'Ar-' and is all about mercy.", "Ar-Rahman means the Most Merciful. Al-Malik is the King and As-Sami is the All-Hearing.")),
      fill("a1f", "medium", "We say: There is no god but ____.", "allah", c("one", "It is the name we call our Creator.", "La ilaha illallah — there is no god but Allah. This is the heart of our faith.")),
      tapSelect("a1t", "easy", "Tap what we do when we want to talk to Allah.", [["🤲", "Make dua"], ["😴", "Go to sleep"], ["📺", "Watch TV"]], 0, c("hears-dua", "Talking to Allah has a special name that starts with D.", "Dua is how we talk to Allah — He hears even a whisper in your heart.")),
      tf("a1s", "easy", "Allah can see us even when no one else is watching.", true, c("allah-sees", "Does Allah ever sleep or look away?", "Allah is Al-Basir, the All-Seeing. He sees us everywhere, so we try to do good even when we are alone.")),
      mcq("a1g", "medium", "You see a beautiful rainbow. What is a lovely thing to say?", ["SubhanAllah", "Oops", "Go away"], 0, c("dhikr-wonder", "It is a word that praises Allah for something amazing.", "SubhanAllah means 'Glory be to Allah'. We say it when we see something wonderful He made.")),
      mcq("a1n", "hard", "As-Sami means that Allah is…", ["the All-Hearing", "the All-Seeing", "the King"], 0, c("name-sami", "Think about ears.", "As-Sami is the All-Hearing — Allah hears every dua, loud or quiet.")),
    ],
    "first-lesson",
  ),
  lesson(
    "who-is-prophet-1",
    "who-is-prophet",
    "Who is Our Prophet?",
    "The best teacher and friend",
    ["Who was Prophet Muhammad for Kids", "Interactive kids lesson about Prophet Muhammad (peace be upon him) — kindness, honesty, and being our Messenger."],
    [
      ["💚", "Prophet Muhammad (peace be upon him) is Allah’s final Messenger. We love him!", "Our Prophet", "intro", "happy"],
      ["🗣️", "He taught us to be kind, honest, and gentle with everyone.", "Kind & truthful", "card", "cheer"],
      ["📖", "Allah gave him the Quran — our beautiful Book.", "The Quran", "tap", "think"],
      ["🧒", "He loved children and smiled at them. You can smile too!", "Love for kids", "mascot", "happy"],
      ["⭐", "When we say his name, we add: peace be upon him.", "Send salawat", "fact", "hint"],
    ],
    [
      mcq("p1e", "easy", "Who is the final Messenger of Allah?", ["Prophet Muhammad (PBUH)", "A king", "An angel"], 0, c("final-messenger", "He is the Prophet we send salawat upon.", "Prophet Muhammad ﷺ is the last and final Messenger — no prophet comes after him.")),
      tf("p1m", "medium", "Our Prophet was always kind to children.", true, c("kind-children", "Remember how he smiled at the little ones.", "He played with children, greeted them and was gentle — we can copy his kindness.")),
      mcq("p1h", "hard", "What Book did Allah give to our Prophet?", ["The Quran", "A storybook", "A map"], 0, c("quran-given", "It is the Book we recite every day.", "Allah revealed the Quran to Prophet Muhammad ﷺ through Angel Jibreel.")),
      fill("p1f", "easy", "We say: peace be upon ____.", "him", c("salawat", "We are sending peace to the Prophet ﷺ himself.", "'Peace be upon him' (ﷺ) is how we honour the Prophet whenever we say his name.")),
      mcq("p1a", "medium", "People in Makkah called the Prophet ﷺ Al-Ameen. What does it mean?", ["The Trustworthy", "The Strong", "The Rich"], 0, c("al-ameen", "People trusted him with their belongings.", "Al-Ameen means the Trustworthy — even before Islam, people knew he never lied or cheated.")),
      tapSelect("p1t", "easy", "Tap the city where the Prophet ﷺ was born.", [["🕋", "Makkah"], ["🗼", "Paris"], ["🌴", "Madinah"]], 0, c("born-makkah", "It is the city of the Kaaba.", "Prophet Muhammad ﷺ was born in Makkah, the city of the Kaaba.")),
      tf("p1s", "hard", "Following the Prophet's ﷺ way (Sunnah) is only for grown-ups.", false, c("sunnah-for-all", "Can a child smile, share and say Salam?", "Sunnah is for everyone — smiling, saying Salam and eating with the right hand are Sunnahs children can do today.")),
      mcq("p1k", "medium", "A classmate is sad and alone. What would the Prophet ﷺ do?", ["Sit with them and cheer them up", "Ignore them", "Laugh at them"], 0, c("kindness-scenario", "He never left anyone feeling small.", "The Prophet ﷺ comforted the sad and included the lonely — we follow his example.")),
    ],
  ),
  lesson(
    "five-pillars-1",
    "five-pillars",
    "The Five Pillars",
    "Five strong pillars of Islam",
    ["Five Pillars of Islam for Kids", "Fun interactive lesson for children on Shahada, Salah, Zakat, Sawm, and Hajj."],
    [
      ["🕌", "Islam stands on five special pillars. Let’s count them!", "Five pillars", "intro", "happy"],
      ["☝️", "1. Shahada — saying we believe in Allah and His Messenger ﷺ.", "Shahada", "card", "think"],
      ["🙏", "2. Salah — praying five times a day.", "Salah", "tap", "cheer"],
      ["💝", "3. Zakat — sharing with people who need help.", "Zakat", "card", "happy"],
      ["🌙", "4. Sawm — fasting in Ramadan.", "Sawm", "fact", "hint"],
      ["🕋", "5. Hajj — visiting the Kaaba if we can.", "Hajj", "mascot", "cheer"],
    ],
    [
      mcq("f1e", "easy", "How many pillars does Islam have?", ["Five", "Two", "Ten"], 0, c("count", "Count the fingers on one hand.", "Islam has five pillars: Shahada, Salah, Zakat, Sawm and Hajj.")),
      mcq("f1m", "medium", "Which pillar is praying five times a day?", ["Salah", "Hajj", "Zakat"], 0, c("salah", "It happens at Fajr, Dhuhr, Asr, Maghrib and Isha.", "Salah is the daily prayer — five times every day.")),
      tf("f1h", "hard", "Hajj means fasting in Ramadan.", false, c("hajj", "Hajj involves a journey to a special city.", "Hajj is the pilgrimage to Makkah. Fasting in Ramadan is called Sawm.")),
      fill("f1f", "medium", "The first pillar is called ____.", "shahada", c("shahada", "They are the words we say to declare our faith.", "Shahada — bearing witness that there is no god but Allah and Muhammad ﷺ is His Messenger — is the first pillar.")),
      tapSelect("f1z", "easy", "Tap the pillar about sharing with people in need.", [["💝", "Zakat"], ["🕋", "Hajj"], ["🙏", "Salah"]], 0, c("zakat", "It is all about giving.", "Zakat is giving a share of our wealth to those who need it.")),
      mcq("f1s", "medium", "In which month do Muslims fast for Sawm?", ["Ramadan", "Muharram", "Shawwal"], 0, c("sawm", "It is the month right before Eid al-Fitr.", "Sawm is fasting during the blessed month of Ramadan.")),
      sorting("f1o", "hard", "Put the five pillars in the order they are usually taught.", ["Shahada", "Salah", "Zakat", "Sawm", "Hajj"], c("order", "Start with the words of faith and end with the journey to Makkah.", "The classic order is Shahada, Salah, Zakat, Sawm, then Hajj.")),
      tf("f1j", "medium", "Muslims go for Hajj only if they are able to.", true, c("hajj", "Think about who can travel far and afford it.", "Hajj is required once in a lifetime for those who are healthy and can afford the journey.")),
    ],
  ),
  lesson(
    "six-articles-1",
    "six-articles",
    "Six Articles of Faith",
    "What Muslims believe",
    ["Six Articles of Faith for Kids", "Child-friendly interactive lesson on Iman — belief in Allah, angels, books, messengers, Last Day, and Qadr."],
    [
      ["⭐", "Iman means believing with our heart. There are six big beliefs!", "Iman basics", "intro", "happy"],
      ["🌙", "We believe in Allah — our Creator.", "Allah", "card", "cheer"],
      ["🪽", "We believe in angels — made of light.", "Angels", "tap", "think"],
      ["📖", "We believe in Allah’s Books — like the Quran.", "Books", "card", "happy"],
      ["💚", "We believe in the Messengers — like Prophet Muhammad ﷺ.", "Messengers", "fact", "hint"],
      ["🌤️", "We believe in the Last Day and in Qadr — Allah’s plan.", "Last Day & Qadr", "mascot", "cheer"],
    ],
    [
      mcq("i1e", "easy", "How many articles of faith are there?", ["Six", "Three", "Twelve"], 0, c("count", "One more than five.", "There are six articles of faith: Allah, angels, Books, Messengers, the Last Day and Qadr.")),
      tf("i1m", "medium", "Qadr means that Allah does not know what will happen.", false, c("qadr", "Does Allah know everything?", "Qadr means Allah knows and decrees everything — nothing happens without His knowledge.")),
      mcq("i1h", "hard", "Which article of faith teaches that everyone will answer for their deeds?", ["Belief in the Last Day", "Belief in wealth", "Belief in luck"], 0, c("last-day", "It is about a day at the very end.", "The Last Day is the Day of Judgement, when everyone answers for their deeds.")),
      matching("i1x", "hard", "Match each belief to its meaning.", [["Angels", "Servants made of light"], ["Books", "Revelation from Allah"], ["Qadr", "Allah's knowledge and decree"]], c("articles-map", "Think about the six beliefs from the lesson.", "Angels are made of light, Books are Allah's revelation, and Qadr is His knowledge and decree.")),
      mcq("i1a", "easy", "What are angels made of?", ["Light", "Clay", "Water"], 0, c("angels", "It shines.", "Allah created angels from light; humans were created from clay.")),
      tf("i1b", "medium", "The Quran is the only Book Allah ever sent.", false, c("books", "Think about Prophet Musa and Prophet Isa.", "Allah sent other Books too — like the Tawrah to Musa and the Injeel to Isa. The Quran is the final Book.")),
      fill("i1c", "medium", "Believing with our heart is called ____.", "iman", c("iman-word", "It starts with the letter I.", "Iman means faith — believing in our heart, saying it with our tongue and showing it in our actions.")),
      tapSelect("i1t", "easy", "Tap the Messenger we follow today.", [["💚", "Prophet Muhammad ﷺ"], ["👑", "A king"], ["🧑‍🚀", "An astronaut"]], 0, c("messengers", "He is the final Messenger.", "We believe in all the Messengers, and we follow the final one, Prophet Muhammad ﷺ.")),
    ],
  ),
  lesson(
    "kalimas-1",
    "kalimas",
    "The Kalimas",
    "Words that light the heart",
    ["Kalimas for Kids", "Interactive kids lesson introducing the Kalimas — starting with La ilaha illallah."],
    [
      ["📿", "Kalimas are special Islamic phrases. Let’s learn the first one!", "Kalima time", "intro", "happy"],
      ["☝️", "La ilaha illallah — There is no god but Allah.", "First Kalima", "card", "cheer"],
      ["💚", "Muhammadur Rasulullah — Muhammad ﷺ is the Messenger of Allah.", "Shahada complete", "tap", "think"],
      ["🗣️", "Say it slowly. Your tongue and heart learn together!", "Practice", "mascot", "happy"],
    ],
    [
      mcq("k1e", "easy", "La ilaha illallah means there is no god but ____.", ["Allah", "anyone", "the sun"], 0, c("meaning", "Who do we worship?", "La ilaha illallah means 'there is no god but Allah'.")),
      tf("k1m", "medium", "The Kalimas help us remember Allah.", true, c("remember", "Why do we repeat them?", "Saying the Kalimas keeps Allah in our hearts and on our tongues.")),
      fill("k1f", "hard", "Complete: La ilaha ____ Allah.", "illallah", c("meaning", "The missing word means 'except'.", "La ilaha illallah — 'illa' means except: there is no god except Allah.")),
      mcq("k1x", "medium", "What does “Muhammadur Rasulullah” teach us?", ["Muhammad ﷺ is Allah's Messenger", "Muhammad ﷺ is an angel", "Muhammad ﷺ wrote the Quran himself"], 0, c("rasul", "Rasul means messenger.", "Muhammadur Rasulullah means Muhammad ﷺ is the Messenger of Allah — the second part of the Shahada.")),
      mcq("k1c", "medium", "How many Kalimas do children usually learn?", ["Six", "Two", "Twenty"], 0, c("count", "It is the number after five.", "There are six Kalimas — the first is Kalima Tayyibah.")),
      tapSelect("k1t", "easy", "Tap the name of the first Kalima.", [["1️⃣", "Kalima Tayyibah"], ["🌙", "Kalima Ramadan"], ["🕌", "Kalima Masjid"]], 0, c("first-name", "Tayyibah means pure.", "The first Kalima is Kalima Tayyibah, the pure word: La ilaha illallah, Muhammadur Rasulullah.")),
      tf("k1s", "hard", "It is enough to say the Kalima without understanding it.", false, c("understand", "Your tongue and your heart learn together.", "We say the Kalima and also understand and believe its meaning — that is real iman.")),
    ],
  ),
  lesson(
    "basic-duas-1",
    "basic-duas",
    "Basic Duas",
    "Talk to Allah every day",
    ["Basic Duas for Kids", "Interactive lesson with simple daily duas for children — Bismillah, Alhamdulillah, and more."],
    [
      ["🤲", "Dua means talking to Allah. He always listens!", "What is dua?", "intro", "happy"],
      ["🍽️", "Before eating we say Bismillah.", "Before food", "card", "cheer"],
      ["😊", "When something good happens we say Alhamdulillah.", "Thank Allah", "tap", "happy"],
      ["🚪", "When we leave home we ask Allah to protect us.", "Leaving home", "mascot", "hint"],
    ],
    [
      mcq("d1e", "easy", "What do we say before eating?", ["Bismillah", "Goodbye", "Hurry"], 0, c("before-eating", "It means 'in the name of Allah'.", "Bismillah — in the name of Allah — is said before we eat or start anything good.")),
      tf("d1m", "medium", "A Muslim can make dua at many suitable times and places.", true, c("dua-anywhere", "Do we need a special room to talk to Allah?", "Allah hears sincere dua wherever we call upon Him appropriately.")),
      mcq("d1h", "hard", "Dua means ____.", ["talking to Allah", "running", "sleeping"], 0, c("dua-meaning", "It is something we do with our hearts and lips.", "Dua means calling upon and talking to Allah — asking, thanking and remembering Him.")),
      mcq("d1a", "easy", "When something good happens, we say…", ["Alhamdulillah", "Oh no", "Never mind"], 0, c("alhamdulillah", "It means 'all praise is for Allah'.", "Alhamdulillah thanks Allah for every blessing, big or small.")),
      tapSelect("d1t", "easy", "Tap what we do with our hands when making dua.", [["🤲", "Raise them open"], ["👏", "Clap loudly"], ["✊", "Hide them"]], 0, c("hands", "Like asking for a gift.", "We raise our open hands, showing we are asking Allah humbly.")),
      mcq("d1s", "medium", "What do we say when we finish eating?", ["Alhamdulillah", "Bismillah", "Assalamu Alaikum"], 0, c("after-eating", "We thank Allah for the food.", "After eating we say Alhamdulillah to thank Allah for what He gave us.")),
      tf("d1w", "hard", "Allah only answers duas that are said out loud.", false, c("whisper", "Allah is As-Sami, the All-Hearing.", "Allah hears a quiet whisper just as well as a loud voice — even a dua in your heart.")),
    ],
  ),
  lesson(
    "islamic-greetings-1",
    "islamic-greetings",
    "Islamic Greetings",
    "Spread peace with Salam",
    ["Islamic Greetings for Kids", "Learn Assalamu Alaikum and Wa Alaikum Assalam in a fun interactive kids lesson."],
    [
      ["👋", "Muslims greet with peace: Assalamu Alaikum!", "Salam!", "intro", "happy"],
      ["☮️", "It means: Peace be upon you.", "Meaning", "card", "think"],
      ["🔁", "We reply: Wa Alaikum Assalam — And peace be upon you too.", "The reply", "tap", "cheer"],
      ["😄", "A smile is also a charity. Greet with a happy face!", "Smile", "mascot", "happy"],
    ],
    [
      mcq("g1e", "easy", "What do Muslims say to greet?", ["Assalamu Alaikum", "Only hi", "Bye bye"], 0, c("greeting-words", "It is a wish for peace.", "Assalamu Alaikum — peace be upon you — is the Muslim greeting.")),
      tf("g1m", "medium", "Wa Alaikum Assalam is a reply to Assalamu Alaikum.", true, c("reply", "What do we say back?", "Wa Alaikum Assalam means 'and peace be upon you too' — the reply returns the greeting of peace.")),
      fill("g1f", "hard", "Assalamu Alaikum means ____ be upon you.", "peace", c("meaning", "Salam is the Arabic word for it.", "Salam means peace — Assalamu Alaikum wishes peace upon the person you greet.")),
      mcq("g1s", "easy", "What did the Prophet ﷺ say a smile can be?", ["A charity", "A joke", "A mistake"], 0, c("smile", "It is a way of giving without money.", "Smiling at your brother is a charity (sadaqah) — the Prophet ﷺ taught this.")),
      tf("g1w", "medium", "Only grown-ups should say Salam first.", false, c("who-first", "The Prophet ﷺ greeted children too.", "Anyone can greet first — the one who says Salam first earns a big reward.")),
      tapSelect("g1t", "easy", "Tap the friendly way to greet your teacher.", [["👋", "Say Assalamu Alaikum with a smile"], ["🙈", "Hide"], ["😡", "Shout"]], 0, c("greet-scenario", "Peace and a smile.", "A warm Salam with a smile spreads peace and shows respect.")),
      mcq("g1r", "hard", "Which reply adds even more good wishes to Salam?", ["Wa Alaikum Assalam wa Rahmatullah", "Bye bye", "See you"], 0, c("full-reply", "It adds 'and Allah's mercy'.", "Wa Alaikum Assalam wa Rahmatullah means 'and upon you be peace and Allah's mercy' — a fuller, kinder reply.")),
    ],
  ),
  lesson(
    "good-manners-1",
    "good-manners",
    "Good Manners",
    "Adab that makes hearts happy",
    ["Good Manners in Islam for Kids", "Interactive adab lesson — please, thank you, soft voice, and kindness."],
    [
      ["🌸", "Good manners (adab) make Allah and people happy.", "Adab", "intro", "happy"],
      ["🙏", "Say please and JazakAllah Khair when someone helps.", "Thank you", "card", "cheer"],
      ["🤫", "Use a soft voice. Don’t shout at home or school.", "Gentle voice", "tap", "think"],
      ["👟", "Take turns. Don’t push. Be a gentle friend.", "Gentle friend", "mascot", "happy"],
    ],
    [
      mcq("m1e", "easy", "Good manners in Islam are called ____.", ["Adab", "Akhirah", "Adhan"], 0, c("adab-word", "It starts with A and has four letters.", "Adab means good manners — the respectful way we speak and behave.")),
      tf("m1m", "medium", "A soft voice and respectful words are part of Adab.", true, c("soft-voice", "How did the Prophet ﷺ speak to people?", "Good manners can be heard in the way we speak — gently and respectfully.")),
      mcq("m1h", "hard", "A soft voice shows ____.", ["respect", "anger", "laziness"], 0, c("soft-voice", "Think about how you feel when someone speaks gently to you.", "Speaking softly shows respect for the person listening.")),
      mcq("m1j", "easy", "When someone helps you, what do you say?", ["JazakAllah Khair", "Nothing", "Hurry up"], 0, c("thanks", "It asks Allah to reward them.", "JazakAllah Khair means 'may Allah reward you with good' — the Islamic thank-you.")),
      tapSelect("m1t", "easy", "Tap the good manner.", [["🙋", "Wait for your turn"], ["🏃", "Push to the front"], ["🗣️", "Interrupt"]], 0, c("turns", "Patience is part of adab.", "Waiting your turn and not pushing shows adab.")),
      tf("m1l", "medium", "Good manners include listening when someone else is speaking.", true, c("listening", "Think about what respectful ears do.", "Listening without interrupting is respectful adab.")),
      mcq("m1w", "hard", "What did the Prophet ﷺ say about those with the best manners?", ["They are among the best of people", "They are weak", "They are unlucky"], 0, c("best-character", "Manners make us better people.", "The Prophet ﷺ said the best of you are those with the best manners and character.")),
    ],
  ),
  lesson(
    "respect-parents-1",
    "respect-parents",
    "Respect Parents",
    "Love Mum and Dad",
    ["Respect Parents in Islam for Kids", "Warm interactive lesson teaching children to honor and help their parents."],
    [
      ["👨‍👩‍👧", "Allah tells us to be kind to our parents — always!", "Parents", "intro", "happy"],
      ["💬", "Speak softly. Never say hurtful words.", "Kind words", "card", "think"],
      ["🧹", "Help at home — tidy toys, bring water, smile!", "Help them", "tap", "cheer"],
      ["🤲", "Make dua: My Lord, have mercy on my parents.", "Dua for parents", "mascot", "happy"],
    ],
    [
      mcq("r1e", "easy", "Which action shows respect to parents?", ["Listening and answering gently", "Ignoring a request", "Speaking with a harsh voice"], 0, c("gentle-response", "Think about kind ears and a kind voice.", "Listening and answering gently is how we honour our parents.")),
      tf("r1m", "medium", "Listening and answering gently are ways to respect parents.", true, c("gentle-response", "Respect is shown in both actions and words.", "Respect means kind words and kind actions — both matter.")),
      mcq("r1h", "hard", "What can we ask Allah for our parents?", ["Mercy", "More chores", "Less kindness"], 0, c("dua-mercy", "The lesson taught a dua for them.", "We ask: Rabbi irhamhuma — My Lord, have mercy on my parents.")),
      tapSelect("r1t", "easy", "Tap a way to help at home.", [["🧹", "Tidy your toys"], ["📺", "Watch TV all day"], ["🙅", "Refuse to help"]], 0, c("help-home", "Little hands can do big things.", "Tidying, bringing water and helping happily is respect in action.")),
      tf("r1q", "medium", "Allah mentions kindness to parents in the Quran.", true, c("quran-command", "It appears right after the command to worship Allah alone.", "The Quran commands us to be good to our parents — right after worshipping Allah (Surah Al-Isra 17:23).")),
      fill("r1f", "medium", "We make dua: My Lord, have ____ on my parents.", "mercy", c("dua-mercy", "It is what Ar-Rahman gives.", "Rabbi irhamhuma — My Lord, have mercy on them — is a dua every child can say.")),
      mcq("r1s", "hard", "Mum asks you to stop playing and come. What is the best response?", ["Say 'Yes Mum' and go kindly", "Say 'wait' and keep playing", "Pretend not to hear"], 0, c("obey-scenario", "Kind and quick.", "Answering gently and coming quickly is how we honour our parents.")),
      tf("r1g", "easy", "Saying JazakAllah Khair to Mum or Dad when they help you is a good habit.", true, c("thank-parents", "Do our parents deserve thanks too?", "Thanking our parents — with JazakAllah Khair and a smile — is part of honouring them.")),
    ],
  ),
  lesson(
    "cleanliness-1",
    "cleanliness",
    "Cleanliness in Islam",
    "Clean is part of iman",
    ["Cleanliness in Islam for Kids", "Interactive lesson on wudu, clean clothes, and keeping our space tidy."],
    [
      ["🧼", "Islam loves cleanliness. Clean body, clothes, and place!", "Clean hearts", "intro", "happy"],
      ["🚿", "We wash for prayer — that is called wudu.", "Wudu", "card", "cheer"],
      ["👕", "Wear clean clothes. Brush teeth. Comb hair!", "Daily clean", "tap", "think"],
      ["🗑️", "Don’t litter. Keep the masjid and park clean.", "Care for earth", "mascot", "hint"],
    ],
    [
      mcq("c1e", "easy", "Which choice keeps your shared space clean?", ["Putting rubbish in a bin", "Leaving spills on the floor", "Dropping wrappers outside"], 0, c("shared-space", "Where does rubbish belong?", "Putting rubbish in the bin keeps shared places clean for everyone.")),
      tf("c1m", "medium", "Putting rubbish in a bin helps care for shared places.", true, c("shared-space", "Think about the park and the masjid.", "Cleanliness includes the spaces used by everyone, not just our own room.")),
      mcq("c1h", "hard", "Why do Muslims keep body, clothes, and prayer place clean?", ["Cleanliness is valued in Islam", "Only to impress people", "Because play is forbidden"], 0, c("why-clean", "Think about who we are cleaning for.", "Islam values cleanliness for Allah's sake — not to show off.")),
      mcq("c1w", "easy", "Washing before prayer is called…", ["Wudu", "Sajdah", "Iftar"], 0, c("wudu-name", "It starts with W.", "Wudu is the special wash we do before salah.")),
      tf("c1i", "medium", "The Prophet ﷺ said cleanliness is half of faith.", true, c("half-iman", "Think about how important being clean must be.", "The Prophet ﷺ taught that purity is half of iman — being clean is part of being a Muslim.")),
      tapSelect("c1t", "easy", "Tap what we use to keep our teeth clean.", [["🪥", "Toothbrush or miswak"], ["🍭", "Sweets"], ["🧦", "Socks"]], 0, c("teeth", "The Prophet ﷺ used a special stick called miswak.", "Brushing with a toothbrush or miswak keeps our mouth clean — a Sunnah.")),
      sorting("c1o", "hard", "Order these steps for getting ready for salah.", ["Make wudu", "Put on clean clothes", "Face the Qiblah", "Begin salah"], c("ready-order", "Wash first, then dress, then face the Kaaba.", "We make wudu, wear clean clothes, face the Qiblah and then start salah.")),
    ],
  ),
  lesson(
    "kindness-1",
    "kindness",
    "Kindness",
    "Soft hearts win",
    ["Kindness in Islam for Kids", "Playful interactive lesson teaching Muslim children to be kind to people and animals."],
    [
      ["💛", "The Prophet ﷺ was the kindest. We try to be kind too!", "Be kind", "intro", "happy"],
      ["🐶", "Be gentle with animals. Don’t hurt them.", "Animals", "card", "think"],
      ["🧒", "Share toys. Invite the lonely friend to play.", "Friends", "tap", "cheer"],
      ["💬", "Kind words are heavier than gold on the Scale!", "Kind words", "mascot", "happy"],
    ],
    [
      mcq("ki1e", "easy", "A new child is sitting alone. What is the kind choice?", ["Invite them to join", "Laugh at them", "Hide their things"], 0, c("include-lonely", "How would you feel sitting alone?", "Inviting the lonely child to join is exactly what the Prophet ﷺ would do.")),
      tf("ki1m", "medium", "Kind words make Allah happy.", true, c("kind-words", "Think about what the lesson said about the Scale.", "Kind words are loved by Allah and weigh heavily in good deeds.")),
      fill("ki1f", "hard", "The Prophet ﷺ was very ____.", "kind", c("prophet-kind", "It is the whole topic of this lesson!", "The Prophet ﷺ was the kindest of people — to children, adults and animals.")),
      tapSelect("ki1t", "easy", "Tap the kind thing to do for a thirsty cat.", [["🥣", "Give it water"], ["👟", "Kick it"], ["😆", "Laugh at it"]], 0, c("animals", "Animals are Allah's creation too.", "The Prophet ﷺ taught mercy to animals — a person was rewarded for giving water to a thirsty dog.")),
      mcq("ki1s", "medium", "Your little brother breaks your toy by accident. What is the kind response?", ["Say 'It's okay, accidents happen'", "Shout at him", "Break his toy"], 0, c("forgive", "How would you like to be treated?", "Forgiving kindly is what the Prophet ﷺ did — and it brings hearts closer.")),
      tf("ki1r", "hard", "Allah's mercy comes to those who show mercy to others.", true, c("mercy-return", "What we give comes back to us.", "The Prophet ﷺ said: be merciful to those on earth, and the One in heaven will be merciful to you.")),
      mcq("ki1w", "medium", "Which of these is a kind word to say to a friend?", ["JazakAllah Khair for helping me", "You are so slow", "Go away"], 0, c("kind-words-scenario", "Which one would make you smile?", "Kind words like JazakAllah Khair lift hearts — and Allah loves them.")),
    ],
    "kind-heart",
  ),
  lesson(
    "sharing-1",
    "sharing",
    "Sharing",
    "Barakah grows when we share",
    ["Sharing in Islam for Kids", "Interactive kids lesson on sharing food, toys, and kindness for Allah’s sake."],
    [
      ["🎁", "Sharing makes our rizq (blessings) grow!", "Share!", "intro", "happy"],
      ["🍎", "Share snacks. Offer the bigger piece to a friend.", "Food", "card", "cheer"],
      ["🧸", "Take turns with toys. Don’t grab.", "Toys", "tap", "think"],
      ["💝", "Giving for Allah is better than keeping everything.", "For Allah", "mascot", "happy"],
    ],
    [
      mcq("sh1e", "easy", "Two children want one toy. What should they do?", ["Take turns", "Grab it", "Break it"], 0, c("take-turns", "What is fair for both?", "Taking turns lets both children enjoy the toy — that is fair sharing.")),
      tf("sh1m", "medium", "Taking turns is a fair way to share something.", true, c("take-turns", "Sharing can mean giving a portion or giving a turn.", "Sharing can mean giving a piece or giving someone a turn — both are generous.")),
      mcq("sh1h", "hard", "A sincere Muslim shares mainly to ____.", ["please Allah and help others", "receive praise", "make others feel small"], 0, c("sincere", "Who are we really giving for?", "We share to please Allah and help others — not for praise.")),
      fill("sh1f", "medium", "Sharing brings ____ — blessings from Allah.", "barakah", c("barakah", "It starts with B and means blessing.", "Barakah is Allah's blessing — sharing makes small things go a long way.")),
      tapSelect("sh1t", "easy", "Tap what to do with your snack when a friend has none.", [["🍎", "Share half"], ["🙈", "Hide it"], ["😋", "Eat it quickly"]], 0, c("share-food", "Half a snack, double the smiles.", "The Prophet ﷺ loved sharing food — even a small share counts.")),
      mcq("sh1d", "hard", "Giving something to help others for Allah's sake is called…", ["Sadaqah", "Salah", "Sawm"], 0, c("sadaqah", "It starts with S and means charity.", "Sadaqah is voluntary charity — giving from what we have to please Allah.")),
      tf("sh1g", "medium", "The Prophet ﷺ said the hand that gives is better than the hand that takes.", true, c("giving-hand", "Which hand is praised?", "The Prophet ﷺ praised the giving hand — generosity is loved by Allah.")),
    ],
  ),
  lesson(
    "truthfulness-1",
    "truthfulness",
    "Truthfulness",
    "Truth is light",
    ["Truthfulness in Islam for Kids", "Interactive lesson teaching children why Muslims tell the truth."],
    [
      ["✨", "Muslims tell the truth — even when it is hard.", "Be honest", "intro", "happy"],
      ["🤥", "Lying makes the heart dark. Truth makes it bright!", "No lying", "card", "think"],
      ["🦸", "The Prophet ﷺ was called Al-Ameen — the Trustworthy.", "Al-Ameen", "tap", "cheer"],
      ["📣", "If you make a mistake, say sorry and tell the truth.", "Brave truth", "mascot", "hint"],
    ],
    [
      mcq("t1e", "easy", "You broke something by mistake. What is the truthful choice?", ["Admit it and apologise", "Blame someone else", "Hide it and lie"], 0, c("admit-mistake", "Brave hearts tell the truth.", "Admitting a mistake and saying sorry is brave and truthful.")),
      tf("t1m", "medium", "Al-Ameen means the Trustworthy.", true, c("al-ameen", "People trusted him with their things.", "Prophet Muhammad ﷺ was known as Al-Ameen, the Trustworthy, even before Islam.")),
      fill("t1f", "hard", "Lying is ____ for a Muslim.", "wrong", c("lying-wrong", "The opposite of right.", "Lying is wrong for a Muslim — truth brings light to the heart.")),
      mcq("t1w", "medium", "The Prophet ﷺ said truthfulness leads to…", ["Goodness and Jannah", "Trouble", "Nothing"], 0, c("truth-leads", "Think of the best reward.", "The Prophet ﷺ said truthfulness leads to righteousness, and righteousness leads to Paradise.")),
      tf("t1j", "medium", "A small lie 'as a joke' is fine for a Muslim.", false, c("joke-lie", "The Prophet ﷺ was truthful even when joking.", "The Prophet ﷺ joked but never said anything untrue. We keep our words true, even for fun.")),
      tapSelect("t1t", "easy", "Tap the truthful child.", [["🙋", "'I forgot my homework, sorry.'"], ["🤥", "'The dog ate it!' (not true)"], ["🙈", "Hides and says nothing"]], 0, c("truth-scenario", "Which one tells what really happened?", "Telling what really happened, even when it is hard, is truthfulness.")),
      mcq("t1p", "hard", "Which title means 'the Truthful' and was given to the Prophet ﷺ?", ["As-Sadiq", "Al-Musafir", "Al-Qawi"], 0, c("titles", "It means 'the Truthful'.", "As-Sadiq means the Truthful — people trusted every word he said.")),
    ],
  ),
  lesson(
    "helping-others-1",
    "helping-others",
    "Helping Others",
    "Helpers of Allah’s creation",
    ["Helping Others in Islam for Kids", "Interactive lesson on helping family, friends, and neighbors for Allah."],
    [
      ["🤝", "Helping someone is a gift to Allah!", "Help out", "intro", "happy"],
      ["🎒", "Help a classmate carry books. Hold the door.", "School help", "card", "cheer"],
      ["👵", "Help elders. Speak to them with respect.", "Elders", "tap", "think"],
      ["🌟", "Even a small help can have a huge reward.", "Big reward", "mascot", "happy"],
    ],
    [
      mcq("h1e", "easy", "An older person is carrying a heavy bag. What can you do?", ["Offer safe help", "Walk away laughing", "Add more weight"], 0, c("offer-help", "Think of what a helper does.", "Offering safe help to elders is respect and kindness together.")),
      tf("h1m", "medium", "A small sincere act of help can be valuable.", true, c("small-help", "Does help need to be big to count?", "Helping does not need to be large to matter — Allah rewards even small sincere acts.")),
      mcq("h1h", "hard", "What makes an act of help sincere?", ["Doing it to please Allah", "Demanding praise", "Reminding everyone about it"], 0, c("sincere", "Who are we helping for?", "Sincere help is done for Allah — not for praise or attention.")),
      tapSelect("h1t", "easy", "Tap the helper.", [["🎒", "Carrying a friend's bag"], ["😴", "Napping while others tidy"], ["🍿", "Only watching"]], 0, c("help-scenario", "Who is actually doing something?", "A helper notices a need and acts on it.")),
      tf("h1n", "medium", "Being good to neighbours is part of Islam.", true, c("neighbour", "The Prophet ﷺ spoke about neighbours often.", "The Prophet ﷺ said whoever believes in Allah should be good to their neighbour.")),
      mcq("h1r", "hard", "The Prophet ﷺ said Allah helps a person as long as they…", ["Help their brother", "Rest all day", "Keep everything for themselves"], 0, c("allah-helps", "Help comes back to helpers.", "Allah helps those who help others — helping is never wasted.")),
      fill("h1f", "hard", "Helping others for Allah's sake is a form of worship, called ____ in Arabic.", "ibadah", c("ibadah", "It starts with 'iba'.", "Ibadah means worship — helping for Allah's sake counts as worship.")),
    ],
  ),
  lesson(
    "mosque-etiquette-1",
    "mosque-etiquette",
    "Mosque Etiquette",
    "Quiet feet in Allah’s house",
    ["Mosque Etiquette for Kids", "Interactive masjid manners for children — quiet voice, clean shoes area, and respect."],
    [
      ["🕌", "The masjid is Allah’s house. We enter with love!", "Masjid", "intro", "happy"],
      ["🤫", "Use a quiet voice. Don’t run or shout.", "Quiet", "card", "think"],
      ["👟", "Take off shoes neatly. Keep the floor clean.", "Shoes", "tap", "cheer"],
      ["🙏", "Pray calmly. Make dua. Smile at the ummah!", "Pray & smile", "mascot", "happy"],
    ],
    [
      mcq("mq1e", "easy", "In the masjid we should be ____.", ["quiet", "noisy", "running"], 0, c("quiet", "People are praying and reading Quran.", "We stay quiet in the masjid so everyone can pray peacefully.")),
      tf("mq1m", "medium", "Shoes should be left neatly in the proper area at the masjid.", true, c("shoes", "Where do shoes go?", "Neat shoes keep the prayer area clean and the entrance safe.")),
      mcq("mq1h", "hard", "Where should shoes be left at the masjid?", ["Neatly in the shoe area", "Across the prayer row", "Beside the mihrab"], 0, c("shoes", "Not on the carpet!", "Shoes belong neatly in the shoe area, never on the prayer carpet.")),
      tf("mq1r", "medium", "It is Sunnah to enter the masjid with the right foot.", true, c("right-foot", "Right foot for good things.", "We enter the masjid with the right foot and leave with the left — a Sunnah.")),
      tapSelect("mq1t", "easy", "Tap what to do while people are praying.", [["🤫", "Stay quiet and still"], ["🏃", "Run between the rows"], ["📣", "Call your friend"]], 0, c("during-prayer", "Think of how you would like it if you were praying.", "Staying quiet and still respects those who are praying.")),
      mcq("mq1d", "hard", "What do we ask Allah for when entering the masjid?", ["To open the doors of His mercy", "To make it rain", "To finish quickly"], 0, c("entering-dua", "It is about Allah's mercy.", "We say: Allahumma iftah li abwaba rahmatik — O Allah, open for me the doors of Your mercy.")),
      mcq("mq1c", "medium", "Why do we keep the masjid clean?", ["It is Allah's house and everyone prays there", "To win a prize", "It is a rule only for adults"], 0, c("clean-why", "Whose house is it?", "The masjid is Allah's house and a shared place of prayer — keeping it clean honours both.")),
    ],
  ),
  lesson(
    "ramadan-1",
    "ramadan",
    "Ramadan",
    "The blessed month",
    ["Ramadan for Kids", "Gentle interactive Ramadan lesson for children — fasting, Quran, sharing, and kindness."],
    [
      ["🌙", "Ramadan is a special month. We grow closer to Allah!", "Ramadan", "intro", "happy"],
      ["🍽️", "Grown-ups fast. Kids can practice shorter fasts or good deeds!", "Fasting", "card", "think"],
      ["📖", "We read more Quran and make more dua.", "Quran time", "tap", "cheer"],
      ["💝", "We share food and help the poor. That’s Ramadan spirit!", "Share", "mascot", "happy"],
    ],
    [
      mcq("rm1e", "easy", "Ramadan is a ____ month.", ["blessed", "scary", "boring"], 0, c("blessed", "Think of how Muslims feel when it arrives.", "Ramadan is a blessed month of fasting, Quran and kindness.")),
      tf("rm1m", "medium", "Ramadan teaches us to be impatient and unkind.", false, c("teaches", "What does fasting train in us?", "Fasting teaches patience, worship and care for others.")),
      mcq("rm1h", "hard", "Which action reflects the purpose of Ramadan?", ["Improving worship and character", "Only changing meal times", "Competing over food"], 0, c("purpose", "It is about the heart, not just the stomach.", "Ramadan is for growing closer to Allah and improving our character.")),
      mcq("rm1i", "easy", "The meal to break the fast at sunset is called…", ["Iftar", "Suhoor", "Lunch"], 0, c("iftar", "It happens when the sun goes down.", "Iftar is the sunset meal; Suhoor is the early meal before dawn.")),
      tf("rm1q", "medium", "The Quran was first revealed in Ramadan.", true, c("quran-month", "Ramadan is called the month of the Quran.", "Allah tells us the Quran was sent down in Ramadan (Surah Al-Baqarah 2:185).")),
      tapSelect("rm1t", "easy", "Tap what comes right after Ramadan.", [["🎉", "Eid al-Fitr"], ["🕋", "Hajj"], ["🎂", "A birthday"]], 0, c("eid-after", "It is a day of celebration.", "Eid al-Fitr is the joyful celebration right after Ramadan ends.")),
      mcq("rm1l", "hard", "Which special night in Ramadan is better than a thousand months?", ["Laylat al-Qadr", "Eid night", "The first night"], 0, c("qadr-night", "It is called the Night of Power.", "Laylat al-Qadr, the Night of Power, is better than a thousand months (Surah Al-Qadr).")),
    ],
  ),
  lesson(
    "eid-1",
    "eid",
    "Eid",
    "Happy day of thanks",
    ["Eid for Kids", "Interactive Eid lesson — prayer, family, gifts, and thanking Allah."],
    [
      ["🎉", "Eid is a happy day! We thank Allah together.", "Eid Mubarak!", "intro", "cheer"],
      ["🕌", "We pray Eid prayer and wear nice clean clothes.", "Eid prayer", "card", "happy"],
      ["👨‍👩‍👧‍👦", "We visit family, give gifts, and share sweets.", "Family joy", "tap", "cheer"],
      ["🤲", "Don’t forget: say Alhamdulillah for every blessing!", "Thank Allah", "mascot", "happy"],
    ],
    [
      mcq("e1e", "easy", "Which greeting shares joy on Eid?", ["Eid Mubarak", "Do not celebrate", "Leave everyone alone"], 0, c("greeting", "Mubarak means blessed.", "Eid Mubarak means 'blessed Eid' — a warm greeting for the day.")),
      tf("e1m", "medium", "Eid is only about receiving gifts.", false, c("not-only-gifts", "What else happens on Eid morning?", "Eid includes worship, gratitude, family and generosity — gifts are just one small part.")),
      mcq("e1h", "hard", "What should remain important during Eid celebrations?", ["Prayer and gratitude to Allah", "Showing off new things", "Wasting food"], 0, c("priority", "Eid begins with prayer.", "Prayer and thanking Allah stay at the heart of Eid.")),
      mcq("e1n", "easy", "How many Eids do Muslims celebrate each year?", ["Two", "One", "Five"], 0, c("two-eids", "One after Ramadan, one at Hajj time.", "Eid al-Fitr comes after Ramadan and Eid al-Adha comes during Hajj.")),
      tf("e1p", "medium", "Eid morning begins with a special prayer.", true, c("eid-prayer", "We wear clean clothes and go together.", "Muslims gather for the Eid prayer in the morning before celebrating.")),
      tapSelect("e1t", "easy", "Tap the words we say on Eid.", [["🎉", "Eid Mubarak"], ["🎃", "Trick or treat"], ["🎂", "Happy birthday"]], 0, c("greeting", "It has the word Eid in it.", "Eid Mubarak is the greeting Muslims share on Eid.")),
      mcq("e1g", "hard", "Before Eid al-Fitr prayer, Muslims give a special charity so everyone can celebrate. It is called…", ["Zakat al-Fitr", "Hajj", "Iftar"], 0, c("fitr-charity", "It has 'Fitr' in the name.", "Zakat al-Fitr is given before Eid prayer so poorer families can enjoy Eid too.")),
    ],
  ),
  lesson(
    "angels-1",
    "angels",
    "Angels",
    "Servants of light",
    ["Angels in Islam for Kids", "Age-friendly interactive lesson about angels — created by Allah from light."],
    [
      ["🪽", "Angels are real. Allah made them from light!", "Angels", "intro", "happy"],
      ["📝", "Some angels write our good deeds. Let’s collect good deeds!", "Good deeds", "card", "cheer"],
      ["📯", "Angel Jibreel brought the Quran to the Prophet ﷺ.", "Jibreel", "tap", "think"],
      ["⭐", "We can’t see angels, but we believe in them with love.", "Believe", "mascot", "hint"],
    ],
    [
      mcq("an1e", "easy", "What did Angel Jibreel bring to the Prophet ﷺ?", ["Revelation from Allah", "A book he wrote", "A royal crown"], 0, c("jibreel", "It became the Quran.", "Angel Jibreel brought Allah's revelation — the Quran — to the Prophet ﷺ.")),
      tf("an1m", "medium", "Angels disobey Allah whenever they choose.", false, c("obey", "Do angels ever say no to Allah?", "Angels always obey the commands Allah gives them.")),
      mcq("an1h", "hard", "Why do Muslims believe in angels although we cannot see them?", ["Allah and His Messenger taught us about them", "Every invisible thing is an angel", "They appear in photographs"], 0, c("believe-unseen", "Who told us about angels?", "We believe in angels because Allah and His Messenger ﷺ taught us about them.")),
      mcq("an1l", "easy", "Angels are created from…", ["Light", "Fire", "Clay"], 0, c("light", "It shines brightly.", "Allah created angels from light.")),
      tf("an1w", "medium", "Some angels write down our good and bad deeds.", true, c("deed-writers", "Think of the two angels who keep records.", "The honourable recorders (Kiraman Katibin) write down every deed we do.")),
      tapSelect("an1t", "easy", "Tap the angel who brought the Quran to the Prophet ﷺ.", [["📯", "Jibreel"], ["🌧️", "Mikail"], ["🎺", "Israfil"]], 0, c("jibreel", "His name starts with J.", "Angel Jibreel is the angel of revelation who brought the Quran.")),
      mcq("an1k", "hard", "Which angel is in charge of rain and provision by Allah's command?", ["Mikail", "Jibreel", "Malik"], 0, c("mikail", "Not the one who brought revelation.", "Angel Mikail is responsible for rain and provision by Allah's command.")),
    ],
  ),
  lesson(
    "prophets-1",
    "prophets",
    "Prophets",
    "Messengers of Allah",
    ["Prophets for Kids", "Interactive overview of prophets for children — Nuh, Ibrahim, Musa, Isa, and Muhammad ﷺ."],
    [
      ["📜", "Allah sent many prophets to guide people.", "Prophets", "intro", "happy"],
      ["🚢", "Prophet Nuh built an ark. He trusted Allah.", "Nuh", "card", "think"],
      ["🔥", "Prophet Ibrahim never bowed to idols — only Allah.", "Ibrahim", "tap", "cheer"],
      ["💚", "Prophet Muhammad ﷺ is the last prophet. We follow him!", "Final Messenger", "mascot", "happy"],
    ],
    [
      mcq("pr1e", "easy", "Which prophet refused to worship idols?", ["Prophet Ibrahim", "Prophet Nuh", "Prophet Yusuf"], 0, c("ibrahim-idols", "He is known as the friend of Allah.", "Prophet Ibrahim refused to bow to idols and worshipped Allah alone.")),
      tf("pr1m", "medium", "Prophets asked people to worship the prophets themselves.", false, c("worship-allah-alone", "Who did every prophet point to?", "Every prophet called people to worship Allah alone.")),
      fill("pr1f", "hard", "Prophet ____ built the ark.", "nuh", c("nuh-ark", "His name has three letters.", "Prophet Nuh built the ark by Allah's command.")),
      mcq("pr1a", "easy", "Who was the first prophet and the first human?", ["Prophet Adam", "Prophet Nuh", "Prophet Isa"], 0, c("adam", "He was the first person Allah created.", "Prophet Adam was the first human and the first prophet.")),
      tapSelect("pr1t", "easy", "Tap the last prophet.", [["💚", "Prophet Muhammad ﷺ"], ["🚢", "Prophet Nuh"], ["🐋", "Prophet Yunus"]], 0, c("last-prophet", "We follow him today.", "Prophet Muhammad ﷺ is the final prophet.")),
      tf("pr1s", "medium", "Allah parted the sea for Prophet Musa and his people.", true, c("musa-sea", "Think of a path through the water.", "Allah split the sea so Musa and his people could escape Pharaoh.")),
      matching("pr1x", "hard", "Match the prophet to what he is known for.", [["Nuh", "The ark"], ["Ibrahim", "Building the Kaaba"], ["Musa", "The parted sea"]], c("prophets-map", "Ibrahim built something very famous in Makkah.", "Nuh built the ark, Ibrahim (with Ismail) built the Kaaba, and Allah parted the sea for Musa.")),
    ],
  ),
  lesson(
    "jannah-1",
    "jannah",
    "Jannah",
    "The beautiful forever home",
    ["Jannah for Kids", "Hope-filled interactive lesson about Jannah — gardens, peace, and being close to Allah."],
    [
      ["🏡", "Jannah is Paradise — the most beautiful forever home!", "Jannah", "intro", "cheer"],
      ["🌺", "Gardens, rivers, peace, and no sadness — forever!", "Beauty", "card", "happy"],
      ["🛤️", "We reach Jannah by loving Allah, doing good, and avoiding harm.", "The path", "tap", "think"],
      ["🤲", "Ask Allah every day: Allahumma inni as’alukal-jannah!", "Make dua", "mascot", "happy"],
    ],
    [
      mcq("j1e", "easy", "Jannah is another name for ____.", ["Paradise", "the present world", "a place of punishment"], 0, c("paradise-word", "It is the best place of all.", "Jannah means Paradise — the forever home Allah promises to believers.")),
      tf("j1m", "medium", "Jannah is a temporary home that ends.", false, c("everlasting", "How long does it last?", "Jannah is everlasting — it never ends.")),
      mcq("j1h", "hard", "Which path should a Muslim follow while hoping for Jannah?", ["Faith, Allah's mercy, and good deeds", "Pride in every action", "Harming other people"], 0, c("path", "Think of iman and good deeds.", "We reach Jannah through faith, good deeds and — most of all — Allah's mercy.")),
      tapSelect("j1t", "easy", "Tap something found in Jannah.", [["🌊", "Rivers and gardens"], ["😢", "Sadness"], ["😴", "Tiredness"]], 0, c("description", "Think of beautiful things.", "Jannah has gardens, rivers and peace — no sadness at all.")),
      fill("j1f", "medium", "We ask Allah: Allahumma inni as'alukal-____.", "jannah", c("dua", "We are asking for Paradise.", "Allahumma inni as'alukal-jannah means 'O Allah, I ask You for Paradise'.")),
      tf("j1n", "medium", "In Jannah nobody feels sad, sick or tired.", true, c("no-sadness", "Jannah is full of peace.", "Jannah has no sadness, sickness or tiredness — only peace and joy forever.")),
      mcq("j1g", "hard", "How many gates does Jannah have?", ["Eight", "Two", "Fifty"], 0, c("gates", "It is one more than seven.", "Jannah has eight gates — one of them, Ar-Rayyan, is for those who fasted.")),
    ],
  ),
  // Intermediate lessons
  lesson(
    "stories-prophets-1",
    "stories-prophets",
    "Prophet Stories",
    "Lessons from the best stories",
    ["Islamic Stories for Children", "Interactive prophet stories for kids — courage, trust, and tawheed."],
    [
      ["📖", "Allah tells the best stories in the Quran!", "Stories", "intro", "happy"],
      ["🚢", "Prophet Nuh kept calling people to Allah and built the ark with patience.", "Nuh and the ark", "card", "think"],
      ["🐋", "Prophet Yunus called upon Allah from inside the great fish, and Allah rescued him.", "Yunus and the great fish", "tap", "cheer"],
      ["🔥", "Prophet Ibrahim stood firmly for Tawheed even when people opposed him.", "Ibrahim's courage", "card", "think"],
      ["💪", "Prophet stories teach us patience, courage, repentance, and trust in Allah.", "Lessons for us", "mascot", "happy"],
    ],
    [
      mcq("sp1e", "easy", "Which prophet built an ark by Allah's command?", ["Prophet Nuh", "Prophet Yunus", "Prophet Ibrahim"], 0, c("nuh", "Think of the great flood.", "Prophet Nuh built the ark to save the believers from the flood.")),
      tf("sp1m", "medium", "Prophet Yunus stopped making dua when he was in difficulty.", false, c("yunus", "What did he do inside the fish?", "He called upon Allah from inside the fish, and Allah rescued him.")),
      mcq("sp1h", "hard", "What lesson is shared by these prophet stories?", ["Trust Allah and remain steadfast", "Give up when opposed", "Hide every mistake"], 0, c("lesson", "What did all three prophets keep doing?", "Every prophet trusted Allah and stayed steadfast — that is the shared lesson.")),
      matching("sp1x", "hard", "Match each prophet to the lesson scene.", [["Nuh", "The ark"], ["Yunus", "The great fish"], ["Ibrahim", "Standing for Tawheed"]], c("stories-map", "Think of the picture for each story.", "Nuh built the ark, Yunus was in the great fish, and Ibrahim stood for Tawheed.")),
      mcq("sp1y", "medium", "Where did Prophet Yunus make dua to Allah?", ["Inside the great fish", "On a mountain", "In a palace"], 0, c("yunus", "A very dark and unusual place.", "Prophet Yunus called on Allah from inside the great fish, and Allah saved him.")),
      tf("sp1n", "easy", "Prophet Nuh gave up calling people to Allah after a few days.", false, c("nuh-patience", "He called for a very, very long time.", "Prophet Nuh kept calling his people for hundreds of years — a lesson in patience.")),
      tapSelect("sp1t", "easy", "Tap what Prophet Ibrahim refused to worship.", [["🗿", "Idols"], ["☝️", "Allah"], ["📖", "The Book"]], 0, c("ibrahim-idols", "Statues made by people.", "Prophet Ibrahim refused to worship idols and taught Tawheed — Allah alone.")),
      mcq("sp1d", "hard", "Which dua did Prophet Yunus say inside the fish?", ["La ilaha illa anta subhanaka inni kuntu minaz-zalimin", "Bismillah", "Alhamdulillah"], 0, c("yunus-dua-words", "It begins 'La ilaha illa anta…'", "Yunus said: There is no god but You, glory be to You, I was among the wrongdoers (Surah Al-Anbiya 21:87).")),
    ],
  ),
  lesson(
    "sahabah-1",
    "sahabah",
    "The Sahabah",
    "Friends of the Prophet ﷺ",
    ["Sahabah for Kids", "Learn about the companions of the Prophet ﷺ in a child-friendly interactive lesson."],
    [
      ["🌟", "Sahabah are the friends of Prophet Muhammad ﷺ.", "Sahabah", "intro", "happy"],
      ["❤️", "Abu Bakr supported the Prophet ﷺ and was known for truthfulness and loyalty.", "Abu Bakr", "card", "cheer"],
      ["📣", "Bilal showed strong faith through hardship and became a famous caller to prayer.", "Bilal", "tap", "think"],
      ["🧒", "We can learn from their courage and kindness!", "Be like them", "mascot", "happy"],
    ],
    [
      mcq("sa1e", "easy", "Who were the Sahabah?", ["Companions of Prophet Muhammad ﷺ", "Only rulers after him", "Authors of the Quran"], 0, c("who", "Sahabah means companions.", "The Sahabah were the companions who lived with and learned from the Prophet ﷺ.")),
      tf("sa1m", "medium", "The Sahabah ignored the Prophet's ﷺ teachings.", false, c("followed", "Why do we love them?", "They learned from him and helped carry Islam to others.")),
      mcq("sa1h", "hard", "Which quality is especially linked with Abu Bakr in this lesson?", ["Truthfulness and loyalty", "Love of wealth", "Avoiding responsibility"], 0, c("abu-bakr", "He was called As-Siddiq.", "Abu Bakr was known as As-Siddiq — the truthful and loyal friend.")),
      matching("sa1x", "hard", "Match each companion to the lesson.", [["Abu Bakr", "Loyal support and truthfulness"], ["Bilal", "Steadfast faith and the call to prayer"]], c("sahabah-map", "Who called the adhan?", "Abu Bakr was the loyal, truthful friend; Bilal was the steadfast caller to prayer.")),
      mcq("sa1b", "medium", "Bilal (may Allah be pleased with him) is famous for…", ["Calling the adhan", "Building ships", "Writing poetry"], 0, c("bilal", "Think of a beautiful voice.", "Bilal became the first mu'adhin — the one who calls the adhan.")),
      tf("sa1k", "easy", "Abu Bakr (may Allah be pleased with him) was the Prophet's ﷺ close friend.", true, c("abu-bakr-friend", "He travelled with him during the Hijrah.", "Abu Bakr was the Prophet's ﷺ closest friend and companion on the Hijrah.")),
      tapSelect("sa1t", "easy", "Tap how we should speak about the Sahabah.", [["🌟", "With love and respect"], ["😒", "Rudely"], ["🤷", "We don't talk about them"]], 0, c("respect-sahabah", "They are the best generation.", "We speak about the Sahabah with love and respect and add 'may Allah be pleased with them'.")),
      mcq("sa1u", "hard", "Who became the first Caliph after the Prophet ﷺ passed away?", ["Abu Bakr", "Bilal", "Khalid"], 0, c("first-caliph", "The Prophet's ﷺ closest companion.", "Abu Bakr (may Allah be pleased with him) was chosen as the first Caliph.")),
    ],
  ),
  lesson(
    "animals-quran-1",
    "animals-quran",
    "Animals in the Quran",
    "Allah’s amazing creatures",
    ["Animals in the Quran for Kids", "Interactive lesson about animals mentioned in the Quran for children."],
    [
      ["🐝", "The Quran talks about bees, ants, birds, and more!", "Animals", "intro", "happy"],
      ["🐝", "Allah describes the bee and the useful honey it produces.", "The bee", "card", "cheer"],
      ["🐜", "In the story of Prophet Sulayman, an ant warned the other ants to stay safe.", "The careful ant", "tap", "think"],
      ["🕊️", "Birds are among Allah's signs and glorify Him in ways He knows.", "Birds", "mascot", "happy"],
    ],
    [
      mcq("aq1e", "easy", "Which animal is connected with honey in the Quran?", ["The bee", "The camel", "The horse"], 0, c("bee", "Buzz buzz!", "The Quran describes the bee and the healing honey it makes.")),
      tf("aq1m", "medium", "The ant in Prophet Sulayman's story warned the colony about danger.", true, c("ant", "What did the ant say to the others?", "The ant told the others to go into their homes so the army would not crush them.")),
      mcq("aq1h", "hard", "What should animals mentioned in the Quran help us notice?", ["Allah's wisdom and signs", "That animals should be worshipped", "That people know everything"], 0, c("signs", "Who made them so clever?", "Animals are signs pointing to Allah's wisdom and creation.")),
      tapSelect("aq1x", "medium", "Tap the creature that produces honey.", [["🐜", "Ant"], ["🐝", "Bee"], ["🕊️", "Bird"]], 1, c("bee", "It has stripes and wings.", "The bee makes honey — Allah mentions it in Surah An-Nahl.")),
      mcq("aq1s", "medium", "Which Surah is named after the bee?", ["An-Nahl", "Al-Fil", "An-Naml"], 0, c("surah-bee", "Nahl means bee.", "Surah An-Nahl (The Bee) is Surah 16. An-Naml is The Ant and Al-Fil is The Elephant.")),
      tf("aq1w", "easy", "Muslims should be kind to animals.", true, c("kind-animals", "They are Allah's creation.", "The Prophet ﷺ taught mercy to every living creature.")),
      mcq("aq1b", "hard", "Which bird brought Prophet Sulayman news about a queen?", ["The hoopoe (hudhud)", "The eagle", "The crow"], 0, c("hudhud", "It is a small bird with a crest.", "The hoopoe (hudhud) told Prophet Sulayman about the Queen of Saba (Surah An-Naml).")),
    ],
  ),
  lesson(
    "daily-sunnah-1",
    "daily-sunnah",
    "Daily Sunnah",
    "Little Sunnahs, big love",
    ["Daily Sunnah for Kids", "Simple daily Sunnah habits for children — smile, right hand, and greeting."],
    [
      ["☀️", "Sunnah means following the Prophet ﷺ every day!", "Sunnah", "intro", "happy"],
      ["😄", "Smile — it’s a charity!", "Smile", "card", "cheer"],
      ["✋", "Eat and drink with your right hand.", "Right hand", "tap", "think"],
      ["👋", "Say Salam when you meet someone.", "Salam", "mascot", "happy"],
    ],
    [
      mcq("ds1e", "easy", "A smile can be a ____.", ["charity", "problem", "punishment"], 0, c("smile", "Giving without money.", "The Prophet ﷺ said smiling at your brother is a charity.")),
      tf("ds1m", "medium", "Eating with the right hand is Sunnah.", true, c("right-hand", "Which hand did the Prophet ﷺ use?", "The Prophet ﷺ ate and drank with his right hand — we follow him.")),
      mcq("ds1h", "hard", "What is the best way to build a daily Sunnah habit?", ["Practise it regularly with sincere intention", "Do it only when praised", "Change it every day"], 0, c("habit", "Little and often.", "Regular practice with sincere intention turns a Sunnah into a habit.")),
      matching("ds1x", "medium", "Match the Sunnah to the moment.", [["Meeting someone", "Give Salam"], ["Eating", "Use the right hand"], ["Cheering someone", "Offer a kind smile"]], c("sunnah-map", "Think of what each moment needs.", "Salam when meeting, right hand when eating, and a smile to cheer someone.")),
      tf("ds1w", "easy", "Saying Bismillah before eating is a Sunnah.", true, c("bismillah-eat", "What do we say before the first bite?", "Bismillah before eating is a Sunnah the Prophet ﷺ taught.")),
      tapSelect("ds1t", "easy", "Tap the Sunnah way to drink water.", [["🪑", "Sitting down, in sips"], ["🏃", "Running while drinking"], ["🌊", "Gulping the whole bottle"]], 0, c("drink-sitting", "Calm and in sips.", "The Prophet ﷺ usually drank sitting down, in sips, saying Bismillah first.")),
      mcq("ds1s", "medium", "Before going to sleep, a Sunnah is to…", ["Say the sleeping dua and lie on the right side", "Watch TV until late", "Skip brushing teeth"], 0, c("sleep-sunnah", "Right side, dua first.", "The Prophet ﷺ lay on his right side and said: Bismika Allahumma amutu wa ahya.")),
      fill("ds1f", "hard", "Sunnah means following the way of the ____ ﷺ.", "prophet", c("sunnah-word", "Whose way do we follow?", "Sunnah is the way of the Prophet ﷺ — his words, actions and habits.")),
    ],
  ),
  lesson(
    "halal-haram-1",
    "halal-haram",
    "Halal vs Haram",
    "Choose what is good",
    ["Halal and Haram for Kids", "Simple interactive guide helping children understand halal and haram choices."],
    [
      ["✅", "Halal means allowed and good for us.", "Halal", "intro", "happy"],
      ["🚫", "Haram means not allowed — it harms us.", "Haram", "card", "think"],
      ["🍎", "Ask Mum or Dad if you are unsure. That’s smart!", "Ask", "mascot", "hint"],
    ],
    [
      mcq("hh1e", "easy", "Halal means something that is ____.", ["permitted", "always harmful", "unknown"], 0, c("halal-word", "Allowed or not allowed?", "Halal means permitted — allowed and good for us.")),
      tf("hh1m", "medium", "A Muslim should guess about halal and haram instead of asking.", false, c("ask", "What did the lesson say to do when unsure?", "Ask a knowledgeable parent, teacher or scholar when unsure — never guess.")),
      mcq("hh1h", "hard", "Why do Muslims avoid what Allah has made haram?", ["To obey Allah and protect themselves", "To look better than others", "Because all choices are the same"], 0, c("why-avoid", "Who set the rules, and why?", "We avoid haram to obey Allah, who only forbids what harms us.")),
      tapSelect("hh1x", "medium", "Tap the safest choice when a food ingredient is unclear.", [["❓", "Ask a trusted adult"], ["🎲", "Guess"], ["🙈", "Ignore the label"]], 0, c("ask", "Who can help you find out?", "Asking a trusted adult is the smart, safe choice.")),
      tf("hh1p", "easy", "Pork is haram for Muslims to eat.", true, c("pork", "The Quran mentions this meat.", "The Quran tells Muslims not to eat pork.")),
      mcq("hh1w", "medium", "Haram means…", ["Not allowed", "Delicious", "Free"], 0, c("haram-word", "The opposite of halal.", "Haram means not allowed — Allah forbids it because it harms us.")),
      tapSelect("hh1t", "easy", "Tap the halal drink.", [["🥛", "Milk"], ["🍺", "Alcohol"], ["🧪", "An unknown potion"]], 0, c("drinks", "Cows give it.", "Milk, water and juice are halal. Alcohol is haram.")),
      mcq("hh1s", "hard", "Something is halal to eat but you took it without asking. Is it okay to eat?", ["No — taking without permission is wrong", "Yes, if it is halal", "Yes, if no one saw"], 0, c("permission", "Halal food — but was it taken honestly?", "Even halal food becomes wrong if taken without permission. Honesty matters too.")),
    ],
  ),
  lesson(
    "wudu-prayer-1",
    "wudu-prayer",
    "Wudu & Prayer",
    "Clean, then stand for Allah",
    ["Wudu and Prayer for Kids", "Interactive intro to wudu and salah for Muslim children."],
    [
      ["🧼", "Before salah we make wudu — we wash for Allah. Watch this complete cartoon poem to see the entire wudu method!", "Wudu Poem & Steps", "intro", "happy", "https://youtu.be/Td-w2OnRaUc"],
      ["💧", "Begin with intention and Bismillah, then wash in the taught order without wasting water.", "Prepare carefully", "card", "think"],
      ["🙏", "In salah we stand, bow, and prostrate with calm focus before Allah.", "Prayer postures", "tap", "cheer"],
      ["⏰", "Muslims make every effort to perform the five daily prayers on time.", "Pray on time", "mascot", "happy"],
    ],
    [
      mcq("wp1e", "easy", "What prepares us physically for salah?", ["Wudu", "A meal", "A game"], 0, c("wudu", "We wash before we pray.", "Wudu — washing hands, face, arms, head and feet — prepares us for salah.")),
      tf("wp1m", "medium", "Wasting lots of water is part of careful wudu.", false, c("water-waste", "Did the Prophet ﷺ use a lot of water?", "Use enough water to wash properly without waste — the Prophet ﷺ used very little.")),
      mcq("wp1h", "hard", "Which movement comes after standing recitation in a rakah?", ["Bowing (ruku)", "Ending with salam", "Leaving the prayer"], 0, c("ruku", "We bend forward after reciting.", "After standing and reciting, we bow in ruku, then prostrate in sujood.")),
      sorting("wp1x", "hard", "Put these wudu actions in their taught order.", ["Wash hands", "Rinse mouth", "Wash face", "Wash arms", "Wipe head", "Wash feet"], c("wudu-order", "Start with the hands and end with the feet.", "Hands, mouth, face, arms, head, then feet — the order taught in wudu.")),
      mcq("wp1c", "easy", "How many times a day do Muslims pray salah?", ["Five", "Two", "Ten"], 0, c("five-times", "Count the fingers on one hand.", "Muslims pray five times a day: Fajr, Dhuhr, Asr, Maghrib and Isha.")),
      tf("wp1b", "medium", "We say Bismillah when we start wudu.", true, c("bismillah-wudu", "How do we begin good things?", "We start wudu with the intention and Bismillah.")),
      tapSelect("wp1t", "easy", "Tap the direction we face in salah.", [["🕋", "The Kaaba (Qiblah)"], ["🌅", "Wherever we like"], ["🚪", "The door"]], 0, c("qiblah", "It is in Makkah.", "We face the Qiblah — the direction of the Kaaba in Makkah.")),
      mcq("wp1n", "hard", "Which prayer is performed before sunrise?", ["Fajr", "Maghrib", "Isha"], 0, c("fajr", "It is the first prayer of the day.", "Fajr is the dawn prayer, performed before the sun rises.")),
    ],
  ),
  // Advanced lessons
  lesson(
    "seerah-timeline-1",
    "seerah-timeline",
    "Seerah Timeline",
    "Milestones of a beautiful life",
    ["Seerah for Kids", "A gentle timeline of the Prophet ﷺ’s life for older children."],
    [
      ["🗺️", "Seerah means the life story of Prophet Muhammad ﷺ.", "Seerah", "intro", "happy"],
      ["🏛️", "He was born in Makkah and was known for honesty.", "Makkah", "card", "think"],
      ["📖", "In the cave, he received the first revelation.", "Revelation", "tap", "cheer"],
      ["🌴", "He migrated to Madinah — a city of peace.", "Hijrah", "mascot", "happy"],
    ],
    [
      mcq("st1e", "easy", "What does Seerah study?", ["The life of Prophet Muhammad ﷺ", "Only Arabic grammar", "The lives of all rulers"], 0, c("seerah-word", "It is a life story.", "Seerah is the study of the life of Prophet Muhammad ﷺ.")),
      tf("st1m", "medium", "The Hijrah was the migration from Madinah to Makkah.", false, c("hijrah", "Which city did he leave, and which did he go to?", "The Prophet ﷺ migrated from Makkah to Madinah.")),
      mcq("st1h", "hard", "Where did the first revelation begin?", ["Cave Hira", "Masjid an-Nabawi", "Mount Uhud"], 0, c("revelation-place", "A cave on a mountain near Makkah.", "The first revelation came in Cave Hira on Jabal an-Nur.")),
      sorting("st1x", "hard", "Arrange these Seerah events from earliest to latest.", ["Birth in Makkah", "First revelation", "Hijrah to Madinah"], c("timeline", "The first revelation came before the Hijrah.", "Birth in Makkah, then the first revelation at 40, then the Hijrah to Madinah.")),
      mcq("st1y", "medium", "How old was the Prophet ﷺ when he received the first revelation?", ["40", "25", "63"], 0, c("age-revelation", "Four tens.", "He received the first revelation at the age of 40.")),
      tf("st1w", "easy", "The Prophet ﷺ was known as Al-Ameen even before he became a Prophet.", true, c("al-ameen", "People trusted him from a young age.", "Even before Islam, the people of Makkah called him Al-Ameen, the Trustworthy.")),
      tapSelect("st1t", "easy", "Tap the city the Prophet ﷺ migrated to.", [["🌴", "Madinah"], ["🕋", "Makkah"], ["🏛️", "Rome"]], 0, c("hijrah", "The city of palm trees.", "The Prophet ﷺ migrated to Madinah, where the first Muslim community grew.")),
      mcq("st1k", "hard", "Who was the Prophet's ﷺ first wife and the first person to accept Islam?", ["Khadijah (may Allah be pleased with her)", "Aisha (may Allah be pleased with her)", "Fatimah (may Allah be pleased with her)"], 0, c("khadijah", "She was a businesswoman who trusted him completely.", "Khadijah (may Allah be pleased with her) supported him and was the first to believe.")),
    ],
  ),
  lesson(
    "islamic-ethics-1",
    "islamic-ethics",
    "Islamic Ethics",
    "Character that shines",
    ["Islamic Ethics for Kids", "Character-building interactive lesson on respect, honesty, and responsibility."],
    [
      ["🧭", "Akhlaq means good character. It shows our iman!", "Akhlaq", "intro", "happy"],
      ["🪞", "Be the same kind person at home and at school.", "Consistency", "card", "think"],
      ["⚖️", "Choose justice even when a fair decision does not benefit you.", "Justice", "tap", "hint"],
      ["🦁", "Lead by example — younger kids copy you!", "Lead", "mascot", "cheer"],
    ],
    [
      mcq("ie1e", "easy", "Good character in Islam is called ____.", ["Akhlaq", "Adhan", "Akhirah"], 0, c("akhlaq-word", "It starts with Akh-.", "Akhlaq means good character — the way our iman shows in our behaviour.")),
      tf("ie1m", "medium", "Good character only matters when other people are watching.", false, c("consistency", "Who is always watching?", "Sincere character stays the same in public and in private — Allah always sees.")),
      mcq("ie1h", "hard", "A fair choice disadvantages your team. What should a principled leader do?", ["Choose what is just", "Hide the facts", "Change the rule secretly"], 0, c("justice", "Fairness even when it costs you.", "Justice means choosing what is right even when it does not help your side.")),
      tapSelect("ie1x", "hard", "Tap the action that shows consistent character.", [["🪞", "Be honest at home and at school"], ["🎭", "Act kind only for praise"], ["⚖️", "Change fairness for friends"]], 0, c("consistency", "Same person everywhere.", "Being honest everywhere — home, school, alone — is consistent character.")),
      tf("ie1t", "easy", "Akhlaq means good character.", true, c("akhlaq-word", "It is the title of this lesson.", "Akhlaq is good character — kind, honest and fair behaviour.")),
      mcq("ie1s", "medium", "You find a wallet at school. What is the right thing to do?", ["Give it to a teacher", "Keep it", "Take the money and leave the wallet"], 0, c("honesty-found", "Think of the owner.", "Returning what is not ours is amanah (trust) — the Prophet ﷺ returned belongings even to his enemies.")),
      tapSelect("ie1p", "easy", "Tap the fair choice in a game.", [["⚖️", "Follow the rules for everyone"], ["😏", "Bend the rules for friends"], ["🙈", "Cheat when no one sees"]], 0, c("justice", "Same rules for all.", "Fairness means the same rules for everyone, friends included.")),
      mcq("ie1w", "hard", "Which quality means being trustworthy with what you are given?", ["Amanah", "Ghadab (anger)", "Kibr (pride)"], 0, c("amanah", "It is about trust.", "Amanah means trust — keeping promises and looking after what is entrusted to you.")),
      tf("ie1l", "medium", "Younger children often copy what older children do.", true, c("lead-example", "Think about how little ones watch you.", "Younger kids copy older ones — so good character in you becomes good character in them.")),
    ],
  ),
  lesson(
    "patience-gratitude-1",
    "patience-gratitude",
    "Patience & Gratitude",
    "Sabr and shukr",
    ["Patience and Gratitude for Kids", "Interactive lesson on sabr and saying Alhamdulillah."],
    [
      ["🌱", "Sabr means patience. Shukr means thankfulness.", "Sabr & Shukr", "intro", "happy"],
      ["⏳", "When waiting is hard, breathe and remember Allah.", "Patience", "card", "think"],
      ["🧭", "Sabr includes staying obedient, avoiding wrong, and remaining steady during hardship.", "Steady choices", "tap", "hint"],
      ["🙌", "Say Alhamdulillah for food, family, and health!", "Gratitude", "mascot", "cheer"],
    ],
    [
      mcq("pg1e", "easy", "Shukr means ____.", ["thankfulness", "carelessness", "impatience"], 0, c("shukr-word", "We show it by saying Alhamdulillah.", "Shukr means thankfulness — gratitude to Allah for every blessing.")),
      tf("pg1m", "medium", "Sabr means doing nothing about a problem.", false, c("sabr-meaning", "Is patience the same as giving up?", "Sabr means staying steady while doing what is right — not doing nothing.")),
      mcq("pg1h", "hard", "Which response combines sabr and shukr?", ["Stay calm, act rightly, and thank Allah", "Complain and abandon effort", "Ignore every blessing"], 0, c("combined", "Calm plus thankful.", "Staying calm, acting rightly and thanking Allah brings sabr and shukr together.")),
      matching("pg1x", "hard", "Match the quality to its example.", [["Sabr", "Waiting calmly while doing what is right"], ["Shukr", "Using a blessing in a good way"]], c("sabr-shukr-map", "One is about waiting, one is about thanking.", "Sabr is steady patience; shukr is using blessings well and thanking Allah.")),
      tf("pg1t", "easy", "Saying Alhamdulillah is a way of showing shukr.", true, c("alhamdulillah-shukr", "What does Alhamdulillah mean?", "Alhamdulillah — all praise is for Allah — is shukr in words.")),
      mcq("pg1s", "medium", "Your team lost the match. What shows sabr?", ["Stay calm, congratulate the winners and try again", "Blame your teammates", "Throw the ball away"], 0, c("sabr-scenario", "Calm and steady, even when it hurts.", "Sabr is staying calm and gracious in disappointment, then trying again.")),
      fill("pg1f", "medium", "Patience in Arabic is called ____.", "sabr", c("sabr-word", "Four letters, starts with S.", "Sabr is the Arabic word for patience.")),
      mcq("pg1q", "hard", "Allah says in the Quran: 'Indeed, Allah is with the ____.'", ["patient (sabirin)", "rich", "fast"], 0, c("allah-with-patient", "Surah Al-Baqarah 2:153.", "Allah says: Indeed, Allah is with the patient (Surah Al-Baqarah 2:153).")),
    ],
  ),
  lesson(
    "honesty-leadership-1",
    "honesty-leadership",
    "Honesty & Leadership",
    "Lead with truth",
    ["Honesty and Leadership for Kids", "Interactive lesson helping children lead with honesty and responsibility."],
    [
      ["🦁", "A real leader is honest and responsible.", "Lead well", "intro", "happy"],
      ["📋", "Keep promises. Finish what you start.", "Responsibility", "card", "think"],
      ["👂", "A trustworthy leader listens, checks facts, and accepts correction.", "Listen and learn", "tap", "hint"],
      ["🤝", "Help the team. Don’t blame others unfairly.", "Team", "mascot", "cheer"],
    ],
    [
      mcq("hl1e", "easy", "Which quality should guide a Muslim leader?", ["Honesty", "Pride", "Carelessness"], 0, c("honesty", "The Prophet ﷺ was Al-Ameen.", "Honesty is the foundation of trustworthy leadership.")),
      tf("hl1m", "medium", "A leader should blame others to protect their reputation.", false, c("blame", "What does a responsible person do with mistakes?", "Responsible leaders admit mistakes and help correct them — they never shift blame.")),
      mcq("hl1h", "hard", "Two teammates disagree. What should a trustworthy leader do first?", ["Listen to both and check the facts", "Choose the closest friend", "Ignore the problem"], 0, c("listen-first", "Ears before decisions.", "A fair leader listens to everyone and checks the facts before deciding.")),
      sorting("hl1x", "hard", "Order these responsible leadership steps.", ["Listen carefully", "Check the facts", "Choose a fair action", "Review the result"], c("steps", "Start with listening and end with looking back.", "Listen, check the facts, choose fairly, then review the result.")),
      tf("hl1p", "easy", "A good leader keeps their promises.", true, c("promises", "Can people rely on them?", "Keeping promises builds trust — the mark of a good leader.")),
      tapSelect("hl1t", "easy", "Tap the responsible team captain.", [["🤝", "Shares credit with the team"], ["🏆", "Takes all the credit"], ["😡", "Blames others when losing"]], 0, c("share-credit", "Who thinks of the team?", "A responsible captain shares credit and takes responsibility.")),
      mcq("hl1s", "medium", "You promised to help a friend but got a better offer. What should you do?", ["Keep your promise", "Ignore the friend", "Make an excuse"], 0, c("promises", "Your word is a trust.", "Keeping your word, even when something better comes along, is honesty in action.")),
      mcq("hl1r", "hard", "The Prophet ﷺ said each of you is a shepherd and is responsible for…", ["Those in your care", "Your toys", "Nothing"], 0, c("shepherd", "The people you look after.", "Everyone is responsible for those in their care — leaders, parents and even older siblings.")),
    ],
  ),
];

export const LESSON_BY_ID: Record<string, IKLesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
);

export const TOPIC_BY_ID: Record<string, IKTopic> = Object.fromEntries(
  ALL_TOPICS.map((t) => [t.id, t]),
);

export function topicsForLevel(level: IKTopic["level"]): IKTopic[] {
  return ALL_TOPICS.filter((t) => t.level === level).sort((a, b) => a.order - b.order);
}

export function getLessonForTopic(topicId: string): IKLesson | undefined {
  const topic = TOPIC_BY_ID[topicId];
  if (!topic?.lessonIds[0]) return undefined;
  return LESSON_BY_ID[topic.lessonIds[0]];
}

export const TOTAL_QUESTIONS = LESSONS.reduce((sum, item) => sum + item.questions.length, 0);

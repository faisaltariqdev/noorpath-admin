import type { IKBadge, IKLesson, IKQuestion, IKTopic, LessonStep } from "../types";

function steps(rows: Array<[string, string, string?, LessonStep["type"]?, LessonStep["mascotMood"]?]>): LessonStep[] {
  return rows.map(([emoji, text, title, type = "card", mood], i) => ({
    id: `s${i + 1}`,
    type: i === 0 ? "intro" : type,
    emoji,
    text,
    title,
    mascotMood: mood ?? (i === 0 ? "happy" : "think"),
  }));
}

function mcq(id: string, difficulty: IKQuestion["difficulty"], prompt: string, options: string[], correctIndex: number, hint?: string): IKQuestion {
  return {
    id,
    kind: "mcq",
    difficulty,
    prompt,
    hint,
    options: options.map((label, i) => ({ id: `${id}-o${i}`, label })),
    answer: `${id}-o${correctIndex}`,
  };
}

function tf(id: string, difficulty: IKQuestion["difficulty"], prompt: string, isTrue: boolean, hint?: string): IKQuestion {
  return {
    id,
    kind: "true_false",
    difficulty,
    prompt,
    hint,
    options: [
      { id: `${id}-t`, label: "True", emoji: "✅" },
      { id: `${id}-f`, label: "False", emoji: "❌" },
    ],
    answer: isTrue ? `${id}-t` : `${id}-f`,
  };
}

function fill(id: string, difficulty: IKQuestion["difficulty"], prompt: string, answer: string, hint?: string): IKQuestion {
  return { id, kind: "fill_blank", difficulty, prompt, answer: answer.toLowerCase(), hint };
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
  { id: "kind-heart", title: "Kind Heart", emoji: "💛", description: "Complete Kindness & Sharing" },
  { id: "iman-builder", title: "Iman Builder", emoji: "🕌", description: "Complete Allah, Prophet ﷺ & Five Pillars" },
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
      mcq("a1e", "easy", "Who created the sky and the earth?", ["Allah", "People", "The moon"], 0, "Think of who made everything!"),
      tf("a1m", "medium", "Muslims worship only Allah.", true),
      mcq("a1h", "hard", "Which name means the Most Merciful?", ["Ar-Rahman", "Al-Malik", "As-Sami"], 0),
      fill("a1f", "medium", "We say: There is no god but ____.", "allah"),
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
      mcq("p1e", "easy", "Who is the final Messenger of Allah?", ["Prophet Muhammad (PBUH)", "A king", "An angel"], 0),
      tf("p1m", "medium", "Our Prophet was always kind to children.", true),
      mcq("p1h", "hard", "What Book did Allah give to our Prophet?", ["The Quran", "A storybook", "A map"], 0),
      fill("p1f", "easy", "We say: peace be upon ____.", "him"),
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
      mcq("f1e", "easy", "How many pillars does Islam have?", ["Five", "Two", "Ten"], 0),
      mcq("f1m", "medium", "Which pillar is praying five times a day?", ["Salah", "Hajj", "Zakat"], 0),
      tf("f1h", "hard", "Hajj means fasting in Ramadan.", false, "Hajj is the pilgrimage!"),
      fill("f1f", "medium", "The first pillar is called ____.", "shahada"),
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
      mcq("i1e", "easy", "How many articles of faith are there?", ["Six", "Three", "Twelve"], 0),
      tf("i1m", "medium", "Muslims believe in angels.", true),
      mcq("i1h", "hard", "The final Book for Muslims is the ____.", ["Quran", "Newspaper", "Diary"], 0),
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
      mcq("k1e", "easy", "La ilaha illallah means there is no god but ____.", ["Allah", "anyone", "the sun"], 0),
      tf("k1m", "medium", "The Kalimas help us remember Allah.", true),
      fill("k1f", "hard", "Complete: La ilaha ____ Allah.", "illallah"),
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
      mcq("d1e", "easy", "What do we say before eating?", ["Bismillah", "Goodbye", "Hurry"], 0),
      tf("d1m", "medium", "Alhamdulillah means all praise is for Allah.", true),
      mcq("d1h", "hard", "Dua means ____.", ["talking to Allah", "running", "sleeping"], 0),
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
      mcq("g1e", "easy", "What do Muslims say to greet?", ["Assalamu Alaikum", "Only hi", "Bye bye"], 0),
      tf("g1m", "medium", "Wa Alaikum Assalam is the reply to Salam.", true),
      fill("g1f", "hard", "Assalamu Alaikum means ____ be upon you.", "peace"),
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
      mcq("m1e", "easy", "Good manners in Islam are called ____.", ["Adab", "Toys", "Noise"], 0),
      tf("m1m", "medium", "Saying thank you is part of good manners.", true),
      mcq("m1h", "hard", "A soft voice shows ____.", ["respect", "anger", "laziness"], 0),
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
      mcq("r1e", "easy", "Should we speak kindly to parents?", ["Yes", "No", "Only sometimes"], 0),
      tf("r1m", "medium", "Helping parents is a good deed.", true),
      mcq("r1h", "hard", "Making dua for parents is ____.", ["beautiful", "useless", "silly"], 0),
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
      mcq("c1e", "easy", "Washing before prayer is called ____.", ["Wudu", "Sleep", "Play"], 0),
      tf("c1m", "medium", "Keeping your room tidy is part of cleanliness.", true),
      mcq("c1h", "hard", "Littering is ____.", ["not good", "sunnah", "funny"], 0),
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
      mcq("ki1e", "easy", "Should we be kind to animals?", ["Yes", "No", "Never"], 0),
      tf("ki1m", "medium", "Kind words make Allah happy.", true),
      fill("ki1f", "hard", "The Prophet ﷺ was very ____.", "kind"),
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
      mcq("sh1e", "easy", "Sharing with friends is ____.", ["good", "bad", "weird"], 0),
      tf("sh1m", "medium", "Giving charity can be as small as a smile or a snack.", true),
      mcq("sh1h", "hard", "When we share for Allah, we hope for ____.", ["reward", "trouble", "noise"], 0),
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
      mcq("t1e", "easy", "Should Muslims tell the truth?", ["Yes", "No", "Only Mondays"], 0),
      tf("t1m", "medium", "The Prophet ﷺ was called Al-Ameen (trustworthy).", true),
      fill("t1f", "hard", "Lying is ____ for a Muslim.", "wrong"),
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
      mcq("h1e", "easy", "Helping others is ____.", ["rewarded", "useless", "silly"], 0),
      tf("h1m", "medium", "Helping parents at home is a good deed.", true),
      mcq("h1h", "hard", "We help others to please ____.", ["Allah", "nobody", "toys"], 0),
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
      mcq("mq1e", "easy", "In the masjid we should be ____.", ["quiet", "noisy", "running"], 0),
      tf("mq1m", "medium", "We keep the masjid clean.", true),
      mcq("mq1h", "hard", "The masjid is the house of ____.", ["Allah", "toys", "games"], 0),
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
      mcq("rm1e", "easy", "Ramadan is a ____ month.", ["blessed", "scary", "boring"], 0),
      tf("rm1m", "medium", "In Ramadan we try to read more Quran.", true),
      mcq("rm1h", "hard", "Sharing food in Ramadan is ____.", ["wonderful", "wrong", "useless"], 0),
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
      mcq("e1e", "easy", "On Eid we say ____.", ["Eid Mubarak", "Go away", "I'm angry"], 0),
      tf("e1m", "medium", "Eid is a time to thank Allah.", true),
      mcq("e1h", "hard", "Sharing sweets on Eid is ____.", ["sunnah spirit", "haram", "sad"], 0),
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
      mcq("an1e", "easy", "Angels were created by ____.", ["Allah", "people", "robots"], 0),
      tf("an1m", "medium", "Muslims believe in angels.", true),
      mcq("an1h", "hard", "Angel Jibreel brought the ____.", ["Quran", "toys", "cars"], 0),
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
      mcq("pr1e", "easy", "Who is the last prophet?", ["Muhammad ﷺ", "Nuh", "A king"], 0),
      tf("pr1m", "medium", "Prophets taught people to worship Allah alone.", true),
      fill("pr1f", "hard", "Prophet ____ built the ark.", "nuh"),
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
      mcq("j1e", "easy", "Jannah means ____.", ["Paradise", "A sad place", "A school desk"], 0),
      tf("j1m", "medium", "Doing good deeds helps us toward Jannah.", true),
      mcq("j1h", "hard", "In Jannah there is ____.", ["peace forever", "homework forever", "anger forever"], 0),
    ],
  ),
  // Intermediate sample lessons
  lesson(
    "stories-prophets-1",
    "stories-prophets",
    "Prophet Stories",
    "Lessons from the best stories",
    ["Islamic Stories for Children", "Interactive prophet stories for kids — courage, trust, and tawheed."],
    [
      ["📖", "Allah tells the best stories in the Quran!", "Stories", "intro", "happy"],
      ["🐝", "Even a tiny ant and a bee teach us big lessons.", "Tiny teachers", "card", "cheer"],
      ["💪", "Prophets were brave because they trusted Allah.", "Trust", "mascot", "think"],
    ],
    [
      mcq("sp1e", "easy", "The best stories are in the ____.", ["Quran", "Comics only", "Nowhere"], 0),
      tf("sp1m", "medium", "Prophets trusted Allah in hard times.", true),
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
      ["❤️", "They loved him, helped him, and followed the Quran.", "Loyal friends", "card", "cheer"],
      ["🧒", "We can learn from their courage and kindness!", "Be like them", "mascot", "happy"],
    ],
    [
      mcq("sa1e", "easy", "Sahabah were friends of ____.", ["Prophet Muhammad ﷺ", "nobody", "kings only"], 0),
      tf("sa1m", "medium", "We can learn good manners from the Sahabah.", true),
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
      ["🐜", "Ants work together — teamwork is beautiful!", "Ants", "card", "cheer"],
      ["🕊️", "Birds praise Allah in their own way.", "Birds", "mascot", "think"],
    ],
    [
      mcq("aq1e", "easy", "Does the Quran mention animals?", ["Yes", "No", "Never"], 0),
      tf("aq1m", "medium", "We should be kind to animals.", true),
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
      mcq("ds1e", "easy", "A smile can be a ____.", ["charity", "problem", "punishment"], 0),
      tf("ds1m", "medium", "Eating with the right hand is Sunnah.", true),
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
      mcq("hh1e", "easy", "Halal means ____.", ["allowed", "never", "angry"], 0),
      tf("hh1m", "medium", "If unsure, ask a parent or teacher.", true),
    ],
  ),
  lesson(
    "wudu-prayer-1",
    "wudu-prayer",
    "Wudu & Prayer",
    "Clean, then stand for Allah",
    ["Wudu and Prayer for Kids", "Interactive intro to wudu and salah for Muslim children."],
    [
      ["🧼", "Before salah we make wudu — we wash for Allah.", "Wudu", "intro", "happy"],
      ["🙏", "Salah is standing, bowing, and talking to Allah.", "Salah", "card", "cheer"],
      ["⏰", "Try to pray on time. Angels love that!", "On time", "mascot", "happy"],
    ],
    [
      mcq("wp1e", "easy", "Before salah we make ____.", ["wudu", "noise", "mess"], 0),
      tf("wp1m", "medium", "Salah is talking to Allah.", true),
    ],
  ),
  // Advanced sample lessons
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
      mcq("st1e", "easy", "Seerah is the life of ____.", ["Prophet Muhammad ﷺ", "a king", "a pirate"], 0),
      tf("st1m", "medium", "The Prophet ﷺ migrated to Madinah.", true),
      mcq("st1h", "hard", "First revelation came in a ____.", ["cave", "castle", "ship"], 0),
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
      ["🦁", "Lead by example — younger kids copy you!", "Lead", "mascot", "cheer"],
    ],
    [
      mcq("ie1e", "easy", "Good character is called ____.", ["Akhlaq", "Chaos", "Noise"], 0),
      tf("ie1m", "medium", "Honesty is part of Islamic ethics.", true),
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
      ["🙌", "Say Alhamdulillah for food, family, and health!", "Gratitude", "mascot", "cheer"],
    ],
    [
      mcq("pg1e", "easy", "Shukr means ____.", ["thankfulness", "anger", "rushing"], 0),
      tf("pg1m", "medium", "Alhamdulillah is a way to show gratitude.", true),
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
      ["🤝", "Help the team. Don’t blame others unfairly.", "Team", "mascot", "cheer"],
    ],
    [
      mcq("hl1e", "easy", "Leaders should be ____.", ["honest", "mean", "lazy"], 0),
      tf("hl1m", "medium", "Keeping promises is part of responsibility.", true),
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

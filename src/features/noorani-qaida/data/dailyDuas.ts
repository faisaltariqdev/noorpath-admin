import type { InteractiveExample, TopicLesson } from "../types";

const pending = "pending-qari-review" as const;

function example(
  id: string,
  arabic: string,
  transliteration: string,
  meaning?: string,
): InteractiveExample {
  return { id, arabic, transliteration, meaning, audioKey: `example-${id}` };
}

function dua(
  data: Omit<TopicLesson, "reviewStatus" | "audioKey" | "moduleId" | "kind"> & {
    whenToSay: string;
  },
): TopicLesson {
  return {
    ...data,
    moduleId: "daily-duas",
    kind: "dua",
    audioKey: `lesson-${data.id}`,
    reviewStatus: pending,
  };
}

/**
 * Daily Duas curriculum — same TopicLesson shape as Qaida modules.
 * Existing Qaida lessons are not modified; this array is appended in modules.ts.
 */
export const DAILY_DUAS_LESSONS: TopicLesson[] = [
  dua({
    id: "dua-before-eating",
    title: "Before Eating",
    arabicTitle: "دُعَاءُ الطَّعَام",
    summary: "Begin every meal with the name of Allah.",
    whenToSay: "Say this before taking the first bite or sip.",
    childExplanation: "Before we eat, we thank Allah. Put your hands together, say Bismillah, then start eating calmly.",
    teacherTip: "Model once slowly. Check that the child starts with Bismillah before food touches the mouth.",
    parentTip: "Make this a family habit at breakfast and dinner so it becomes automatic.",
    mouthPosition: "Speak clearly and softly; do not rush the opening words.",
    writingHint: "Read right to left. Point to each word as you recite.",
    examples: [
      example("eat-bismillah", "بِسْمِ اللّٰهِ", "Bismillah", "In the name of Allah"),
      example("eat-full", "بِسْمِ اللّٰهِ وَعَلَىٰ بَرَكَةِ اللّٰهِ", "Bismillahi wa ‘alaa barakatillah", "In the name of Allah, and with the blessing of Allah"),
    ],
  }),
  dua({
    id: "dua-after-eating",
    title: "After Eating",
    arabicTitle: "دُعَاءُ بَعْدَ الطَّعَام",
    summary: "Thank Allah after finishing your food.",
    whenToSay: "Say this when the meal is finished.",
    childExplanation: "When your plate is finished, thank Allah for the food, the drink, and that He made you a Muslim.",
    teacherTip: "Contrast before-eating and after-eating duas so the child chooses the correct one.",
    parentTip: "Ask ‘Did we thank Allah?’ before leaving the table.",
    examples: [
      example(
        "after-eat",
        "الْحَمْدُ لِلّٰهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
        "Alhamdu lillahil-ladhee at‘amanaa wa saqaanaa wa ja‘alanaa muslimeen",
        "All praise is for Allah Who fed us, gave us drink, and made us Muslims",
      ),
    ],
  }),
  dua({
    id: "dua-before-drinking",
    title: "Before Drinking",
    arabicTitle: "دُعَاءُ الشُّرْب",
    summary: "Start every drink with Bismillah.",
    whenToSay: "Say this before drinking water, milk, or juice.",
    childExplanation: "Hold your cup, say Bismillah, then drink in small sips while sitting if you can.",
    teacherTip: "Link this to the eating dua so Bismillah feels natural for both food and drink.",
    parentTip: "Praise your child whenever they remember without being reminded.",
    examples: [
      example("drink-bismillah", "بِسْمِ اللّٰهِ", "Bismillah", "In the name of Allah"),
    ],
  }),
  dua({
    id: "dua-after-drinking",
    title: "After Drinking",
    arabicTitle: "دُعَاءُ بَعْدَ الشُّرْب",
    summary: "Praise Allah after drinking.",
    whenToSay: "Say this after finishing your drink.",
    childExplanation: "Put the cup down, then say Alhamdulillah to thank Allah for the drink.",
    teacherTip: "Keep practice short: one clear model, one child repetition.",
    parentTip: "Use the same calm tone you use after meals.",
    examples: [
      example("after-drink", "الْحَمْدُ لِلّٰهِ", "Alhamdulillah", "All praise is for Allah"),
    ],
  }),
  dua({
    id: "dua-entering-home",
    title: "Entering the Home",
    arabicTitle: "دُعَاءُ دُخُولِ الْبَيْت",
    summary: "Enter your home with remembrance of Allah and greetings of peace.",
    whenToSay: "Say this when stepping inside your house.",
    childExplanation: "Open the door gently, say the dua, and greet your family with Assalamu Alaikum.",
    teacherTip: "Practise door → dua → greeting as one smooth habit chain.",
    parentTip: "Stand at the doorway and recite together for a few days until it sticks.",
    examples: [
      example(
        "enter-home",
        "بِسْمِ اللّٰهِ وَلَجْنَا، وَبِسْمِ اللّٰهِ خَرَجْنَا، وَعَلَى اللّٰهِ رَبِّنَا تَوَكَّلْنَا",
        "Bismillahi walajnaa, wa bismillahi kharajnaa, wa ‘alallahi rabbinaa tawakkalnaa",
        "In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we place our trust",
      ),
      example("salam-home", "السَّلَامُ عَلَيْكُمْ", "Assalamu alaikum", "Peace be upon you"),
    ],
  }),
  dua({
    id: "dua-leaving-home",
    title: "Leaving the Home",
    arabicTitle: "دُعَاءُ الخُرُوجِ مِنَ الْبَيْت",
    summary: "Ask Allah for protection when you go outside.",
    whenToSay: "Say this as you step out of the house.",
    childExplanation: "Before going to school or the park, say this dua and trust Allah to keep you safe.",
    teacherTip: "Role-play leaving the classroom door so the habit transfers to real exits.",
    parentTip: "Say it with your child at the front door every morning.",
    examples: [
      example(
        "leave-home",
        "بِسْمِ اللّٰهِ، تَوَكَّلْتُ عَلَى اللّٰهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ",
        "Bismillah, tawakkaltu ‘alallah, wa laa hawla wa laa quwwata illaa billah",
        "In the name of Allah, I place my trust in Allah, and there is no power except with Allah",
      ),
    ],
  }),
  dua({
    id: "dua-entering-toilet",
    title: "Entering the Toilet",
    arabicTitle: "دُعَاءُ دُخُولِ الخَلَاء",
    summary: "Seek Allah’s protection before entering the washroom.",
    whenToSay: "Say this before entering the toilet, preferably with the left foot first.",
    childExplanation: "Stop at the door, say the dua quietly, then enter carefully.",
    teacherTip: "Teach privacy and respect: recite softly, no loud practice inside the washroom.",
    parentTip: "Practise at home near the bathroom door, not inside.",
    examples: [
      example(
        "enter-toilet",
        "اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
        "Allahumma innee a‘oodhu bika minal-khubthi wal-khabaa’ith",
        "O Allah, I seek refuge in You from the male and female unclean spirits",
      ),
    ],
  }),
  dua({
    id: "dua-leaving-toilet",
    title: "Leaving the Toilet",
    arabicTitle: "دُعَاءُ الخُرُوجِ مِنَ الخَلَاء",
    summary: "Ask Allah for forgiveness when leaving the washroom.",
    whenToSay: "Say this after leaving the toilet, preferably with the right foot first.",
    childExplanation: "Wash your hands, step out, then say Ghufranaka.",
    teacherTip: "Pair hygiene (handwashing) with the dua so both habits stick together.",
    parentTip: "A small wall card outside the bathroom helps beginners remember.",
    examples: [
      example("leave-toilet", "غُفْرَانَكَ", "Ghufranaka", "I ask You (O Allah) for forgiveness"),
    ],
  }),
  dua({
    id: "dua-waking-up",
    title: "Waking Up",
    arabicTitle: "دُعَاءُ الِاسْتِيقَاظ",
    summary: "Thank Allah for giving life after sleep.",
    whenToSay: "Say this when you wake up in the morning.",
    childExplanation: "Open your eyes, stretch gently, and thank Allah for a new day.",
    teacherTip: "Connect this dua to morning routine: wake → dua → wudu → prayer.",
    parentTip: "Whisper it with your child for the first few mornings.",
    examples: [
      example(
        "wake-up",
        "الْحَمْدُ لِلّٰهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        "Alhamdu lillahil-ladhee ahyaanaa ba‘da maa amaatanaa wa ilayhin-nushoor",
        "All praise is for Allah Who gave us life after causing us to die, and to Him is the resurrection",
      ),
    ],
  }),
  dua({
    id: "dua-before-sleep",
    title: "Before Sleeping",
    arabicTitle: "دُعَاءُ النَّوْم",
    summary: "End the day in Allah’s name and place yourself in His care.",
    whenToSay: "Say this when lying down to sleep.",
    childExplanation: "Lie on your right side if you can, say the dua, and sleep peacefully.",
    teacherTip: "Keep lights calm and model a soft bedtime voice.",
    parentTip: "Make this the last shared words before lights out.",
    examples: [
      example(
        "sleep",
        "بِاسْمِكَ اللّٰهُمَّ أَمُوتُ وَأَحْيَا",
        "Bismika Allahumma amootu wa ahyaa",
        "In Your name, O Allah, I die and I live",
      ),
    ],
  }),
  dua({
    id: "dua-entering-mosque",
    title: "Entering the Mosque",
    arabicTitle: "دُعَاءُ دُخُولِ المَسْجِد",
    summary: "Ask Allah to open His doors of mercy as you enter the mosque.",
    whenToSay: "Say this when entering the masjid, preferably with the right foot first.",
    childExplanation: "Walk quietly, say the dua, and sit calmly ready to pray or listen.",
    teacherTip: "Practise masjid manners: soft voice, clean clothes, respectful steps.",
    parentTip: "Review this dua in the car before Jummah.",
    examples: [
      example(
        "enter-masjid",
        "اللّٰهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        "Allahumma iftah lee abwaaba rahmatik",
        "O Allah, open for me the doors of Your mercy",
      ),
    ],
  }),
  dua({
    id: "dua-leaving-mosque",
    title: "Leaving the Mosque",
    arabicTitle: "دُعَاءُ الخُرُوجِ مِنَ المَسْجِد",
    summary: "Ask Allah for His bounty when leaving the mosque.",
    whenToSay: "Say this when leaving the masjid, preferably with the left foot first.",
    childExplanation: "After prayer, step out gently and ask Allah for His blessings.",
    teacherTip: "Contrast enter-mercy / leave-bounty so children remember both duas.",
    parentTip: "Ask which dua is for entering and which is for leaving as a quick quiz.",
    examples: [
      example(
        "leave-masjid",
        "اللّٰهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
        "Allahumma innee as’aluka min fadlik",
        "O Allah, I ask You from Your bounty",
      ),
    ],
  }),
  dua({
    id: "dua-travel",
    title: "Travel Dua",
    arabicTitle: "دُعَاءُ السَّفَر",
    summary: "Ask Allah for ease and safety when travelling.",
    whenToSay: "Say this when starting a journey by car, bus, train, or plane.",
    childExplanation: "Sit safely, buckle up, then recite the travel dua before the vehicle moves.",
    teacherTip: "Use a short journey story so children connect the dua to real movement.",
    parentTip: "Recite together every time the car starts — consistency builds mastery.",
    examples: [
      example(
        "travel",
        "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ",
        "Subhaanalladhee sakhkhara lanaa haadhaa wa maa kunnaa lahu muqrineen, wa innaa ilaa rabbinaa lamunqaliboon",
        "Glory be to the One Who has subjected this to us, and we could not have done it by ourselves, and to our Lord we will surely return",
      ),
    ],
  }),
  dua({
    id: "dua-sneezing",
    title: "When Sneezing",
    arabicTitle: "دُعَاءُ العُطَاس",
    summary: "Respond to a sneeze with praise and a kind reply.",
    whenToSay: "The one who sneezes says Alhamdulillah; the listener replies Yarhamukallah.",
    childExplanation: "If you sneeze, say Alhamdulillah. If someone else sneezes, reply with a kind dua for them.",
    teacherTip: "Practise both roles so children learn the full etiquette exchange.",
    parentTip: "Celebrate polite sneezing manners at home.",
    examples: [
      example("sneeze-self", "الْحَمْدُ لِلّٰهِ", "Alhamdulillah", "All praise is for Allah (said by the one who sneezes)"),
      example("sneeze-reply", "يَرْحَمُكَ اللّٰهُ", "Yarhamukallah", "May Allah have mercy on you (said by the listener)"),
      example("sneeze-response", "يَهْدِيكُمُ اللّٰهُ وَيُصْلِحُ بَالَكُمْ", "Yahdeekumullahu wa yuslihu baalakum", "May Allah guide you and set your affairs right"),
    ],
  }),
  dua({
    id: "dua-mirror",
    title: "Looking in the Mirror",
    arabicTitle: "دُعَاءُ المِرْآة",
    summary: "Ask Allah to perfect your character as He perfected your form.",
    whenToSay: "Say this when looking in the mirror while getting ready.",
    childExplanation: "Look in the mirror, smile gently, and ask Allah to make your manners beautiful too.",
    teacherTip: "Link outer appearance with inner character — a powerful akhlaq lesson.",
    parentTip: "A small sticker on the mirror can remind younger children.",
    examples: [
      example(
        "mirror",
        "اللّٰهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
        "Allahumma kamaa hassanta khalqee fa hassin khuluqee",
        "O Allah, just as You have made my appearance beautiful, make my character beautiful",
      ),
    ],
  }),
  dua({
    id: "dua-wearing-clothes",
    title: "Wearing Clothes",
    arabicTitle: "دُعَاءُ لُبْسِ الثَّوْب",
    summary: "Thank Allah for clothing and covering.",
    whenToSay: "Say this when putting on clothes.",
    childExplanation: "As you wear your clothes, thank Allah for giving you something clean to wear.",
    teacherTip: "Useful before school uniform practice and eid clothes discussions.",
    parentTip: "Model it while helping younger children dress.",
    examples: [
      example(
        "clothes",
        "الْحَمْدُ لِلّٰهِ الَّذِي كَسَانِي هٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        "Alhamdu lillahil-ladhee kasaanee haadhaa wa razaqaneehi min ghayri hawlin minnee wa laa quwwah",
        "All praise is for Allah Who clothed me with this and provided it for me with no power or strength from myself",
      ),
    ],
  }),
  dua({
    id: "dua-anger",
    title: "When Angry",
    arabicTitle: "دُعَاءُ الغَضَب",
    summary: "Seek Allah’s protection when anger rises.",
    whenToSay: "Say this as soon as you feel angry, then pause and breathe.",
    childExplanation: "If you feel angry, stop, say A‘oodhu billah, sit quietly, and cool down before speaking.",
    teacherTip: "Combine the dua with a calm-down strategy: sit, breathe, then speak.",
    parentTip: "Practise during peaceful moments so it is ready in real frustration.",
    examples: [
      example(
        "anger",
        "أَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
        "A‘oodhu billahi minash-shaytaanir-rajeem",
        "I seek refuge in Allah from the rejected devil",
      ),
    ],
  }),
  dua({
    id: "dua-visiting-sick",
    title: "Visiting the Sick",
    arabicTitle: "دُعَاءُ عِيَادَةِ المَرِيض",
    summary: "Make a gentle dua for healing when visiting someone who is ill.",
    whenToSay: "Say this quietly when visiting a sick person.",
    childExplanation: "Speak softly, smile kindly, and ask Allah to heal them soon.",
    teacherTip: "Teach compassion vocabulary alongside the dua.",
    parentTip: "Practise before real hospital or home visits.",
    examples: [
      example(
        "sick",
        "لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللّٰهُ",
        "Laa ba’sa, tahoorun in shaa Allah",
        "No harm, it is a purification, if Allah wills",
      ),
    ],
  }),
  dua({
    id: "dua-for-parents",
    title: "Dua for Parents",
    arabicTitle: "دُعَاءٌ لِلْوَالِدَيْن",
    summary: "Ask Allah to have mercy on your parents as they cared for you.",
    whenToSay: "Say this often — after salah, before sleep, or whenever you remember your parents.",
    childExplanation: "Think of your parents’ love, then ask Allah to be kind and merciful to them.",
    teacherTip: "A strong character lesson: gratitude to parents is part of faith.",
    parentTip: "Recite together so children hear sincere love in your voice.",
    examples: [
      example(
        "parents",
        "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
        "Rabbir-hamhumaa kamaa rabbayaanee sagheeraa",
        "My Lord, have mercy upon them as they brought me up when I was small",
      ),
    ],
  }),
  dua({
    id: "dua-morning-evening",
    title: "Morning & Evening Remembrance",
    arabicTitle: "أَذْكَارُ الصَّبَاحِ وَالمَسَاء",
    summary: "Protect your day and night with short morning and evening adhkar.",
    whenToSay: "Morning after Fajr time, and evening before Maghrib/night.",
    childExplanation: "Say these short words in the morning and evening to stay close to Allah all day.",
    teacherTip: "Start with one line only; add more when fluency is stable.",
    parentTip: "Keep a shared morning/evening checklist on the fridge.",
    examples: [
      example(
        "morning",
        "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ",
        "Asbahnaa wa asbahal-mulku lillah, walhamdu lillah",
        "We have entered the morning and the dominion belongs to Allah, and all praise is for Allah",
      ),
      example(
        "evening",
        "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ",
        "Amsaynaa wa amsal-mulku lillah, walhamdu lillah",
        "We have entered the evening and the dominion belongs to Allah, and all praise is for Allah",
      ),
      example(
        "protection",
        "بِسْمِ اللّٰهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        "Bismillahil-ladhee laa yadurru ma‘asmihi shay’un fil-ardi wa laa fis-samaa’i wa huwas-samee‘ul-‘aleem",
        "In the name of Allah, with Whose name nothing on earth or in the heaven can cause harm, and He is the All-Hearing, the All-Knowing",
      ),
    ],
  }),
];

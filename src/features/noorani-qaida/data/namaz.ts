import type { InteractiveExample, SalahRecitationPart, SalahStep, TopicLesson } from "../types";

const pending = "pending-qari-review" as const;

function example(
  id: string,
  arabic: string,
  transliteration: string,
  meaning?: string,
): InteractiveExample {
  return { id, arabic, transliteration, meaning, audioKey: `example-${id}` };
}

function salah(
  data: Omit<TopicLesson, "reviewStatus" | "audioKey" | "moduleId" | "kind"> & {
    steps: SalahStep[];
  },
): TopicLesson {
  return {
    ...data,
    moduleId: "namaz",
    kind: "salah",
    audioKey: `lesson-${data.id}`,
    reviewStatus: pending,
  };
}

// ---------------------------------------------------------------------------
// Reusable Recitation Part Breakdowns for Children
// ---------------------------------------------------------------------------
export const THANA_RECITATION_PARTS: SalahRecitationPart[] = [
  {
    title: "1. Glory & Praise",
    arabic: "سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ",
    transliteration: "Subhaanak-Allaahumma wa bihamdika",
    translation: "Glory be to You, O Allah, and all praise is Yours.",
    instruction: "Whispered quietly with hands folded upon the chest.",
  },
  {
    title: "2. Blessed Name",
    arabic: "وَتَبَارَكَ اسْمُكَ",
    transliteration: "Wa tabaarakasmuka",
    translation: "And blessed is Your Holy Name.",
    instruction: "Affirms that blessings flow from the remembrance of Allah.",
  },
  {
    title: "3. Exalted Majesty",
    arabic: "وَتَعَالَىٰ جَدُّكَ",
    transliteration: "Wa ta‘aalaa jadduka",
    translation: "And exalted is Your Supreme Majesty and Greatness.",
    instruction: "Declares Allah's high station above all creation.",
  },
  {
    title: "4. Exclusive Divinity",
    arabic: "وَلَا إِلٰهَ غَيْرُكَ",
    transliteration: "Wa laa ilaaha ghayruk",
    translation: "And there is no deity worthy of worship other than You.",
    instruction: "Concludes with the core truth of Tawheed.",
  },
];

export const TASHAHHUD_RECITATION_PARTS: SalahRecitationPart[] = [
  {
    title: "1. Sacred Greetings (At-Tahiyyat)",
    arabic: "التَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ",
    transliteration: "At-tahiyyaatu lillaahi was-salawaatu wat-tayyibaat.",
    translation: "All blessed greetings, prayers, and pure words belong to Allah alone.",
    instruction: "Recited while sitting calmly in Qa'dah with hands resting on thighs.",
  },
  {
    title: "2. Salam on Rasulullah ﷺ",
    arabic: "السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ",
    transliteration: "As-salaamu ‘alayka ayyuhan-Nabiyyu wa rahmatullaahi wa barakaatuh.",
    translation: "Peace be upon you, O Prophet, and the mercy of Allah and His blessings.",
    instruction: "Send heartfelt greetings of peace directly upon Prophet Muhammad ﷺ.",
  },
  {
    title: "3. Salam on the Righteous",
    arabic: "السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللّٰهِ الصَّالِحِينَ",
    transliteration: "As-salaamu ‘alaynaa wa ‘alaa ‘ibaadillaahis-saaliheen.",
    translation: "Peace be upon us, and upon all the righteous, faithful servants of Allah.",
    instruction: "Spread peace upon yourself, fellow believers, and righteous souls.",
  },
  {
    title: "4. Shahadah (Affirmation of Tawheed)",
    arabic: "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration: "Ashhadu an laa ilaaha illallaahu wa ashhadu anna Muhammadan ‘abduhu wa rasooluh.",
    translation: "I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is His servant and Messenger.",
    instruction: "Gently raise the right index finger at 'laa ilaaha illallah' to proclaim Tawheed.",
  },
];

export const DUROOD_RECITATION_PARTS: SalahRecitationPart[] = [
  {
    title: "1. Salawat (Blessings upon Prophet Muhammad ﷺ)",
    arabic: "اللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration: "Allaahumma salli ‘alaa Muhammadin wa ‘alaa aali Muhammad, kamaa sallayta ‘alaa Ibraaheema wa ‘alaa aali Ibraaheem, innaka hameedun majeed.",
    translation: "O Allah, send prayers upon Muhammad and upon the family of Muhammad, as You sent prayers upon Ibrahim and upon the family of Ibrahim. Indeed You are Praiseworthy, Glorious.",
    instruction: "Recited while sitting calmly in Qa'dah after completing the Tashahhud.",
  },
  {
    title: "2. Barakah (Abundant Grace & Prosperity)",
    arabic: "اللّٰهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration: "Allaahumma baarik ‘alaa Muhammadin wa ‘alaa aali Muhammad, kamaa baarakta ‘alaa Ibraaheema wa ‘alaa aali Ibraaheem, innaka hameedun majeed.",
    translation: "O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. Indeed You are Praiseworthy, Glorious.",
    instruction: "Invokes continuous divine barakah upon the Prophet ﷺ and his righteous family.",
  },
  {
    title: "3. Dua Masoora (Supplication Before Salam)",
    arabic:
      "رَبِّ اجْعَلْنِيْ مُقِيْمَ الصَّلٰوةِ وَمِنْ ذُرِّيَّتِيْ ۖ رَبَّنَا وَتَقَبَّلْ دُعَاءِ ۝ رَبَّنَا اغْفِرْ لِيْ وَلِوَالِدَيَّ وَلِلْمُؤْمِنِيْنَ يَوْمَ يَقُوْمُ الْحِسَابُ",
    transliteration:
      "Rabbi-j‘alnee muqeemas-Salaati wa min dhurriyyatee, Rabbanaa wa taqabbal du‘aa’. Rabbanagh-fir lee wa li-waalidayya wa lil-Mu’mineena Yawma yaqoomul-Hisaab.",
    translation:
      "My Lord, make me steadfast in prayer, and also from my descendants. Our Lord, and accept my supplication. Our Lord, forgive me and my parents and the believers on the Day the account will be established.",
    instruction:
      "Quranic supplication (Surah Ibrahim 14:40-41) recited in Qa'dah after Durood before concluding prayer with Salam.",
  },
];

export const SALAM_RIGHT_PARTS: SalahRecitationPart[] = [
  {
    title: "Salam to the Right",
    arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ",
    transliteration: "As-salaamu ‘alaykum wa rahmatullaah",
    translation: "Peace and the mercy of Allah be upon you.",
    instruction: "Turn your face toward the right shoulder, greeting the recording angel and righteous believers.",
  },
];

export const SALAM_LEFT_PARTS: SalahRecitationPart[] = [
  {
    title: "Salam to the Left · Complete",
    arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ",
    transliteration: "As-salaamu ‘alaykum wa rahmatullaah",
    translation: "Peace and the mercy of Allah be upon you.",
    instruction: "Turn your face toward the left shoulder, concluding your prayer with tranquility and peace.",
  },
];

export const FAJR_PRAYER_PARTS: SalahRecitationPart[] = [
  {
    title: "1. Rak‘aat Breakdown (4 Total)",
    arabic: "2 Sunnah + 2 Fard",
    transliteration: "2 Sunnah Mu'akkadah + 2 Fard Rak‘aat (Jahri / Aloud)",
    translation: "The 2 Sunnah rak'aat of Fajr are highly emphasized; Rasulullah ﷺ never omitted them.",
    instruction: "Prayed quietly before the obligatory 2 Fard rak'aat.",
  },
  {
    title: "2. Fard Prayer (2 Rak‘aat Jahri)",
    arabic: "2 Fard Rak‘aat (Recited Aloud)",
    transliteration: "2 Fard Rak‘aat (Audible Recitation)",
    translation: "The obligatory dawn prayer. Surat al-Fatihah and Surahs are recited aloud (Jahri) with tajweed melody.",
    instruction: "Angels of the night and day gather to witness the morning recitation.",
  },
  {
    title: "3. Time Window (Dawn to Sunrise)",
    arabic: "Dawn to Sunrise (Fajr Time Window)",
    transliteration: "Min tuloo‘il-fajr ilaa tuloo‘ish-shams",
    translation: "From true dawn until just before the sun appears above the horizon.",
    instruction: "Commence your day in the divine protection and light of Allah.",
  },
];

export const DHUHR_PRAYER_PARTS: SalahRecitationPart[] = [
  {
    title: "1. Rak‘aat Breakdown (12 Total)",
    arabic: "4 Sunnah + 4 Fard + 2 Sunnah + 2 Nafl",
    transliteration: "4 Sunnah + 4 Fard + 2 Sunnah + 2 Nafl",
    translation: "Dhuhr consists of 4 Sunnah before Fard, 4 Fard, 2 Sunnah after Fard, and 2 voluntary Nafl.",
    instruction: "The 4 Sunnah before Dhuhr cause the doors of the heavens to be opened.",
  },
  {
    title: "2. Silent Recitation (Sirri)",
    arabic: "Silent Recitation (Sirri / Quiet Whisper)",
    transliteration: "Qira'ah Sirriyyah (Quiet Whisper)",
    translation: "All 4 rak'aat of Dhuhr are recited silently. Move tongue and lips softly without loud voice.",
    instruction: "Focus inward with deep mindfulness amidst the busy daytime activities.",
  },
  {
    title: "3. Middle Sitting (Qa‘dah Ula)",
    arabic: "Middle Sitting after Rakah 2 (Tashahhud)",
    transliteration: "Qa'dah Ula after Rakah 2",
    translation: "Sit after the 2nd Sujood of Rakah 2 to recite Tashahhud, then rise immediately for Rakah 3.",
    instruction: "Rise directly saying 'Allahu Akbar' without adding Durood or Salam at this middle sitting.",
  },
  {
    title: "4. Time Window (Midday Meridian)",
    arabic: "Midday to Afternoon (Dhuhr Time Window)",
    transliteration: "Min zawaalish-shams ilaa zillil-mithl",
    translation: "From when the sun passes the meridian zenith until an object's shadow matches its length.",
    instruction: "Pause school or play to remember your Lord and rejuvenate your energy.",
  },
];

export const ASR_PRAYER_PARTS: SalahRecitationPart[] = [
  {
    title: "1. Rak‘aat Breakdown (8 Total)",
    arabic: "4 Sunnah + 4 Fard",
    transliteration: "4 Sunnah Ghair Mu'akkadah + 4 Fard",
    translation: "4 recommended Sunnah followed by 4 obligatory (Fard) rak‘aat.",
    instruction: "Rasulullah ﷺ said: 'May Allah show mercy to whoever prays four rak'aat before ‘Asr.'",
  },
  {
    title: "2. Silent Recitation (Sirri)",
    arabic: "Silent Recitation (Sirri / Quiet Whisper)",
    transliteration: "Qira'ah Sirriyyah (Quiet Whisper)",
    translation: "Like Dhuhr, all 4 rak'aat of ‘Asr are recited silently with serene focus.",
    instruction: "Preserve strict khushu‘ as the afternoon draws towards dusk.",
  },
  {
    title: "3. The Blessed Middle Prayer",
    arabic: "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ",
    transliteration: "Haafizoo ‘alas-salawaati was-salaatil-wustaa",
    translation: "'Guard strictly the prayers, especially the middle prayer ('Asr), and stand before Allah with devotion.' (2:238)",
    instruction: "Preserving ‘Asr brings immense rewards and protection from deprivation.",
  },
  {
    title: "4. Time Window (Late Afternoon)",
    arabic: "Late Afternoon until Sunset",
    transliteration: "Min ba‘dil-‘Asr ilaa isfiraarish-shams",
    translation: "From the end of Dhuhr time until the sun turns pale yellow before setting.",
    instruction: "Must be offered before the sun begins to set below the horizon.",
  },
];

export const MAGHRIB_PRAYER_PARTS: SalahRecitationPart[] = [
  {
    title: "1. Rak‘aat Breakdown (7 Total)",
    arabic: "3 Fard + 2 Sunnah + 2 Nafl",
    transliteration: "3 Fard + 2 Sunnah Mu'akkadah + 2 Nafl",
    translation: "Maghrib begins with 3 obligatory (Fard) rak‘aat, followed by 2 Sunnah and 2 Nafl.",
    instruction: "It is Sunnah to perform Maghrib promptly without delay after the sunset Adhan.",
  },
  {
    title: "2. Audible & Silent Recitation",
    arabic: "2 Rak‘aat Aloud (Jahri) + 1 Silent (Sirri)",
    transliteration: "2 Rak‘aat Jahri + 1 Rak‘ah Sirri",
    translation: "Surat al-Fatihah and Surah are recited aloud in the first 2 rak‘aat; the 3rd rak‘ah is recited silently.",
    instruction: "Listen attentively to the Imam or recite with melodious tajweed if praying at home.",
  },
  {
    title: "3. Unique 3-Rak‘ah Structure",
    arabic: "Sit after Rakah 2, then complete 1 final Rakah",
    transliteration: "Sit after Rakah 2, then complete 1 final Rakah",
    translation: "Sit for Tashahhud after Rakah 2, rise for only 1 rakah (reciting only Al-Fatihah), then sit for the final Tashahhud, Durood, and Salam.",
    instruction: "Maghrib acts as the odd-numbered (Witr) prayer of the daytime.",
  },
  {
    title: "4. Time Window (Sunset Twilight)",
    arabic: "Sunset to Evening Twilight",
    transliteration: "Min ghuroobish-shams ilaa ghiyaabish-shafaq",
    translation: "From sunset until the red twilight disappears completely from the western horizon.",
    instruction: "Gather family members together for a peaceful and blessed evening prayer.",
  },
];

export const ISHA_PRAYER_PARTS: SalahRecitationPart[] = [
  {
    title: "1. Rak‘aat Breakdown (17 Total)",
    arabic: "4 Sunnah + 4 Fard + 2 Sunnah + 2 Nafl + 3 Witr + 2 Nafl",
    transliteration: "4 Sunnah + 4 Fard + 2 Sunnah + 2 Nafl + 3 Witr Wajib + 2 Nafl",
    translation: "The night prayer includes 4 Fard, 2 Sunnah, 3 Witr Wajib, and optional Sunnah & Nafl.",
    instruction: "Recite aloud (Jahri) in the first 2 rak‘aat of Fard and during the Witr prayer.",
  },
  {
    title: "2. Witr Prayer & Takbir before Qunoot",
    arabic: "Witr Prayer (3 Rak‘aat with Takbir & Dua Qunoot)",
    transliteration: "Salat al-Witr with Takbir before Qunoot",
    translation: "In the 3rd rakah of Witr, after Al-Fatihah and a Surah, raise hands saying 'Allahu Akbar', refold hands on chest, and recite Dua al-Qunoot.",
    instruction: "Witr is an emphasized wajib prayer that crowns the night's worship.",
  },
  {
    title: "3. Blessed Dua al-Qunoot (Full Words)",
    arabic: "اللّٰهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ، وَنَشْكُرُكَ وَلَا نَكْفُرُكَ، وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ. اللّٰهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ، وَإِلَيْكَ نَسْعَىٰ وَنَحْفِدُ، نَرْجُو رَحْمَتَكَ وَنَخْشَىٰ عَذَابَكَ، إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحَقٌ",
    transliteration: "Allaahumma innaa nasta‘eenuka wa nastaghfiruka wa nu'minu bika wa natawakkalu ‘alayka wa nuthnee ‘alaykal-khayr, wa nashkuruka wa laa nakfuruk, wa nakhla‘u wa natruku may-yafjuruk. Allaahumma iyyaaka na‘budu wa laka nusallee wa nasjud, wa ilayka nas‘aa wa nahfid, narjoo rahmataka wa nakhshaa ‘adhaabak, inna ‘adhaabaka bil-kuffaari mulhaq.",
    translation: "O Allah, we seek Your help and Your forgiveness, we believe in You, rely upon You, and praise You in the best manner. We thank You and do not deny You, and we turn away from whoever disobeys You. O Allah, You alone we worship, and to You we pray and prostrate. Towards You we hasten and serve. We hope for Your mercy and fear Your punishment; surely Your punishment will reach the disbelievers.",
    instruction: "Recited with folded hands in the 3rd rakah of Witr before bowing down into Ruku.",
  },
  {
    title: "4. Time Window (Night to Dawn)",
    arabic: "Twilight to Midnight / Dawn",
    transliteration: "Min ghiyaabish-shafaq ilaa nisf-il-layl",
    translation: "From the complete disappearance of evening twilight until the middle of the night (or true dawn).",
    instruction: "Conclude your waking hours with Witr and rest peacefully under Allah's watchful protection.",
  },
];

export const FATIHAH_RECITATION_PARTS: SalahRecitationPart[] = [
  {
    title: "Ayah 1 (Basmala)",
    arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ",
    transliteration: "Bismillaahir-Rahmaanir-Raheem",
    translation: "In the name of Allah, the Most Gracious, the Most Merciful.",
    instruction: "Commence recitation standing composed in Qiyam.",
  },
  {
    title: "Ayah 2 (Praise)",
    arabic: "الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ",
    transliteration: "Alhamdu lillaahi Rabbil-‘aalameen",
    translation: "All praise is for Allah, Lord of all the worlds.",
    instruction: "Pronounce the letter ‘Ain softly and clearly.",
  },
  {
    title: "Ayah 3 (Mercy)",
    arabic: "الرَّحْمٰنِ الرَّحِيمِ",
    transliteration: "Ar-Rahmaanir-Raheem",
    translation: "The Most Gracious, the Most Merciful.",
    instruction: "Pause briefly at the end of each verse.",
  },
  {
    title: "Ayah 4 (Sovereignty)",
    arabic: "مَالِكِ يَوْمِ الدِّينِ",
    transliteration: "Maaliki Yawmid-Deen",
    translation: "Master of the Day of Judgment.",
    instruction: "Stand with deep reverence and humility.",
  },
  {
    title: "Ayah 5 (Worship)",
    arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    transliteration: "Iyyaaka na‘budu wa iyyaaka nasta‘een",
    translation: "You alone we worship, and You alone we ask for help.",
    instruction: "The central covenant between the worshipper and Allah.",
  },
  {
    title: "Ayah 6 (Guidance)",
    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    transliteration: "Ihdinas-siraatal-mustaqeem",
    translation: "Guide us to the straight path.",
    instruction: "The greatest supplication for steadfast direction.",
  },
  {
    title: "Ayah 7 (The Blessed Path)",
    arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ۝ آمِين",
    transliteration: "Siraatal-ladheena an‘amta ‘alayhim, ghayril-maghdoobi ‘alayhim walad-daalleen. Aameen.",
    translation: "The path of those whom You have blessed, not of those who earned anger, nor of those who are astray. Aameen.",
    instruction: "Say 'Aameen' with devotion to conclude.",
  },
];

export const IKHLAS_RECITATION_PARTS: SalahRecitationPart[] = [
  {
    title: "Ayah 1 (The One)",
    arabic: "قُلْ هُوَ اللّٰهُ أَحَدٌ",
    transliteration: "Qul Huwallahu Ahad",
    translation: "Say: He is Allah, the Absolute One.",
    instruction: "Clear Qalqalah echo bounce on the Dal.",
  },
  {
    title: "Ayah 2 (The Eternal)",
    arabic: "اللّٰهُ الصَّمَدُ",
    transliteration: "Allahus-Samad",
    translation: "Allah, the Eternal, Independent Refuge.",
    instruction: "Emphasize the deep letter Saad in As-Samad.",
  },
  {
    title: "Ayah 3 (Unbegotten)",
    arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    transliteration: "Lam yalid wa lam yoolad",
    translation: "He neither begets nor is He born.",
    instruction: "Short, clean bounces on Yalid and Yoolad.",
  },
  {
    title: "Ayah 4 (Incomparable)",
    arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    transliteration: "Wa lam yakul-lahu kufuwan ahad",
    translation: "And there is none comparable or equal unto Him.",
    instruction: "Complete the recitation and prepare for Ruku.",
  },
];

/**
 * Namaz (Salah) curriculum — separate module with step-by-step visual flow.
 * Existing Qaida modules are not modified; this array is appended in modules.ts.
 */
export const NAMAZ_LESSONS: TopicLesson[] = [
  salah({
    id: "namaz-five-prayers",
    title: "Names of Namaz",
    arabicTitle: "الصَّلَوَاتُ الخَمْس",
    summary: "Know each prayer’s name, time window, and typical rak‘aat count.",
    childExplanation:
      "Muslims pray five times every day. Each prayer has a special time and a set number of rak‘aat. Watch our YouTube video guide to learn all five prayers!",
    teacherTip: "Use a simple daily timeline drawing so children see when each prayer fits.",
    parentTip: "Hang a child-friendly salah timetable near the prayer area.",
    videoUrl: "https://youtu.be/4otBBs3sPcc",
    videoTitle: "Names of Namaz — 5 Daily Prayers Video Guide",
    videoDescription: "Complete video lesson teaching students the names, timings, and rak'aat of the five daily prayers.",
    videoPhases: [
      { label: "Names of Namaz (Video A)", url: "https://youtu.be/4otBBs3sPcc" },
      { label: "Names of Namaz (Video B)", url: "https://youtu.be/7L4k-iP59IY" },
    ],
    examples: [
      example("fajr-r", "2 Sunnah + 2 Fard", "Fajr · 2 Sunnah + 2 Fard", "Dawn — 4 total rak‘aat"),
      example("dhuhr-r", "4 Sunnah + 4 Fard + 2 Sunnah + 2 Nafl", "Dhuhr · 12 rak‘aat", "Midday — 12 total rak‘aat"),
      example("asr-r", "4 Sunnah + 4 Fard", "‘Asr · 8 rak‘aat", "Afternoon — 8 total rak‘aat"),
      example("maghrib-r", "3 Fard + 2 Sunnah + 2 Nafl", "Maghrib · 7 rak‘aat", "Sunset — 7 total rak‘aat"),
      example("isha-r", "4 Sunnah + 4 Fard + 2 Sunnah + 2 Nafl + 3 Witr + 2 Nafl", "‘Ishaa · 17 rak‘aat", "Night — 17 total rak‘aat"),
    ],
    steps: [
      {
        id: "p-1",
        order: 1,
        title: "Fajr (Dawn Prayer)",
        arabicTitle: "صَلَاةُ الفَجْر",
        arabic: "2 Sunnah + 2 Fard",
        transliteration: "2 Sunnah + 2 Fard Rak‘aat (Jahri / Aloud)",
        translation: "Pray 2 Sunnah and 2 Fard rak‘aat at dawn before sunrise. The Quran is recited aloud (Jahri).",
        visualCue: "Quiet morning light — soft start to the day under Allah's divine protection.",
        posture: "standing",
        videoUrl: "https://youtu.be/4otBBs3sPcc",
        videoPhases: [
          { label: "Names of Namaz (Video A)", url: "https://youtu.be/4otBBs3sPcc" },
          { label: "Names of Namaz (Video B)", url: "https://youtu.be/7L4k-iP59IY" },
        ],
        recitationParts: FAJR_PRAYER_PARTS,
      },
      {
        id: "p-2",
        order: 2,
        title: "Dhuhr (Midday Prayer)",
        arabicTitle: "صَلَاةُ الظُّهْر",
        arabic: "4 Sunnah + 4 Fard + 2 Sunnah + 2 Nafl",
        transliteration: "4 Sunnah + 4 Fard + 2 Sunnah + 2 Nafl (Sirri / Silent)",
        translation: "Pray 4 Fard rak‘aat after the sun passes its highest point, with a middle sitting after rakah 2.",
        visualCue: "Midday pause — refresh heart and soul away from work or school.",
        posture: "standing",
        videoUrl: "https://youtu.be/4otBBs3sPcc",
        videoPhases: [
          { label: "Names of Namaz (Video A)", url: "https://youtu.be/4otBBs3sPcc" },
          { label: "Names of Namaz (Video B)", url: "https://youtu.be/7L4k-iP59IY" },
        ],
        recitationParts: DHUHR_PRAYER_PARTS,
      },
      {
        id: "p-3",
        order: 3,
        title: "‘Asr (Late Afternoon Prayer)",
        arabicTitle: "صَلَاةُ العَصْر",
        arabic: "4 Sunnah + 4 Fard",
        transliteration: "4 Sunnah + 4 Fard Rak‘aat (Sirri / Silent)",
        translation: "Pray 4 Fard rak‘aat in late afternoon — same structure as Dhuhr. Guard the Middle Prayer!",
        visualCue: "Afternoon light — stay mindful before Maghrib and end of daytime.",
        posture: "standing",
        videoUrl: "https://youtu.be/4otBBs3sPcc",
        videoPhases: [
          { label: "Names of Namaz (Video A)", url: "https://youtu.be/4otBBs3sPcc" },
          { label: "Names of Namaz (Video B)", url: "https://youtu.be/7L4k-iP59IY" },
        ],
        recitationParts: ASR_PRAYER_PARTS,
      },
      {
        id: "p-4",
        order: 4,
        title: "Maghrib (Sunset Prayer)",
        arabicTitle: "صَلَاةُ المَغْرِب",
        arabic: "3 Fard + 2 Sunnah + 2 Nafl",
        transliteration: "3 Fard + 2 Sunnah + 2 Nafl (2 Jahri + 1 Sirri)",
        translation: "Pray 3 Fard rak‘aat immediately after sunset — Tashahhud after rakah 2, then 1 more rakah and final sitting.",
        visualCue: "Sunset glow — family gathers together to offer prayer without delay.",
        posture: "standing",
        videoUrl: "https://youtu.be/4otBBs3sPcc",
        videoPhases: [
          { label: "Names of Namaz (Video A)", url: "https://youtu.be/4otBBs3sPcc" },
          { label: "Names of Namaz (Video B)", url: "https://youtu.be/7L4k-iP59IY" },
        ],
        recitationParts: MAGHRIB_PRAYER_PARTS,
      },
      {
        id: "p-5",
        order: 5,
        title: "‘Ishaa & Witr (Night Prayer)",
        arabicTitle: "صَلَاةُ العِشَاء وَالوِتْر",
        arabic: "4 Sunnah + 4 Fard + 2 Sunnah + 2 Nafl + 3 Witr + 2 Nafl",
        transliteration: "4 Fard + 2 Sunnah + 3 Witr Wajib (with Dua al-Qunoot)",
        translation: "Pray 4 Fard and conclude the night with the sacred 3 Rak‘aat Witr including Dua al-Qunoot.",
        visualCue: "Night serenity — conclude the waking day in complete devotion to Allah.",
        posture: "standing",
        videoUrl: "https://youtu.be/4otBBs3sPcc",
        videoPhases: [
          { label: "Names of Namaz (Video A)", url: "https://youtu.be/4otBBs3sPcc" },
          { label: "Names of Namaz (Video B)", url: "https://youtu.be/7L4k-iP59IY" },
        ],
        recitationParts: ISHA_PRAYER_PARTS,
      },
    ],
  }),
  salah({
    id: "namaz-overview",
    title: "What is Namaz?",
    arabicTitle: "مَا هِيَ الصَّلَاة؟",
    summary: "Namaz is the daily prayer — standing before Allah with body, tongue, and heart.",
    childExplanation:
      "Namaz means prayer. We wash (wudu), face the Qiblah, stand calmly, and speak to Allah with special words and movements.",
    teacherTip:
      "Keep the first lesson conceptual: purpose, five daily prayers, and why we prepare with wudu.",
    parentTip: "Point out the prayer times at home so children see Namaz as a daily rhythm.",
    examples: [
      example("fajr", "صَلَاةُ الفَجْر", "Salat al-Fajr", "Dawn prayer"),
      example("dhuhr", "صَلَاةُ الظُّهْر", "Salat adh-Dhuhr", "Midday prayer"),
      example("asr", "صَلَاةُ العَصْر", "Salat al-‘Asr", "Afternoon prayer"),
      example("maghrib", "صَلَاةُ المَغْرِب", "Salat al-Maghrib", "Sunset prayer"),
      example("isha", "صَلَاةُ العِشَاء", "Salat al-‘Ishaa", "Night prayer"),
    ],
    steps: [
      {
        id: "ov-1",
        order: 1,
        title: "Prepare with Wudu",
        translation: "Clean yourself with wudu before standing for prayer.",
        visualCue: "Wash face, arms, head, and feet carefully.",
        posture: "wudu-face",
        teacherNote: "Wudu comes before every salah when needed.",
      },
      {
        id: "ov-2",
        order: 2,
        title: "Face the Qiblah",
        translation: "Stand facing the direction of the Ka‘bah in Makkah.",
        visualCue: "Body upright, feet steady, eyes soft.",
        posture: "standing",
      },
      {
        id: "ov-3",
        order: 3,
        title: "Make Intention (Niyyah)",
        translation: "Intend in your heart which prayer you are about to pray.",
        visualCue: "Calm heart — intention does not need to be spoken aloud.",
        posture: "standing",
      },
      {
        id: "ov-4",
        order: 4,
        title: "Begin with Takbir",
        arabic: "اللّٰهُ أَكْبَرُ",
        transliteration: "Allahu Akbar",
        translation: "Allah is the Greatest — raise the hands and start the prayer.",
        visualCue: "Hands raised near the ears or shoulders, then fold.",
        posture: "takbir",
      },
    ],
  }),
  salah({
    id: "namaz-wudu",
    title: "How to Make Wudu",
    arabicTitle: "كَيْفِيَّةُ الوُضُوء",
    summary: "Learn each step of wudu with clear English guidance and a full cartoon poem song.",
    childExplanation:
      "Wudu is washing before prayer. We wash in order, calmly, without wasting water. Watch the fun cartoon poem video to learn every step!",
    teacherTip: "Demonstrate once fully or play the cartoon poem video together, then let the child mime each step while you narrate.",
    parentTip: "Watch the cartoon wudu poem together, then practise at the sink with real water when the child is ready.",
    videoUrl: "https://youtu.be/Td-w2OnRaUc",
    videoTitle: "Full Wudu Cartoon Poem for Kids",
    videoDescription: "Complete cartoonic rhyme and song teaching children the step-by-step method of Wudu in a fun, memorable way.",
    examples: [
      example("wudu-niyyah", "نِيَّةُ الوُضُوء", "Niyyat al-wudu", "Intention for wudu in the heart"),
      example("wudu-bismillah", "بِسْمِ اللّٰهِ", "Bismillah", "Begin wudu in the name of Allah"),
    ],
    steps: [
      {
        id: "w-1",
        order: 1,
        title: "Intention & Bismillah",
        arabic: "بِسْمِ اللّٰهِ",
        transliteration: "Bismillah",
        translation: "Intend wudu in your heart and begin in the name of Allah.",
        visualCue: "Stand at the sink, calm and focused.",
        posture: "overview",
        videoUrl: "https://youtu.be/Td-w2OnRaUc",
        videoPhases: [
          { label: "Complete Cartoon Wudu Poem (Full Video)", url: "https://youtu.be/Td-w2OnRaUc" },
          { label: "Step 1 Action Guide", url: "https://youtu.be/gAcJkcJp57w" },
        ],
      },
      {
        id: "w-2",
        order: 2,
        title: "Wash the Hands",
        translation: "Wash both hands up to the wrists three times.",
        visualCue: "Rub between the fingers carefully.",
        posture: "wudu-hands",
        videoUrl: "https://youtu.be/JijX162m3pA",
      },
      {
        id: "w-3",
        order: 3,
        title: "Rinse the Mouth",
        translation: "Take water into the mouth and rinse three times.",
        visualCue: "Swish gently, then spit out.",
        posture: "wudu-mouth",
        videoUrl: "https://youtu.be/4YUUY2maD8s",
      },
      {
        id: "w-4",
        order: 4,
        title: "Clean the Nose",
        translation: "Sniff water lightly into the nose and blow it out three times.",
        visualCue: "Be gentle — especially with young children.",
        posture: "wudu-nose",
        videoUrl: "https://youtu.be/BsLPt8UFjwE",
      },
      {
        id: "w-5",
        order: 5,
        title: "Wash the Face",
        translation: "Wash the whole face from forehead to chin and ear to ear three times.",
        visualCue: "Cover the full face evenly.",
        posture: "wudu-face",
        videoUrl: "https://youtu.be/2cmcBbOcEAQ",
      },
      {
        id: "w-6",
        order: 6,
        title: "Wash the Arms",
        translation: "Wash the right arm to the elbow three times, then the left arm.",
        visualCue: "Include the elbows fully.",
        posture: "wudu-arms",
        videoUrl: "https://youtu.be/EGOCKQe72H4",
        videoPhases: [
          { label: "Phase 6a (Right Arm)", url: "https://youtu.be/EGOCKQe72H4" },
          { label: "Phase 6b (Left Arm)", url: "https://youtu.be/MwDWrRo6Qks" },
        ],
      },
      {
        id: "w-7",
        order: 7,
        title: "Wipe the Head",
        translation: "Wipe the head with wet hands once from front to back.",
        visualCue: "Light wipe — do not scrub hard.",
        posture: "wudu-head",
        videoUrl: "https://youtu.be/ByJo1A4Cbs8",
      },
      {
        id: "w-8",
        order: 8,
        title: "Wipe the Ears",
        translation: "Wipe the inside and outside of both ears with wet fingers.",
        visualCue: "Index finger inside, thumb outside.",
        posture: "wudu-ears",
        videoUrl: "https://youtu.be/PKEEf3rS5-8",
      },
      {
        id: "w-9",
        order: 9,
        title: "Wash the Feet",
        translation: "Wash the right foot to the ankle three times, then the left foot. Include between the toes.",
        visualCue: "Ankles must be washed too.",
        posture: "wudu-feet",
        videoUrl: "https://youtu.be/YgMpxhc-C0U",
      },
      {
        id: "w-10",
        order: 10,
        title: "Dua After Wudu",
        arabic: "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
        transliteration:
          "Ashhadu an laa ilaaha illallahu wahdahu laa shareeka lah, wa ashhadu anna Muhammadan ‘abduhu wa rasooluh",
        translation:
          "I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad is His servant and Messenger.",
        visualCue: "Face forward, recite clearly after finishing wudu.",
        posture: "standing",
        teacherNote: "Optional short ending many families also teach: Allahumma ij‘alnee minat-tawwaabeen…",
      },
    ],
  }),
  salah({
    id: "namaz-rakah-steps",
    title: "One Rakah — Step by Step",
    arabicTitle: "أَرْكَانُ الرَّكْعَة",
    summary: "Learn one complete unit of prayer with Arabic, transliteration, and English.",
    childExplanation:
      "A rakah is one set of prayer movements. We stand, bow, stand again, prostrate, sit, and prostrate again.",
    teacherTip: "Move slowly. Freeze at each posture so the child can copy the body shape.",
    parentTip: "Practise one rakah barefoot on a prayer mat at home.",
    examples: [
      example("takbir", "اللّٰهُ أَكْبَرُ", "Allahu Akbar", "Allah is the Greatest"),
      example("fatiha-label", "سُورَةُ الفَاتِحَة", "Surat al-Fatihah", "The Opening — recited while standing"),
    ],
    steps: [
      {
        id: "r-1",
        order: 1,
        title: "Takbiratul Ihram",
        arabicTitle: "تَكْبِيرَةُ الإِحْرَام",
        arabic: "اللّٰهُ أَكْبَرُ",
        transliteration: "Allahu Akbar",
        translation: "Allah is the Greatest. Raise both hands and begin the prayer.",
        visualCue: "Hands raised, then placed on the chest or below the navel (per family madhhab).",
        posture: "takbir",
      },
      {
        id: "r-2",
        order: 2,
        title: "Standing Recitation (Qiyam)",
        arabicTitle: "القِيَام",
        arabic: "سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَىٰ جَدُّكَ وَلَا إِلٰهَ غَيْرُكَ · بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ · الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ۝ آمِين",
        transliteration: "Subhaanak-Allaahumma wa bihamdika wa tabaarakasmuka wa ta‘aalaa jadduka wa laa ilaaha ghayruk · Bismillaahir-Rahmaanir-Raheem · Alhamdu lillaahi Rabbil-‘aalameen. Ar-Rahmaanir-Raheem. Maaliki Yawmid-Deen. Iyyaaka na‘budu wa iyyaaka nasta‘een. Ihdinas-siraatal-mustaqeem. Siraatal-ladheena an‘amta ‘alayhim ghayril-maghdoobi ‘alayhim walad-daalleen. Aameen.",
        translation: "Glory be to You, O Allah, and all praise is Yours; blessed is Your Name, exalted is Your Majesty, and there is no god besides You. In the name of Allah, the Most Gracious, the Most Merciful. All praise is for Allah, Lord of all the worlds...",
        visualCue: "Right hand over left hand on the chest, gaze humbly on the prayer rug.",
        posture: "standing",
        teacherNote: "Teach the child in parts: first Thana, then Ta'awwuz and Tasmiyah, then full Surat al-Fatihah, and finally a short surah like Al-Ikhlas.",
        recitationParts: [
          {
            title: "1. Thana (Opening Praise)",
            arabic: "سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَىٰ جَدُّكَ، وَلَا إِلٰهَ غَيْرُكَ",
            transliteration: "Subhaanak-Allaahumma wa bihamdika, wa tabaarakasmuka, wa ta‘aalaa jadduka, wa laa ilaaha ghayruk.",
            translation: "Glory be to You, O Allah, and all praise is Yours. Blessed is Your Name, exalted is Your Majesty, and there is no deity worthy of worship besides You.",
            instruction: "Recited quietly immediately after raising hands and folding them on the chest.",
          },
          {
            title: "2. Ta'awwuz & Tasmiyah",
            arabic: "أَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيمِ · بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ",
            transliteration: "A‘oodhu billaahi minash-shaytaanir-rajeem · Bismillaahir-Rahmaanir-Raheem",
            translation: "I seek refuge in Allah from Satan the outcast. · In the name of Allah, the Most Gracious, the Most Merciful.",
            instruction: "Whispered quietly before beginning the recitation of the Holy Quran.",
          },
          {
            title: "3. Surat al-Fatihah (Complete 7 Verses)",
            arabic: "الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ۝ آمِين",
            transliteration: "Alhamdu lillaahi Rabbil-‘aalameen ۝ Ar-Rahmaanir-Raheem ۝ Maaliki Yawmid-Deen ۝ Iyyaaka na‘budu wa iyyaaka nasta‘een ۝ Ihdinas-siraatal-mustaqeem ۝ Siraatal-ladheena an‘amta ‘alayhim, ghayril-maghdoobi ‘alayhim walad-daalleen ۝ Aameen.",
            translation: "All praise is for Allah, Lord of all the worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us to the straight path: the path of those whom You have blessed, not of those who earned Your anger, nor of those who are astray. Aameen.",
            instruction: "An essential pillar of every Rakah — recited standing in Qiyam.",
          },
          {
            title: "4. Short Surah — Surat al-Ikhlas",
            arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ ۝ قُلْ هُوَ اللّٰهُ أَحَدٌ ۝ اللّٰهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ۝",
            transliteration: "Bismillaahir-Rahmaanir-Raheem ۝ Qul Huwallahu Ahad ۝ Allahus-Samad ۝ Lam yalid wa lam yoolad ۝ Wa lam yakul-lahu kufuwan ahad ۝",
            translation: "In the name of Allah, the Most Gracious, the Most Merciful. Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, and there is none comparable unto Him.",
            instruction: "Recited after Surat al-Fatihah in the first two Rakahs.",
          },
        ],
      },
      {
        id: "r-3",
        order: 3,
        title: "Ruku (Bowing)",
        arabicTitle: "الرُّكُوع",
        arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
        transliteration: "Subhaana Rabbiyal-‘Azeem",
        translation: "Glory be to my Lord, the Magnificent. (Usually said three times.)",
        visualCue: "Back straight, hands on knees, head aligned with the back.",
        posture: "bowing",
      },
      {
        id: "r-4",
        order: 4,
        title: "Rising from Ruku",
        arabicTitle: "الرَّفْعُ مِنَ الرُّكُوع",
        arabic: "سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ · رَبَّنَا وَلَكَ الْحَمْدُ",
        transliteration: "Sami‘allahu liman hamidah · Rabbanaa wa lakal-hamd",
        translation: "Allah hears the one who praises Him. Our Lord, and to You is all praise.",
        visualCue: "Stand upright again with calm balance.",
        posture: "rising",
      },
      {
        id: "r-5",
        order: 5,
        title: "First Sujood",
        arabicTitle: "السُّجُود",
        arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
        transliteration: "Subhaana Rabbiyal-A‘laa",
        translation: "Glory be to my Lord, the Most High. (Usually said three times.)",
        visualCue: "Forehead, nose, palms, knees, and toes on the ground.",
        posture: "prostration",
      },
      {
        id: "r-6",
        order: 6,
        title: "Sitting Between Sujood",
        arabicTitle: "الجُلُوسُ بَيْنَ السَّجْدَتَيْن",
        arabic: "رَبِّ اغْفِرْ لِي",
        transliteration: "Rabbighfir lee",
        translation: "My Lord, forgive me.",
        visualCue: "Sit calmly on the legs between the two prostrations.",
        posture: "sitting",
      },
      {
        id: "r-7",
        order: 7,
        title: "Second Sujood",
        arabicTitle: "السَّجْدَةُ الثَّانِيَة",
        arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
        transliteration: "Subhaana Rabbiyal-A‘laa",
        translation: "Glory be to my Lord, the Most High. Complete the second prostration.",
        visualCue: "Same posture as the first sujood.",
        posture: "prostration",
      },
    ],
  }),
  salah({
    id: "namaz-tashahhud-salam",
    title: "Tashahhud & Ending Salam",
    arabicTitle: "التَّشَهُّدُ وَالتَّسْلِيم",
    summary: "Learn the sitting testimony and how to end the prayer with salam.",
    childExplanation:
      "Near the end of prayer we sit, say the Tashahhud, send salawat on the Prophet ﷺ, then turn the head for salam.",
    teacherTip: "Separate the sitting words from the final salam so children do not rush the ending.",
    parentTip: "Practise the head turns slowly left and right with a smile.",
    examples: [
      example(
        "tashahhud-short",
        "التَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ",
        "At-tahiyyaatu lillahi was-salawaatu wat-tayyibaat",
        "All greetings, prayers, and pure words are for Allah",
      ),
      example("salam", "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ", "Assalamu alaikum wa rahmatullah", "Peace be upon you and the mercy of Allah"),
    ],
    steps: [
      {
        id: "t-1",
        order: 1,
        title: "Sit for Tashahhud",
        arabicTitle: "الجُلُوس",
        translation: "Sit calmly after completing the required rak‘aat.",
        visualCue: "Back upright, hands on thighs, gaze soft.",
        posture: "sitting",
        recitationParts: [
          {
            title: "1. Posture in Qa‘dah (Calm Sitting)",
            arabic: "اللّٰهُ أَكْبَرُ",
            transliteration: "Allahu Akbar",
            translation: "Allah is Greatest — rise from Sujood to sit for Tashahhud.",
            instruction: "Sit with back straight, hands flat upon thighs near the knees, and eyes softly lowered.",
          },
        ],
      },
      {
        id: "t-2",
        order: 2,
        title: "Recite Tashahhud",
        arabicTitle: "التَّشَهُّد",
        arabic:
          "التَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللّٰهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
        transliteration:
          "At-tahiyyaatu lillahi was-salawaatu wat-tayyibaat. As-salaamu ‘alayka ayyuhan-nabiyyu wa rahmatullahi wa barakaatuh. As-salaamu ‘alaynaa wa ‘alaa ‘ibaadillahis-saaliheen. Ashhadu an laa ilaaha illallah, wa ashhadu anna Muhammadan ‘abduhu wa rasooluh.",
        translation:
          "All greetings, prayers, and pure words are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger.",
        visualCue: "Raise the index finger gently during the shahadah as taught in your school.",
        posture: "sitting",
        recitationParts: TASHAHHUD_RECITATION_PARTS,
      },
      {
        id: "t-3",
        order: 3,
        title: "Salawat on the Prophet ﷺ",
        arabicTitle: "الصَّلَاةُ عَلَى النَّبِيِّ",
        arabic:
          "اللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
        transliteration:
          "Allahumma salli ‘alaa Muhammadin wa ‘alaa aali Muhammad, kamaa sallayta ‘alaa Ibraaheema wa ‘alaa aali Ibraaheem, innaka hameedun majeed.",
        translation:
          "O Allah, send prayers upon Muhammad and upon the family of Muhammad, as You sent prayers upon Ibrahim and upon the family of Ibrahim. Indeed You are Praiseworthy, Glorious.",
        visualCue: "Lower the finger back down; remain seated with hands resting flat on thighs.",
        posture: "sitting",
        recitationParts: DUROOD_RECITATION_PARTS,
      },
      {
        id: "t-4",
        order: 4,
        title: "Ending Salam (Right)",
        arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ",
        transliteration: "Assalamu alaikum wa rahmatullah",
        translation: "Peace be upon you and the mercy of Allah — turn the head to the right.",
        visualCue: "Turn face to the right shoulder.",
        posture: "salam",
        recitationParts: SALAM_RIGHT_PARTS,
      },
      {
        id: "t-5",
        order: 5,
        title: "Ending Salam (Left)",
        arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ",
        transliteration: "Assalamu alaikum wa rahmatullah",
        translation: "Peace be upon you and the mercy of Allah — turn the head to the left. The prayer is complete.",
        visualCue: "Turn face to the left shoulder.",
        posture: "salam",
        recitationParts: SALAM_LEFT_PARTS,
      },
    ],
  }),
];

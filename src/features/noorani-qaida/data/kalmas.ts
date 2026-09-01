import type { InteractiveExample, TopicLesson } from "../types";

const pending = "pending-qari-review" as const;

function kalima(
  order: number,
  id: string,
  title: string,
  arabicTitle: string,
  arabic: string,
  transliteration: string,
  meaning: string,
  summary: string,
): TopicLesson {
  const example: InteractiveExample = {
    id: `${id}-recitation`,
    arabic,
    transliteration,
    meaning,
    audioKey: `example-${id}`,
  };

  return {
    id,
    moduleId: "kalmas",
    kind: "kalima",
    title,
    arabicTitle,
    summary,
    childExplanation: `${title} is Kalima number ${order}. Listen carefully, follow the Arabic from right to left, and learn its English meaning.`,
    teacherTip: "Teach one short phrase at a time. Check pronunciation before joining the complete Kalima.",
    parentTip: "Use short daily listen-and-repeat practice. Review the English meaning so memorisation stays connected to understanding.",
    writingHint: "Read the Arabic from right to left, then use the transliteration only as a learning aid.",
    audioKey: `lesson-${id}`,
    reviewStatus: pending,
    examples: [example],
  };
}

/**
 * The numbered Six Kalimas are a widely used teaching arrangement.
 * Their phrases come from Islamic declarations and remembrance; the numbering
 * itself is a traditional curriculum convention rather than one hadith list.
 */
export const KALMA_LESSONS: TopicLesson[] = [
  kalima(
    1,
    "kalima-tayyabah",
    "First Kalima — Tayyabah",
    "الكَلِمَةُ الطَّيِّبَة",
    "لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَّسُوْلُ اللّٰهِ",
    "Laa ilaaha illa-llaahu, Muhammadur-rasoolu-llaah.",
    "There is none worthy of worship except Allah, and Muhammad ﷺ is the Messenger of Allah.",
    "The Word of Purity — a clear declaration of faith in Allah and His Messenger ﷺ.",
  ),
  kalima(
    2,
    "kalima-shahadat",
    "Second Kalima — Shahadat",
    "كَلِمَةُ الشَّهَادَة",
    "أَشْهَدُ أَنْ لَّا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهٗ لَا شَرِيْكَ لَهٗ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهٗ وَرَسُوْلُهٗ",
    "Ash-hadu an laa ilaaha illa-llaahu wahdahu laa shareeka lah, wa ash-hadu anna Muhammadan abduhu wa rasooluh.",
    "I bear witness that there is none worthy of worship except Allah, alone, without any partner, and I bear witness that Muhammad ﷺ is His servant and Messenger.",
    "The Word of Testimony — bearing witness to Allah's oneness and the message of Muhammad ﷺ.",
  ),
  kalima(
    3,
    "kalima-tamjeed",
    "Third Kalima — Tamjeed",
    "كَلِمَةُ التَّمْجِيد",
    "سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيْمِ",
    "Subhaana-llaahi wal-hamdu lillaahi wa laa ilaaha illa-llaahu wa-llaahu akbar, wa laa hawla wa laa quwwata illa billaahil-aliyyil-azeem.",
    "Glory be to Allah, and all praise is for Allah, and there is none worthy of worship except Allah, and Allah is the Greatest. There is no might nor power except with Allah, the Most High, the Most Great.",
    "The Word of Glorification — praising Allah with the greatest words of remembrance.",
  ),
  kalima(
    4,
    "kalima-tawheed",
    "Fourth Kalima — Tawheed",
    "كَلِمَةُ التَّوْحِيد",
    "لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهٗ لَا شَرِيْكَ لَهٗ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِيْ وَيُمِيْتُ وَهُوَ حَيٌّ لَّا يَمُوْتُ أَبَدًا أَبَدًا ذُو الْجَلَالِ وَالْإِكْرَامِ بِيَدِهِ الْخَيْرُ وَهُوَ عَلٰى كُلِّ شَيْءٍ قَدِيْرٌ",
    "Laa ilaaha illa-llaahu wahdahu laa shareeka lah, lahul-mulku wa lahul-hamdu yuhyee wa yumeetu wa huwa hayyun laa yamootu abadan abada, dhul-jalaali wal-ikraam, biyadihil-khayr, wa huwa alaa kulli shay-in qadeer.",
    "There is none worthy of worship except Allah, alone, without partner. His is the kingdom and His is all praise. He gives life and causes death. He is Ever-Living and will never die. Owner of Majesty and Honour. In His hand is all good, and He has power over all things.",
    "The Word of Oneness — affirming Allah's complete authority, life, majesty, and power.",
  ),
  kalima(
    5,
    "kalima-istighfar",
    "Fifth Kalima — Istighfar",
    "كَلِمَةُ الِاسْتِغْفَار",
    "أَسْتَغْفِرُ اللّٰهَ رَبِّيْ مِنْ كُلِّ ذَنْبٍ أَذْنَبْتُهٗ عَمَدًا أَوْ خَطَأً سِرًّا أَوْ عَلَانِيَةً وَأَتُوْبُ إِلَيْهِ مِنَ الذَّنْبِ الَّذِيْ أَعْلَمُ وَمِنَ الذَّنْبِ الَّذِيْ لَا أَعْلَمُ إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوْبِ وَسَتَّارُ الْعُيُوْبِ وَغَفَّارُ الذُّنُوْبِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيْمِ",
    "Astaghfiru-llaaha rabbee min kulli dhambin adhnabtuhu amadan aw khata-an sirran aw alaaniyatan wa atoobu ilayhi minadh-dhambil-ladhee a'lamu wa minadh-dhambil-ladhee laa a'lam, innaka anta allaamul-ghuyoobi wa sattaarul-uyoobi wa ghaffaarudh-dhunoobi wa laa hawla wa laa quwwata illa billaahil-aliyyil-azeem.",
    "I seek forgiveness from Allah, my Lord, for every sin I committed knowingly or unknowingly, secretly or openly, and I turn to Him in repentance from the sin I know and the sin I do not know. Indeed You are the Knower of the unseen, the Concealer of faults, and the Forgiver of sins. There is no might nor power except with Allah, the Most High, the Most Great.",
    "The Word of Seeking Forgiveness — returning to Allah for every known and unknown mistake.",
  ),
  kalima(
    6,
    "kalima-radd-e-kufr",
    "Sixth Kalima — Radd-e-Kufr",
    "كَلِمَةُ رَدِّ الكُفْر",
    "اَللّٰهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَّأَنَا أَعْلَمُ بِهٖ وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ بِهٖ تُبْتُ عَنْهُ وَتَبَرَّأْتُ مِنَ الْكُفْرِ وَالشِّرْكِ وَالْكِذْبِ وَالْغِيْبَةِ وَالْبِدْعَةِ وَالنَّمِيْمَةِ وَالْفَوَاحِشِ وَالْبُهْتَانِ وَالْمَعَاصِيْ كُلِّهَا وَأَسْلَمْتُ وَأَقُوْلُ لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَّسُوْلُ اللّٰهِ",
    "Allaahumma innee a'oodhu bika min an ushrika bika shay-an wa ana a'lamu bihi wa astaghfiruka limaa laa a'lamu bihi tubtu anhu wa tabarra'tu minal-kufri wash-shirki wal-kidhbi wal-gheebati wal-bid'ati wan-nameemati wal-fawaahishi wal-buhtaani wal-ma'aasee kulliha wa aslamtu wa aqoolu laa ilaaha illa-llaahu Muhammadur-rasoolu-llaah.",
    "O Allah, I seek refuge in You from knowingly associating any partner with You, and I seek Your forgiveness for what I do not know of it. I repent from it, and I dissociate from disbelief, polytheism, lying, backbiting, innovation, tale-telling, indecency, slander and all acts of disobedience. I submit to You, and I say: there is none worthy of worship except Allah, and Muhammad ﷺ is the Messenger of Allah.",
    "The Word of Rejecting Disbelief — seeking Allah's protection and reaffirming sincere faith.",
  ),
];

export interface CharacterAngle360 {
  degree: number;
  label: string;
  image: string;
}

export interface SalahStepVisualDetail {
  image: string;
  focusTitle: string;
  focusPoints: string[];
  reminder: string;
  sunnahNote: string;
  postureBadge?: string;
  angles360?: CharacterAngle360[];
}

export const WUDU_STEP_DETAILS: Record<string, SalahStepVisualDetail> = {
  "w-1": {
    image: "/wudu/step-1.jpg",
    focusTitle: "Intention & Starting Clean",
    postureBadge: "Step 1 of 10 · Wudu",
    angles360: [
      { degree: 45, label: "Angle Right (45°)", image: "/wudu/step-1.jpg" },
      { degree: 315, label: "Angle Left (315°)", image: "/wudu/step-1-left.jpg" },
    ],
    focusPoints: [
      "Intend wudu purely for Allah in the heart",
      "Say 'Bismillah' before touching the water",
      "Stand calm, mindful, and focused at the sink",
    ],
    reminder: "Niyyah resides in the heart. Calmness brings barakah to your prayer.",
    sunnahNote: "Start every good deed with the remembrance of Allah.",
  },
  "w-2": {
    image: "/wudu/step-2.jpg",
    focusTitle: "Washing Hands & Wrists",
    postureBadge: "Step 2 of 10 · Wudu",
    angles360: [
      { degree: 45, label: "Angle Right (45°)", image: "/wudu/step-2.jpg" },
      { degree: 315, label: "Angle Left (315°)", image: "/wudu/step-2-left.jpg" },
    ],
    focusPoints: [
      "Wash both hands up to the wrists 3 times",
      "Interlace fingers (Khilal) to clean between them",
      "Always start with the right hand first",
    ],
    reminder: "Ensure water reaches the skin under rings and all the way to the wrists.",
    sunnahNote: "Rubbing between the fingers ensures complete cleanliness.",
  },
  "w-3": {
    image: "/wudu/step-3.jpg",
    focusTitle: "Rinsing the Mouth (Madmadah)",
    postureBadge: "Step 3 of 10 · Wudu",
    angles360: [
      { degree: 45, label: "Angle Right (45°)", image: "/wudu/step-3.jpg" },
      { degree: 315, label: "Angle Left (315°)", image: "/wudu/step-3-left.jpg" },
    ],
    focusPoints: [
      "Take a handful of water using the right hand",
      "Swish water thoroughly inside the mouth 3 times",
      "Spit it out gently without splashing",
    ],
    reminder: "Swish thoroughly to cleanse the mouth; do not swallow the water.",
    sunnahNote: "Using a Miswak before or during this step is a beloved Sunnah.",
  },
  "w-4": {
    image: "/wudu/step-4.jpg",
    focusTitle: "Cleaning the Nose (Istinshaq)",
    postureBadge: "Step 4 of 10 · Wudu",
    angles360: [
      { degree: 45, label: "Angle Right (45°)", image: "/wudu/step-4.jpg" },
      { degree: 315, label: "Angle Left (315°)", image: "/wudu/step-4-left.jpg" },
    ],
    focusPoints: [
      "Sniff water gently into the nostrils with right hand",
      "Blow out and expel water using the left hand",
      "Repeat 3 times gently without forcing",
    ],
    reminder: "Be gentle with young children so water does not sting the nostrils.",
    sunnahNote: "Expelling the water with the left hand is Sunnah etiquette.",
  },
  "w-5": {
    image: "/wudu/step-5.jpg",
    focusTitle: "Washing the Face (Ghasl al-Wajh)",
    postureBadge: "Step 5 of 10 · Wudu",
    angles360: [
      { degree: 45, label: "Angle Right (45°)", image: "/wudu/step-5.jpg" },
      { degree: 315, label: "Angle Left (315°)", image: "/wudu/step-5-left.jpg" },
    ],
    focusPoints: [
      "From normal hairline at forehead down to chin",
      "From the lobe of one ear to the other",
      "Wash 3 times with both hands cupping water",
    ],
    reminder: "Ensure no dry spots are left near the temples, eyebrows, or jawline.",
    sunnahNote: "Run wet fingers through the beard (Khilal) if applicable.",
  },
  "w-6": {
    image: "/wudu/step-6.jpg",
    focusTitle: "Washing the Arms & Elbows",
    postureBadge: "Step 6 of 10 · Wudu",
    angles360: [
      { degree: 45, label: "Angle Right (45°)", image: "/wudu/step-6.jpg" },
      { degree: 315, label: "Angle Left (315°)", image: "/wudu/step-6-left.jpg" },
    ],
    focusPoints: [
      "Right arm first from fingertips past the elbow 3 times",
      "Then left arm from fingertips past the elbow 3 times",
      "Thoroughly wet the back of the elbow joint",
    ],
    reminder: "The elbow is the most common place where water is accidentally missed.",
    sunnahNote: "Wash slightly beyond the elbow to increase radiant light on Yawm al-Qiyamah.",
  },
  "w-7": {
    image: "/wudu/step-7.jpg",
    focusTitle: "Wiping the Head (Masah)",
    postureBadge: "Step 7 of 10 · Wudu",
    angles360: [
      { degree: 45, label: "Angle Right (45°)", image: "/wudu/step-7.jpg" },
      { degree: 315, label: "Angle Left (315°)", image: "/wudu/step-7-left.jpg" },
    ],
    focusPoints: [
      "Wet both hands with fresh water",
      "Wipe from the front hairline back to the nape",
      "Return hands forward to the front (once only)",
    ],
    reminder: "Masah is a gentle wipe, not a vigorous wash or scrubbing.",
    sunnahNote: "Wiping the head is done only ONCE in the Sunnah.",
  },
  "w-8": {
    image: "/wudu/step-8.jpg",
    focusTitle: "Wiping the Ears",
    postureBadge: "Step 8 of 10 · Wudu",
    angles360: [
      { degree: 45, label: "Angle Right (45°)", image: "/wudu/step-8.jpg" },
      { degree: 315, label: "Angle Left (315°)", image: "/wudu/step-8-left.jpg" },
    ],
    focusPoints: [
      "Insert the tip of wet index fingers inside the ears",
      "Wipe behind the ears with the pads of the thumbs",
      "Wipe both ears at the same time",
    ],
    reminder: "Use the same moisture from the head wipe or moisten fingers lightly.",
    sunnahNote: "The Prophet ﷺ said: 'The ears are part of the head.'",
  },
  "w-9": {
    image: "/wudu/step-9.jpg",
    focusTitle: "Washing the Feet & Ankles",
    postureBadge: "Step 9 of 10 · Wudu",
    angles360: [
      { degree: 45, label: "Angle Right (45°)", image: "/wudu/step-9.jpg" },
      { degree: 315, label: "Angle Left (315°)", image: "/wudu/step-9-left.jpg" },
    ],
    focusPoints: [
      "Right foot first up to & including ankles 3 times",
      "Then left foot up to & including ankles 3 times",
      "Pass little finger between toes and rub heels",
    ],
    reminder: "Pay special attention to the back of the heels and Achilles tendon.",
    sunnahNote: "The Prophet ﷺ emphasized: 'Woe to the dry heels from the Fire!'",
  },
  "w-10": {
    image: "/wudu/step-10.jpg",
    focusTitle: "Dua After Completing Wudu",
    postureBadge: "Step 10 of 10 · Wudu",
    angles360: [
      { degree: 45, label: "Angle Right (45°)", image: "/wudu/step-10.jpg" },
      { degree: 315, label: "Angle Left (315°)", image: "/wudu/step-10-left.jpg" },
    ],
    focusPoints: [
      "Look upwards with humility and sincerity",
      "Recite the Kalimah Shahadah clearly",
      "Ask Allah to make you among the purified (Tawwabeen)",
    ],
    reminder: "Saying this Dua opens the 8 gates of Jannah to enter from whichever one wishes.",
    sunnahNote: "Say: Ashhadu an laa ilaaha illallahu wahdahu laa shareeka lah...",
  },
};

// ---------------------------------------------------------------------------
// Reusable 360° Multi-Angle Turntable Presets (Pixar 3D Multi-Angle Views)
// ---------------------------------------------------------------------------
export const TAKBIR_ANGLES_360: CharacterAngle360[] = [
  { degree: 0, label: "Front View (0°)", image: "/namaz/takbir-0.jpg" },
  { degree: 45, label: "Front-Right (45°)", image: "/namaz/takbir-45.jpg" },
  { degree: 180, label: "Back View (180°)", image: "/namaz/takbir-180.jpg" },
  { degree: 315, label: "Front-Left (315°)", image: "/namaz/takbir-315.jpg" },
];

export const QIYAM_ANGLES_360: CharacterAngle360[] = [
  { degree: 0, label: "Front View (0°)", image: "/namaz/qiyam-0.jpg" },
  { degree: 45, label: "Front-Right (45°)", image: "/namaz/qiyam-45.jpg" },
  { degree: 90, label: "Side Right (90°)", image: "/namaz/qiyam-90.jpg" },
  { degree: 180, label: "Back View (180°)", image: "/namaz/qiyam-180.jpg" },
  { degree: 270, label: "Side Left (270°)", image: "/namaz/qiyam-270.jpg" },
  { degree: 315, label: "Front-Left (315°)", image: "/namaz/qiyam-315.jpg" },
];

export const RUKU_ANGLES_360: CharacterAngle360[] = [
  { degree: 0, label: "Front View (0°)", image: "/namaz/ruku-0.jpg" },
  { degree: 90, label: "Side Right (90°)", image: "/namaz/ruku-90.jpg" },
  { degree: 270, label: "Side Left (270°)", image: "/namaz/ruku-270.jpg" },
];

export const QAUMAH_ANGLES_360: CharacterAngle360[] = [
  { degree: 45, label: "Front-Right (45°)", image: "/namaz/step-4-qaumah.jpg" },
  { degree: 180, label: "Back View (180°)", image: "/namaz/qiyam-180.jpg" },
  { degree: 315, label: "Front-Left (315°)", image: "/namaz/qaumah-left.jpg" },
];

export const SUJOOD_ANGLES_360: CharacterAngle360[] = [
  { degree: 90, label: "Side Right (90°)", image: "/namaz/step-5-sujood.jpg" },
  { degree: 270, label: "Side Left (270°)", image: "/namaz/sujood-left.jpg" },
];

export const JALSA_ANGLES_360: CharacterAngle360[] = [
  { degree: 45, label: "Front-Right (45°)", image: "/namaz/step-6-jalsa.jpg" },
  { degree: 315, label: "Front-Left (315°)", image: "/namaz/jalsa-left.jpg" },
];

export const TASHAHHUD_ANGLES_360: CharacterAngle360[] = [
  { degree: 45, label: "Front-Right (45°)", image: "/namaz/step-8-tashahhud.jpg" },
  { degree: 315, label: "Front-Left (315°)", image: "/namaz/tashahhud-left.jpg" },
];

export const TASLIM_RIGHT_ANGLES_360: CharacterAngle360[] = [
  { degree: 45, label: "Salam Right (45°)", image: "/namaz/step-9-taslim.jpg" },
  { degree: 315, label: "Salam Left (315°)", image: "/namaz/taslim-left.jpg" },
];

export const TASLIM_LEFT_ANGLES_360: CharacterAngle360[] = [
  { degree: 315, label: "Salam Left (315°)", image: "/namaz/taslim-left.jpg" },
  { degree: 45, label: "Salam Right (45°)", image: "/namaz/step-9-taslim.jpg" },
];

export const NAMAZ_STEP_DETAILS: Record<string, SalahStepVisualDetail> = {
  // One Rakah Steps
  "r-1": {
    image: "/namaz/step-1-takbir.jpg",
    focusTitle: "Takbiratul Ihram — Opening the Prayer",
    postureBadge: "Step 1 of 7 · Takbir",
    angles360: TAKBIR_ANGLES_360,
    focusPoints: [
      "Raise both hands level with the earlobes or shoulders",
      "Keep fingers naturally relaxed with palms facing Qiblah",
      "Say 'Allahu Akbar' with a humble, still heart to enter prayer",
    ],
    reminder: "Once Takbir is said, your sacred meeting with Allah begins. Leave all worldly thoughts behind.",
    sunnahNote: "Raising the hands at the opening Takbir was continuously practised by Rasulullah ﷺ.",
  },
  "r-2": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Qiyam — Standing in Sincere Recitation",
    postureBadge: "Step 2 of 7 · Qiyam",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Place right hand over the left wrist and forearm upon the chest",
      "Fix your humble gaze directly at the place of Sujood on the prayer rug",
      "Recite Surat al-Fatihah clearly, slowly, and without rushing",
    ],
    reminder: "Do not look around or up to the ceiling; maintain peaceful stillness and humility (Khushu').",
    sunnahNote: "Standing upright in Qiyam with Al-Fatihah is a foundational pillar of every Rakah.",
  },
  "r-3": {
    image: "/namaz/step-3-ruku.jpg",
    focusTitle: "Ruku — Bowing with Flat Straight Back",
    postureBadge: "Step 3 of 7 · Ruku",
    angles360: RUKU_ANGLES_360,
    focusPoints: [
      "Bow forward until your back is completely flat and level like a table",
      "Grasp both knees firmly with your fingers spread comfortably apart",
      "Recite 'Subhaana Rabbiyal-‘Azeem' three times with peaceful stillness",
    ],
    reminder: "Keep your head aligned in a straight line with your back — do not lift it up or drop it low.",
    sunnahNote: "The Prophet ﷺ had a back so level in Ruku that if water were placed upon it, it would not spill.",
  },
  "r-4": {
    image: "/namaz/step-4-qaumah.jpg",
    focusTitle: "Qaumah (I'tidal) — Standing Upright in Praise",
    postureBadge: "Step 4 of 7 · Qaumah",
    angles360: QAUMAH_ANGLES_360,
    focusPoints: [
      "Rise smoothly to a full, balanced standing posture with head raised",
      "Say: 'Sami‘allahu liman hamidah' as you rise from Ruku",
      "Say: 'Rabbanaa wa lakal-hamd' once fully upright and still",
    ],
    reminder: "Wait until every bone and joint settles into place before descending to Sujood.",
    sunnahNote: "Rasulullah ﷺ said Allah does not look at the prayer of one who does not straighten his spine between bowing and prostrating.",
  },
  "r-5": {
    image: "/namaz/step-5-sujood.jpg",
    focusTitle: "First Sujood — Nearest to Allah in Prostration",
    postureBadge: "Step 5 of 7 · Sujood",
    angles360: SUJOOD_ANGLES_360,
    focusPoints: [
      "7 parts touch the mat: forehead & nose, both palms, both knees, both feet",
      "Palms flat near shoulders/ears, elbows lifted off the floor (not resting like a dog)",
      "Recite 'Subhaana Rabbiyal-A‘laa' three times with deep love and devotion",
    ],
    reminder: "Keep toes curled forward pointing towards Qiblah; do not lift feet off the ground.",
    sunnahNote: "The servant is nearest to his Lord when prostrating in Sujood.",
  },
  "r-6": {
    image: "/namaz/step-6-jalsa.jpg",
    focusTitle: "Jalsa — Peaceful Sitting Between Sujood",
    postureBadge: "Step 6 of 7 · Jalsa",
    angles360: JALSA_ANGLES_360,
    focusPoints: [
      "Sit upright with back straight and hands resting flat on thighs",
      "Rest on your left foot while the right foot remains upright with toes forward",
      "Whisper the heartfelt prayer: 'Rabbighfir lee' (My Lord, forgive me)",
    ],
    reminder: "Pause for a few calm seconds; do not peck quickly like a bird between the two prostrations.",
    sunnahNote: "The Prophet ﷺ would sit in Jalsa until everyone thought he had paused to rest.",
  },
  "r-7": {
    image: "/namaz/step-7-sujood.jpg",
    focusTitle: "Second Sujood — Completing the Rakah in Gratitude",
    postureBadge: "Step 7 of 7 · Second Sujood",
    angles360: SUJOOD_ANGLES_360,
    focusPoints: [
      "Descend with 'Allahu Akbar' into the second prostration",
      "Forehead, nose, palms, knees, and toes placed firmly on the emerald mat",
      "Say 'Subhaana Rabbiyal-A‘laa' three times before rising to conclude",
    ],
    reminder: "Feel the calm and tranquility of worship filling your heart before rising.",
    sunnahNote: "Each prostration raises you a degree in Jannah and wipes away a misdeed.",
  },

  // Sitting & Tashahhud Lesson (js-1 to js-6)
  "js-1": {
    image: "/namaz/step-5-sujood.jpg",
    focusTitle: "Rising from Sujood into Sitting",
    postureBadge: "Jalsa & Tashahhud · Step 1",
    angles360: SUJOOD_ANGLES_360,
    focusPoints: [
      "Lift head and chest smoothly from the mat",
      "Move with patience and dignity without rushing",
      "Settle gently onto the folded legs",
    ],
    reminder: "Focus on the movement shape first before speaking words.",
    sunnahNote: "Moving with Itmi'nan (peaceful deliberation) is required in every transition.",
  },
  "js-2": {
    image: "/namaz/step-6-jalsa.jpg",
    focusTitle: "Sit Calmly in Jalsa",
    postureBadge: "Jalsa & Tashahhud · Step 2",
    angles360: JALSA_ANGLES_360,
    focusPoints: [
      "Sit on the left foot with back straight and shoulders relaxed",
      "Hands rest flat on the thighs with fingers pointing toward knees",
      "Keep gaze softly focused on your lap",
    ],
    reminder: "Hold this peaceful posture for 3 seconds of calm silence.",
    sunnahNote: "Praise stillness and calmness over speed.",
  },
  "js-3": {
    image: "/namaz/step-6-jalsa.jpg",
    focusTitle: "Dua Between Sujood (Rabbighfir lee)",
    postureBadge: "Jalsa & Tashahhud · Step 3",
    angles360: JALSA_ANGLES_360,
    focusPoints: [
      "Maintain the calm Jalsa sitting posture",
      "Softly whisper: 'Rabbighfir lee' (My Lord, forgive me)",
      "Ask Allah for forgiveness with a sincere, grateful heart",
    ],
    reminder: "You may say 'Rabbighfir lee' once, twice, or three times.",
    sunnahNote: "Sunnah supplication between the two prostrations.",
  },
  "js-4": {
    image: "/namaz/step-7-sujood.jpg",
    focusTitle: "Second Sujood, Then Rise to Sit",
    postureBadge: "Jalsa & Tashahhud · Step 4",
    angles360: SUJOOD_ANGLES_360,
    focusPoints: [
      "Complete the second Sujood with 3 praises of Allah",
      "Rise smoothly to the seated posture",
      "Prepare for the longer Tashahhud sitting",
    ],
    reminder: "In the final sitting, this posture is held for the declaration of faith.",
    sunnahNote: "Consistent posture builds strong prayer habits.",
  },
  "js-5": {
    image: "/namaz/step-8-tashahhud.jpg",
    focusTitle: "Sit for Tashahhud (Qa‘dah)",
    postureBadge: "Jalsa & Tashahhud · Step 5",
    angles360: TASHAHHUD_ANGLES_360,
    focusPoints: [
      "Sit in Qa'dah with back straight and steady posture",
      "Left hand resting on left thigh, right hand on right thigh",
      "Gaze directed humbly downward toward your hands",
    ],
    reminder: "The body should be completely still and composed before starting recitation.",
    sunnahNote: "The sitting for Tashahhud is one of the essential parts of Salah.",
  },
  "js-6": {
    image: "/namaz/step-8-tashahhud.jpg",
    focusTitle: "Add the Words — Tashahhud (Attahiyyat)",
    postureBadge: "Jalsa & Tashahhud · Step 6",
    angles360: TASHAHHUD_ANGLES_360,
    focusPoints: [
      "Recite At-Tahiyyat softly and reflect on the greetings of peace",
      "Gently raise the right index finger at 'Ashhadu an laa ilaaha illallah'",
      "Keep gaze focused toward the pointing finger with Tawheed in heart",
    ],
    reminder: "Teach the Tashahhud in short, melodious phrases so the child memorizes with joy.",
    sunnahNote: "The raised finger affirms the absolute Oneness of Allah.",
  },

  // Tashahhud & Ending Salam Lesson (t-1 to t-5)
  "t-1": {
    image: "/namaz/step-6-jalsa.jpg",
    focusTitle: "Sit Calmly for Tashahhud",
    postureBadge: "Tashahhud & Salam · Step 1 of 5",
    angles360: JALSA_ANGLES_360,
    focusPoints: [
      "Sit calmly with back straight on the folded legs",
      "Rest both hands flat upon your thighs with fingers relaxed down",
      "Keep your gaze focused softly in your lap",
    ],
    reminder: "Take a deep breath and settle the body in complete stillness before beginning recitation.",
    sunnahNote: "The sitting for Tashahhud is an essential pillar of prayer.",
  },
  "t-2": {
    image: "/namaz/step-8-tashahhud.jpg",
    focusTitle: "Recite At-Tahiyyat & Raise Finger",
    postureBadge: "Tashahhud & Salam · Step 2 of 5",
    angles360: TASHAHHUD_ANGLES_360,
    focusPoints: [
      "Recite the sacred greetings of peace slowly",
      "Gently raise right index finger at 'Ashhadu an laa ilaaha illallah'",
      "Keep hand resting down on the knee while pointing finger forward towards Qiblah",
    ],
    reminder: "Raise the finger as a testimony that there is none worthy of worship except Allah.",
    sunnahNote: "The Prophet ﷺ would point with his index finger while supplicating.",
  },
  "t-3": {
    image: "/namaz/step-6-jalsa.jpg",
    focusTitle: "Salawat (Durood) upon Rasulullah ﷺ",
    postureBadge: "Tashahhud & Salam · Step 3 of 5",
    angles360: JALSA_ANGLES_360,
    focusPoints: [
      "Lower the index finger back down onto the thigh",
      "Rest both hands flat upon your knees with fingers relaxed",
      "Recite Durood Ibrahim and Dua Masoora with deep love and gratitude",
    ],
    reminder: "Sending one Salawat upon the Prophet brings ten blessings from Allah.",
    sunnahNote: "Durood Ibrahim is the most complete and virtuous blessing to recite.",
  },
  "t-4": {
    image: "/namaz/step-9-taslim.jpg",
    focusTitle: "First Salam to the Right Shoulder",
    postureBadge: "Tashahhud & Salam · Step 4 of 5",
    angles360: TASLIM_RIGHT_ANGLES_360,
    focusPoints: [
      "Turn head smoothly towards the right shoulder",
      "Keep both hands resting flat upon thighs with fingers down",
      "Say clearly: 'Assalamu alaikum wa rahmatullah'",
    ],
    reminder: "Turn gently with a peaceful smile; do not twist your chest or shoulders.",
    sunnahNote: "Rasulullah ﷺ turned until the whiteness of his right cheek was seen.",
  },
  "t-5": {
    image: "/namaz/taslim-left.jpg",
    focusTitle: "Second Salam to the Left Shoulder",
    postureBadge: "Tashahhud & Salam · Step 5 of 5",
    angles360: TASLIM_LEFT_ANGLES_360,
    focusPoints: [
      "Turn head smoothly towards the left shoulder",
      "Keep both hands resting flat upon thighs with fingers down",
      "Say clearly: 'Assalamu alaikum wa rahmatullah'",
    ],
    reminder: "Prayer concludes with peace (Salam) spread to everyone around you.",
    sunnahNote: "The departure and conclusion of Salah is with the Taslim.",
  },

  // Overview Steps (ov-1 to ov-4)
  "ov-1": {
    image: "/wudu/step-1.jpg",
    focusTitle: "Prepare with Clean Wudu",
    postureBadge: "Overview · Step 1",
    angles360: [
      { degree: 45, label: "Angle Right (45°)", image: "/wudu/step-1.jpg" },
      { degree: 315, label: "Angle Left (315°)", image: "/wudu/step-1-left.jpg" },
    ],
    focusPoints: [
      "Cleanse yourself with wudu before approaching prayer",
      "Wash face, arms, head, and feet carefully",
      "Ensure clothes and prayer space are pure and clean",
    ],
    reminder: "Purity is half of faith. Always come to Allah in clean clothes.",
    sunnahNote: "No prayer is accepted without purification.",
  },
  "ov-2": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Face the Qiblah",
    postureBadge: "Overview · Step 2",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Stand facing the Holy Ka'bah in Makkah",
      "Body upright, feet steady, shoulder-width apart",
      "Clear the mind of distractions",
    ],
    reminder: "Facing the Qiblah unifies Muslims across the entire world in worship.",
    sunnahNote: "Facing the Qiblah is a prerequisite condition for Salah.",
  },
  "ov-3": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Make Intention (Niyyah)",
    postureBadge: "Overview · Step 3",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Intend in your heart which prayer you are performing (e.g. Fajr)",
      "Stand with calm reverence and respect",
      "Intention does not need to be said aloud; Allah knows every heart",
    ],
    reminder: "Every action is judged by the sincere intention behind it.",
    sunnahNote: "Verily, actions are judged by intentions.",
  },
  "ov-4": {
    image: "/namaz/step-1-takbir.jpg",
    focusTitle: "Begin with Takbir (Allahu Akbar)",
    postureBadge: "Overview · Step 4",
    angles360: TAKBIR_ANGLES_360,
    focusPoints: [
      "Raise both hands to ear level with palms forward",
      "Pronounce: 'Allahu Akbar' (Allah is Greatest)",
      "Fold hands gently upon the chest to begin",
    ],
    reminder: "Allahu Akbar means nothing in this world is greater than Allah.",
    sunnahNote: "The key to prayer is purity, and its commencement is Takbir.",
  },

  // Taslim Generic Steps (ts-1 & ts-2)
  "ts-1": {
    image: "/namaz/step-9-taslim.jpg",
    focusTitle: "First Salam to the Right",
    postureBadge: "Ending Taslim · Step 1",
    angles360: TASLIM_RIGHT_ANGLES_360,
    focusPoints: [
      "Turn your head gently towards the right shoulder",
      "Say clearly: 'Assalamu alaikum wa rahmatullah'",
      "Greet the recording angel and fellow believers on your right",
    ],
    reminder: "Turn smoothly without jerking or twisting your whole torso.",
    sunnahNote: "The Prophet ﷺ would turn until the whiteness of his cheek could be seen.",
  },
  "ts-2": {
    image: "/namaz/taslim-left.jpg",
    focusTitle: "Second Salam to the Left",
    postureBadge: "Ending Taslim · Step 2",
    angles360: TASLIM_LEFT_ANGLES_360,
    focusPoints: [
      "Turn your head across to the left shoulder",
      "Say: 'Assalamu alaikum wa rahmatullah'",
      "Complete the prayer with gratitude and inner peace",
    ],
    reminder: "Feel the peace you have received from Allah spreading to the entire world.",
    sunnahNote: "The departure from Salah is with the Taslim.",
  },
};

// ---------------------------------------------------------------------------
// Opening Dua (Thana) Step Details (th-1 to th-3)
// ---------------------------------------------------------------------------
export const THANA_STEP_DETAILS: Record<string, SalahStepVisualDetail> = {
  "th-1": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Quiet Stillness After Takbir",
    postureBadge: "Opening Dua · Step 1 of 3",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Fold right hand over left wrist on the chest",
      "Gaze gently fixed at the place of Sujood on the mat",
      "Enter a calm state of presence before uttering praise",
    ],
    reminder: "Take a deep gentle breath and feel the tranquility of standing before Allah.",
    sunnahNote: "The Prophet ﷺ would pause in calm silence after Takbir before reciting.",
  },
  "th-2": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Recite Thana (Subhaanak-Allaahumma)",
    postureBadge: "Opening Dua · Step 2 of 3",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Recite the sacred praise of Allah quietly to yourself",
      "Proclaim Allah's absolute holiness, majesty, and Oneness",
      "Recite with slow, deliberate contemplation of every phrase",
    ],
    reminder: "Thana is whispered softly (Sirran) in both silent and audible prayers.",
    sunnahNote: "Praising Allah before supplication is the most beloved etiquette of prayer.",
  },
  "th-3": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Seek Refuge (Ta‘awwuz) & Basmala",
    postureBadge: "Opening Dua · Step 3 of 3",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Recite: A‘oodhu billaahi minash-shaytaanir-rajeem quietly",
      "Follow smoothly with: Bismillaahir-Rahmaanir-Raheem",
      "Prepare your heart and mind to recite Surat al-Fatihah",
    ],
    reminder: "Seeking refuge acts as a protective shield against Satanic distractions.",
    sunnahNote: "Allah commands in Quran: 'When you recite the Quran, seek refuge in Allah from Satan.'",
  },
};

// ---------------------------------------------------------------------------
// Surat al-Fatihah Step Details (f-1 to f-7)
// ---------------------------------------------------------------------------
export const FATIHAH_STEP_DETAILS: Record<string, SalahStepVisualDetail> = {
  "f-1": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Ayah 1 — Bismillahir-Rahmaanir-Raheem",
    postureBadge: "Al-Fatihah · Ayah 1 of 7",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Begin recitation in the Name of Allah, the Most Gracious, the Most Merciful",
      "Remember that Allah's infinite mercy encompasses all of existence",
      "Clear, soft, melodious pronunciation in steady Qiyam posture",
    ],
    reminder: "Every rakah commences with the remembrance of divine compassion and mercy.",
    sunnahNote: "Reciting Basmala invokes immense blessing (barakah) on your prayer.",
  },
  "f-2": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Ayah 2 — Alhamdu lillaahi Rabbil-‘Aalameen",
    postureBadge: "Al-Fatihah · Ayah 2 of 7",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "All gratitude, praise, and adoration belongs to Allah alone",
      "Rabb means the loving Creator, Nurturer, and Sustainer of all worlds",
      "Pronounce the deep throat letter 'Ain (ع) clearly in ‘Aalameen",
    ],
    reminder: "When you recite this ayah, Allah says: 'My servant has praised Me.'",
    sunnahNote: "Hamd (praise) fills the heavenly scale of good deeds to the brim.",
  },
  "f-3": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Ayah 3 — Ar-Rahmaanir-Raheem",
    postureBadge: "Al-Fatihah · Ayah 3 of 7",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "The Most Compassionate, the Infinitely and Eternally Merciful",
      "Feel the peace of being surrounded by Allah's divine benevolence",
      "Pause deliberately at the end of each verse as the Sunnah teaches",
    ],
    reminder: "Allah replies from above the heavens: 'My servant has exalted Me.'",
    sunnahNote: "Pausing between verses was the continuous practice of Rasulullah ﷺ.",
  },
  "f-4": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Ayah 4 — Maaliki Yawmid-Deen",
    postureBadge: "Al-Fatihah · Ayah 4 of 7",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Master, Sovereign, and Supreme Ruler of the Day of Judgment",
      "Stand with deep awe, reverence, and personal accountability",
      "Keep feet firm, shoulders relaxed, and gaze on the sujood spot",
    ],
    reminder: "Allah declares: 'My servant has glorified Me.'",
    sunnahNote: "Reflecting on the Day of Judgment purifies the worshipper's heart.",
  },
  "f-5": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Ayah 5 — Iyyaaka Na‘budu wa Iyyaaka Nasta‘een",
    postureBadge: "Al-Fatihah · Ayah 5 of 7",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "The pivotal core of the entire Quran: Pure and exclusive Tawheed",
      "'You alone we worship, and You alone we ask for help'",
      "We rely on none other than Allah for guidance and support",
    ],
    reminder: "Allah says: 'This is between Me and My servant, and My servant shall have what he asks.'",
    sunnahNote: "This verse forms the foundational contract between the servant and the Creator.",
  },
  "f-6": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Ayah 6 — Ihdinas-Siraatal-Mustaqeem",
    postureBadge: "Al-Fatihah · Ayah 6 of 7",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "The supreme Dua: 'Guide us to the Straight, Unswerving Path'",
      "Ask for wisdom, truthfulness, good manners, and moral steadfastness",
      "Emphasize the bold letters Saad (ص) and Taa (ط) with proper Tajweed",
    ],
    reminder: "Divine guidance is the greatest treasure a human can ever receive.",
    sunnahNote: "Every Muslim asks for this essential guidance at least 17 times daily.",
  },
  "f-7": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Ayah 7 — Siraatal-ladheena An‘amta ‘Alayhim…",
    postureBadge: "Al-Fatihah · Ayah 7 of 7",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "The path of the Prophets, Truthful, Martyrs, and Righteous",
      "Not the path of those who earned wrath, nor those who went astray",
      "Conclude with a heartfelt and sincere 'Aameen' (O Allah, answer our prayer)",
    ],
    reminder: "Saying Aameen alongside the Angels causes past sins to be forgiven.",
    sunnahNote: "The Angels in the heavens say 'Aameen' as the believer concludes Al-Fatihah.",
  },
};

// ---------------------------------------------------------------------------
// Surat al-Ikhlas Step Details (i-1 to i-4)
// ---------------------------------------------------------------------------
export const IKHLAS_STEP_DETAILS: Record<string, SalahStepVisualDetail> = {
  "i-1": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Ayah 1 — Qul Huwallahu Ahad",
    postureBadge: "Al-Ikhlas · Ayah 1 of 4",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Proclaim: 'Say: He is Allah, the Absolute One'",
      "Make clear Qalqalah (echo bounce) on the Dal of 'Ahad'",
      "Tawheed: Allah has no partners, rivals, or equals in existence",
    ],
    reminder: "Reciting Surat al-Ikhlas equals one-third of the entire Quran in reward!",
    sunnahNote: "Rasulullah ﷺ loved this surah because it describes the true nature of Ar-Rahman.",
  },
  "i-2": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Ayah 2 — Allahus-Samad",
    postureBadge: "Al-Ikhlas · Ayah 2 of 4",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Allah, the Eternal Refuge, upon Whom all creation entirely depends",
      "He needs no food, drink, or rest, while all things need Him every second",
      "Pronounce the emphatic Saad (ص) in As-Samad with depth and richness",
    ],
    reminder: "Whatever you need in this life or the next, ask As-Samad directly.",
    sunnahNote: "As-Samad is among the Greatest Names (Ism al-A‘zam) of Allah.",
  },
  "i-3": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Ayah 3 — Lam Yalid wa Lam Yoolad",
    postureBadge: "Al-Ikhlas · Ayah 3 of 4",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "'He neither begets nor is He born'",
      "Allah has no parents, no son, no daughter, and no lineage",
      "Bounce Qalqalah lightly and crisp on the Dal of 'Yalid' and 'Yoolad'",
    ],
    reminder: "This verse liberates our understanding from all flawed human comparisons.",
    sunnahNote: "Sincere monotheism (Ikhlas) is the master key to Paradise.",
  },
  "i-4": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Ayah 4 — Wa Lam Yakul-Lahu Kufuwan Ahad",
    postureBadge: "Al-Ikhlas · Ayah 4 of 4",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "'And there is none comparable or equivalent unto Him'",
      "Merge the Noon into Laam smoothly without nasal sound (Idgham bila-Ghunnah)",
      "Prepare your body and heart to transition into bowing (Ruku) with Takbir",
    ],
    reminder: "After completing this verse, say 'Allahu Akbar' and bow smoothly into Ruku.",
    sunnahNote: "Whoever loves Surat al-Ikhlas, Allah loves him and blesses him with Jannah.",
  },
};

// ---------------------------------------------------------------------------
// Full Fajr Prayer Step Details (ff-1 to ff-18)
// ---------------------------------------------------------------------------
export const FULL_FAJR_STEP_DETAILS: Record<string, SalahStepVisualDetail> = {
  "ff-1": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Niyyah & Face Qiblah",
    postureBadge: "Full Fajr · Step 1 of 18",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Stand facing the Holy Ka‘bah in Makkah with feet straight and steady",
      "Make sincere intention in your heart for 2 Fard Rak‘aat of Fajr prayer",
      "Clear worldly thoughts and prepare for your direct meeting with Allah",
    ],
    reminder: "Niyyah is from the heart; stand peaceful, humble, and still on your prayer rug.",
    sunnahNote: "Facing Qiblah with sincere intention is the mandatory prerequisite of Salah.",
  },
  "ff-2": {
    image: "/namaz/step-1-takbir.jpg",
    focusTitle: "Takbiratul Ihram — Enter Prayer",
    postureBadge: "Full Fajr · Step 2 of 18",
    angles360: TAKBIR_ANGLES_360,
    focusPoints: [
      "Raise both hands to earlobe or shoulder level",
      "Palms open and facing forward toward the Qiblah",
      "Proclaim: 'Allahu Akbar' with reverence, awe, and stillness",
    ],
    reminder: "Worldly talk and movement are set aside once this Takbir is said.",
    sunnahNote: "The commencement of prayer is Takbir, and its key is purification.",
  },
  "ff-3": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Opening Dua (Thana) in Qiyam",
    postureBadge: "Full Fajr · Step 3 of 18",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Right hand clasped over left wrist upon the chest",
      "Recite: Subhaanak-Allaahumma wa bihamdika...",
      "Recite Ta‘awwuz and Tasmiyah softly before beginning Al-Fatihah",
    ],
    reminder: "Recited silently at the very beginning of the first Rakah only.",
    sunnahNote: "Praising Allah before asking Him is the most virtuous etiquette of Dua.",
  },
  "ff-4": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Surat al-Fatihah (Rakah 1)",
    postureBadge: "Full Fajr · Step 4 of 18",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Recite all 7 verses of Al-Fatihah slowly and melodiously",
      "Keep gaze fixed humbly at the spot of Sujood",
      "Conclude with a sincere 'Aameen' after verse 7",
    ],
    reminder: "There is no valid prayer for the one who does not recite the Opening of the Book.",
    sunnahNote: "In Fajr prayer, reciting Al-Fatihah aloud with beautiful Tajweed is Sunnah.",
  },
  "ff-5": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Short Surah — Al-Ikhlas (Rakah 1)",
    postureBadge: "Full Fajr · Step 5 of 18",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Recite Surat al-Ikhlas after Al-Fatihah",
      "Maintain peaceful stillness and composure",
      "Prepare body to transition into bowing with Takbir",
    ],
    reminder: "Surah recitation after Al-Fatihah is Sunnah in the first two Rakahs.",
    sunnahNote: "Rasulullah ﷺ frequently recited Surahs of Tawheed in the Fajr prayer.",
  },
  "ff-6": {
    image: "/namaz/step-3-ruku.jpg",
    focusTitle: "Ruku (Bowing) with Flat Back",
    postureBadge: "Full Fajr · Step 6 of 18",
    angles360: RUKU_ANGLES_360,
    focusPoints: [
      "Say 'Allahu Akbar' as you bow forward from the hips",
      "Grasp both knees firmly with fingers spread apart",
      "Keep back completely flat and head level with spine",
    ],
    reminder: "Recite 'Subhaana Rabbiyal-‘Azeem' three times with peaceful stillness.",
    sunnahNote: "The Prophet ﷺ bowed until all vertebrae settled comfortably in place.",
  },
  "ff-7": {
    image: "/namaz/step-4-qaumah.jpg",
    focusTitle: "Qaumah — Rising Upright in Praise",
    postureBadge: "Full Fajr · Step 7 of 18",
    angles360: QAUMAH_ANGLES_360,
    focusPoints: [
      "Rise smoothly saying: 'Sami‘allahu liman hamidah'",
      "Stand fully upright and still with spine straight",
      "Say: 'Rabbanaa wa lakal-hamd' once fully upright",
    ],
    reminder: "Do not rush into prostration; wait until every joint settles peacefully.",
    sunnahNote: "Straightening the back in Qaumah is an obligatory pillar of Salah.",
  },
  "ff-8": {
    image: "/namaz/step-5-sujood.jpg",
    focusTitle: "First Sujood — Nearest to Allah",
    postureBadge: "Full Fajr · Step 8 of 18",
    angles360: SUJOOD_ANGLES_360,
    focusPoints: [
      "Descend with 'Allahu Akbar' onto knees, hands, then forehead & nose",
      "Keep 7 points firmly grounded; elbows lifted off the mat",
      "Recite: 'Subhaana Rabbiyal-A‘laa' three times with devotion",
    ],
    reminder: "The servant is nearest to Allah when prostrating; make heartfelt du‘aa.",
    sunnahNote: "Point toes forward toward the Qiblah with heels close together.",
  },
  "ff-9": {
    image: "/namaz/step-6-jalsa.jpg",
    focusTitle: "Jalsa — Sitting Between Sujood",
    postureBadge: "Full Fajr · Step 9 of 18",
    angles360: JALSA_ANGLES_360,
    focusPoints: [
      "Rise with 'Allahu Akbar' and sit upright on folded legs",
      "Hands rest flat on thighs, gaze quietly in lap",
      "Softly whisper: 'Rabbighfir lee' (My Lord, forgive me)",
    ],
    reminder: "Hold this peaceful sit for a few calm seconds; do not peck like a bird.",
    sunnahNote: "The Prophet ﷺ would sit in Jalsa until his companions thought he was resting.",
  },
  "ff-10": {
    image: "/namaz/step-7-sujood.jpg",
    focusTitle: "Second Sujood — Completing Rakah 1",
    postureBadge: "Full Fajr · Step 10 of 18",
    angles360: SUJOOD_ANGLES_360,
    focusPoints: [
      "Descend with 'Allahu Akbar' into the second prostration",
      "Forehead, nose, palms, knees, and toes placed firmly",
      "Recite: 'Subhaana Rabbiyal-A‘laa' three times in gratitude",
    ],
    reminder: "First Rakah is complete after this sujood; prepare to rise for Rakah 2.",
    sunnahNote: "Each Sujood elevates a rank in Paradise and erases a mistake.",
  },
  "ff-11": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Stand for Rakah 2 with Takbir",
    postureBadge: "Full Fajr · Step 11 of 18",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Say 'Allahu Akbar' and rise smoothly back to standing (Qiyam)",
      "Fold hands upon the chest (right over left) without jumping",
      "Stand composed and attentive for the second unit of prayer",
    ],
    reminder: "In the second Rakah, you do not repeat Opening Takbir or Thana.",
    sunnahNote: "Begin recitation directly with Basmala and Al-Fatihah.",
  },
  "ff-12": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Surat al-Fatihah (Rakah 2)",
    postureBadge: "Full Fajr · Step 12 of 18",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Recite Surat al-Fatihah completely in Rakah 2",
      "Maintain the same khushu‘, melody, and humble posture",
      "Say 'Aameen' with devotion at the completion of verse 7",
    ],
    reminder: "Al-Fatihah must be recited in every single Rakah of every prayer.",
    sunnahNote: "Re-focus your mind on the dialogue with Allah in every standing.",
  },
  "ff-13": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Short Surah (Rakah 2)",
    postureBadge: "Full Fajr · Step 13 of 18",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "Recite another short surah or verses from the Quran",
      "Clear pronunciation with proper tajweed pauses",
      "Prepare to complete the bowing and prostrations of Rakah 2",
    ],
    reminder: "Reciting a surah after Al-Fatihah concludes the standing recitation of Fajr.",
    sunnahNote: "The Prophet ﷺ would recite between 60 to 100 verses in Fajr prayer.",
  },
  "ff-14": {
    image: "/namaz/step-3-ruku.jpg",
    focusTitle: "Ruku & Prostrations of Rakah 2",
    postureBadge: "Full Fajr · Step 14 of 18",
    angles360: RUKU_ANGLES_360,
    focusPoints: [
      "Perform Ruku with flat back (Subhaana Rabbiyal-‘Azeem ×3)",
      "Rise upright into Qaumah (Sami‘allahu liman hamidah...)",
      "Perform both Sujood with calm Jalsa sitting between them",
    ],
    reminder: "After the second Sujood of this Rakah, remain seated for the final Tashahhud.",
    sunnahNote: "Consistency and calmness across both Rakahs builds exemplary prayer discipline.",
  },
  "ff-15": {
    image: "/namaz/step-8-tashahhud.jpg",
    focusTitle: "Final Sitting — Tashahhud (Attahiyyat)",
    postureBadge: "Full Fajr · Step 15 of 18",
    angles360: TASHAHHUD_ANGLES_360,
    focusPoints: [
      "Sit composed in Qa‘dah with back straight and hands on thighs",
      "Recite At-Tahiyyat slowly reflecting on greetings of peace",
      "Raise right index finger at 'Ashhadu an laa ilaaha illallah'",
    ],
    reminder: "The raised finger affirms the absolute Oneness of Allah (Tawheed).",
    sunnahNote: "The final sitting is an essential pillar concluding the prayer.",
  },
  "ff-16": {
    image: "/namaz/step-8-tashahhud.jpg",
    focusTitle: "Salawat Ibrahimiyyah (Durood)",
    postureBadge: "Full Fajr · Step 16 of 18",
    angles360: TASHAHHUD_ANGLES_360,
    focusPoints: [
      "Send blessings upon Prophet Muhammad ﷺ and his blessed family",
      "Invoke blessings as bestowed upon Prophet Ibrahim ‘alayhis-salam",
      "Recite with deep love, gratitude, and reverence",
    ],
    reminder: "Whoever sends one blessing upon the Prophet, Allah sends ten blessings upon him.",
    sunnahNote: "Durood Ibrahim is the most complete and authentic Salawat taught by Rasulullah ﷺ.",
  },
  "ff-17": {
    image: "/namaz/step-9-taslim.jpg",
    focusTitle: "First Salam to the Right Shoulder",
    postureBadge: "Full Fajr · Step 17 of 18",
    angles360: TASLIM_RIGHT_ANGLES_360,
    focusPoints: [
      "Turn head smoothly towards the right shoulder",
      "Say clearly: 'Assalamu alaikum wa rahmatullah'",
      "Greet the recording angel (Kiraman Katibin) and believers on your right",
    ],
    reminder: "Turn the neck gently without twisting your chest or shifting off the mat.",
    sunnahNote: "The Prophet ﷺ turned until the whiteness of his right cheek was visible.",
  },
  "ff-18": {
    image: "/namaz/taslim-left.jpg",
    focusTitle: "Second Salam to the Left · Prayer Complete!",
    postureBadge: "Full Fajr · Step 18 of 18",
    angles360: TASLIM_LEFT_ANGLES_360,
    focusPoints: [
      "Turn head smoothly towards the left shoulder",
      "Say clearly: 'Assalamu alaikum wa rahmatullah'",
      "Greet the recording angel on your left and complete your prayer",
    ],
    reminder: "MashaAllah! Your complete Fajr prayer has been offered to Allah. Spread peace!",
    sunnahNote: "The departure and completion of Salah is accomplished with the Taslim.",
  },
};

// ---------------------------------------------------------------------------
// The Five Daily Prayers Step Details (p-1 to p-5)
// ---------------------------------------------------------------------------
export const FIVE_PRAYERS_STEP_DETAILS: Record<string, SalahStepVisualDetail> = {
  "p-1": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Fajr (Dawn Prayer) — 2 Rak‘aat Fard",
    postureBadge: "Prayer 1 of 5 · Fajr (Dawn)",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "2 Sunnah Mu'akkadah followed by 2 Fard Rak‘aat (4 total)",
      "Audible recitation (Jahri) of Surat al-Fatihah and Surahs in both Fard rak‘aat",
      "Time begins at true dawn (Subh Sadiq) and ends right before sunrise",
    ],
    reminder: "The 2 Sunnah rak'aat of Fajr are dearer to Rasulullah ﷺ than the entire world and everything in it.",
    sunnahNote: "Praying Fajr on time places you directly under Allah's divine care and protection for the whole day.",
  },
  "p-2": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Dhuhr (Midday Prayer) — 4 Rak‘aat Fard",
    postureBadge: "Prayer 2 of 5 · Dhuhr (Midday)",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "4 Sunnah + 4 Fard + 2 Sunnah + 2 Nafl (12 Rak‘aat total)",
      "Silent recitation (Sirri) throughout all 4 Fard rak‘aat",
      "Middle sitting (Qa‘dah Ula) after Rakah 2 for Tashahhud before rising for Rakah 3",
    ],
    reminder: "Pause work, school, or play at midday to refresh your heart before Allah.",
    sunnahNote: "When the sun passes its zenith, the gates of the heavens open and deeds ascend.",
  },
  "p-3": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "‘Asr (Late Afternoon Prayer) — 4 Rak‘aat Fard",
    postureBadge: "Prayer 3 of 5 · ‘Asr (Afternoon)",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "4 Sunnah Ghair Mu'akkadah + 4 Fard (8 Rak‘aat total)",
      "Silent recitation (Sirri) — identical in 4-rak‘ah structure to Dhuhr",
      "Guard the Middle Prayer ('Asr) with special punctuality and focus",
    ],
    reminder: "Allah specifically commands in Surah Al-Baqarah: 'Guard strictly the prayers, especially the middle prayer ('Asr)'.",
    sunnahNote: "The shift of angels who witness Fajr and ‘Asr ascend to Allah praising your devotion.",
  },
  "p-4": {
    image: "/namaz/step-2-qiyam.jpg",
    focusTitle: "Maghrib (Sunset Prayer) — 3 Rak‘aat Fard",
    postureBadge: "Prayer 4 of 5 · Maghrib (Sunset)",
    angles360: QIYAM_ANGLES_360,
    focusPoints: [
      "3 Fard + 2 Sunnah Mu'akkadah + 2 Nafl (7 Rak‘aat total)",
      "Audible recitation (Jahri) in first 2 rak‘aat, silent (Sirri) in the 3rd rak‘ah",
      "Sit after Rakah 2 for Tashahhud, stand for 1 rakah (Al-Fatihah only), then final sitting",
    ],
    reminder: "Maghrib time is short; perform it without delay immediately after sunset.",
    sunnahNote: "Gathering the family for Maghrib brings immense warmth, peace, and angels into the home.",
  },
  "p-5": {
    image: "/namaz/step-1-takbir.jpg",
    focusTitle: "‘Ishaa & Witr (Night Prayer) — 4 Fard + 3 Witr",
    postureBadge: "Prayer 5 of 5 · ‘Ishaa & Witr (Night)",
    angles360: TAKBIR_ANGLES_360,
    focusPoints: [
      "4 Sunnah + 4 Fard + 2 Sunnah + 2 Nafl + 3 Witr Wajib + 2 Nafl (17 Rak‘aat total)",
      "Audible recitation in first 2 rak‘aat of Fard and during the 3 Rak‘aat Witr",
      "Raise hands for Takbeer before Qunoot in Rakah 3 of Witr to recite Dua al-Qunoot",
    ],
    reminder: "Witr is the beloved concluding prayer of the night. Never go to sleep without offering it.",
    sunnahNote: "Rasulullah ﷺ said: 'Allah is One (Witr) and He loves the Witr prayer.' (Abu Dawood)",
  },
};

export const STEP_DETAILS: Record<string, SalahStepVisualDetail> = {
  ...WUDU_STEP_DETAILS,
  ...NAMAZ_STEP_DETAILS,
  ...THANA_STEP_DETAILS,
  ...FATIHAH_STEP_DETAILS,
  ...IKHLAS_STEP_DETAILS,
  ...FULL_FAJR_STEP_DETAILS,
  ...FIVE_PRAYERS_STEP_DETAILS,
};

/**
 * Returns the visual detail configuration for a given step ID.
 * If no direct match exists, attempts to map by posture or fallback.
 */
export function getStepDetail(stepId: string, posture?: string): SalahStepVisualDetail | null {
  if (STEP_DETAILS[stepId]) return STEP_DETAILS[stepId];

  // Specific Full Fajr step enhancements
  if (stepId === "ff-15" || stepId === "ff-16") return NAMAZ_STEP_DETAILS["t-1"];
  if (stepId === "ff-17") return NAMAZ_STEP_DETAILS["t-4"];
  if (stepId === "ff-18") return NAMAZ_STEP_DETAILS["t-5"];

  // Posture fallback matching
  if (posture === "takbir") return NAMAZ_STEP_DETAILS["r-1"];
  if (posture === "standing") return NAMAZ_STEP_DETAILS["r-2"];
  if (posture === "bowing") return NAMAZ_STEP_DETAILS["r-3"];
  if (posture === "rising") return NAMAZ_STEP_DETAILS["r-4"];
  if (posture === "prostration") return NAMAZ_STEP_DETAILS["r-5"];
  if (posture === "sitting") return NAMAZ_STEP_DETAILS["r-6"];
  if (posture === "salam") {
    return stepId === "ts-2" || stepId.includes("left")
      ? NAMAZ_STEP_DETAILS["ts-2"]
      : NAMAZ_STEP_DETAILS["ts-1"];
  }

  // Wudu posture fallbacks
  if (posture === "wudu-hands") return WUDU_STEP_DETAILS["w-2"];
  if (posture === "wudu-mouth") return WUDU_STEP_DETAILS["w-3"];
  if (posture === "wudu-nose") return WUDU_STEP_DETAILS["w-4"];
  if (posture === "wudu-face") return WUDU_STEP_DETAILS["w-5"];
  if (posture === "wudu-arms") return WUDU_STEP_DETAILS["w-6"];
  if (posture === "wudu-head") return WUDU_STEP_DETAILS["w-7"];
  if (posture === "wudu-ears") return WUDU_STEP_DETAILS["w-8"];
  if (posture === "wudu-feet") return WUDU_STEP_DETAILS["w-9"];

  return null;
}

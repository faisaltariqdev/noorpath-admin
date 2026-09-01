"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import type { LessonStep } from "../types";

interface VisualSpec {
  accent: string;
  sky: string;
  labels: string[];
  alt: string;
}

export const TOPIC_VISUALS: Record<string, VisualSpec> = {
  "who-is-allah": { accent: "#0A6E4F", sky: "#DCEFFB", labels: ["Creator", "One", "Merciful"], alt: "Night sky, mountains and sea showing Allah's creation" },
  "who-is-prophet": { accent: "#1B7A5A", sky: "#FDF3DC", labels: ["Messenger", "Teacher", "Example"], alt: "A lantern-lit path leading to a green-domed mosque" },
  "five-pillars": { accent: "#C9922A", sky: "#FFF6E2", labels: ["Shahada", "Salah", "Zakat", "Sawm", "Hajj"], alt: "Five pillars holding an arch, each marked with a symbol" },
  "six-articles": { accent: "#5B6CFF", sky: "#E7E9FF", labels: ["Allah", "Angels", "Books", "Messengers", "Last Day", "Qadr"], alt: "Six stars arranged around a glowing centre of light" },
  kalimas: { accent: "#0A6E4F", sky: "#E9F7F0", labels: ["Faith", "Dhikr", "Meaning"], alt: "A strand of six beads beside an open book" },
  "basic-duas": { accent: "#2D9CDB", sky: "#E3F3FD", labels: ["Ask", "Thank", "Remember"], alt: "Cupped hands raised in dua with daily moment icons" },
  "islamic-greetings": { accent: "#27AE60", sky: "#E7F8EC", labels: ["Salam", "Peace", "Smile"], alt: "Two children greeting each other with a wave" },
  "good-manners": { accent: "#E07A5F", sky: "#FDEDE7", labels: ["Kind words", "Soft voice", "Take turns"], alt: "A child offering a gift kindly to a friend" },
  "respect-parents": { accent: "#9B59B6", sky: "#F5EAFB", labels: ["Listen", "Help", "Make dua"], alt: "A child helping two parents at home with a heart above" },
  cleanliness: { accent: "#16A085", sky: "#E4F7F3", labels: ["Body", "Clothes", "Places"], alt: "A washing basin with water drops, soap and folded clean clothes" },
  kindness: { accent: "#F4A261", sky: "#FFF2E3", labels: ["People", "Animals", "Words"], alt: "A gentle hand offering care to a small animal" },
  sharing: { accent: "#E76F51", sky: "#FDEBE5", labels: ["Give", "Take turns", "Barakah"], alt: "Two hands sharing a piece of fruit equally" },
  truthfulness: { accent: "#457B9D", sky: "#E7F0F7", labels: ["Truth", "Courage", "Trust"], alt: "A bright lantern lighting a dark path" },
  "helping-others": { accent: "#2A9D8F", sky: "#E4F5F2", labels: ["Notice", "Offer", "Support"], alt: "A child helping another carry a heavy bag" },
  "mosque-etiquette": { accent: "#0A6E4F", sky: "#EAF6F0", labels: ["Enter calmly", "Keep clean", "Pray"], alt: "A masjid archway with shoes placed neatly in the shoe area" },
  ramadan: { accent: "#264653", sky: "#DDE7F0", labels: ["Fasting", "Quran", "Generosity"], alt: "A Ramadan night with crescent moon, lantern and dates" },
  eid: { accent: "#C9922A", sky: "#FFF4DC", labels: ["Prayer", "Gratitude", "Family"], alt: "Eid celebration with bunting, gifts and sweets" },
  angels: { accent: "#4D8C9B", sky: "#E4F2F6", labels: ["Light", "Obedience", "Revelation"], alt: "Beams of light shining over an open book" },
  prophets: { accent: "#6D597A", sky: "#F1EBF5", labels: ["Nuh", "Ibrahim", "Muhammad ﷺ"], alt: "A path with an ark, a guiding star and a mosque" },
  jannah: { accent: "#52B788", sky: "#E6F7EE", labels: ["Peace", "Gardens", "Forever"], alt: "A peaceful garden with flowing rivers and a golden gate" },
  "stories-prophets": { accent: "#0A6E4F", sky: "#EAF6F0", labels: ["Nuh", "Yunus", "Ibrahim"], alt: "An open storybook with an ark, a great fish and a star" },
  sahabah: { accent: "#C9922A", sky: "#FFF6E2", labels: ["Loyalty", "Courage", "Learning"], alt: "Companions' stars circling a lantern of knowledge" },
  "animals-quran": { accent: "#2A9D8F", sky: "#E6F6F2", labels: ["Bee", "Ant", "Bird"], alt: "A bee, an ant and a bird among flowers and leaves" },
  "daily-sunnah": { accent: "#F4A261", sky: "#FFF3E4", labels: ["Smile", "Right hand", "Salam"], alt: "A daily timeline with a smile, a right hand and a greeting" },
  "halal-haram": { accent: "#27AE60", sky: "#E9F8EE", labels: ["Permitted", "Avoid", "Ask"], alt: "A balance scale weighing a permitted and an avoided choice" },
  "wudu-prayer": { accent: "#457B9D", sky: "#E5F1F9", labels: ["Wudu", "Stand", "Bow", "Prostrate"], alt: "A tap with water drops beside a prayer mat and numbered steps" },
  "seerah-timeline": { accent: "#0A6E4F", sky: "#EAF6F0", labels: ["Makkah", "Revelation", "Hijrah"], alt: "A timeline from Makkah to the cave to Madinah" },
  "islamic-ethics": { accent: "#5B6CFF", sky: "#E8EAFF", labels: ["Justice", "Honesty", "Consistency"], alt: "A compass beside balanced scales of fairness" },
  "patience-gratitude": { accent: "#52B788", sky: "#E8F8EF", labels: ["Sabr", "Steady action", "Shukr"], alt: "A seed growing into a sprout and then a strong tree" },
  "honesty-leadership": { accent: "#C9922A", sky: "#FFF5DE", labels: ["Listen", "Check", "Act fairly"], alt: "Footsteps climbing a hill towards a flag of trust" },
};

interface SceneProps {
  a: string;
  reduce: boolean;
}

const soft = (color: string, alpha: string) => `${color}${alpha}`;

function Ground({ a }: { a: string }) {
  return <path d="M0 116h240v24H0z" fill={soft(a, "22")} />;
}

function Star({ x, y, r = 6, fill }: { x: number; y: number; r?: number; fill: string }) {
  const points = Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? r : r / 2.3;
    const angle = (Math.PI / 5) * index - Math.PI / 2;
    return `${(x + radius * Math.cos(angle)).toFixed(1)},${(y + radius * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");
  return <polygon points={points} fill={fill} />;
}

function Mosque({ x, y, s = 1, a }: { x: number; y: number; s?: number; a: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-30" y="-14" width="60" height="34" rx="6" fill={soft(a, "33")} stroke={a} strokeWidth="3" />
      <path d="M-22 -14a22 22 0 0 1 44 0z" fill={a} />
      <path d="M0 -44v10" stroke={a} strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="-48" r="4" fill="#C9922A" />
      <rect x="-40" y="-30" width="8" height="50" rx="4" fill={soft(a, "55")} />
      <rect x="32" y="-30" width="8" height="50" rx="4" fill={soft(a, "55")} />
      <path d="M-8 20v-14a8 8 0 0 1 16 0v14z" fill="#fff" stroke={a} strokeWidth="2.5" />
    </g>
  );
}

function Book({ x, y, s = 1, a }: { x: number; y: number; s?: number; a: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-34 -14Q-16 -24 0 -14V16Q-16 6 -34 16Z" fill="#fff" stroke={a} strokeWidth="3" strokeLinejoin="round" />
      <path d="M34 -14Q16 -24 0 -14V16Q16 6 34 16Z" fill="#fff" stroke={a} strokeWidth="3" strokeLinejoin="round" />
      <path d="M-26 -8h14M-26 0h16M12 -8h14M10 0h16" stroke={soft(a, "88")} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

function Lantern({ x, y, s = 1, a }: { x: number; y: number; s?: number; a: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -26v6" stroke={a} strokeWidth="3" strokeLinecap="round" />
      <path d="M-12 -20h24l-4 8H-8z" fill={a} />
      <path d="M-9 -12h18l3 22H-12z" fill="#FFF3C4" stroke={a} strokeWidth="3" strokeLinejoin="round" />
      <path d="M-13 10h26l3 6h-32z" fill={a} />
      <circle cx="0" cy="0" r="4.5" fill="#F4A261" />
    </g>
  );
}

function Kid({
  x,
  y,
  s = 1,
  color,
  scarf = false,
  arm = "idle",
}: {
  x: number;
  y: number;
  s?: number;
  color: string;
  scarf?: boolean;
  arm?: "idle" | "wave" | "offer" | "up";
}) {
  const armPath = arm === "wave" ? "M13 4l14-14" : arm === "offer" ? "M13 6h16" : arm === "up" ? "M13 2l10-18" : "M13 6l8 12";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-15 42Q-15 2 0 2Q15 2 15 42Z" fill={color} />
      <circle cx="0" cy="-12" r="13" fill="#F5D0B0" />
      {scarf && <path d="M-14 -14a14 14 0 0 1 28 0l-3 14q-11-6-22 0z" fill={color} />}
      <circle cx="-4.5" cy="-13" r="1.8" fill="#1A2E28" />
      <circle cx="4.5" cy="-13" r="1.8" fill="#1A2E28" />
      <path d="M-4 -6q4 4 8 0" stroke="#1A2E28" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d={armPath} stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M-13 6l-8 12" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
    </g>
  );
}

const HAND_PATH = "M-16 4q-9-17-4-33c2-7 10-6 11 2l2 11 1-24c0-9 11-9 11 0l1 21 4-17c2-8 11-6 10 3l-4 37z";

function Hand({ x, y, s = 1, rotate = 0, flip = false, a }: { x: number; y: number; s?: number; rotate?: number; flip?: boolean; a: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${flip ? -s : s} ${s})`}>
      <path d={HAND_PATH} fill="#F5D0B0" stroke={a} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M-9 -4q8 5 15 0" stroke={a} strokeWidth="1.6" fill="none" opacity="0.45" strokeLinecap="round" />
    </g>
  );
}

function Heart({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 10C-12 1-18-6-13-12c4-5 10-3 13 1 3-4 9-6 13-1 5 6-1 13-13 22z" fill={fill} />
    </g>
  );
}

function Drop({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0-10c5 7 8 10 8 14a8 8 0 0 1-16 0c0-4 3-7 8-14z" fill={fill} />;
}

function Tree({ x, y, s = 1, a }: { x: number; y: number; s?: number; a: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 20V-2" stroke="#8B5E34" strokeWidth="5" strokeLinecap="round" />
      <circle cx="0" cy="-14" r="15" fill={a} />
      <circle cx="-12" cy="-6" r="11" fill={soft(a, "cc")} />
      <circle cx="12" cy="-6" r="11" fill={soft(a, "cc")} />
    </g>
  );
}

function Crescent({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M6-16a17 17 0 1 0 0 32A21 21 0 1 1 6-16z" fill={fill} />
    </g>
  );
}

function Marker({ x, y, label, a }: { x: number; y: number; label: string; a: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="11" fill="#fff" stroke={a} strokeWidth="4" />
      <text x={x} y={y + 4.5} textAnchor="middle" fontSize="11" fontWeight="900" fill={a}>{label}</text>
    </g>
  );
}

const SCENES: Record<string, (props: SceneProps) => ReactNode> = {
  "who-is-allah": ({ a, reduce }) => (
    <>
      <Crescent x={200} y={34} s={1.1} fill="#C9922A" />
      {[[36, 26], [70, 44], [116, 22], [154, 46]].map(([x, y], index) => (
        <motion.g key={index} animate={reduce ? undefined : { opacity: [0.45, 1, 0.45] }} transition={{ duration: 2.6 + index * 0.4, repeat: Infinity }}>
          <Star x={x} y={y} r={index % 2 ? 5 : 7} fill="#C9922A" />
        </motion.g>
      ))}
      <path d="M0 116l52-46 30 26 34-34 46 54z" fill={soft(a, "66")} />
      <path d="M96 116l40-34 44 34z" fill={a} />
      <Ground a={a} />
      <path d="M0 122q30 8 60 0t60 0 60 0 60 0" stroke="#2D9CDB" strokeWidth="4" fill="none" strokeLinecap="round" />
      <Tree x={30} y={116} s={0.8} a="#2F9E6C" />
    </>
  ),
  "who-is-prophet": ({ a }) => (
    <>
      <path d="M40 140q34-40 80-52t80-22" stroke={soft(a, "44")} strokeWidth="16" fill="none" strokeLinecap="round" />
      <Ground a={a} />
      <Mosque x={176} y={78} s={0.9} a={a} />
      <Lantern x={54} y={72} s={1} a="#C9922A" />
      <Book x={104} y={104} s={0.65} a={a} />
      <Star x={132} y={30} r={7} fill="#C9922A" />
    </>
  ),
  "five-pillars": ({ a }) => (
    <>
      <path d="M14 40h212l-14-16H28z" fill={soft(a, "55")} />
      <Ground a={a} />
      {["☝", "🕌", "🎁", "🌙", "🕋"].map((icon, index) => {
        const x = 34 + index * 43;
        return (
          <g key={icon}>
            <rect x={x - 12} y="52" width="24" height="62" rx="8" fill="#fff" stroke={a} strokeWidth="4" />
            <path d={`M${x - 16} 112h32`} stroke={a} strokeWidth="5" strokeLinecap="round" />
            <text x={x} y="80" textAnchor="middle" fontSize="16">{icon}</text>
          </g>
        );
      })}
    </>
  ),
  "six-articles": ({ a, reduce }) => (
    <>
      <motion.circle cx="120" cy="70" r="26" fill={soft(a, "22")} stroke={a} strokeWidth="4" animate={reduce ? undefined : { r: [26, 29, 26] }} transition={{ duration: 3, repeat: Infinity }} />
      <Book x={120} y={72} s={0.5} a={a} />
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (Math.PI / 3) * index - Math.PI / 2;
        const x = 120 + 78 * Math.cos(angle);
        const y = 70 + 46 * Math.sin(angle);
        return (
          <g key={index}>
            <path d={`M120 70L${x} ${y}`} stroke={soft(a, "55")} strokeWidth="2.5" />
            <circle cx={x} cy={y} r="13" fill="#fff" stroke={a} strokeWidth="3.5" />
            <Star x={x} y={y} r={7} fill="#C9922A" />
          </g>
        );
      })}
    </>
  ),
  kalimas: ({ a }) => (
    <>
      <path d="M40 44q80 44 160 0" stroke={soft(a, "66")} strokeWidth="3" fill="none" />
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const x = 40 + index * 32;
        const y = 44 + Math.sin((index / 5) * Math.PI) * 22;
        return <circle key={index} cx={x} cy={y} r="10" fill="#fff" stroke={a} strokeWidth="4" />;
      })}
      <Book x={120} y={104} s={0.9} a={a} />
    </>
  ),
  "basic-duas": ({ a }) => (
    <>
      <path d="M120 12l46 68H74z" fill="#FFF3C4" opacity="0.7" />
      <Star x={120} y={20} r={8} fill="#C9922A" />
      <Hand x={104} y={98} s={1.05} rotate={-14} a={a} />
      <Hand x={136} y={98} s={1.05} rotate={14} flip a={a} />
      <path d="M96 100q24 14 48 0" stroke={a} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {["🍽️", "🛏️", "🚪"].map((icon, index) => (
        <text key={icon} x={40 + index * 80} y="132" textAnchor="middle" fontSize="15">{icon}</text>
      ))}
    </>
  ),
  "islamic-greetings": ({ a }) => (
    <>
      <Ground a={a} />
      <Kid x={72} y={72} s={0.95} color={a} arm="wave" />
      <Kid x={168} y={72} s={0.95} color="#2D9CDB" scarf arm="wave" />
      <Heart x={120} y={44} s={1} fill="#E07A5F" />
      <Mosque x={120} y={92} s={0.4} a={soft(a, "77")} />
    </>
  ),
  "good-manners": ({ a }) => (
    <>
      <Ground a={a} />
      <Kid x={74} y={70} s={0.95} color={a} arm="offer" />
      <Kid x={166} y={70} s={0.95} color="#9B59B6" scarf arm="offer" />
      <rect x="108" y="66" width="24" height="20" rx="4" fill="#C9922A" />
      <path d="M120 66v20M108 74h24" stroke="#fff" strokeWidth="3" />
      <Heart x={120} y={36} s={0.8} fill="#E07A5F" />
    </>
  ),
  "respect-parents": ({ a }) => (
    <>
      <path d="M40 116V64l80-40 80 40v52z" fill={soft(a, "18")} stroke={a} strokeWidth="3" strokeLinejoin="round" />
      <Ground a={a} />
      <Kid x={90} y={62} s={0.85} color={a} arm="up" />
      <Kid x={150} y={62} s={0.85} color="#457B9D" scarf arm="idle" />
      <Kid x={120} y={84} s={0.6} color="#F4A261" arm="offer" />
      <Heart x={120} y={40} s={0.75} fill="#E07A5F" />
    </>
  ),
  cleanliness: ({ a }) => (
    <>
      <Ground a={a} />
      <path d="M44 36v12q0 8 8 8h30v10" stroke={a} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 86h84v4a22 22 0 0 1-22 22H62a22 22 0 0 1-22-22z" fill="#fff" stroke={a} strokeWidth="4" strokeLinejoin="round" />
      {[0, 1, 2].map((index) => <Drop key={index} x={82} y={74 + index * 12} s={0.55} fill="#2D9CDB" />)}
      <path d="M150 78h10l10 6 10-6h10l6 12-9 5v21h-34V95l-9-5z" fill="#fff" stroke={a} strokeWidth="3" strokeLinejoin="round" />
      <rect x="150" y="60" width="24" height="12" rx="5" fill={soft(a, "55")} stroke={a} strokeWidth="2.5" />
      <circle cx="186" cy="52" r="8" fill={soft(a, "33")} stroke={soft(a, "66")} strokeWidth="2" />
      <circle cx="203" cy="38" r="5.5" fill={soft(a, "22")} stroke={soft(a, "55")} strokeWidth="2" />
    </>
  ),
  kindness: ({ a }) => (
    <>
      <Ground a={a} />
      <Hand x={56} y={104} s={1} rotate={26} a={a} />
      <g transform="translate(150 84)">
        <ellipse cx="0" cy="12" rx="26" ry="16" fill={a} />
        <circle cx="-22" cy="-4" r="14" fill={a} />
        <path d="M-32 -14l4 10 8-6zM-12 -14l-4 10-8-6z" fill={a} />
        <circle cx="-27" cy="-6" r="2" fill="#fff" />
        <circle cx="-17" cy="-6" r="2" fill="#fff" />
        <path d="M24 8q14-6 12-20" stroke={a} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      <Heart x={100} y={40} s={0.9} fill="#E07A5F" />
    </>
  ),
  sharing: ({ a }) => (
    <>
      <Ground a={a} />
      <Hand x={52} y={104} s={0.95} rotate={28} a={a} />
      <Hand x={188} y={104} s={0.95} rotate={-28} flip a={a} />
      <path d="M118 40a22 22 0 0 0-22 22c0 16 12 26 22 30z" fill="#E76F51" />
      <path d="M122 40a22 22 0 0 1 22 22c0 16-12 26-22 30z" fill="#F4A261" />
      <path d="M120 38v-8" stroke="#2F9E6C" strokeWidth="4" strokeLinecap="round" />
      <path d="M120 32q10-8 16-2" stroke="#2F9E6C" strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  truthfulness: ({ a, reduce }) => (
    <>
      <path d="M0 116h240v24H0z" fill={soft(a, "33")} />
      <path d="M60 140q30-34 120-46" stroke={soft(a, "44")} strokeWidth="14" fill="none" strokeLinecap="round" />
      <motion.g animate={reduce ? undefined : { opacity: [0.75, 1, 0.75] }} transition={{ duration: 2.4, repeat: Infinity }}>
        <path d="M110 22l52 60-52 12-52-12z" fill="#FFF3C4" opacity="0.55" />
      </motion.g>
      <Lantern x={110} y={44} s={1.15} a="#C9922A" />
      <Star x={196} y={40} r={7} fill="#C9922A" />
    </>
  ),
  "helping-others": ({ a }) => (
    <>
      <Ground a={a} />
      <Kid x={82} y={68} s={0.95} color={a} arm="offer" />
      <Kid x={162} y={72} s={0.85} color="#457B9D" scarf arm="offer" />
      <rect x="112" y="78" width="30" height="24" rx="5" fill="#C9922A" />
      <path d="M120 78v-6h14v6" stroke="#C9922A" strokeWidth="4" fill="none" />
      <Heart x={120} y={34} s={0.7} fill="#E07A5F" />
    </>
  ),
  "mosque-etiquette": ({ a }) => (
    <>
      <Ground a={a} />
      <path d="M60 116V58a60 60 0 0 1 120 0v58z" fill={soft(a, "18")} stroke={a} strokeWidth="4" strokeLinejoin="round" />
      <path d="M96 116V76a24 24 0 0 1 48 0v40z" fill="#fff" stroke={a} strokeWidth="3" />
      <text x="120" y="100" textAnchor="middle" fontSize="18">🤫</text>
      <g>
        <path d="M22 108q10-8 20 0v8H22z" fill="#457B9D" />
        <path d="M198 108q10-8 20 0v8h-20z" fill="#457B9D" />
      </g>
      <Star x={120} y={30} r={6} fill="#C9922A" />
    </>
  ),
  ramadan: ({ a, reduce }) => (
    <>
      <rect x="0" y="0" width="240" height="140" fill={soft("#264653", "14")} />
      <Crescent x={62} y={40} s={1.2} fill="#C9922A" />
      {[[104, 26], [140, 44], [178, 24]].map(([x, y], index) => (
        <motion.g key={index} animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.2 + index * 0.5, repeat: Infinity }}>
          <Star x={x} y={y} r={5} fill="#F4E1A1" />
        </motion.g>
      ))}
      <Ground a={a} />
      <Lantern x={168} y={78} s={1.05} a="#C9922A" />
      <ellipse cx="86" cy="106" rx="26" ry="10" fill="#fff" stroke={a} strokeWidth="3" />
      {[70, 86, 102].map((x) => <ellipse key={x} cx={x} cy="102" rx="7" ry="5" fill="#8B5E34" />)}
    </>
  ),
  eid: ({ a }) => (
    <>
      <path d="M10 22q56 26 110 4t110 6" stroke={soft(a, "77")} strokeWidth="3" fill="none" />
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const x = 28 + index * 37;
        const y = 30 + Math.sin(index) * 6;
        return <path key={index} d={`M${x - 9} ${y}h18l-9 18z`} fill={index % 2 ? "#2F9E6C" : "#C9922A"} />;
      })}
      <Ground a={a} />
      <rect x="48" y="80" width="44" height="34" rx="6" fill="#E76F51" />
      <path d="M70 80v34M48 96h44" stroke="#FFF3C4" strokeWidth="5" />
      <circle cx="150" cy="104" r="11" fill="#F4A261" />
      <circle cx="176" cy="98" r="9" fill="#9B59B6" />
      <circle cx="196" cy="108" r="8" fill="#2D9CDB" />
      <Crescent x={196} y={40} s={0.9} fill="#C9922A" />
    </>
  ),
  angels: ({ a, reduce }) => (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.path
          key={index}
          d={`M120 18L${40 + index * 40} 120`}
          stroke={soft("#FFF3C4", "cc")}
          strokeWidth="16"
          strokeLinecap="round"
          animate={reduce ? undefined : { opacity: [0.25, 0.7, 0.25] }}
          transition={{ duration: 3 + index * 0.4, repeat: Infinity }}
        />
      ))}
      <circle cx="120" cy="24" r="14" fill="#FFF3C4" stroke="#C9922A" strokeWidth="3" />
      <Book x={120} y={100} s={0.9} a={a} />
      <Star x={44} y={40} r={6} fill={a} />
      <Star x={196} y={44} r={6} fill={a} />
    </>
  ),
  prophets: ({ a }) => (
    <>
      <Ground a={a} />
      <path d="M20 118q54-46 100-46t100-38" stroke={soft(a, "44")} strokeWidth="12" fill="none" strokeLinecap="round" />
      <g transform="translate(46 84)">
        <path d="M-22 4h44l-8 14h-28z" fill="#8B5E34" />
        <path d="M-12 4v-16h24v16z" fill="#fff" stroke={a} strokeWidth="3" />
      </g>
      <Star x={120} y={54} r={11} fill="#C9922A" />
      <Mosque x={196} y={68} s={0.62} a={a} />
    </>
  ),
  jannah: ({ a }) => (
    <>
      <Ground a={a} />
      <path d="M0 128q40-12 80 0t80 0 80 0" stroke="#2D9CDB" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M84 116V62a36 36 0 0 1 72 0v54z" fill={soft("#C9922A", "33")} stroke="#C9922A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M120 62v54M104 84h32" stroke="#C9922A" strokeWidth="3" />
      <Tree x={40} y={116} s={0.9} a={a} />
      <Tree x={200} y={116} s={0.9} a={a} />
      <Star x={120} y={26} r={7} fill="#C9922A" />
    </>
  ),
  "stories-prophets": ({ a }) => (
    <>
      <Book x={120} y={92} s={1.35} a={a} />
      <g transform="translate(74 66)">
        <path d="M-14 4h28l-6 10h-16z" fill="#8B5E34" />
        <path d="M-6 4v-10h12v10z" fill="#fff" stroke={a} strokeWidth="2" />
      </g>
      <g transform="translate(166 66)">
        <ellipse cx="0" cy="4" rx="18" ry="10" fill="#2D9CDB" />
        <path d="M16 -2l10-8v16z" fill="#2D9CDB" />
        <circle cx="-8" cy="1" r="2" fill="#fff" />
      </g>
      <Star x={120} y={26} r={8} fill="#C9922A" />
    </>
  ),
  sahabah: ({ a }) => (
    <>
      <Lantern x={120} y={80} s={1.2} a={a} />
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (2 * Math.PI * index) / 5 - Math.PI / 2;
        return <Star key={index} x={120 + 82 * Math.cos(angle)} y={72 + 44 * Math.sin(angle)} r={9} fill="#C9922A" />;
      })}
      <Ground a={a} />
    </>
  ),
  "animals-quran": ({ a }) => (
    <>
      <Ground a={a} />
      <Tree x={40} y={116} s={0.85} a="#2F9E6C" />
      <g transform="translate(112 52)">
        <ellipse cx="0" cy="0" rx="16" ry="11" fill="#F4C542" />
        <path d="M-8 -8v16M2 -10v20" stroke="#3B3024" strokeWidth="4" />
        <ellipse cx="-4" cy="-14" rx="12" ry="7" fill="#fff" opacity="0.75" />
        <circle cx="14" cy="-3" r="2.5" fill="#3B3024" />
      </g>
      <g transform="translate(178 100)">
        <ellipse cx="0" cy="0" rx="12" ry="8" fill="#8B5E34" />
        <circle cx="-13" cy="-3" r="6" fill="#8B5E34" />
        <path d="M-16 -8l-6-6M-11 -9l-3-8" stroke="#8B5E34" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g transform="translate(80 96)">
        <ellipse cx="0" cy="0" rx="14" ry="10" fill="#2D9CDB" />
        <circle cx="-12" cy="-6" r="7" fill="#2D9CDB" />
        <path d="M-18 -7l-6 2 6 3z" fill="#F4A261" />
        <path d="M4 -4q12-6 16 2-8 6-16 2z" fill="#5AB4EE" />
      </g>
    </>
  ),
  "daily-sunnah": ({ a }) => (
    <>
      <circle cx="34" cy="34" r="16" fill="#F4C542" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
        const angle = (Math.PI / 4) * index;
        return <path key={index} d={`M${34 + 20 * Math.cos(angle)} ${34 + 20 * Math.sin(angle)}L${34 + 26 * Math.cos(angle)} ${34 + 26 * Math.sin(angle)}`} stroke="#F4C542" strokeWidth="4" strokeLinecap="round" />;
      })}
      <path d="M24 92h192" stroke={soft(a, "55")} strokeWidth="6" strokeLinecap="round" />
      {["😊", "✋", "👋"].map((icon, index) => {
        const x = 66 + index * 62;
        return (
          <g key={icon}>
            <circle cx={x} cy="92" r="20" fill="#fff" stroke={a} strokeWidth="4" />
            <text x={x} y="99" textAnchor="middle" fontSize="18">{icon}</text>
          </g>
        );
      })}
      <Ground a={a} />
    </>
  ),
  "halal-haram": ({ a }) => (
    <>
      <path d="M120 24v76M84 100h72" stroke={a} strokeWidth="6" strokeLinecap="round" />
      <path d="M46 44h148" stroke={a} strokeWidth="5" strokeLinecap="round" />
      <path d="M120 30L46 44M120 30l74 14" stroke={soft(a, "88")} strokeWidth="3" />
      <path d="M24 62h44l-22 26z" fill={soft("#27AE60", "44")} stroke="#27AE60" strokeWidth="3" strokeLinejoin="round" />
      <path d="M172 62h44l-22 26z" fill={soft("#E76F51", "33")} stroke="#E76F51" strokeWidth="3" strokeLinejoin="round" />
      <path d="M36 68l6 8 12-14" stroke="#27AE60" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M186 66l14 14M200 66l-14 14" stroke="#E76F51" strokeWidth="4" strokeLinecap="round" />
      <Ground a={a} />
    </>
  ),
  "wudu-prayer": ({ a }) => (
    <>
      <Ground a={a} />
      <path d="M30 40h18v16" stroke={a} strokeWidth="6" fill="none" strokeLinecap="round" />
      {[0, 1, 2].map((index) => <Drop key={index} x={48} y={64 + index * 12} s={0.55} fill="#2D9CDB" />)}
      {[1, 2, 3, 4].map((number, index) => <Marker key={number} x={92 + index * 30} y={52} label={String(number)} a={a} />)}
      <path d="M78 92h124l-8 24H86z" fill={soft(a, "33")} stroke={a} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M126 92a14 14 0 0 1 28 0" fill="none" stroke={a} strokeWidth="3" />
    </>
  ),
  "seerah-timeline": ({ a }) => (
    <>
      <Ground a={a} />
      <path d="M24 84h192" stroke={soft(a, "55")} strokeWidth="6" strokeLinecap="round" />
      <g transform="translate(48 62)">
        <rect x="-16" y="-16" width="32" height="32" rx="4" fill="#3B3024" />
        <rect x="-16" y="-4" width="32" height="6" fill="#C9922A" />
      </g>
      <g transform="translate(120 62)">
        <path d="M-20 16a20 20 0 0 1 40 0z" fill="#8B5E34" />
        <path d="M-8 16a8 12 0 0 1 16 0z" fill="#3B3024" />
      </g>
      <Mosque x={192} y={56} s={0.5} a={a} />
      {[48, 120, 192].map((x) => <circle key={x} cx={x} cy="84" r="8" fill="#fff" stroke={a} strokeWidth="4" />)}
    </>
  ),
  "islamic-ethics": ({ a }) => (
    <>
      <circle cx="72" cy="70" r="34" fill="#fff" stroke={a} strokeWidth="5" />
      <circle cx="72" cy="70" r="26" fill={soft(a, "14")} />
      <path d="M72 46l8 20-20 28 6-24z" fill={a} />
      <circle cx="72" cy="70" r="4" fill="#fff" />
      <path d="M170 34v66M142 100h56" stroke={a} strokeWidth="5" strokeLinecap="round" />
      <path d="M138 50h64" stroke={a} strokeWidth="4" strokeLinecap="round" />
      <path d="M126 60h28l-14 20z" fill={soft(a, "33")} stroke={a} strokeWidth="3" strokeLinejoin="round" />
      <path d="M186 60h28l-14 20z" fill={soft(a, "33")} stroke={a} strokeWidth="3" strokeLinejoin="round" />
      <Ground a={a} />
    </>
  ),
  "patience-gratitude": ({ a }) => (
    <>
      <Ground a={a} />
      <circle cx="200" cy="34" r="15" fill="#F4C542" />
      <g transform="translate(52 116)">
        <ellipse cx="0" cy="-6" rx="9" ry="12" fill="#8B5E34" />
        <path d="M0 -18v-8" stroke="#2F9E6C" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(120 116)">
        <path d="M0 0v-32" stroke="#8B5E34" strokeWidth="5" strokeLinecap="round" />
        <path d="M0 -20q-16-4-18-18 16-2 18 14z" fill="#52B788" />
        <path d="M0 -26q16-4 18-18-16-2-18 14z" fill="#2F9E6C" />
      </g>
      <Tree x={192} y={116} s={1.15} a="#2F9E6C" />
      <path d="M40 128h168" stroke={soft(a, "44")} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  "honesty-leadership": ({ a }) => (
    <>
      <path d="M0 140q60-16 108-52T240 40v100z" fill={soft(a, "22")} />
      <Ground a={a} />
      {[0, 1, 2, 3].map((index) => (
        <ellipse key={index} cx={44 + index * 34} cy={112 - index * 16} rx="9" ry="5" fill={soft(a, "77")} transform={`rotate(${index % 2 ? -12 : 12} ${44 + index * 34} ${112 - index * 16})`} />
      ))}
      <path d="M186 96V34" stroke={a} strokeWidth="5" strokeLinecap="round" />
      <path d="M186 36h40l-10 12 10 12h-40z" fill="#C9922A" />
      <path d="M188 46l5 6 10-10" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </>
  ),
};

function Scene({ topicId, spec, reduce }: { topicId: string; spec: VisualSpec; reduce: boolean }) {
  const render = SCENES[topicId] ?? SCENES["who-is-allah"];
  return (
    <svg viewBox="0 0 240 140" role="img" aria-label={spec.alt} preserveAspectRatio="xMidYMid meet">
      <rect x="0" y="0" width="240" height="140" fill={spec.sky} rx="18" />
      {render({ a: spec.accent, reduce })}
    </svg>
  );
}

export default function StepVisual({
  topicId,
  step,
  compact = false,
}: {
  topicId: string;
  step?: LessonStep;
  compact?: boolean;
}) {
  const reduce = Boolean(useReducedMotion());
  const spec = TOPIC_VISUALS[topicId] ?? TOPIC_VISUALS["who-is-allah"];

  return (
    <div className={`ik-step-visual ${compact ? "compact" : ""}`} style={{ "--ik-visual-accent": spec.accent } as CSSProperties}>
      <Scene topicId={topicId} spec={spec} reduce={reduce} />
      {!compact && (
        <>
          {step?.emoji && <span className="ik-step-visual-emoji" aria-hidden="true">{step.emoji}</span>}
          <div className="ik-visual-labels" aria-label="Key ideas">
            {spec.labels.slice(0, step?.type === "intro" ? 3 : spec.labels.length).map((label) => <span key={label}>{label}</span>)}
          </div>
          {step && <span className="ik-visual-type">{step.type === "tap" || step.type === "fact" ? "Explore" : step.type === "mascot" ? "Noori's tip" : "Learn"}</span>}
        </>
      )}
    </div>
  );
}

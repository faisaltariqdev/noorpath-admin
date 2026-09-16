import type { SalahPosture } from "../types";

/**
 * Side-view articulated rig for the Namaz posture figure.
 *
 * Convention: every segment has an ABSOLUTE direction angle in degrees where
 *   0   = pointing straight down (+y)
 *   90  = pointing forward / right (+x)  — the figure faces the Qiblah (right)
 *   180 = pointing straight up (−y)
 *   −90 = pointing backward / left (−x)
 *
 * Forward kinematics starts at the hip. Angles are interpolated with springs,
 * so moving between two postures animates the whole body (bend into Ruku,
 * fold down into Sujood, rise for Qawma …).
 */

export const RIG = {
  torso: 62,
  neck: 14,
  headRadius: 19,
  upperArm: 34,
  forearm: 32,
  hand: 10,
  thigh: 50,
  shin: 48,
  foot: 20,
  /** y of the prayer mat surface inside the 260×280 viewBox */
  ground: 246,
} as const;

export interface RigPose {
  hipX: number;
  hipY: number;
  torso: number;
  head: number;
  upperArm: number;
  forearm: number;
  thigh: number;
  shin: number;
  foot: number;
  /** 0 = profile (looking toward Qiblah), 1 = face turned to viewer */
  faceTurn: number;
}

/** A short, child-readable body check attached to a rig point. */
export interface BodyCheck {
  label: string;
  anchor: "head" | "eye" | "shoulder" | "elbow" | "hand" | "hip" | "knee" | "ankle" | "toes" | "back" | "forehead";
  /** label offset from anchor, in viewBox units */
  dx: number;
  dy: number;
}

export interface PostureSpec {
  pose: RigPose;
  /** English + Arabic display name of the posture */
  name: string;
  arabic: string;
  checks: BodyCheck[];
  /** Points that must touch the ground (Sujood) — rendered as glowing dots. */
  groundPoints?: Array<BodyCheck["anchor"]>;
}

const STANDING: RigPose = {
  hipX: 112,
  hipY: 148,
  torso: 180,
  head: 172,
  upperArm: 22,
  forearm: 128,
  thigh: 0,
  shin: 0,
  foot: 90,
  faceTurn: 0,
};

const SITTING: RigPose = {
  hipX: 101,
  hipY: 237,
  torso: 176,
  head: 176,
  upperArm: 15,
  forearm: 40,
  thigh: 80,
  shin: -90,
  foot: -100,
  faceTurn: 0,
};

export const POSTURES: Record<Exclude<SalahPosture, `wudu-${string}`>, PostureSpec> = {
  overview: {
    pose: { ...STANDING, upperArm: 8, forearm: 6 },
    name: "Ready to pray",
    arabic: "الاِسْتِعْدَاد",
    checks: [
      { label: "Clean with wudu", anchor: "hand", dx: 26, dy: 6 },
      { label: "Face the Qiblah", anchor: "eye", dx: 28, dy: -18 },
      { label: "Calm heart & intention", anchor: "shoulder", dx: -96, dy: 12 },
    ],
  },
  standing: {
    pose: STANDING,
    name: "Standing (Qiyam)",
    arabic: "القِيَام",
    checks: [
      { label: "Eyes on the mat", anchor: "eye", dx: 26, dy: -16 },
      { label: "Hands folded", anchor: "hand", dx: 24, dy: 8 },
      { label: "Feet steady, facing Qiblah", anchor: "toes", dx: 14, dy: -14 },
    ],
  },
  takbir: {
    pose: { ...STANDING, upperArm: 96, forearm: 178 },
    name: "Takbir (Allahu Akbar)",
    arabic: "تَكْبِيرَةُ الإِحْرَام",
    checks: [
      { label: "Hands up to the ears", anchor: "hand", dx: 22, dy: -12 },
      { label: "Palms face forward", anchor: "elbow", dx: 22, dy: 16 },
      { label: "Then fold the hands", anchor: "hip", dx: -100, dy: -6 },
    ],
  },
  bowing: {
    // hips back, back flat, hands reaching the knees
    pose: {
      hipX: 100,
      hipY: 150,
      torso: 100,
      head: 102,
      upperArm: -30,
      forearm: -30,
      thigh: 12,
      shin: -4,
      foot: 90,
      faceTurn: 0,
    },
    name: "Bowing (Ruku)",
    arabic: "الرُّكُوع",
    checks: [
      { label: "Back flat like a table", anchor: "back", dx: -70, dy: -40 },
      { label: "Hands hold the knees", anchor: "hand", dx: 22, dy: 10 },
      { label: "Head level with back", anchor: "head", dx: 28, dy: 30 },
    ],
  },
  rising: {
    pose: { ...STANDING, upperArm: 6, forearm: 4, head: 174 },
    name: "Rising (Qawma)",
    arabic: "القَوْمَة",
    checks: [
      { label: "Stand tall & still", anchor: "shoulder", dx: -104, dy: -6 },
      { label: "Arms relax at sides", anchor: "hand", dx: 22, dy: 6 },
      { label: "Pause, then Sujood", anchor: "knee", dx: 22, dy: 0 },
    ],
  },
  prostration: {
    // hips raised, knees + toes on the mat, forehead on the mat, palms beside the head
    pose: {
      hipX: 112,
      hipY: 200,
      torso: 78,
      head: 62,
      upperArm: 70,
      forearm: 45,
      thigh: -22,
      shin: -110, // heel lifts, toes tucked on the mat
      foot: -10,
      faceTurn: 0,
    },
    name: "Prostration (Sujood)",
    arabic: "السُّجُود",
    checks: [
      // figure sits low in the frame, so all labels float above it
      { label: "Forehead & nose on the mat", anchor: "forehead", dx: -60, dy: -125 },
      { label: "Both palms flat", anchor: "hand", dx: -10, dy: -58 },
      { label: "Knees & toes on the mat", anchor: "knee", dx: -70, dy: -90 },
    ],
    groundPoints: ["forehead", "hand", "knee", "toes"],
  },
  sitting: {
    // sitting on the heels: knees on the mat, shins flat, hands on the thighs
    pose: SITTING,
    name: "Sitting (Jalsa / Qa‘dah)",
    arabic: "الجُلُوس",
    checks: [
      { label: "Sit on the heels calmly", anchor: "hip", dx: -100, dy: -34 },
      { label: "Hands rest on thighs", anchor: "hand", dx: 20, dy: 8 },
      { label: "Back upright", anchor: "shoulder", dx: -96, dy: -14 },
    ],
  },
  salam: {
    pose: { ...SITTING, head: 180, faceTurn: 1 },
    name: "Salam",
    arabic: "التَّسْلِيم",
    checks: [
      { label: "Turn the head to the shoulder", anchor: "head", dx: 30, dy: -18 },
      { label: "Say the salam clearly", anchor: "eye", dx: 30, dy: 10 },
      { label: "Stay seated", anchor: "hand", dx: 20, dy: 12 },
    ],
  },
};

export function isWuduPosture(p: SalahPosture): p is Extract<SalahPosture, `wudu-${string}`> {
  return p.startsWith("wudu-");
}

/** Resolve a posture to its rig spec; wudu steps fall back to "overview". */
export function specFor(posture: SalahPosture): PostureSpec {
  if (isWuduPosture(posture)) return POSTURES.overview;
  return POSTURES[posture];
}

export interface Pt {
  x: number;
  y: number;
}

export interface RigPoints {
  hip: Pt;
  shoulder: Pt;
  neck: Pt;
  head: Pt;
  eye: Pt;
  forehead: Pt;
  elbow: Pt;
  hand: Pt;
  fingertip: Pt;
  knee: Pt;
  ankle: Pt;
  toes: Pt;
  back: Pt;
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const step = (from: Pt, angle: number, len: number): Pt => ({
  x: from.x + Math.sin(rad(angle)) * len,
  y: from.y + Math.cos(rad(angle)) * len,
});

/** Forward kinematics — pose angles → world points. Pure and cheap. */
export function solve(p: RigPose): RigPoints {
  const hip = { x: p.hipX, y: p.hipY };
  const shoulder = step(hip, p.torso, RIG.torso);
  const neck = step(shoulder, p.head, RIG.neck);
  const head = step(neck, p.head, RIG.headRadius);
  // Face features rotate with the head: the face points 90° "in front of" the head
  // direction (toward the Qiblah when upright, toward the floor in Ruku/Sujood).
  const eye = step(step(head, p.head - 90, RIG.headRadius * 0.45 * (1 - p.faceTurn * 0.7)), p.head, RIG.headRadius * 0.15);
  // forehead = the point of the head furthest along the head direction
  const forehead = step(head, p.head, RIG.headRadius * 0.95);
  const elbow = step(shoulder, p.upperArm, RIG.upperArm);
  const hand = step(elbow, p.forearm, RIG.forearm);
  const fingertip = step(hand, p.forearm, RIG.hand);
  const knee = step(hip, p.thigh, RIG.thigh);
  const ankle = step(knee, p.shin, RIG.shin);
  const toes = step(ankle, p.foot, RIG.foot);
  const back = { x: (hip.x + shoulder.x) / 2, y: (hip.y + shoulder.y) / 2 };
  return { hip, shoulder, neck, head, eye, forehead, elbow, hand, fingertip, knee, ankle, toes, back };
}

export const POSE_KEYS = [
  "hipX",
  "hipY",
  "torso",
  "head",
  "upperArm",
  "forearm",
  "thigh",
  "shin",
  "foot",
  "faceTurn",
] as const satisfies ReadonlyArray<keyof RigPose>;

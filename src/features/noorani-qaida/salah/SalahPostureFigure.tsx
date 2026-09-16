"use client";

import { AnimatePresence, motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useMemo } from "react";
import type { SalahPosture } from "../types";
import { POSE_KEYS, RIG, type BodyCheck, type Pt, type RigPoints, type RigPose, solve, specFor } from "./postureRig";

interface SalahPostureFigureProps {
  posture: SalahPosture;
  reducedMotion: boolean;
  /** For the salam posture: which shoulder the head turns to. */
  salamSide?: "right" | "left";
  /** Show the body-check callouts (default true). */
  showChecks?: boolean;
  /** Bump this number to replay the movement into the current posture. */
  replayToken?: number;
  className?: string;
}

/**
 * Cartoon palette — white thobe + white kufi on a soft mint "mosque" sky,
 * green prayer mat. Near limbs are pure white, far limbs a shade darker so the
 * body reads in depth even though it is a flat side view.
 */
const COLORS = {
  thobe: "#ffffff",
  thobeFar: "#dbe4ec",
  thobeShade: "#e8eef3",
  skin: "#f7cfae",
  skinFar: "#e3b08a",
  hair: "#2a1a10",
  kufi: "#ffffff",
  kufiShade: "#cfd8e3",
  outline: "#3a4a5c",
  outlineSoft: "#7c8da0",
  blush: "#fb9aa8",
  mat: "#10b981",
  matDark: "#059669",
  matDeep: "#047857",
  cream: "#fdf6e3",
  glow: "#f59e0b",
  sky1: "#f0fdf9",
  sky2: "#d5f5e8",
  silhouette: "#a7e8d0",
  ghost: "#64748b",
} as const;

const SPRING = { stiffness: 110, damping: 17, mass: 0.9 };

const rad = (deg: number) => (deg * Math.PI) / 180;
const stepPt = (from: Pt, angle: number, len: number): Pt => ({
  x: from.x + Math.sin(rad(angle)) * len,
  y: from.y + Math.cos(rad(angle)) * len,
});
const unit = (angle: number): Pt => ({ x: Math.sin(rad(angle)), y: Math.cos(rad(angle)) });
const line = (...pts: Pt[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
const shift = (p: Pt, dx: number, dy = 0): Pt => ({ x: p.x + dx, y: p.y + dy });
/** Arc on a circle around `c` from angle a1 to a2 (rig angle convention). */
const arc = (c: Pt, r: number, a1: number, a2: number) => {
  const a = stepPt(c, a1, r);
  const b = stepPt(c, a2, r);
  const sweep = a1 > a2 ? 1 : 0;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 0 ${sweep} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
};

const STAR = "M0 -4.2 L1.3 -1.3 L4.2 0 L1.3 1.3 L0 4.2 L-1.3 1.3 L-4.2 0 L-1.3 -1.3 Z";

/** Which posture we were in before — used to decide the "previous" pose for replay. */
function usePoseSprings(target: RigPose, reducedMotion: boolean, replayToken: number | undefined, previous: RigPose | null) {
  const hipX = useSpring(target.hipX, SPRING);
  const hipY = useSpring(target.hipY, SPRING);
  const torso = useSpring(target.torso, SPRING);
  const head = useSpring(target.head, SPRING);
  const upperArm = useSpring(target.upperArm, SPRING);
  const forearm = useSpring(target.forearm, SPRING);
  const thigh = useSpring(target.thigh, SPRING);
  const shin = useSpring(target.shin, SPRING);
  const foot = useSpring(target.foot, SPRING);
  const faceTurn = useSpring(target.faceTurn, SPRING);
  // Order MUST match POSE_KEYS.
  const springs = useMemo(
    () => [hipX, hipY, torso, head, upperArm, forearm, thigh, shin, foot, faceTurn],
    [hipX, hipY, torso, head, upperArm, forearm, thigh, shin, foot, faceTurn],
  );

  useEffect(() => {
    springs.forEach((s, i) => {
      const k = POSE_KEYS[i];
      if (reducedMotion) s.jump(target[k]);
      else s.set(target[k]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reducedMotion]);

  // Replay: snap back to the previous posture, then spring into the current one.
  useEffect(() => {
    if (!replayToken || reducedMotion || !previous) return;
    springs.forEach((s, i) => s.jump(previous[POSE_KEYS[i]]));
    const t = window.setTimeout(() => springs.forEach((s, i) => s.set(target[POSE_KEYS[i]])), 120);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayToken]);

  return springs as unknown as MotionValue<number>[];
}

/** Outlined cartoon limb: dark outline underneath, coloured stroke on top. */
function Limb({ d, width, fill, outline = COLORS.outline }: { d: MotionValue<string>; width: number; fill: string; outline?: string }) {
  return (
    <>
      <motion.path d={d} stroke={outline} strokeWidth={width + 2.6} />
      <motion.path d={d} stroke={fill} strokeWidth={width} />
    </>
  );
}

export default function SalahPostureFigure({
  posture,
  reducedMotion,
  salamSide,
  showChecks = true,
  replayToken,
  className,
}: SalahPostureFigureProps) {
  const spec = specFor(posture);

  // Sensible "previous" pose for replay: the natural movement source for each posture.
  const previous = useMemo<RigPose | null>(() => {
    switch (posture) {
      case "takbir":
        return specFor("overview").pose;
      case "bowing":
        return specFor("standing").pose;
      case "rising":
        return specFor("bowing").pose;
      case "prostration":
        return specFor("rising").pose;
      case "sitting":
        return specFor("prostration").pose;
      case "salam":
        return { ...specFor("sitting").pose, faceTurn: 0 };
      case "standing":
        return specFor("takbir").pose;
      default:
        return null;
    }
  }, [posture]);

  const springs = usePoseSprings(spec.pose, reducedMotion, replayToken, previous);

  const pts = useTransform(springs, (vals: number[]) => {
    const pose = Object.fromEntries(POSE_KEYS.map((k, i) => [k, vals[i]])) as unknown as RigPose;
    return { pose, p: solve(pose) };
  });

  // ---- Derived drawing values (one MotionValue per drawn element) ----
  const torsoD = useTransform(pts, ({ p }) => line(p.hip, p.shoulder));
  const torsoShadeD = useTransform(pts, ({ p, pose }) => {
    // thin shade along the back edge of the thobe gives the torso some volume
    const back = unit(pose.torso + 90);
    return line(shift(p.hip, -back.x * 8, -back.y * 8), shift(p.shoulder, -back.x * 8, -back.y * 8));
  });
  const torsoFarD = useTransform(pts, ({ p }) => line(shift(p.hip, -5, 2), shift(p.shoulder, -5, 2)));
  const nearLegD = useTransform(pts, ({ p }) => line(p.hip, p.knee, p.ankle));
  const farLegD = useTransform(pts, ({ p }) => line(shift(p.hip, -9, 1), shift(p.knee, -9, 1), shift(p.ankle, -9, 1)));
  const nearFootD = useTransform(pts, ({ p }) => line(p.ankle, p.toes));
  const farFootD = useTransform(pts, ({ p }) => line(shift(p.ankle, -9, 1), shift(p.toes, -9, 1)));
  const nearArmD = useTransform(pts, ({ p }) => line(p.shoulder, p.elbow, p.hand));
  const farArmD = useTransform(pts, ({ p }) => line(shift(p.shoulder, -8, 2), shift(p.elbow, -8, 2), shift(p.hand, -8, 2)));
  const neckD = useTransform(pts, ({ p }) => line(p.shoulder, p.neck));
  const handX = useTransform(pts, ({ p }) => p.hand.x + (p.fingertip.x - p.hand.x) * 0.5);
  const handY = useTransform(pts, ({ p }) => p.hand.y + (p.fingertip.y - p.hand.y) * 0.5);
  const farHandX = useTransform(pts, ({ p }) => p.hand.x - 8 + (p.fingertip.x - p.hand.x) * 0.5);
  const farHandY = useTransform(pts, ({ p }) => p.hand.y + 2 + (p.fingertip.y - p.hand.y) * 0.5);
  const headX = useTransform(pts, ({ p }) => p.head.x);
  const headY = useTransform(pts, ({ p }) => p.head.y);

  // Face — everything is placed relative to the head direction so it rotates
  // with the head (looks at the mat in Ruku, at the floor in Sujood).
  const eyeX = useTransform(pts, ({ p }) => p.eye.x);
  const eyeY = useTransform(pts, ({ p }) => p.eye.y);
  const pupilX = useTransform(pts, ({ p, pose }) => stepPt(p.eye, pose.head - 90, 0.9 * (1 - pose.faceTurn)).x);
  const pupilY = useTransform(pts, ({ p, pose }) => stepPt(p.eye, pose.head - 90, 0.9 * (1 - pose.faceTurn)).y);
  const pupilShineY = useTransform(pupilY, (n) => n - 0.9);
  // Second eye appears when the face turns toward the viewer (salam)
  const eye2 = useTransform(pts, ({ p, pose }) =>
    stepPt(stepPt(p.head, pose.head + 90, RIG.headRadius * 0.28 * pose.faceTurn), pose.head, RIG.headRadius * 0.15),
  );
  const eye2X = useTransform(eye2, (e) => e.x);
  const eye2Y = useTransform(eye2, (e) => e.y);
  const eye2ShineY = useTransform(eye2, (e) => e.y - 0.9);
  const faceTurnMV = useTransform(pts, ({ pose }) => pose.faceTurn);
  const blush2Opacity = useTransform(faceTurnMV, (n) => n * 0.5);
  const earOpacity = useTransform(pts, ({ pose }) => 1 - pose.faceTurn);
  const browD = useTransform(pts, ({ p, pose }) => {
    const c = stepPt(p.eye, pose.head, 6.4);
    const fwd = unit(pose.head - 90);
    const up = unit(pose.head);
    return `M ${c.x - fwd.x * 3.4} ${c.y - fwd.y * 3.4} Q ${c.x + up.x * 2} ${c.y + up.y * 2} ${c.x + fwd.x * 3.4} ${c.y + fwd.y * 3.4}`;
  });
  const brow2D = useTransform(eye2, (e) => {
    const c = { x: e.x, y: e.y - 6.4 };
    return `M ${c.x - 3.4} ${c.y} Q ${c.x} ${c.y - 2} ${c.x + 3.4} ${c.y}`;
  });
  const blushX = useTransform(pts, ({ p, pose }) => stepPt(stepPt(p.eye, pose.head + 180, 6.5), pose.head - 90, 1.5).x);
  const blushY = useTransform(pts, ({ p, pose }) => stepPt(stepPt(p.eye, pose.head + 180, 6.5), pose.head - 90, 1.5).y);
  const blush2X = useTransform(eye2, (e) => e.x);
  const blush2Y = useTransform(eye2, (e) => e.y + 6.5);
  const earX = useTransform(pts, ({ p, pose }) => stepPt(p.head, pose.head + 90, RIG.headRadius * 0.82).x);
  const earY = useTransform(pts, ({ p, pose }) => stepPt(p.head, pose.head + 90, RIG.headRadius * 0.82).y);
  // Mouth sits at the lower-front of the face; rotates with the head.
  const smileD = useTransform(pts, ({ p, pose }) => {
    const c = stepPt(p.head, pose.head - 140 - 40 * pose.faceTurn, RIG.headRadius * (0.55 - 0.05 * pose.faceTurn));
    const w = 4.5 + 3 * pose.faceTurn;
    const fwd = unit(pose.head - 90);
    const down = unit(pose.head + 180);
    return `M ${c.x - fwd.x * w} ${c.y - fwd.y * w} Q ${c.x + down.x * 4} ${c.y + down.y * 4} ${c.x + fwd.x * w} ${c.y + fwd.y * w}`;
  });
  // Hair peeks out under the kufi at the front and back of the head.
  const hairFrontD = useTransform(pts, ({ p, pose }) => arc(p.head, RIG.headRadius - 2, pose.head - 58, pose.head - 96));
  const hairBackD = useTransform(pts, ({ p, pose }) => arc(p.head, RIG.headRadius - 2, pose.head + 104, pose.head + 58));
  // Kufi cap: thick arc across the TOP of the head.
  const kufiD = useTransform(pts, ({ p, pose }) => arc(p.head, RIG.headRadius - 1, pose.head + 60, pose.head - 60));
  const kufiShadeD = useTransform(pts, ({ p, pose }) => arc(p.head, RIG.headRadius - 5.5, pose.head + 58, pose.head - 58));

  // Soft ground shadow that stretches with the body.
  const shadowX = useTransform(pts, ({ p }) => (Math.min(p.toes.x, p.hip.x, p.head.x) + Math.max(p.toes.x, p.hip.x, p.forehead.x)) / 2);
  const shadowRx = useTransform(pts, ({ p }) => {
    const xs = [p.toes.x, p.ankle.x, p.hip.x, p.head.x, p.forehead.x, p.hand.x];
    return Math.max(22, Math.min(95, (Math.max(...xs) - Math.min(...xs)) / 2 + 10));
  });

  // Ground contact dots for Sujood
  const groundDots = spec.groundPoints ?? [];

  // Static snapshots for labels / ghost / sparkles (they don't need to track the spring).
  const targetPts = useMemo(() => solve(spec.pose), [spec.pose]);
  const ghostPts = useMemo(() => (previous ? solve(previous) : null), [previous]);

  const salamArrow = posture === "salam" ? salamSide ?? "right" : null;
  const arrivalKey = `${posture}-${salamSide ?? ""}-${replayToken ?? 0}`;

  return (
    <svg viewBox="0 0 300 280" className={className} role="img" aria-label={`${spec.name} posture illustration`}>
      <defs>
        <linearGradient id="np-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={COLORS.sky1} />
          <stop offset="1" stopColor={COLORS.sky2} />
        </linearGradient>
        <linearGradient id="np-mat" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={COLORS.matDark} />
          <stop offset="0.5" stopColor={COLORS.mat} />
          <stop offset="1" stopColor={COLORS.matDark} />
        </linearGradient>
        <radialGradient id="np-glow">
          <stop offset="0" stopColor={COLORS.glow} stopOpacity="0.9" />
          <stop offset="1" stopColor={COLORS.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="np-shadow">
          <stop offset="0" stopColor="#065f46" stopOpacity="0.28" />
          <stop offset="1" stopColor="#065f46" stopOpacity="0" />
        </radialGradient>
        <filter id="np-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#064e3b" floodOpacity="0.16" />
        </filter>
        <clipPath id="np-frame">
          <rect x="0" y="0" width="300" height="280" rx="18" />
        </clipPath>
      </defs>

      <g clipPath="url(#np-frame)">
        {/* ---- Background: mint sky, mosque silhouette, crescent ---- */}
        <rect x="0" y="0" width="300" height="280" fill="url(#np-sky)" />
        <g fill={COLORS.silhouette} opacity="0.55">
          {/* minarets */}
          <rect x="40" y="96" width="9" height="130" rx="2" />
          <path d="M 36 98 L 44.5 82 L 53 98 Z" />
          <rect x="251" y="104" width="9" height="122" rx="2" />
          <path d="M 247 106 L 255.5 90 L 264 106 Z" />
          {/* side domes */}
          <path d="M 66 226 L 66 190 Q 92 158 118 190 L 118 226 Z" />
          <path d="M 182 226 L 182 190 Q 208 158 234 190 L 234 226 Z" />
          {/* main dome */}
          <path d="M 100 226 L 100 176 Q 150 108 200 176 L 200 226 Z" />
          <rect x="148.5" y="96" width="3" height="16" rx="1" />
          {/* base wall */}
          <rect x="30" y="222" width="240" height="26" />
        </g>
        {/* crescent moon */}
        <path d="M 206 40 A 12 12 0 1 0 220 56 A 9 9 0 1 1 206 40 Z" fill="#fde68a" opacity="0.85" />
        {/* gentle ground haze */}
        <rect x="0" y="236" width="300" height="44" fill="#c9f1e2" opacity="0.7" />

        {/* hanging leaves (top-left) */}
        <g fill="#6ee7b7" opacity="0.8">
          <path d="M 0 0 Q 26 6 30 34 Q 8 30 0 8 Z" />
          <path d="M 0 0 Q 10 22 6 46 Q -4 26 0 4 Z" />
          <path d="M 12 0 Q 40 2 48 22 Q 26 24 12 6 Z" fill="#34d399" />
        </g>
        <g fill="#6ee7b7" opacity="0.8">
          <path d="M 300 0 Q 274 6 270 34 Q 292 30 300 8 Z" />
          <path d="M 288 0 Q 260 2 252 22 Q 274 24 288 6 Z" fill="#34d399" />
        </g>

        {/* ---- Prayer mat (perspective strip) + mihrab + Qiblah marker ---- */}
        <g>
          <path d={`M 22 ${RIG.ground + 2} L 262 ${RIG.ground + 2} L 284 ${RIG.ground + 24} L 4 ${RIG.ground + 24} Z`} fill="url(#np-mat)" />
          <path d={`M 32 ${RIG.ground + 5} L 254 ${RIG.ground + 5} L 272 ${RIG.ground + 21} L 16 ${RIG.ground + 21} Z`} fill="none" stroke={COLORS.cream} strokeOpacity="0.9" strokeWidth="1.6" />
          <path d={`M 40 ${RIG.ground + 8} L 248 ${RIG.ground + 8} L 262 ${RIG.ground + 18} L 28 ${RIG.ground + 18} Z`} fill="none" stroke={COLORS.cream} strokeOpacity="0.45" strokeWidth="1" strokeDasharray="3 3" />
          {/* mihrab arch at the Qiblah end */}
          <path d={`M 232 ${RIG.ground + 20} L 232 ${RIG.ground + 11} Q 246 ${RIG.ground + 1} 260 ${RIG.ground + 11} L 260 ${RIG.ground + 20} Z`} fill={COLORS.cream} fillOpacity="0.9" />
          <path d={`M 238 ${RIG.ground + 19} L 238 ${RIG.ground + 12} Q 246 ${RIG.ground + 6} 254 ${RIG.ground + 12} L 254 ${RIG.ground + 19} Z`} fill={COLORS.matDeep} />
          {/* fringe */}
          <path d={`M 4 ${RIG.ground + 24} L 284 ${RIG.ground + 24}`} stroke={COLORS.cream} strokeWidth="3" strokeDasharray="2 2.5" />
          <g fill="#7c2d12" fontSize="8" fontWeight="800" fontFamily="ui-sans-serif, system-ui">
            <text x="292" y="26" textAnchor="end">Qiblah →</text>
          </g>
        </g>

        {/* Ground shadow under the child */}
        <motion.ellipse cx={shadowX} cy={RIG.ground + 6} rx={shadowRx} ry="7" fill="url(#np-shadow)" />

        {/* Ground contact glows (Sujood) */}
        <AnimatePresence>
          {groundDots.map((anchor) => {
            const pt = anchorPoint(targetPts, anchor);
            return (
              <motion.g
                key={`glow-${anchor}`}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.4, delay: 0.55 }}
                style={{ transformOrigin: `${pt.x}px ${RIG.ground}px` }}
              >
                <circle cx={pt.x} cy={RIG.ground} r="16" fill="url(#np-glow)">
                  {!reducedMotion && <animate attributeName="r" values="12;18;12" dur="1.6s" repeatCount="indefinite" />}
                </circle>
                <circle cx={pt.x} cy={RIG.ground} r="3.5" fill={COLORS.glow} stroke="#fff" strokeWidth="1.5" />
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Ghost of the previous posture — fades out so the child sees where the body came from */}
        {!reducedMotion && ghostPts ? (
          <AnimatePresence>
            <motion.g
              key={`ghost-${arrivalKey}`}
              initial={{ opacity: 0.38 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              fill="none"
              stroke={COLORS.ghost}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="3 3"
              strokeWidth="2"
            >
              <path d={line(ghostPts.hip, ghostPts.shoulder)} />
              <path d={line(ghostPts.hip, ghostPts.knee, ghostPts.ankle, ghostPts.toes)} />
              <path d={line(ghostPts.shoulder, ghostPts.elbow, ghostPts.hand)} />
              <circle cx={ghostPts.head.x} cy={ghostPts.head.y} r={RIG.headRadius} />
            </motion.g>
          </AnimatePresence>
        ) : null}

        {/* ---- Figure (far limbs first for depth) ---- */}
        <motion.g
          filter="url(#np-soft)"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={reducedMotion ? undefined : { y: [0, -1.3, 0] }}
          transition={reducedMotion ? undefined : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* far side */}
          <Limb d={farLegD} width={15} fill={COLORS.thobeFar} />
          <Limb d={farFootD} width={9} fill={COLORS.skinFar} />
          <Limb d={farArmD} width={12} fill={COLORS.thobeFar} />
          <motion.circle cx={farHandX} cy={farHandY} r="6" fill={COLORS.skinFar} stroke={COLORS.outline} strokeWidth="1.3" />

          {/* torso */}
          <motion.path d={torsoFarD} stroke={COLORS.thobeFar} strokeWidth="26" />
          <Limb d={torsoD} width={28} fill={COLORS.thobe} />
          <motion.path d={torsoShadeD} stroke={COLORS.thobeShade} strokeWidth="5" strokeOpacity="0.9" />

          {/* near leg + foot */}
          <Limb d={nearLegD} width={15} fill={COLORS.thobe} />
          <Limb d={nearFootD} width={9} fill={COLORS.skin} />

          {/* neck + head */}
          <Limb d={neckD} width={9} fill={COLORS.skin} />
          <motion.circle cx={headX} cy={headY} r={RIG.headRadius} fill={COLORS.skin} stroke={COLORS.outline} strokeWidth="1.6" />
          <motion.circle cx={earX} cy={earY} r="3.8" fill={COLORS.skin} stroke={COLORS.outline} strokeWidth="1.2" style={{ opacity: earOpacity }} />
          <motion.path d={hairFrontD} stroke={COLORS.hair} strokeWidth="6" />
          <motion.path d={hairBackD} stroke={COLORS.hair} strokeWidth="6" />
          {/* kufi */}
          <motion.path d={kufiD} stroke={COLORS.outline} strokeWidth="10.6" />
          <motion.path d={kufiD} stroke={COLORS.kufi} strokeWidth="8" />
          <motion.path d={kufiShadeD} stroke={COLORS.kufiShade} strokeWidth="1.4" strokeOpacity="0.9" />

          {/* face */}
          <motion.circle cx={blushX} cy={blushY} r="3" fill={COLORS.blush} opacity="0.5" />
          <motion.circle cx={blush2X} cy={blush2Y} r="3" fill={COLORS.blush} style={{ opacity: blush2Opacity }} />
          <motion.path d={browD} stroke={COLORS.hair} strokeWidth="1.5" />
          <motion.path d={brow2D} stroke={COLORS.hair} strokeWidth="1.5" style={{ opacity: faceTurnMV }} />
          <g>
            <motion.ellipse cx={eyeX} cy={eyeY} rx="3.3" ry="3.8" fill="#fff" stroke={COLORS.outline} strokeWidth="1">
              {!reducedMotion && <animate attributeName="ry" values="3.8;3.8;0.4;3.8;3.8" keyTimes="0;0.9;0.94;0.98;1" dur="4.2s" repeatCount="indefinite" />}
            </motion.ellipse>
            <motion.circle cx={pupilX} cy={pupilY} r="1.9" fill={COLORS.hair}>
              {!reducedMotion && <animate attributeName="r" values="1.9;1.9;0.2;1.9;1.9" keyTimes="0;0.9;0.94;0.98;1" dur="4.2s" repeatCount="indefinite" />}
            </motion.circle>
            <motion.circle cx={pupilX} cy={pupilShineY} r="0.7" fill="#fff" />
          </g>
          <motion.g style={{ opacity: faceTurnMV }}>
            <motion.ellipse cx={eye2X} cy={eye2Y} rx="3.3" ry="3.8" fill="#fff" stroke={COLORS.outline} strokeWidth="1">
              {!reducedMotion && <animate attributeName="ry" values="3.8;3.8;0.4;3.8;3.8" keyTimes="0;0.9;0.94;0.98;1" dur="4.2s" repeatCount="indefinite" />}
            </motion.ellipse>
            <motion.circle cx={eye2X} cy={eye2Y} r="1.9" fill={COLORS.hair} />
            <motion.circle cx={eye2X} cy={eye2ShineY} r="0.7" fill="#fff" />
          </motion.g>
          <motion.path d={smileD} stroke={COLORS.outline} strokeWidth="1.5" />

          {/* near arm + hand */}
          <Limb d={nearArmD} width={12} fill={COLORS.thobe} />
          <motion.circle cx={handX} cy={handY} r="6.5" fill={COLORS.skin} stroke={COLORS.outline} strokeWidth="1.3" />
        </motion.g>

        {/* Sparkle burst when the pose is reached */}
        {!reducedMotion ? (
          <AnimatePresence>
            <motion.g key={`spark-${arrivalKey}`} initial="hidden" animate="show" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.6">
              {[
                { dx: -30, dy: -26 },
                { dx: 28, dy: -30 },
                { dx: -22, dy: 12 },
                { dx: 34, dy: 4 },
                { dx: 4, dy: -38 },
              ].map((o, i) => (
                <motion.path
                  key={i}
                  d={STAR}
                  variants={{
                    hidden: { opacity: 0, scale: 0, x: targetPts.head.x + o.dx, y: targetPts.head.y + o.dy },
                    show: {
                      opacity: [0, 1, 0],
                      scale: [0, 1.25, 0],
                      x: targetPts.head.x + o.dx,
                      y: targetPts.head.y + o.dy - 6,
                      transition: { delay: 0.55 + i * 0.09, duration: 0.9, ease: "easeOut" },
                    },
                  }}
                />
              ))}
            </motion.g>
          </AnimatePresence>
        ) : null}

        {/* Salam head-turn arrow */}
        <AnimatePresence>
          {salamArrow && (
            <motion.g
              key={`salam-${salamArrow}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {(() => {
                const h = targetPts.head;
                const dir = salamArrow === "right" ? 1 : -1;
                const start = { x: h.x, y: h.y - RIG.headRadius - 10 };
                const end = { x: h.x + dir * 34, y: h.y - 6 };
                const ctrl = { x: h.x + dir * 36, y: h.y - RIG.headRadius - 16 };
                return (
                  <>
                    <motion.path
                      d={`M ${start.x} ${start.y} Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`}
                      fill="none"
                      stroke={COLORS.glow}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={reducedMotion ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: 0.35, repeat: reducedMotion ? 0 : Infinity, repeatDelay: 1.2 }}
                    />
                    <path d={`M ${end.x} ${end.y} l ${-dir * 7} -4 l ${dir * 1} 8 z`} fill={COLORS.glow} />
                    <text x={h.x + dir * 44} y={h.y - RIG.headRadius - 6} textAnchor={dir === 1 ? "start" : "end"} fontSize="9" fontWeight="900" fill="#92400e" fontFamily="ui-sans-serif, system-ui">
                      {salamArrow === "right" ? "Right" : "Left"}
                    </text>
                  </>
                );
              })()}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Body-check callouts */}
        {showChecks && (
          <AnimatePresence mode="wait">
            <motion.g key={`checks-${posture}-${salamSide ?? ""}`} initial="hidden" animate="show" exit="hidden">
              {spec.checks.map((check, i) => (
                <Callout key={check.label} check={check} anchor={calloutAnchor(targetPts, spec.pose, check.anchor)} index={i} reducedMotion={reducedMotion} />
              ))}
            </motion.g>
          </AnimatePresence>
        )}
      </g>
    </svg>
  );
}

/** Callout anchors: like anchorPoint, but the eye marker sits just in front of the face so it never covers the eyes. */
function calloutAnchor(p: RigPoints, pose: RigPose, anchor: BodyCheck["anchor"]): Pt {
  if (anchor === "eye") return stepPt(stepPt(p.head, pose.head - 90, RIG.headRadius + 4), pose.head, RIG.headRadius * 0.15);
  return anchorPoint(p, anchor);
}

function anchorPoint(p: RigPoints, anchor: BodyCheck["anchor"]): Pt {
  switch (anchor) {
    case "head":
      return p.head;
    case "eye":
      return p.eye;
    case "shoulder":
      return p.shoulder;
    case "elbow":
      return p.elbow;
    case "hand":
      return p.hand;
    case "hip":
      return p.hip;
    case "knee":
      return p.knee;
    case "ankle":
      return p.ankle;
    case "toes":
      return p.toes;
    case "back":
      return p.back;
    case "forehead":
      return p.forehead;
  }
}

function Callout({ check, anchor, index, reducedMotion }: { check: BodyCheck; anchor: Pt; index: number; reducedMotion: boolean }) {
  const label = { x: anchor.x + check.dx, y: anchor.y + check.dy };
  // Clamp label inside the viewBox with padding
  const approxW = Math.min(150, check.label.length * 4.9 + 14);
  const lx = Math.max(4, Math.min(300 - approxW - 4, label.x));
  const ly = Math.max(4, Math.min(240, label.y));
  const cx = lx + approxW / 2;
  const cy = ly + 8;

  return (
    <motion.g
      variants={{
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0, transition: { delay: reducedMotion ? 0 : 0.45 + index * 0.18, duration: 0.3 } },
      }}
    >
      <line x1={anchor.x} y1={anchor.y} x2={cx} y2={cy} stroke="#0f766e" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
      <circle cx={anchor.x} cy={anchor.y} r="3" fill="#fff" stroke="#0f766e" strokeWidth="1.5" />
      <rect x={lx} y={ly} width={approxW} height="16" rx="8" fill="#ffffff" stroke="#6ee7b7" strokeWidth="1.2" />
      <text x={lx + approxW / 2} y={ly + 11} textAnchor="middle" fontSize="8" fontWeight="800" fill="#134e4a" fontFamily="ui-sans-serif, system-ui">
        {check.label}
      </text>
    </motion.g>
  );
}

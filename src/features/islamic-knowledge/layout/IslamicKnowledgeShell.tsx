"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import NoorPathLogo from "@/components/NoorPathLogo";
import {
  ALL_TOPICS,
  LESSONS,
  TOPIC_BY_ID,
  TOTAL_QUESTIONS,
  getLessonForTopic,
  topicsForLevel,
} from "../data/curriculum";
import NooriMascot, { COMPANIONS } from "../components/NooriMascot";
import SkyDecor from "../components/SkyDecor";
import StepVisual from "../components/StepVisual";
import { unlockKnowledgeSpeech } from "../audio/speech";
import "../islamic-knowledge.css";
import { buildDailyChallenge } from "../lib/quiz";
import LessonPlayer from "../screens/LessonPlayer";
import { isDailyChallengeDoneToday, todayKey, XP_PER_LEVEL } from "../state/progress";
import { useIslamicKnowledgeState } from "../state/useIslamicKnowledgeState";
import type { AgeBand, IKCompanionId, IKTopic, IKView, TopicToggleState, TrackLevel } from "../types";
import { supabase } from "@/lib/supabase";

const SETTINGS_KEY = "islamic_knowledge_topics";
const AGE_BAND_KEY = "noorpath-islamic-knowledge-age";

export type IKSurface = "admin" | "tutor" | "parent";

function levelLabel(level: TrackLevel): string {
  if (level === "beginner") return "Beginner";
  if (level === "intermediate") return "Intermediate";
  return "Advanced";
}

const LEVEL_META: Record<TrackLevel, { emoji: string; blurb: string; color: string }> = {
  beginner: { emoji: "🌱", blurb: "Allah, our Prophet ﷺ, manners and the basics — ages 3+", color: "#0a6e4f" },
  intermediate: { emoji: "🚀", blurb: "Stories, Sahabah, Sunnah and daily practice", color: "#2d9cdb" },
  advanced: { emoji: "🏆", blurb: "Seerah, ethics, patience and leadership", color: "#c9922a" },
};

function portalHome(surface: IKSurface): string {
  if (surface === "tutor") return "/tutor";
  if (surface === "parent") return "/parent";
  return "/admin";
}

function ProgressRing({ value, total, size = 56, color = "#0a6e4f", label }: { value: number; total: number; size?: number; color?: string; label?: string }) {
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="ik-ring" style={{ width: size, height: size }} role="img" aria-label={label ?? `${value} of ${total}`}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#dbe9e2" strokeWidth="6" fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ik-ring-text">{value}/{total}</span>
    </div>
  );
}

export default function IslamicKnowledgeShell({ surface = "admin" }: { surface?: IKSurface }) {
  const { progress, hydrated, finishLesson, finishDailyChallenge, chooseCompanion, rememberLesson, resetProgress } = useIslamicKnowledgeState();
  const [view, setView] = useState<IKView>("home");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [disabledIds, setDisabledIds] = useState<string[]>([]);
  const [manageMsg, setManageMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [ageBand, setAgeBand] = useState<AgeBand>("mid");
  const [heroGreeting, setHeroGreeting] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const canManage = surface === "admin";
  const companion = progress.companion;
  const buddy = COMPANIONS[companion];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", SETTINGS_KEY)
        .maybeSingle();
      if (cancelled) return;
      const value = data?.value as TopicToggleState | null;
      if (value?.disabledTopicIds) setDisabledIds(value.disabledTopicIds);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(AGE_BAND_KEY);
    if (saved === "young" || saved === "mid" || saved === "older") setAgeBand(saved);
  }, []);

  function selectAgeBand(next: AgeBand) {
    setAgeBand(next);
    window.localStorage.setItem(AGE_BAND_KEY, next);
  }

  const enabledTopics = useCallback(
    (topics: IKTopic[]) => topics.filter((t) => !disabledIds.includes(t.id)),
    [disabledIds],
  );

  const activeLesson = useMemo(() => {
    if (!activeTopicId) return null;
    return getLessonForTopic(activeTopicId) ?? null;
  }, [activeTopicId]);

  const xpIntoLevel = progress.xp % XP_PER_LEVEL;
  const xpPct = Math.min(100, Math.round((xpIntoLevel / XP_PER_LEVEL) * 100));

  /* ---- home cards ---- */
  const continueTopic = useMemo(() => {
    const enabled = enabledTopics(ALL_TOPICS);
    const last = progress.lastLessonId ? enabled.find((t) => t.lessonIds.includes(progress.lastLessonId!)) : undefined;
    if (last && !progress.completedLessonIds.includes(last.lessonIds[0])) return { topic: last, reason: "Pick up where you left off" };
    const nextNew = (["beginner", "intermediate", "advanced"] as TrackLevel[])
      .flatMap((level) => enabledTopics(topicsForLevel(level)))
      .find((t) => !progress.completedLessonIds.includes(t.lessonIds[0]));
    if (nextNew) return { topic: nextNew, reason: last ? "Next new adventure" : "Start here" };
    const weak = progress.weakTopicIds.map((id) => TOPIC_BY_ID[id]).find(Boolean);
    if (weak) return { topic: weak, reason: "Practise this one again" };
    return null;
  }, [enabledTopics, progress.completedLessonIds, progress.lastLessonId, progress.weakTopicIds]);

  const dailyDone = isDailyChallengeDoneToday(progress);
  const daily = useMemo(() => {
    const enabledLessons = LESSONS.filter((lesson) => !disabledIds.includes(lesson.topicId));
    return buildDailyChallenge(enabledLessons, progress.completedLessonIds, ageBand, todayKey());
  }, [ageBand, disabledIds, progress.completedLessonIds]);

  const trackStats = (level: TrackLevel) => {
    const topics = enabledTopics(topicsForLevel(level));
    const done = topics.filter((t) => progress.completedLessonIds.includes(t.lessonIds[0])).length;
    return { total: topics.length, done };
  };

  const accuracy = progress.totalAnswered > 0 ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : null;

  async function persistToggles(nextDisabled: string[]) {
    setSaving(true);
    setManageMsg("");
    const payload: TopicToggleState = {
      disabledTopicIds: nextDisabled,
      updatedAt: new Date().toISOString(),
    };
    const { error } = await supabase.from("app_settings").upsert({
      key: SETTINGS_KEY,
      value: payload,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      setManageMsg(error.message);
      return;
    }
    setDisabledIds(nextDisabled);
    setManageMsg("Topic visibility saved.");
  }

  function openTopic(topic: IKTopic) {
    if (disabledIds.includes(topic.id)) return;
    unlockKnowledgeSpeech();
    rememberLesson(topic.lessonIds[0]);
    setActiveTopicId(topic.id);
    setView("lesson");
  }

  function openChallenge() {
    unlockKnowledgeSpeech();
    setActiveTopicId(null);
    setView("challenge");
  }

  function greet() {
    unlockKnowledgeSpeech();
    setHeroGreeting("Wa Alaikum Assalam! Choose a lesson and let’s learn.");
    window.setTimeout(() => setHeroGreeting(null), 2600);
  }

  function renderTopicGrid(level: TrackLevel, limit?: number) {
    const topics = enabledTopics(topicsForLevel(level)).slice(0, limit);
    if (topics.length === 0) {
      return <p style={{ color: "var(--ik-muted)" }}>No topics enabled for this track yet.</p>;
    }
    return (
      <div className="ik-grid">
        {topics.map((topic, index) => {
          const lesson = getLessonForTopic(topic.id);
          const done = lesson ? progress.completedLessonIds.includes(lesson.id) : false;
          const stars = lesson ? progress.lessonStars[lesson.id] : undefined;
          const score = lesson ? progress.quizScores[lesson.id] : undefined;
          const weak = progress.weakTopicIds.includes(topic.id);
          const isContinue = continueTopic?.topic.id === topic.id;
          return (
            <motion.button
              key={topic.id}
              type="button"
              className={`ik-topic-card ${done ? "is-done" : ""} ${isContinue ? "is-next" : ""}`}
              style={{ borderTop: `4px solid ${topic.color}` }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.4), type: "spring", stiffness: 260 }}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openTopic(topic)}
            >
              {done && <span className="ik-done-pill">{stars ? `${"⭐".repeat(stars)}` : "Done"}</span>}
              {!done && isContinue && <span className="ik-done-pill next">▶ Up next</span>}
              {weak && <span className="ik-weak-pill">Practise</span>}
              <StepVisual topicId={topic.id} step={lesson?.steps[0]} compact />
              <h3>{topic.title}</h3>
              <p>{topic.summary}</p>
              <div className="ik-topic-meta">
                <span>{lesson?.steps.length ?? 0} steps</span>
                <span>·</span>
                <span>{lesson?.questions.length ?? 0} questions</span>
                {score && <span className="ik-topic-score">· Best {score.correct}/{score.total}</span>}
              </div>
              <span className="ik-play-badge">{done ? "↻ Replay" : "▶ Play"}</span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="ik-root">
      <div className="ik-shell">
        <aside className="ik-sidebar" aria-label="Islamic Knowledge navigation">
          <div className="ik-brand">
            <div className="ik-brand-logo">
              <Image src="/favicon.svg" alt="NoorPath" width={40} height={40} />
            </div>
            <div>
              <NoorPathLogo size="sm" dark />
              <div className="ik-brand-sub">Islamic Knowledge · ages 3–12</div>
            </div>
          </div>

          {(
            [
              { id: "home" as const, emoji: "🏠", label: "Home" },
              { id: "beginner" as const, emoji: "🌱", label: "Beginner" },
              { id: "intermediate" as const, emoji: "🚀", label: "Intermediate" },
              { id: "advanced" as const, emoji: "🏆", label: "Advanced" },
              { id: "challenge" as const, emoji: "📅", label: "Daily Challenge" },
              { id: "rewards" as const, emoji: "🎁", label: "Rewards" },
              ...(canManage ? [{ id: "manage" as const, emoji: "⚙️", label: "Manage" }] : []),
            ]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`ik-nav-btn ${view === item.id ? "active" : ""}`}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => {
                if (item.id === "challenge") {
                  openChallenge();
                  return;
                }
                setView(item.id);
                setActiveTopicId(null);
              }}
            >
              <span>{item.emoji}</span> {item.label}
              {item.id === "challenge" && !dailyDone && hydrated && <span className="ik-nav-dot" aria-label="New challenge available" />}
            </button>
          ))}

          <Link
            href={portalHome(surface)}
            className="ik-nav-btn"
            style={{ marginTop: 8, textDecoration: "none" }}
          >
            <span>←</span>{" "}
            {surface === "parent" ? "Parent portal" : surface === "tutor" ? "Tutor panel" : "Admin panel"}
          </Link>

          <div className="ik-xp-card">
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
              <span>Level {hydrated ? progress.level : "–"}</span>
              <span>🔥 {hydrated ? progress.streak : 0}</span>
            </div>
            <div style={{ marginTop: 6, opacity: 0.9 }}>
              ⭐ {hydrated ? progress.xp : 0} XP · 🪙 {hydrated ? progress.coins : 0}
            </div>
            <div className="ik-xp-bar">
              <div className="ik-xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <div className="ik-xp-next">{XP_PER_LEVEL - xpIntoLevel} XP to level {progress.level + 1}</div>
          </div>
        </aside>

        <main className="ik-main" id="ik-main">
          <SkyDecor />
          <div className="ik-mobile-hud" aria-label="Learning progress">
            <strong>Level {progress.level}</strong>
            <span>{progress.xp} XP</span>
            <span>{progress.coins} coins</span>
            <span>{progress.streak} day streak</span>
          </div>
          {view !== "lesson" && view !== "challenge" && (
            <div className="ik-age-quick" aria-label="Choose learning age mode">
              <strong>Age mode</strong>
              {([
                ["young", "3–6"],
                ["mid", "7–9"],
                ["older", "10–12"],
              ] as const).map(([id, label]) => (
                <button key={id} type="button" className={ageBand === id ? "active" : ""} aria-pressed={ageBand === id} onClick={() => selectAgeBand(id)}>
                  {label}
                </button>
              ))}
              <span className="ik-age-note">
                {ageBand === "young" ? "Shorter lines · 4 easy questions" : ageBand === "mid" ? "5 mixed questions" : "6 questions, deeper thinking"}
              </span>
            </div>
          )}

          {view === "home" && (
            <>
              <div className="ik-hero">
                <div className="ik-hero-brand">
                  <Image src="/favicon.svg" alt="NoorPath" width={36} height={36} />
                  <NoorPathLogo size="md" dark />
                </div>
                <h1 className="ik-hero-title">Discover Islam with joy</h1>
                <p>
                  Listen, tap, answer and earn stars with {buddy.name}. Every replay brings new questions, so learning never gets boring.
                </p>
                <div className="ik-hero-cta">
                  {continueTopic && (
                    <button type="button" className="ik-btn ik-btn-primary" onClick={() => openTopic(continueTopic.topic)}>
                      ▶ {continueTopic.reason}: {continueTopic.topic.shortTitle}
                    </button>
                  )}
                  <button type="button" className="ik-btn ik-btn-ghost" onClick={openChallenge}>
                    📅 Daily Challenge {dailyDone ? "✓" : ""}
                  </button>
                </div>
                <motion.button
                  type="button"
                  className="ik-mascot ik-mascot-button"
                  aria-label={`Greet ${buddy.name}`}
                  onClick={greet}
                  whileTap={{ scale: 0.94 }}
                >
                  <NooriMascot mood="cheer" action="wave" character={companion} size={110} lookAt="left" caption={heroGreeting ?? `Tap ${buddy.name} to say Salam`} />
                </motion.button>
              </div>

              <div className="ik-home-grid">
                {continueTopic && (
                  <motion.button type="button" className="ik-home-card ik-home-continue" whileHover={{ y: -4 }} onClick={() => openTopic(continueTopic.topic)}>
                    <span className="ik-home-kicker">{continueTopic.reason}</span>
                    <StepVisual topicId={continueTopic.topic.id} step={getLessonForTopic(continueTopic.topic.id)?.steps[0]} compact />
                    <strong>{continueTopic.topic.title}</strong>
                    <p>{continueTopic.topic.summary}</p>
                    <span className="ik-play-badge">▶ Continue</span>
                  </motion.button>
                )}

                <motion.button type="button" className={`ik-home-card ik-home-daily ${dailyDone ? "done" : ""}`} whileHover={{ y: -4 }} onClick={openChallenge}>
                  <span className="ik-home-kicker">Daily Challenge</span>
                  <div className="ik-daily-face">
                    <span className="ik-daily-emoji">{dailyDone ? "🏅" : "📅"}</span>
                    <div>
                      <strong>{dailyDone ? "Done for today!" : "5 questions · mixed topics"}</strong>
                      <p>
                        {dailyDone && progress.dailyChallengeScore
                          ? `You scored ${progress.dailyChallengeScore.correct}/${progress.dailyChallengeScore.total}. Come back tomorrow for a new set.`
                          : "A fresh set every day from lessons you've learned. Keep the 🔥 streak alive."}
                      </p>
                    </div>
                  </div>
                  <span className="ik-play-badge">{dailyDone ? "↻ Play again (no XP)" : "▶ Play"}</span>
                </motion.button>

                <div className="ik-home-card ik-home-tracks">
                  <span className="ik-home-kicker">Your journey</span>
                  {(["beginner", "intermediate", "advanced"] as TrackLevel[]).map((level) => {
                    const stats = trackStats(level);
                    return (
                      <button key={level} type="button" className="ik-track-row" onClick={() => setView(level)}>
                        <ProgressRing value={stats.done} total={stats.total} size={48} color={LEVEL_META[level].color} label={`${levelLabel(level)}: ${stats.done} of ${stats.total} complete`} />
                        <div>
                          <strong>{LEVEL_META[level].emoji} {levelLabel(level)}</strong>
                          <p>{LEVEL_META[level].blurb}</p>
                        </div>
                        <span aria-hidden>→</span>
                      </button>
                    );
                  })}
                </div>

                <div className="ik-home-card ik-home-companion">
                  <span className="ik-home-kicker">Your learning buddy</span>
                  <div className="ik-companion-row">
                    {(Object.keys(COMPANIONS) as IKCompanionId[]).map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={`ik-companion-pick ${companion === id ? "active" : ""}`}
                        aria-pressed={companion === id}
                        onClick={() => chooseCompanion(id)}
                      >
                        <NooriMascot character={id} mood={companion === id ? "cheer" : "happy"} action={companion === id ? "wave" : "idle"} size={70} lookAt="center" />
                        <strong>{COMPANIONS[id].name}</strong>
                        <small>{COMPANIONS[id].blurb}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h2 className="ik-section-title">Start with Beginner</h2>
              {renderTopicGrid("beginner", 5)}

              <div className="ik-actions" style={{ justifyContent: "flex-start", marginTop: 28 }}>
                <button type="button" className="ik-btn ik-btn-primary" onClick={() => setView("beginner")}>
                  Open Beginner map →
                </button>
                <button type="button" className="ik-btn ik-btn-ghost" onClick={() => setView("rewards")}>
                  See badges
                </button>
              </div>
            </>
          )}

          {(view === "beginner" || view === "intermediate" || view === "advanced") && (
            <>
              <div className="ik-track-header">
                <ProgressRing value={trackStats(view).done} total={trackStats(view).total} size={64} color={LEVEL_META[view].color} />
                <div>
                  <h2 className="ik-section-title" style={{ margin: 0 }}>{LEVEL_META[view].emoji} {levelLabel(view)} track</h2>
                  <p style={{ color: "var(--ik-muted)", margin: "4px 0 0" }}>
                    {LEVEL_META[view].blurb}. Tap a topic to learn with {buddy.name}, then play the quiz — {trackStats(view).done === trackStats(view).total && trackStats(view).total > 0 ? "all complete, MashaAllah!" : `${trackStats(view).total - trackStats(view).done} still to explore.`}
                  </p>
                </div>
              </div>
              {renderTopicGrid(view)}
            </>
          )}

          {view === "lesson" && activeLesson && (
            <LessonPlayer
              key={`${activeLesson.id}-${ageBand}`}
              lesson={activeLesson}
              ageBand={ageBand}
              companion={companion}
              recentQuestionIds={progress.questionHistory[activeLesson.id]}
              attempt={progress.lessonAttempts[activeLesson.id] ?? 0}
              onBack={() => {
                const level = TOPIC_BY_ID[activeLesson.topicId]?.level ?? "beginner";
                setView(level);
                setActiveTopicId(null);
              }}
              onComplete={(outcome) => finishLesson(activeLesson.id, activeLesson.topicId, outcome, activeLesson.badgeId)}
            />
          )}

          {view === "challenge" && (
            <LessonPlayer
              key={`${daily.lesson.id}-${ageBand}`}
              lesson={daily.lesson}
              ageBand={ageBand}
              companion={companion}
              mode="challenge"
              onBack={() => setView("home")}
              onComplete={(outcome) => finishDailyChallenge(outcome)}
            />
          )}

          {view === "rewards" && (
            <>
              <h2 className="ik-section-title">Rewards & badges</h2>
              <div className="ik-stat-grid">
                <div className="ik-stat"><strong>Level {progress.level}</strong><span>{progress.xp} XP</span></div>
                <div className="ik-stat"><strong>🪙 {progress.coins}</strong><span>coins</span></div>
                <div className="ik-stat"><strong>🔥 {progress.streak}</strong><span>day streak</span></div>
                <div className="ik-stat"><strong>{progress.completedLessonIds.length}/{ALL_TOPICS.length}</strong><span>lessons done</span></div>
                <div className="ik-stat"><strong>{progress.totalAnswered}</strong><span>questions answered</span></div>
                <div className="ik-stat"><strong>{accuracy === null ? "–" : `${accuracy}%`}</strong><span>accuracy</span></div>
                <div className="ik-stat"><strong>⚡ {progress.bestCombo}</strong><span>best streak in a row</span></div>
                <div className="ik-stat"><strong>{progress.badges.filter((b) => b.earned).length}/{progress.badges.length}</strong><span>badges</span></div>
              </div>
              {progress.weakTopicIds.length > 0 && (
                <div className="ik-weak-topics">
                  <strong>Practice again with {buddy.name}:</strong>
                  {progress.weakTopicIds.map((id) => {
                    const topic = ALL_TOPICS.find((item) => item.id === id);
                    return topic ? <button key={id} type="button" onClick={() => openTopic(topic)}>{topic.emoji} {topic.shortTitle}</button> : null;
                  })}
                </div>
              )}
              <div className="ik-badge-grid" style={{ marginTop: 16 }}>
                {progress.badges.map((badge) => (
                  <div key={badge.id} className={`ik-badge-card ${badge.earned ? "" : "locked"}`}>
                    <div style={{ fontSize: "2rem" }}>{badge.emoji}</div>
                    <strong>{badge.title}</strong>
                    <p style={{ fontSize: "0.8rem", color: "var(--ik-muted)", margin: "6px 0 0" }}>
                      {badge.description}
                    </p>
                    {badge.earned && badge.earnedAt && <small className="ik-badge-date">Earned {new Date(badge.earnedAt).toLocaleDateString()}</small>}
                  </div>
                ))}
              </div>
            </>
          )}

          {view === "manage" && canManage && (
            <>
              <h2 className="ik-section-title">Admin · Topic controls</h2>
              <p style={{ color: "var(--ik-muted)", marginBottom: 16 }}>
                Enable or disable topics without touching Noorani Qaida. Saved in app settings.
              </p>
              <div className="ik-stat-grid" style={{ marginBottom: 18 }}>
                <div className="ik-stat"><strong>{ALL_TOPICS.length}</strong><span>topics</span></div>
                <div className="ik-stat"><strong>{ALL_TOPICS.length - disabledIds.length}</strong><span>enabled</span></div>
                <div className="ik-stat"><strong>{TOTAL_QUESTIONS}</strong><span>questions in bank</span></div>
                <div className="ik-stat"><strong>{LESSONS.reduce((sum, l) => sum + l.steps.length, 0)}</strong><span>story steps</span></div>
              </div>
              {manageMsg && (
                <p style={{ fontWeight: 700, color: "var(--ik-emerald)", marginBottom: 12 }}>{manageMsg}</p>
              )}
              <table className="ik-manage-table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Track</th>
                    <th>Questions</th>
                    <th>Enabled</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_TOPICS.map((topic) => {
                    const enabled = !disabledIds.includes(topic.id);
                    const lesson = getLessonForTopic(topic.id);
                    return (
                      <tr key={topic.id}>
                        <td>
                          {topic.emoji} {topic.title}
                        </td>
                        <td style={{ textTransform: "capitalize" }}>{topic.level}</td>
                        <td>{lesson?.questions.length ?? 0}</td>
                        <td>
                          <button
                            type="button"
                            className={`ik-toggle ${enabled ? "on" : ""}`}
                            aria-label={`Toggle ${topic.title}`}
                            disabled={saving}
                            onClick={() => {
                              const next = enabled
                                ? [...disabledIds, topic.id]
                                : disabledIds.filter((id) => id !== topic.id);
                              void persistToggles(next);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="ik-danger-zone">
                <div>
                  <strong>Reset learning progress on this device</strong>
                  <p>Clears XP, coins, stars, badges and question history stored in this browser. Topic visibility is not affected.</p>
                </div>
                {confirmReset ? (
                  <div className="ik-actions" style={{ margin: 0 }}>
                    <button type="button" className="ik-btn ik-btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
                    <button type="button" className="ik-btn ik-btn-danger" onClick={() => { resetProgress(); setConfirmReset(false); setManageMsg("Local progress reset."); }}>Yes, reset</button>
                  </div>
                ) : (
                  <button type="button" className="ik-btn ik-btn-ghost" onClick={() => setConfirmReset(true)}>Reset progress…</button>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

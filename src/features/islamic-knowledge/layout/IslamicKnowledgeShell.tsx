"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import NoorPathLogo from "@/components/NoorPathLogo";
import {
  ALL_TOPICS,
  TOPIC_BY_ID,
  getLessonForTopic,
  topicsForLevel,
} from "../data/curriculum";
import NooriMascot from "../components/NooriMascot";
import SkyDecor from "../components/SkyDecor";
import "../islamic-knowledge.css";
import LessonPlayer from "../screens/LessonPlayer";
import { XP_PER_LEVEL } from "../state/progress";
import { useIslamicKnowledgeState } from "../state/useIslamicKnowledgeState";
import type { IKTopic, IKView, TopicToggleState, TrackLevel } from "../types";
import { supabase } from "@/lib/supabase";

const SETTINGS_KEY = "islamic_knowledge_topics";

function levelLabel(level: TrackLevel): string {
  if (level === "beginner") return "Beginner";
  if (level === "intermediate") return "Intermediate";
  return "Advanced";
}

export default function IslamicKnowledgeShell() {
  const { progress, hydrated, finishLesson } = useIslamicKnowledgeState();
  const [view, setView] = useState<IKView>("home");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [disabledIds, setDisabledIds] = useState<string[]>([]);
  const [manageMsg, setManageMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [ageBand, setAgeBand] = useState<"young" | "mid" | "older">("mid");

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
    setActiveTopicId(topic.id);
    setView("lesson");
  }

  function renderTopicGrid(level: TrackLevel) {
    const topics = enabledTopics(topicsForLevel(level));
    if (topics.length === 0) {
      return <p style={{ color: "var(--ik-muted)" }}>No topics enabled for this track yet.</p>;
    }
    return (
      <div className="ik-grid">
        {topics.map((topic, index) => {
          const lesson = getLessonForTopic(topic.id);
          const done = lesson ? progress.completedLessonIds.includes(lesson.id) : false;
          const stars = lesson ? progress.lessonStars[lesson.id] : undefined;
          return (
            <motion.button
              key={topic.id}
              type="button"
              className="ik-topic-card"
              style={{ borderTop: `4px solid ${topic.color}` }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.4), type: "spring", stiffness: 260 }}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openTopic(topic)}
            >
              {done && <span className="ik-done-pill">{stars ? `${"⭐".repeat(stars)}` : "Done"}</span>}
              <span className="ik-topic-emoji">{topic.emoji}</span>
              <h3>{topic.title}</h3>
              <p>{topic.summary}</p>
              <span className="ik-play-badge">▶ Play</span>
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
              ["home", "🏠", "Home"],
              ["beginner", "🌱", "Beginner"],
              ["intermediate", "🚀", "Intermediate"],
              ["advanced", "🏆", "Advanced"],
              ["rewards", "🎁", "Rewards"],
              ["manage", "⚙️", "Manage"],
            ] as const
          ).map(([id, emoji, label]) => (
            <button
              key={id}
              type="button"
              className={`ik-nav-btn ${view === id ? "active" : ""}`}
              onClick={() => {
                setView(id);
                setActiveTopicId(null);
              }}
            >
              <span>{emoji}</span> {label}
            </button>
          ))}

          <Link
            href="/admin"
            className="ik-nav-btn"
            style={{ marginTop: 8, textDecoration: "none" }}
          >
            <span>←</span> Admin panel
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
          </div>
        </aside>

        <main className="ik-main" id="ik-main">
          <SkyDecor />

          {view === "home" && (
            <>
              <div className="ik-hero">
                <div className="ik-hero-brand">
                  <Image src="/favicon.svg" alt="NoorPath" width={36} height={36} />
                  <NoorPathLogo size="md" dark />
                </div>
                <h1 className="ik-hero-title">Discover Islam with joy</h1>
                <p>
                  Tap cards, reveal surprises, earn stars with Noori — a magical journey separate from Noorani Qaida.
                </p>
                <div className="ik-mascot" aria-hidden>
                  <NooriMascot
                    mood="cheer"
                    action="wave"
                    size={110}
                    speech="Assalamu Alaikum!"
                    speechSide="top"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, position: "relative", zIndex: 1 }}>
                <span style={{ fontWeight: 800, color: "var(--ik-muted)" }}>Age mode:</span>
                {(
                  [
                    ["young", "3-6"],
                    ["mid", "7-9"],
                    ["older", "10-12"],
                  ] as const
                ).map(([id, label]) => (
                  <motion.button
                    key={id}
                    type="button"
                    className="ik-btn"
                    style={{
                      padding: "8px 14px",
                      fontSize: "0.9rem",
                      background: ageBand === id ? "var(--ik-emerald)" : "#fff",
                      color: ageBand === id ? "#fff" : "var(--ik-emerald)",
                    }}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setAgeBand(id)}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>

              <h2 className="ik-section-title">Start with Beginner</h2>
              {renderTopicGrid("beginner")}

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
              <h2 className="ik-section-title">{levelLabel(view)} track</h2>
              <p style={{ color: "var(--ik-muted)", marginTop: -8, marginBottom: 18 }}>
                Tap a topic to learn with Noori the mascot — then play the quiz!
              </p>
              {renderTopicGrid(view)}
            </>
          )}

          {view === "lesson" && activeLesson && (
            <LessonPlayer
              lesson={activeLesson}
              ageBand={ageBand}
              onBack={() => {
                const level = TOPIC_BY_ID[activeLesson.topicId]?.level ?? "beginner";
                setView(level);
                setActiveTopicId(null);
              }}
              onComplete={(correct, total) => {
                finishLesson(
                  activeLesson.id,
                  activeLesson.topicId,
                  correct,
                  total,
                  activeLesson.badgeId,
                );
              }}
            />
          )}

          {view === "rewards" && (
            <>
              <h2 className="ik-section-title">Rewards & badges</h2>
              <div className="ik-reward-row" style={{ justifyContent: "flex-start" }}>
                <span className="ik-chip">Level {progress.level}</span>
                <span className="ik-chip">{progress.xp} XP</span>
                <span className="ik-chip">{progress.coins} coins</span>
                <span className="ik-chip">{progress.streak} day streak</span>
                <span className="ik-chip">{progress.completedLessonIds.length} lessons</span>
              </div>
              {progress.weakTopicIds.length > 0 && (
                <p style={{ color: "var(--ik-muted)" }}>
                  Practice again:{" "}
                  {progress.weakTopicIds
                    .map((id) => ALL_TOPICS.find((t) => t.id === id)?.shortTitle ?? id)
                    .join(", ")}
                </p>
              )}
              <div className="ik-badge-grid" style={{ marginTop: 16 }}>
                {progress.badges.map((badge) => (
                  <div key={badge.id} className={`ik-badge-card ${badge.earned ? "" : "locked"}`}>
                    <div style={{ fontSize: "2rem" }}>{badge.emoji}</div>
                    <strong>{badge.title}</strong>
                    <p style={{ fontSize: "0.8rem", color: "var(--ik-muted)", margin: "6px 0 0" }}>
                      {badge.description}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === "manage" && (
            <>
              <h2 className="ik-section-title">Admin · Topic controls</h2>
              <p style={{ color: "var(--ik-muted)", marginBottom: 16 }}>
                Enable or disable topics without touching Noorani Qaida. Saved in app settings.
              </p>
              {manageMsg && (
                <p style={{ fontWeight: 700, color: "var(--ik-emerald)", marginBottom: 12 }}>{manageMsg}</p>
              )}
              <table className="ik-manage-table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Track</th>
                    <th>Enabled</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_TOPICS.map((topic) => {
                    const enabled = !disabledIds.includes(topic.id);
                    return (
                      <tr key={topic.id}>
                        <td>
                          {topic.emoji} {topic.title}
                        </td>
                        <td style={{ textTransform: "capitalize" }}>{topic.level}</td>
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}

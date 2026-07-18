"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { qaidaAudio } from "../audio/QaidaAudioService";

export const VOICE_SETUP_STORAGE_KEY = "noorpath.qaida.voiceSetup.v1";

type DeviceKind = "ios" | "android" | "windows" | "mac" | "other";
type FormFactor = "phone" | "tablet" | "desktop";

interface VoiceSetupWizardProps {
  open: boolean;
  audioEnabled: boolean;
  onEnableAudio: () => void;
  onClose: () => void;
  onCompleted: () => void;
}

interface Step {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  tip?: string;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
}

function detectEnvironment(): { device: DeviceKind; form: FormFactor; browser: string } {
  if (typeof navigator === "undefined") {
    return { device: "other", form: "desktop", browser: "Browser" };
  }

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouch = navigator.maxTouchPoints || 0;
  const width = typeof window !== "undefined" ? window.innerWidth : 1200;

  const isIPad = /iPad/i.test(ua) || (platform === "MacIntel" && maxTouch > 1);
  const isIPhone = /iPhone|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isWindows = /Windows/i.test(ua);
  const isMac = /Mac/i.test(ua) && !isIPad;

  let device: DeviceKind = "other";
  if (isIPhone || isIPad) device = "ios";
  else if (isAndroid) device = "android";
  else if (isWindows) device = "windows";
  else if (isMac) device = "mac";

  let form: FormFactor = "desktop";
  if (isIPhone || (isAndroid && width < 768)) form = "phone";
  else if (isIPad || (isAndroid && width >= 768) || (maxTouch > 1 && width >= 768 && width < 1200)) form = "tablet";

  let browser = "Browser";
  if (/Edg\//i.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Google Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/SamsungBrowser/i.test(ua)) browser = "Samsung Internet";

  return { device, form, browser };
}

function deviceSteps(device: DeviceKind, form: FormFactor, browser: string): Step[] {
  const deviceLabel =
    device === "ios" ? (form === "tablet" ? "iPad" : "iPhone")
      : device === "android" ? (form === "tablet" ? "Android tablet" : "Android phone")
        : device === "windows" ? "Windows PC"
          : device === "mac" ? "Mac"
            : "this device";

  const commonIntro: Step = {
    id: "welcome",
    title: "Enable clear letter pronunciation",
    summary: `Noorani Qaida needs sound permission on ${deviceLabel} so children hear each Arabic letter correctly.`,
    bullets: [
      "This short guide takes about one minute.",
      "Follow each step once — then letter taps will speak.",
      `Detected: ${browser} on ${deviceLabel}.`,
    ],
    tip: "Use headphones in shared spaces so the child can hear soft Arabic sounds clearly.",
  };

  const appAudio: Step = {
    id: "app-audio",
    title: "Turn on Audio guidance in NoorPath",
    summary: "The in-app speaker must be on before the browser can play pronunciation.",
    bullets: [
      "Look for the speaker icon (🔊) in the top bar — it must not show muted (🔇).",
      "Or open Settings inside Noorani Qaida and enable “Audio guidance”.",
      "Keep media volume up on the device (side buttons / volume keys).",
    ],
    tip: "If the icon is muted, tap it once — sound will stay on for this device.",
    actionLabel: "Enable audio now",
  };

  const testSound: Step = {
    id: "test",
    title: "Test pronunciation",
    summary: "Tap the button below. You should hear a short Arabic sample.",
    bullets: [
      "Make sure the device is not on silent / vibrate-only.",
      "Raise volume to at least half before testing.",
      "If you hear nothing, continue to the device steps — your browser may still need permission.",
    ],
    actionLabel: "Play test sound",
  };

  if (device === "ios") {
    return [
      commonIntro,
      appAudio,
      {
        id: "ios-silent",
        title: "Check iPhone / iPad silent mode",
        summary: "iOS blocks web speech when the hardware silent switch or Focus modes mute media.",
        bullets: [
          "Flip the Ring/Silent switch on the left side of iPhone so orange is NOT showing (Ring mode).",
          "On iPad, open Control Center → turn off Silent / Focus if media is muted.",
          "Open Control Center → raise the volume slider (not just ringer).",
          "In Settings → Sounds & Haptics (or Sounds), ensure volume is audible.",
        ],
        tip: form === "tablet"
          ? "iPad often uses Side Volume buttons — press Volume Up twice, then retest."
          : "If you use a case, confirm the silent switch is not stuck on Silent.",
      },
      {
        id: "ios-safari",
        title: `Allow sound in ${browser}`,
        summary: "Safari and Chrome on iPhone/iPad are supported. They require a real tap before audio can play.",
        bullets: [
          "Prefer Safari for the most reliable Arabic voice on iPhone/iPad.",
          "Stay in this screen and use “Play test sound” after each change.",
          "If muted earlier: Safari → “aA” → Website Settings → allow Auto-Play.",
          "Install Arabic voices (optional): Settings → Accessibility → Spoken Content → Voices → Arabic.",
          "Close other tabs that may be holding exclusive audio focus.",
        ],
        tip: "Noorani Qaida is compatible with iPhone/iPad Safari. Always tap letters with your finger — audio unlocks on the first real tap.",
      },
      testSound,
      {
        id: "done",
        title: "You’re ready to learn",
        summary: "Open Noorani Qaida letters and tap any letter to hear pronunciation.",
        bullets: [
          "You can reopen this guide anytime from Settings → “Voice setup guide”.",
          "If sound stops later, unmute the top-bar speaker and run the test again.",
        ],
      },
    ];
  }

  if (device === "android") {
    return [
      commonIntro,
      appAudio,
      {
        id: "android-volume",
        title: "Set media volume (not ringtone)",
        summary: "Android has separate volumes. Letter audio uses Media volume.",
        bullets: [
          "Press Volume Up while this page is open — the slider should say Media / Music.",
          "If it says Ringtone, open the three-dot menu on the volume panel and switch to Media.",
          "Disable Do Not Disturb / Focus if it mutes media.",
          "Unplug then reconnect Bluetooth headphones if sound routes to the wrong device.",
        ],
        tip: form === "tablet"
          ? "On tablets, also check Quick Settings tiles for mute / Do Not Disturb."
          : "Some phones mute Chrome tabs individually — check the tab icon for a mute badge.",
      },
      {
        id: "android-browser",
        title: `Allow site sound in ${browser}`,
        summary: "Chrome and Samsung Internet can mute a site after a previous mute action.",
        bullets: [
          "Tap the lock / tune icon in the address bar → Site settings → Sound → Allow.",
          "Ensure the phone is not in Battery saver modes that restrict web media.",
          "Update the browser from Play Store if speech voices are missing.",
          "Optional: Settings → Accessibility → Text-to-speech → install a preferred engine (Google TTS).",
        ],
        tip: "Arabic pronunciation is clearer when Google Text-to-speech data includes Arabic.",
      },
      testSound,
      {
        id: "done",
        title: "You’re ready to learn",
        summary: "Tap any letter in the Qaida book to hear its sound.",
        bullets: [
          "Reopen this guide from Settings → “Voice setup guide” if needed.",
          "Keep Audio guidance enabled during lessons and practice games.",
        ],
      },
    ];
  }

  if (device === "windows") {
    return [
      commonIntro,
      appAudio,
      {
        id: "windows-volume",
        title: "Unmute Windows and the browser tab",
        summary: "Windows can mute the whole PC, the browser app, or only this tab.",
        bullets: [
          "Click the speaker icon in the Windows taskbar — volume should not be muted.",
          "Open Volume mixer → ensure " + browser + " is unmuted and above 50%.",
          "In the browser, check the tab icon — if muted, right‑click the tab → Unmute site.",
          "Disable Quiet hours / Focus assist if it is silencing notifications and media oddly.",
        ],
        tip: "Use wired/Bluetooth headphones if the PC speakers are disabled in Sound settings.",
      },
      {
        id: "windows-tts",
        title: "Install Arabic speech voices (recommended)",
        summary: "Letter pronunciation uses the browser’s text-to-speech. Arabic voices make sounds clear.",
        bullets: [
          "Open Windows Settings → Time & language → Speech (or Language & region).",
          "Add speech / voice packs → install Arabic (for example Arabic Saudi Arabia).",
          "Restart " + browser + " completely after installing voices.",
          "In Edge/Chrome, allow sound for admin.noorpath.online if prompted.",
        ],
        tip: "If the browser tab shows a speaker icon but you hear nothing: Chrome on Windows often “pretends” to speak Arabic. Use Edge, or install Microsoft Arabic (Saudi Arabia) under Speech settings, then fully quit and reopen the browser. NoorPath will also speak the English letter name as a backup.",
      },
      {
        id: "windows-output",
        title: "Confirm the correct speakers / headphones",
        summary: "The tab speaker icon means the browser started speech — Windows may be sending it to another device.",
        bullets: [
          "Right‑click the taskbar speaker → Open Volume mixer → set Chrome/Edge output device to your speakers.",
          "Windows Settings → System → Sound → Output → choose the device you are listening on.",
          "Temporarily unplug HDMI monitors (they sometimes steal audio).",
          "Try Microsoft Edge if Chrome stays silent — Edge uses Windows voices more reliably.",
        ],
      },
      testSound,
      {
        id: "done",
        title: "You’re ready to learn",
        summary: "Return to the letter book and tap letters to hear them.",
        bullets: [
          "You can reopen this guide from Settings → “Voice setup guide”.",
          "If IT manages the PC, ask them to allow site sound and Arabic TTS voices.",
        ],
      },
    ];
  }

  if (device === "mac") {
    return [
      commonIntro,
      appAudio,
      {
        id: "mac-sound",
        title: "Check Mac sound output",
        summary: "Confirm macOS is sending audio to the correct speakers or headphones.",
        bullets: [
          "Click Control Centre / volume menu — raise output volume.",
          "System Settings → Sound → Output → select the correct device.",
          "Unmute the browser tab if the speaker icon on the tab is crossed out.",
          "System Settings → Accessibility → Spoken Content can remain off; Qaida uses browser speech.",
        ],
      },
      testSound,
      {
        id: "done",
        title: "You’re ready to learn",
        summary: "Tap letters in Noorani Qaida to hear pronunciation.",
        bullets: ["Reopen this guide anytime from Settings → “Voice setup guide”."],
      },
    ];
  }

  return [
    commonIntro,
    appAudio,
    {
      id: "generic-device",
      title: "Allow sound on your device",
      summary: "Browsers only play letter audio after sound is allowed and volume is up.",
      bullets: [
        "Unmute the device and raise media volume.",
        "Allow sound / autoplay for this website if the browser asks.",
        "Keep the NoorPath speaker icon unmuted.",
      ],
    },
    testSound,
    {
      id: "done",
      title: "You’re ready to learn",
      summary: "Tap any letter to hear its pronunciation.",
      bullets: ["Reopen this guide from Settings if sound stops working."],
    },
  ];
}

export default function VoiceSetupWizard({
  open,
  audioEnabled,
  onEnableAudio,
  onClose,
  onCompleted,
}: VoiceSetupWizardProps) {
  const env = useMemo(() => detectEnvironment(), []);
  const steps = useMemo(() => deviceSteps(env.device, env.form, env.browser), [env]);
  const [index, setIndex] = useState(0);
  const [testStatus, setTestStatus] = useState<"idle" | "playing" | "done" | "failed">("idle");

  useEffect(() => {
    if (open) {
      setIndex(0);
      setTestStatus("idle");
    }
  }, [open]);

  const step = steps[index];
  const isLast = index >= steps.length - 1;
  const progressPct = Math.round(((index + 1) / steps.length) * 100);

  async function runTestSound() {
    setTestStatus("playing");
    try {
      onEnableAudio();
      qaidaAudio.setEnabled(true);
      qaidaAudio.unlock();
      await qaidaAudio.pronounce({
        key: "letter-1",
        fallbackText: "ا",
        englishName: "Alif",
        mode: "normal",
      });
      await qaidaAudio.effect("tap");
      setTestStatus("done");
    } catch {
      setTestStatus("failed");
    }
  }

  async function handlePrimaryAction() {
    if (step.id === "app-audio") {
      onEnableAudio();
      qaidaAudio.setEnabled(true);
      qaidaAudio.unlock();
      setIndex((current) => Math.min(current + 1, steps.length - 1));
      return;
    }
    if (step.id === "test") {
      await runTestSound();
      return;
    }
    if (isLast) {
      onCompleted();
      onClose();
      return;
    }
    setIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  if (!open || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[220] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-setup-title"
      >
        <motion.div
          className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[85dvh] sm:rounded-3xl"
          initial={{ y: 40, opacity: 0.96 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
        >
          <header className="border-b border-emerald-900/10 bg-gradient-to-r from-emerald-800 to-teal-700 px-5 py-4 text-white sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
                  Voice setup · Step {index + 1} of {steps.length}
                </p>
                <h2 id="voice-setup-title" className="mt-1 text-xl font-black leading-tight sm:text-2xl">
                  {step.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/15 text-lg font-bold hover:bg-white/25"
                aria-label="Close voice setup"
              >
                ×
              </button>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
              <div className="h-full rounded-full bg-amber-300 transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
          </header>

          <div className="qaida-scroll flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <p className="text-sm leading-relaxed text-slate-600 sm:text-[0.95rem]">{step.summary}</p>

            <ul className="mt-4 space-y-3">
              {step.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-3 rounded-2xl border border-emerald-900/8 bg-emerald-50/70 px-3.5 py-3 text-sm leading-relaxed text-slate-800"
                >
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-700 text-xs font-black text-white">
                    ✓
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {step.tip && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <strong className="font-black">Tip:</strong> {step.tip}
              </div>
            )}

            {step.id === "app-audio" && (
              <p className={`mt-4 text-sm font-bold ${audioEnabled ? "text-emerald-700" : "text-rose-700"}`}>
                Current status: {audioEnabled ? "Audio guidance is ON" : "Audio guidance is OFF — enable it below"}
              </p>
            )}

            {step.id === "test" && (
              <p className="mt-4 text-sm font-semibold text-slate-700">
                {testStatus === "idle" && "Waiting for your test…"}
                {testStatus === "playing" && "Playing sample… listen carefully."}
                {testStatus === "done" && "Test finished. If you heard a sound, you’re set."}
                {testStatus === "failed" && "Test could not play. Continue and check device steps again."}
              </p>
            )}

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {env.form === "phone" ? "Mobile" : env.form === "tablet" ? "Tablet" : "Desktop"} · {env.browser}
            </p>
          </div>

          <footer className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <button
              type="button"
              className="min-h-12 order-2 rounded-2xl px-4 text-sm font-bold text-slate-600 hover:bg-white sm:order-1"
              onClick={() => {
                if (index === 0) onClose();
                else setIndex((current) => Math.max(0, current - 1));
              }}
            >
              {index === 0 ? "Not now" : "Back"}
            </button>
            <div className="order-1 flex flex-col gap-2 sm:order-2 sm:flex-row">
              {!isLast && step.id !== "test" && (
                <button
                  type="button"
                  className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
                  onClick={() => setIndex((current) => Math.min(current + 1, steps.length - 1))}
                >
                  Skip step
                </button>
              )}
              <button
                type="button"
                className="min-h-12 rounded-2xl bg-emerald-700 px-5 text-sm font-black text-white shadow-md hover:bg-emerald-800"
                onClick={() => void handlePrimaryAction()}
              >
                {step.id === "app-audio"
                  ? (step.actionLabel || "Enable audio now")
                  : step.id === "test"
                    ? (testStatus === "playing" ? "Playing…" : step.actionLabel || "Play test sound")
                    : isLast
                      ? "Finish setup"
                      : "Next step"}
              </button>
              {step.id === "test" && testStatus === "done" && (
                <button
                  type="button"
                  className="min-h-12 rounded-2xl bg-teal-700 px-5 text-sm font-black text-white"
                  onClick={() => setIndex((current) => Math.min(current + 1, steps.length - 1))}
                >
                  Continue
                </button>
              )}
            </div>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Auto-prompt only until the user finishes or dismisses once. */
export function hasCompletedVoiceSetup() {
  if (typeof window === "undefined") return true;
  try {
    const value = localStorage.getItem(VOICE_SETUP_STORAGE_KEY);
    return value === "done" || value === "seen";
  } catch {
    return true;
  }
}

export function markVoiceSetupCompleted() {
  try {
    localStorage.setItem(VOICE_SETUP_STORAGE_KEY, "done");
  } catch {
    /* ignore */
  }
}

export function markVoiceSetupSeen() {
  try {
    const current = localStorage.getItem(VOICE_SETUP_STORAGE_KEY);
    if (current !== "done") localStorage.setItem(VOICE_SETUP_STORAGE_KEY, "seen");
  } catch {
    /* ignore */
  }
}

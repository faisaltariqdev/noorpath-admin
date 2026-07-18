import { LETTERS } from "../data/curriculum";
import { cancelSpeech, speakEnglish, unlockSpeechAudio } from "./speech";
import { toSpokenQaidaName } from "./spokenNames";

export type PronunciationMode = "normal" | "slow";
export type QaidaSoundEffect = "tap" | "correct" | "retry" | "coin" | "reward" | "level-up";

export interface QaidaAudioAssets {
  pronunciations?: Record<string, { normal?: string; slow?: string }>;
  effects?: Partial<Record<QaidaSoundEffect, string>>;
}

export interface PronunciationRequest {
  key: string;
  fallbackText: string;
  /** Display name e.g. "Alif" — spoken as one clear word. */
  englishName?: string;
  mode?: PronunciationMode;
  repeat?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

function displayNameForKey(key: string, explicit?: string): string | null {
  if (explicit?.trim()) return explicit.trim();
  const letter = LETTERS.find((item) => item.audioKey === key || `letter-${item.id}` === key);
  if (!letter) return null;
  return letter.name || letter.sound || null;
}

class QaidaAudioService {
  private assets: QaidaAudioAssets = {};
  private enabled = true;
  private activeAudio: HTMLAudioElement | null = null;
  private requestId = 0;
  private unlocked = false;

  configure(assets: QaidaAudioAssets) {
    this.assets = assets;
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    unlockSpeechAudio();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  isEnabled() {
    return this.enabled;
  }

  stop() {
    this.requestId += 1;
    cancelSpeech();
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
  }

  /**
   * Speaks ONE clear Qaida name: Alif, Baa, Taa, Thaa, Jeem, Haa…
   * Does not spell A-L-I-F and does not double-speak Arabic after.
   */
  async pronounce({
    key,
    fallbackText,
    englishName,
    mode = "normal",
    repeat = 1,
    onStart,
    onEnd,
  }: PronunciationRequest): Promise<void> {
    if (!this.enabled) return;
    this.unlock();
    this.stop();
    const requestId = this.requestId;
    const source = this.assets.pronunciations?.[key]?.[mode];
    const displayName = displayNameForKey(key, englishName);
    const spoken = displayName
      ? toSpokenQaidaName(displayName)
      : fallbackText && !/[\u0600-\u06FF]/.test(fallbackText)
        ? fallbackText
        : null;
    const rate = mode === "slow" ? 0.75 : 0.9;

    onStart?.();
    try {
      for (let index = 0; index < Math.max(1, repeat); index += 1) {
        if (!this.enabled || requestId !== this.requestId) return;

        if (source) {
          const played = await this.playFile(source);
          if (played) continue;
        }

        if (spoken) {
          await speakEnglish(spoken, rate, 1.05);
        }
      }
    } finally {
      if (requestId === this.requestId) onEnd?.();
    }
  }

  feedback(message: string, language: "ar" | "en" = "en") {
    if (!this.enabled) return;
    this.unlock();
    // Keep feedback simple and English so it never letter-spells.
    void speakEnglish(language === "ar" ? message : message, 0.92, 1.05);
  }

  async effect(effect: QaidaSoundEffect) {
    if (!this.enabled) return;
    this.unlock();
    const source = this.assets.effects?.[effect];
    if (source) {
      await this.playFile(source);
      return;
    }
    if (effect === "tap" || effect === "correct" || effect === "retry") {
      this.playTone(effect === "correct" ? 880 : effect === "retry" ? 220 : 520, 0.07);
    }
  }

  private playTone(frequency: number, durationSec: number) {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);
      osc.stop(ctx.currentTime + durationSec);
      window.setTimeout(() => void ctx.close(), Math.ceil(durationSec * 1000) + 50);
    } catch {
      /* ignore */
    }
  }

  private playFile(source: string) {
    return new Promise<boolean>((resolve) => {
      if (typeof Audio === "undefined") {
        resolve(false);
        return;
      }

      const audio = new Audio(source);
      this.activeAudio = audio;
      audio.preload = "auto";
      audio.onended = () => {
        if (this.activeAudio === audio) this.activeAudio = null;
        resolve(true);
      };
      audio.onerror = () => {
        if (this.activeAudio === audio) this.activeAudio = null;
        resolve(false);
      };
      void audio.play().catch(() => resolve(false));
    });
  }
}

export const qaidaAudio = new QaidaAudioService();

import { cancelSpeech, speakArabic, speakEnglish, unlockSpeechAudio } from "./speech";

export type PronunciationMode = "normal" | "slow";
export type QaidaSoundEffect = "tap" | "correct" | "retry" | "coin" | "reward" | "level-up";

export interface QaidaAudioAssets {
  pronunciations?: Record<string, { normal?: string; slow?: string }>;
  effects?: Partial<Record<QaidaSoundEffect, string>>;
}

export interface PronunciationRequest {
  key: string;
  /** Arabic text spoken exactly as Namaz/Duas did — e.g. ا ب ت or full dua lines. */
  fallbackText: string;
  mode?: PronunciationMode;
  repeat?: number;
  onStart?: () => void;
  onEnd?: () => void;
  /** Accepted for call-site compatibility; ignored (simple cancel+speak model). */
  policy?: string;
  /** @deprecated Ignored — speech uses Arabic fallbackText only. */
  englishName?: string;
}

/**
 * Same pronunciation model used when Namaz & Daily Duas were added:
 * speak the Arabic fallbackText with an Arabic voice (ar-SA preferred).
 */
class QaidaAudioService {
  private assets: QaidaAudioAssets = {};
  private enabled = true;
  private activeAudio: HTMLAudioElement | null = null;
  private requestId = 0;
  private unlocked = false;

  configure(assets: QaidaAudioAssets) {
    this.assets = assets;
  }

  /** Must run inside a user gesture on Windows/Chrome for TTS + HTMLAudio. */
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

  async pronounce({
    key,
    fallbackText,
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

    onStart?.();
    try {
      for (let index = 0; index < Math.max(1, repeat); index += 1) {
        if (!this.enabled || requestId !== this.requestId) return;
        if (source) {
          const played = await this.playFile(source);
          if (!played) await this.playSpeech(fallbackText, mode === "slow" ? 0.55 : 0.78);
        } else {
          await this.playSpeech(fallbackText, mode === "slow" ? 0.55 : 0.78);
        }
      }
    } finally {
      if (requestId === this.requestId) onEnd?.();
    }
  }

  feedback(message: string, language: "ar" | "en" = "en") {
    if (!this.enabled) return;
    this.unlock();
    if (language === "ar") void speakArabic(message, 0.78, 1.05);
    else void speakEnglish(message);
  }

  async effect(effect: QaidaSoundEffect) {
    if (!this.enabled) return;
    this.unlock();
    const source = this.assets.effects?.[effect];
    if (source) {
      await this.playFile(source);
      return;
    }
    // Soft click fallback when effect files are missing (Windows browsers still hear feedback).
    if (effect === "tap" || effect === "correct" || effect === "retry") {
      this.playTone(effect === "correct" ? 880 : effect === "retry" ? 220 : 520, 0.07);
    }
  }

  private async playSpeech(text: string, rate: number) {
    await speakArabic(text, rate, 1.02);
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

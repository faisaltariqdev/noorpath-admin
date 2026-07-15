import { cancelSpeech, speakArabic, speakEnglish } from "./speech";

export type PronunciationMode = "normal" | "slow";
export type QaidaSoundEffect = "tap" | "correct" | "retry" | "coin" | "reward" | "level-up";

export interface QaidaAudioAssets {
  pronunciations?: Record<string, { normal?: string; slow?: string }>;
  effects?: Partial<Record<QaidaSoundEffect, string>>;
}

export interface PronunciationRequest {
  key: string;
  fallbackText: string;
  mode?: PronunciationMode;
  repeat?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

class QaidaAudioService {
  private assets: QaidaAudioAssets = {};
  private enabled = true;
  private activeAudio: HTMLAudioElement | null = null;
  private requestId = 0;

  configure(assets: QaidaAudioAssets) {
    this.assets = assets;
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
    this.stop();
    const requestId = this.requestId;
    const source = this.assets.pronunciations?.[key]?.[mode];

    onStart?.();
    try {
      for (let index = 0; index < Math.max(1, repeat); index += 1) {
        if (!this.enabled || requestId !== this.requestId) return;
        if (source) await this.playFile(source);
        else await this.playSpeech(fallbackText, mode === "slow" ? 0.55 : 0.78);
      }
    } finally {
      if (requestId === this.requestId) onEnd?.();
    }
  }

  feedback(message: string, language: "ar" | "en" = "en") {
    if (!this.enabled) return;
    if (language === "ar") speakArabic(message, 0.78, 1.05);
    else speakEnglish(message);
  }

  async effect(effect: QaidaSoundEffect) {
    if (!this.enabled) return;
    const source = this.assets.effects?.[effect];
    if (source) await this.playFile(source);
  }

  private playSpeech(text: string, rate: number) {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = rate;
      utterance.pitch = 1.02;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  private playFile(source: string) {
    return new Promise<void>((resolve) => {
      if (typeof Audio === "undefined") {
        resolve();
        return;
      }

      const audio = new Audio(source);
      this.activeAudio = audio;
      audio.preload = "auto";
      audio.onended = () => {
        if (this.activeAudio === audio) this.activeAudio = null;
        resolve();
      };
      audio.onerror = () => {
        if (this.activeAudio === audio) this.activeAudio = null;
        resolve();
      };
      void audio.play().catch(() => resolve());
    });
  }
}

export const qaidaAudio = new QaidaAudioService();

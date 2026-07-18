import { audioManager } from "./engine/AudioManager";
import type { AudioAssets, PronunciationMode, QueuePolicy, SoundEffect } from "./engine/types";

export type { PronunciationMode, SoundEffect as QaidaSoundEffect };

export interface PronunciationRequest {
  key: string;
  fallbackText: string;
  /** @deprecated Ignored — engine always uses Arabic speech for letters. */
  englishName?: string;
  mode?: PronunciationMode;
  repeat?: number;
  policy?: QueuePolicy;
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * Stable public facade used across Qaida screens/games.
 * All speech flows through the enterprise AudioManager — never call
 * window.speechSynthesis from React components.
 */
class QaidaAudioService {
  configure(assets: AudioAssets) {
    audioManager.configure(assets);
    void audioManager.init();
  }

  unlock() {
    audioManager.unlock();
  }

  setEnabled(enabled: boolean) {
    audioManager.setEnabled(enabled);
  }

  isEnabled() {
    return audioManager.isEnabled();
  }

  stop() {
    audioManager.stop();
  }

  pronounce(request: PronunciationRequest) {
    audioManager.pronounce({
      key: request.key,
      fallbackText: request.fallbackText,
      mode: request.mode,
      repeat: request.repeat,
      policy: request.policy,
      onStart: request.onStart,
      onEnd: request.onEnd,
    });
  }

  feedback(message: string, language: "ar" | "en" = "en") {
    audioManager.feedback(message, language);
  }

  async effect(effect: SoundEffect) {
    audioManager.effect(effect);
  }

  getStatus() {
    return audioManager.getStatus();
  }
}

export const qaidaAudio = new QaidaAudioService();
export type { AudioAssets as QaidaAudioAssets };

/**
 * @deprecated Direct speech helpers are retired.
 * Use `qaidaAudio` / `audioManager` only.
 * Thin wrappers kept temporarily so any stray imports still compile.
 */
import { audioManager } from "./engine/AudioManager";

export async function speakArabic(text: string, rate = 0.78, _pitch = 1.02): Promise<void> {
  audioManager.unlock();
  audioManager.pronounce({
    key: `legacy-ar-${text}`,
    fallbackText: text,
    mode: rate < 0.65 ? "slow" : "normal",
    policy: "replace",
  });
}

export async function speakEnglish(text: string, _rate = 0.9, _pitch = 1.05): Promise<void> {
  audioManager.unlock();
  audioManager.feedback(text, "en");
}

export function cancelSpeech(): void {
  audioManager.stop();
}

export function unlockSpeechAudio(): void {
  audioManager.unlock();
}

/** Enterprise pronunciation engine types */

export type PronunciationMode = "normal" | "slow";
export type SoundEffect = "tap" | "correct" | "retry" | "coin" | "reward" | "level-up";
export type QueuePolicy = "enqueue" | "replace" | "ignore-if-busy";

export type SpeechKind = "arabic" | "english" | "effect";

export interface VoiceScore {
  voice: SpeechSynthesisVoice;
  score: number;
  reasons: string[];
}

export interface PronounceJob {
  id: string;
  kind: "pronounce";
  key: string;
  arabicText: string;
  mode: PronunciationMode;
  repeat: number;
  policy: QueuePolicy;
  onStart?: () => void;
  onEnd?: () => void;
  createdAt: number;
}

export interface FeedbackJob {
  id: string;
  kind: "feedback";
  text: string;
  language: "ar" | "en";
  policy: QueuePolicy;
  onStart?: () => void;
  onEnd?: () => void;
  createdAt: number;
}

export interface EffectJob {
  id: string;
  kind: "effect";
  effect: SoundEffect;
  policy: QueuePolicy;
  onStart?: () => void;
  onEnd?: () => void;
  createdAt: number;
}

export type AudioJob = PronounceJob | FeedbackJob | EffectJob;

export interface AudioAssets {
  pronunciations?: Record<string, { normal?: string; slow?: string }>;
  effects?: Partial<Record<SoundEffect, string>>;
}

export interface AudioManagerStatus {
  enabled: boolean;
  unlocked: boolean;
  ready: boolean;
  speaking: boolean;
  queueLength: number;
  selectedVoiceName: string | null;
  selectedVoiceLang: string | null;
  lastError: string | null;
  supportsSpeechSynthesis: boolean;
}

export interface AnimationSyncHooks {
  onGestureStart?: (job: AudioJob) => void;
  onSpeechStart?: (job: AudioJob) => void;
  onSpeechEnd?: (job: AudioJob) => void;
}

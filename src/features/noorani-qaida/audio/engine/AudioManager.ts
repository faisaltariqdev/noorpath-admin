import { detectBrowserProfile } from "./BrowserCompat";
import { VoiceManager } from "./VoiceManager";
import { QueueManager } from "./QueueManager";
import { SpeechAdapter } from "./SpeechAdapter";
import { AnimationSync } from "./AnimationSync";
import { arabicSpeechForKey, isArabicText } from "./letterLexicon";
import type {
  AudioAssets,
  AudioJob,
  AudioManagerStatus,
  PronunciationMode,
  QueuePolicy,
  SoundEffect,
} from "./types";

const TAP_DEBOUNCE_MS = 180;

/**
 * Single enterprise entry point for all Qaida pronunciation.
 * React components must only talk to this manager (via qaidaAudio facade).
 */
export class AudioManager {
  private readonly voices = new VoiceManager();
  private readonly queue = new QueueManager();
  private readonly speech = new SpeechAdapter(this.voices);
  private readonly animation = new AnimationSync();
  private readonly profile = detectBrowserProfile();

  private enabled = true;
  private unlocked = false;
  private assets: AudioAssets = {};
  private pumping = false;
  private abort: AbortController | null = null;
  private lastTapAt = 0;
  private lastKey: string | null = null;
  private lastError: string | null = null;
  private activeAudio: HTMLAudioElement | null = null;
  private jobSeq = 0;

  async init() {
    if (!this.profile.supportsSpeechSynthesis) {
      this.lastError = "speech-synthesis-unavailable";
      return;
    }
    await this.voices.ensureReady();
  }

  configure(assets: AudioAssets) {
    this.assets = assets;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  isEnabled() {
    return this.enabled;
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.speech.unlock();
    void this.voices.ensureReady();
  }

  getStatus(): AudioManagerStatus {
    const selected = this.voices.getSelected();
    return {
      enabled: this.enabled,
      unlocked: this.unlocked,
      ready: this.voices.isReady(),
      speaking: Boolean(this.queue.getActive()),
      queueLength: this.queue.length,
      selectedVoiceName: selected?.name || null,
      selectedVoiceLang: selected?.lang || null,
      lastError: this.lastError,
      supportsSpeechSynthesis: this.profile.supportsSpeechSynthesis,
    };
  }

  stop() {
    this.abort?.abort();
    this.abort = null;
    this.queue.clearAll();
    this.speech.cancel();
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
  }

  /**
   * Pronounce Arabic content.
   * Default: enqueue different letters sequentially; ignore duplicate taps
   * of the same letter while it is already playing. Pass policy: "replace"
   * for intentional replay / “play again”.
   */
  pronounce(options: {
    key: string;
    fallbackText: string;
    mode?: PronunciationMode;
    repeat?: number;
    policy?: QueuePolicy;
    onStart?: () => void;
    onEnd?: () => void;
  }) {
    if (!this.enabled) return;

    const now = Date.now();
    // Anti-spam: identical key within debounce window is ignored
    if (options.key === this.lastKey && now - this.lastTapAt < TAP_DEBOUNCE_MS) {
      return;
    }
    this.lastTapAt = now;
    this.lastKey = options.key;

    this.unlock();

    // Default: queue different letters sequentially (Alif→Ba→Ta).
    // Same letter while already speaking that letter is ignored (anti-restart spam).
    // Callers that need “play again” must pass policy: "replace".
    const policy = options.policy || this.defaultPronouncePolicy(options.key);
    if (policy === "replace") {
      this.abort?.abort();
      this.speech.cancel();
      this.queue.clearAll();
    }

    const arabicText = arabicSpeechForKey(options.key, options.fallbackText);
    const job: AudioJob = {
      id: this.nextId("pronounce"),
      kind: "pronounce",
      key: options.key,
      arabicText,
      mode: options.mode || "normal",
      repeat: Math.max(1, options.repeat || 1),
      policy,
      onStart: options.onStart,
      onEnd: options.onEnd,
      createdAt: now,
    };

    if (!this.queue.offer(job, policy)) return;
    void this.pump();
  }

  private defaultPronouncePolicy(key: string): QueuePolicy {
    const active = this.queue.getActive();
    if (active?.kind === "pronounce" && active.key === key) {
      return "ignore-if-busy";
    }
    return "enqueue";
  }

  feedback(message: string, language: "ar" | "en" = "en") {
    if (!this.enabled || !message.trim()) return;
    this.unlock();

    const job: AudioJob = {
      id: this.nextId("feedback"),
      kind: "feedback",
      text: message.trim(),
      language: language === "ar" || isArabicText(message) ? "ar" : "en",
      policy: "replace",
      createdAt: Date.now(),
    };

    this.abort?.abort();
    this.speech.cancel();
    this.queue.clearAll();
    this.queue.offer(job, "replace");
    void this.pump();
  }

  effect(effect: SoundEffect) {
    if (!this.enabled) return;
    this.unlock();

    const job: AudioJob = {
      id: this.nextId("effect"),
      kind: "effect",
      effect,
      policy: "enqueue",
      createdAt: Date.now(),
    };
    this.queue.offer(job, "enqueue");
    void this.pump();
  }

  private nextId(prefix: string) {
    this.jobSeq += 1;
    return `${prefix}-${this.jobSeq}-${Date.now()}`;
  }

  private async pump() {
    if (this.pumping) return;
    this.pumping = true;

    try {
      while (true) {
        const job = this.queue.takeNext();
        if (!job) break;
        await this.runJob(job);
        this.queue.completeActive(job.id);
      }
    } finally {
      this.pumping = false;
      // Another offer may have arrived while finishing
      if (this.queue.length > 0 && !this.queue.getActive()) {
        void this.pump();
      }
    }
  }

  private async runJob(job: AudioJob) {
    this.animation.gesture(job);
    job.onStart?.();
    this.animation.speechStart(job);

    this.abort = new AbortController();
    const signal = this.abort.signal;

    try {
      if (job.kind === "pronounce") {
        await this.runPronounce(job, signal);
      } else if (job.kind === "feedback") {
        const result = await this.speech.speak({
          text: job.text,
          lang: job.language,
          rate: job.language === "ar" ? 0.78 : 0.92,
          pitch: 1.05,
          signal,
        });
        if (!result.ok && result.error) this.lastError = result.error;
      } else if (job.kind === "effect") {
        await this.runEffect(job.effect);
      }
    } finally {
      job.onEnd?.();
      this.animation.speechEnd(job);
      if (this.abort?.signal === signal) this.abort = null;
    }
  }

  private async runPronounce(
    job: Extract<AudioJob, { kind: "pronounce" }>,
    signal: AbortSignal,
  ) {
    const file = this.assets.pronunciations?.[job.key]?.[job.mode === "slow" ? "slow" : "normal"]
      || this.assets.pronunciations?.[job.key]?.normal;

    for (let i = 0; i < job.repeat; i += 1) {
      if (signal.aborted) return;

      if (file) {
        const played = await this.playFile(file, signal);
        if (played) continue;
      }

      const rate = job.mode === "slow" ? 0.55 : 0.78;
      const result = await this.speech.speak({
        text: job.arabicText,
        lang: "ar",
        rate,
        pitch: 1.02,
        signal,
      });

      if (!result.ok) {
        this.lastError = result.error || "arabic-speech-failed";
        // Honest recovery: soft tone so the learner still gets feedback
        this.playTone(520, 0.06);
      } else {
        this.lastError = null;
      }
    }
  }

  private async runEffect(effect: SoundEffect) {
    const source = this.assets.effects?.[effect];
    if (source) {
      await this.playFile(source);
      return;
    }
    const freq = effect === "correct" || effect === "reward" ? 880 : effect === "retry" ? 220 : 520;
    this.playTone(freq, 0.07);
  }

  private playFile(source: string, signal?: AbortSignal) {
    return new Promise<boolean>((resolve) => {
      if (typeof Audio === "undefined") {
        resolve(false);
        return;
      }
      if (signal?.aborted) {
        resolve(false);
        return;
      }

      const audio = new Audio(source);
      this.activeAudio = audio;
      audio.preload = "auto";

      const cleanup = () => {
        if (this.activeAudio === audio) this.activeAudio = null;
      };

      const onAbort = () => {
        audio.pause();
        cleanup();
        resolve(false);
      };
      signal?.addEventListener("abort", onAbort, { once: true });

      audio.onended = () => {
        cleanup();
        resolve(true);
      };
      audio.onerror = () => {
        cleanup();
        resolve(false);
      };
      void audio.play().catch(() => {
        cleanup();
        resolve(false);
      });
    });
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
}

export const audioManager = new AudioManager();

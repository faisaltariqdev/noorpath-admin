import type { AnimationSyncHooks, AudioJob } from "./types";

/**
 * Coordinates speech lifecycle with existing UI animation callbacks.
 * Does not redesign UI — only times when onStart/onEnd fire relative to speech.
 */
export class AnimationSync {
  private hooks: AnimationSyncHooks = {};

  setHooks(hooks: AnimationSyncHooks) {
    this.hooks = hooks;
  }

  gesture(job: AudioJob) {
    this.hooks.onGestureStart?.(job);
  }

  speechStart(job: AudioJob) {
    // Small delay lets tap/compress/glow begin before audio
    if (typeof window === "undefined") {
      this.hooks.onSpeechStart?.(job);
      return;
    }
    window.setTimeout(() => this.hooks.onSpeechStart?.(job), 40);
  }

  speechEnd(job: AudioJob) {
    this.hooks.onSpeechEnd?.(job);
  }
}

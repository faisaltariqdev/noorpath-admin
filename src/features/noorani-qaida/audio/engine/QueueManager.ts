import type { AudioJob, QueuePolicy } from "./types";

type Listener = () => void;

/**
 * Serial job queue with replace / enqueue / ignore policies.
 * Guarantees one active utterance path at a time.
 */
export class QueueManager {
  private queue: AudioJob[] = [];
  private active: AudioJob | null = null;
  private listeners = new Set<Listener>();

  get length() {
    return this.queue.length + (this.active ? 1 : 0);
  }

  getActive() {
    return this.active;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * @returns true if the job was accepted into the pipeline
   */
  offer(job: AudioJob, policy: QueuePolicy = job.policy): boolean {
    if (policy === "ignore-if-busy" && (this.active || this.queue.length)) {
      return false;
    }

    if (policy === "replace") {
      this.queue = [];
      // Active job is cancelled by AudioManager before offer when replace is used.
      this.queue.push(job);
      this.emit();
      return true;
    }

    // enqueue
    this.queue.push(job);
    this.emit();
    return true;
  }

  clearPending() {
    this.queue = [];
    this.emit();
  }

  clearAll() {
    this.queue = [];
    this.active = null;
    this.emit();
  }

  takeNext(): AudioJob | null {
    if (this.active) return null;
    const next = this.queue.shift() || null;
    this.active = next;
    this.emit();
    return next;
  }

  completeActive(jobId: string) {
    if (this.active?.id === jobId) {
      this.active = null;
      this.emit();
    }
  }

  bumpActive(job: AudioJob) {
    this.active = job;
    this.emit();
  }
}

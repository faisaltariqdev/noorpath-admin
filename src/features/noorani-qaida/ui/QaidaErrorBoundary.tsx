"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { PROGRESS_STORAGE_KEY, LEGACY_PROGRESS_KEYS } from "../state/progress";
import { PRACTICE_CONFIG_STORAGE_KEY } from "../state/practiceConfig";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Prevents a blank Next.js “client-side exception” screen.
 * Shows the real error and a one-tap recovery for corrupt local progress.
 */
export default class QaidaErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Noorani Qaida]", error, info.componentStack);
  }

  private clearLocalData = () => {
    try {
      window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
      LEGACY_PROGRESS_KEYS.forEach((key) => window.localStorage.removeItem(key));
      window.localStorage.removeItem(PRACTICE_CONFIG_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-emerald-50 p-6">
        <div className="w-full max-w-lg rounded-3xl border border-emerald-200 bg-white p-6 shadow-lg">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Noorani Qaida</p>
          <h1 className="mt-2 text-xl font-black text-slate-950">Something went wrong loading this page</h1>
          <p className="mt-2 text-sm text-slate-600">
            Usually this is a stale browser cache or saved progress on this device. Try reloading, or reset local
            Qaida data (your academy account is not deleted).
          </p>
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-red-700">
            {this.state.error.message}
          </pre>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 rounded-full bg-emerald-700 px-5 text-sm font-black text-white"
            >
              Reload page
            </button>
            <button
              type="button"
              onClick={this.clearLocalData}
              className="min-h-11 rounded-full border border-slate-300 bg-white px-5 text-sm font-black text-slate-800"
            >
              Reset local Qaida data
            </button>
          </div>
        </div>
      </main>
    );
  }
}

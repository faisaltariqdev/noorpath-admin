"use client";

import { motion } from "framer-motion";
import type { QaidaSettings } from "../types";

interface SettingsScreenProps {
  settings: QaidaSettings;
  onUpdate: (settings: Partial<QaidaSettings>) => void;
  onReset: () => void;
}

function Toggle({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-900/10 bg-white p-4">
      <div>
        <h3 className="font-black text-slate-900">{label}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-11 w-16 flex-none rounded-full p-1 transition-colors ${
          checked ? "bg-emerald-600" : "bg-slate-300"
        }`}
      >
        <motion.span
          className="block h-9 w-9 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 440, damping: 30 }}
        />
      </button>
    </div>
  );
}

export default function SettingsScreen({ settings, onUpdate, onReset }: SettingsScreenProps) {
  return (
    <main className="qaida-scroll h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Learning preferences</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-slate-600">Choose a comfortable learning experience for this device.</p>
        </header>

        <section className="qaida-panel space-y-3 p-4 sm:p-5" aria-label="Learning settings">
          <Toggle
            checked={settings.audioEnabled}
            label="Audio guidance"
            description="Play letter pronunciation and encouraging voice feedback."
            onChange={(audioEnabled) => onUpdate({ audioEnabled })}
          />
          <Toggle
            checked={settings.reducedMotion}
            label="Reduce motion"
            description="Use gentle fades instead of repeated movement and particle effects."
            onChange={(reducedMotion) => onUpdate({ reducedMotion })}
          />
        </section>

        <section className="mt-5 rounded-[1.25rem] border border-rose-200 bg-rose-50 p-5">
          <h2 className="font-black text-rose-950">Reset device progress</h2>
          <p className="mt-1 text-sm text-rose-800">
            This clears Noorani Qaida progress stored in this browser. It does not change any academy account records.
          </p>
          <button
            type="button"
            className="mt-4 min-h-11 rounded-full border border-rose-300 bg-white px-5 py-2.5 text-sm font-black text-rose-800 hover:bg-rose-100"
            onClick={() => {
              if (window.confirm("Reset Noorani Qaida progress on this device?")) onReset();
            }}
          >
            Reset device progress
          </button>
        </section>
      </div>
    </main>
  );
}

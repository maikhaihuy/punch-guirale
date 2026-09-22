"use client";

import { Dices } from "lucide-react";

import type { NoteName } from "@/lib/theory";

type Props = {
  root: NoteName;
  familyName: string;
  modeName: string;
  onRandomize: () => void;
};

// Bottom-bar cluster: the randomize-root button next to a readout of the
// current key and scale/mode, so the key is visible at a glance without
// scrolling back up to the wheel.
export function RootRandomizer({ root, familyName, modeName, onRandomize }: Props) {
  const readout = `${root} ${familyName} · ${modeName}`;
  return (
    <div
      className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-black/10 bg-surface/95 px-4 py-3 shadow-lg backdrop-blur-sm md:w-80 md:shrink-0 dark:border-white/10"
    >
      <button
        type="button"
        onClick={onRandomize}
        aria-label="Randomize root note"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-bg"
      >
        <Dices className="size-5" aria-hidden />
      </button>
      <span title={readout} className="min-w-0 truncate text-sm font-medium text-text">
        <span className="font-display text-base font-semibold">{root}</span>{" "}
        <span className="text-text-muted">
          {familyName} · {modeName}
        </span>
      </span>
    </div>
  );
}

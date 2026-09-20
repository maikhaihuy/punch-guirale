"use client";

import { Dice5 } from "lucide-react";

import { ScaleInfoTable } from "@/components/ScaleInfoTable";
import { ScaleWheel } from "@/components/ScaleWheel";
import { Switch } from "@/components/ui/switch";
import type { ScaleFamily } from "@/lib/scales";
import { getDiatonicDegrees, getWholeHalfPattern, randomRoot, type NoteName } from "@/lib/theory";

export type DisplayMode = "note" | "degree";

type Props = {
  root: NoteName;
  onRootChange: (root: NoteName) => void;
  family: ScaleFamily;
  modeId: string;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  selectedDegreeIndex: number | null;
  onSelectedDegreeIndexChange: (degree: number | null) => void;
};

export function ScaleDashboard({
  root,
  onRootChange,
  family,
  modeId,
  displayMode,
  onDisplayModeChange,
  selectedDegreeIndex,
  onSelectedDegreeIndexChange,
}: Props) {
  // Formula label and note name are degree-count-agnostic and render the
  // same way for every family. Roman numeral (derived from triad quality)
  // and the W/H step pattern only generalize to a 7-note family - tertian
  // triads need 7 degrees to stack thirds, and pentatonic/blue gaps
  // include 3-semitone jumps a binary W/H label can't represent - so both
  // stay gated on isSevenDegree, same as theory.ts's own callers.
  const isSevenDegree = family.degreeCount === 7;
  const diatonicDegrees = getDiatonicDegrees(root, family, modeId);
  const wholeHalfPattern = getWholeHalfPattern(family, modeId);

  return (
    <div className="flex w-full flex-col gap-3">
      <section className="flex flex-wrap items-center gap-2">
        <ScaleWheel root={root} onRootChange={onRootChange} family={family} modeId={modeId} />
        <button
          type="button"
          onClick={() => onRootChange(randomRoot())}
          className="ml-2 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-opacity hover:opacity-90"
          aria-label="Randomize root note"
          title="Randomize root note"
        >
          <Dice5 className="size-4" aria-hidden />
        </button>
        <ScaleInfoTable root={root} family={family} modeId={modeId} />
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-text-muted">Degrees</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectedDegreeIndexChange(null)}
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
                selectedDegreeIndex === null
                  ? "bg-text text-bg"
                  : "text-text/70 hover:bg-black/5 dark:hover:bg-white/10",
              )}
            >
              None
            </button>
            {diatonicDegrees.map((degree, i) => (
              <div key={degree.index} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectedDegreeIndexChange(degree.index)}
                  className={cn(
                    "flex shrink-0 flex-col items-center gap-0.5 rounded-md px-2.5 py-1 text-sm font-medium leading-tight transition-colors",
                    degree.index === selectedDegreeIndex
                      ? "bg-text text-bg"
                      : "text-text/70 hover:bg-black/5 dark:hover:bg-white/10",
                  )}
                >
                  <span>{degree.degreeLabel}</span>
                  <span className="text-xs opacity-70">{degree.noteName}</span>
                  {isSevenDegree && (
                    <span className="text-[10px] opacity-70">{degree.romanNumeral}</span>
                  )}
                </button>
                {isSevenDegree && i < diatonicDegrees.length - 1 && (
                  <span className="text-xs text-text-muted" aria-hidden="true">
                    {wholeHalfPattern[i]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span>Note</span>
          <Switch
            checked={displayMode === "degree"}
            onCheckedChange={(checked) => onDisplayModeChange(checked ? "degree" : "note")}
          />
          <span>Degree</span>
        </label>
      </section>
    </div>
  );
}

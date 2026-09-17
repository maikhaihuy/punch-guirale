"use client";

import { cn } from "cn";
import { Dice5 } from "lucide-react";

import { ScaleInfoTable } from "@/components/ScaleInfoTable";
import { ScaleWheel } from "@/components/ScaleWheel";
import { Switch } from "@/components/ui/switch";
import { getChordLabel, getChordSuffixesForQuality } from "@/lib/chords";
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
  selectedTriadDegree: number | null;
  onSelectedTriadDegreeChange: (degree: number | null) => void;
};

export function ScaleDashboard({
  root,
  onRootChange,
  family,
  modeId,
  displayMode,
  onDisplayModeChange,
  selectedTriadDegree,
  onSelectedTriadDegreeChange,
}: Props) {
  // getDiatonicDegrees also computes triad quality/roman numeral, and
  // getWholeHalfPattern the W/H step pattern - neither is meaningful for
  // a 5-note family (triads and diatonic step patterns need 7 degrees),
  // so the row only renders that richer content when degreeCount === 7,
  // same gating convention as theory.ts's own callers. For other degree
  // counts the row falls back to a plain index/note-name pill, since it
  // doubles as the fretboard's single-note highlight control there (see
  // ScalePage) even though the 3-note triad ring stays 7-note-only.
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
              onClick={() => onSelectedTriadDegreeChange(null)}
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
                selectedTriadDegree === null
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
                  onClick={() => onSelectedTriadDegreeChange(degree.index)}
                  className={cn(
                    "flex shrink-0 flex-col items-center gap-0.5 rounded-md px-2.5 py-1 text-sm font-medium leading-tight transition-colors",
                    degree.index === selectedTriadDegree
                      ? "bg-text text-bg"
                      : "text-text/70 hover:bg-black/5 dark:hover:bg-white/10",
                  )}
                >
                  {isSevenDegree ? (
                    <>
                      <span>{degree.degreeLabel}</span>
                      <span className="text-xs opacity-70">{degree.romanNumeral}</span>
                      <span className="text-[10px] opacity-70">
                        {getChordSuffixesForQuality(degree.quality).map(getChordLabel).join(" · ")}
                      </span>
                    </>
                  ) : (
                    <span>{`${degree.index + 1} ${degree.noteName}`}</span>
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

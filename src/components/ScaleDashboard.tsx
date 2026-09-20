"use client";

import { ScaleInfoTable } from "@/components/ScaleInfoTable";
import { ScaleWheel } from "@/components/ScaleWheel";
import { Switch } from "@/components/ui/switch";
import type { ScaleFamily } from "@/lib/scales";
import { getDiatonicDegrees, getWholeHalfPattern, type NoteName } from "@/lib/theory";
import { cn } from "cn";

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
  // Formula label, note name, and the step indicator between pills are
  // degree-count-agnostic and render for every family (a gap other than a
  // half or whole step shows its semitone count, e.g. "3"). Only the roman
  // numeral, derived from triad quality, is 7-note-specific - tertian
  // triads need 7 degrees to stack thirds - so it stays gated on
  // isSevenDegree.
  const isSevenDegree = family.degreeCount === 7;
  const diatonicDegrees = getDiatonicDegrees(root, family, modeId);
  const wholeHalfPattern = getWholeHalfPattern(family, modeId);

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Stacked below md; from md the wheel gets ~2/5 and the table ~3/5 of
          one row. min-w-0 lets the table's own overflow-x-auto scroll inside
          its column instead of widening the page. */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
        <div className="min-w-0">
          <ScaleWheel root={root} onRootChange={onRootChange} family={family} modeId={modeId} />
        </div>
        <div className="min-w-0">
          <ScaleInfoTable root={root} family={family} modeId={modeId} />
        </div>
      </section>

      {/* Degrees take 8 of 10 parts of the row from md; the switch gets the
          rest but never less than its own content, so its labels are never
          clipped. The pills grow to fill their whole cell (flex-auto keeps
          them wrapping by content width on narrow screens). */}
      <section className="grid gap-3 md:grid-cols-[minmax(0,8fr)_minmax(max-content,2fr)] md:items-center md:gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
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
              <div key={degree.index} className="flex flex-auto items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectedDegreeIndexChange(degree.index)}
                  className={cn(
                    "flex flex-1 shrink-0 flex-col items-center gap-0.5 rounded-md px-2.5 py-1 text-sm font-medium leading-tight transition-colors",
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
                {i < diatonicDegrees.length - 1 && (
                  <span className="text-xs text-text-muted" aria-hidden="true">
                    {wholeHalfPattern[i]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm md:justify-end">
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

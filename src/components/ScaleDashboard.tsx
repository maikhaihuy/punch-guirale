"use client";

import { Dice5 } from "lucide-react";

import { ScaleWheel } from "@/components/ScaleWheel";
import { PillGroup } from "@/components/ui/pill-group";
import { Switch } from "@/components/ui/switch";
import type { ScaleFamily } from "@/lib/scales";
import { getDiatonicDegrees, randomRoot, type NoteName } from "@/lib/theory";

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
  // getDiatonicDegrees also computes triad quality/roman numeral, which
  // aren't meaningful for a 5-note family (triads need 7 degrees to
  // stack thirds) - but this row only reads .index/.noteName, both valid
  // for any degreeCount, so the row itself isn't gated. The fretboard's
  // 3-note triad ring stays 7-note-only (see ScalePage); selecting a
  // degree here always highlights at least that single note.
  const diatonicDegrees = getDiatonicDegrees(root, family, modeId);

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
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-text-muted">Degrees</span>
          <PillGroup
            options={[
              { key: "none", label: "None", value: null as number | null },
              ...diatonicDegrees.map((degree) => ({
                key: String(degree.index),
                label: `${degree.index + 1} ${degree.noteName}`,
                value: degree.index as number | null,
              })),
            ]}
            isSelected={(degree) => degree === selectedTriadDegree}
            onSelect={onSelectedTriadDegreeChange}
          />
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

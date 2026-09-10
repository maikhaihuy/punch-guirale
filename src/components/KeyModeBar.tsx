"use client";

import { Dice5 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { POSITION_IDS, type PositionId } from "@/lib/positions";
import { SCALE_FAMILIES, type ScaleFamily } from "@/lib/scales";
import { CHROMATIC, getDiatonicDegrees, randomRoot, type NoteName } from "@/lib/theory";

export type DisplayMode = "note" | "degree";
export type SelectedPosition = "all" | PositionId;

type Props = {
  root: NoteName;
  onRootChange: (root: NoteName) => void;
  family: ScaleFamily;
  onFamilyChange: (familyId: string) => void;
  modeId: string;
  onModeChange: (modeId: string) => void;
  variantId: string | undefined;
  onVariantChange: (variantId: string | undefined) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  selectedPosition: SelectedPosition;
  onSelectedPositionChange: (position: SelectedPosition) => void;
  selectedTriadDegree: number | null;
  onSelectedTriadDegreeChange: (degree: number | null) => void;
};

const TAB_BUTTON_CLASS = (active: boolean) =>
  `shrink-0 rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
    active
      ? "bg-text text-bg"
      : "text-text/70 hover:bg-black/5 dark:hover:bg-white/10"
  }`;

export function KeyModeBar({
  root,
  onRootChange,
  family,
  onFamilyChange,
  modeId,
  onModeChange,
  variantId,
  onVariantChange,
  displayMode,
  onDisplayModeChange,
  selectedPosition,
  onSelectedPositionChange,
  selectedTriadDegree,
  onSelectedTriadDegreeChange,
}: Props) {
  // CAGED position shapes are literal Major-scale fingering templates and
  // don't generalize to other families (see theory.ts buildFretboard).
  // Diatonic triads generalize to any 7-note family (Major, Harmonic
  // Minor) but not to Pentatonic. See design.md "Non-goals".
  const showPositions = family.id === "major";
  const showTriads = family.degreeCount === 7;
  const diatonicDegrees = showTriads ? getDiatonicDegrees(root, family, modeId) : [];

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="flex flex-col gap-2">
        <span className="text-sm text-text-muted">Key</span>
        <div className="flex flex-wrap items-center gap-2">
          {CHROMATIC.map((note) => (
            <button
              key={note}
              type="button"
              onClick={() => onRootChange(note)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-medium transition-colors ${
                note === root
                  ? "bg-text text-bg"
                  : "bg-black/5 text-text hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
              }`}
            >
              {note}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onRootChange(randomRoot())}
            className="ml-4 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-opacity hover:opacity-90"
            aria-label="Randomize root note"
            title="Randomize root note"
          >
            <Dice5 className="size-4" aria-hidden />
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <span className="text-sm text-text-muted">Family</span>
        <div className="flex flex-wrap items-center gap-2">
          {SCALE_FAMILIES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFamilyChange(f.id)}
              className={TAB_BUTTON_CLASS(f.id === family.id)}
            >
              {f.displayName}
            </button>
          ))}
        </div>
      </section>

      {family.modes.length > 1 && (
        <section className="flex flex-col gap-2">
          <span className="text-sm text-text-muted">Mode</span>
          <div className="flex flex-wrap items-center gap-2">
            {family.modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onModeChange(m.id)}
                className={TAB_BUTTON_CLASS(m.id === modeId)}
              >
                {m.displayName}
              </button>
            ))}
          </div>
        </section>
      )}

      {family.variants && family.variants.length > 0 && (
        <section className="flex flex-col gap-2">
          <span className="text-sm text-text-muted">Variant</span>
          <div className="flex flex-wrap items-center gap-2">
            {family.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onVariantChange(variantId === v.id ? undefined : v.id)}
                className={TAB_BUTTON_CLASS(variantId === v.id)}
              >
                {v.displayName}
              </button>
            ))}
          </div>
        </section>
      )}

      {showPositions && (
        <section className="flex flex-col gap-2">
          <span className="text-sm text-text-muted">Position</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectedPositionChange("all")}
              className={TAB_BUTTON_CLASS(selectedPosition === "all")}
            >
              All
            </button>
            {POSITION_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onSelectedPositionChange(id)}
                className={TAB_BUTTON_CLASS(selectedPosition === id)}
              >
                {id}
              </button>
            ))}
          </div>
        </section>
      )}

      {showTriads && (
        <section className="flex flex-col gap-2">
          <span className="text-sm text-text-muted">Triad</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectedTriadDegreeChange(null)}
              className={TAB_BUTTON_CLASS(selectedTriadDegree === null)}
            >
              None
            </button>
            {diatonicDegrees.map((degree) => (
              <button
                key={degree.index}
                type="button"
                onClick={() => onSelectedTriadDegreeChange(degree.index)}
                className={TAB_BUTTON_CLASS(selectedTriadDegree === degree.index)}
              >
                {degree.romanNumeral}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="flex items-center gap-6">
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

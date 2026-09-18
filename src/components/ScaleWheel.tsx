"use client";

import type { ScaleFamily } from "@/lib/scales";
import { CHROMATIC, getDiatonicDegrees, getScaleNoteNames, type NoteName } from "@/lib/theory";

type Props = {
  root: NoteName;
  onRootChange: (root: NoteName) => void;
  family: ScaleFamily;
  modeId: string;
};

// viewBox is fixed; the wrapping element in ScaleDashboard controls the
// rendered size responsively, same trick used for any fixed-viewBox SVG.
const SIZE = 260;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 100;
const INNER_RADIUS = 66;
const DOT_RADIUS = 16;
// 24 keeps adjacent touch circles just clear of each other (chord between
// neighboring wedge centers is ~51.8 viewBox units at OUTER_RADIUS=100,
// vs. 48 units of combined touch diameter here) while still scaling up to
// a real ~44px tap target at the wheel's minimum rendered width below.
const TOUCH_RADIUS = 24;

// Chromatic order, fixed regardless of root (the wheel never rotates - see
// design.md Decision 3). Index 0 (C) sits at 12 o'clock; index increases
// clockwise, 30 degrees per slice.
function angleForIndex(index: number): number {
  return ((-90 + index * 30) * Math.PI) / 180;
}

// Rounded to 2dp: Math.cos/Math.sin can differ in their last bit between
// the server and client JS engines for the same input, which otherwise
// produces a hydration mismatch on these SVG coordinates (React compares
// the exact string). Full float precision buys nothing visually at this
// element size anyway.
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function pointAt(radius: number, index: number): { x: number; y: number } {
  const theta = angleForIndex(index);
  return { x: round(CENTER + radius * Math.cos(theta)), y: round(CENTER + radius * Math.sin(theta)) };
}

export function ScaleWheel({ root, onRootChange, family, modeId }: Props) {
  const scaleNotes = new Set(getScaleNoteNames(root, family, modeId));
  // degree.degreeLabel is degree-count-agnostic, so the inner ring renders
  // for every family, not just 7-degree ones - see degree-highlighting
  // spec. romanNumeral is still 7-degree-only (tertian triads need 7
  // degrees to stack thirds), same gate as the Degrees row. The note name
  // itself isn't repeated here since the outer dot already shows it.
  const isSevenDegree = family.degreeCount === 7;
  const degreeByNote = new Map<NoteName, { degreeLabel: string; romanNumeral: string }>();
  for (const degree of getDiatonicDegrees(root, family, modeId)) {
    degreeByNote.set(degree.noteName, {
      degreeLabel: degree.degreeLabel,
      romanNumeral: degree.romanNumeral,
    });
  }

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="Scale wheel"
      className="h-auto w-[240px] shrink-0 sm:w-[260px]"
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={OUTER_RADIUS}
        className="fill-none stroke-text/10"
        strokeWidth={1}
      />
      {CHROMATIC.map((note, index) => {
        const inScale = scaleNotes.has(note);
        const isRoot = note === root;
        const { x, y } = pointAt(OUTER_RADIUS, index);
        const degree = degreeByNote.get(note);

        // Same filled-root / outlined-others convention as Fretboard's
        // note dots (see design.md Decision 2/3).
        const dotClassName = isRoot ? "fill-text stroke-text" : "fill-surface stroke-text/70";
        const labelClassName = [isRoot ? "fill-bg" : "fill-text", "text-[11px] font-semibold font-display"].join(
          " ",
        );

        return (
          <g
            key={note}
            onPointerDown={() => onRootChange(note)}
            className={`cursor-pointer transition-opacity ${inScale ? "" : "opacity-30"}`}
          >
            <circle cx={x} cy={y} r={TOUCH_RADIUS} fill="transparent" />
            <circle cx={x} cy={y} r={DOT_RADIUS} className={dotClassName} strokeWidth={2} />
            <text x={x} y={y} dominantBaseline="middle" textAnchor="middle" className={labelClassName}>
              {note}
            </text>

            {degree &&
              (() => {
                const inner = pointAt(INNER_RADIUS, index);
                if (!isSevenDegree) {
                  return (
                    <text
                      x={inner.x}
                      y={inner.y}
                      dominantBaseline="middle"
                      textAnchor="middle"
                      className="fill-text-muted text-[9px] font-medium tabular-nums"
                    >
                      {degree.degreeLabel}
                    </text>
                  );
                }
                return (
                  <text
                    x={inner.x}
                    y={inner.y}
                    dominantBaseline="middle"
                    textAnchor="middle"
                    className="fill-text-muted text-[9px] font-medium tabular-nums"
                  >
                    <tspan x={inner.x} dy="-0.6em">
                      {degree.degreeLabel}
                    </tspan>
                    <tspan x={inner.x} dy="1.1em">
                      {degree.romanNumeral}
                    </tspan>
                  </text>
                );
              })()}
          </g>
        );
      })}
    </svg>
  );
}

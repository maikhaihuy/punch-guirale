// Fixed CAGED-derived scale-position shapes for Milestone 2.
//
// Degree-keyed (degree 1 = root), not tied to any absolute note or mode, so
// the same 5 templates are reused across all 7 modes built on one parent key
// - only which degree is treated as "root" changes per mode. Defined once
// here rather than derived at runtime, per the milestone spec.
//
// Shape spans (fret range each position occupies, one octave, before
// transposing to the actual root) come from the standard CAGED major-scale
// fret ranges (C:0-3, A:2-6, G:4-8, E:7-10, D:9-13). Adjacent shapes overlap
// by 2-3 frets by design - a note near a shape boundary is legitimately part
// of both neighboring positions, so `positions` on a FretNote can hold more
// than one id, rather than every note picking exactly one owning position.
//
// The per-position entries below were generated from the real scale-degree
// math (not memorized/transcribed by hand) - see the generation approach in
// change history - and should still be spot-checked against a real
// fretboard before shipping, as called out in tasks.md.

export type PositionId = 1 | 2 | 3 | 4 | 5;

export const POSITION_IDS: PositionId[] = [1, 2, 3, 4, 5];

export const POSITION_SPANS: Record<PositionId, { lo: number; hi: number }> = {
  1: { lo: 0, hi: 3 },
  2: { lo: 2, hi: 6 },
  3: { lo: 4, hi: 8 },
  4: { lo: 7, hi: 10 },
  5: { lo: 9, hi: 13 },
};

type ShapeEntry = { string: number; fretOffset: number; degree: number };

// entries are { string: 0-5 (low E..high E), fretOffset: relative to this
// position's span.lo, degree: 1-7 (1 = root) }
export const POSITION_SHAPES: Record<PositionId, ShapeEntry[]> = {
  1: [
    { string: 0, fretOffset: 0, degree: 3 },
    { string: 0, fretOffset: 1, degree: 4 },
    { string: 0, fretOffset: 3, degree: 5 },
    { string: 1, fretOffset: 0, degree: 6 },
    { string: 1, fretOffset: 2, degree: 7 },
    { string: 1, fretOffset: 3, degree: 1 },
    { string: 2, fretOffset: 0, degree: 2 },
    { string: 2, fretOffset: 2, degree: 3 },
    { string: 2, fretOffset: 3, degree: 4 },
    { string: 3, fretOffset: 0, degree: 5 },
    { string: 3, fretOffset: 2, degree: 6 },
    { string: 4, fretOffset: 0, degree: 7 },
    { string: 4, fretOffset: 1, degree: 1 },
    { string: 4, fretOffset: 3, degree: 2 },
    { string: 5, fretOffset: 0, degree: 3 },
    { string: 5, fretOffset: 1, degree: 4 },
    { string: 5, fretOffset: 3, degree: 5 },
  ],
  2: [
    { string: 0, fretOffset: 1, degree: 5 },
    { string: 0, fretOffset: 3, degree: 6 },
    { string: 1, fretOffset: 0, degree: 7 },
    { string: 1, fretOffset: 1, degree: 1 },
    { string: 1, fretOffset: 3, degree: 2 },
    { string: 2, fretOffset: 0, degree: 3 },
    { string: 2, fretOffset: 1, degree: 4 },
    { string: 2, fretOffset: 3, degree: 5 },
    { string: 3, fretOffset: 0, degree: 6 },
    { string: 3, fretOffset: 2, degree: 7 },
    { string: 3, fretOffset: 3, degree: 1 },
    { string: 4, fretOffset: 1, degree: 2 },
    { string: 4, fretOffset: 3, degree: 3 },
    { string: 4, fretOffset: 4, degree: 4 },
    { string: 5, fretOffset: 1, degree: 5 },
    { string: 5, fretOffset: 3, degree: 6 },
  ],
  3: [
    { string: 0, fretOffset: 1, degree: 6 },
    { string: 0, fretOffset: 3, degree: 7 },
    { string: 0, fretOffset: 4, degree: 1 },
    { string: 1, fretOffset: 1, degree: 2 },
    { string: 1, fretOffset: 3, degree: 3 },
    { string: 1, fretOffset: 4, degree: 4 },
    { string: 2, fretOffset: 1, degree: 5 },
    { string: 2, fretOffset: 3, degree: 6 },
    { string: 3, fretOffset: 0, degree: 7 },
    { string: 3, fretOffset: 1, degree: 1 },
    { string: 3, fretOffset: 3, degree: 2 },
    { string: 4, fretOffset: 1, degree: 3 },
    { string: 4, fretOffset: 2, degree: 4 },
    { string: 4, fretOffset: 4, degree: 5 },
    { string: 5, fretOffset: 1, degree: 6 },
    { string: 5, fretOffset: 3, degree: 7 },
    { string: 5, fretOffset: 4, degree: 1 },
  ],
  4: [
    { string: 0, fretOffset: 0, degree: 7 },
    { string: 0, fretOffset: 1, degree: 1 },
    { string: 0, fretOffset: 3, degree: 2 },
    { string: 1, fretOffset: 0, degree: 3 },
    { string: 1, fretOffset: 1, degree: 4 },
    { string: 1, fretOffset: 3, degree: 5 },
    { string: 2, fretOffset: 0, degree: 6 },
    { string: 2, fretOffset: 2, degree: 7 },
    { string: 2, fretOffset: 3, degree: 1 },
    { string: 3, fretOffset: 0, degree: 2 },
    { string: 3, fretOffset: 2, degree: 3 },
    { string: 3, fretOffset: 3, degree: 4 },
    { string: 4, fretOffset: 1, degree: 5 },
    { string: 4, fretOffset: 3, degree: 6 },
    { string: 5, fretOffset: 0, degree: 7 },
    { string: 5, fretOffset: 1, degree: 1 },
    { string: 5, fretOffset: 3, degree: 2 },
  ],
  5: [
    { string: 0, fretOffset: 1, degree: 2 },
    { string: 0, fretOffset: 3, degree: 3 },
    { string: 0, fretOffset: 4, degree: 4 },
    { string: 1, fretOffset: 1, degree: 5 },
    { string: 1, fretOffset: 3, degree: 6 },
    { string: 2, fretOffset: 0, degree: 7 },
    { string: 2, fretOffset: 1, degree: 1 },
    { string: 2, fretOffset: 3, degree: 2 },
    { string: 3, fretOffset: 0, degree: 3 },
    { string: 3, fretOffset: 1, degree: 4 },
    { string: 3, fretOffset: 3, degree: 5 },
    { string: 4, fretOffset: 1, degree: 6 },
    { string: 4, fretOffset: 3, degree: 7 },
    { string: 4, fretOffset: 4, degree: 1 },
    { string: 5, fretOffset: 1, degree: 2 },
    { string: 5, fretOffset: 3, degree: 3 },
    { string: 5, fretOffset: 4, degree: 4 },
  ],
};

import { POSITION_IDS, POSITION_SHAPES, POSITION_SPANS, type PositionId } from "./positions";
import { getScaleNotes, type ScaleFamily } from "./scales";

export const CHROMATIC = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

export type NoteName = (typeof CHROMATIC)[number];

// Standard tuning, string 6 (low E) to string 1 (high E)
export const OPEN_STRINGS = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4

export function midiToNoteName(midi: number): NoteName {
  return CHROMATIC[midi % 12];
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Degree label for a semitone offset from root, expressed relative to the
// major scale (e.g. offset 3 -> "b3", offset 6 -> "b5"). This is a fixed
// 12-entry table rather than a per-family/mode computation, so it applies
// uniformly to any family's notes - diatonic, pentatonic, or an
// inserted variant note - without needing a degreeCount-specific reference.
const DEGREE_LABELS_BY_SEMITONE = [
  "1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7",
] as const;

function degreeLabelForSemitone(offset: number): string {
  return DEGREE_LABELS_BY_SEMITONE[((offset % 12) + 12) % 12];
}

// A rotated interval pattern for a family/mode - semitone offsets from
// root, e.g. [0,2,3,5,7,9,10] for Dorian. Derived via getScaleNotes with a
// rootMidi of 0 so the returned notes equal their own offsets, keeping
// getScaleNotes the sole place that performs rotation/variant arithmetic.
function modeIntervals(family: ScaleFamily, modeId: string): number[] {
  return getScaleNotes(0, family, modeId);
}

export type TriadQuality = "major" | "minor" | "diminished" | "augmented";

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];

// Semitone gap from one scale degree to another, unwrapped across the
// octave boundary - e.g. going from the last degree back to the first
// lands "below" in the raw interval table, so a negative gap means it
// actually wrapped forward by an octave.
function intervalGap(intervals: number[], fromIndex: number, toIndex: number): number {
  const gap = intervals[toIndex] - intervals[fromIndex];
  return gap > 0 ? gap : gap + 12;
}

// Derives a diatonic triad's quality from the mode's own (rotated) interval
// pattern instead of a hardcoded per-mode lookup, so e.g. Locrian's
// diminished root triad falls out of the math. Only meaningful for a
// 7-note interval pattern - tertian triads built by skipping every other
// scale degree assume 7 degrees per octave (see design.md "Non-goals").
export function getTriadQuality(intervals: number[], degreeIndex: number): TriadQuality {
  const n = intervals.length;
  const third = (degreeIndex + 2) % n;
  const fifth = (degreeIndex + 4) % n;
  const rootToThird = intervalGap(intervals, degreeIndex, third);
  const thirdToFifth = intervalGap(intervals, third, fifth);
  if (rootToThird === 4 && thirdToFifth === 3) return "major";
  if (rootToThird === 3 && thirdToFifth === 4) return "minor";
  if (rootToThird === 3 && thirdToFifth === 3) return "diminished";
  return "augmented";
}

export function getRomanNumeral(intervals: number[], degreeIndex: number): string {
  const numeral = ROMAN_NUMERALS[degreeIndex];
  switch (getTriadQuality(intervals, degreeIndex)) {
    case "major":
      return numeral;
    case "minor":
      return numeral.toLowerCase();
    case "diminished":
      return `${numeral.toLowerCase()}°`;
    case "augmented":
      return `${numeral}+`;
  }
}

export type DiatonicDegree = {
  index: number;
  noteName: NoteName;
  degreeLabel: string;
  romanNumeral: string;
  quality: TriadQuality;
};

// Diatonic triads only generalize to 7-note families (Major, Harmonic
// Minor) - callers gate this on family.degreeCount === 7 and hide the
// triad UI otherwise (see design.md "Non-goals").
export function getDiatonicDegrees(
  root: NoteName,
  family: ScaleFamily,
  modeId: string,
): DiatonicDegree[] {
  const rootIdx = CHROMATIC.indexOf(root);
  const intervals = modeIntervals(family, modeId);
  return intervals.map((interval, index) => ({
    index,
    noteName: CHROMATIC[(rootIdx + interval) % 12],
    degreeLabel: degreeLabelForSemitone(interval),
    romanNumeral: getRomanNumeral(intervals, index),
    quality: getTriadQuality(intervals, index),
  }));
}

// The 3 degree-label strings (e.g. "1", "b3", "5") making up the diatonic
// triad rooted at degreeIndex, for cheap per-note membership checks against
// FretNote.degree at render time.
export function getTriadDegreeLabels(
  family: ScaleFamily,
  modeId: string,
  degreeIndex: number,
): Set<string> {
  const intervals = modeIntervals(family, modeId);
  const n = intervals.length;
  const third = (degreeIndex + 2) % n;
  const fifth = (degreeIndex + 4) % n;
  return new Set([
    degreeLabelForSemitone(intervals[degreeIndex]),
    degreeLabelForSemitone(intervals[third]),
    degreeLabelForSemitone(intervals[fifth]),
  ]);
}

export type FretNote = {
  fret: number;
  midi: number;
  name: string; // e.g. "E"
  degree?: string; // e.g. "b3" — present only if inScale
  inScale: boolean;
  isRoot: boolean;
  freq: number;
  positions?: PositionId[]; // which of the 5 positions this note belongs to (can be more than one where shapes overlap)
};

export function buildFretboard(
  root: NoteName,
  family: ScaleFamily,
  modeId: string,
  variantId?: string,
  maxFret = 24,
): FretNote[][] {
  const rootIdx = CHROMATIC.indexOf(root);
  // rootMidi 0 anchor: getScaleNotes' output then equals each note's own
  // semitone offset from root, which is all buildFretboard needs (it never
  // touches a real octave).
  const degreeByOffset = new Map<number, string>();
  for (const offset of getScaleNotes(0, family, modeId, variantId)) {
    degreeByOffset.set(offset, degreeLabelForSemitone(offset));
  }

  const fretboard = OPEN_STRINGS.map((openMidi) =>
    Array.from({ length: maxFret + 1 }, (_, fret) => {
      const midi = openMidi + fret;
      const name = midiToNoteName(midi);
      const offset = (((midi % 12) - rootIdx) + 12) % 12;
      const degree = degreeByOffset.get(offset);
      return {
        fret,
        midi,
        name,
        degree,
        inScale: degree !== undefined,
        isRoot: name === root,
        freq: midiToFreq(midi),
      };
    }),
  );

  // CAGED position shapes (positions.ts) are literal Major-scale fingering
  // templates - they're only geometrically valid for the Major family, not
  // generically for any 7-note interval pattern (Harmonic Minor's
  // whole/half-step spacing differs). See design.md "Non-goals".
  if (family.id === "major") {
    tagPositions(fretboard, root, maxFret);
  }
  return fretboard;
}

// The 5 shape templates are defined once (degree-keyed) in positions.ts and
// repeat every 12 frets; this places each instance on the real fretboard for
// the given root by shifting the template's fret offsets by the root's
// chromatic index, same as how the underlying scale itself transposes.
function tagPositions(fretboard: FretNote[][], root: string, maxFret: number) {
  const rootIdx = CHROMATIC.indexOf(root as NoteName);
  for (const pos of POSITION_IDS) {
    const { lo } = POSITION_SPANS[pos];
    for (let cycle = -1; cycle <= 2; cycle++) {
      const base = lo + rootIdx + 12 * cycle;
      for (const entry of POSITION_SHAPES[pos]) {
        const fret = base + entry.fretOffset;
        if (fret < 0 || fret > maxFret) continue;
        const note = fretboard[entry.string][fret];
        if (note.inScale) {
          (note.positions ??= []).push(pos);
        }
      }
    }
  }
}

// Absolute fret range(s) a position occupies on the real fretboard for a
// given root, mirroring tagPositions' placement math. A position can occupy
// more than one range within 0-maxFret since shapes repeat every 12 frets.
// Only valid for the Major family - see buildFretboard's tagPositions gate.
export function getPositionRanges(
  root: string,
  pos: PositionId,
  maxFret = 24,
): Array<{ lo: number; hi: number }> {
  const rootIdx = CHROMATIC.indexOf(root as NoteName);
  const { lo, hi } = POSITION_SPANS[pos];
  const width = hi - lo;
  const ranges: Array<{ lo: number; hi: number }> = [];
  for (let cycle = -1; cycle <= 2; cycle++) {
    const rangeLo = lo + rootIdx + 12 * cycle;
    const rangeHi = rangeLo + width;
    if (rangeHi < 0 || rangeLo > maxFret) continue;
    ranges.push({ lo: Math.max(rangeLo, 0), hi: Math.min(rangeHi, maxFret) });
  }
  return ranges;
}

export function randomRoot(): NoteName {
  return CHROMATIC[Math.floor(Math.random() * CHROMATIC.length)];
}

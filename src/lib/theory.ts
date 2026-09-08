import { POSITION_IDS, POSITION_SHAPES, POSITION_SPANS, type PositionId } from "./positions";

export const CHROMATIC = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

export type NoteName = (typeof CHROMATIC)[number];

export const MODES = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
} as const;

export type ModeName = keyof typeof MODES;

export const MODE_LABELS: Record<ModeName, string> = {
  ionian: "Ionian",
  dorian: "Dorian",
  phrygian: "Phrygian",
  lydian: "Lydian",
  mixolydian: "Mixolydian",
  aeolian: "Aeolian",
  locrian: "Locrian",
};

// Standard tuning, string 6 (low E) to string 1 (high E)
export const OPEN_STRINGS = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4

export function midiToNoteName(midi: number): NoteName {
  return CHROMATIC[midi % 12];
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Degree label relative to major scale (e.g. dorian -> 1,2,b3,4,5,6,b7)
export function getDegreeLabels(mode: ModeName): string[] {
  const MAJOR = MODES.ionian;
  return MODES[mode].map((interval, i) => {
    const diff = interval - MAJOR[i];
    const num = i + 1;
    if (diff === 0) return `${num}`;
    return diff < 0 ? `${"b".repeat(-diff)}${num}` : `${"#".repeat(diff)}${num}`;
  });
}

// Map note name -> degree label for the chosen root + mode
export function getScaleMap(root: string, mode: ModeName): Map<string, string> {
  const rootIdx = CHROMATIC.indexOf(root as NoteName);
  const degrees = getDegreeLabels(mode);
  const map = new Map<string, string>();
  MODES[mode].forEach((iv, i) => map.set(CHROMATIC[(rootIdx + iv) % 12], degrees[i]));
  return map;
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

export function buildFretboard(root: string, mode: ModeName, maxFret = 24): FretNote[][] {
  const scaleMap = getScaleMap(root, mode);
  const fretboard = OPEN_STRINGS.map((openMidi) =>
    Array.from({ length: maxFret + 1 }, (_, fret) => {
      const midi = openMidi + fret;
      const name = midiToNoteName(midi);
      const degree = scaleMap.get(name);
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
  tagPositions(fretboard, root, maxFret);
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

import { getConcreteChordName } from "./chords";
import { getIntervalName } from "./scaleTerms";
import { CHROMATIC, getChromaticDegreeLabel, type NoteName } from "./theory";

// Static, hand-authored reference for the scales guitarists most often play
// (the pentatonic scale's five rotations, plus Major/Minor Blues): for each
// slot, a roman numeral, a degree name, and usable chords. Major/Minor
// Pentatonic and both Blues scales also list the diatonic slots they skip.
// The data is editorial (e.g. "v / V", "Rarely used", C7#9 listed under
// bIII), so it isn't derivable from interval math - but skipped-vs-in-scale
// status IS derivable, so it's computed from the mode's own intervals
// rather than stored here.

// "not-applicable": a skipped slot the reference gives only a degree name -
// no roman numeral, no chords.
export type ReferenceHint = "rarely-used" | "avoid-note" | "turnaround" | "not-applicable";

// Chord roots/basses are semitone offsets from the KEY root, not from the
// row's own slot - a row's chords aren't always rooted on that row's note
// (e.g. C/E under the E slot, C7#9 under bIII).
export type ChordSpec = { rootOffset: number; suffix: string; bassOffset?: number };

export type ReferenceRow = {
  offset: number; // semitones above the key root
  roman?: string; // "I", "v / V", "bVI7"; absent for some skipped slots
  name: string; // "Tonic", "Minor Mediant"
  blueNote?: true;
  chords: readonly ChordSpec[];
  hint?: ReferenceHint;
};

const chord = (rootOffset: number, suffix: string, bassOffset?: number): ChordSpec =>
  bassOffset === undefined ? { rootOffset, suffix } : { rootOffset, suffix, bassOffset };

const MAJOR_PENTATONIC_ROWS: readonly ReferenceRow[] = [
  { offset: 0, roman: "I", name: "Tonic", chords: [chord(0, ""), chord(0, "maj7"), chord(0, "6"), chord(0, "add9")] },
  { offset: 2, roman: "ii", name: "Supertonic", chords: [chord(2, "m"), chord(2, "m7"), chord(2, "7sus4")] },
  { offset: 4, roman: "iii", name: "Mediant", chords: [chord(4, "m"), chord(4, "m7"), chord(0, "", 4)] },
  { offset: 5, roman: "IV", name: "Subdominant", chords: [chord(5, ""), chord(5, "maj7")], hint: "avoid-note" },
  { offset: 7, roman: "V", name: "Dominant", chords: [chord(7, ""), chord(7, "7"), chord(7, "sus4")] },
  { offset: 9, roman: "vi", name: "Submediant", chords: [chord(9, "m"), chord(9, "m7"), chord(9, "m11")] },
  { offset: 11, roman: "vii°", name: "Leading Tone", chords: [], hint: "rarely-used" },
];

const MINOR_PENTATONIC_ROWS: readonly ReferenceRow[] = [
  { offset: 0, roman: "i", name: "Tonic", chords: [chord(0, "m"), chord(0, "m7"), chord(0, "m11")] },
  { offset: 2, roman: "ii°", name: "Supertonic", chords: [], hint: "rarely-used" },
  { offset: 3, roman: "bIII", name: "Minor Mediant", chords: [chord(3, ""), chord(3, "maj7"), chord(3, "6")] },
  { offset: 5, roman: "iv", name: "Subdominant", chords: [chord(5, "m"), chord(5, "m7"), chord(5, "sus4")] },
  { offset: 7, roman: "v / V", name: "Dominant", chords: [chord(7, "m"), chord(7, "m7"), chord(7, "7")] },
  { offset: 8, roman: "bVI", name: "Submediant", chords: [chord(8, ""), chord(8, "maj7")] },
  { offset: 10, roman: "bVII", name: "Subtonic", chords: [chord(10, ""), chord(10, "7"), chord(10, "sus4")] },
];

// The three other rotations of the pentatonic scale. The sheet names their
// two skipped slots but gives no note, roman numeral, or chords, so those
// rows sit at the major scale's own degree for that position (Mediant 4,
// Submediant 9, Supertonic 2, Dominant 7, Leading Tone 11) and carry only a
// name and the "not-applicable" hint.
const EGYPTIAN_ROWS: readonly ReferenceRow[] = [
  { offset: 0, roman: "i", name: "Tonic", chords: [chord(0, "sus4"), chord(0, "m7(no3)"), chord(0, "7sus4")] },
  { offset: 2, roman: "ii", name: "Supertonic", chords: [chord(2, "m"), chord(2, "m7")] },
  { offset: 4, name: "Mediant", chords: [], hint: "not-applicable" },
  { offset: 5, roman: "IV", name: "Subdominant", chords: [chord(5, ""), chord(5, "7"), chord(5, "sus4")] },
  { offset: 7, roman: "v", name: "Dominant", chords: [chord(7, "m"), chord(7, "m7"), chord(7, "7")] },
  { offset: 9, name: "Submediant", chords: [], hint: "not-applicable" },
  { offset: 10, roman: "bVII", name: "Subtonic", chords: [chord(10, ""), chord(10, "maj7")] },
];

const MAN_GONG_ROWS: readonly ReferenceRow[] = [
  { offset: 0, roman: "i", name: "Tonic", chords: [chord(0, "m7(no5)"), chord(0, "sus4(b9)")] },
  { offset: 2, name: "Supertonic", chords: [], hint: "not-applicable" },
  { offset: 3, roman: "bIII", name: "Minor Mediant", chords: [chord(3, ""), chord(3, "7")] },
  { offset: 5, roman: "iv", name: "Subdominant", chords: [chord(5, "m"), chord(5, "m7")] },
  { offset: 7, name: "Dominant", chords: [], hint: "not-applicable" },
  { offset: 8, roman: "bVI", name: "Submediant", chords: [chord(8, ""), chord(8, "maj7")] },
  { offset: 10, roman: "bVII", name: "Subtonic", chords: [chord(10, "m"), chord(10, "m7")] },
];

const RITUSEN_ROWS: readonly ReferenceRow[] = [
  { offset: 0, roman: "I", name: "Tonic", chords: [chord(0, ""), chord(0, "sus4"), chord(0, "6")] },
  { offset: 2, roman: "ii", name: "Supertonic", chords: [chord(2, "m"), chord(2, "m7")] },
  { offset: 4, name: "Mediant", chords: [], hint: "not-applicable" },
  { offset: 5, roman: "IV", name: "Subdominant", chords: [chord(5, ""), chord(5, "maj7"), chord(5, "6")] },
  { offset: 7, roman: "V", name: "Dominant", chords: [chord(7, "m"), chord(7, "m7"), chord(7, "7sus4")] },
  { offset: 9, roman: "vi", name: "Submediant", chords: [chord(9, "m"), chord(9, "m7")] },
  { offset: 11, name: "Leading Tone", chords: [], hint: "not-applicable" },
];

const MAJOR_BLUES_ROWS: readonly ReferenceRow[] = [
  { offset: 0, roman: "I7", name: "Tonic", chords: [chord(0, "7")] },
  { offset: 2, roman: "ii", name: "Supertonic", chords: [chord(2, "7"), chord(2, "m7")] },
  { offset: 3, roman: "bIII", name: "Minor Mediant", blueNote: true, chords: [chord(3, "°7"), chord(0, "7#9")] },
  { offset: 4, roman: "iii", name: "Major Mediant", chords: [chord(0, ""), chord(0, "7")] },
  { offset: 5, roman: "IV7", name: "Subdominant", chords: [chord(5, "7")] },
  { offset: 7, roman: "V7", name: "Dominant", chords: [chord(7, "7")] },
  { offset: 9, roman: "vi", name: "Submediant", chords: [chord(9, "7"), chord(9, "m7")] },
  { offset: 10, roman: "bVII", name: "Subtonic", chords: [chord(10, "7")] },
];

const MINOR_BLUES_ROWS: readonly ReferenceRow[] = [
  { offset: 0, roman: "i7", name: "Tonic", chords: [chord(0, "m7"), chord(0, "7")] },
  { offset: 2, roman: "ii°", name: "Supertonic", chords: [chord(2, "m7b5")] },
  { offset: 3, roman: "bIII", name: "Minor Mediant", chords: [chord(3, ""), chord(3, "maj7")] },
  { offset: 5, roman: "iv7", name: "Subdominant", chords: [chord(5, "m7"), chord(5, "7")] },
  { offset: 6, roman: "bV", name: "Dim. Dominant", blueNote: true, chords: [chord(6, "7"), chord(6, "°7")] },
  { offset: 7, roman: "v7 / V7", name: "Dominant", chords: [chord(7, "m7"), chord(7, "7"), chord(7, "7b9")] },
  { offset: 8, roman: "bVI7", name: "Submediant", chords: [chord(8, "7"), chord(8, "maj7")], hint: "turnaround" },
  { offset: 10, roman: "bVII", name: "Subtonic", chords: [chord(10, "7")] },
];

// Keyed by the mode's resolved interval pattern rather than family/mode id:
// ids repeat across families (`blues-minor` exists in both Major Pentatonic
// and Blue), and a rotation of one family that IS another scale (Major
// Pentatonic's 5th rotation is Minor Pentatonic) should get its table too.
const REFERENCE_BY_PATTERN: Record<string, readonly ReferenceRow[]> = {
  "0,2,4,7,9": MAJOR_PENTATONIC_ROWS,
  "0,3,5,7,10": MINOR_PENTATONIC_ROWS,
  "0,2,5,7,10": EGYPTIAN_ROWS,
  "0,3,5,8,10": MAN_GONG_ROWS,
  "0,2,5,7,9": RITUSEN_ROWS,
  "0,2,3,4,7,9": MAJOR_BLUES_ROWS,
  "0,3,5,6,7,10": MINOR_BLUES_ROWS,
};

// `intervals`: the mode's semitone offsets from its root, ascending (e.g.
// getScaleNotes(0, family, modeId)) - not computed here, so scales.ts stays
// the only place doing interval arithmetic.
export function getScaleReference(intervals: readonly number[]): readonly ReferenceRow[] | undefined {
  return REFERENCE_BY_PATTERN[intervals.join(",")];
}

export type ReferenceSlot = {
  offset: number;
  degreeLabel: string;
  noteName: NoteName; // the note this slot would be, whether or not the scale has it
  intervalName: string;
  roman?: string; // undefined when the reference has none for this slot
  name: string;
  blueNote: boolean;
  skipped: boolean;
  chords: string[]; // concrete names for `root`, e.g. "F#m7", "D/F#"
  hint?: ReferenceHint;
};

// One slot per reference row, transposed to `root`. `skipped` means the
// scale has no note at that slot's offset.
export function getReferenceSlots(
  root: NoteName,
  intervals: readonly number[],
): ReferenceSlot[] | undefined {
  const rows = getScaleReference(intervals);
  if (!rows) return undefined;
  const rootIdx = CHROMATIC.indexOf(root);
  const noteAt = (offset: number): NoteName => CHROMATIC[(rootIdx + offset) % 12];
  return rows.map((row) => ({
    offset: row.offset,
    degreeLabel: getChromaticDegreeLabel(row.offset)[0],
    noteName: noteAt(row.offset),
    intervalName: getIntervalName(row.offset),
    roman: row.roman,
    name: row.name,
    blueNote: row.blueNote === true,
    skipped: !intervals.includes(row.offset),
    chords: row.chords.map((spec) => {
      const name = getConcreteChordName(noteAt(spec.rootOffset), spec.suffix);
      return spec.bassOffset === undefined ? name : `${name}/${noteAt(spec.bassOffset)}`;
    }),
    hint: row.hint,
  }));
}

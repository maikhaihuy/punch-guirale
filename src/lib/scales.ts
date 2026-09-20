// Family/Mode/Variant scale schema (Milestone 4). Replaces the old
// major-scale-only MODES table in theory.ts. See
// openspec/changes/restructure-scale-family-schema/design.md for the
// schema rationale.

export type ScaleVariant = {
  id: string; // 'blue'
  displayName: string;
  insertAfterDegree: number; // 0-indexed position in the rotated interval pattern
  insertInterval: number; // semitone offset from root (e.g. 6 for b5)
};

export type ScaleMode = {
  id: string; // kebab-case, doubles as a URL route segment
  displayName: string;
  rotationIndex: number; // index into intervalPattern to rotate from; ignored when intervalPattern is set
  intervalPattern?: number[]; // full override, for a mode that isn't a rotation of its family's pattern (e.g. different degree count)
};

export type ScaleFamily = {
  id: string; // kebab-case, doubles as a URL route segment
  displayName: string;
  degreeCount: number; // length of intervalPattern
  intervalPattern: number[]; // semitone steps from root, ascending, length = degreeCount
  modes: ScaleMode[];
  variants?: ScaleVariant[];
};

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const HARMONIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 11];
const MELODIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 9, 11];
const MAJOR_PENTATONIC_INTERVALS = [0, 2, 4, 7, 9];
const MINOR_PENTATONIC_INTERVALS = [0, 3, 5, 7, 10];
const BLUE_MINOR_INTERVALS = [0, 3, 5, 6, 7, 10]; // 1 b3 4 b5 5 b7
const BLUE_MAJOR_INTERVALS = [0, 3, 5, 7, 10]; // 1 b3 4 5 b7

export const SCALE_FAMILIES: ScaleFamily[] = [
  {
    id: "major",
    displayName: "Major",
    degreeCount: 7,
    intervalPattern: MAJOR_INTERVALS,
    modes: [
      { id: "ionian", displayName: "Ionian", rotationIndex: 0 },
      { id: "dorian", displayName: "Dorian", rotationIndex: 1 },
      { id: "phrygian", displayName: "Phrygian", rotationIndex: 2 },
      { id: "lydian", displayName: "Lydian", rotationIndex: 3 },
      { id: "mixolydian", displayName: "Mixolydian", rotationIndex: 4 },
      { id: "aeolian", displayName: "Aeolian", rotationIndex: 5 },
      { id: "locrian", displayName: "Locrian", rotationIndex: 6 },
    ],
  },
  {
    id: "harmonic-minor",
    displayName: "Harmonic Minor",
    degreeCount: 7,
    intervalPattern: HARMONIC_MINOR_INTERVALS,
    modes: [
      { id: "harmonic-minor", displayName: "Harmonic Minor", rotationIndex: 0 },
      { id: "locrian-natural-6", displayName: "Locrian ♮6", rotationIndex: 1 },
      { id: "ionian-augmented", displayName: "Ionian Augmented", rotationIndex: 2 },
      { id: "dorian-sharp-4", displayName: "Dorian ♯4", rotationIndex: 3 },
      { id: "phrygian-dominant", displayName: "Phrygian Dominant", rotationIndex: 4 },
      { id: "lydian-sharp-2", displayName: "Lydian ♯2", rotationIndex: 5 },
      { id: "super-locrian-bb7", displayName: "Super Locrian ♭♭7", rotationIndex: 6 },
    ],
  },
  {
    id: "melodic-minor",
    displayName: "Melodic Minor",
    degreeCount: 7,
    intervalPattern: MELODIC_MINOR_INTERVALS,
    modes: [
      { id: "melodic-minor", displayName: "Melodic Minor", rotationIndex: 0 },
      { id: "dorian-b2", displayName: "Dorian ♭2", rotationIndex: 1 },
      { id: "lydian-augmented", displayName: "Lydian Augmented", rotationIndex: 2 },
      { id: "lydian-dominant", displayName: "Lydian Dominant", rotationIndex: 3 },
      { id: "mixolydian-b6", displayName: "Mixolydian ♭6", rotationIndex: 4 },
      { id: "locrian-natural-2", displayName: "Locrian ♮2", rotationIndex: 5 },
      { id: "super-locrian", displayName: "Super Locrian", rotationIndex: 6 },
    ],
  },
  {
    id: "major-pentatonic",
    displayName: "Major Pentatonic",
    degreeCount: 5,
    intervalPattern: MAJOR_PENTATONIC_INTERVALS,
    modes: [
      { id: "major-pentatonic", displayName: "Major Pentatonic", rotationIndex: 0 },
      { id: "egyptian", displayName: "Egyptian", rotationIndex: 1 },
      { id: "blues-minor", displayName: "Blues Minor", rotationIndex: 2 },
      { id: "blues-major", displayName: "Blues Major", rotationIndex: 3 },
      { id: "minor-pentatonic-mode", displayName: "Minor Pentatonic (mode 5)", rotationIndex: 4 },
    ],
  },
  {
    id: "minor-pentatonic",
    displayName: "Minor Pentatonic",
    degreeCount: 5,
    intervalPattern: MINOR_PENTATONIC_INTERVALS,
    modes: [
      { id: "minor-pentatonic", displayName: "Minor Pentatonic", rotationIndex: 0 },
      { id: "major-pentatonic-mode", displayName: "Major Pentatonic (mode 2)", rotationIndex: 1 },
      { id: "suspended-pentatonic", displayName: "Suspended", rotationIndex: 2 },
      { id: "man-gong", displayName: "Man Gong", rotationIndex: 3 },
      { id: "ritusen", displayName: "Ritusen", rotationIndex: 4 },
    ],
  },
  {
    id: "blue",
    displayName: "Blue",
    degreeCount: 6,
    intervalPattern: BLUE_MINOR_INTERVALS,
    modes: [
      { id: "blues-minor", displayName: "Blues Minor", rotationIndex: 0 },
      {
        id: "blues-major",
        displayName: "Blues Major",
        rotationIndex: 0,
        intervalPattern: BLUE_MAJOR_INTERVALS,
      },
    ],
  },
];

export const DEFAULT_FAMILY_ID = "major";
export const DEFAULT_MODE_ID = "ionian";

export function getFamily(familyId: string): ScaleFamily | undefined {
  return SCALE_FAMILIES.find((f) => f.id === familyId);
}

export function getMode(family: ScaleFamily, modeId: string): ScaleMode | undefined {
  return family.modes.find((m) => m.id === modeId);
}

export function getVariant(family: ScaleFamily, variantId: string): ScaleVariant | undefined {
  return family.variants?.find((v) => v.id === variantId);
}

// Rotates an interval pattern so the entry at rotationIndex becomes the new
// 0 (root), normalizing every other entry to its semitone distance from
// that new root, wrapped into 0-11.
function rotateIntervals(pattern: number[], rotationIndex: number): number[] {
  const n = pattern.length;
  const pivot = pattern[rotationIndex];
  return Array.from({ length: n }, (_, i) => {
    const iv = pattern[(rotationIndex + i) % n] - pivot;
    return iv < 0 ? iv + 12 : iv;
  });
}

/**
 * The single source of truth for scale note computation. No other module
 * performs interval arithmetic - callers consume this function's output.
 */
export function getScaleNotes(
  rootMidi: number,
  family: ScaleFamily,
  modeId: string,
  variantId?: string,
): number[] {
  const mode = getMode(family, modeId);
  if (!mode) throw new Error(`Unknown mode "${modeId}" for family "${family.id}"`);

  const pattern = mode.intervalPattern ?? rotateIntervals(family.intervalPattern, mode.rotationIndex);
  const notes = pattern.map((iv) => rootMidi + iv);
  if (!variantId) return notes;

  const variant = getVariant(family, variantId);
  if (!variant) return notes;

  const result = [...notes];
  result.splice(variant.insertAfterDegree + 1, 0, rootMidi + variant.insertInterval);
  return result;
}

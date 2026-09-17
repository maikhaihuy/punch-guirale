// Fixed, semitone-indexed interval quality names, same convention as
// theory.ts's DEGREE_LABELS_BY_SEMITONE - applies uniformly to any
// family's degrees without a per-mode lookup.
const INTERVAL_NAMES_BY_SEMITONE = [
  "Unison",
  "Minor second",
  "Major second",
  "Minor third",
  "Major third",
  "Perfect fourth",
  "Diminished fifth",
  "Perfect fifth",
  "Minor sixth",
  "Major sixth",
  "Minor seventh",
  "Major seventh",
] as const;

export function getIntervalName(semitoneOffset: number): string {
  return INTERVAL_NAMES_BY_SEMITONE[((semitoneOffset % 12) + 12) % 12];
}

// Fixed, position-indexed scale-degree function names for degrees 1-6
// (index 0-5). Degree 7 (index 6) is deliberately excluded here - unlike
// every other degree, its name depends on its own interval from the root,
// not just its position (see getDegreeFunctionName below).
const DEGREE_FUNCTION_NAMES = [
  "Tonic",
  "Supertonic",
  "Mediant",
  "Subdominant",
  "Dominant",
  "Submediant",
] as const;

// Degree 7 is "Leading Tone" when it's a major 7th above the root (11
// semitones - a half step below the octave, with the pull that name
// implies), and "Subtonic" for any other interval (a minor 7th, 10
// semitones, in modes like Dorian/Mixolydian/Aeolian, has no such pull).
// Every other degree's name depends only on its position.
export function getDegreeFunctionName(degreeIndex: number, semitoneOffsetFromRoot: number): string {
  if (degreeIndex === 6) return semitoneOffsetFromRoot === 11 ? "Leading Tone" : "Subtonic";
  return DEGREE_FUNCTION_NAMES[degreeIndex];
}

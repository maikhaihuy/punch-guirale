import type { NoteName, TriadQuality } from "./theory";

// Static reference vocabulary of common chord suffixes per diatonic triad
// quality - not derived from any specific mode's own interval pattern (a
// major-quality degree in Ionian vs. Mixolydian would imply different real
// 7th chords, but this table intentionally stays quality-only; see
// design.md "Non-Goals"). The bare-major entry is "" (empty string),
// matching standard chord-chart notation where a root note alone denotes
// a major triad.
export const CHORD_SUFFIXES: Record<TriadQuality, string[]> = {
  major: ["", "6", "maj7", "add9"],
  minor: ["m", "m6", "m7", "m9"],
  diminished: ["dim", "m7b5"],
  augmented: ["aug", "maj7#5"],
};

export function getChordSuffixesForQuality(quality: TriadQuality): string[] {
  return CHORD_SUFFIXES[quality];
}

// Display label for a suffix shown without an attached root note (e.g. the
// Degrees row's quality-only summary) - "" reads as blank there, so it's
// shown as "maj" instead; every other suffix already reads fine alone.
export function getChordLabel(suffix: string): string {
  return suffix === "" ? "maj" : suffix;
}

export function getConcreteChordName(noteName: NoteName, suffix: string): string {
  return `${noteName}${suffix}`;
}

// Chords conventionally played over the Minor Pentatonic family's own base
// mode, one per scale degree position (0-4) - not derived from triad-
// quality math like CHORD_SUFFIXES (that requires stacking thirds across 7
// degrees, which a 5-degree scale can't do), and not built only from this
// scale's own 5 notes either (e.g. the position-2/3 minor-7th chords use a
// 3rd outside the pentatonic collection, borrowed from its relative
// natural-minor harmony). Confirmed against two roots (C: Cm/Eb/Fm7/Gm7/
// Bb5, D: Dm/F/Gm7/Am7/C5), which map to this same per-position sequence
// once the root is factored out - genuinely positional, not root-specific.
// Only verified for this family's own base mode, not its other rotations
// (Egyptian, Blues Minor/Major, Suspended, Man Gong, Ritusen).
export const MINOR_PENTATONIC_CHORD_SUFFIXES = ["m", "", "m7", "m7", "5"] as const;

// Chords conventionally played over the Major Pentatonic family's own base
// mode, one per scale degree position (0-4) - same "fixed, positional, not
// derivable from scale-tone membership" reasoning as
// MINOR_PENTATONIC_CHORD_SUFFIXES above. Confirmed against root D: D, E,
// F#, A, B -> D, Em7, F#m7, Asus4, Bm. Only verified for this family's own
// base mode, not its other rotations.
export const MAJOR_PENTATONIC_CHORD_SUFFIXES = ["", "m7", "m7", "sus4", "m"] as const;

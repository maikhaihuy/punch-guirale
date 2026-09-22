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

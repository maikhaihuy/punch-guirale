import { describe, expect, it } from "vitest";

import { getFamily, getScaleNotes } from "./scales";

const ROOT_MIDI = 60; // C4, arbitrary anchor - only offsets from it matter

function offsetsFrom(rootMidi: number, notes: number[]): number[] {
  return notes.map((n) => n - rootMidi);
}

describe("getScaleNotes", () => {
  const major = getFamily("major")!;

  it("computes Ionian as the unrotated major interval pattern", () => {
    const notes = getScaleNotes(ROOT_MIDI, major, "ionian");
    expect(offsetsFrom(ROOT_MIDI, notes)).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it("computes all 7 Major modes as rotations of the same interval pattern", () => {
    const expected: Record<string, number[]> = {
      ionian: [0, 2, 4, 5, 7, 9, 11],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      phrygian: [0, 1, 3, 5, 7, 8, 10],
      lydian: [0, 2, 4, 6, 7, 9, 11],
      mixolydian: [0, 2, 4, 5, 7, 9, 10],
      aeolian: [0, 2, 3, 5, 7, 8, 10],
      locrian: [0, 1, 3, 5, 6, 8, 10],
    };
    for (const [modeId, intervals] of Object.entries(expected)) {
      const notes = getScaleNotes(ROOT_MIDI, major, modeId);
      expect(offsetsFrom(ROOT_MIDI, notes), modeId).toEqual(intervals);
    }
  });

  it("computes Harmonic Minor modes as rotations of the harmonic minor interval pattern", () => {
    const harmonicMinor = getFamily("harmonic-minor")!;
    const notes = getScaleNotes(ROOT_MIDI, harmonicMinor, "harmonic-minor");
    expect(offsetsFrom(ROOT_MIDI, notes)).toEqual([0, 2, 3, 5, 7, 8, 11]);

    // Phrygian Dominant is the 5th rotation of harmonic minor - the
    // canonical "Middle Eastern" sounding mode.
    const phrygianDominant = getScaleNotes(ROOT_MIDI, harmonicMinor, "phrygian-dominant");
    expect(offsetsFrom(ROOT_MIDI, phrygianDominant)).toEqual([0, 1, 4, 5, 7, 8, 10]);
  });

  it("computes Major Pentatonic and Minor Pentatonic base modes", () => {
    const majorPentatonic = getFamily("major-pentatonic")!;
    expect(
      offsetsFrom(ROOT_MIDI, getScaleNotes(ROOT_MIDI, majorPentatonic, "major-pentatonic")),
    ).toEqual([0, 2, 4, 7, 9]);

    const minorPentatonic = getFamily("minor-pentatonic")!;
    expect(
      offsetsFrom(ROOT_MIDI, getScaleNotes(ROOT_MIDI, minorPentatonic, "minor-pentatonic")),
    ).toEqual([0, 3, 5, 7, 10]);
  });

  it("computes all 5 rotations for a pentatonic family", () => {
    const majorPentatonic = getFamily("major-pentatonic")!;
    const expected: Record<string, number[]> = {
      "major-pentatonic": [0, 2, 4, 7, 9],
      egyptian: [0, 2, 5, 7, 10],
      "blues-minor": [0, 3, 5, 8, 10],
      "blues-major": [0, 2, 5, 7, 9],
      "minor-pentatonic-mode": [0, 3, 5, 7, 10],
    };
    for (const [modeId, intervals] of Object.entries(expected)) {
      const notes = getScaleNotes(ROOT_MIDI, majorPentatonic, modeId);
      expect(offsetsFrom(ROOT_MIDI, notes), modeId).toEqual(intervals);
    }
  });

  it("inserts the blue (b5) variant at the correct position for Minor Pentatonic", () => {
    const minorPentatonic = getFamily("minor-pentatonic")!;
    const notes = getScaleNotes(ROOT_MIDI, minorPentatonic, "minor-pentatonic", "blue");
    expect(offsetsFrom(ROOT_MIDI, notes)).toEqual([0, 3, 5, 6, 7, 10]);
  });

  it("leaves the base scale unaffected when no variant is given", () => {
    const minorPentatonic = getFamily("minor-pentatonic")!;
    const withoutVariant = getScaleNotes(ROOT_MIDI, minorPentatonic, "minor-pentatonic");
    expect(offsetsFrom(ROOT_MIDI, withoutVariant)).toEqual([0, 3, 5, 7, 10]);
  });

  it("ignores an unrecognized variant id for the family", () => {
    const minorPentatonic = getFamily("minor-pentatonic")!;
    const notes = getScaleNotes(ROOT_MIDI, minorPentatonic, "minor-pentatonic", "not-a-real-variant");
    expect(offsetsFrom(ROOT_MIDI, notes)).toEqual([0, 3, 5, 7, 10]);
  });

  it("throws for an unknown mode id", () => {
    expect(() => getScaleNotes(ROOT_MIDI, major, "not-a-mode")).toThrow();
  });
});

import { describe, expect, it } from "vitest";

import { buildPlaybackSequence } from "./scalePlayback";
import { getFamily, SCALE_FAMILIES } from "./scales";

function names(root: Parameters<typeof buildPlaybackSequence>[0], familyId: string, modeId: string) {
  return buildPlaybackSequence(root, getFamily(familyId)!, modeId).map((s) => s.noteName);
}

describe("buildPlaybackSequence", () => {
  it("plays C Ionian up to the octave and back down, 15 notes", () => {
    expect(names("C", "major", "ionian")).toEqual([
      "C", "D", "E", "F", "G", "A", "B", "C", "B", "A", "G", "F", "E", "D", "C",
    ]);
  });

  it("plays A Minor Pentatonic with its own five notes", () => {
    expect(names("A", "minor-pentatonic", "minor-pentatonic")).toEqual([
      "A", "C", "D", "E", "G", "A", "G", "E", "D", "C", "A",
    ]);
  });

  it("sounds the octave root exactly once, at the turn", () => {
    const family = getFamily("major")!;
    const seq = buildPlaybackSequence("C", family, "ionian");
    const rootMidi = seq[0].midi;
    expect(seq.filter((s) => s.midi === rootMidi + 12)).toHaveLength(1);
    expect(seq.filter((s) => s.midi === rootMidi)).toHaveLength(2);
  });

  it("carries a frequency for every step", () => {
    const seq = buildPlaybackSequence("A", getFamily("major")!, "ionian");
    expect(seq[0].freq).toBeCloseTo(220, 5); // A3
  });

  it("rises strictly then falls strictly for every family, mode, and root", () => {
    for (const family of SCALE_FAMILIES) {
      for (const mode of family.modes) {
        for (const root of ["C", "F#", "B"] as const) {
          const seq = buildPlaybackSequence(root, family, mode.id);
          const peak = family.degreeCount; // ascending notes, then the octave root
          const midis = seq.map((s) => s.midi);
          const label = `${family.id}/${mode.id}/${root}`;
          expect(midis.length, label).toBe(family.degreeCount * 2 + 1);
          for (let i = 1; i <= peak; i++) expect(midis[i], label).toBeGreaterThan(midis[i - 1]);
          for (let i = peak + 1; i < midis.length; i++) expect(midis[i], label).toBeLessThan(midis[i - 1]);
          expect(midis[0], label).toBe(midis[midis.length - 1]);
          expect(Math.max(...midis), label).toBeLessThanOrEqual(71);
        }
      }
    }
  });
});

import { describe, expect, it } from "vitest";

import { getFamily, getScaleNotes } from "./scales";
import { getReferenceSlots, getScaleReference } from "./scaleReference";
import type { NoteName } from "./theory";

function intervalsOf(familyId: string, modeId: string): number[] {
  return getScaleNotes(0, getFamily(familyId)!, modeId);
}

function slots(familyId: string, modeId: string, root: NoteName) {
  return getReferenceSlots(root, intervalsOf(familyId, modeId))!;
}

// Chords per slot offset, at the reference sheet's own root (C for Major
// Pentatonic / Major Blues, A for Minor Pentatonic / Minor Blues), using the
// app's sharp-only spelling (the sheet's Eb reads D#).
function chordsByOffset(familyId: string, modeId: string, root: NoteName) {
  return Object.fromEntries(slots(familyId, modeId, root).map((s) => [s.offset, s.chords]));
}

describe("getScaleReference (matching by interval pattern)", () => {
  it("resolves all four reference scales from their base modes", () => {
    expect(getScaleReference(intervalsOf("major-pentatonic", "major-pentatonic"))).toBeDefined();
    expect(getScaleReference(intervalsOf("minor-pentatonic", "minor-pentatonic"))).toBeDefined();
    expect(getScaleReference(intervalsOf("blue", "blues-major"))).toBeDefined();
    expect(getScaleReference(intervalsOf("blue", "blues-minor"))).toBeDefined();
  });

  it("gives a rotation that is Minor Pentatonic the Minor Pentatonic table", () => {
    const viaMajorFamily = getScaleReference(intervalsOf("major-pentatonic", "minor-pentatonic-mode"));
    const base = getScaleReference(intervalsOf("minor-pentatonic", "minor-pentatonic"));
    expect(viaMajorFamily).toBeDefined();
    expect(viaMajorFamily).toBe(base);
  });

  it("gives every mode of both pentatonic families reference data, shared across families", () => {
    const table = (familyId: string, modeId: string) => getScaleReference(intervalsOf(familyId, modeId));
    for (const family of ["major-pentatonic", "minor-pentatonic"]) {
      for (const mode of getFamily(family)!.modes) {
        expect(table(family, mode.id), `${family}/${mode.id}`).toBeDefined();
      }
    }
    // Same pattern under different ids/families -> the very same table.
    expect(table("major-pentatonic", "egyptian")).toBe(table("minor-pentatonic", "suspended-pentatonic"));
    expect(table("major-pentatonic", "blues-minor")).toBe(table("minor-pentatonic", "man-gong"));
    expect(table("major-pentatonic", "blues-major")).toBe(table("minor-pentatonic", "ritusen"));
    expect(table("major-pentatonic", "major-pentatonic")).toBe(table("minor-pentatonic", "major-pentatonic-mode"));
  });

  it("returns nothing for patterns without reference data", () => {
    expect(getScaleReference(intervalsOf("major", "ionian"))).toBeUndefined();
    expect(getScaleReference(intervalsOf("harmonic-minor", "harmonic-minor"))).toBeUndefined();
    expect(getScaleReference([0, 1, 5, 7, 8])).toBeUndefined();
  });
});

describe("reference slots", () => {
  it("lists 7 slots for every pentatonic scale and 8 for blues", () => {
    expect(slots("major-pentatonic", "major-pentatonic", "C")).toHaveLength(7);
    expect(slots("minor-pentatonic", "minor-pentatonic", "A")).toHaveLength(7);
    expect(slots("major-pentatonic", "egyptian", "D")).toHaveLength(7);
    expect(slots("major-pentatonic", "blues-minor", "E")).toHaveLength(7);
    expect(slots("major-pentatonic", "blues-major", "G")).toHaveLength(7);
    expect(slots("blue", "blues-major", "C")).toHaveLength(8);
    expect(slots("blue", "blues-minor", "A")).toHaveLength(8);
  });

  it("puts Egyptian, Man Gong, and Ritusen's skipped slots at the major scale's own degree, with no roman or chords", () => {
    const skipped = (family: string, mode: string) =>
      slots(family, mode, "C")
        .filter((s) => s.skipped)
        .map((s) => [s.offset, s.name, s.roman, s.chords.length, s.hint]);
    expect(skipped("major-pentatonic", "egyptian")).toEqual([
      [4, "Mediant", undefined, 0, "not-applicable"],
      [9, "Submediant", undefined, 0, "not-applicable"],
    ]);
    expect(skipped("major-pentatonic", "blues-minor")).toEqual([
      [2, "Supertonic", undefined, 0, "not-applicable"],
      [7, "Dominant", undefined, 0, "not-applicable"],
    ]);
    expect(skipped("major-pentatonic", "blues-major")).toEqual([
      [4, "Mediant", undefined, 0, "not-applicable"],
      [11, "Leading Tone", undefined, 0, "not-applicable"],
    ]);
  });

  it("derives skipped slots from scale membership", () => {
    const skippedOffsets = (familyId: string, modeId: string) =>
      slots(familyId, modeId, "C")
        .filter((s) => s.skipped)
        .map((s) => s.offset);
    expect(skippedOffsets("major-pentatonic", "major-pentatonic")).toEqual([5, 11]);
    expect(skippedOffsets("minor-pentatonic", "minor-pentatonic")).toEqual([2, 8]);
    expect(skippedOffsets("blue", "blues-major")).toEqual([5, 10]);
    expect(skippedOffsets("blue", "blues-minor")).toEqual([2, 8]);
  });

  it("has exactly as many in-scale slots as the scale has notes", () => {
    for (const [familyId, modeId] of [
      ["major-pentatonic", "major-pentatonic"],
      ["minor-pentatonic", "minor-pentatonic"],
      ["blue", "blues-major"],
      ["blue", "blues-minor"],
      ["major-pentatonic", "egyptian"],
      ["major-pentatonic", "blues-minor"],
      ["major-pentatonic", "blues-major"],
    ]) {
      const inScale = slots(familyId, modeId, "C").filter((s) => !s.skipped);
      expect(inScale.map((s) => s.offset), `${familyId}/${modeId}`).toEqual(intervalsOf(familyId, modeId));
    }
  });

  it("flags only the two blue-note slots", () => {
    const blueNotes = (familyId: string, modeId: string) =>
      slots(familyId, modeId, "C")
        .filter((s) => s.blueNote)
        .map((s) => s.offset);
    expect(blueNotes("blue", "blues-major")).toEqual([3]);
    expect(blueNotes("blue", "blues-minor")).toEqual([6]);
    expect(blueNotes("major-pentatonic", "major-pentatonic")).toEqual([]);
    expect(blueNotes("minor-pentatonic", "minor-pentatonic")).toEqual([]);
  });

  it("puts hints only where the reference does", () => {
    const hints = (familyId: string, modeId: string) =>
      Object.fromEntries(
        slots(familyId, modeId, "C")
          .filter((s) => s.hint)
          .map((s) => [s.offset, s.hint]),
      );
    expect(hints("major-pentatonic", "major-pentatonic")).toEqual({
      5: "avoid-note",
      11: "rarely-used",
    });
    expect(hints("minor-pentatonic", "minor-pentatonic")).toEqual({ 2: "rarely-used" });
    expect(hints("blue", "blues-minor")).toEqual({ 8: "turnaround" });
    expect(hints("blue", "blues-major")).toEqual({});
  });

  it("gives a slot with no chords a rarely-used or not-applicable hint, and vice versa", () => {
    for (const [familyId, modeId] of [
      ["major-pentatonic", "major-pentatonic"],
      ["minor-pentatonic", "minor-pentatonic"],
      ["major-pentatonic", "egyptian"],
      ["major-pentatonic", "blues-minor"],
      ["major-pentatonic", "blues-major"],
    ]) {
      for (const s of slots(familyId, modeId, "C")) {
        const noChordHint = s.hint === "rarely-used" || s.hint === "not-applicable";
        expect(s.chords.length === 0, `${familyId}/${modeId} offset ${s.offset}`).toBe(noChordHint);
      }
    }
  });
});

describe("reference chords at the sheet's own root", () => {
  it("Major Pentatonic at C", () => {
    expect(chordsByOffset("major-pentatonic", "major-pentatonic", "C")).toEqual({
      0: ["C", "Cmaj7", "C6", "Cadd9"],
      2: ["Dm", "Dm7", "D7sus4"],
      4: ["Em", "Em7", "C/E"],
      5: ["F", "Fmaj7"],
      7: ["G", "G7", "Gsus4"],
      9: ["Am", "Am7", "Am11"],
      11: [],
    });
  });

  it("Minor Pentatonic at A", () => {
    expect(chordsByOffset("minor-pentatonic", "minor-pentatonic", "A")).toEqual({
      0: ["Am", "Am7", "Am11"],
      2: [],
      3: ["C", "Cmaj7", "C6"],
      5: ["Dm", "Dm7", "Dsus4"],
      7: ["Em", "Em7", "E7"],
      8: ["F", "Fmaj7"],
      10: ["G", "G7", "Gsus4"],
    });
  });

  it("Major Blues at C", () => {
    expect(chordsByOffset("blue", "blues-major", "C")).toEqual({
      0: ["C7"],
      2: ["D7", "Dm7"],
      3: ["D#°7", "C7#9"],
      4: ["C", "C7"],
      5: ["F7"],
      7: ["G7"],
      9: ["A7", "Am7"],
      10: ["A#7"],
    });
  });

  it("Minor Blues at A", () => {
    expect(chordsByOffset("blue", "blues-minor", "A")).toEqual({
      0: ["Am7", "A7"],
      2: ["Bm7b5"],
      3: ["C", "Cmaj7"],
      5: ["Dm7", "D7"],
      6: ["D#7", "D#°7"],
      7: ["Em7", "E7", "E7b9"],
      8: ["F7", "Fmaj7"],
      10: ["G7"],
    });
  });
});

describe("the other pentatonic rotations at the sheet's own root", () => {
  // Egyptian at D, Man Gong at E, Ritusen at G; the same tables must come
  // out whichever pentatonic family lists the mode.
  const cases: [string, string, string, NoteName][] = [
    ["major-pentatonic", "egyptian", "suspended-pentatonic", "D"],
    ["major-pentatonic", "blues-minor", "man-gong", "E"],
    ["major-pentatonic", "blues-major", "ritusen", "G"],
  ];

  it("Egyptian at D", () => {
    expect(chordsByOffset("major-pentatonic", "egyptian", "D")).toEqual({
      0: ["Dsus4", "Dm7(no3)", "D7sus4"],
      2: ["Em", "Em7"],
      4: [],
      5: ["G", "G7", "Gsus4"],
      7: ["Am", "Am7", "A7"],
      9: [],
      10: ["C", "Cmaj7"],
    });
  });

  it("Man Gong at E", () => {
    expect(chordsByOffset("major-pentatonic", "blues-minor", "E")).toEqual({
      0: ["Em7(no5)", "Esus4(b9)"],
      2: [],
      3: ["G", "G7"],
      5: ["Am", "Am7"],
      7: [],
      8: ["C", "Cmaj7"],
      10: ["Dm", "Dm7"],
    });
  });

  it("Ritusen at G", () => {
    expect(chordsByOffset("major-pentatonic", "blues-major", "G")).toEqual({
      0: ["G", "Gsus4", "G6"],
      2: ["Am", "Am7"],
      4: [],
      5: ["C", "Cmaj7", "C6"],
      7: ["Dm", "Dm7", "D7sus4"],
      9: ["Em", "Em7"],
      11: [],
    });
  });

  it("carries the sheet's roman numerals, degree names, and formula labels", () => {
    const summary = (familyId: string, modeId: string, root: NoteName) =>
      slots(familyId, modeId, root).map((s) => [s.degreeLabel, s.noteName, s.roman, s.name]);
    // Skipped slots (formula labels are the major scale's own degree) have no roman.
    expect(summary("major-pentatonic", "egyptian", "D")).toEqual([
      ["1", "D", "i", "Tonic"],
      ["2", "E", "ii", "Supertonic"],
      ["3", "F#", undefined, "Mediant"],
      ["4", "G", "IV", "Subdominant"],
      ["5", "A", "v", "Dominant"],
      ["6", "B", undefined, "Submediant"],
      ["b7", "C", "bVII", "Subtonic"],
    ]);
    expect(summary("major-pentatonic", "blues-minor", "E")).toEqual([
      ["1", "E", "i", "Tonic"],
      ["2", "F#", undefined, "Supertonic"],
      ["b3", "G", "bIII", "Minor Mediant"],
      ["4", "A", "iv", "Subdominant"],
      ["5", "B", undefined, "Dominant"],
      ["b6", "C", "bVI", "Submediant"],
      ["b7", "D", "bVII", "Subtonic"],
    ]);
    expect(summary("major-pentatonic", "blues-major", "G")).toEqual([
      ["1", "G", "I", "Tonic"],
      ["2", "A", "ii", "Supertonic"],
      ["3", "B", undefined, "Mediant"],
      ["4", "C", "IV", "Subdominant"],
      ["5", "D", "V", "Dominant"],
      ["6", "E", "vi", "Submediant"],
      ["7", "F#", undefined, "Leading Tone"],
    ]);
  });

  it("gives the same data from either family", () => {
    for (const [familyA, modeA, modeB, root] of cases) {
      expect(slots(familyA, modeA, root)).toEqual(slots("minor-pentatonic", modeB, root));
    }
  });

  it("hints only on skipped slots, and has no blue notes", () => {
    for (const [family, mode] of [
      ["major-pentatonic", "egyptian"],
      ["major-pentatonic", "blues-minor"],
      ["major-pentatonic", "blues-major"],
    ]) {
      for (const s of slots(family, mode, "C")) {
        expect(s.hint, `${mode} offset ${s.offset}`).toBe(s.skipped ? "not-applicable" : undefined);
        expect(s.blueNote).toBe(false);
      }
    }
  });
});

describe("reference slot fields at the sheet's own root", () => {
  it("carries roman numeral, degree name, note, and degree label per slot", () => {
    const summary = slots("minor-pentatonic", "minor-pentatonic", "A").map((s) => [
      s.degreeLabel,
      s.noteName,
      s.roman,
      s.name,
      s.skipped,
    ]);
    expect(summary).toEqual([
      ["1", "A", "i", "Tonic", false],
      ["2", "B", "ii°", "Supertonic", true],
      ["b3", "C", "bIII", "Minor Mediant", false],
      ["4", "D", "iv", "Subdominant", false],
      ["5", "E", "v / V", "Dominant", false],
      ["b6", "F", "bVI", "Submediant", true],
      ["b7", "G", "bVII", "Subtonic", false],
    ]);
  });

  it("names the interval for each slot, skipped or not", () => {
    const intervals = slots("major-pentatonic", "major-pentatonic", "C").map((s) => s.intervalName);
    expect(intervals).toEqual([
      "Unison",
      "Major second",
      "Major third",
      "Perfect fourth",
      "Perfect fifth",
      "Major sixth",
      "Major seventh",
    ]);
  });
});

describe("transposition", () => {
  it("moves every chord root and bass with the key root", () => {
    const atD = chordsByOffset("major-pentatonic", "major-pentatonic", "D");
    expect(atD[4]).toEqual(["F#m", "F#m7", "D/F#"]);
    expect(atD[2]).toEqual(["Em", "Em7", "E7sus4"]);
  });

  it("keeps a chord built on the key root under an off-root row", () => {
    const atG = chordsByOffset("blue", "blues-major", "G");
    // bIII slot is A#: its diminished 7th is on A#, its 7#9 is on the key root G.
    expect(atG[3]).toEqual(["A#°7", "G7#9"]);
  });
});

describe("Harmonic Major and Melodic Major references", () => {
  it("resolves each from its first mode, and Melodic Major from Melodic Minor's mixolydian-b6 too", () => {
    const harmonicMajor = getScaleReference(intervalsOf("harmonic-major", "harmonic-major"));
    const melodicMajor = getScaleReference(intervalsOf("melodic-major", "melodic-major"));
    expect(harmonicMajor).toBeDefined();
    expect(melodicMajor).toBeDefined();
    expect(harmonicMajor).not.toBe(melodicMajor);
    expect(getScaleReference(intervalsOf("melodic-minor", "mixolydian-b6"))).toBe(melodicMajor);
  });

  it("leaves the other modes of both families without a reference", () => {
    expect(getScaleReference(intervalsOf("harmonic-major", "dorian-b5"))).toBeUndefined();
    expect(getScaleReference(intervalsOf("melodic-major", "locrian-natural-2"))).toBeUndefined();
    expect(getScaleReference(intervalsOf("harmonic-minor", "harmonic-minor"))).toBeUndefined();
  });

  it("lists 7 in-scale rows with no blue notes and no hints", () => {
    for (const [family, mode] of [
      ["harmonic-major", "harmonic-major"],
      ["melodic-major", "melodic-major"],
    ]) {
      const rows = slots(family, mode, "C");
      expect(rows.map((r) => r.offset), family).toEqual(
        intervalsOf(family, mode),
      );
      expect(rows.some((r) => r.skipped || r.blueNote || r.hint !== undefined), family).toBe(false);
    }
  });

  it("gives Harmonic Major's roman numerals, degree names, and chords on C", () => {
    const rows = slots("harmonic-major", "harmonic-major", "C");
    expect(rows.map((r) => [r.roman, r.name])).toEqual([
      ["I", "Tonic"],
      ["ii°", "Supertonic"],
      ["iii", "Mediant"],
      ["iv", "Subdominant"],
      ["V", "Dominant"],
      ["bVI+", "Submediant"],
      ["vii°", "Leading Tone"],
    ]);
    expect(chordsByOffset("harmonic-major", "harmonic-major", "C")).toEqual({
      0: ["C", "Cmaj7"],
      2: ["Dm7b5"],
      4: ["Em", "Em7"],
      5: ["Fm", "Fm6", "Fm(maj7)"],
      7: ["G", "G7", "G7b9"],
      8: ["G#aug", "G#maj7#5"],
      11: ["Bdim", "Bdim7"],
    });
  });

  it("gives Melodic Major's roman numerals, degree names, and chords on C", () => {
    const rows = slots("melodic-major", "melodic-major", "C");
    expect(rows.map((r) => [r.roman, r.name])).toEqual([
      ["I", "Tonic"],
      ["ii°", "Supertonic"],
      ["iii°", "Mediant"],
      ["iv", "Subdominant"],
      ["v", "Dominant"],
      ["bVI+", "Submediant"],
      ["bVII", "Subtonic"],
    ]);
    expect(chordsByOffset("melodic-major", "melodic-major", "C")).toEqual({
      0: ["C", "C7"],
      2: ["Dm7b5"],
      4: ["Edim"],
      5: ["Fm", "Fm7"],
      7: ["Gm", "Gm7"],
      8: ["G#aug"],
      10: ["A#", "A#maj7"],
    });
  });

  it("transposes Harmonic Major's chords to another root", () => {
    const chords = chordsByOffset("harmonic-major", "harmonic-major", "D");
    expect(chords[0]).toEqual(["D", "Dmaj7"]);
    expect(chords[2]).toEqual(["Em7b5"]);
  });
});

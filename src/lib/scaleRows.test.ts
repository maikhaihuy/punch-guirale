import { describe, expect, it } from "vitest";

import { getFamily, type ScaleFamily } from "./scales";
import { getScaleRows } from "./scaleRows";

describe("getScaleRows", () => {
  it("derives rows for a 7-degree family from triad quality and position", () => {
    const { rows, showDetail } = getScaleRows("C", getFamily("major")!, "ionian");
    expect(showDetail).toBe(true);
    expect(rows.map((r) => r.offset)).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(rows.map((r) => r.roman)).toEqual(["I", "ii", "iii", "IV", "V", "vi", "vii°"]);
    expect(rows.map((r) => r.name)).toEqual([
      "Tonic",
      "Supertonic",
      "Mediant",
      "Subdominant",
      "Dominant",
      "Submediant",
      "Leading Tone",
    ]);
    expect(rows[0].chords).toEqual(["C", "C6", "Cmaj7", "Cadd9"]);
    expect(rows[1].chords).toEqual(["Dm", "Dm6", "Dm7", "Dm9"]);
    expect(rows.every((r) => !r.skipped && !r.blueNote && r.hint === undefined)).toBe(true);
  });

  it("names a minor seventh degree Subtonic, not Leading Tone", () => {
    const { rows } = getScaleRows("D", getFamily("major")!, "dorian");
    expect(rows[6].name).toBe("Subtonic");
  });

  it("passes a reference pattern through, including its skipped slots", () => {
    const { rows, showDetail } = getScaleRows("A", getFamily("minor-pentatonic")!, "minor-pentatonic");
    expect(showDetail).toBe(true);
    expect(rows).toHaveLength(7);
    expect(rows.filter((r) => r.skipped).map((r) => r.noteName)).toEqual(["B", "F"]);
    expect(rows[0].chords).toEqual(["Am", "Am7", "Am11"]);
  });

  it("gives the same rows for the same pattern from either pentatonic family", () => {
    const viaMajor = getScaleRows("E", getFamily("major-pentatonic")!, "blues-minor");
    const viaMinor = getScaleRows("E", getFamily("minor-pentatonic")!, "man-gong");
    expect(viaMajor).toEqual(viaMinor);
  });

  it("falls back to Formula/Notes/Intervals only for a pattern with no reference", () => {
    const custom: ScaleFamily = {
      id: "custom",
      displayName: "Custom",
      degreeCount: 5,
      intervalPattern: [0, 1, 5, 7, 8],
      modes: [{ id: "custom", displayName: "Custom", rotationIndex: 0 }],
    };
    const { rows, showDetail } = getScaleRows("C", custom, "custom");
    expect(showDetail).toBe(false);
    expect(rows.map((r) => [r.degreeLabel, r.noteName, r.intervalName])).toEqual([
      ["1", "C", "Unison"],
      ["b2", "C#", "Minor second"],
      ["4", "F", "Perfect fourth"],
      ["5", "G", "Perfect fifth"],
      ["b6", "G#", "Minor sixth"],
    ]);
    // Detail fields are empty placeholders, never invented values.
    expect(rows.every((r) => r.roman === "" && r.name === "" && r.chords.length === 0)).toBe(true);
  });
});

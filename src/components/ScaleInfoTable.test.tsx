import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getFamily, type ScaleFamily } from "@/lib/scales";
import type { NoteName } from "@/lib/theory";

import { ScaleInfoTable } from "./ScaleInfoTable";

type Cell = { text: string; html: string };

// Renders the table and parses it back into header names + rows of cells,
// so assertions read against what a user sees rather than raw markup.
function render(familyId: string | ScaleFamily, modeId: string, root: NoteName) {
  const family = typeof familyId === "string" ? getFamily(familyId)! : familyId;
  const html = renderToStaticMarkup(<ScaleInfoTable root={root} family={family} modeId={modeId} />);
  const text = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&#x27;|&amp;/g, (m) => (m === "&amp;" ? "&" : "'"));
  const headers = [...html.matchAll(/<th[^>]*>(.*?)<\/th>/g)].map((m) => text(m[1]));
  const rows: Cell[][] = [...html.matchAll(/<tr[^>]*>(.*?)<\/tr>/g)]
    .filter((m) => m[1].includes("<td"))
    .map((m) => [...m[1].matchAll(/<td[^>]*>.*?<\/td>/g)].map((c) => ({ text: text(c[0]), html: c[0] })));
  return { headers, rows };
}

describe("ScaleInfoTable", () => {
  it("shows Roman, Degree and Chords for a 7-degree family, with Roman matching the Degrees row", () => {
    const { headers, rows } = render("major", "ionian", "C");
    expect(headers).toEqual(["Formula", "Notes", "Intervals", "Roman", "Degree", "Chords"]);
    expect(rows).toHaveLength(7);
    expect(rows.map((r) => r[3].text)).toEqual(["I", "ii", "iii", "IV", "V", "vi", "vii°"]);
    expect(rows[0].map((c) => c.text)).toEqual(["1", "C", "Unison", "I", "Tonic", "C, C6, Cmaj7, Cadd9"]);
  });

  it("keeps the reduced 3-column table for a pattern without reference data", () => {
    // Every shipped non-7-degree pattern has reference data now, so exercise
    // the fallback with a hand-built family (a Hirajoshi-like 5-note pattern).
    const custom: ScaleFamily = {
      id: "custom",
      displayName: "Custom",
      degreeCount: 5,
      intervalPattern: [0, 1, 5, 7, 8],
      modes: [{ id: "custom", displayName: "Custom", rotationIndex: 0 }],
    };
    const { headers, rows } = render(custom, "custom", "C");
    expect(headers).toEqual(["Formula", "Notes", "Intervals"]);
    expect(rows).toHaveLength(5);
    expect(rows.every((r) => !r[1].html.includes("Skip"))).toBe(true);
  });

  it("renders Egyptian, Man Gong, and Ritusen as 7-row reference tables with N/A skipped slots", () => {
    // A skipped note reads back as e.g. "F#Skip": the struck note, then the badge.
    const expected: [string, string, NoteName, string[][]][] = [
      ["major-pentatonic", "egyptian", "D", [
        ["1", "D", "i", "Tonic", "Dsus4, Dm7(no3), D7sus4"],
        ["2", "E", "ii", "Supertonic", "Em, Em7"],
        ["3", "F#Skip", "N/A", "Mediant", "N/A"],
        ["4", "G", "IV", "Subdominant", "G, G7, Gsus4"],
        ["5", "A", "v", "Dominant", "Am, Am7, A7"],
        ["6", "BSkip", "N/A", "Submediant", "N/A"],
        ["b7", "C", "bVII", "Subtonic", "C, Cmaj7"],
      ]],
      ["major-pentatonic", "blues-minor", "E", [
        ["1", "E", "i", "Tonic", "Em7(no5), Esus4(b9)"],
        ["2", "F#Skip", "N/A", "Supertonic", "N/A"],
        ["b3", "G", "bIII", "Minor Mediant", "G, G7"],
        ["4", "A", "iv", "Subdominant", "Am, Am7"],
        ["5", "BSkip", "N/A", "Dominant", "N/A"],
        ["b6", "C", "bVI", "Submediant", "C, Cmaj7"],
        ["b7", "D", "bVII", "Subtonic", "Dm, Dm7"],
      ]],
      ["minor-pentatonic", "ritusen", "G", [
        ["1", "G", "I", "Tonic", "G, Gsus4, G6"],
        ["2", "A", "ii", "Supertonic", "Am, Am7"],
        ["3", "BSkip", "N/A", "Mediant", "N/A"],
        ["4", "C", "IV", "Subdominant", "C, Cmaj7, C6"],
        ["5", "D", "V", "Dominant", "Dm, Dm7, D7sus4"],
        ["6", "E", "vi", "Submediant", "Em, Em7"],
        ["7", "F#Skip", "N/A", "Leading Tone", "N/A"],
      ]],
    ];
    for (const [family, mode, root, want] of expected) {
      const { headers, rows } = render(family, mode, root);
      expect(headers, mode).toEqual(["Formula", "Notes", "Intervals", "Roman", "Degree", "Chords"]);
      expect(rows.map((r) => [r[0].text, r[1].text, r[3].text, r[4].text, r[5].text]), mode).toEqual(want);
    }
  });

  it("strikes through a skipped row's Formula, Notes, Intervals, Roman and Degree, but not its badge or Chords", () => {
    for (const [family, mode, root] of [
      ["major-pentatonic", "major-pentatonic", "C"],
      ["major-pentatonic", "egyptian", "D"],
      ["blue", "blues-minor", "A"],
    ] as [string, string, NoteName][]) {
      const { rows } = render(family, mode, root);
      const skipped = rows.filter((r) => r[1].html.includes("Skip"));
      expect(skipped.length, mode).toBeGreaterThan(0);
      for (const r of skipped) {
        for (const i of [0, 1, 2, 3, 4]) expect(r[i].html, `${mode} cell ${i}`).toContain("line-through");
        expect(r[5].html, `${mode} chords`).not.toContain("line-through");
        // The badge sits outside the struck span.
        expect(r[1].html).not.toMatch(/line-through[^>]*>[^<]*Skip/);
      }
      // No in-scale row has any strikethrough.
      for (const r of rows.filter((r) => !r[1].html.includes("Skip"))) {
        expect(r.map((c) => c.html).join(""), mode).not.toContain("line-through");
      }
    }
  });

  it("renders Minor Pentatonic at A with skipped slots present and marked", () => {
    const { headers, rows } = render("minor-pentatonic", "minor-pentatonic", "A");
    expect(headers).toEqual(["Formula", "Notes", "Intervals", "Roman", "Degree", "Chords"]);
    expect(rows).toHaveLength(7);

    const inScale = rows.filter((r) => !r[1].html.includes("Skip"));
    expect(inScale.map((r) => [r[0].text, r[1].text, r[3].text, r[4].text, r[5].text])).toEqual([
      ["1", "A", "i", "Tonic", "Am, Am7, Am11"],
      ["b3", "C", "bIII", "Minor Mediant", "C, Cmaj7, C6"],
      ["4", "D", "iv", "Subdominant", "Dm, Dm7, Dsus4"],
      ["5", "E", "v / V", "Dominant", "Em, Em7, E7"],
      ["b7", "G", "bVII", "Subtonic", "G, G7, Gsus4"],
    ]);

    const skipped = rows.filter((r) => r[1].html.includes("Skip"));
    expect(skipped.map((r) => [r[0].text, r[1].text, r[3].text, r[4].text, r[5].text])).toEqual([
      ["2", "BSkip", "ii°", "Supertonic", "Rarely used"],
      ["b6", "FSkip", "bVI", "Submediant", "F, Fmaj7"],
    ]);
    // Skipped note is struck through; in-scale notes never are.
    expect(skipped.every((r) => r[1].html.includes("line-through"))).toBe(true);
    expect(inScale.every((r) => !r[1].html.includes("line-through"))).toBe(true);
  });

  it("shows the avoid-note hint after the chords, naming the note", () => {
    const { rows } = render("major-pentatonic", "major-pentatonic", "C");
    const fourth = rows.find((r) => r[0].text === "4")!;
    expect(fourth[1].html).toContain("Skip");
    // text() strips tags, so the chords and the hint span read back-to-back.
    expect(fourth[5].text).toBe("F, Fmaj7Avoid F when soloing");
  });

  it("dims skipped rows and leaves in-scale rows at full opacity", () => {
    const { rows } = render("minor-pentatonic", "minor-pentatonic", "A");
    const rowHtml = (r: Cell[]) => r.map((c) => c.html).join("");
    const skipped = rows.filter((r) => r[1].html.includes("Skip"));
    const inScale = rows.filter((r) => !r[1].html.includes("Skip"));
    expect(skipped).toHaveLength(2);
    expect(skipped.every((r) => rowHtml(r).includes("opacity-70"))).toBe(true);
    expect(inScale.every((r) => !rowHtml(r).includes("opacity-70"))).toBe(true);
  });

  it("badges blue notes only on the flagged slot", () => {
    const major = render("blue", "blues-major", "C");
    expect(major.rows).toHaveLength(8);
    const withBadge = major.rows.filter((r) => r[4].html.includes("Blue note"));
    expect(withBadge.map((r) => [r[0].text, r[1].text])).toEqual([["b3", "D#"]]);

    const minor = render("blue", "blues-minor", "A");
    const minorBadge = minor.rows.filter((r) => r[4].html.includes("Blue note"));
    expect(minorBadge.map((r) => [r[0].text, r[4].text.replace("Blue note", "")])).toEqual([["b5", "Dim. Dominant"]]);
  });

  it("transposes chords with the root", () => {
    const { rows } = render("major-pentatonic", "major-pentatonic", "D");
    expect(rows.find((r) => r[0].text === "3")![5].text).toBe("F#m, F#m7, D/F#");
  });
});

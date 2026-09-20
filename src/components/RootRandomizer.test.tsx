import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RootRandomizer } from "./RootRandomizer";

describe("RootRandomizer", () => {
  it("shows the key with the family and mode names", () => {
    const html = renderToStaticMarkup(
      <RootRandomizer root="D#" familyName="Harmonic Minor" modeName="Phrygian Dominant" onRandomize={() => {}} />,
    );
    expect(html).toContain("D#");
    expect(html).toContain("Harmonic Minor");
    expect(html).toContain("Phrygian Dominant");
    expect(html).toContain('title="D# Harmonic Minor · Phrygian Dominant"');
  });

  it("labels the randomize button", () => {
    const html = renderToStaticMarkup(
      <RootRandomizer root="C" familyName="Major" modeName="Ionian" onRandomize={() => {}} />,
    );
    expect(html).toContain('aria-label="Randomize root note"');
  });
});

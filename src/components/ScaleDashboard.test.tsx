import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getFamily } from "@/lib/scales";

import { ScaleDashboard } from "./ScaleDashboard";

// Layout is CSS, which renderToStaticMarkup can't measure - these assert the
// structure the layout depends on: which controls share a grid container.
function renderSections() {
  const html = renderToStaticMarkup(
    <ScaleDashboard
      root="C"
      onRootChange={() => {}}
      family={getFamily("major")!}
      modeId="ionian"
      displayMode="note"
      onDisplayModeChange={() => {}}
      selectedDegreeIndex={null}
      onSelectedDegreeIndexChange={() => {}}
    />,
  );
  const sections = [...html.matchAll(/<section[^>]*>[\s\S]*?<\/section>/g)].map((m) => m[0]);
  return sections;
}

describe("ScaleDashboard layout", () => {
  it("puts the wheel and the info table in one two-column grid, wheel first", () => {
    const [wheelRow] = renderSections();
    expect(wheelRow).toContain("grid");
    expect(wheelRow).toContain("md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]");
    expect(wheelRow).not.toContain("flex-wrap");
    const wheelAt = wheelRow.indexOf('aria-label="Scale wheel"');
    const tableAt = wheelRow.indexOf("<table");
    expect(wheelAt).toBeGreaterThan(-1);
    expect(tableAt).toBeGreaterThan(wheelAt);
  });

  it("puts the Degrees row and the Note/Degree switch in one grid weighted toward Degrees", () => {
    const [, degreesRow] = renderSections();
    expect(degreesRow).toContain("md:grid-cols-[minmax(0,8fr)_minmax(max-content,2fr)]");
    const degreesAt = degreesRow.indexOf(">Degrees<");
    const switchAt = degreesRow.indexOf('role="switch"');
    expect(degreesAt).toBeGreaterThan(-1);
    expect(switchAt).toBeGreaterThan(degreesAt);
    expect(degreesRow).toContain(">Note<");
  });
});

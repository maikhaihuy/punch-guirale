import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getFamily } from "@/lib/scales";

import { ScaleWheel, type WheelPlayback } from "./ScaleWheel";

function render(isPlaying: boolean, playback: WheelPlayback | null) {
  return renderToStaticMarkup(
    <ScaleWheel
      root="C"
      onRootChange={() => {}}
      family={getFamily("major")!}
      modeId="ionian"
      isPlaying={isPlaying}
      playback={playback}
      onTogglePlayback={() => {}}
    />,
  );
}

const RING = "wheel-note--playing";
const SWEEP = "wheel-edge-sweep";

describe("ScaleWheel hub", () => {
  it("is a play button while idle, with no dice", () => {
    const html = render(false, null);
    expect(html).toContain('aria-label="Play scale"');
    expect(html).not.toContain("Stop scale");
    expect(html).not.toContain("🎲");
    expect(html).not.toContain("Randomize");
  });

  it("is a stop button while playing", () => {
    const html = render(true, null);
    expect(html).toContain('aria-label="Stop scale"');
    expect(html).not.toContain("Play scale");
  });

  it("is keyboard-focusable", () => {
    const html = render(false, null);
    expect(html).toMatch(/role="button"[^>]*tabindex="0"|tabindex="0"[^>]*role="button"/);
  });
});

describe("ScaleWheel playback overlays", () => {
  it("draws no ring and no sweep while idle", () => {
    const html = render(false, null);
    expect(html).not.toContain(RING);
    expect(html).not.toContain(SWEEP);
  });

  it("rings only the sounding note", () => {
    const html = render(true, { activeNote: "E", nextNote: "F", stepIndex: 2, stepDurationSec: 0.6 });
    expect(html.match(new RegExp(RING, "g"))).toHaveLength(1);
  });

  it("draws the sweep along the edge to the next note, timed to one step", () => {
    const html = render(true, { activeNote: "C", nextNote: "D", stepIndex: 0, stepDurationSec: 0.5 });
    expect(html.match(new RegExp(SWEEP, "g"))).toHaveLength(1);
    expect(html).toContain("animation-duration:0.5s");
    expect(html).toContain('pathLength="1"');
  });

  it("reverses the sweep direction when descending", () => {
    const up = render(true, { activeNote: "A", nextNote: "B", stepIndex: 5, stepDurationSec: 0.5 });
    const down = render(true, { activeNote: "B", nextNote: "A", stepIndex: 9, stepDurationSec: 0.5 });
    const pathOf = (html: string) => html.match(/<path[^>]* d="([^"]+)"/)![1];
    const [upFrom, upTo] = pathOf(up).split(" L");
    const [downFrom, downTo] = pathOf(down).split(" L");
    expect(downFrom.replace("M", "")).toBe(upTo);
    expect(downTo).toBe(upFrom.replace("M", ""));
  });

  it("rides an existing polygon edge, including the closing one", () => {
    // B -> C is the edge that closes the polygon (last degree back to root).
    const html = render(true, { activeNote: "B", nextNote: "C", stepIndex: 6, stepDurationSec: 0.5 });
    const vertices = html.match(/<polygon points="([^"]+)"/)![1].split(" ");
    const [from, to] = html.match(/<path[^>]* d="M([^"]+) L([^"]+)"/)!.slice(1).map((p) => p.replace(" ", ","));
    const fromAt = vertices.indexOf(from);
    const toAt = vertices.indexOf(to);
    expect(fromAt).toBeGreaterThan(-1);
    expect(toAt).toBeGreaterThan(-1);
    expect(fromAt).toBe(vertices.length - 1);
    expect(toAt).toBe(0);
  });

  it("draws no sweep on the last note, where no next note exists", () => {
    const html = render(true, { activeNote: "C", nextNote: null, stepIndex: 14, stepDurationSec: 0.5 });
    expect(html).toContain(RING);
    expect(html).not.toContain(SWEEP);
  });
});

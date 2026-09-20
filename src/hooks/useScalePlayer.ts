"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Synth } from "tone";

import type { PlaybackStep } from "@/lib/scalePlayback";

type ToneModule = typeof import("tone");

// Just enough head start that the first note isn't scheduled in the past.
const START_LEAD_SEC = 0.1;
// A note sounds for most of its beat so consecutive notes stay distinct.
const NOTE_LENGTH_RATIO = 0.9;
// Stopping mid-note fades briefly instead of cutting the waveform (a click);
// a natural finish fades a touch longer to let the last note ring out.
const STOP_FADE_SEC = 0.03;
const END_FADE_SEC = 0.3;
// Slack on the setTimeout fallback so it never beats the audio-clock finish.
const END_FALLBACK_MARGIN_MS = 300;

function disposeLater(synth: Synth, fadeSec: number) {
  synth.volume.rampTo(-80, fadeSec);
  setTimeout(() => synth.dispose(), fadeSec * 1000 + 50);
}

// Plays a note sequence on the audio clock. Deliberately independent of
// Tone.Transport (useMetronome.stop() calls transport.stop(), which would
// otherwise kill playback) and of useNotePlayer's shared synth (a monophonic
// Tone source throws if a start time is earlier than one already scheduled,
// which a fretboard tap mid-playback would be). Each run gets its own synth.
export function useScalePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [stepDurationSec, setStepDurationSec] = useState(0);

  const toneRef = useRef<ToneModule | null>(null);
  const synthRef = useRef<Synth | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped by every start/stop so an in-flight async start, or a stale
  // finish callback, can tell it has been superseded.
  const runIdRef = useRef(0);
  const activeRef = useRef(false);

  const teardown = useCallback((fadeSec: number) => {
    if (endTimerRef.current !== null) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
    toneRef.current?.getDraw().cancel();
    const synth = synthRef.current;
    synthRef.current = null;
    if (synth) disposeLater(synth, fadeSec);
    setActiveStepIndex(null);
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    runIdRef.current += 1;
    if (!activeRef.current) return;
    activeRef.current = false;
    teardown(STOP_FADE_SEC);
  }, [teardown]);

  const start = useCallback(
    async (steps: PlaybackStep[], bpm: number) => {
      if (activeRef.current || steps.length === 0) return;
      const runId = ++runIdRef.current;
      activeRef.current = true;
      // Optimistic so the control flips to "Stop" at once, and a second
      // click during the async setup below cancels instead of restarting.
      setIsPlaying(true);
      setActiveStepIndex(null);

      try {
        const Tone = toneRef.current ?? (await import("tone"));
        toneRef.current = Tone;
        // Only ever called from the click that triggered start(), per
        // browser autoplay policy - never on mount.
        await Tone.start();
        if (runIdRef.current !== runId) return;

        const beatSec = 60 / bpm;
        setStepDurationSec(beatSec);

        const synth = new Tone.Synth({ envelope: { release: 0.15 } }).toDestination();
        synthRef.current = synth;

        const draw = Tone.getDraw();
        const t0 = Tone.now() + START_LEAD_SEC;
        steps.forEach((step, i) => {
          const time = t0 + i * beatSec;
          synth.triggerAttackRelease(step.freq, beatSec * NOTE_LENGTH_RATIO, time);
          draw.schedule(() => {
            if (runIdRef.current === runId) setActiveStepIndex(i);
          }, time);
        });

        const finish = () => {
          if (runIdRef.current !== runId) return;
          activeRef.current = false;
          teardown(END_FADE_SEC);
        };
        const endTime = t0 + steps.length * beatSec;
        draw.schedule(finish, endTime);
        // Draw drops callbacks that are more than ~0.25s past due (a hidden
        // tab throttles requestAnimationFrame), which would leave the
        // control stuck on "Stop". This only resets state; tempo stays on
        // the audio clock.
        endTimerRef.current = setTimeout(
          finish,
          (endTime - Tone.now()) * 1000 + END_FALLBACK_MARGIN_MS,
        );
      } catch {
        // Audio unavailable/blocked: fall back to idle instead of a stuck
        // "Stop" control.
        if (runIdRef.current === runId) {
          activeRef.current = false;
          teardown(0);
        }
      }
    },
    [teardown],
  );

  useEffect(() => stop, [stop]);

  return { isPlaying, activeStepIndex, stepDurationSec, start, stop };
}

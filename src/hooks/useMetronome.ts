"use client";

import { useCallback, useRef, useState } from "react";
import type { Loop } from "tone";

type ToneModule = typeof import("tone");
type ToneTransport = ReturnType<ToneModule["getTransport"]>;

export function useMetronome(initialBpm = 100) {
  const [bpm, setBpmState] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const toneRef = useRef<ToneModule | null>(null);
  const loopRef = useRef<Loop | null>(null);

  const setBpm = useCallback((next: number) => {
    setBpmState(next);
    const Tone = toneRef.current;
    if (Tone && loopRef.current) {
      (Tone.getTransport() as ToneTransport).bpm.value = next;
    }
  }, []);

  const start = useCallback(async () => {
    const Tone = toneRef.current ?? (await import("tone"));
    toneRef.current = Tone;

    await Tone.start();

    const transport = Tone.getTransport();
    transport.bpm.value = bpm;

    const synth = new Tone.MembraneSynth().toDestination();
    const loop = new Tone.Loop((time) => {
      synth.triggerAttackRelease("C2", "32n", time);
    }, "4n").start(0);

    loopRef.current = loop;
    transport.start();
    setIsPlaying(true);
  }, [bpm]);

  const stop = useCallback(() => {
    const Tone = toneRef.current;
    if (!Tone) return;
    const transport = Tone.getTransport();
    transport.stop();
    loopRef.current?.dispose();
    loopRef.current = null;
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      void start();
    }
  }, [isPlaying, start, stop]);

  return { bpm, setBpm, isPlaying, toggle };
}

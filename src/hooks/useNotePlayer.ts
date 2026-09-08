"use client";

import { useCallback, useRef } from "react";
import type { Synth } from "tone";

type ToneModule = typeof import("tone");

export function useNotePlayer() {
  const toneRef = useRef<ToneModule | null>(null);
  const synthRef = useRef<Synth | null>(null);

  const playNote = useCallback(async (freq: number) => {
    const Tone = toneRef.current ?? (await import("tone"));
    toneRef.current = Tone;

    await Tone.start();

    if (!synthRef.current) {
      synthRef.current = new Tone.Synth().toDestination();
    }
    synthRef.current.triggerAttackRelease(freq, "8n");
  }, []);

  return { playNote };
}

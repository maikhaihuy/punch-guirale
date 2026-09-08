"use client";

import { useEffect, useMemo, useState } from "react";

import { Fretboard } from "@/components/Fretboard";
import { KeyModeBar, type DisplayMode } from "@/components/KeyModeBar";
import { PracticeControls } from "@/components/PracticeControls";
import { PracticeHistory } from "@/components/PracticeHistory";
import { useMetronome } from "@/hooks/useMetronome";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useWakeLock } from "@/hooks/useWakeLock";
import { appendSession, loadSessions, type PracticeSession } from "@/lib/storage";
import { buildFretboard, type ModeName, type NoteName } from "@/lib/theory";

export default function Home() {
  const [root, setRoot] = useState<NoteName>("C");
  const [mode, setMode] = useState<ModeName>("ionian");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("note");
  const [sessions, setSessions] = useState<PracticeSession[]>([]);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const fretboard = useMemo(() => buildFretboard(root, mode), [root, mode]);

  const metronome = useMetronome();
  const stopwatch = useStopwatch();

  const practiceActive = metronome.isPlaying || stopwatch.status === "running";
  useWakeLock(practiceActive);

  const handleStopwatchStop = () => {
    const durationSec = stopwatch.stop();
    if (durationSec <= 0) return;
    const session: PracticeSession = {
      date: new Date().toISOString(),
      rootNote: root,
      mode,
      bpm: metronome.bpm,
      durationSec,
    };
    setSessions(appendSession(session));
  };

  return (
    <div className="flex min-h-full flex-col pb-28">
      <KeyModeBar
        root={root}
        onRootChange={setRoot}
        mode={mode}
        onModeChange={setMode}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
      />

      <Fretboard fretboard={fretboard} displayMode={displayMode} />

      <PracticeHistory sessions={sessions} />

      <PracticeControls
        bpm={metronome.bpm}
        onBpmChange={metronome.setBpm}
        isMetronomePlaying={metronome.isPlaying}
        onToggleMetronome={metronome.toggle}
        stopwatchStatus={stopwatch.status}
        elapsedSec={stopwatch.elapsedSec}
        onStopwatchStart={stopwatch.start}
        onStopwatchPause={stopwatch.pause}
        onStopwatchResume={stopwatch.resume}
        onStopwatchStop={handleStopwatchStop}
      />
    </div>
  );
}

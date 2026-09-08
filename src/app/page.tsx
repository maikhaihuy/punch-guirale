"use client";

import { useEffect, useMemo, useState } from "react";

import { Fretboard } from "@/components/Fretboard";
import { KeyModeBar, type DisplayMode, type SelectedPosition } from "@/components/KeyModeBar";
import { PracticeControls } from "@/components/PracticeControls";
import { PracticeHistory } from "@/components/PracticeHistory";
import { useMetronome } from "@/hooks/useMetronome";
import { useNotePlayer } from "@/hooks/useNotePlayer";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useWakeLock } from "@/hooks/useWakeLock";
import { appendSession, loadSessions, type PracticeSession } from "@/lib/storage";
import { buildFretboard, getPositionRanges, type ModeName, type NoteName } from "@/lib/theory";

const MOBILE_QUERY = "(max-width: 640px)";

export default function Home() {
  const [root, setRoot] = useState<NoteName>("C");
  const [mode, setMode] = useState<ModeName>("ionian");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("note");
  const [selectedPosition, setSelectedPosition] = useState<SelectedPosition>("all");
  const [highlightTriad, setHighlightTriad] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mql.matches);
    if (mql.matches) setSelectedPosition(1);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const fretboard = useMemo(() => buildFretboard(root, mode), [root, mode]);
  const positionRanges = useMemo(
    () => (selectedPosition === "all" ? [] : getPositionRanges(root, selectedPosition)),
    [root, selectedPosition],
  );

  const metronome = useMetronome();
  const stopwatch = useStopwatch();
  const { playNote } = useNotePlayer();

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
        selectedPosition={selectedPosition}
        onSelectedPositionChange={setSelectedPosition}
        highlightTriad={highlightTriad}
        onHighlightTriadChange={setHighlightTriad}
      />

      <Fretboard
        fretboard={fretboard}
        displayMode={displayMode}
        selectedPosition={selectedPosition}
        positionRanges={positionRanges}
        onNotePlay={(note) => void playNote(note.freq)}
        autoFitMobile={isMobile}
        highlightTriad={highlightTriad}
      />

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

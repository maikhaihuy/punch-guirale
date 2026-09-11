"use client";

import { useEffect, useMemo, useState } from "react";

import { Fretboard } from "@/components/Fretboard";
import { KeyModeBar, type DisplayMode, type SelectedPosition } from "@/components/KeyModeBar";
import { PracticeControls } from "@/components/PracticeControls";
import { PracticeHistory } from "@/components/PracticeHistory";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMetronome } from "@/hooks/useMetronome";
import { useNotePlayer } from "@/hooks/useNotePlayer";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useWakeLock } from "@/hooks/useWakeLock";
import { appendSession, loadSessions, type PracticeSession } from "@/lib/storage";
import {
  buildFretboard,
  getPositionRanges,
  getTriadDegreeLabels,
  type ModeName,
  type NoteName,
} from "@/lib/theory";

const MOBILE_QUERY = "(max-width: 640px)";

export default function Home() {
  const [root, setRoot] = useState<NoteName>("C");
  const [mode, setMode] = useState<ModeName>("ionian");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("note");
  const [selectedPosition, setSelectedPosition] = useState<SelectedPosition>("all");
  const [selectedTriadDegree, setSelectedTriadDegree] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
  const triadDegreeLabels = useMemo(
    () => (selectedTriadDegree === null ? null : getTriadDegreeLabels(mode, selectedTriadDegree)),
    [mode, selectedTriadDegree],
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
    <div className="flex min-h-screen w-full flex-col items-center gap-8 px-4 pt-6 pb-4">
      <header className="flex w-full max-w-5xl justify-center">
        <ThemeToggle />
      </header>

      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen}>
        <KeyModeBar
          root={root}
          onRootChange={setRoot}
          mode={mode}
          onModeChange={setMode}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          selectedPosition={selectedPosition}
          onSelectedPositionChange={setSelectedPosition}
          selectedTriadDegree={selectedTriadDegree}
          onSelectedTriadDegreeChange={setSelectedTriadDegree}
        />
      </SettingsPanel>

      <main className="flex w-full max-w-5xl flex-col gap-6">
        <Fretboard
          fretboard={fretboard}
          displayMode={displayMode}
          selectedPosition={selectedPosition}
          positionRanges={positionRanges}
          onNotePlay={(note) => void playNote(note.freq)}
          autoFitMobile={isMobile}
          triadDegreeLabels={triadDegreeLabels}
        />

        <PracticeHistory sessions={sessions} />
      </main>

      <footer className="sticky bottom-0 z-30 w-full max-w-2xl sm:static">
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
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { EditorPanel } from './components/EditorPanel';
import { TeleprompterPanel } from './components/TeleprompterPanel';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { parseScript } from './lib/scriptUtils';
import { AppSettings, ScriptLine } from './types';

const defaultScript = `Welcome to VoxPrompter!
This is your teleprompter script.
You can read this at your own pace.
[pause 1.5]
Did you see that pause?
You can adjust the speed using the WPM slider above.
Press the REC button to start recording your voice over.`;

const DEFAULT_SETTINGS: AppSettings = {
  wpm: 150,
  autoScrollOnRecord: true,
};

export default function App() {
  const [rawScript, setRawScript] = useState(() => {
    return localStorage.getItem('voxprompter-script') || defaultScript;
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('voxprompter-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [scriptLines, setScriptLines] = useState<ScriptLine[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { isRecording, startRecording, stopRecording, audioUrl } = useAudioRecorder();
  
  const scriptLinesRef = useRef<ScriptLine[]>([]);
  const wpmRef = useRef<number>(settings.wpm);
  const activeLineIndexRef = useRef(activeLineIndex);
  const isPlayingRef = useRef(isPlaying);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    scriptLinesRef.current = scriptLines;
  }, [scriptLines]);

  useEffect(() => {
    wpmRef.current = settings.wpm;
    localStorage.setItem('voxprompter-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    activeLineIndexRef.current = activeLineIndex;
  }, [activeLineIndex]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Parse script whenever rawScript changes
  useEffect(() => {
    localStorage.setItem('voxprompter-script', rawScript);
    setScriptLines(parseScript(rawScript));
  }, [rawScript]);

  const stopPrompter = useCallback(() => {
    setIsPlaying(false);
    setActiveLineIndex(-1);
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  }, []);

  const scheduleNextLine = useCallback(() => {
    if (!isPlayingRef.current) return;
    
    const lines = scriptLinesRef.current;
    const currentIdx = activeLineIndexRef.current;
    
    if (currentIdx >= lines.length - 1) {
      // Reached the end
      setIsPlaying(false);
      return;
    }
    
    const wpm = wpmRef.current;
    const currentLine = lines[currentIdx];
    
    // Calculate duration for current line
    // If empty line, default to 1 second unless there's a pause.
    let durationMs = 1000;
    if (currentLine.wordCount > 0) {
       // (words / wpm) * 60 seconds * 1000 ms
       durationMs = (currentLine.wordCount / (wpm / 60)) * 1000;
    }
    
    // Add pause duration
    durationMs += currentLine.pauseSeconds * 1000;
    
    // minimum duration so it doesn't instantly snap for short lines
    durationMs = Math.max(durationMs, 500);

    playbackTimerRef.current = setTimeout(() => {
      setActiveLineIndex(prev => prev + 1);
      // Recursively schedule the next one once this line changes
    }, durationMs);
    
  }, []);

  // When activeLineIndex changes while playing, schedule the next jump
  useEffect(() => {
    if (isPlaying && activeLineIndex >= 0) {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
      scheduleNextLine();
    }
    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    };
  }, [activeLineIndex, isPlaying, scheduleNextLine]);

  const startPrompterFrom = useCallback((index: number) => {
    setIsPlaying(true);
    setActiveLineIndex(index);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stopPrompter();
    } else {
      startPrompterFrom(0);
    }
  }, [isPlaying, stopPrompter, startPrompterFrom]);

  const handleToggleRecord = useCallback(() => {
    if (isRecording) {
      stopRecording();
      stopPrompter();
    } else {
      startRecording();
      if (settings.autoScrollOnRecord) {
        startPrompterFrom(0);
      }
    }
  }, [isRecording, stopRecording, startRecording, settings.autoScrollOnRecord, stopPrompter, startPrompterFrom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in textarea
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }
      
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        if (!isRecording) handleToggleRecord();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        if (isRecording) handleToggleRecord();
        else if (isPlaying) stopPrompter();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleToggleRecord, isRecording, isPlaying, stopPrompter]);

  const handleExport = useCallback(() => {
    // Export script lines with timings
    const exportData = {
      wpm: settings.wpm,
      lines: scriptLines.map((line, idx) => ({
        index: idx,
        originalText: line.originalText,
        wordCount: line.wordCount,
        pauseSeconds: line.pauseSeconds
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxprompter-script-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [settings.wpm, scriptLines]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <TopBar 
        settings={settings}
        setSettings={setSettings}
        isRecording={isRecording}
        onToggleRecord={handleToggleRecord}
        audioUrl={audioUrl}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
      />
      <div className="flex-1 flex overflow-hidden">
        <EditorPanel rawScript={rawScript} setRawScript={setRawScript} onExport={handleExport} />
        <TeleprompterPanel 
          scriptLines={scriptLines} 
          activeLineIndex={activeLineIndex}
          isPlaying={isPlaying}
          onPlayLine={startPrompterFrom}
          onStop={stopPrompter}
        />
      </div>
    </div>
  );
}


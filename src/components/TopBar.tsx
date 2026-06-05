import React from 'react';
import { Mic, Square, Download, Settings as SettingsIcon, Play } from 'lucide-react';
import { AppSettings } from '../types';

interface TopBarProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isRecording: boolean;
  onToggleRecord: () => void;
  audioUrl: string | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function TopBar({
  settings,
  setSettings,
  isRecording,
  onToggleRecord,
  audioUrl,
  isPlaying,
  onTogglePlay
}: TopBarProps) {
  return (
    <div className="h-16 flex-shrink-0 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-white">
      <div className="flex items-center gap-6">
        <h1 className="font-bold text-xl tracking-tight text-slate-100 flex items-center gap-2">
          VoxPrompter
        </h1>
        
        <div className="h-6 w-px bg-slate-700" />
        
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            isPlaying 
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
          }`}
        >
          {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          {isPlaying ? 'Stop Prompter' : 'Start Prompter'}
        </button>

        <button
          onClick={onToggleRecord}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            isRecording 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
          }`}
        >
          {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
          {isRecording ? 'Stop Recording' : 'REC Voice'}
        </button>

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-full ml-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Playback</span>
            <audio src={audioUrl} controls className="h-8 w-48 [&::-webkit-media-controls-panel]:bg-slate-800 [&::-webkit-media-controls-play-button]:bg-emerald-500 [&::-webkit-media-controls-play-button]:rounded-full" />
            <a 
              href={audioUrl} 
              download="voxprompter-recording.webm"
              title="Download recording"
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-400">Pace (WPM)</label>
          <input 
            type="range" 
            min="50" 
            max="300" 
            step="5"
            value={settings.wpm}
            onChange={(e) => setSettings(s => ({ ...s, wpm: parseInt(e.target.value) }))}
            className="w-32 accent-emerald-500"
          />
          <span className="text-sm font-mono text-slate-300 w-8">{settings.wpm}</span>
        </div>
        
        <div className="flex items-center gap-2">
           <label className="text-sm cursor-pointer flex items-center gap-2 text-slate-300 hover:text-white transition-colors" title="Start prompt automatically when recording starts">
             <input 
                type="checkbox"
                checked={settings.autoScrollOnRecord}
                onChange={(e) => setSettings(s => ({ ...s, autoScrollOnRecord: e.target.checked }))}
                className="rounded border-slate-700 bg-slate-800 accent-emerald-500 w-4 h-4"
             />
             Auto-scroll on REC
           </label>
        </div>
      </div>
    </div>
  );
}

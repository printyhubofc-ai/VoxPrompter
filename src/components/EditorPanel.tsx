import React from 'react';
import { Download } from 'lucide-react';

interface EditorPanelProps {
  rawScript: string;
  setRawScript: (val: string) => void;
  onExport: () => void;
}

export function EditorPanel({ rawScript, setRawScript, onExport }: EditorPanelProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-white text-slate-900 border-r border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold tracking-tight text-slate-800">Script Editor</h2>
          <span className="text-xs text-slate-500 font-mono">Tips: Use [pause 2.5] for explicit pauses</span>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-200/50 hover:bg-slate-200 rounded-md transition-colors"
          title="Export Script as JSON"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
      <div className="flex-1 p-4">
        <textarea
          value={rawScript}
          onChange={(e) => setRawScript(e.target.value)}
          className="w-full h-full resize-none outline-none text-base bg-transparent placeholder-slate-400 font-sans leading-relaxed"
          placeholder="Write or paste your script here... Use [pause 1.5] to insert pauses for the teleprompter."
        />
      </div>
    </div>
  );
}


import React from 'react';
import { ScriptLine } from '../types';
import { cn } from '../lib/utils';
import { Play, Square } from 'lucide-react';

interface TeleprompterPanelProps {
  scriptLines: ScriptLine[];
  activeLineIndex: number;
  isPlaying: boolean;
  onPlayLine: (index: number) => void;
  onStop: () => void;
}

export function TeleprompterPanel({
  scriptLines,
  activeLineIndex,
  isPlaying,
  onPlayLine,
  onStop
}: TeleprompterPanelProps) {
  // Use a ref to scroll to the active line
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (activeLineIndex >= 0 && containerRef.current) {
      const activeEl = containerRef.current.querySelector(`[data-index="${activeLineIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeLineIndex]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 overflow-hidden font-sans">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-white">Teleprompter</h2>
        {isPlaying && (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md transition-colors"
          >
            <Square className="w-4 h-4" />
            <span className="text-sm font-medium">Stop Autoscroll</span>
          </button>
        )}
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-8 lg:p-12 pb-[50vh] space-y-6"
      >
        {scriptLines.length === 0 && (
          <div className="flex h-full items-center justify-center text-slate-500">
            Write or paste a script to activate the prompter.
          </div>
        )}
        
        {scriptLines.map((line, idx) => {
          const isActive = idx === activeLineIndex;
          const isPassed = activeLineIndex !== -1 && idx < activeLineIndex;
          
          return (
            <div 
              key={line.id} 
              data-index={idx}
              className={cn(
                "group relative flex items-start gap-4 transition-all duration-500 ease-out",
                isActive ? "opacity-100 scale-105" : isPassed ? "opacity-30" : "opacity-60",
                line.originalText.trim() === "" ? "py-2" : ""
              )}
            >
              <div className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  onClick={() => onPlayLine(idx)}
                  className="p-2 rounded-full bg-slate-800 text-slate-300 hover:bg-emerald-500 hover:text-white transition-colors"
                  aria-label="Start prompter from this line"
                >
                   <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
              <div className="flex-1 text-2xl leading-relaxed lg:text-3xl lg:leading-relaxed">
                {line.displayText ? (
                  <span dangerouslySetInnerHTML={{ 
                    __html: formatTextForDisplay(line.displayText) 
                  }} />
                ) : (
                  // Render empty space to keep structural height for empty lines
                  <span className="inline-block h-6" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTextForDisplay(text: string): string {
  // Highlight pauses
  const pauseRegex = /(\[pause\s+[\d.]+(?:s)?\])/gi;
  return text.replace(pauseRegex, '<span class="px-2 py-0.5 mx-1 text-sm bg-yellow-500/20 text-yellow-400 rounded ring-1 ring-yellow-500/30">$1</span>');
}

export interface ScriptLine {
  id: string;
  originalText: string;
  displayText: string;
  wordCount: number;
  pauseSeconds: number;
}

export interface AppSettings {
  wpm: number;
  autoScrollOnRecord: boolean;
}

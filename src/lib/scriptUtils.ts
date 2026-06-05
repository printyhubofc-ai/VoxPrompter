import { ScriptLine } from '../types';

export function parseScript(rawText: string): ScriptLine[] {
  const lines = rawText.split('\n');
  const scriptLines: ScriptLine[] = [];

  const pauseRegex = /\[pause\s+([\d.]+)(s)?\]/i;

  for (let i = 0; i < lines.length; i++) {
    const originalText = lines[i];
    let displayText = originalText;
    let pauseSeconds = 0;

    const match = originalText.match(pauseRegex);
    if (match) {
      pauseSeconds = parseFloat(match[1]) || 0;
      // Also remove it from display text or format it nicely.
      // Let's replace it with a clean visual marker in the component, but here we can just strip it for word count.
    }

    // stripped text for word count
    const strippedText = originalText.replace(pauseRegex, '').trim();
    const wordCount = strippedText ? strippedText.split(/\s+/).length : 0;

    scriptLines.push({
      id: `line-${i}-${Date.now()}`,
      originalText,
      displayText,
      wordCount,
      pauseSeconds,
    });
  }

  return scriptLines;
}

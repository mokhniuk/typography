import type { Edit } from '../figma/edits.ts';

/** The values of a text range's style properties, by property name. Two styles are equal when their JSON is. */
export type Style = Record<string, unknown>;

/** `[start, end)` of a text, in UTF-16 units, with one style. */
export type Run = { start: number; end: number; style: Style };

export const sameStyle = (a: Style, b: Style): boolean => JSON.stringify(a) === JSON.stringify(b);

/**
 * Moves runs through the edits `toEdits` made (last first, so each edit's offsets are still those of the
 * original text). New characters take the style of the last character they replace, or of the one before an
 * insertion (the one after it, at the start of the text); deleted characters leave their run, and a run left
 * empty disappears. Neighbours with equal styles are joined.
 */
export function mapRuns(runs: readonly Run[], edits: readonly Edit[]): Run[] {
  const styles: Style[] = [];
  for (const { start, end, style } of runs) for (let i = start; i < end; i++) styles[i] = style;
  for (const { start, end, text } of edits) {
    const style = end > start ? styles[end - 1] : (styles[start - 1] ?? styles[start]);
    styles.splice(start, end - start, ...Array.from({ length: style ? text.length : 0 }, () => style as Style));
  }
  const out: Run[] = [];
  styles.forEach((style, i) => {
    const last = out.at(-1);
    if (last && sameStyle(last.style, style)) last.end = i + 1;
    else out.push({ start: i, end: i + 1, style });
  });
  return out;
}

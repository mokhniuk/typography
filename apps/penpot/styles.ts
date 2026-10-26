import { type Run, type Style, sameStyle } from './runs.ts';

/** The style properties of a Penpot text range that can be read and set (`getRange(start, end)`). */
export const PROPS = [
  'fontId',
  'fontFamily',
  'fontVariantId',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'textTransform',
  'textDecoration',
  'direction',
  'align',
  'fills',
] as const;

/** A `TextRange`: each property reads `'mixed'` when the range holds several values. */
export type RangeLike = Record<string, unknown>;

/** What of a Penpot `Text` shape this plugin uses. */
export type TextLike = { characters: string; name?: string; getRange(start: number, end: number): RangeLike };

const isMixed = (value: unknown): boolean => value === 'mixed';
const read = (range: RangeLike): Style => Object.fromEntries(PROPS.map((prop) => [prop, range[prop]]));
const anyMixed = (style: Style): boolean => PROPS.some((prop) => isMixed(style[prop]));

/** True when some style property differs inside the text (`'mixed'` for the whole range). */
export function hasMixedStyle(text: TextLike): boolean {
  const { length } = text.characters;
  return length > 0 && anyMixed(read(text.getRange(0, length)));
}

/**
 * The uniform runs of the text. A range that reads `'mixed'` is halved until its pieces are uniform, so the
 * calls grow with the number of runs, not of characters; neighbours with equal styles are joined.
 */
export function readRuns(text: TextLike): Run[] {
  const runs: Run[] = [];
  const visit = (start: number, end: number): void => {
    const style = read(text.getRange(start, end));
    if (end - start > 1 && anyMixed(style)) {
      const middle = start + Math.floor((end - start) / 2);
      visit(start, middle);
      visit(middle, end);
      return;
    }
    const last = runs.at(-1);
    if (last && sameStyle(last.style, style)) last.end = end;
    else runs.push({ start, end, style });
  };
  if (text.characters.length > 0) visit(0, text.characters.length);
  return runs;
}

/**
 * Puts runs back on a text whose style the characters setter flattened to its first run's: for each run, only
 * the properties that differ from that style are set, in the order of `PROPS` (a font before its variant:
 * writing `fontId` or `fontFamily`, even with the value it has, puts the range back on the regular variant, so
 * an unchanged font is never written). Setter errors propagate.
 */
export function applyRuns(text: TextLike, runs: readonly Run[]): void {
  if (runs.length === 0) return;
  const base = read(text.getRange(0, 1));
  const differs = (style: Style, prop: string): boolean => JSON.stringify(style[prop]) !== JSON.stringify(base[prop]);
  for (const { start, end, style } of runs) {
    const props = PROPS.filter((prop) => differs(style, prop));
    if (props.length === 0) continue;
    const range = text.getRange(start, end);
    for (const prop of props) range[prop] = style[prop];
  }
}

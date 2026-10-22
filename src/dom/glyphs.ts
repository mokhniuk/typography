/**
 * Which of the characters the rules insert the font on the page can actually draw.
 *
 * The engine is a string-to-string function and cannot see a font, so the `avoid` option names the
 * characters to keep out of the text (see `glyphs.ts` in core). In a browser the font is there to be
 * measured, and this module writes that list by itself: for each character it compares how wide the
 * font draws it against how wide the fallback alone draws it. A font that has no glyph for a
 * character lets the next font in the list draw it, which is exactly what the comparison finds — the
 * two widths are then the same.
 *
 * What it cannot see: a font whose glyph happens to have the same advance width as the fallback's in
 * both probes is reported as missing, and a font that draws a visibly wrong glyph of its own (a box
 * of its own making) is reported as present. The measure is cheap (one canvas, two probes per
 * character) and is made once the fonts have loaded.
 */

/** Two families no machine has, so a probe falls through to the generic after it. */
const ABSENT = '"__no_such_font_a__"';
const PROBES = ['monospace', 'serif'] as const;
const SIZE = 72;

let shared: CanvasRenderingContext2D | null | undefined;

function context(): CanvasRenderingContext2D | null {
  if (shared !== undefined) return shared;
  shared =
    typeof document === 'undefined' ? null : (document.createElement('canvas').getContext('2d') ?? null);
  return shared;
}

/** The family list of an element, as a canvas `font` value takes it. */
export function fontOf(el: Element): string {
  const style = getComputedStyle(el);
  return style.fontFamily || 'sans-serif';
}

/**
 * Whether the font list `family` draws `char` itself, rather than letting a fallback draw it.
 * `true` where there is nothing to measure with (on the server, or without a canvas), so the text is
 * typeset as usual.
 */
export function supports(char: string, family: string): boolean {
  const ctx = context();
  if (!ctx || !char) return true;
  const width = (list: string) => {
    ctx.font = `${SIZE}px ${list}`;
    return ctx.measureText(char).width;
  };
  for (const probe of PROBES) {
    if (width(`${family}, ${ABSENT}, ${probe}`) !== width(`${ABSENT}, ${probe}`)) return true;
  }
  return false;
}

/**
 * How a character reaches the page in this font list:
 *  - `own`: the font draws it;
 *  - `fallback`: the font has no glyph for it and another font draws it — silently, so the mark is
 *    there but in the wrong face;
 *  - `none`: no font on the machine draws it (nothing measurable at all), so the reader sees a box.
 * `own` where there is nothing to measure with, so a page without a canvas reports no gaps.
 */
export function glyphStatus(char: string, family: string): 'own' | 'fallback' | 'none' {
  const ctx = context();
  if (!ctx || !char) return 'own';
  if (supports(char, family)) return 'own';
  ctx.font = `${SIZE}px ${ABSENT}, ${PROBES[0]}`;
  return ctx.measureText(char).width > 0 ? 'fallback' : 'none';
}

/**
 * The characters of `chars` the font list cannot draw, as one string: the `avoid` option of the
 * engine. Each character is measured once per call.
 */
export function missingGlyphs(chars: string, family: string): string {
  let missing = '';
  for (const char of new Set([...chars])) {
    if (!supports(char, family)) missing += char;
  }
  return missing;
}

/** The characters of `chars` the font of `el` cannot draw. */
export const missingIn = (chars: string, el: Element): string =>
  missingGlyphs(chars, fontOf(el));

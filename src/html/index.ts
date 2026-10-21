import { type ModeOptions, NBSP, typesetBlock } from '../core';
import { BLOCK, RAW_BLOCK, RAW_INLINE } from '../shared/elements';

/**
 * Typesets the text of an HTML string and leaves everything else exactly as it was:
 * tags, attributes, comments, and the content of `<pre>`, `<code>`, `<script>`,
 * `<style>`, `<kbd>`, `<samp>`, `<textarea>`, `<svg>`, `<math>` and `<template>`.
 *
 * Text is typeset a block at a time, with each inline element (`<a>`, `<em>`, …)
 * standing in as a placeholder, so a quotation pairs across a link and a dash
 * after `</em>` is still a dash. A block whose text needs no change is returned
 * byte for byte.
 *
 * Entities: `&quot; &apos; &amp; &lt; &gt; &nbsp;`, the typographic names
 * (`&mdash; &laquo; &hellip;` …) and numeric references are read as the characters
 * they stand for, so `&quot;x&quot;` is a quotation. In a block that changes, text
 * is written back as Unicode characters, with `& < >` escaped and, by default, a
 * no-break space as `&nbsp;` (so it stays visible in source); use UTF-8. Any other
 * entity (`&copy;`, `&euro;`) is kept as it was.
 *
 * Not done: the `lang` attribute is not read (pass `lang`), and a tag is not told
 * from text by a real HTML parser, only by a tokenizer: malformed markup is left
 * alone rather than repaired.
 *
 * `nbsp` (a `TypographyConfig` field, read by this mode only) is how a no-break space is written in
 * a block that changes: `entity` (`&nbsp;`, the default) or the character.
 */
export type HtmlOptions = ModeOptions;

/** Stands for an inline element while a block's text is typeset. */
const UNIT = '\uFFFC';
/** Stands for an entity that is kept as it was. */
const ENTITY = '\uE004';

const TOKEN_SOURCE =
  '<!--[\\s\\S]*?-->|<![^>]*>|<\\?[\\s\\S]*?\\?>|<(\\/?)([A-Za-z][^\\s/>]*)((?:"[^"]*"|\'[^\']*\'|[^\'">])*)>';

const NAMED: Record<string, string> = {
  quot: '"',
  apos: "'",
  amp: '&',
  lt: '<',
  gt: '>',
  nbsp: NBSP,
  ndash: '–',
  mdash: '—',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‘',
  rsquo: '’',
  bdquo: '„',
  sbquo: '‚',
  lsaquo: '‹',
  rsaquo: '›',
  // Printable signs the rules act on or bind to (5 €, 20 °C, © 2026): read as the character and,
  // in a block that changes, written as it.
  euro: '€',
  copy: '©',
  reg: '®',
  trade: '™',
  deg: '°',
  times: '×',
  minus: '−',
  plusmn: '±',
  sect: '§',
  para: '¶',
  frac12: '½',
  frac14: '¼',
  frac34: '¾',
};

/** A character that is invisible or a control: a numeric reference to one is kept as written. */
function isInvisible(code: number): boolean {
  return (
    code < 0x20 ||
    (code >= 0x7f && code <= 0x9f) ||
    code === 0xad ||
    (code >= 0x200b && code <= 0x200f) ||
    (code >= 0x2028 && code <= 0x202e) ||
    (code >= 0x2060 && code <= 0x2064) ||
    code === 0xfeff
  );
}

function decode(text: string, kept: string[]): string {
  return text.replace(
    /&(#[xX][0-9a-fA-F]+|#\d+|[A-Za-z][A-Za-z0-9]*);/g,
    (entity, body: string) => {
      if (body.startsWith('#')) {
        const code = /^#[xX]/.test(body)
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
        const valid = code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff);
        if (valid && !isInvisible(code)) return String.fromCodePoint(code);
      } else if (NAMED[body] !== undefined) {
        return NAMED[body];
      }
      kept.push(entity);
      return ENTITY;
    },
  );
}

function encode(text: string, nbsp: 'entity' | 'char'): string {
  const escaped = text
    .replace(/&(?=[#A-Za-z])/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return nbsp === 'entity' ? escaped.replaceAll(NBSP, '&nbsp;') : escaped;
}

type Piece = { text: string } | { unit: string };

function setRun(run: Piece[], options: ModeOptions, nbsp: 'entity' | 'char'): string {
  const original = run.map((p) => ('text' in p ? p.text : p.unit)).join('');
  const units = run.filter((p): p is { unit: string } => 'unit' in p).map((p) => p.unit);
  const kept: string[] = [];
  const breaks: string[] = [];
  const joined = run
    .map((p) =>
      'unit' in p
        ? UNIT
        : decode(p.text, kept).replace(/[ \t]*\r?\n[ \t\r\n]*/g, (gap) => {
            breaks.push(gap);
            return '\n';
          }),
    )
    .join('');
  // Nothing to typeset between two tags.
  if (!/\S/.test(joined.replaceAll(UNIT, ''))) return original;
  const { text: formatted, keep } = typesetBlock(joined, options);
  if (formatted === joined) return original;
  const pieces = formatted.split(UNIT);
  // A rule that lost or added a placeholder cannot be mapped back: keep the block as it came.
  if (
    pieces.length !== units.length + 1 ||
    (formatted.match(/\n/g) ?? []).length !== breaks.length ||
    (formatted.match(new RegExp(ENTITY, 'g')) ?? []).length !== kept.length
  ) {
    return original;
  }
  keep();
  let at = 0;
  let key = 0;
  return pieces
    .map((piece, i) => `${encode(piece, nbsp)}${units[i] ?? ''}`)
    .join('')
    .replace(/\n/g, () => breaks[at++] ?? '\n')
    .replace(new RegExp(ENTITY, 'g'), () => kept[key++] ?? '');
}

export function typesetHtml(html: string, options: HtmlOptions = {}): string {
  const token = new RegExp(TOKEN_SOURCE, 'g');
  let out = '';
  let run: Piece[] = [];
  const flush = () => {
    if (run.length) out += setRun(run, options, options.nbsp ?? 'entity');
    run = [];
  };
  let pos = 0;
  for (let m = token.exec(html); m; m = token.exec(html)) {
    if (m.index > pos) run.push({ text: html.slice(pos, m.index) });
    pos = m.index + m[0].length;
    const [raw, closing, name = '', rest = ''] = m;
    if (!name) {
      // A comment, a doctype or a processing instruction.
      if (raw.startsWith('<!--')) {
        run.push({ unit: raw });
      } else {
        flush();
        out += raw;
      }
      continue;
    }
    const tag = name.toLowerCase();
    const opaque = !closing && !rest.endsWith('/') && (RAW_BLOCK.has(tag) || RAW_INLINE.has(tag));
    if (opaque) {
      // Everything up to the matching close tag is not ours; no close tag means the rest of the document.
      const end = new RegExp(`</${tag}\\s*>`, 'i').exec(html.slice(pos));
      const stop = end ? pos + end.index + end[0].length : html.length;
      const chunk = html.slice(m.index, stop);
      pos = stop;
      token.lastIndex = stop;
      if (RAW_BLOCK.has(tag)) {
        flush();
        out += chunk;
      } else {
        run.push({ unit: chunk });
      }
    } else if (BLOCK.has(tag)) {
      flush();
      out += raw;
    } else {
      run.push({ unit: raw });
    }
  }
  if (pos < html.length) run.push({ text: html.slice(pos) });
  flush();
  return out;
}

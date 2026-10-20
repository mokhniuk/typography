import { type ModeOptions, typesetBlock } from '../core';

/**
 * Typesets the prose of a Markdown document and leaves its structure and code as
 * they were. Untouched: fenced and indented code, inline code, front matter, raw
 * HTML (a line that starts with a tag, and inline tags), link and image targets,
 * reference definitions, footnote markers, backslash escapes, entities, thematic
 * breaks and table separator rows. The marker at the start of a line (`#`, `>`,
 * `-`, `1.`) is kept, and the text after it is typeset.
 *
 * A paragraph is typeset as a whole, line breaks included, so a quotation can run
 * over a wrapped line and pair across a link or an emphasis. A paragraph that
 * needs no change comes back byte for byte, and so does the whitespace of every
 * line (trailing spaces that make a hard break, indentation).
 *
 * Not done: a list nested four spaces deep is read as indented code and left as
 * it was (use two), and the `lang` of the document is not read from front matter
 * (pass `lang`).
 */
export type MarkdownOptions = ModeOptions;

/** Stands for a piece of inline syntax while a paragraph's text is typeset. */
const UNIT = '￼';

const INLINE = new RegExp(
  [
    // A backslash escape: `\-` must not become a dash, nor `\"` a quotation.
    '\\\\[!-/:-@\\[-`{-~]',
    // A code span: a run of backticks, anything, the same run.
    '(`+)[\\s\\S]*?[^`]\\1(?!`)',
    // A raw inline tag, an autolink or a comment.
    '<\\/?[A-Za-z][^<>]*>|<!--[\\s\\S]*?-->',
    // The target of a link or an image, `](url "title")`, a reference `][id]`, a footnote `[^1]`.
    '\\]\\((?:[^()\\\\]|\\\\.|\\([^()]*\\))*\\)',
    '\\]\\[[^\\]]*\\]',
    '\\[\\^[^\\]]+\\]',
    // An entity.
    '&(?:#[xX]?[0-9A-Fa-f]+|[A-Za-z][A-Za-z0-9]*);',
  ].join('|'),
  'g',
);

const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
const BREAK = /^\s{0,3}(?:([-*_=])(?:\s*\1){2,})\s*$/;
const TABLE_RULE = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/;
const DEFINITION = /^\s{0,3}\[[^\]]+\]:\s/;
const INDENTED = /^(?: {4}|\t)/;
/** The first line of a raw HTML block: a comment, a block-level tag, or a line that is one tag and nothing else. */
const HTML_BLOCK =
  /^\s{0,3}(?:<!--|<\/?(?:address|article|aside|blockquote|details|dialog|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|iframe|li|main|nav|ol|p|pre|script|section|style|summary|table|tbody|td|tfoot|th|thead|tr|ul)(?:\s|\/?>|$)|<[A-Za-z][^<>]*>\s*$)/i;
/** What opens a line before its text: quote marks, a list marker, a task box, a heading. */
const PREFIX =
  /^(\s{0,3}(?:>[ \t]?)*[ \t]*(?:(?:[-*+]|\d{1,9}[.)])[ \t]+(?:\[[ xX]\][ \t]+)?|#{1,6}[ \t]+)?)/;
const OPENS_BLOCK = /(?:[-*+]|\d{1,9}[.)]|#{1,6})[ \t]+(?:\[[ xX]\][ \t]+)?$/;

type Entry = { prefix: string; content: string; tail: string; eol: string };

function setParagraph(entries: Entry[], options: ModeOptions): string {
  const original = entries.map((e) => e.prefix + e.content + e.tail + e.eol).join('');
  const units: string[] = [];
  const joined = entries
    .map((e) =>
      e.content.replace(INLINE, (unit) => {
        units.push(unit);
        return UNIT;
      }),
    )
    .join('\n');
  if (!/\S/.test(joined.replaceAll(UNIT, ''))) return original;
  const { text: formatted, keep } = typesetBlock(joined, options);
  if (formatted === joined) return original;
  const lines = formatted.split('\n');
  const slots = formatted.split(UNIT).length - 1;
  // A rule that lost or added a placeholder or a line cannot be mapped back: keep the paragraph as it came.
  if (lines.length !== entries.length || slots !== units.length) return original;
  keep();
  let next = 0;
  return lines
    .map((line, i) => {
      const e = entries[i];
      const restored = line.replace(/￼/g, () => units[next++] ?? '');
      return `${e?.prefix ?? ''}${restored}${e?.tail ?? ''}${e?.eol ?? ''}`;
    })
    .join('');
}

export function typesetMarkdown(markdown: string, options: MarkdownOptions = {}): string {
  const parts = markdown.split(/(\r?\n)/);
  let out = '';
  let paragraph: Entry[] = [];
  let open = true;
  const flush = () => {
    if (paragraph.length) out += setParagraph(paragraph, options);
    paragraph = [];
    open = true;
  };
  let fence: string | null = null;
  let htmlBlock = false;
  let frontMatter = parts[0]?.trim() === '---';
  for (let i = 0; i < parts.length; i += 2) {
    const text = parts[i] ?? '';
    const eol = parts[i + 1] ?? '';
    const verbatim = (): boolean => {
      if (frontMatter) {
        if (i > 0 && /^(?:---|\.\.\.)\s*$/.test(text)) frontMatter = false;
        return true;
      }
      if (fence) {
        const mark = FENCE.exec(text)?.[1];
        if (
          mark &&
          mark[0] === fence[0] &&
          mark.length >= fence.length &&
          !/\S/.test(text.replace(FENCE, ''))
        ) {
          fence = null;
        }
        return true;
      }
      if (htmlBlock) {
        if (!/\S/.test(text)) htmlBlock = false;
        return true;
      }
      if (HTML_BLOCK.test(text)) {
        htmlBlock = true;
        return true;
      }
      const opens = FENCE.exec(text);
      if (opens) {
        fence = opens[1] ?? null;
        return true;
      }
      return (
        !/\S/.test(text) ||
        BREAK.test(text) ||
        (text.includes('-') && TABLE_RULE.test(text) && /[|]/.test(text)) ||
        DEFINITION.test(text) ||
        (INDENTED.test(text) && paragraph.length === 0)
      );
    };
    if (verbatim()) {
      flush();
      out += text + eol;
      continue;
    }
    const prefix = PREFIX.exec(text)?.[1] ?? '';
    const body = text.slice(prefix.length);
    const content = body.replace(/\s+$/, '');
    const tail = body.slice(content.length);
    // A list marker or a heading starts a paragraph of its own; a heading is only ever one line.
    if (OPENS_BLOCK.test(prefix) || !open) flush();
    paragraph.push({ prefix, content, tail, eol });
    open = !/#{1,6}[ \t]+$/.test(prefix);
  }
  flush();
  return out;
}

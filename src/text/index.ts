import { type ModeOptions, typesetBlock } from '../core';

/**
 * Typesets plain text a paragraph at a time. Paragraphs are separated by blank
 * lines, and each opens a block (so a Ukrainian dialogue dash is read at the start
 * of every paragraph, not only of the file). Line breaks, indentation, trailing
 * spaces and the blank lines between paragraphs are kept exactly; a paragraph that
 * needs no change comes back byte for byte.
 */
export type TextOptions = ModeOptions;

function setParagraph(paragraph: string, options: ModeOptions): string {
  const parts = paragraph.split(/(\r?\n)/);
  const lines: { lead: string; content: string; tail: string; eol: string }[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const text = parts[i] ?? '';
    const lead = /^[ \t]*/.exec(text)?.[0] ?? '';
    const content = text.slice(lead.length).replace(/[ \t]+$/, '');
    lines.push({
      lead,
      content,
      tail: text.slice(lead.length + content.length),
      eol: parts[i + 1] ?? '',
    });
  }
  const joined = lines.map((l) => l.content).join('\n');
  if (!/\S/.test(joined)) return paragraph;
  const { text: formatted, keep } = typesetBlock(joined, options);
  if (formatted === joined) return paragraph;
  const out = formatted.split('\n');
  // A rule that added or lost a line cannot be mapped back: keep the paragraph as it came.
  if (out.length !== lines.length) return paragraph;
  keep();
  return out
    .map((line, i) => `${lines[i]?.lead ?? ''}${line}${lines[i]?.tail ?? ''}${lines[i]?.eol ?? ''}`)
    .join('');
}

export function typesetText(text: string, options: TextOptions = {}): string {
  return text
    .split(/(\r?\n[ \t]*\r?\n(?:[ \t]*\r?\n)*)/)
    .map((part, i) => (i % 2 ? part : setParagraph(part, options)))
    .join('');
}

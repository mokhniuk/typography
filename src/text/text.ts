import { type PackModeOptions, typesetBlock } from '../core/typography.ts';

function setParagraph(paragraph: string, options: PackModeOptions): string {
  const parts = paragraph.split(/(\r?\n)/);
  const lines: { lead: string; content: string; tail: string; eol: string }[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const text = parts[i] ?? '';
    const lead = /^[ \t]*/.exec(text)?.[0] ?? '';
    // Backward scan: the regex `/[ \t]+$/` was tried from every space of a long run (quadratic).
    let end = text.length;
    while (end > lead.length && (text[end - 1] === ' ' || text[end - 1] === '\t')) end--;
    const content = text.slice(lead.length, end);
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

/** The mode body: `options.lang` is a pack (the package entry resolves a code first). */
export function typesetText(text: string, options: PackModeOptions): string {
  return text
    .split(/(\r?\n[ \t]*\r?\n(?:[ \t]*\r?\n)*)/)
    .map((part, i) => (i % 2 ? part : setParagraph(part, options)))
    .join('');
}

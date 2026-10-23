import { describe, expect, test } from 'bun:test';
import { NBSP } from '../core/index.ts';
import { type MarkdownOptions, typesetMarkdown } from './index.ts';

const m = (md: string, options?: MarkdownOptions) =>
  typesetMarkdown(md, options).replaceAll(NBSP, '~');

describe('typesetMarkdown', () => {
  test('typesets a heading and keeps its marker', () => {
    expect(m('# He said "hi" - and left\n')).toBe('# He said «hi»~— and~left\n');
  });

  test('a quotation pairs across emphasis, a link and a wrapped line; the link target is kept', () => {
    expect(
      m('The "quote *with* [the link](https://x.y/1-2 "t - u")" runs on\nover the line - ok.\n'),
    ).toBe('The~«quote *with* [the~link](https://x.y/1-2 "t - u")» runs on\nover the~line~— ok.\n');
  });

  test('leaves inline code and escapes alone', () => {
    expect(m('Run `a -> b` now... and \\- keep \\"this\\".')).toBe(
      'Run `a -> b` now… and \\- keep \\"this\\".',
    );
  });

  test('leaves fenced code, indented code and front matter alone', () => {
    expect(m('```sh\necho "a" - b\n```\n\nAfter...')).toBe('```sh\necho "a" - b\n```\n\nAfter…');
    expect(m('    indented "code" - x\n\nafter "p"\n')).toBe(
      '    indented "code" - x\n\nafter «p»\n',
    );
    expect(m('---\ntitle: "x - y"\n---\n\nBody "z".\n')).toBe(
      '---\ntitle: "x - y"\n---\n\nBody «z».\n',
    );
  });

  test('leaves table separators and thematic breaks alone, and typesets the cells', () => {
    expect(m('| x | y |\n|---|---|\n| x - y | "q" |\n')).toBe(
      '| x | y |\n|---|---|\n| x~— y | «q» |\n',
    );
    expect(m('a - b\n\n---\n\nc - d\n')).toBe('a~— b\n\n---\n\nc~— d\n');
  });

  test('typesets list items and quote lines, each keeping its marker', () => {
    expect(m('- one "a"\n- two - b\n  continued "c"\n\n> quoted "d"\n> more - e\n')).toBe(
      '- one «a»\n- two~— b\n  continued «c»\n\n> quoted «d»\n> more~— e\n',
    );
  });

  test('keeps a hard break and trailing spaces', () => {
    expect(m('Text  \nhard break "x"\n')).toBe('Text  \nhard break «x»\n');
  });

  test('leaves raw HTML lines, inline tags, footnotes, entities and definitions alone', () => {
    expect(
      m(
        'See [ref][1] and [^1] <b>"x"</b> &amp; "y" <https://a.b/c-d>.\n\n[1]: https://x.y/"a"-b\n',
      ),
    ).toBe(
      'See [ref][1] and [^1] <b>«x»</b> &amp; «y» <https://a.b/c-d>.\n\n[1]: https://x.y/"a"-b\n',
    );
    expect(m('<div class="x">\n"raw" - html\n</div>\n')).toBe(
      '<div class="x">\n"raw" - html\n</div>\n',
    );
  });

  test('a document that needs no change comes back byte for byte', () => {
    const md = '# Title\n\nPlain text, «done».\n\n- a\n- b\r\n\n```\ncode\n```\n';
    expect(typesetMarkdown(md)).toBe(md);
  });

  test('uses the language and register it is given', () => {
    // An em dash opens dialogue; a hyphen at the start of a line is a list marker in Markdown.
    expect(m('— Привіт, - сказав він.', { lang: 'uk', register: 'literary' })).toBe(
      '—~Привіт,~— сказав він.',
    );
    expect(m('- Привіт', { lang: 'uk', register: 'literary' })).toBe('- Привіт');
  });

  test('a raw HTML block is left alone up to the next blank line', () => {
    expect(m('<div>\n"raw" - html\n</div>\n\nthen "text"\n')).toBe(
      '<div>\n"raw" - html\n</div>\n\nthen «text»\n',
    );
  });

  test('a pre, script, style or textarea block is left alone to its closing tag, blank lines included', () => {
    expect(m('<pre>\nkeep "this" -> raw\n\nalso "this" -> raw\n</pre>\n\nthen "text"\n')).toBe(
      '<pre>\nkeep "this" -> raw\n\nalso "this" -> raw\n</pre>\n\nthen «text»\n',
    );
    expect(m('<script>\nvar a = "x";\n\nvar b = "y";\n</script>\n"z"\n')).toBe(
      '<script>\nvar a = "x";\n\nvar b = "y";\n</script>\n«z»\n',
    );
  });

  test('a leading thematic break is not front matter', () => {
    expect(m('---\n\nA "para" -> x\n')).toBe('---\n\nA~«para»~→ x\n');
    expect(m('---\ntitle: "a"\n---\n\nA "para"\n')).toBe('---\ntitle: "a"\n---\n\nA~«para»\n');
    expect(m('---\nA "para" with no closing fence\n')).toBe(
      '---\nA~«para» with no closing fence\n',
    );
  });

  test('is idempotent', () => {
    const md = '# "a" - b\n\nx "y *z*" - 21-26 September... `c -> d`\n\n```\n"q"\n```\n';
    const once = typesetMarkdown(md);
    expect(typesetMarkdown(once)).toBe(once);
  });

  test('rules can be switched off and changes are reported', () => {
    const seen: string[] = [];
    const out = typesetMarkdown('# "x" - 1-2\n\n`"c"` and "y"\n', {
      disable: ['dash.range'],
      onChange: (c) => seen.push(c.rule),
    });
    expect(out.replaceAll(NBSP, '~')).toBe('# «x»~— 1-2\n\n`"c"` and~«y»\n');
    expect(seen).toEqual(['quote', 'quote', 'dash.sentence', 'quote', 'quote', 'space.short-word']);
  });
});

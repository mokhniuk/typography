import { describe, expect, test } from 'bun:test';
import MarkdownIt from 'markdown-it';
import { uk } from '../core/lang/uk.ts';
import { presets } from '../core/presets.ts';
import { typesetMarkdown } from '../markdown/index.ts';
import markdownItTypography from './index.ts';

const make = (options = {}, html = false) =>
  new MarkdownIt({ html }).use(markdownItTypography, options);
const render = (source: string, options = {}, html = false) => make(options, html).render(source);

describe('markdown-it plugin', () => {
  test('typesets the text of a paragraph and a heading', () => {
    expect(render('# "Title" - sub\n\nHe said "hi" - ok.')).toBe(
      '<h1>“Title” — sub</h1>\n<p>He said “hi” — ok.</p>\n',
    );
  });

  test('a quotation pairs across a link and emphasis', () => {
    expect(render('He said "go [there](/x) *now*" ok.')).toContain(
      '“go <a href="/x">there</a> <em>now</em>”',
    );
  });

  test('code, fences, raw HTML and URLs are left as they were', () => {
    const html = render(
      '`a -> b` and <b>"x"</b> and [l](/a-b "t")\n\n```\n"q" -> r\n```\n',
      {},
      true,
    );
    expect(html).toContain('<code>a -&gt; b</code>');
    expect(html).toContain('&quot;q&quot; -&gt; r');
    expect(html).toContain('<b>“x”</b>');
    expect(html).toContain('href="/a-b"');
    expect(html).toContain('title="t"');
  });

  test('an escaped quote stays as it was typed', () => {
    expect(render('say \\"hi\\"')).toBe('<p>say &quot;hi&quot;</p>\n');
  });

  test('takes the same options as the other modes: a code, a pack, a preset', () => {
    expect(render('Він сказав "привіт"', { lang: 'uk' })).toContain('«привіт»');
    expect(render('Він сказав "привіт"', { lang: uk })).toContain('«привіт»');
    expect(render('He said "hi"', presets.book)).toContain('‘hi’');
    expect(() => render('x', { lang: 'xx' })).toThrow(/lang is/);
  });

  test('gives what typesetMarkdown gives for plain paragraphs', () => {
    const source = 'He said "hi" - and left... 21-26 September.';
    const plain = new MarkdownIt().render(typesetMarkdown(source, {}));
    expect(render(source)).toBe(plain);
  });

  test('a second run changes nothing', () => {
    const once = make().render('He said "hi" - and left...');
    const text = once.replace(/^<p>|<\/p>\n$/g, '');
    expect(make().render(text)).toBe(once);
  });
});

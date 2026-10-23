import { describe, expect, test } from 'bun:test';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { NBSP } from '../core/index.ts';
import rehypeTypography, { type RehypeOptions } from './index.ts';

const fromHtml = (html: string, options?: RehypeOptions) =>
  String(
    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeTypography, options)
      .use(rehypeStringify)
      .processSync(html),
  ).replaceAll(NBSP, '~');

const fromMarkdown = (md: string, options?: RehypeOptions) =>
  String(
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeTypography, options)
      .use(rehypeStringify)
      .processSync(md),
  ).replaceAll(NBSP, '~');

describe('rehypeTypography', () => {
  test('typesets the text of a block', () => {
    expect(fromHtml('<p>He said "hi" - and left.</p>')).toBe('<p>He said “hi”~— and~left.</p>');
  });

  test('a quotation pairs across inline elements', () => {
    expect(fromHtml('<p>"See <a href="/x?a=1-2">the <em>docs</em></a> now"</p>')).toBe(
      '<p>“See <a href="/x?a=1-2">the <em>docs</em></a> now”</p>',
    );
  });

  test('leaves code, pre, attributes and data-typography="off" alone', () => {
    expect(
      fromHtml(
        '<p>wait... <code>a -> b</code></p><pre>"x" - y</pre><p data-typography="off">"y" - z</p><a title="a - b" href="/1-2">x</a>',
      ),
    ).toBe(
      '<p>wait… <code>a -> b</code></p><pre>"x" - y</pre><p data-typography="off">"y" - z</p><a title="a - b" href="/1-2">x</a>',
    );
  });

  test('works on a Markdown pipeline, code kept', () => {
    expect(fromMarkdown('# "Title" - sub\n\nRun `a -> b` and "see [the docs](/x)".\n')).toBe(
      '<h1>“Title”~— sub</h1>\n<p>Run <code>a -> b</code> and~“see <a href="/x">the~docs</a>”.</p>',
    );
  });

  test('the lang attribute sets the language of its subtree', () => {
    expect(fromHtml('<p>"a" <span lang="de">"b"</span> <span lang="xx">"c"</span></p>')).toBe(
      '<p>“a” <span lang="de">»b«</span> <span lang="xx">“c”</span></p>',
    );
    expect(fromHtml('<div lang="uk-UA"><p>- Привіт</p></div>', { register: 'literary' })).toBe(
      '<div lang="uk-UA"><p>—~Привіт</p></div>',
    );
  });

  test('takes the language, register and disabled rules, and reports changes', () => {
    const seen: string[] = [];
    const out = fromHtml('<p>"x" - 1-2</p>', {
      lang: 'de',
      disable: ['dash.range'],
      onChange: (c) => seen.push(c.rule),
    });
    expect(out).toBe('<p>»x«~– 1-2</p>');
    expect(seen).toEqual(['quote', 'quote', 'dash.sentence']);
  });

  test('a block that needs no change is not touched', () => {
    const html = '<div><p>Plain text.</p><p>“Done” - fine</p></div>';
    const seen: string[] = [];
    fromHtml(html, { onChange: (c) => seen.push(c.rule) });
    expect(seen).toEqual(['dash.sentence']);
  });

  test('is idempotent', () => {
    const once = fromHtml('<p>"a <a href="#">b</a> c" - 21-26... <code>x -> y</code></p>');
    expect(fromHtml(once.replaceAll('~', NBSP))).toBe(once);
  });
});

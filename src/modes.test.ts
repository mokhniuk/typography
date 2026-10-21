import { describe, expect, test } from 'bun:test';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import { typesetHtml } from './html';
import rehypeTypography from './rehype';

/**
 * The HTML mode reads markup with a tokenizer of its own; the rehype mode walks a tree a real parser
 * built. On well-formed HTML the text they set must be the same: a difference is a tokenizer bug, or
 * a block boundary one of them reads differently.
 */
const viaRehype = (html: string) =>
  String(
    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeTypography, { lang: 'en' })
      .use(rehypeStringify)
      .processSync(html),
  );

/** The text of a fragment: tags out, entities read, so the two serialisations compare. */
const textOf = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&euro;', '€')
    .replaceAll('&copy;', '©')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    // The HTML mode keeps the indentation of a source line, the rehype mode collapses it; neither shows.
    .replace(/[ \t]+/g, ' ');

const CASES = [
  '<p>He said "hi" - and left... 21-26 September</p>',
  '<p>"See <a href="/x?a=1-2">the docs</a> now" - ok</p>',
  '<p>A "quote <em>with</em> emphasis" and <strong>"another"</strong>.</p>',
  '<p>Line one "a<br>b" line two</p>',
  '<p>Code <code>x -> y "q"</code> stays, "text" moves</p>',
  '<pre>"raw" -> raw</pre><p>"set" -> set</p>',
  '<p>R&amp;D "x" &lt;tag&gt; 5 &euro; 10%</p>',
  '<p>"one" <!-- "comment" --> "two"</p>',
  '<p>Tom &amp; Jerry + rock</p>',
  '<ul><li>"a" - b</li><li>"c" - d</li></ul>',
  '<div><p>"outer"</p><blockquote><p>"inner" - x</p></blockquote></div>',
  '<p>Prof. Dr. K. Słoboda z. B. Nr. 5 e.V. (c) 2026 Read more -></p>',
  '<h1>"Title" - subtitle</h1><p>Body "text".</p>',
  '<p><span>"split</span> <span>quote"</span> ok</p>',
  '<p>"a" <img src="x" alt="not text"> "b"</p>',
  '<table><tr><td>"cell" - 1-2</td><td>10:00-12:00</td></tr></table>',
  '<p>5\'10" tall and a 2" pipe "quoted"</p>',
  '<p>\n  "indented"\n  text - here\n</p>',
];

describe('the HTML mode and the rehype mode set the same text', () => {
  for (const html of CASES) {
    test(html, () => {
      expect(textOf(typesetHtml(html, { lang: 'en', nbsp: 'char' }))).toBe(textOf(viaRehype(html)));
    });
  }
});

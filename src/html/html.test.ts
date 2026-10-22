import { describe, expect, test } from 'bun:test';
import { type HtmlOptions, typesetHtml } from './index';

/** A no-break space is written `&nbsp;`; show it as ~ so the expectations read. */
const h = (html: string, options?: HtmlOptions) =>
  typesetHtml(html, options).replaceAll('&nbsp;', '~');

describe('typesetHtml', () => {
  test('typesets the text of a block', () => {
    expect(h('<p>He said "hi" - and left.</p>')).toBe('<p>He said «hi»~— and~left.</p>');
  });

  test('an operator between two words is bound, written as &amp; or as a raw &', () => {
    expect(h('<p>Tom &amp; Jerry</p>')).toBe('<p>Tom~&amp;~Jerry</p>');
    expect(h('<p>Tom & Jerry</p>')).toBe('<p>Tom~&amp;~Jerry</p>');
    expect(typesetHtml('<p>Tom &amp; Jerry</p>', { nbsp: 'char' })).toBe(
      '<p>Tom\u00a0&amp;\u00a0Jerry</p>',
    );
    expect(h('<p>rock + roll</p>')).toBe('<p>rock~+~roll</p>');
  });

  test('a quotation pairs across an inline element', () => {
    expect(h('<p>"See <a href="/x?a=1-2">Name</a> speak"</p>')).toBe(
      '<p>«See <a href="/x?a=1-2">Name</a> speak»</p>',
    );
  });

  test('a lone mark reads the text past a tag beside it', () => {
    // A page whose changed marks are wrapped (`<ins>“</ins>`) is set again by the site build.
    expect(h('<p>said; <ins>“</ins>now</p>', { lang: 'en', quoteStyle: 'us' })).toBe(
      '<p>said; <ins>“</ins>now</p>',
    );
    expect(h('<p>said; <ins>"</ins>now</p>', { lang: 'en', quoteStyle: 'us' })).toBe(
      '<p>said; <ins>“</ins>now</p>',
    );
    expect(h('<p><em>now</em>" said</p>', { lang: 'en', quoteStyle: 'us' })).toBe(
      '<p><em>now</em>” said</p>',
    );
  });

  test('leaves code, pre, script and style exactly as they were', () => {
    const html =
      '<p>wait... <code>a -> b</code></p><pre>"x" - y</pre>' +
      '<script>var s = "a" - 1;</script><style>a{content:"x"}</style>';
    expect(h(html)).toBe(
      '<p>wait… <code>a -> b</code></p><pre>"x" - y</pre>' +
        '<script>var s = "a" - 1;</script><style>a{content:"x"}</style>',
    );
  });

  test('leaves attributes and comments alone, and typesets the text inside a link', () => {
    expect(h('<a href="https://x.y/1-2" title="a - b">x - y</a>')).toBe(
      '<a href="https://x.y/1-2" title="a - b">x~— y</a>',
    );
    expect(h('<!-- "x" - y --><p>"z"</p>')).toBe('<!-- "x" - y --><p>«z»</p>');
  });

  test('an unclosed code element keeps the rest of the document as it was', () => {
    expect(h('<p>run <code>never closed "x" - y')).toBe('<p>run <code>never closed "x" - y');
  });

  test('reads entities as the characters they stand for, and keeps the others', () => {
    expect(h('<p>&quot;x&quot; &mdash; &copy; 2026 AT&amp;T 5 &lt; 6</p>')).toBe(
      '<p>«x»~— ©~2026~AT&amp;T 5 &lt; 6</p>',
    );
  });

  test('a block that needs no change comes back byte for byte', () => {
    const html = '<div>\n  <p>Plain text &amp; «more».</p>\n  <p>«Done»</p>\n</div>';
    expect(typesetHtml(html)).toBe(html);
  });

  test('keeps the line breaks and indentation inside a block that changes', () => {
    expect(h('<p>\n    “a\n    b” - c\n  </p>')).toBe('<p>\n    «a\n    b»~— c\n  </p>');
  });

  test('uses the language and register it is given', () => {
    expect(h('<p>- Привіт, - сказав він.</p>', { lang: 'uk', register: 'literary' })).toBe(
      '<p>—~Привіт,~— сказав він.</p>',
    );
    expect(h('<p>"x"</p>', { lang: 'de' })).toBe('<p>»x«</p>');
  });

  test('can write a no-break space as the character', () => {
    expect(typesetHtml('<p>a - b</p>', { nbsp: 'char' })).toBe('<p>a — b</p>');
  });

  test('a line break ends the block; an arrow keeps its no-break space inside a link', () => {
    expect(typesetHtml('<p>a<br>"b" - c</p>', { nbsp: 'char' })).toBe('<p>a<br>«b» — c</p>');
    expect(h('<a href="/x">Read more -></a>')).toBe('<a href="/x">Read more~→</a>');
  });

  test('addresses in the text are left alone', () => {
    expect(h('<p>see https://a.b/1-2 - ok</p>')).toBe('<p>see https://a.b/1-2~— ok</p>');
  });

  test('a named entity for a printable sign is read by the rules and written as its character', () => {
    expect(h('<p>5 &euro; and 10 &deg;C, (c) 2026 &copy; 2026</p>')).toBe(
      '<p>5~€ and~10~°C, ©~2026 ©~2026</p>',
    );
  });

  test('is idempotent', () => {
    const html =
      '<p>"a <a href="#">b</a> c" - and 21-26 September... <code>x -> y</code></p><pre>"q"</pre>';
    const once = typesetHtml(html);
    expect(typesetHtml(once)).toBe(once);
  });

  test('rules can be switched off and changes are reported', () => {
    const seen: string[] = [];
    const out = typesetHtml('<p>"x" - 1-2</p>', {
      disable: ['dash.range'],
      onChange: (c) => seen.push(c.rule),
    });
    expect(out.replaceAll('&nbsp;', '~')).toBe('<p>«x»~— 1-2</p>');
    expect(seen).toEqual(['quote', 'quote', 'dash.sentence']);
  });

  test('a block that comes back unchanged reports nothing', () => {
    const seen: string[] = [];
    typesetHtml('<p>Plain.</p><pre>"x" - y</pre>', { onChange: (c) => seen.push(c.rule) });
    expect(seen).toEqual([]);
  });
});

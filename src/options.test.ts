import { describe, expect, test } from 'bun:test';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import { addRule, NBSP, RULES, type Rule, typographic } from './core/index.ts';
import { typesetHtml } from './html/index.ts';
import { typesetMarkdown } from './markdown/index.ts';
import rehypeTypography from './rehype/index.ts';
import { typesetText } from './text/index.ts';

/** Every mode must pass `enable` and `rules` on: a rule list that one mode drops is a silent bug. */
const shout: Rule = {
  id: 'extra.shout',
  about: 'Upper case',
  defaultOn: false,
  apply: (t) => t.replace(/\bloud\b/g, 'LOUD'),
};
const rules = addRule(RULES, shout, { last: true });
const off = { rules } as const;
const on = { rules, enable: ['extra.shout'] } as const;
const plain = (s: string) => s.replaceAll(NBSP, '~');

describe('enable and rules reach every mode', () => {
  test('typographic', () => {
    expect(typographic('so loud "x"', 'en', off)).toBe('so loud “x”');
    expect(typographic('so loud "x"', 'en', on)).toBe('so LOUD “x”');
  });

  test('text', () => {
    expect(typesetText('so loud "x"\n\nloud too', off)).toBe('so loud “x”\n\nloud too');
    expect(typesetText('so loud "x"\n\nloud too', on)).toBe('so LOUD “x”\n\nLOUD too');
  });

  test('html', () => {
    expect(typesetHtml('<p>so loud "x"</p>', off)).toBe('<p>so loud “x”</p>');
    expect(typesetHtml('<p>so loud "x"</p>', on)).toBe('<p>so LOUD “x”</p>');
  });

  test('markdown', () => {
    expect(typesetMarkdown('so loud "x"\n', off)).toBe('so loud “x”\n');
    expect(typesetMarkdown('so loud "x"\n', on)).toBe('so LOUD “x”\n');
  });

  test('rehype', () => {
    const run = (options: object) =>
      plain(
        String(
          unified()
            .use(rehypeParse, { fragment: true })
            .use(rehypeTypography, options)
            .use(rehypeStringify)
            .processSync('<p>so loud "x"</p>'),
        ),
      );
    expect(run(off)).toBe('<p>so loud “x”</p>');
    expect(run(on)).toBe('<p>so LOUD “x”</p>');
  });

  test('a bad name throws in every mode', () => {
    const bad = { rules, enable: ['nope'] };
    expect(() => typesetText('x', bad)).toThrow(/Unknown typography rule "nope"/);
    expect(() => typesetHtml('<p>x</p>', bad)).toThrow(/Unknown/);
    expect(() => typesetMarkdown('x', bad)).toThrow(/Unknown/);
  });

  test('onChange reports the custom rule', () => {
    const seen: string[] = [];
    typesetText('so loud ok', { ...on, onChange: (c) => seen.push(c.rule) });
    expect(seen).toEqual(['extra.shout']);
  });
});

describe('quoteStyle reaches every mode', () => {
  const us = { quoteStyle: 'us' } as const;
  const run = (html: string, options: object = {}) =>
    plain(
      String(
        unified()
          .use(rehypeParse, { fragment: true })
          .use(rehypeTypography, options)
          .use(rehypeStringify)
          .processSync(html),
      ),
    );

  test('typographic, text, HTML and Markdown', () => {
    expect(typographic('"x \'y\'"', 'en', us)).toBe('“x ‘y’”');
    expect(typesetText('"x"\n\n"y"', us)).toBe('“x”\n\n“y”');
    expect(typesetHtml('<p>"x \'y\' <em>z</em>"</p>', us)).toBe('<p>“x ‘y’ <em>z</em>”</p>');
    expect(typesetMarkdown('"x" and `"y"`\n', us)).toBe('“x” and `"y"`\n');
    expect(typesetText('"x"', { ...us, lang: 'de', register: 'literary' })).toBe('“x”');
  });

  test("typographic, text, HTML, Markdown and rehype with 'guillemets'", () => {
    const house = { quoteStyle: 'guillemets' } as const;
    expect(typographic('"x \'y\'"', 'en', house)).toBe('«x „y“»');
    expect(typesetText('"x"\n\n"y"', house)).toBe('«x»\n\n«y»');
    expect(typesetHtml('<p>"x \'y\' <em>z</em>"</p>', house)).toBe('<p>«x „y“ <em>z</em>»</p>');
    expect(typesetMarkdown('"x" and `"y"`\n', house)).toBe('«x» and `"y"`\n');
    expect(typesetText('"x"', { ...house, lang: 'de', register: 'literary' })).toBe('«x»');
    expect(run('<p lang="de">"x"</p>', house)).toBe('<p lang="de">«x»</p>');
  });

  test('rehype: the option sets US quotes; lang="en-US" alone does not change the default', () => {
    expect(run('<p>"x"</p>', us)).toBe('<p>“x”</p>');
    expect(run('<p lang="en-US">"x"</p>', us)).toBe('<p lang="en-US">“x”</p>');
    // <html lang="en-US"> is common: it must not change output nobody asked to change.
    expect(run('<p lang="en-US">"x"</p>')).toBe('<p lang="en-US">“x”</p>');
    expect(run('<p lang="EN-us">"x"</p>')).toBe('<p lang="EN-us">“x”</p>');
    expect(run('<p lang="en-US">"x"</p>', { quoteStyle: 'guillemets' })).toBe(
      '<p lang="en-US">«x»</p>',
    );
  });

  test('rehype: other English and other languages keep the language table', () => {
    expect(run('<p lang="en">"x"</p>')).toBe('<p lang="en">“x”</p>');
    expect(run('<p lang="en-GB">"x"</p>')).toBe('<p lang="en-GB">“x”</p>');
    expect(run('<p lang="de">"x"</p>')).toBe('<p lang="de">»x«</p>');
  });

  test('rehype: a declared language keeps the quote style option', () => {
    expect(run('<div lang="en-US"><p lang="de">"x"</p></div>')).toBe(
      '<div lang="en-US"><p lang="de">»x«</p></div>',
    );
    expect(run('<div lang="en-US"><p lang="de">"x"</p></div>', us)).toBe(
      '<div lang="en-US"><p lang="de">“x”</p></div>',
    );
  });
});

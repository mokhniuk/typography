import { describe, expect, test } from 'bun:test';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import { addRule, NBSP, RULES, type Rule, typographic } from './core';
import { typesetHtml } from './html';
import { typesetMarkdown } from './markdown';
import rehypeTypography from './rehype';
import { typesetText } from './text';

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
    expect(typographic('so loud "x"', 'en', off)).toBe('so loud «x»');
    expect(typographic('so loud "x"', 'en', on)).toBe('so LOUD «x»');
  });

  test('text', () => {
    expect(typesetText('so loud "x"\n\nloud too', off)).toBe('so loud «x»\n\nloud too');
    expect(typesetText('so loud "x"\n\nloud too', on)).toBe('so LOUD «x»\n\nLOUD too');
  });

  test('html', () => {
    expect(typesetHtml('<p>so loud "x"</p>', off)).toBe('<p>so loud «x»</p>');
    expect(typesetHtml('<p>so loud "x"</p>', on)).toBe('<p>so LOUD «x»</p>');
  });

  test('markdown', () => {
    expect(typesetMarkdown('so loud "x"\n', off)).toBe('so loud «x»\n');
    expect(typesetMarkdown('so loud "x"\n', on)).toBe('so LOUD «x»\n');
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
    expect(run(off)).toBe('<p>so loud «x»</p>');
    expect(run(on)).toBe('<p>so LOUD «x»</p>');
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

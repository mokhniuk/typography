import { describe, expect, test } from 'bun:test';
import { NBSP } from '../core';
import { type TextOptions, typesetText } from './index';

const x = (text: string, options?: TextOptions) => typesetText(text, options).replaceAll(NBSP, '~');

describe('typesetText', () => {
  test('typesets each paragraph and keeps the blank lines between them', () => {
    expect(x('He said "hi".\n\n\n  Then "bye" - and left.\n')).toBe(
      'He said «hi».\n\n\n  Then «bye»~— and left.\n',
    );
  });

  test('a quotation runs over a wrapped line, indentation and trailing spaces are kept', () => {
    expect(x('  "one\n   two"  \nthree')).toBe('  «one\n   two»  \nthree');
  });

  test('a paragraph that needs no change comes back byte for byte', () => {
    const text = 'Plain.\r\n\r\n«Done»  \r\n  indented\r\n';
    expect(typesetText(text)).toBe(text);
  });

  test('a dialogue dash is read at the start of each paragraph', () => {
    expect(x('- One\n\n- Two', { lang: 'uk', register: 'literary' })).toBe('—~One\n\n—~Two');
  });

  test('addresses and code are left alone', () => {
    expect(x('see https://a.b/1-2 - ok `x -> y`')).toBe('see https://a.b/1-2~— ok `x -> y`');
  });

  test('rules can be switched off and changes are reported', () => {
    const seen: string[] = [];
    const out = typesetText('"x" - 1-2\n\nwait...', {
      disable: ['ellipsis'],
      onChange: (c) => seen.push(c.rule),
    });
    expect(out.replaceAll(NBSP, '~')).toBe('«x»~— 1–2\n\nwait...');
    expect(seen).toContain('dash.range');
    expect(seen).not.toContain('ellipsis');
  });
});

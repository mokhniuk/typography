import { describe, expect, test } from 'bun:test';
import { NBSP } from '../core/index.ts';
import { type TextOptions, typesetText } from './index.ts';

const x = (text: string, options?: TextOptions) => typesetText(text, options).replaceAll(NBSP, '~');

describe('typesetText', () => {
  test('typesets each paragraph and keeps the blank lines between them', () => {
    expect(x('He said "hi".\n\n\n  Then "bye" - and left.\n')).toBe(
      'He said “hi”.\n\n\n  Then “bye”~— and~left.\n',
    );
  });

  test('a quotation runs over a wrapped line, indentation and trailing spaces are kept', () => {
    expect(x('  "one\n   two"  \nthree')).toBe('  “one\n   two”  \nthree');
  });

  test('a paragraph that needs no change comes back byte for byte', () => {
    const text = 'Plain.\r\n\r\n“Done”  \r\n  indented\r\n';
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
    expect(out.replaceAll(NBSP, '~')).toBe('“x”~— 1–2\n\nwait...');
    expect(seen).toContain('dash.range');
    expect(seen).not.toContain('ellipsis');
  });
});

// A long run of spaces inside a line: the trailing-space trim was a regex tried from every space (40,000
// spaces took 1.3 s). Loose on purpose: a flat ceiling about 10x the measured time.
describe('a long run of spaces inside a line', () => {
  const fastest = (text: string) => {
    let best = Number.POSITIVE_INFINITY;
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      typesetText(text);
      best = Math.min(best, performance.now() - start);
    }
    return best;
  };

  test('40,000 spaces are typeset in under 100 ms, and doubling them costs under 2.5x', () => {
    const at = (n: number) => `a${' '.repeat(n)}b`;
    typesetText(at(2000));
    const small = fastest(at(20_000));
    const large = fastest(at(40_000));
    expect(large).toBeLessThan(100);
    expect(large).toBeLessThan(Math.max(small, 2) * 2.5);
  });

  test('trailing spaces and tabs are kept, whatever the paragraph holds', () => {
    for (const text of ['', ' ', '   ', '\t \t', 'a \t ', 'a \tb \t\n  c  ', ' a ', '\n\n  \n']) {
      expect(typesetText(text)).toBe(text);
    }
  });
});

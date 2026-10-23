import { describe, expect, test } from 'bun:test';
import { diff } from './diff.ts';

describe('diff', () => {
  test('equal text is one run', () => {
    expect(diff('a b', 'a b')).toEqual([{ kind: 'same', text: 'a b' }]);
  });

  test('shows what left and what arrived', () => {
    expect(diff('say "hi" now', 'say «hi» now')).toEqual([
      { kind: 'same', text: 'say ' },
      { kind: 'del', text: '"' },
      { kind: 'ins', text: '«' },
      { kind: 'same', text: 'hi' },
      { kind: 'del', text: '"' },
      { kind: 'ins', text: '»' },
      { kind: 'same', text: ' now' },
    ]);
  });

  test('a no-break space is not a space', () => {
    expect(diff('a b', 'a b')).toEqual([
      { kind: 'same', text: 'a' },
      { kind: 'del', text: ' ' },
      { kind: 'ins', text: ' ' },
      { kind: 'same', text: 'b' },
    ]);
  });

  test('joining the runs gives back both texts', () => {
    const before = 'x - y... "z" 1-2';
    const after = 'x — y… «z» 1–2';
    const runs = diff(before, after);
    expect(
      runs
        .filter((r) => r.kind !== 'ins')
        .map((r) => r.text)
        .join(''),
    ).toBe(before);
    expect(
      runs
        .filter((r) => r.kind !== 'del')
        .map((r) => r.text)
        .join(''),
    ).toBe(after);
  });

  test('a paragraph too long for the table is still aligned change by change', () => {
    // Two changes 20 KB apart: about 5000 tokens on each side, far above the table limit.
    const filler = 'plain words here '.repeat(1200);
    const before = `(c) 2026 Company. ${filler} Brand(TM) rocks.`;
    const after = `© 2026 Company. ${filler} Brand™ rocks.`;
    const runs = diff(before, after);
    expect(runs.filter((r) => r.kind !== 'same')).toEqual([
      { kind: 'del', text: '(c)' },
      { kind: 'ins', text: '©' },
      { kind: 'del', text: '(TM)' },
      { kind: 'ins', text: '™' },
    ]);
    expect(
      runs
        .filter((r) => r.kind !== 'ins')
        .map((r) => r.text)
        .join(''),
    ).toBe(before);
    expect(
      runs
        .filter((r) => r.kind !== 'del')
        .map((r) => r.text)
        .join(''),
    ).toBe(after);
  });

  test('above the table limit a spaced dash is still one change, as the table makes it', () => {
    const filler = 'plain words here '.repeat(1200);
    const runs = diff(`${filler}a - b ${filler}c - d`, `${filler}a\u00A0— b ${filler}c\u00A0— d`);
    expect(runs.filter((r) => r.kind !== 'same')).toEqual([
      { kind: 'del', text: ' -' },
      { kind: 'ins', text: '\u00A0—' },
      { kind: 'del', text: ' -' },
      { kind: 'ins', text: '\u00A0—' },
    ]);
  });
});

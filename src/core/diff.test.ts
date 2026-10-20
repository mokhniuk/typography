import { describe, expect, test } from 'bun:test';
import { diff } from './diff';

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
});

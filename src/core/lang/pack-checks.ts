import { expect, test } from 'bun:test';
import { PACK } from './index';
import type { LangPack } from './pack';

/** The tests every pack must pass, whoever wrote it: its data is complete and in the shape the engine reads. */
export function wellFormed(pack: LangPack, file: string) {
  test(`${pack.code}: the pack is well-formed and registered`, () => {
    expect(file).toBe(`${pack.code}.test.ts`);
    expect(PACK[pack.code as keyof typeof PACK]).toBe(pack);
    expect(pack.name.length).toBeGreaterThan(0);
    expect(pack.sample.length).toBeGreaterThan(0);
    expect(typeof pack.reviewed).toBe('boolean');
    expect(Array.isArray(pack.sources)).toBe(true);
    // A pack nobody has read must say so in its notes or sources, not leave the page blank.
    if (pack.reviewed) expect(pack.sources.length).toBeGreaterThan(0);
    expect(pack.notes.length).toBeGreaterThan(0);
  });

  test(`${pack.code}: quote levels are pairs of non-empty marks`, () => {
    for (const levels of [pack.quotes, pack.literary ?? pack.quotes]) {
      expect(levels.length).toBeGreaterThan(0);
      for (const [open, close] of levels) {
        expect(open.length).toBeGreaterThan(0);
        expect(close.length).toBeGreaterThan(0);
      }
    }
  });

  test(`${pack.code}: optional data has the shape the engine reads`, () => {
    if (pack.orphans) {
      expect(pack.orphans.flags).toContain('g');
      // One capture group: the one-letter word that is kept next to the no-break space.
      expect(new RegExp(`${pack.orphans.source}|`, pack.orphans.flags).exec('')?.length).toBe(2);
    }
    for (const list of Object.values(pack.abbreviations ?? {})) {
      for (const word of list) expect(word.trim()).toBe(word);
    }
    if (pack.numbers) {
      expect(pack.numbers.group.length).toBeGreaterThan(0);
      expect(pack.numbers.decimal.length).toBeGreaterThan(0);
    }
    for (const [open, close] of pack.turnedPairs ?? []) {
      expect(open).not.toBe(close);
    }
    // Short words: two or three letters, lower case, no duplicates (the rule adds the capital form).
    const short = pack.shortWords ?? [];
    expect(new Set(short).size).toBe(short.length);
    for (const word of short) {
      expect(word).toBe(word.toLocaleLowerCase());
      expect([...word].length).toBeGreaterThan(1);
      expect([...word].length).toBeLessThan(4);
      expect(/^[\p{L}]+$/u.test(word)).toBe(true);
    }
  });
}

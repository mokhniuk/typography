import { expect, test } from 'bun:test';
import { PACK } from './index.ts';
import type { LangPack } from './pack.ts';

/** The tests every pack must pass, whoever wrote it: its data is complete and in the shape the engine reads. */
export function wellFormed(pack: LangPack, file: string) {
  test(`${pack.code}: the pack is well-formed and registered`, () => {
    expect(file).toBe(`${pack.code.toLowerCase()}.test.ts`);
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
    // A bare abbreviation is one word written without a full stop (klo, nr): the pattern adds none.
    for (const word of pack.abbreviations?.bare ?? []) {
      expect(word.length).toBeGreaterThan(0);
      expect(word).not.toMatch(/[.\s]/);
    }
    if (pack.numbers) {
      expect(pack.numbers.group.length).toBeGreaterThan(0);
      expect(pack.numbers.decimal.length).toBeGreaterThan(0);
      // `decimal` lists the accepted decimal marks, the language's own first: distinct, none a separator.
      const marks = [...pack.numbers.decimal];
      expect(new Set(marks).size).toBe(marks.length);
      for (const mark of marks) expect(pack.numbers.group).not.toContain(mark);
    }
    // The space before high punctuation: one no-break (U+00A0), narrow no-break (U+202F) or thin
    // (U+2009) space each, the characters `space.high-punctuation` also reads as a typed space.
    for (const space of Object.values(pack.highPunctuation ?? {})) {
      expect(['\u00A0', '\u202F', '\u2009']).toContain(space);
    }
    for (const [open, close] of pack.turnedPairs ?? []) {
      expect(open).not.toBe(close);
    }
    // Truncations: lower case, letters only (written without the apostrophe), no duplicates.
    const truncations = pack.truncations ?? [];
    expect(new Set(truncations).size).toBe(truncations.length);
    for (const word of truncations) {
      expect(word).toBe(word.toLocaleLowerCase());
      expect(/^\p{L}+$/u.test(word)).toBe(true);
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

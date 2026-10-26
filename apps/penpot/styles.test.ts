import { describe, expect, test } from 'bun:test';
import { FakeText, fullStyle } from './fake-text.ts';
import { mapRuns, type Run } from './runs.ts';
import { applyRuns, hasMixedStyle, readRuns } from './styles.ts';

const REGULAR = fullStyle({});
const BOLD = fullStyle({ fontWeight: '700', fontVariantId: 'bold' });
const RED = fullStyle({ fills: [{ fillColor: '#ff0000', fillOpacity: 1 }] });
const ITALIC = fullStyle({ fontStyle: 'italic', fontVariantId: 'italic' });

// The spike's sample layer, as Penpot read it: two paragraphs, a bold word, a red span, an italic word.
const TEXT = 'He said "it\'s only 5 - 10 minutes..." and left.\nSecond paragraph, plain.';
const SAMPLE: Run[] = [
  { start: 0, end: 14, style: REGULAR },
  { start: 14, end: 18, style: BOLD },
  { start: 18, end: 19, style: REGULAR },
  { start: 19, end: 25, style: RED },
  { start: 25, end: 55, style: REGULAR },
  { start: 55, end: 64, style: ITALIC },
  { start: 64, end: 72, style: REGULAR },
];

describe('readRuns', () => {
  test('finds the runs of the spike sample, newline included, and nothing else', () => {
    expect(readRuns(new FakeText(TEXT, SAMPLE))).toEqual(SAMPLE);
  });

  test('uniform text is one run, empty text none', () => {
    expect(readRuns(new FakeText('abc', [{ start: 0, end: 3, style: BOLD }]))).toEqual([
      { start: 0, end: 3, style: BOLD },
    ]);
    expect(readRuns(new FakeText('', []))).toEqual([]);
  });

  test('a long text with three runs is read in far fewer range reads than it has characters', () => {
    const text = new FakeText('x'.repeat(10_000), [
      { start: 0, end: 4000, style: REGULAR },
      { start: 4000, end: 4010, style: BOLD },
      { start: 4010, end: 10_000, style: REGULAR },
    ]);
    expect(readRuns(text)).toHaveLength(3);
    expect(text.rangeReads).toBeLessThan(100);
  });
});

describe('hasMixedStyle', () => {
  test('is true when only the fills differ, false for uniform text', () => {
    expect(hasMixedStyle(new FakeText('abcd', [{ start: 0, end: 2, style: REGULAR }, { start: 2, end: 4, style: RED }]))).toBe(true);
    expect(hasMixedStyle(new FakeText('abcd', [{ start: 0, end: 4, style: RED }]))).toBe(false);
    expect(hasMixedStyle(new FakeText('', []))).toBe(false);
  });
});

describe('applyRuns after the setter flattened the text', () => {
  const change = (edit: { start: number; end: number; text: string }) => {
    const text = new FakeText(TEXT, SAMPLE);
    const expected = mapRuns(SAMPLE, [edit]);
    text.characters = TEXT.slice(0, edit.start) + edit.text + TEXT.slice(edit.end);
    expect(readRuns(text)).toHaveLength(1);
    return { text, expected };
  };

  test.each([
    ['a same-length replace', { start: 8, end: 9, text: '“' }],
    ['an insertion after the bold word', { start: 18, end: 18, text: '!!' }],
    ['a shrink inside the red run', { start: 20, end: 23, text: '–' }],
    ['a deletion across two runs', { start: 16, end: 22, text: '' }],
  ])('%s: the runs read back as expected', (_name, edit) => {
    const { text, expected } = change(edit);
    applyRuns(text, expected);
    expect(readRuns(text)).toEqual(expected);
  });

  test('only the properties that differ from the first run are written, and not for a run equal to it', () => {
    const { text, expected } = change({ start: 8, end: 9, text: '“' });
    applyRuns(text, expected);
    expect(text.writes.filter((w) => w.startsWith('19-25:'))).toEqual(['19-25:fills']);
    expect(text.writes.some((w) => w.startsWith('0-'))).toBe(false);
  });

  test('a font property that did not change is not written, because writing the font resets the variant', () => {
    const { text, expected } = change({ start: 8, end: 9, text: '“' });
    applyRuns(text, expected);
    expect(text.writes.filter((w) => w.startsWith('14-18:'))).toEqual(['14-18:fontVariantId', '14-18:fontWeight']);
    expect(text.writes.filter((w) => w.startsWith('55-64:'))).toEqual(['55-64:fontVariantId', '55-64:fontStyle']);
  });

  test('a run in another font gets the font first and its variant after', () => {
    const SERIF = fullStyle({ fontId: 'gfont-lora', fontFamily: 'lora', fontVariantId: 'bold', fontWeight: '700' });
    const runs: Run[] = [
      { start: 0, end: 4, style: REGULAR },
      { start: 4, end: 8, style: SERIF },
    ];
    const text = new FakeText('abcdefgh', runs);
    text.characters = 'abcdefgh';
    applyRuns(text, runs);
    expect(readRuns(text)).toEqual(runs);
    expect(text.writes).toEqual(['4-8:fontId', '4-8:fontFamily', '4-8:fontVariantId', '4-8:fontWeight']);
  });

  test('a setter that throws propagates', () => {
    const { text, expected } = change({ start: 8, end: 9, text: '“' });
    text.failOn('fills');
    expect(() => applyRuns(text, expected)).toThrow();
  });

  test('an empty list of runs writes nothing', () => {
    const text = new FakeText('', []);
    applyRuns(text, []);
    expect(text.writes).toEqual([]);
  });
});

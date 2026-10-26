import { describe, expect, test } from 'bun:test';
import { FakeText, fullStyle } from './fake-text.ts';
import { formatLayer } from './layer.ts';
import type { Run } from './runs.ts';
import { readRuns } from './styles.ts';

const REGULAR = fullStyle({});
const BOLD = fullStyle({ fontWeight: '700', fontVariantId: 'bold' });
const RED = fullStyle({ fills: [{ fillColor: '#ff0000', fillOpacity: 1 }] });
const ITALIC = fullStyle({ fontStyle: 'italic', fontVariantId: 'italic' });
const OPTIONS = { lang: 'en' } as const;

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
const wordsOf = (text: FakeText, style: Run['style']): string[] =>
  readRuns(text)
    .filter((run) => JSON.stringify(run.style) === JSON.stringify(style))
    .map((run) => text.characters.slice(run.start, run.end));

describe('formatLayer', () => {
  test('a layer with one style is changed with a single write of the text', () => {
    const text = new FakeText('Say "hi"', [{ start: 0, end: 8, style: BOLD }]);
    expect(formatLayer(text, OPTIONS)).toEqual({ kind: 'changed', spots: 2 });
    expect(text.characters).toBe('Say “hi”');
    expect(readRuns(text)).toEqual([{ start: 0, end: 8, style: BOLD }]);
    expect(text.writes).toEqual([]);
  });

  test('a layer with mixed styles keeps every styled run on its words', () => {
    const text = new FakeText(TEXT, SAMPLE);
    const result = formatLayer(text, OPTIONS);
    expect(result.kind).toBe('changed');
    expect(text.characters).toContain('“it’s');
    expect(text.characters).toContain('…');
    expect(wordsOf(text, BOLD)).toEqual(['only']);
    expect(wordsOf(text, ITALIC)).toEqual(['paragraph']);
    const [red] = wordsOf(text, RED);
    expect(red?.startsWith('5')).toBe(true);
    expect(red?.endsWith('10')).toBe(true);
  });

  test('text the engine leaves alone is unchanged and nothing is written', () => {
    const text = new FakeText('plain words', [
      { start: 0, end: 5, style: BOLD },
      { start: 5, end: 11, style: REGULAR },
    ]);
    expect(formatLayer(text, OPTIONS)).toEqual({ kind: 'unchanged' });
    expect(readRuns(text)).toHaveLength(2);
    expect(text.writes).toEqual([]);
  });

  test('an empty layer is unchanged', () => {
    const text = new FakeText('', []);
    expect(formatLayer(text, OPTIONS)).toEqual({ kind: 'unchanged' });
    expect(text.writes).toEqual([]);
  });

  test('an emoji keeps its style and the runs after it stay aligned', () => {
    const before = 'He said "😀 yes" ok';
    const text = new FakeText(before, [
      { start: 0, end: 9, style: REGULAR },
      { start: 9, end: 11, style: BOLD },
      { start: 11, end: before.length, style: REGULAR },
    ]);
    expect(formatLayer(text, OPTIONS).kind).toBe('changed');
    expect(text.characters).toBe('He said “😀 yes” ok');
    expect(wordsOf(text, BOLD)).toEqual(['😀']);
  });

  test('a styles setter that throws puts the original text and runs back', () => {
    const text = new FakeText(TEXT, SAMPLE);
    text.failOn('fills');
    expect(formatLayer(text, OPTIONS)).toEqual({ kind: 'skipped', reason: 'styles' });
    expect(text.characters).toBe(TEXT);
    expect(readRuns(text)).toEqual(SAMPLE);
  });

  test('a text setter that throws leaves the layer as it was', () => {
    const text = new FakeText(TEXT, SAMPLE);
    text.failOn('characters');
    expect(formatLayer(text, OPTIONS)).toEqual({ kind: 'skipped', reason: 'text' });
    expect(text.characters).toBe(TEXT);
    expect(readRuns(text)).toEqual(SAMPLE);
  });

  test('a layer whose uniform text cannot be set is skipped', () => {
    const text = new FakeText('Say "hi"', [{ start: 0, end: 8, style: BOLD }]);
    text.failOn('characters');
    expect(formatLayer(text, OPTIONS)).toEqual({ kind: 'skipped', reason: 'text' });
  });

  test('a restore that fails too is reported as unrestored', () => {
    const text = new FakeText(TEXT, SAMPLE);
    text.failOn('fills', 2);
    expect(formatLayer(text, OPTIONS)).toEqual({ kind: 'unrestored' });
  });
});

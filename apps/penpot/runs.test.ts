import { describe, expect, test } from 'bun:test';
import { toEdits } from '../figma/edits.ts';
import { mapRuns, type Run, sameStyle } from './runs.ts';

const REGULAR = { fontWeight: '400', fills: [{ fillColor: '#000000' }] };
const BOLD = { fontWeight: '700', fills: [{ fillColor: '#000000' }] };
const RED = { fontWeight: '400', fills: [{ fillColor: '#ff0000' }] };
const run = (start: number, end: number, style = REGULAR): Run => ({ start, end, style });

// `He said "it's only 5 - 10 minutes..." and left.`: "only" is bold, "5 - 10" is red.
const SAMPLE = [run(0, 14), run(14, 18, BOLD), run(18, 19), run(19, 25, RED), run(25, 47)];

describe('mapRuns', () => {
  test('a same-length replace inside a run leaves the runs alone', () => {
    expect(mapRuns(SAMPLE, [{ start: 8, end: 9, text: '“' }])).toEqual(SAMPLE);
  });

  test('an insertion right after a bold run is bold and moves what follows', () => {
    expect(mapRuns(SAMPLE, [{ start: 18, end: 18, text: '!!' }])).toEqual([
      run(0, 14),
      run(14, 20, BOLD),
      run(20, 21),
      run(21, 27, RED),
      run(27, 49),
    ]);
  });

  test('an insertion at 0 takes the style of the first run', () => {
    expect(mapRuns([run(0, 3, BOLD), run(3, 6)], [{ start: 0, end: 0, text: 'ab' }])).toEqual([
      run(0, 5, BOLD),
      run(5, 8),
    ]);
  });

  test('a replace across two runs gives the new text the style of the last replaced character', () => {
    expect(mapRuns([run(0, 4, BOLD), run(4, 8)], [{ start: 2, end: 6, text: 'x' }])).toEqual([
      run(0, 2, BOLD),
      run(2, 5),
    ]);
  });

  test('a shrink inside a run shortens it and moves what follows', () => {
    expect(mapRuns(SAMPLE, [{ start: 20, end: 23, text: '–' }])).toEqual([
      run(0, 14),
      run(14, 18, BOLD),
      run(18, 19),
      run(19, 23, RED),
      run(23, 45),
    ]);
  });

  test('a run whose characters are all deleted disappears and equal neighbours merge', () => {
    expect(mapRuns([run(0, 2), run(2, 4, BOLD), run(4, 6)], [{ start: 2, end: 4, text: '' }])).toEqual([
      run(0, 4),
    ]);
  });

  test('edits from toEdits, last first, keep every styled run on its words', () => {
    const before = 'He said "it\'s only 5 - 10 minutes..." and left.';
    const after = 'He said “it’s only 5–10 minutes…” and left.';
    const runs = mapRuns(SAMPLE, toEdits(before, after));
    expect(runs.at(-1)?.end).toBe(after.length);
    const word = (r: Run) => after.slice(r.start, r.end);
    expect(runs.filter((r) => sameStyle(r.style, BOLD)).map(word)).toEqual(['only']);
    expect(runs.filter((r) => sameStyle(r.style, RED)).map(word)).toEqual(['5–10']);
  });

  test('offsets count UTF-16 units, so an emoji is two, and it takes the style before it', () => {
    const runs = [run(0, 2), run(2, 6, BOLD)];
    expect(mapRuns(runs, [{ start: 2, end: 2, text: '😀' }])).toEqual([run(0, 4), run(4, 8, BOLD)]);
  });

  test('no edits returns the runs unchanged, and no runs stay none', () => {
    expect(mapRuns(SAMPLE, [])).toEqual(SAMPLE);
    expect(mapRuns([], [])).toEqual([]);
  });
});

describe('sameStyle', () => {
  test('compares by value, so a fills array of equal objects is equal', () => {
    expect(sameStyle({ fills: [{ fillColor: '#000000' }] }, { fills: [{ fillColor: '#000000' }] })).toBe(true);
    expect(sameStyle(REGULAR, RED)).toBe(false);
  });
});

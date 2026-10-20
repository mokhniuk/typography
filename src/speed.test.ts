import { expect, test } from 'bun:test';
import { longText } from '../scripts/corpus';
import { typographic } from './core';

/** Fastest of a few runs: a load spike slows one run, rarely all of them. */
function best(text: string, runs = 3): number {
  let fastest = Number.POSITIVE_INFINITY;
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    typographic(text, 'en');
    fastest = Math.min(fastest, performance.now() - start);
  }
  return fastest;
}

// Loose on purpose: it catches a pass gone quadratic or a regex that costs 10x, not a 20% drift.
// Absolute times are not asserted because they move 2x between runs on one machine.
test('typesetting 4x the text takes under 8x the time (linear, not quadratic)', () => {
  const small = longText(150_000);
  const large = longText(600_000);
  typographic(small, 'en'); // warm the regex caches
  expect(best(large)).toBeLessThan(best(small) * 8);
});

test('1 MB of English prose is typeset in under 2 s, a ceiling about 8x the measured time', () => {
  expect(best(longText(1_000_000), 2)).toBeLessThan(2000);
});

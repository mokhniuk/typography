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

// Inch marks with no closing quote: the straight pair is a hand scan (`pairStraight` in core/quotes.ts)
// because a regex read on to the end of the text from every inch mark (1.2 s per MB with 35 of them).
// 40 KB with 3000 inch marks takes about 1 ms; a scan that reads to the end from each one takes over 1 s.
test('40 KB of inch marks with no closing quote is typeset in under 100 ms (no re-scan per mark)', () => {
  const unit = 'A 5" pipe fits a 2" valve. ';
  const text = unit.repeat(Math.ceil(40_000 / unit.length));
  typographic(text, 'en'); // warm the regex caches
  expect(best(text)).toBeLessThan(100);
});

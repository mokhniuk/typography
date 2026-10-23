import { expect, test } from 'bun:test';
import { typesetHtml } from './index.ts';

/** Fastest of three runs, with a floor so that a sub-millisecond timing cannot make the ratio noisy. */
function best(text: string): number {
  let fastest = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    typesetHtml(text);
    fastest = Math.min(fastest, performance.now() - start);
  }
  return Math.max(fastest, 2);
}

// A `<` that never meets a `>` used to make the tag pattern read to the end of the input from every
// one of them (200 ms at 4 000 repeats, 800 ms at 8 000). Loose on purpose: doubling the input must
// not much more than double the time (quadratic is 4x).
test('unclosed tags are read once: 2x the input takes under 2.5x the time', () => {
  typesetHtml('<a '.repeat(500)); // warm the regex caches
  const small = best('<a '.repeat(4000));
  const large = best('<a '.repeat(8000));
  expect(large).toBeLessThan(small * 2.5);
});

test('unclosed tags after a closed one are read once', () => {
  expect(best(`<b>x</b>${'<a '.repeat(8000)}`)).toBeLessThan(50);
});

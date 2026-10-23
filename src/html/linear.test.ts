import { expect, test } from 'bun:test';
import { typesetHtml } from './index.ts';

/** Fastest of three runs. */
function best(text: string): number {
  let fastest = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    typesetHtml(text);
    fastest = Math.min(fastest, performance.now() - start);
  }
  return fastest;
}

// A `<` that never meets a `>` used to make the tag pattern read to the end of the input from every
// one of them (200 ms at 4 000 repeats, 800 ms at 8 000). Loose on purpose: doubling the input must
// not much more than double the time (quadratic is 4x); the 10 ms floor keeps a loaded machine from
// failing a run that takes a few milliseconds.
test('unclosed tags are read once: 2x the input takes under 2.5x the time', () => {
  typesetHtml('<a '.repeat(500)); // warm the regex caches
  const small = best('<a '.repeat(4000));
  const large = best('<a '.repeat(8000));
  expect(large).toBeLessThan(Math.max(small, 10) * 2.5);
});

test('unclosed tags after a closed one are read once', () => {
  expect(best(`<b>x</b>${'<a '.repeat(8000)}`)).toBeLessThan(50);
});

// One lone quote before the last `>` made the attribute part of every `<` read up to that quote and
// fail (180 ms at 4 000 repeats, 920 ms at 8 000).
test('unclosed tags before a lone quote and a `>` are read once', () => {
  expect(best(`${'<a '.repeat(8000)}">`)).toBeLessThan(50);
  expect(best(`${'<a '.repeat(8000)}'>`)).toBeLessThan(50);
});

// A run of `<a<a<a...` with no space is one tag name read from every `<` in it (`[^\s/>]*`), and the
// attributes after it failed at a lone quote (1 s at 8 000 repeats, 4.3 s at 16 000).
test('a run of `<a<a...` before a lone quote and a `>` is read once', () => {
  expect(best(`${'<a'.repeat(8000)} x">`)).toBeLessThan(50);
});

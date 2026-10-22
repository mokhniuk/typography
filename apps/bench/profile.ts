/**
 * Where this package spends its time: each rule on its own over 100 KB and 1 MB of
 * English, its share of the total, and one text with and without paragraph breaks.
 * `bun apps/bench/profile.ts`. Timings vary between runs by up to 2x on a busy machine.
 */
import { RULES } from '../../src/core/rules';
import { shield } from '../../src/core/zones';
import { typesetText } from '../../src/text';
import { typographic } from '../../src/core';
import { longText } from '../../scripts/corpus';

const PARA =
  'He said "we\'re here" - and left... The lab runs 21-26 September, 10:00-12:00, Prof. Dr. K. Smith opens it (c) 2026. ' +
  'It is 5 km from a quiet stone house in the old town, and the "memory walk" starts there at 9:30 - bring a coat. ';
const rep = (n: number, sep = '') => (PARA + sep).repeat(Math.ceil(n / PARA.length));
const ctx = { lang: 'en', register: 'display', quoteStyle: 'language', blockStart: true } as const;

// The zone scan (code spans, addresses, emails set aside before the rules run) is timed as a row of its
// own, and the second text is the fuzz corpus the differential check uses: prose has no backtick or
// address, so a cost in the scan does not show on it (300 ms per MB went unseen that way until 0.12.0).
const texts: [string, (size: number) => string][] = [
  ['prose, one paragraph', rep],
  ['corpus (scripts/corpus.ts)', (size) => longText(size)],
];
for (const [label, make] of texts) for (const size of [100_000, 1_000_000]) {
  const text = make(size);
  const rows: [string, number][] = [];
  let total = 0;
  let shieldBest = Infinity;
  let out = text;
  for (let i = 0; i < 3; i++) {
    const t = performance.now();
    [out] = shield(text);
    shieldBest = Math.min(shieldBest, performance.now() - t);
  }
  rows.push(['shield (zones)', shieldBest]);
  total += shieldBest;
  for (const rule of RULES) {
    let best = Infinity, next = out;
    for (let i = 0; i < 3; i++) {
      const t = performance.now();
      next = rule.apply(out, ctx);
      best = Math.min(best, performance.now() - t);
    }
    rows.push([rule.id, best]);
    total += best;
    out = next;
  }
  console.log(`\n== per rule, ${size / 1000} KB ${label} (sum ${total.toFixed(0)} ms)`);
  for (const [id, ms] of rows.sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${id.padEnd(22)} ${ms.toFixed(1)} ms  ${((ms / total) * 100).toFixed(0)}%`);
}

// the same 1 MB as realistic paragraphs (~1 KB each, blank line between) and as one block
const one = rep(1_000_000);
const paras = rep(1_000_000, '\n\n').replace(/ \n\n/g, '\n\n');
const time = (f: () => unknown) => { let b = Infinity; for (let i = 0; i < 3; i++) { const t = performance.now(); f(); b = Math.min(b, performance.now() - t); } return b; };
console.log('\n1 MB as one paragraph      :', time(() => typesetText(one)).toFixed(0), 'ms');
console.log('1 MB as ~0.4 KB paragraphs :', time(() => typesetText(paras)).toFixed(0), 'ms');
console.log('typographic() direct       :', time(() => typographic(one)).toFixed(0), 'ms');

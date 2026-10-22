/**
 * Time per call on a short input (a sentence to a few paragraphs), which is what a
 * page does; `bun apps/bench/run.ts` measures large text. `bun apps/bench/latency.ts`.
 */
import { TOOLS } from './tools';
const PARA = 'He said "we\'re here" - and left... The lab runs 21-26 September, 10:00-12:00, Prof. Dr. K. Smith opens it (c) 2026. It is 5 km from a quiet stone house in the old town, and the "memory walk" starts there at 9:30 - bring a coat. ';
const sizes = [200, 1000, 5000];
for (const t of TOOLS) {
  if (t.name === 'typography-engine literary' || t.name === 'typograf +nbsp') continue;
  const row: string[] = [];
  for (const n of sizes) {
    const input = PARA.repeat(Math.ceil(n / PARA.length)).slice(0, n);
    const iters = t.name === 'richtypo' ? 20 : 300;
    for (let i = 0; i < 20; i++) t.run(input, 'en', 'text');
    const s = performance.now();
    for (let i = 0; i < iters; i++) t.run(input, 'en', 'text');
    row.push(`${(((performance.now() - s) / iters) * 1000).toFixed(0)} µs`);
  }
  console.log(t.name.padEnd(20), row.join('  '));
}

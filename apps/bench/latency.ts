/**
 * Time per call on a short input (a sentence to a few paragraphs), which is what a
 * page does; `bun apps/bench/run.ts` measures large text. `bun apps/bench/latency.ts`.
 */
import { short } from './inputs';
import { TOOLS } from './tools';
const sizes = [200, 1000, 5000];
for (const t of TOOLS) {
  if (t.name === 'typography-engine literary' || t.name === 'typograf +nbsp') continue;
  const row: string[] = [];
  for (const n of sizes) {
    const input = short(n);
    const iters = t.name === 'richtypo' ? 20 : 300;
    for (let i = 0; i < 20; i++) t.run(input, 'en', 'text');
    const s = performance.now();
    for (let i = 0; i < iters; i++) t.run(input, 'en', 'text');
    row.push(`${(((performance.now() - s) / iters) * 1000).toFixed(0)} µs`);
  }
  console.log(t.name.padEnd(20), row.join('  '));
}

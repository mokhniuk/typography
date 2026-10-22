/**
 * Runs one tool's bundle (see `bundle.ts`) in a fresh process and prints one JSON line. Built to plain
 * JavaScript by `engines.ts` so that Bun, Node and Deno load the same code:
 * `<engine> out/driver.js <load|speed|memory> <bundle> [size]`.
 */
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { short, spread, text } from './inputs';

type Run = (s: string) => string;
const [mode, bundle, size] = process.argv.slice(2);
const now = () => performance.now();

// Bun and Deno give the peak resident set in bytes, Node in kilobytes.
const g = globalThis as { Bun?: unknown; Deno?: unknown };
const peakBytes = () => process.resourceUsage().maxRSS * (g.Bun || g.Deno ? 1 : 1024);

const t0 = now();
const { run } = (await import(pathToFileURL(bundle ?? '').href)) as { run: Run };
const importMs = now() - t0;

function timed(input: string, times: number): number[] {
  const ms: number[] = [];
  for (let i = 0; i < times; i++) {
    const s = now();
    run(input);
    ms.push(now() - s);
  }
  return ms;
}

let result: Record<string, number | null>;
if (mode === 'load') {
  const input = short(1000);
  const s = now();
  run(input);
  const firstMs = now() - s;
  timed(input, 50);
  result = { importMs, firstMs, warmUs: spread(timed(input, 300)).median * 1000 };
} else if (mode === 'speed') {
  const input = short(1000);
  timed(input, 20);
  const latency = spread(timed(input, 300));
  // Judged from 10 KB as if it grew with the square of the size, the worst of the tools seen: one run
  // at 100 KB when that would take over a second, none when it would take over a minute.
  const guess = (timed(text(10_000), 1)[0] ?? 0) * 100;
  const big = guess > 60_000 ? null : spread(timed(text(100_000), guess > 1000 ? 1 : 7));
  result = {
    latencyUs: latency.median * 1000,
    latencyP95Us: latency.p95 * 1000,
    medianMs: big?.median ?? null,
    p95Ms: big?.p95 ?? null,
  };
} else {
  const input = text(Number(size));
  const before = peakBytes();
  run(input);
  result = { beforeMB: before / 2 ** 20, peakMB: peakBytes() / 2 ** 20 };
}
console.log(JSON.stringify(result));

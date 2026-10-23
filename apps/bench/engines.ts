/**
 * The same bundles (see `bundle.ts`) under Bun (JavaScriptCore), Node (V8) and Deno (V8), each run in
 * a fresh process by `driver.ts`: load time, speed and memory. Bun alone is not enough: browsers and most
 * servers run V8, and a tool's ranking can change with the engine. `bun apps/bench/engines.ts`.
 */
import { fileURLToPath } from 'node:url';
import { buildAll, ENTRIES, OUT } from './bundle';
import { spread } from './inputs';

type Engine = { name: string; cmd: string[] };

const versionOf = (cmd: string[]) => {
  // An engine that is not installed is left out of the tables.
  let r: ReturnType<typeof Bun.spawnSync>;
  try {
    r = Bun.spawnSync({ cmd, stdout: 'pipe', stderr: 'pipe' });
  } catch {
    return null;
  }
  return r.success ? (/\d+\.\d+\.\d+/.exec(String(r.stdout))?.[0] ?? '?') : null;
};

const ENGINES: (Engine & { version: string })[] = [
  { name: 'Bun', cmd: ['bun'], version: Bun.version },
  { name: 'Node', cmd: ['node'], version: versionOf(['node', '--version']) },
  { name: 'Deno', cmd: ['deno', 'run', '-A'], version: versionOf(['deno', '--version']) },
].filter((e): e is Engine & { version: string } => e.version !== null);

type Outcome = Record<string, number | null> | 'timeout' | 'error';

function drive(engine: Engine, args: string[], timeoutMs: number): Outcome {
  const r = Bun.spawnSync({
    cmd: [...engine.cmd, `${OUT}driver.js`, ...args],
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: timeoutMs,
  });
  if (r.exitedDueToTimeout) return 'timeout';
  try {
    return JSON.parse(r.stdout.toString().trim().split('\n').at(-1) ?? '');
  } catch {
    return 'error';
  }
}

const median = (xs: number[]) => spread(xs).median;
const ms = (n: number | null | undefined) =>
  n === null || n === undefined ? '–' : n < 10 ? `${n.toFixed(1)} ms` : `${Math.round(n)} ms`;
const us = (n: number | null | undefined) =>
  n === null || n === undefined ? '–' : n >= 1000 ? ms(n / 1000) : `${Math.round(n)} µs`;
const failed = (o: Outcome, limit: number) =>
  o === 'timeout' ? `> ${limit / 1000} s` : o === 'error' ? 'error' : null;

const LOAD_RUNS = 5;
const SPEED_TIMEOUT = 120_000;
const MEMORY_SIZE = 1_000_000;
const MEMORY_TIMEOUT = 20_000;

export async function enginesSection(paths?: Map<string, string>): Promise<string[]> {
  const built = paths ?? (await buildAll());
  const result = await Bun.build({ entrypoints: [fileURLToPath(new URL('./driver.ts', import.meta.url))], outdir: OUT, target: 'node', format: 'esm' });
  if (!result.success) throw new AggregateError(result.logs, 'bundling the driver failed');

  const load: string[][] = [];
  const speed: string[][] = [];
  const memory: string[][] = [];
  for (const entry of ENTRIES.filter((e) => e.runs)) {
    const bundle = built.get(entry.name);
    if (!bundle) continue;
    const l = [entry.name];
    const s1 = [entry.name];
    const s2: string[] = [];
    const m = [entry.name];
    for (const engine of ENGINES) {
      const runs = Array.from({ length: LOAD_RUNS }, () => drive(engine, ['load', bundle], 60_000));
      const ok = runs.filter((r): r is Record<string, number> => typeof r === 'object');
      if (ok.length) {
        l.push(ms(median(ok.map((r) => r.importMs ?? Number.NaN))), ms(median(ok.map((r) => r.firstMs ?? Number.NaN))));
      } else l.push(failed(runs[0] ?? 'error', 60_000) ?? 'error', '–');

      const s = drive(engine, ['speed', bundle], SPEED_TIMEOUT);
      if (typeof s === 'object') {
        s1.push(`${us(s.latencyUs)} (${us(s.latencyP95Us)})`);
        s2.push(
          s.medianMs === null ? 'not run' : s.medianMs === s.p95Ms ? ms(s.medianMs) : `${ms(s.medianMs)} (${ms(s.p95Ms)})`,
        );
      } else {
        const why = failed(s, SPEED_TIMEOUT) ?? 'error';
        s1.push(why);
        s2.push(why);
      }

      // A tool too slow for 1 MB is measured at 100 KB, and the cell says so.
      let mem = drive(engine, ['memory', bundle, String(MEMORY_SIZE)], MEMORY_TIMEOUT);
      let at = '';
      if (mem === 'timeout') {
        mem = drive(engine, ['memory', bundle, String(MEMORY_SIZE / 10)], MEMORY_TIMEOUT);
        at = ` at ${MEMORY_SIZE / 10_000} KB`;
      }
      m.push(
        typeof mem === 'object'
          ? `${Math.round(mem.peakMB ?? 0)} MB (+${Math.round((mem.peakMB ?? 0) - (mem.beforeMB ?? 0))})${at}`
          : (failed(mem, MEMORY_TIMEOUT) ?? 'error'),
      );
    }
    load.push(l);
    speed.push([...s1, ...s2]);
    memory.push(m);
  }

  const names = ENGINES.map((e) => e.name);
  const row = (cells: string[]) => `| ${cells.join(' | ')} |`;
  const rule = (n: number) => `|${Array.from({ length: n }, () => '---').join('|')}|`;
  return [
    '## Engines',
    '',
    `The bundles of [Bundle size](#bundle-size) run under ${ENGINES.map((e) => `${e.name} (${e.version})`).join(', ')}, each measurement in a fresh process (\`apps/bench/driver.ts\`). Bun runs JavaScriptCore, as Safari does; Node and Deno run V8, as Chrome does. Timings are on one machine and move between runs; read the order, not the digits.`,
    '',
    '### Load',
    '',
    `Time to import the bundle, and the first call on 1 KB of English (it includes the engine compiling the code it meets): what a command-line run or a cold serverless start pays once. Median of ${LOAD_RUNS} processes.`,
    '',
    row(['Tool', ...names.flatMap((n) => [`${n} import`, `${n} first call`])]),
    rule(1 + names.length * 2),
    ...load.map(row),
    '',
    '### Speed',
    '',
    'A warm call on 1 KB of English (median of 300, p95 in brackets): what a page pays per paragraph. Then 100 KB in one piece (median of 7, p95 in brackets); a tool whose 10 KB run predicts more than a second at 100 KB (as if it grew with the square of the size) is run once, with no p95, and "not run" when it predicts more than a minute.',
    '',
    row(['Tool', ...names.map((n) => `${n} 1 KB`), ...names.map((n) => `${n} 100 KB`)]),
    rule(1 + names.length * 2),
    ...speed.map(row),
    '',
    '### Memory',
    '',
    `Peak resident memory of the process that typesets ${MEMORY_SIZE / 1e6} MB of English in one call, and in brackets what that call added to the peak (the engine, the bundle and the input are counted before it). A tool that takes more than ${MEMORY_TIMEOUT / 1000} s is measured at ${MEMORY_SIZE / 10_000} KB instead, and stopped again after ${MEMORY_TIMEOUT / 1000} s.`,
    '',
    row(['Tool', ...names]),
    rule(1 + names.length),
    ...memory.map(row),
    '',
  ];
}

if (import.meta.main) console.log((await enginesSection()).join('\n'));

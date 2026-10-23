import { writeFileSync } from 'node:fs';
import { cpus, platform, release } from 'node:os';
import { htmlOf, longText } from '../../scripts/corpus';
import { type Lang, NBSP } from '../../src/core';
import { buildAll } from './bundle';
import { CASES, STABILITY } from './cases';
import { depsSection } from './deps';
import { enginesSection } from './engines';
import { spread, text } from './inputs';
import { probesSection } from './probes';
import { sizeSection } from './size';
import { type Format, TOOLS, type Tool } from './tools';

/**
 * Runs every tool over every case, prints a summary and writes apps/bench/RESULTS.md.
 * `bun apps/bench/run.ts`. Nothing here is tuned to a tool: a case is a check anyone can
 * read in cases.ts, and every output is in the results so a check can be contested.
 */
type Outcome = { state: 'pass' | 'fail' | 'n/a'; output: string | null };

const show = (s: string | null) =>
  s === null
    ? '–'
    : s.replaceAll(NBSP, '~').replaceAll(String.fromCharCode(0x202f), '~').replace(/\n/g, '⏎');

function evaluate(tool: Tool, c: (typeof CASES)[number]): Outcome {
  if (c.only && !c.only.includes(tool.name)) return { state: 'n/a', output: null };
  let output: string | null;
  try {
    output = tool.run(c.input, c.lang, c.format ?? 'text');
  } catch (error) {
    return { state: 'fail', output: `ERROR ${String(error).slice(0, 80)}` };
  }
  if (output === null) return { state: 'n/a', output: null };
  return { state: c.pass(output, c.input) ? 'pass' : 'fail', output };
}

type Row = {
  id: string;
  group: string;
  lang: Lang;
  input: string;
  expect: string;
  by: Record<string, Outcome>;
};
const rows: Row[] = CASES.map((c) => ({
  id: c.id,
  group: c.group,
  lang: c.lang,
  input: c.input,
  expect: c.expect,
  by: Object.fromEntries(TOOLS.map((t) => [t.name, evaluate(t, c)])),
}));

// Stability: a second pass must change nothing.
for (const s of STABILITY) {
  const by: Record<string, Outcome> = {};
  for (const tool of TOOLS) {
    try {
      const once = tool.run(s.input, s.lang, 'text');
      if (once === null) {
        by[tool.name] = { state: 'n/a', output: null };
        continue;
      }
      const twice = tool.run(once, s.lang, 'text');
      by[tool.name] = {
        state: twice === once ? 'pass' : 'fail',
        output: twice === once ? once : `${once}  →  ${twice}`,
      };
    } catch (error) {
      by[tool.name] = { state: 'fail', output: `ERROR ${String(error).slice(0, 80)}` };
    }
  }
  rows.push({
    id: s.id,
    group: 'Stability',
    lang: s.lang,
    input: s.input,
    expect: 'running it again on its own output changes nothing',
    by,
  });
}

const groups = [...new Set(rows.map((r) => r.group))];
const score = (tool: Tool, subset: Row[]) => {
  const scored = subset.filter((r) => r.by[tool.name]?.state !== 'n/a');
  return {
    pass: scored.filter((r) => r.by[tool.name]?.state === 'pass').length,
    of: scored.length,
  };
};
const cell = (tool: Tool, subset: Row[]) => {
  const { pass, of } = score(tool, subset);
  return of ? `${pass}/${of}` : '–';
};

// Speed on growing text. A tool is not run at a size it would take minutes to reach, judged from
// how it scaled so far (some tools slow down faster than the text grows).
const SIZES = [10_000, 100_000, 1_000_000];
const BUDGET_MS = 15_000;
type Timing = { size: number; ms: number | null; slowest?: number; skipped?: number };

/** Median and slowest of a few runs; one run when a run is expected to take seconds. */
function time(tool: Tool, input: string, lang: Lang, format: Format, expectMs: number): Timing | null {
  const runs = expectMs > 2000 ? 1 : input.length >= 1_000_000 ? 3 : 7;
  const ms: number[] = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    try {
      if (tool.run(input, lang, format) === null) return null;
    } catch {
      return null;
    }
    ms.push(performance.now() - start);
  }
  const { median } = spread(ms);
  return runs > 1 ? { size: input.length, ms: median, slowest: Math.max(...ms) } : { size: input.length, ms: median };
}

const perf = TOOLS.map((tool) => {
  const timings: Timing[] = [];
  let last: { size: number; ms: number } | null = null;
  for (const size of SIZES) {
    const input = text(size);
    let expect = 0;
    if (last) {
      // Assume it grows with the square of the size, the worst of the tools seen.
      const guess = last.ms * (input.length / last.size) ** 2;
      const linear = last.ms * (input.length / last.size);
      if (linear > BUDGET_MS || (guess > BUDGET_MS * 10 && last.ms > 100)) {
        timings.push({ size, ms: null, skipped: Math.round(guess / 1000) });
        continue;
      }
      expect = linear;
    }
    const t = time(tool, input, 'en', 'text', expect);
    if (!t || t.ms === null) {
      timings.push({ size, ms: null });
      continue;
    }
    timings.push({ ...t, size });
    last = { size: input.length, ms: t.ms };
  }
  return { name: tool.name, timings };
});

const msOf = (t: Timing) =>
  t.ms === null
    ? t.skipped
      ? `not run (~${t.skipped} s)`
      : '–'
    : `${Math.round(t.ms)} ms${t.slowest !== undefined ? ` (${Math.round(t.slowest)})` : ''}`;

// The same 100 KB in other languages and as HTML. A tool too slow for 100 KB of English is not run.
const BY_INPUT: { label: string; lang: Lang; format: Format; make: () => string }[] = [
  { label: 'en text', lang: 'en', format: 'text', make: () => longText(100_000, 1, 'en') },
  { label: 'de text', lang: 'de', format: 'text', make: () => longText(100_000, 1, 'de') },
  { label: 'fr text', lang: 'fr', format: 'text', make: () => longText(100_000, 1, 'fr') },
  { label: 'uk text', lang: 'uk', format: 'text', make: () => longText(100_000, 1, 'uk') },
  {
    label: 'en HTML',
    lang: 'en',
    format: 'html',
    make: () => {
      const paragraphs = longText(100_000, 1, 'en').split(/\n+/);
      return paragraphs.map((p, i) => htmlOf(p, i)).join('\n');
    },
  },
];
const inputs = BY_INPUT.map((b) => ({ ...b, input: b.make() }));
const byInput = TOOLS.map((tool) => {
  const at100 = perf.find((p) => p.name === tool.name)?.timings[1];
  return {
    name: tool.name,
    cells: inputs.map((b) => {
      if (!at100 || at100.ms === null) return 'not run';
      const t = time(tool, b.input, b.lang, b.format, at100.ms);
      return t ? msOf(t) : '–';
    }),
  };
});

const [size, deps, engines, probes] = await (async () => {
  const paths = await buildAll();
  return [await sizeSection(paths), await depsSection(), await enginesSection(paths), probesSection()];
})();

const lines: string[] = [];
const out = (s = '') => lines.push(s);

out('# Typography benchmark');
out();
out(
  `Generated by \`bun apps/bench/run.ts\` on ${new Date().toISOString().slice(0, 10)}. Every case, its check and every tool's output is below, so any check can be contested; the checks are in \`apps/bench/cases.ts\`.`,
);
out();
out(
  "**Read this with care.** The cases were written by the author of one of the tools. They are checks of what is right (a German quotation is „…“ or »…«; an ISO date is not a range), not of one tool's house style, and a tool's default that differs from them is reported as a failure (none of this package's defaults does since 0.15.0, when English became `“…”`). They cover what typography tools claim to do, not everything a typographer cares about.",
);
out();
out('| Tool | Version | Configuration |');
out('|---|---|---|');
for (const t of TOOLS) out(`| ${t.name} | ${t.version} | ${t.about} |`);
out();
out('## Summary');
out();
out(
  'Passed / scored. "–" means the tool has no such feature or language (not scored); a language or format a tool does not support is not held against it.',
);
out();
out(`| Group | ${TOOLS.map((t) => t.name).join(' | ')} |`);
out(`|---|${TOOLS.map(() => '---').join('|')}|`);
for (const g of groups)
  out(
    `| ${g} | ${TOOLS.map((t) =>
      cell(
        t,
        rows.filter((r) => r.group === g),
      ),
    ).join(' | ')} |`,
  );
const scoredRows = rows.filter((r) => r.group !== 'Registers');
out(
  `| **All (without Registers)** | ${TOOLS.map((t) => `**${cell(t, scoredRows)}**`).join(' | ')} |`,
);
out();
out(
  "A language a tool does not support is not scored, so the totals compare different numbers of cases: read each tool's row against its own denominator.",
);
out();
out('## Speed');
out();
out(
  `In process under Bun ${Bun.version} on ${cpus()[0]?.model ?? 'an unknown CPU'} (${platform()} ${release()}). Timings move between runs and machines; read the order, not the digits. Under Node and Deno, see [Engines](#engines).`,
);
out();
out(
  'English text in one piece, text mode: the median of seven runs (three at 1 MB), the slowest run in brackets; a run expected to take seconds is made once. "not run" means the tool had slowed down so fast that the next size would have taken minutes (the estimate is a quadratic extrapolation).',
);
out();
out(`| Tool | ${SIZES.map((s) => `${s / 1000} KB`).join(' | ')} |`);
out(`|---|${SIZES.map(() => '---').join('|')}|`);
for (const p of perf) out(`| ${p.name} | ${p.timings.map(msOf).join(' | ')} |`);
out();
out('### Speed by input');
out();
out(
  "About 100 KB of each language's prose from `scripts/corpus.ts` (paragraphs, with a fuzz line now and then), and the English as HTML with inline elements, entities, comments and `<pre>`. \"–\" is a language or format the tool does not take; \"not run\" is a tool too slow for 100 KB of English.",
);
out();
out(`| Tool | ${BY_INPUT.map((b) => b.label).join(' | ')} |`);
out(`|---|${BY_INPUT.map(() => '---').join('|')}|`);
for (const r of byInput) out(`| ${r.name} | ${r.cells.join(' | ')} |`);
out();
for (const section of [engines, size, deps, probes]) for (const line of section) out(line);
out('## Every case');
out();
out('✓ pass, ✗ fail, – not scored. Outputs show a no-break space as `~` and a line break as `⏎`.');
for (const g of groups) {
  out();
  out(`### ${g}`);
  for (const r of rows.filter((row) => row.group === g)) {
    out();
    out(`**${r.id}** (${r.lang}): ${r.expect}`);
    out();
    out(`Input: \`${show(r.input)}\``);
    out();
    for (const t of TOOLS) {
      const o = r.by[t.name];
      if (!o) continue;
      out(
        `- ${o.state === 'pass' ? '✓' : o.state === 'fail' ? '✗' : '–'} ${t.name}: ${o.output === null ? '' : `\`${show(o.output)}\``}`,
      );
    }
  }
}

writeFileSync(new URL('./RESULTS.md', import.meta.url), `${lines.join('\n')}\n`);

console.log(`${'Group'.padEnd(26)}${TOOLS.map((t) => t.name.padEnd(18)).join('')}`);
for (const g of groups)
  console.log(
    `${g.padEnd(26)}${TOOLS.map((t) =>
      cell(
        t,
        rows.filter((r) => r.group === g),
      ).padEnd(18),
    ).join('')}`,
  );
console.log(
  `${'ALL (no Registers)'.padEnd(26)}${TOOLS.map((t) => cell(t, scoredRows).padEnd(18)).join('')}`,
);
for (const p of perf) {
  const row = p.timings.map((t) =>
    (t.ms !== null
      ? `${Math.round(t.ms)} ms`
      : t.skipped
        ? `not run (~${t.skipped}s)`
        : '–'
    ).padEnd(18),
  );
  console.log(`${p.name.padEnd(18)}${row.join('')}`);
}

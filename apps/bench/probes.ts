/**
 * Inputs built to find a slow path: long runs of one mark, one huge word, deep nesting. A regex that
 * backtracks, or a loop that rescans, shows here as seconds where 10 KB of prose takes milliseconds.
 * Each probe runs in its own process with a time limit. `bun apps/bench/probes.ts`.
 */
import { fileURLToPath } from 'node:url';
import { BASE_TOOLS, TOOLS } from './tools';

const SIZE = 10_000;
const LIMIT_MS = 10_000;
const fill = (unit: string) => unit.repeat(Math.ceil(SIZE / unit.length)).slice(0, SIZE);

export const PROBES: { id: string; about: string; input: string; format: 'text' | 'html' }[] = [
  { id: 'double quotes', about: '`"` repeated', input: fill('"'), format: 'text' },
  { id: 'single quotes', about: "`'` repeated", input: fill("'"), format: 'text' },
  { id: 'quoted words', about: '`"a ` repeated', input: fill('"a '), format: 'text' },
  { id: 'hyphens', about: '`-` repeated', input: fill('-'), format: 'text' },
  { id: 'spaced hyphens', about: '`a - ` repeated', input: fill('a - '), format: 'text' },
  { id: 'digit ranges', about: '`1-2-` repeated', input: fill('1-2-'), format: 'text' },
  { id: 'dots', about: '`.` repeated', input: fill('.'), format: 'text' },
  { id: 'spaces', about: 'spaces between two words', input: `a${' '.repeat(SIZE)}b`, format: 'text' },
  { id: 'one word', about: 'one word of 10 000 letters', input: fill('abcdefghij'), format: 'text' },
  { id: 'initials', about: '`A. ` repeated', input: fill('A. '), format: 'text' },
  { id: 'nested HTML', about: '1 000 nested `<b>`', input: `${'<b>"a" - '.repeat(1000)}${'</b>'.repeat(1000)}`, format: 'html' },
  { id: 'open tags', about: '`<a` repeated, never closed', input: fill('<a '), format: 'html' },
];

const tools = BASE_TOOLS();

function probe(tool: string, id: string): string {
  const r = Bun.spawnSync({
    cmd: [process.execPath, fileURLToPath(import.meta.url), tool, id],
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: LIMIT_MS,
  });
  if (r.exitedDueToTimeout) return `> ${LIMIT_MS / 1000} s`;
  const out = r.stdout.toString().trim();
  if (!r.success || !out) return 'error';
  if (out === 'n/a') return '–';
  const ms = Number(out);
  return ms < 10 ? `${ms.toFixed(1)} ms` : ms < 1000 ? `${Math.round(ms)} ms` : `**${(ms / 1000).toFixed(1)} s**`;
}

export function probesSection(): string[] {
  const rows = [`| Probe | ${tools.map((t) => t.name).join(' | ')} |`, `|---|${tools.map(() => '---').join('|')}|`];
  for (const p of PROBES) rows.push(`| ${p.id}: ${p.about} | ${tools.map((t) => probe(t.name, p.id)).join(' | ')} |`);
  return [
    '## Hard inputs',
    '',
    `About ${SIZE / 1000} KB built to find a slow path (a regex that backtracks, a loop that rescans), each run once in its own process and stopped after ${LIMIT_MS / 1000} s; a time of a second or more is in bold. For scale, ${SIZE / 1000} KB of prose is in [Speed](#speed). "–" is a format the tool does not take; "error" is a throw. The probes are in \`apps/bench/probes.ts\`.`,
    '',
    ...rows,
    '',
  ];
}

const [toolName, probeId] = process.argv.slice(2);
if (import.meta.main && toolName) {
  const tool = TOOLS.find((t) => t.name === toolName);
  const p = PROBES.find((x) => x.id === probeId);
  if (!tool || !p) throw new Error(`no tool ${toolName} or probe ${probeId}`);
  const start = performance.now();
  const out = tool.run(p.input, 'en', p.format);
  console.log(out === null ? 'n/a' : performance.now() - start);
} else if (import.meta.main) console.log(probesSection().join('\n'));

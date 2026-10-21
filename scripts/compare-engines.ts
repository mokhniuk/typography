/**
 * Proves that two versions of the engine give the same output and the same `explain` records.
 *
 *     bun scripts/compare-engines.ts [baseRef=speed-baseline] [--n 20000] [--head <src dir>] [--base-dir <src dir>] [--slice 1500] [--no-timing]
 *
 * The base is `src/` of a git ref, extracted with `git archive` into a temp directory outside the
 * repository (or an existing `src` directory given with `--base-dir`); the head is this checkout's
 * `src/` (or `--head`). For every language x register x quoteStyle x rule set (default; every opt-in
 * rule enabled) x mode (typographic with `explain`, text, HTML, Markdown, hast) it compares the
 * output and every `onChange` record (rule id, from, to, order). A thrown error is a result too:
 * both must throw the same message. Exit code 1 on any difference. Then it prints timings.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  type Engine,
  corpus,
  hastOf,
  htmlOf,
  loadEngine,
  longText,
  markdownOf,
  ruleTable,
  show,
} from './corpus';

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};
const valueFlags = new Set(['--n', '--slice', '--head', '--base-dir']);
const positional = args.filter((a, i) => !a.startsWith('--') && !valueFlags.has(args[i - 1] ?? ''));
const baseRef = positional[0] ?? 'speed-baseline';
const N = Number(flag('--n') ?? 20000);
/**
 * Strings per combination. The pool of N strings is walked round: each combination (language x
 * register x quoteStyle x rule set) takes the next `SLICE` of it, so the whole pool is covered many
 * times over across the combinations without running all N through each of them. `--slice N` runs
 * the full pool through every combination (slow: an hour). The text, HTML, Markdown and hast modes
 * take a quarter of the slice, each string standing for three.
 */
const SLICE = Math.min(N, Number(flag('--slice') ?? 1500));
const MODE_SLICE = Math.max(1, Math.ceil(SLICE / 4));
const repo = resolve(import.meta.dir, '..');
const headSrc = resolve(flag('--head') ?? join(repo, 'src'));

const scratch = mkdtempSync(join(tmpdir(), 'typography-base-'));
const baseSrc = flag('--base-dir') ? resolve(flag('--base-dir') as string) : join(scratch, 'src');
if (!flag('--base-dir')) {
  const tar = execFileSync('git', ['-C', repo, 'archive', baseRef, 'src']);
  execFileSync('tar', ['-x', '-C', scratch], { input: tar });
}
process.on('exit', () => rmSync(scratch, { recursive: true, force: true }));

const base = await loadEngine(baseSrc);
const head = await loadEngine(headSrc);

type Diff = { input: string; mode: string; lang: string; options: string; base: string; head: string };
const diffs: Diff[] = [];
let total = 0;
let different = 0;
const note = (d: Diff) => {
  different++;
  if (diffs.length < 10) diffs.push(d);
};

/** Runs `fn`; an error becomes part of the result so a change in what throws is seen too. */
function attempt(fn: () => unknown): string {
  try {
    return show(fn());
  } catch (error) {
    return `THROW ${error instanceof Error ? error.message : String(error)}`;
  }
}

// The rule table itself: ids, order, defaultOn.
{
  const a = ruleTable(base).join(',');
  const b = ruleTable(head).join(',');
  total++;
  if (a !== b) note({ input: '(RULES)', mode: 'rule table', lang: '-', options: '-', base: a, head: b });
}

const baseLangs: readonly string[] = base.core.LANGS;
const headLangs: readonly string[] = head.core.LANGS;
const skipped = headLangs.filter((l) => !baseLangs.includes(l));
const langs = headLangs.filter((l) => baseLangs.includes(l));
for (const l of baseLangs.filter((x) => !headLangs.includes(x))) {
  total++;
  note({ input: '(LANGS)', mode: 'languages', lang: l, options: '-', base: 'present', head: 'missing' });
}

// Opt-in rules known to both engines (enable throws on an id it does not know).
const headIds = new Set(head.core.RULES.map((r) => r.id));
const optIn = base.core.RULES.filter((r) => r.defaultOn === false && headIds.has(r.id)).map((r) => r.id);

const pool = corpus(N, 1);
const registers = ['display', 'literary'] as const;
const quoteStyles = ['language', 'us'] as const;
const ruleSets: [string, string[] | undefined][] = [
  ['default', undefined],
  ['all-optin', optIn],
];

function compareOne(mode: string, lang: string, options: string, input: string, run: (e: Engine) => unknown) {
  total++;
  const a = attempt(() => run(base));
  const b = attempt(() => run(head));
  if (a !== b) note({ input, mode, lang, options, base: a, head: b });
}

let combo = 0;
const window = (start: number, length: number): [string, number][] =>
  Array.from({ length }, (_, k) => {
    const at = (start + k) % pool.length;
    return [pool[at] as string, at];
  });
for (const lang of langs) {
  for (const register of registers) {
    for (const quoteStyle of quoteStyles) {
      for (const [setName, enable] of ruleSets) {
        const start = (combo++ * SLICE) % pool.length;
        const label = `${register}/${quoteStyle}/${setName}`;
        const o = { register, quoteStyle, ...(enable ? { enable } : {}) };
        const l = lang as never;
        for (const [s, i] of window(start, SLICE)) {
          // blockStart false on every fourth string: a dialogue dash only counts at a block start.
          compareOne('typographic', lang, label, s, (e) => e.core.explain(s, l, { ...o, blockStart: i % 4 !== 3 }));
        }
        const next = (i: number, k: number) => pool[(i + k) % pool.length] ?? '';
        for (const [s, i] of window(start, MODE_SLICE)) {
          const run = (fn: (e: Engine, changes: unknown[]) => unknown) => (e: Engine) => {
            const changes: unknown[] = [];
            const result = fn(e, changes);
            return { result, changes };
          };
          const onChange = (changes: unknown[]) => (c: unknown) => void changes.push(c);
          const opts = (changes: unknown[]) => ({ lang: l, ...o, onChange: onChange(changes) });
          const text = `${s}\n${next(i, 1)}\n\n${next(i, 2)}`;
          compareOne('typesetText', lang, label, text, run((e, c) => e.text.typesetText(text, opts(c))));
          const html = htmlOf(s, i);
          compareOne('typesetHtml', lang, label, html, run((e, c) => e.html.typesetHtml(html, opts(c))));
          const md = markdownOf(s, i, next(i, 1));
          compareOne('typesetMarkdown', lang, label, md, run((e, c) => e.markdown.typesetMarkdown(md, opts(c))));
          compareOne('typesetHast', lang, label, show(hastOf(s, i)), (e) => {
            const changes: unknown[] = [];
            const tree = hastOf(s, i);
            e.rehype.typesetHast(tree, opts(changes) as never);
            return { tree, changes };
          });
        }
      }
    }
  }
}

console.log(`base ${baseRef} (${baseSrc.startsWith(scratch) ? 'git archive' : baseSrc})  head ${headSrc}`);
console.log(`languages compared: ${langs.length}${skipped.length ? ` (skipped, not in base: ${skipped.join(', ')})` : ''}`);
console.log(`corpus: ${pool.length} strings, ${SLICE} per combination for typographic and ${MODE_SLICE} for each other mode, ${total} comparisons`);
console.log(`opt-in rules enabled in the all-optin set: ${optIn.join(', ')}`);

for (const d of diffs) {
  console.log(`\nDIFFERENCE  mode=${d.mode}  lang=${d.lang}  options=${d.options}`);
  console.log(`  input: ${JSON.stringify(d.input)}`);
  console.log(`  base:  ${d.base}`);
  console.log(`  head:  ${d.head}`);
}
console.log(`\n${different} differences`);

if (args.includes('--no-timing')) process.exit(different ? 1 : 0);

// Timing: best of 3, over one 1 MB paragraph and over 1000 paragraphs of about 1 KB.
const MB = longText(1 << 20, 1, 'en');
const KB = Array.from({ length: 1000 }, (_, i) => longText(1024, i + 1, 'en'));
type Job = [string, (e: Engine, text: string) => unknown];
const jobs: Job[] = [
  ['typographic', (e, s) => e.core.typographic(s, 'en')],
  ['typographic+explain', (e, s) => e.core.explain(s, 'en')],
  ['typesetText', (e, s) => e.text.typesetText(s, { lang: 'en' })],
  ['typesetHtml', (e, s) => e.html.typesetHtml(htmlOf(s, 0), { lang: 'en' })],
  ['typesetMarkdown', (e, s) => e.markdown.typesetMarkdown(s, { lang: 'en' })],
  ['typesetHast', (e, s) => e.rehype.typesetHast(hastOf(s, 0), { lang: 'en' })],
];
const best = (fn: () => unknown): number => {
  let ms = Number.POSITIVE_INFINITY;
  for (let r = 0; r < 3; r++) {
    const t = performance.now();
    fn();
    ms = Math.min(ms, performance.now() - t);
  }
  return ms;
};
console.log('\nTiming, best of 3 (ms)');
console.log(`${'mode'.padEnd(22)}${'input'.padEnd(12)}${'base'.padStart(10)}${'head'.padStart(10)}${'head/base'.padStart(11)}`);
let sizeMismatch = 0;
for (const [name, job] of jobs) {
  for (const [label, texts] of [['1 MB', [MB]], ['1000 x 1 KB', KB]] as const) {
    // Explain on a megabyte is a diff per rule: far slower, and not what the 1 MB row is for.
    if (name === 'typographic+explain' && label === '1 MB') continue;
    const used = name === 'typographic+explain' ? texts.slice(0, 100) : texts;
    const shown = used.length === texts.length ? label : `${used.length} x 1 KB`;
    const run = (e: Engine) => () => used.map((s) => job(e, s));
    const a = best(run(base));
    const b = best(run(head));
    // The timed runs must agree too.
    if (show(used.map((s) => job(base, s))) !== show(used.map((s) => job(head, s)))) sizeMismatch++;
    console.log(`${name.padEnd(22)}${shown.padEnd(12)}${a.toFixed(1).padStart(10)}${b.toFixed(1).padStart(10)}${(b / a).toFixed(2).padStart(11)}`);
  }
}
if (sizeMismatch) console.log(`\nTIMED INPUTS DIFFER in ${sizeMismatch} runs`);

process.exit(different || sizeMismatch ? 1 : 0);

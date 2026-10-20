/**
 * Scaling of every rule on long runs of one mark: `bun scripts/stress.ts [srcDir] [--all] [--rule=id]`.
 * For each rule and run class it times the rule at N, 2N and 4N characters (best of 3) and prints the
 * milliseconds and the ratios time(2N)/time(N); a ratio above ~2.5 is quadratic. Only rows whose 4N
 * time is above 5 ms are shown unless `--all`. `srcDir` may be the `src` of another checkout.
 */
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const all = args.includes('--all');
const dir = resolve(args.find((a) => !a.startsWith('--')) ?? 'src');
const only = args.find((a) => a.startsWith('--rule='))?.slice(7);
const mod = (await import(`${dir}/core/rules.ts`)) as typeof import('../src/core/rules');
const context = { lang: 'en', register: 'display', quoteStyle: 'language', blockStart: false } as const;

export const classes: Record<string, string> = {
  spaces: ' ',
  'spaces+a': ' a ',
  'a+spaces': 'a ',
  tabs: ' \t',
  newlines: ' \n',
  digits: '1',
  'digits+C': '1 C ',
  'digit-space': '1 ',
  x: 'x',
  '1x': '1x',
  '1 x ': '1 x ',
  'x-spaces': ' x ',
  '-': '-',
  '--': '--',
  ' - ': ' - ',
  '1-': '1-',
  '1 - ': '1 - ',
  '.': '.',
  '. . ': '. ',
  '+-': '+-',
  '+-5': '+-5',
  '!': '!',
  '?': '?',
  '!?': '!?',
  ',': ',',
  ' ,': ' ,',
  ' .': ' .',
  ' :': ' :',
  ' !': ' !',
  '->': '->',
  '→': ' →',
  '←': '← ',
  'e.V.': ' e.V.',
  '1/2': '1/2 ',
  'Dr.': 'Dr. ',
  'A.': 'A. ',
  ':': '1:',
  '°': '1°',
  '=>': '=>',
  '©': '© ',
  "'": "'",
  '1,': '1,',
  '(': '(',
  a1: 'a1',
};

const time = (fn: () => unknown): number => {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 3; i++) {
    const t = performance.now();
    fn();
    best = Math.min(best, performance.now() - t);
  }
  return best;
};

// Each class bare and with a different character at the end or the start of the run: a quadratic rule is
// often fine on the bare run and slow when the match fails at its far end.
const wraps: [string, (run: string) => string][] = [
  ['', (r) => r],
  ['+a', (r) => `${r}a`],
  ['+1', (r) => `${r}1`],
  ['+-', (r) => `${r}-`],
  ['+C', (r) => `${r}C`],
  ['a+', (r) => `a${r}`],
];
const variants = Object.entries(classes).flatMap(([name, unit]) =>
  wraps.map(([w, f]) => [`${name}${w}`, unit, f] as const),
);

const sizes = [20_000, 40_000, 80_000];
const rows: string[] = [];
for (const rule of mod.RULES) {
  if (rule.id === 'quote') continue;
  if (only && rule.id !== only) continue;
  for (const [label, unit, wrap] of variants) {
    const name = label;
    const ms = sizes.map((n) => {
      const text = wrap(unit.repeat(Math.ceil(n / unit.length)));
      return time(() => {
        if (!rule.when || rule.when(text, context)) rule.apply(text, context);
      });
    });
    const r1 = (ms[1] ?? 0) / Math.max(ms[0] ?? 0, 0.05);
    const r2 = (ms[2] ?? 0) / Math.max(ms[1] ?? 0, 0.05);
    if (all || (ms[2] ?? 0) > 5)
      rows.push(
        `${rule.id.padEnd(26)} ${name.padEnd(10)} ${ms.map((m) => m.toFixed(1).padStart(8)).join('')}  x${r1.toFixed(1)} x${r2.toFixed(1)}${Math.max(r1, r2) > 2.5 && (ms[2] ?? 0) > 5 ? '  <-- SLOW' : ''}`,
      );
  }
}
console.log(rows.join('\n'));

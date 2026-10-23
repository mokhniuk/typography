/**
 * Writes `src/core/quotes.fixture.json`: adversarial quote inputs and what the engine returned for
 * them, so a rewrite of `src/core/quotes.ts` can be held to the same output (`src/core/quotes.fixture.test.ts`).
 *
 *   bun scripts/gen-quote-fixture.ts [srcDir] [outFile] [lone]   (`lone` writes the second fixture, quotes.lone.fixture.json)
 *
 * `srcDir` is a `src/` directory (default: this checkout's). To pin the frozen engine:
 *   git archive speed-baseline src | tar -x -C $T && bun scripts/gen-quote-fixture.ts $T/src
 * The inputs are seeded (no Math.random). Stored: the inputs, one SHA-256 per language/register/style
 * combination over all outputs, one short digest per input over all combinations, and the full output of
 * every input under one combination (rotating), so a failure can show a real before/after.
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lcg } from './corpus';

export const COUNT = 3000;
export const REGISTERS = ['display', 'literary'] as const;
export const STYLES = ['language', 'us', 'guillemets'] as const;

const MARKS = [
  '"',
  "'",
  '’',
  '‘',
  '“',
  '”',
  '„',
  '‟',
  '«',
  '»',
  '‹',
  '›',
  '‚',
  '′',
  '″',
  '`',
  '‛',
  '❝',
  '❞',
];
const WRAPS: readonly (readonly [string, string])[] = [
  ['"', '"'],
  ['“', '”'],
  ['„', '“'],
  ['„', '”'],
  ['«', '»'],
  ['»', '«'],
  ['‘', '’'],
  ['‚', '‘'],
  ['‚', '’'],
  ['‹', '›'],
  ['›', '‹'],
  ["'", "'"],
  ['”', '”'],
  ['’', '’'],
  ['« ', ' »'],
  ['« ', ' »'],
  ['‹ ', ' ›'],
];
const WORDS = [
  'a',
  'I',
  'x',
  'word',
  'stone',
  "don't",
  'don’t',
  'dogs’',
  "dogs'",
  "Maria's",
  'Maria’s',
  "l'amour",
  "d'un",
  "dell'arte",
  "o'clock",
  "ma'am",
  "rock 'n' roll",
  'rock’n’roll',
  "'til",
  "'em",
  "'cause",
  "'tis",
  '’tis',
  "'n'",
  "'N'",
  "'s avonds",
  "'t",
  "'k",
  "'90s",
  '’90s',
  "'12'",
  "'1999'",
  "'123'",
  '’12',
  "'ab",
  "ab'",
  '5\'10"',
  "5'",
  '10"',
  '3″',
  '5′10″',
  '12"',
  '1999',
  'Привіт',
  'слово',
  "п'ять",
  'м’ясо',
  'λόγος',
  'γειά',
  'Ωμέγα',
  'été',
  'Straße',
  'ünd',
  'cień',
  'є',
  'ґ',
  'ÿ',
  'Ø',
  'ß',
  'ǅ',
  '×',
  '÷',
  'a×b',
  '¿Qué?',
  '¡Hola!',
  '¿',
  '¡',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '.',
  ',',
  ';',
  ':',
  '!',
  '?',
  '...',
  '…',
  '-',
  '–',
  '—',
  '',
  '',
  '',
  '\u{1F600}',
  '\uD800',
  '\uDC00',
  '́',
  'é',
  '​',
  ' ',
  '1',
  '5',
  '10',
  '2026',
  '3.14',
  '€',
  '$',
  '%',
  '`code`',
  'https://a.b/c',
  'a@b.c',
];
const SPACES = [' ', ' ', ' ', '  ', ' ', '\t', '\n', '\r\n', ' ', ' ', '　'];

const pick = <T>(rand: () => number, list: readonly T[]): T =>
  list[Math.floor(rand() * list.length)] as T;

function soup(rand: () => number): string {
  const n = 1 + Math.floor(rand() * 24);
  let out = '';
  for (let i = 0; i < n; i++) {
    const r = rand();
    if (r < 0.34) out += pick(rand, MARKS);
    else if (r < 0.46) out += pick(rand, SPACES);
    else out += pick(rand, WORDS);
    if (rand() < 0.45) out += pick(rand, SPACES.slice(0, 5));
  }
  return out;
}

/** Quotations wrapped around words, nested up to `depth` levels, then damaged. */
function nested(rand: () => number, depth: number): string {
  let s = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => pick(rand, WORDS)).join(' ');
  for (let d = 0; d < depth; d++) {
    const [open, close] = pick(rand, WRAPS);
    s = `${open}${s}${close}`;
    if (rand() < 0.3) s = `${pick(rand, WORDS)} ${s}`;
    if (rand() < 0.3) s = `${s} ${pick(rand, WORDS)}`;
    if (rand() < 0.15) {
      const [o2, c2] = pick(rand, WRAPS);
      s = `${s}${pick(rand, [' ', '', ' '])}${o2}${pick(rand, WORDS)}${c2}`;
    }
  }
  const damage = rand();
  if (damage < 0.2) s = s.slice(1);
  else if (damage < 0.4) s = s.slice(0, -1);
  else if (damage < 0.5) {
    const at = Math.floor(rand() * s.length);
    s = s.slice(0, at) + pick(rand, MARKS) + s.slice(at);
  } else if (damage < 0.6) {
    const at = Math.floor(rand() * s.length);
    s = s.slice(0, at) + s.slice(at + 1);
  }
  return s;
}

function runs(rand: () => number): string {
  const mark = pick(rand, MARKS);
  const tail = pick(rand, [mark, '', pick(rand, MARKS)]).repeat(Math.floor(rand() * 6));
  return `${pick(rand, WORDS)} ${mark.repeat(1 + Math.floor(rand() * 7))}${pick(rand, WORDS)}${tail}`;
}

export function inputs(elisions: readonly string[]): string[] {
  const rand = lcg(20261020);
  const out: string[] = [];
  for (const w of elisions)
    out.push(`'${w} ok`, `"'${w}" ok`, `“'${w}”`, `the '${w}' button`, `'${w}'`, `x '${w}x`);
  // every mark alone and in several positions, every wrap around every mark
  for (const m of MARKS) {
    out.push(
      m,
      ` ${m}`,
      `${m} `,
      `a${m}`,
      `${m}a`,
      `a ${m}`,
      `${m}${m}`,
      `a${m}b`,
      `5${m}`,
      `${m}5`,
      `(${m}a`,
      `¿${m}a`,
      `a ${m}`,
    );
  }
  for (const [o, c] of WRAPS)
    for (const m of MARKS)
      out.push(`${o}a ${m}b${c}`, `${m}${o}a${c}${m}`, `${o}${m}a${m}${c} ${o}b${c}`);
  while (out.length < COUNT) {
    const r = out.length % 6;
    if (r === 0 || r === 1) out.push(soup(rand));
    else if (r === 2) out.push(nested(rand, 1 + Math.floor(rand() * 5)));
    else if (r === 3)
      out.push(
        `${nested(rand, 1 + Math.floor(rand() * 3))} ${nested(rand, 1 + Math.floor(rand() * 3))}`,
      );
    else if (r === 4) out.push(runs(rand));
    else out.push(`${soup(rand)}\n${nested(rand, 2 + Math.floor(rand() * 4))} ${soup(rand)}`);
  }
  return out.slice(0, COUNT);
}

/**
 * Second class: long runs of one mark, many lone marks (dialogue, unbalanced), and mixes. These hit the
 * fix-point and whole-text passes for marks that found no partner. Runs are up to a few thousand marks,
 * since the frozen engine is quadratic on them (the 40k case is timed by hand, see the commit message).
 */
export function loneInputs(): string[] {
  const rand = lcg(20261021);
  const out: string[] = [];
  const LONES = ['"', '„', '“', '”', '‚', '«', '»', '‹', '›', '‘', '’', "'"];
  const NB = '\u00A0';
  for (const m of LONES) {
    for (const n of [1, 2, 3, 5, 17, 60]) {
      const r = m.repeat(n);
      out.push(
        r,
        `${r} x`,
        `x ${r}`,
        `x ${r}y`,
        `${r}x`,
        `${r} `,
        `(${r}x`,
        `5${r}x`,
        `x${r}`,
        `${r}${NB}x`,
      );
    }
    const big = m.repeat(300);
    out.push(`x ${big}y`, `${big} x`, big);
    if ('“«„‘'.includes(m)) out.push(`x ${m.repeat(1200)}y`);
  }
  for (const m of ['«', '‹', '»', '›']) {
    for (const n of [2, 6, 30, 250]) {
      out.push(
        `${`${m}${NB}`.repeat(n)}x`,
        `x ${m}${NB}`.repeat(n),
        `${m}${NB}${m}`.repeat(n),
        `${`a${NB}${m}`.repeat(n)} b`,
        `${m}${NB} `.repeat(n),
        `${m} ${NB}${m}x`.repeat(n),
      );
    }
  }
  // mixed runs of different marks, with and without spaces
  for (let i = 0; i < 120; i++) {
    const a = pick(rand, LONES),
      b = pick(rand, LONES),
      c = pick(rand, [...LONES, NB, ' ', '1']);
    const n = 1 + Math.floor(rand() * (i % 10 === 0 ? 250 : 40));
    const unit = [a, b, c].slice(0, 1 + Math.floor(rand() * 3)).join('');
    out.push(unit.repeat(n), `w ${unit.repeat(n)} w`, `${unit.repeat(n)}x ${unit.repeat(n)}`);
  }
  // dialogue and unbalanced prose
  const SENT = [
    'He said it.',
    'Well, ok',
    "It's fine",
    'Привіт',
    'Nein, danke',
    'a 5" pipe',
    "the '90s",
    'Ça va',
  ];
  const OPENS = ['“', '"', '„', '«', '‘', '‚', '»', '”', '’', '‹', "'"];
  for (let i = 0; i < 700; i++) {
    let s = '';
    const lines = 1 + Math.floor(rand() * 30);
    for (let l = 0; l < lines; l++) {
      const r = rand();
      const o = pick(rand, OPENS),
        cl = pick(rand, OPENS);
      if (r < 0.4) s += `${o}${pick(rand, SENT)}${rand() < 0.5 ? cl : ''}`;
      else if (r < 0.6) s += `${pick(rand, SENT)} ${o}${o}${pick(rand, SENT)}`;
      else if (r < 0.75) s += `${pick(rand, SENT)}${cl}`;
      else if (r < 0.85) s += `${o}${NB}${pick(rand, SENT)}${NB}${cl}`;
      else s += pick(rand, SENT);
      s += pick(rand, [' ', '\n', ' ', '\n\n', NB, '  ']);
    }
    out.push(s);
  }
  return out;
}

export type Fixture = {
  inputs: string[];
  combos: string[];
  comboDigests: string[];
  inputDigests: string[];
  sample: string[];
};

/** Runs every input through every language, register and style of the engine in `quotes` and digests the results. */
export function digest(
  quotes: (text: string, lang: string, register: string, quoteStyle: string) => string,
  codes: readonly string[],
  list: readonly string[],
): Omit<Fixture, 'inputs'> {
  const combos: string[] = [];
  for (const code of codes)
    for (const reg of REGISTERS) for (const st of STYLES) combos.push(`${code}/${reg}/${st}`);
  const comboHash = combos.map(() => createHash('sha256'));
  const inputHash = list.map(() => createHash('sha256'));
  const sample: string[] = [];
  list.forEach((text, i) => {
    combos.forEach((combo, c) => {
      const [lang = '', reg = '', st = ''] = combo.split('/');
      const result = quotes(text, lang, reg, st);
      comboHash[c]?.update(`${result.length}:${result}`);
      inputHash[i]?.update(`${result.length}:${result}`);
      if (c === i % combos.length) sample.push(result);
    });
  });
  return {
    combos,
    comboDigests: comboHash.map((h) => h.digest('hex')),
    inputDigests: inputHash.map((h) => h.digest('hex').slice(0, 12)),
    sample,
  };
}

if (import.meta.main) {
  const srcDir = process.argv[2] ?? new URL('../src', import.meta.url).pathname;
  const outFile =
    process.argv[3] ?? new URL('../src/core/quotes.fixture.json', import.meta.url).pathname;
  const { quotes } = await import(pathToFileURL(`${srcDir}/core/quotes.ts`).href);
  const { PACKS } = await import(pathToFileURL(`${srcDir}/core/lang/index.ts`).href);
  const elisions = [
    ...new Set<string>(PACKS.flatMap((p: { elisions?: string[] }) => p.elisions ?? [])),
  ];
  const list = process.argv[4] === 'lone' ? loneInputs() : inputs(elisions);
  const fixture: Fixture = {
    inputs: list,
    ...digest(
      quotes,
      PACKS.map((p: { code: string }) => p.code),
      list,
    ),
  };
  writeFileSync(outFile, `${JSON.stringify(fixture)}\n`);
  console.log(
    `${fixture.inputs.length} inputs x ${fixture.combos.length} combinations -> ${outFile}`,
  );
}

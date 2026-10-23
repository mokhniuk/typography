/**
 * One small module per tool that typesets English text in one call, bundled the way a site would ship
 * it (Bun.build, browser target, minified, every dependency inlined). The bundles are what `size.ts`
 * weighs and what `driver.ts` loads under Bun, Node and Deno. Written to `apps/bench/out/` (not tracked).
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const OUT = fileURLToPath(new URL('./out/', import.meta.url));
const SRC = '../../../../src';

export type Entry = {
  /** The tool name, as in `tools.ts`; an entry point of this package carries its subpath. */
  name: string;
  /** Exports `run(text)` that typesets English text, except for an entry weighed but not run. */
  code: string;
  runs: boolean;
  /** Modules left out of the bundle (a peer dependency the consumer already has). */
  external?: string[];
};

export const ENGINE = 'typography-engine';

export const ENTRIES: Entry[] = [
  {
    name: ENGINE,
    code: `import { typesetText } from '${SRC}/text';\nexport const run = (s) => typesetText(s, { lang: 'en' });`,
    runs: true,
  },
  {
    name: 'typograf',
    code: `import Typograf from 'typograf';\nconst tp = new Typograf({ locale: ['en-US'] });\nexport const run = (s) => tp.execute(s);`,
    runs: true,
  },
  {
    name: 'typopo',
    code: `import { fixTypos } from 'typopo';\nexport const run = (s) => fixTypos(s, 'en-us');`,
    runs: true,
  },
  {
    name: 'richtypo',
    code: `import richtypo from 'richtypo';\nimport en from 'richtypo/rules/en';\nexport const run = (s) => richtypo(en, s);`,
    runs: true,
  },
  {
    name: 'tipograph',
    code: `import tipograph from 'tipograph';\nconst t = tipograph({ language: 'english', format: 'plain' });\nexport const run = (s) => t(s);`,
    runs: true,
  },
  {
    name: 'smartypants',
    code: `import { smartypantsu } from 'smartypants';\nexport const run = (s) => smartypantsu(s, 'qde');`,
    runs: true,
  },
  {
    name: 'retext-smartypants',
    code: `import { unified } from 'unified';\nimport english from 'retext-english';\nimport smartypants from 'retext-smartypants';\nimport stringify from 'retext-stringify';\nconst p = unified().use(english).use(smartypants).use(stringify);\nexport const run = (s) => String(p.processSync(s));`,
    runs: true,
  },
];

/** Entry points of this package, weighed one by one; react is a peer dependency, left out. */
export const PARTS: Entry[] = [
  { name: `${ENGINE} (everything, \`.\`)`, code: `export * from '${SRC}/index';`, runs: false },
  { name: `${ENGINE}/text`, code: `export { typesetText } from '${SRC}/text';`, runs: false },
  { name: `${ENGINE}/html`, code: `export { typesetHtml } from '${SRC}/html';`, runs: false },
  { name: `${ENGINE}/markdown`, code: `export * from '${SRC}/markdown';`, runs: false },
  { name: `${ENGINE}/rehype`, code: `export * from '${SRC}/rehype';`, runs: false },
  { name: `${ENGINE}/dom`, code: `export * from '${SRC}/dom';`, runs: false },
  { name: `${ENGINE}/react`, code: `export * from '${SRC}/react';`, runs: false, external: ['react'] },
  { name: `${ENGINE}/lite (no language pack)`, code: `export * from '${SRC}/lite';`, runs: false },
  { name: `${ENGINE}/lite text (no pack)`, code: `export { typesetText } from '${SRC}/lite';`, runs: false },
  {
    name: `${ENGINE}/lite text + lang/en`,
    code: `export { typesetText } from '${SRC}/lite';\nexport { en } from '${SRC}/core/lang/en';`,
    runs: false,
  },
  {
    name: `${ENGINE}/lite text + lang/uk`,
    code: `export { typesetText } from '${SRC}/lite';\nexport { uk } from '${SRC}/core/lang/uk';`,
    runs: false,
  },
  { name: `${ENGINE}: the language packs alone`, code: `export { PACKS } from '${SRC}/core/lang';`, runs: false },
];

export const fileOf = (name: string) => name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');

/** Bundles every entry; returns the path of each bundle by entry name. Fails loudly: a size of a broken build means nothing. */
export async function buildAll(entries: Entry[] = [...ENTRIES, ...PARTS]): Promise<Map<string, string>> {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(`${OUT}entries`, { recursive: true });
  const paths = new Map<string, string>();
  for (const e of entries) {
    const file = `${OUT}entries/${fileOf(e.name)}.js`;
    writeFileSync(file, `${e.code}\n`);
    const result = await Bun.build({
      entrypoints: [file],
      outdir: `${OUT}bundles`,
      target: 'browser',
      format: 'esm',
      minify: true,
      external: e.external ?? [],
    });
    if (!result.success) throw new AggregateError(result.logs, `bundling ${e.name} failed`);
    const out = result.outputs[0];
    if (!out) throw new Error(`bundling ${e.name} gave no output`);
    paths.set(e.name, out.path);
  }
  return paths;
}

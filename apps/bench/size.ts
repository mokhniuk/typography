/**
 * What each tool adds to a page: the bundle of one call that typesets English text, every dependency
 * inlined, minified, then gzip and brotli (the sizes a server sends). Then this package's entry points one
 * by one. `bun apps/bench/size.ts`; `run.ts` puts the tables in RESULTS.md.
 */
import { readFileSync } from 'node:fs';
import { brotliCompressSync, constants } from 'node:zlib';
import { buildAll, ENTRIES, type Entry, PARTS } from './bundle';

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

function weigh(path: string) {
  const code = readFileSync(path);
  return {
    min: code.length,
    gzip: Bun.gzipSync(code, { level: 9 }).length,
    brotli: brotliCompressSync(code, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
  };
}

function table(entries: Entry[], paths: Map<string, string>): string[] {
  const rows = ['| Bundle | Minified | gzip | brotli |', '|---|---|---|---|'];
  for (const e of entries) {
    const path = paths.get(e.name);
    if (!path) continue;
    const w = weigh(path);
    rows.push(`| ${e.name} | ${kb(w.min)} | ${kb(w.gzip)} | ${kb(w.brotli)} |`);
  }
  return rows;
}

export async function sizeSection(paths?: Map<string, string>): Promise<string[]> {
  const built = paths ?? (await buildAll());
  return [
    '## Bundle size',
    '',
    "One call that typesets English text, bundled for the browser with `Bun.build` (ESM, minified, every dependency inlined), then compressed (gzip level 9, brotli quality 11). This package, typograf, typopo and tipograph carry every language they ship whichever one is asked for; richtypo is imported with the English rules only, and smartypants and retext-smartypants know English alone. The entries are in `apps/bench/bundle.ts`.",
    '',
    ...table(ENTRIES, built),
    '',
    "This package's entry points one by one (`react` is a peer dependency, left out of its bundle). The last row is the language packs on their own: every entry point carries all of them.",
    '',
    ...table(PARTS, built),
    '',
  ];
}

if (import.meta.main) console.log((await sizeSection()).join('\n'));

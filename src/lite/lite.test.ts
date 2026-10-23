import { describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { corpus, htmlOf, markdownOf, proseOf } from '../../scripts/corpus.ts';
import * as full from '../core/index.ts';
import { PACKS } from '../core/lang/index.ts';
import type { LangPack } from '../core/lang/pack.ts';
import type { Change } from '../core/typography.ts';
import { typesetHtml } from '../html/index.ts';
import { typesetMarkdown } from '../markdown/index.ts';
import { typesetText } from '../text/index.ts';
import * as lite from './index.ts';

/**
 * `@mokhniuk/typography/lite` loads no language pack: a page that imports it and one pack from
 * `@mokhniuk/typography/lang/<code>` ships one language. These tests hold it to that without
 * trusting a bundler, and check that it typesets exactly as the full entries do.
 */
const SRC = resolve(import.meta.dir, '..');
const ENTRY = join(SRC, 'lite', 'index.ts');

/** Modules lite must never reach: the table of packs, a pack, and what is built on them. */
const FORBIDDEN = [
  'core/index.ts',
  'core/resolve.ts',
  'core/profiles.ts',
  'core/config.ts',
  'core/glyphs.ts',
  'core/lang/index.ts',
  ...PACKS.map((pack) => `core/lang/${pack.code.toLowerCase()}.ts`),
];

/**
 * The modules `entry` loads at run time, found by reading the sources: `import type` and
 * `export type ... from` are erased by the build and skipped; any other `import`/`export ... from`
 * (one that names a type among values included) counts.
 */
function runtimeGraph(entry: string): Set<string> {
  const seen = new Set<string>();
  const statement =
    /^\s*(import|export)\s+(type\s+)?(?:[^'";]*?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/gms;
  const walk = (file: string) => {
    const path = relative(SRC, file);
    if (seen.has(path)) return;
    seen.add(path);
    const source = readFileSync(file, 'utf8');
    for (const [, , typeOnly, specifier] of source.matchAll(statement)) {
      if (typeOnly || !specifier) continue;
      walk(resolve(dirname(file), specifier));
    }
  };
  walk(entry);
  return seen;
}

/**
 * `source` bundled in memory the way a site would ship it (browser target, minified). The source is a
 * consumer's module, written outside the package: Bun 1.3 drops every module behind a re-exporting
 * entry point that sits inside a package marked `sideEffects: false` (it emits only the export list).
 */
async function bundle(source: string): Promise<string> {
  const dir = mkdtempSync(join(tmpdir(), 'typography-lite-'));
  try {
    const entry = join(dir, 'entry.ts');
    writeFileSync(entry, source);
    const built = await Bun.build({ entrypoints: [entry], minify: true, target: 'browser' });
    expect(built.success).toBe(true);
    return (await Promise.all(built.outputs.map((o) => o.text()))).join('\n');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('lite loads no language pack', () => {
  const graph = runtimeGraph(ENTRY);

  test('the import graph reaches the engine and the three modes', () => {
    for (const path of [
      'core/typography.ts',
      'core/rules.ts',
      'core/quotes.ts',
      'core/hang.ts',
      'text/text.ts',
      'html/html.ts',
      'markdown/markdown.ts',
    ])
      expect(graph.has(path), path).toBe(true);
  });

  test('the import graph reaches none of the packs or the modules built on them', () => {
    for (const path of FORBIDDEN) expect(graph.has(path), path).toBe(false);
    for (const path of graph)
      expect(path.startsWith('core/lang/') && path !== 'core/lang/pack.ts', path).toBe(false);
  });

  test('the walk sees a pack when one is imported (it is not blind)', () => {
    expect(runtimeGraph(join(SRC, 'core', 'lang', 'de-ch.ts')).has('core/lang/de.ts')).toBe(true);
    expect(runtimeGraph(join(SRC, 'text', 'index.ts')).has('core/lang/index.ts')).toBe(true);
  });

  test('a bundle of the entry holds no pack data', async () => {
    const code = await bundle(`export * from ${JSON.stringify(ENTRY)};`);
    expect(code.length).toBeGreaterThan(10_000);
    for (const pack of PACKS) {
      expect(code.includes(JSON.stringify(pack.name)), pack.name).toBe(false);
      expect(code.includes(pack.sample), pack.code).toBe(false);
      for (const source of pack.sources) expect(code.includes(source), source).toBe(false);
    }
  });

  test('a bundle of the entry and one pack holds that pack only', async () => {
    const uk = join(SRC, 'core', 'lang', 'uk.ts');
    const code = await bundle(
      `export * from ${JSON.stringify(ENTRY)};\nexport { uk } from ${JSON.stringify(uk)};`,
    );
    for (const pack of PACKS)
      expect(code.includes(JSON.stringify(pack.name)), pack.name).toBe(pack.code === 'uk');
  });
});

describe('lite typesets as the full entries do', () => {
  const texts = corpus(48, 7);
  const optIn = full.RULES.filter((rule) => rule.defaultOn === false).map((rule) => rule.id);
  const variants = (['display', 'literary'] as const).flatMap((register) =>
    (['language', 'us', 'guillemets'] as const).flatMap((quoteStyle) => [
      { register, quoteStyle },
      { register, quoteStyle, enable: optIn },
    ]),
  );

  test('the lite exports are the brief’s, and none needs the table of packs', () => {
    expect(Object.keys(lite).sort()).toEqual(
      [
        'DEFAULT_RULES',
        'NBSP',
        'RULES',
        'RULE_CATEGORIES',
        'RULE_IDS',
        'addRule',
        'diff',
        'explain',
        'hangPieces',
        'keepAvoided',
        'selectRules',
        'splitHangs',
        'typesetBlock',
        'typesetHtml',
        'typesetMarkdown',
        'typesetText',
        'typographic',
        'without',
      ].sort(),
    );
    expect(lite.RULES).toBe(full.RULES);
  });

  test('a code where lite needs a pack throws, saying where to get one', () => {
    const code = 'uk' as unknown as LangPack;
    expect(() => lite.typographic('"a"', code)).toThrow(/lang\/<code>/);
    expect(() => lite.typesetText('"a"', { lang: code })).toThrow(/lang\/<code>/);
  });

  for (const pack of PACKS) {
    test(`${pack.code}: explain, text, HTML and Markdown, every register, quote style and opt-in`, () => {
      const lang = pack.code;
      const own = [...proseOf(lang), ...texts];
      for (const [i, text] of own.entries()) {
        const other = own[(i + 1) % own.length] ?? '';
        for (const options of variants) {
          expect(lite.explain(text, pack, options)).toEqual(full.explain(text, lang, options));
          const record = () => {
            const changes: Change[] = [];
            return { changes, onChange: (c: Change) => changes.push(c) };
          };
          const modes = [
            [lite.typesetText, typesetText, text],
            [lite.typesetHtml, typesetHtml, htmlOf(text, i)],
            [lite.typesetMarkdown, typesetMarkdown, markdownOf(text, i, other)],
          ] as const;
          for (const [mine, theirs, input] of modes) {
            const a = record();
            const b = record();
            const out = mine(input, { ...options, lang: pack, onChange: a.onChange });
            expect(out).toBe(theirs(input, { ...options, lang, onChange: b.onChange }));
            expect(a.changes).toEqual(b.changes);
          }
        }
      }
    });
  }
});

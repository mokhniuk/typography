import { afterAll, describe, expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { loadEngine, SNAPSHOT_N, SNAPSHOT_VARIANTS, snapshotDigests } from '../scripts/corpus';
import { LANGS } from './core';
import committed from './snapshot.digests.json';

/**
 * A regression net for speed work: for each language, a SHA-256 of every output and every `explain`
 * record over a seeded corpus (default and literary rules, quoteStyle us, all opt-in rules, and the
 * text, HTML and Markdown modes). If you changed output on purpose, or added a language, run
 * `bun run snapshot` and commit the new `src/snapshot.digests.json`.
 */
const ROOT = resolve(import.meta.dir, '..');
const SRC = join(ROOT, 'src');
const digests = committed.digests as Record<string, Record<string, string> | undefined>;
const SLOW = 120_000;

describe('snapshot digests', () => {
  test('the digest file was made with this corpus size', () => {
    expect(committed.n).toBe(SNAPSHOT_N);
  });

  test('no digest is left over for a language that is gone', () => {
    expect(
      Object.keys(digests).filter((lang) => !(LANGS as readonly string[]).includes(lang)),
    ).toEqual([]);
  });

  for (const lang of LANGS) {
    test(
      `${lang}: output and explain records are unchanged`,
      async () => {
        const expected = digests[lang];
        if (!expected) throw new Error(`no digest for ${lang}: run: bun run snapshot`);
        const engine = await loadEngine(SRC);
        const actual = snapshotDigests(engine, lang);
        for (const variant of SNAPSHOT_VARIANTS) {
          if (!expected[variant])
            throw new Error(`no ${variant} digest for ${lang}: run: bun run snapshot`);
        }
        expect(actual).toEqual(expected as typeof actual);
      },
      SLOW,
    );
  }
});

/**
 * The harness must catch a change: each mutation below is applied to a copy of `src/` in a temp
 * directory, never to the real engine.
 */
describe('the harness catches a change to the engine', () => {
  const dirs: string[] = [];
  const copy = () => {
    const dir = mkdtempSync(join(tmpdir(), 'typography-mutant-'));
    dirs.push(dir);
    cpSync(SRC, join(dir, 'src'), {
      recursive: true,
      filter: (f) => !f.endsWith('.test.ts') && !f.endsWith('.test.tsx'),
    });
    const edit = (file: string, from: string, to: string) => {
      const path = join(dir, 'src', file);
      const text = readFileSync(path, 'utf8');
      if (!text.includes(from)) throw new Error(`mutation target not found in ${file}: ${from}`);
      writeFileSync(path, text.replace(from, to));
    };
    return { dir: join(dir, 'src'), edit };
  };
  const compare = (base: string, head: string) =>
    spawnSync(
      'bun',
      [
        join(ROOT, 'scripts/compare-engines.ts'),
        '--base-dir',
        base,
        '--head',
        head,
        '--n',
        '300',
        '--slice',
        '60',
        '--no-timing',
      ],
      {
        encoding: 'utf8',
      },
    );
  afterAll(() => {
    for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  });

  test(
    'a copy that is not mutated has the committed digests and compares as equal',
    async () => {
      const control = copy();
      const result = compare(SRC, control.dir);
      expect(result.stdout).toContain('0 differences');
      expect(result.status).toBe(0);
      expect(snapshotDigests(await loadEngine(control.dir), 'de')).toEqual(digests.de as never);
    },
    SLOW,
  );

  test(
    'a changed regex fails compare-engines and changes the digests of the language it touches',
    async () => {
      // The ellipsis rule: three dots now need four.
      const shared = copy();
      shared.edit('core/marks.ts', 'text.replace(/\\.{3}/g, ', 'text.replace(/\\.{4}/g, ');
      const result = compare(SRC, shared.dir);
      expect(result.status).toBe(1);
      expect(result.stdout).toMatch(/[1-9]\d* differences/);
      const mutated = snapshotDigests(await loadEngine(shared.dir), 'en');
      expect(mutated.display).not.toBe(digests.en?.display);

      // A German-only change: the German sentence dash. German digests change, English ones do not.
      const german = copy();
      german.edit('core/lang/de.ts', "sentenceDash: '–',", "sentenceDash: '—',");
      expect(compare(SRC, german.dir).status).toBe(1);
      const engine = await loadEngine(german.dir);
      expect(snapshotDigests(engine, 'de').display).not.toBe(digests.de?.display);
      expect(snapshotDigests(engine, 'en')).toEqual(digests.en as never);
    },
    SLOW,
  );

  test(
    'a change that only moves the rule named in explain fails compare-engines',
    async () => {
      // Same output, same rule table: the change records say the previous rule made the change.
      const named = copy();
      named.edit(
        'core/typography.ts',
        'changesOf(rule.id, diff(out, next))',
        'changesOf(`${rule.id}.x`, diff(out, next))',
      );
      const result = compare(SRC, named.dir);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('mode=typographic');
      expect(result.stdout).not.toContain('rule table');
      expect(snapshotDigests(await loadEngine(named.dir), 'en').display).not.toBe(
        digests.en?.display,
      );

      // Two rule ids swapped in the table: each rule does its work under the other's name.
      const swapped = copy();
      swapped.edit(
        'core/rules.ts',
        "{ id: 'arrow', category: 'symbols', about: '-> and <- become → and ←', apply: arrows }",
        "{ id: 'symbol.legal', category: 'symbols', about: '-> and <- become → and ←', apply: arrows }",
      );
      swapped.edit(
        'core/rules.ts',
        "id: 'symbol.legal',\n    category: 'symbols',\n    about: '(c) before a year, (C), (R) and (TM) become © ® ™',\n    apply: legal,",
        "id: 'arrow',\n    category: 'symbols',\n    about: '(c) before a year, (C), (R) and (TM) become © ® ™',\n    apply: legal,",
      );
      expect(compare(SRC, swapped.dir).status).toBe(1);
    },
    SLOW,
  );
});

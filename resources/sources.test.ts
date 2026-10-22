import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RULE_IDS } from '../src/core';
import { renderBibliographyHtml } from './bibliography-html';
import { decisionOf, mdAnchor, RULE_SOURCES, render, SOURCES } from './sources';
import { renderHtml } from './sources-html';

const known = new Set(SOURCES.map((source) => source.id));

describe('resources/sources.md', () => {
  test('is what `bun run docs:sources` writes', () => {
    const written = readFileSync(join(import.meta.dir, 'sources.md'), 'utf8');
    expect(written).toBe(render());
  });
});

describe('resources/sources.html', () => {
  test('is what `bun run docs:sources` writes', () => {
    const written = readFileSync(join(import.meta.dir, 'sources.html'), 'utf8');
    expect(written).toBe(renderHtml());
  });
});

describe('resources/bibliography.html', () => {
  test('is what `bun run docs:sources` writes', () => {
    const written = readFileSync(join(import.meta.dir, 'bibliography.html'), 'utf8');
    expect(written).toBe(renderBibliographyHtml());
  });
});

/** A heading's anchor as GitHub derives it: lowercase, punctuation other than hyphens dropped, spaces to hyphens. */
const githubSlug = (heading: string): string =>
  heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');

describe('links between the generated pages', () => {
  test('every rule link in docs/rules.md lands on a heading in sources.md', () => {
    const rules = readFileSync(join(import.meta.dir, '..', 'docs', 'rules.md'), 'utf8');
    const sources = readFileSync(join(import.meta.dir, 'sources.md'), 'utf8');
    const anchors = new Set(
      [...sources.matchAll(/^### (.+)$/gm)].map((m) => githubSlug(m[1] ?? '')),
    );
    const links = [...rules.matchAll(/\(\.\.\/resources\/sources\.md#([^)]+)\)/g)].map(
      (m) => m[1] ?? '',
    );
    expect(links.length).toBe(RULE_IDS.length);
    expect(links.filter((link) => !anchors.has(link))).toEqual([]);
    expect(RULE_IDS.map(mdAnchor).filter((link) => !anchors.has(link))).toEqual([]);
  });

  test('a rule without a decision stops the generators instead of being skipped', () => {
    expect(() => decisionOf('no.such-rule')).toThrow('no decision');
  });
});

describe('the sources registry', () => {
  test('every rule has a decision', () => {
    expect(RULE_IDS.filter((id) => !(id in RULE_SOURCES))).toEqual([]);
  });

  test('no decision belongs to a rule that does not exist', () => {
    expect(Object.keys(RULE_SOURCES).filter((id) => !RULE_IDS.includes(id))).toEqual([]);
  });

  test('source ids are unique', () => {
    expect(known.size).toBe(SOURCES.length);
  });

  for (const source of SOURCES) {
    test(`source ${source.id} is complete`, () => {
      expect(source.cite.trim()).not.toBe('');
      expect(source.author.trim()).not.toBe('');
      expect(source.title.trim()).not.toBe('');
      expect(source.about.trim()).not.toBe('');
      expect(source.claim.trim()).not.toBe('');
      expect(source.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['raw', 'summary']).toContain(source.readVia);
      expect(source.url ?? '').toMatch(/^(https:\/\/.+)?$/);
    });
  }

  for (const [id, decision] of Object.entries(RULE_SOURCES)) {
    test(`${id} cites only sources that exist, and says why`, () => {
      const cited = [...decision.sources, ...Object.values(decision.langs ?? {}).flat()];
      expect(cited.filter((source) => !known.has(source))).toEqual([]);
      expect(decision.why.trim()).not.toBe('');
      expect(decision.alternative.trim()).not.toBe('');
    });

    test(`${id}: verified needs a source`, () => {
      if (decision.confidence === 'verified') expect(decision.sources.length).toBeGreaterThan(0);
    });
  }
});

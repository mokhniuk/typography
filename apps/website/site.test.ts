import { describe, expect, test } from 'bun:test';
import { posix } from 'node:path';
import { latestDateOnly } from './build/content';
import { EXAMPLES, exampleResult } from './build/examples';
import { generatedPages } from './build/pages';
import { externalLinks } from './build/plugin';
import { FACTS, fill } from './build/site';

const pages = generatedPages();

describe('website pages', () => {
  test('docs, articles and their indexes are generated', () => {
    for (const path of ['docs/', 'docs/api/', 'docs/rules/', 'docs/languages/uk/', 'articles/'])
      expect(pages.has(path)).toBe(true);
    expect(
      [...pages.keys()].some((path) => path.startsWith('articles/') && path !== 'articles/'),
    ).toBe(true);
  });

  test('every relative link of every page lands on a page of the site', () => {
    const missing: string[] = [];
    for (const [path, html] of pages) {
      for (const [, href] of html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
        if (!href || /^([a-z]+:|#)/i.test(href)) continue;
        const target = posix.normalize(posix.join(path, href.split('#')[0] ?? ''));
        const page = target.endsWith('/') ? target : `${target}/`;
        if (
          page !== './' &&
          !pages.has(page) &&
          !['playground/', 'font-checker/', ''].includes(page)
        )
          missing.push(`${path} -> ${href}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('no placeholder is left unfilled', () => {
    for (const html of pages.values()) expect(fill(html)).not.toMatch(/\{\{\w+\}\}/);
  });

  test('the numbers come from the engine', () => {
    expect(Number(FACTS.rules)).toBe(Number(FACTS.rulesOn) + Number(FACTS.rulesOff));
    expect(Number(FACTS.langs)).toBeGreaterThan(20);
  });
});

describe('landing examples', () => {
  for (const example of EXAMPLES) {
    test(`${example.lang} changes something and shows both sides`, () => {
      const { before, after, changes } = exampleResult(example);
      expect(changes).toBeGreaterThan(0);
      expect(before).toContain('<del>');
      expect(after).toContain('<ins');
    });
  }
});

describe('page details', () => {
  test('a link to another site opens in a new tab, keeping its rel', () => {
    expect(externalLinks('<a href="https://github.com/x" rel="noopener">G</a>')).toBe(
      '<a href="https://github.com/x" target="_blank" rel="noopener">G</a>',
    );
    expect(externalLinks('<a href="https://x.y" rel="me">X</a>')).toBe(
      '<a href="https://x.y" target="_blank" rel="me noopener">X</a>',
    );
    expect(externalLinks('<a href="../docs/">Docs</a>')).toBe('<a href="../docs/">Docs</a>');
    expect(externalLinks('<a href="https://x.y" target="_self">X</a>')).toBe(
      '<a href="https://x.y" target="_self">X</a>',
    );
  });

  test('the changelog dates only its latest release', () => {
    expect(latestDateOnly('## 0.5.0 (2026-10-21)\n\nx\n\n## 0.4.1 (2026-10-20)\n')).toBe(
      '## 0.5.0 (2026-10-21)\n\nx\n\n## 0.4.1\n',
    );
  });
});

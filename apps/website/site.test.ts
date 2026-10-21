import { describe, expect, test } from 'bun:test';
import { posix } from 'node:path';
import { EXAMPLES, exampleResult } from './build/examples';
import { generatedPages } from './build/pages';
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
        if (page !== './' && !pages.has(page) && !['playground/', ''].includes(page))
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

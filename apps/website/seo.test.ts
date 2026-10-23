import { describe, expect, test } from 'bun:test';
import { generatedPages } from './build/pages';
import { source } from './build/plugin';
import { feed, robots, seoHead, sitemap, snippet } from './build/seo';
import { fill, SITE_URL } from './build/site';

const generated = [...generatedPages()];
const hand: [string, string][] = [
  ['', 'index.html'],
  ['playground/', 'playground/index.html'],
  ['font-checker/', 'font-checker/index.html'],
].map(([path, file]) => [path as string, fill(source(file as string))]);
const pages: [string, string][] = [...generated, ...hand];
const indexable = pages.filter(([, html]) => !html.includes('noindex'));

describe('search and sharing tags', () => {
  test('every indexable page has a canonical address, a card, an image and structured data', () => {
    for (const [path, html] of indexable) {
      const head = seoHead(html, path);
      expect(head, path).toContain(`<link rel="canonical" href="${SITE_URL}/${path}" />`);
      for (const tag of ['og:title', 'og:description', 'og:url', 'og:image', 'twitter:card'])
        expect(head, `${path} ${tag}`).toContain(tag);
      expect(head, path).toContain('application/ld+json');
    }
  });

  test('the structured data of every page is valid JSON', () => {
    for (const [path, html] of indexable) {
      const data = /ld\+json">(.*)<\/script>/.exec(seoHead(html, path))?.[1];
      expect(() => JSON.parse(data ?? ''), path).not.toThrow();
    }
  });

  test('a page marked noindex gets no tags', () => {
    expect(seoHead('<title>x</title><meta name="robots" content="noindex" />', 'docs/')).toBe('');
    expect(source('404.html')).toContain('noindex');
  });

  test('titles and descriptions are not shared by two pages, and are not empty', () => {
    const seen = new Map<string, string>();
    for (const [path, html] of indexable) {
      const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? '';
      const description = /name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
      expect(title.length, path).toBeGreaterThan(0);
      expect(description.length, `${path} description`).toBeGreaterThan(60);
      for (const text of [title, description]) {
        expect(seen.get(text), `${path} repeats ${seen.get(text)}`).toBeUndefined();
        seen.set(text, path);
      }
    }
  });

  test('every page has one h1', () => {
    for (const [path, html] of indexable) expect(html.match(/<h1[\s>]/g)?.length, path).toBe(1);
  });

  test('the sitemap lists every indexable page and no other', () => {
    const map = sitemap(pages);
    for (const [path] of indexable) expect(map).toContain(`<loc>${SITE_URL}/${path}</loc>`);
    expect(map).not.toContain(`<loc>${SITE_URL}/docs/</loc>`);
    expect(robots()).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  test('the feed has an entry for each article', () => {
    const articles = generated.filter(
      ([path]) => path.startsWith('articles/') && path !== 'articles/',
    );
    expect([...feed().matchAll(/<entry>/g)]).toHaveLength(articles.length);
  });

  test('a snippet ends on a whole word', () => {
    const text = 'word '.repeat(60);
    const out = snippet(text, 100);
    expect(out.length).toBeLessThanOrEqual(100);
    expect(out.endsWith('word…')).toBe(true);
    expect(snippet('short one', 100)).toBe('short one');
  });
});

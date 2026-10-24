import { describe, expect, test } from 'bun:test';
import { posix } from 'node:path';
import { explain, typographic } from '../../src';
import { articles, latestDateOnly } from './build/content';
import { EXAMPLES, exampleResult } from './build/examples';
import { generatedPages, latestArticles } from './build/pages';
import { externalLinks, rootLinks, source } from './build/plugin';
import { FACTS, fill, SITE_URL } from './build/site';

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
          !['playground/', 'font-checker/', 'comparison/', ''].includes(page)
        )
          missing.push(`${path} -> ${href}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('no placeholder is left unfilled', () => {
    for (const html of pages.values()) expect(fill(html)).not.toMatch(/\{\{\w+\}\}/);
  });

  test('the hand-written pages name only facts that exist', () => {
    // A page quoting `{{checks}}` with no such fact would ship the braces as text.
    for (const name of [
      'index.html',
      'playground/index.html',
      'font-checker/index.html',
      'comparison/index.html',
      '404.html',
    ]) {
      expect(fill(source(name)), name).not.toMatch(/\{\{\w+\}\}/);
    }
  });

  test('no hand-written page types a curly quote outside code: the house style would reset it', () => {
    // The build typesets every page with guillemets, so a typed “…” or ‘…’ in prose comes out «…».
    // An example of such a mark goes in <code> (left alone) or is set by a script.
    for (const name of [
      'index.html',
      'playground/index.html',
      'font-checker/index.html',
      'comparison/index.html',
      '404.html',
    ]) {
      const prose = source(name).replace(/<(code|pre|script|style|textarea)\b[\s\S]*?<\/\1>/g, '');
      expect(prose.match(/.{0,30}[“”‘].{0,30}/g) ?? [], name).toEqual([]);
    }
  });

  test('the landing page builds its numbers and its articles from the engine and the content', () => {
    const landing = fill(source('index.html'));
    for (const fact of ['langs', 'rules', 'rulesOn', 'rulesOff', 'version'])
      expect(landing, fact).toContain(FACTS[fact] as string);
    const notes = latestArticles();
    expect([...notes.matchAll(/<li>/g)]).toHaveLength(3);
    expect(notes).toContain('min read');
    // The newest article first, and a link that lands on a page of the site.
    const first = articles()[0];
    expect(notes).toContain(`./${first?.path}`);
    expect(pages.has(first?.path ?? '')).toBe(true);
  });

  test('the code sample on the landing shows what the engine returns', () => {
    // The sample shows a no-break space as a plain one and says so in its comment.
    const code =
      /<code class="language-ts">([\s\S]*?)<\/code>/.exec(source('index.html'))?.[1] ?? '';
    const shown = (call: string) => code.split(`${call}\n// `)[1]?.split('\n')[0] ?? '';
    const output = typographic('He said "we\'re here" - and left.', 'en', { quoteStyle: 'us' });
    expect(code).toContain(
      `typographic('He said "we\\'re here" - and left.', 'en', { quoteStyle: 'us' });`,
    );
    expect(output).toContain('\u00a0—');
    expect(
      shown(`typographic('He said "we\\'re here" - and left.', 'en', { quoteStyle: 'us' });`),
    ).toBe(`${output.replace(/\u00a0/g, ' ')}  (a no-break space before the dash)`);
    const changes = explain('He said "hi"... 21-26', 'en', { quoteStyle: 'us' }).changes;
    expect(shown(`explain('He said "hi"... 21-26', 'en', { quoteStyle: 'us' }).changes;`)).toBe(
      changes.map((change) => `${change.rule} ${change.to}`).join(' · '),
    );
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
  test('the 404 page links from the site root, so it works at any depth', () => {
    // GitHub Pages serves 404.html for a missing address at any depth, and a relative link there
    // would resolve against that address (`/docs/typo/` loading `/docs/assets/style.css`).
    expect(
      rootLinks('<a href="./docs/api/">x</a><script src="./assets/m.js">', '/typography/'),
    ).toBe('<a href="/typography/docs/api/">x</a><script src="/typography/assets/m.js">');
    expect(rootLinks('<link href="../../assets/style.css">', '/')).toBe(
      '<link href="/assets/style.css">',
    );
    expect(rootLinks('<a href="https://x.y/">x</a>', '/typography/')).toBe(
      '<a href="https://x.y/">x</a>',
    );
    expect(rootLinks('<a href="#top">x</a>', '/typography/')).toBe('<a href="#top">x</a>');
  });

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

  test("a link in the docs to the site's own address is a page of the site", () => {
    const api = pages.get('docs/api/') ?? '';
    expect(api).toContain('href="../../font-checker/"');
    expect(api).not.toContain(`href="${SITE_URL}`);
  });

  test('the changelog dates only its latest release', () => {
    expect(latestDateOnly('## 0.5.0 (2026-10-21)\n\nx\n\n## 0.4.1 (2026-10-20)\n')).toBe(
      '## 0.5.0 (2026-10-21)\n\nx\n\n## 0.4.1\n',
    );
  });
});

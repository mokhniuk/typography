import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Plugin } from 'vite';
import { typesetHtml } from '../../../src/html';
import { footer, header, rootOf } from './chrome';
import { examplesFigure, samplesTable, specimenFigure } from './examples';
import { markHangsInPage } from './hang';
import { highlightHtml } from './highlight';
import { generatedPages, latestArticles } from './pages';
import { feed, forget, robots, seoHead, sitemap } from './seo';
import { BASE, fill, SITE_ROOT, TYPESET } from './site';

/** The path of a page on the site: "docs/api/", "" for the landing page. */
const pathOf = (file: string): string => {
  const rel = relative(SITE_ROOT, file).replaceAll('\\', '/');
  return /(^|\/)index\.html$/.test(rel) ? rel.replace(/index\.html$/, '') : '';
};

/**
 * Every relative link and asset of a page made absolute from the site root (`BASE`). `404.html` is
 * served for any missing address, at any depth, so a relative link in it would resolve against that
 * address: `/docs/typo/` would load `/docs/assets/style.css`. Only this one page needs it.
 */
export const rootLinks = (html: string, base: string = BASE): string =>
  html.replace(/(href|src)="(?:\.\.?\/)+/g, `$1="${base}`);

/** A link to another site opens in a new tab; one that already says where it opens is left alone. */
export function externalLinks(html: string): string {
  return html.replace(/<a\s([^>]*\bhref="https?:\/\/[^"]*"[^>]*)>/g, (tag, attrs: string) => {
    if (/\btarget=/.test(attrs)) return tag;
    const rel = /\brel="([^"]*)"/.exec(attrs)?.[1];
    const words = new Set([...(rel ?? '').split(/\s+/).filter(Boolean), 'noopener']);
    const kept = attrs.replace(/\s*\brel="[^"]*"/, '');
    return `<a ${kept} target="_blank" rel="${[...words].join(' ')}">`;
  });
}

/** The faces every page uses, fetched with the page so the text does not reflow when they arrive. */
const FONTS = ['Regular', 'Medium', 'Bold'];
const preload = (path: string): string =>
  FONTS.map(
    (weight) =>
      `<link rel="preload" href="${rootOf(path)}fonts/KyivType/KyivTypeSans-${weight}.woff2" as="font" type="font/woff2" crossorigin />`,
  ).join('\n');

/** What every page goes through: the shared header and footer, the numbers, the engine's own typesetting. */
export function finish(html: string, path: string): string {
  const filled = fill(html)
    .replace('<!--header-->', () => header(path))
    .replace('<!--footer-->', () => footer(path))
    .replace('<!--examples-->', () => examplesFigure())
    .replace('<!--specimen-->', () => specimenFigure())
    .replace('<!--samples-->', () => samplesTable())
    .replace('<!--articles-->', () => latestArticles());
  // The head tags are made from the finished title and description, so they come last.
  const withHead = filled.replace(
    '</head>',
    () => `${seoHead(filled, path)}\n${preload(path)}\n</head>`,
  );
  return markHangsInPage(typesetHtml(externalLinks(highlightHtml(withHead)), TYPESET));
}

/**
 * Pages made from content (docs from the repository's Markdown, articles) have no file on disk:
 * they are loaded from memory under the path they would have, so Vite bundles their script and
 * stylesheet like any other page's. Every page is typeset by the engine, which is the point.
 */
export function website(): Plugin {
  const virtual = new Map<string, string>();
  const index = () => {
    forget();
    virtual.clear();
    for (const [path, html] of generatedPages())
      virtual.set(join(SITE_ROOT, path, 'index.html'), html);
  };
  index();
  return {
    name: 'typography-website',
    config(config) {
      const hand = [
        'index.html',
        'playground/index.html',
        'font-checker/index.html',
        '404.html',
      ].map((name) => join(SITE_ROOT, name));
      return {
        build: {
          rollupOptions: {
            input: {
              ...Object.fromEntries(
                [...hand, ...virtual.keys()].map((file) => [relative(SITE_ROOT, file), file]),
              ),
              ...(config.build?.rollupOptions?.input as object),
            },
          },
        },
      };
    },
    resolveId(id) {
      return virtual.has(id) ? id : undefined;
    },
    load(id) {
      return virtual.get(id);
    },
    configureServer(server) {
      server.watcher.add([
        join(SITE_ROOT, 'content'),
        join(SITE_ROOT, '../../docs'),
        join(SITE_ROOT, '../../CHANGELOG.md'),
      ]);
      server.watcher.on('change', (file) => {
        if (file.endsWith('.md')) {
          index();
          server.ws.send({ type: 'full-reload' });
        }
      });
      // A generated page has no file, so the dev server is told what it would have served.
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? '').split(/[?#]/)[0] ?? '';
        const path = url.replace(/^\//, '');
        const html = virtual.get(
          join(SITE_ROOT, path.endsWith('/') ? path : `${path}/`, 'index.html'),
        );
        if (!html) return next();
        const out = await server.transformIndexHtml(url, html);
        res.setHeader('Content-Type', 'text/html');
        res.end(out);
      });
    },
    // Vite's own HTML plugin emits the page in its `generateBundle`, so this one runs after it
    // (`order: 'post'`); before the asset names are rewritten there is nothing to fix up.
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        // The files a search engine looks for, made from the pages as they were written.
        const pages: [string, string][] = [];
        for (const [name, file] of Object.entries(bundle)) {
          if (
            file.type === 'asset' &&
            typeof file.source === 'string' &&
            /(^|\/)index\.html$/.test(name)
          )
            pages.push([name.replace(/index\.html$/, ''), file.source]);
        }
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(pages) });
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots() });
        this.emitFile({ type: 'asset', fileName: 'feed.xml', source: feed() });
        const notFound = bundle['404.html'];
        if (notFound?.type === 'asset' && typeof notFound.source === 'string')
          notFound.source = rootLinks(notFound.source);
      },
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const path = ctx.filename
          ? pathOf(ctx.filename)
          : ctx.path.replace(/^\//, '').replace(/index\.html$/, '');
        return finish(html, path);
      },
    },
  };
}

/** The raw text of a hand-written page, for the tests. */
export const source = (name: string): string => readFileSync(join(SITE_ROOT, name), 'utf8');

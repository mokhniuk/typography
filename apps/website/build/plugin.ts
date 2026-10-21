import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Plugin } from 'vite';
import { typesetHtml } from '../../../src/html';
import { footer, header } from './chrome';
import { examplesFigure, samplesTable, specimenFigure } from './examples';
import { generatedPages } from './pages';
import { fill, SITE_ROOT, TYPESET } from './site';

/** The path of a page on the site: "docs/api/", "" for the landing page. */
const pathOf = (file: string): string => {
  const rel = relative(SITE_ROOT, file).replaceAll('\\', '/');
  return /(^|\/)index\.html$/.test(rel) ? rel.replace(/index\.html$/, '') : '';
};

/** What every page goes through: the shared header and footer, the numbers, the engine's own typesetting. */
function finish(html: string, path: string): string {
  const filled = fill(html)
    .replace('<!--header-->', () => header(path))
    .replace('<!--footer-->', () => footer(path))
    .replace('<!--examples-->', () => examplesFigure())
    .replace('<!--specimen-->', () => specimenFigure())
    .replace('<!--samples-->', () => samplesTable());
  return typesetHtml(filled, TYPESET);
}

/**
 * Pages made from content (docs from the repository's Markdown, articles) have no file on disk:
 * they are loaded from memory under the path they would have, so Vite bundles their script and
 * stylesheet like any other page's. Every page is typeset by the engine, which is the point.
 */
export function website(): Plugin {
  const virtual = new Map<string, string>();
  const index = () => {
    virtual.clear();
    for (const [path, html] of generatedPages())
      virtual.set(join(SITE_ROOT, path, 'index.html'), html);
  };
  index();
  return {
    name: 'typography-website',
    config(config) {
      const hand = ['index.html', 'playground/index.html', '404.html'].map((name) =>
        join(SITE_ROOT, name),
      );
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
    // 404.html is served for any missing address, at any depth, so its links must start at the root.
    generateBundle(_options, bundle) {
      const notFound = bundle['404.html'];
      if (notFound?.type === 'asset' && typeof notFound.source === 'string')
        notFound.source = notFound.source.replace(/(href|src)="\.\.?\//g, '$1="/');
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

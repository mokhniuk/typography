import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LANGS, RULES } from '../../../src/core';

export const SITE_ROOT = join(import.meta.dirname, '..');
export const REPO_ROOT = join(SITE_ROOT, '..', '..');

export const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as {
  version: string;
};

/**
 * Where the site is served from. Every page links relatively, so the site works at any depth without
 * this; the one exception is `404.html`, which the host serves for a missing address at any depth,
 * so its links must start at the site root. `/` unless `SITE_BASE` says otherwise: the site is served
 * at the root of `typography.mokhni.uk`.
 */
export const BASE = (process.env.SITE_BASE ?? '/').replace(/\/*$/, '/');

/** The site's own address. A link to it in the repository's Markdown becomes a link inside the site. */
export const SITE_URL = 'https://typography.mokhni.uk';
export const GITHUB = 'https://github.com/mokhniuk/typography';
export const NAME = 'Typography Engine';
export const AUTHOR = { name: 'Oleg Mokhniuk', url: 'https://oleg.berlin' } as const;
export const NPM_URL = 'https://www.npmjs.com/package/@mokhniuk/typography';
/**
 * The site's visitor statistics: a self-hosted Umami, which sets no cookie. Its origin is in the
 * `script-src` and `connect-src` of the Content-Security-Policy (`nginx.conf`), because the script is
 * loaded from it and reports each visit back to it.
 */
export const ANALYTICS = {
  origin: 'https://umami.mokhni.uk',
  websiteId: 'ecef9bb1-f636-445c-8a7b-72d4e4600b70',
} as const;
/** The tag every page carries, last in its head. */
export const ANALYTICS_TAG = `<script defer src="${ANALYTICS.origin}/script.js" data-website-id="${ANALYTICS.websiteId}"></script>`;
/** The image a link to any page shows when it is shared; made by `scripts/site-images.ts`. */
export const SHARE_IMAGE = { file: 'og.png', width: 1200, height: 630 } as const;
export const SHARE_ALT =
  'Typography Engine: straight quotes, hyphens and plain spaces set as real quotation marks, dashes and no-break spaces.';

/** Where a reader reports a problem: a new GitHub issue. */
export const ISSUES = `${GITHUB}/issues/new`;
/** A new issue with its title and body filled in. */
export const issueUrl = (title: string, body: string): string =>
  `${ISSUES}?${new URLSearchParams({ title, body })}`;

/** How the site sets its own text: the engine, with guillemets as the house style. */
export const TYPESET = { lang: 'en', quoteStyle: 'guillemets' } as const;

/** Numbers the pages quote, read from the engine so they cannot go stale. */
export const FACTS: Record<string, string> = {
  version: pkg.version,
  rules: String(RULES.length),
  rulesOn: String(RULES.filter((rule) => rule.defaultOn !== false).length),
  rulesOff: String(RULES.filter((rule) => rule.defaultOn === false).length),
  langs: String(LANGS.length),
  issues: ISSUES,
};

export const NAV = [
  // Docs opens on Getting started and stays current on every page under docs/.
  { href: 'docs/getting-started/', label: 'Docs', match: 'docs/' },
  { href: 'playground/', label: 'Playground' },
  { href: 'font-checker/', label: 'Fonts' },
  { href: 'articles/', label: 'Articles' },
] as const;

/** `{{name}}` placeholders in a page become the value in `FACTS`. */
export const fill = (html: string): string =>
  html.replace(/\{\{(\w+)\}\}/g, (whole, name: string) => FACTS[name] ?? whole);

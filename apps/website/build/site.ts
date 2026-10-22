import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LANGS, RULES } from '../../../src/core';

export const SITE_ROOT = join(import.meta.dirname, '..');
export const REPO_ROOT = join(SITE_ROOT, '..', '..');

const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as {
  version: string;
};

/**
 * Where the site is served from. Every page links relatively, so the site works at any depth without
 * this; the one exception is `404.html`, which GitHub Pages serves for a missing address at any
 * depth, so its links must start at the site root. `/` unless `SITE_BASE` says otherwise (the Pages
 * workflow sets `/typography/`, the repository's project page).
 */
export const BASE = (process.env.SITE_BASE ?? '/').replace(/\/*$/, '/');

export const GITHUB = 'https://github.com/mokhniuk/typography';
export const NAME = 'Typography Engine';
/** Where a reader reports a problem: a new GitHub issue. */
export const ISSUES = `${GITHUB}/issues/new`;
/** A new issue with its title and body filled in. */
export const issueUrl = (title: string, body: string): string =>
  `${ISSUES}?${new URLSearchParams({ title, body })}`;

/** How the site sets its own text: the engine, with American quotes because the readers are English. */
export const TYPESET = { lang: 'en', quoteStyle: 'us' } as const;

/**
 * Numbers the pages quote. The engine's own are read from it, so they cannot go stale; the
 * benchmark's come from one run of `apps/bench` and are written down here, in one place, with the
 * run they are from (`apps/bench/RESULTS.md`, 2026-10-22 — read the caveats in docs/limits.md: the
 * cases were written by this package's author, and only the ratios between the tools mean much).
 */
export const FACTS: Record<string, string> = {
  version: pkg.version,
  rules: String(RULES.length),
  rulesOn: String(RULES.filter((rule) => rule.defaultOn !== false).length),
  rulesOff: String(RULES.filter((rule) => rule.defaultOn === false).length),
  langs: String(LANGS.length),
  issues: ISSUES,
  git: `git+ssh://git@github.com/mokhniuk/typography.git#v${pkg.version}`,
  /** Benchmark: checks passed in the default setup, and in the literary register. */
  checks: '242 / 250',
  checksLiterary: '250 / 250',
  /** 1 MB of English in one piece, text mode, and the closest tool in scope in the same run. */
  speed: '63 ms',
  speedOther: '118 ms',
  tools: '6',
};

export const NAV = [
  // Docs opens on Getting started and stays current on every page under docs/.
  { href: 'docs/getting-started/', label: 'Docs', match: 'docs/' },
  { href: 'playground/', label: 'Playground' },
  { href: 'font-checker/', label: 'Fonts' },
  { href: 'articles/', label: 'Articles' },
  { href: 'docs/changelog/', label: 'Changelog' },
] as const;

/** `{{name}}` placeholders in a page become the value in `FACTS`. */
export const fill = (html: string): string =>
  html.replace(/\{\{(\w+)\}\}/g, (whole, name: string) => FACTS[name] ?? whole);

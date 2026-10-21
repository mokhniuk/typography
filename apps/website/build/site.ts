import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LANGS, RULES } from '../../../src/core';

export const SITE_ROOT = join(import.meta.dirname, '..');
export const REPO_ROOT = join(SITE_ROOT, '..', '..');

const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as {
  version: string;
};

export const GITHUB = 'https://github.com/mokhniuk/typography';
export const NAME = 'Podiia Typography';

/** How the site sets its own text: the engine, with American quotes because the readers are English. */
export const TYPESET = { lang: 'en', quoteStyle: 'us' } as const;

/** Numbers the pages quote, read from the engine so they cannot go stale. */
export const FACTS: Record<string, string> = {
  version: pkg.version,
  rules: String(RULES.length),
  rulesOn: String(RULES.filter((rule) => rule.defaultOn !== false).length),
  rulesOff: String(RULES.filter((rule) => rule.defaultOn === false).length),
  langs: String(LANGS.length),
  git: `git+ssh://git@github.com/mokhniuk/typography.git#v${pkg.version}`,
};

export const NAV = [
  { href: 'docs/', label: 'Docs' },
  { href: 'playground/', label: 'Playground' },
  { href: 'articles/', label: 'Articles' },
] as const;

/** `{{name}}` placeholders in a page become the value in `FACTS`. */
export const fill = (html: string): string =>
  html.replace(/\{\{(\w+)\}\}/g, (whole, name: string) => FACTS[name] ?? whole);

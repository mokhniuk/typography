import { readdirSync, readFileSync } from 'node:fs';
import { join, posix, relative } from 'node:path';
import { PACKS } from '../../../src/core';
import { frontMatter, type Heading, render } from './markdown';
import { GITHUB, REPO_ROOT, SITE_ROOT, SITE_URL } from './site';

export type Doc = {
  /** The page's path on the site, with a trailing slash: `docs/api/`. */
  path: string;
  /** The source file, relative to the repository. */
  source: string;
  group: string;
  label: string;
  html: string;
  headings: Heading[];
  title: string;
  lead: string;
  /** What a search result says about the page. */
  description: string;
};

export type Article = {
  path: string;
  title: string;
  summary: string;
  date: string;
  /** The mark on the article's card (front matter `glyph`); the title's first letter without one. */
  glyph: string;
  /** Reading time in minutes, at 220 words a minute. */
  minutes: number;
  html: string;
  headings: Heading[];
};

/** The hand-ordered part of the docs; the language pages are added after it. */
const DOC_FILES: {
  source: string;
  slug: string;
  group: string;
  label: string;
  description: string;
}[] = [
  {
    source: 'apps/website/content/docs/getting-started.md',
    slug: 'getting-started',
    group: 'Start',
    label: 'Getting started',
    description:
      'Install Typography Engine from npm, typeset a string, and pick the mode for your text: plain text, HTML, Markdown, React or the command line.',
  },
  {
    source: 'docs/api.md',
    slug: 'api',
    group: 'Reference',
    label: 'API',
    description:
      'The API reference: every entry point of @mokhniuk/typography, its options (language, register, quote style, rules) and what each function returns.',
  },
  {
    source: 'docs/cli.md',
    slug: 'cli',
    group: 'Reference',
    label: 'Command line',
    description:
      'The typo command: typeset files in place, check them in CI, read from standard input, and keep your settings in a config file. Runs on Node and Bun.',
  },
  {
    source: 'docs/rules.md',
    slug: 'rules',
    group: 'Reference',
    label: 'Rules',
    description:
      'Every typography rule the engine applies, in order, with an example, the reason for it and how to switch it on or off.',
  },
  {
    source: 'docs/languages.md',
    slug: 'languages',
    group: 'Reference',
    label: 'Languages',
    description:
      'The language packs behind the engine: quotation marks, dashes, spacing habits and abbreviations for the 24 EU languages, Ukrainian and Swiss German and French.',
  },
  {
    source: 'docs/limits.md',
    slug: 'limits',
    group: 'Guides',
    label: 'Known limits',
    description:
      'What the engine leaves alone on purpose, what it cannot know from text alone, and the input it reads wrongly. Read it before you rely on the output.',
  },
  {
    source: 'docs/practices.md',
    slug: 'practices',
    group: 'Guides',
    label: 'Good practices',
    description:
      'What to bind with a no-break space, what to leave to the browser and what never to do, with the source behind each decision.',
  },
  {
    source: 'docs/contributing.md',
    slug: 'contributing',
    group: 'Guides',
    label: 'Contributing',
    description:
      'How to work on Typography Engine: the checks, adding a rule or a language pack, tests, the benchmark, and how a release is made.',
  },
  {
    source: 'CHANGELOG.md',
    slug: 'changelog',
    group: 'Project',
    label: 'Changelog',
    description:
      'Every release of Typography Engine, newest first, with whether it can change the output you already have.',
  },
];

/** Repository path to site path, for every file the site publishes. */
function sitePaths(): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of DOC_FILES) map.set(file.source, `docs/${file.slug}/`);
  map.set('docs/languages/index.md', 'docs/languages/all/');
  for (const name of readdirSync(join(REPO_ROOT, 'docs/languages'))) {
    if (name.endsWith('.md') && name !== 'index.md')
      map.set(`docs/languages/${name}`, `docs/languages/${name.slice(0, -3)}/`);
  }
  return map;
}

/** Maps a link found in `source` (a repository path) to a link valid from the page at `from`. */
function linker(source: string, from: string): (href: string) => string {
  const paths = sitePaths();
  return (raw) => {
    // The site's own address, written so the link also works on GitHub, is a page of the site here.
    const href = raw.startsWith(`${SITE_URL}/`) ? raw.slice(SITE_URL.length) : raw;
    if (/^([a-z]+:|#|\/\/)/i.test(href)) return href;
    // A link that starts with a slash is a page of the site: `/docs/api/#options`.
    if (href.startsWith('/')) {
      const [site = '', anchor] = href.slice(1).split('#');
      return `${posix.relative(from, site) || '.'}/${anchor ? `#${anchor}` : ''}`;
    }
    const [file = '', hash] = href.split('#');
    const target = posix.normalize(posix.join(posix.dirname(source), file));
    const suffix = hash ? `#${hash}` : '';
    const page = paths.get(target);
    if (page) return `${posix.relative(from, page) || '.'}/${suffix}`;
    // Anything else in the repository (a source file, a folder, the benchmark) is read on GitHub.
    return `${GITHUB}/blob/main/${target}${suffix}`;
  };
}

export function docs(): Doc[] {
  const entries = [...DOC_FILES.map((file) => ({ ...file, path: `docs/${file.slug}/` }))];
  entries.push({
    source: 'docs/languages/index.md',
    slug: 'all',
    group: 'Languages',
    label: 'All languages',
    path: 'docs/languages/all/',
    description:
      'All language packs of Typography Engine on one page: each language with its quotation marks, its review status and the sources it was written from.',
  });
  for (const name of readdirSync(join(REPO_ROOT, 'docs/languages')).sort()) {
    if (!name.endsWith('.md') || name === 'index.md') continue;
    const file = name.slice(0, -3);
    // The page is named in lower case (de-ch.md); the label is the pack's code as written (de-CH).
    const code = PACKS.find((pack) => pack.code.toLowerCase() === file)?.code ?? file;
    entries.push({
      source: `docs/languages/${name}`,
      slug: file,
      group: 'Languages',
      label: code,
      path: `docs/languages/${file}/`,
      description: '',
    });
  }
  return entries.map((entry) => {
    const source = readFileSync(join(REPO_ROOT, entry.source), 'utf8');
    const markdown = entry.source === 'CHANGELOG.md' ? latestDateOnly(source) : source;
    const out = render(markdown, linker(entry.source, entry.path));
    if (entry.group !== 'Languages' || entry.path === 'docs/languages/all/')
      return {
        ...entry,
        ...out,
        title: entry.path === 'docs/languages/all/' ? 'All languages' : out.title,
      };
    // A language page names the language and its marks; the title says what the page is about.
    const marks = /^\| display \| (.+) \|$/m.exec(source)?.[1]?.replace(/`/g, '') ?? '';
    const description = `${out.title} typography: quotation marks ${marks}, the dash, spacing, abbreviations and short words, with the sources behind each choice.`;
    return { ...entry, ...out, title: `${out.title} typography`, description };
  });
}

/** On the site the changelog dates only its latest release: `## 0.4.1 (2026-10-21)` is `## 0.4.1`. */
export function latestDateOnly(markdown: string): string {
  let seen = false;
  return markdown.replace(/^(## \d+\.\d+\.\d+) \([\d-]+\)$/gm, (heading, version: string) => {
    if (seen) return version;
    seen = true;
    return heading;
  });
}

export function articles(): Article[] {
  const dir = join(SITE_ROOT, 'content/articles');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const { data, body } = frontMatter(readFileSync(join(dir, name), 'utf8'));
      const slug = name.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
      const path = `articles/${slug}/`;
      const out = render(body, linker(relative(REPO_ROOT, join(dir, name)), path));
      return {
        path,
        title: data.title ?? out.title,
        summary: data.summary ?? out.lead,
        date: data.date ?? '',
        glyph: data.glyph ?? (data.title ?? out.title).charAt(0),
        minutes: Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220)),
        html: out.html,
        headings: out.headings,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

import { rootOf } from './chrome';
import { articles } from './content';
import { AUTHOR, NAME, NPM_URL, pkg, SHARE_ALT, SHARE_IMAGE, SITE_URL } from './site';

/** Pages that are not for a search engine: no canonical address, no card, no entry in the sitemap. */
const hidden = (html: string): boolean => /<meta name="robots" content="[^"]*noindex/.test(html);

const decode = (text: string): string =>
  text
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#x22;|&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

export const escapeAttribute = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A description for a snippet: whole words, about 155 characters, one line. */
export function snippet(text: string, max = 155): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const word = cut.replace(/\s+\S*$/, '');
  return `${(word.length > max / 2 ? word : cut).replace(/[\s,;:.\-–—]+$/, '')}…`;
}

/** The address of a page. */
export const urlOf = (path: string): string => `${SITE_URL}/${path}`;

const published = (): Map<string, { date: string; title: string; summary: string }> =>
  new Map(articles().map((a) => [a.path, a]));
let known: ReturnType<typeof published> | undefined;
/** Forget the articles read so far (the dev server calls this when a Markdown file changes). */
export const forget = (): void => {
  known = undefined;
};
const article = (path: string) => {
  known ??= published();
  return known.get(path);
};

type Crumb = { name: string; path: string };

/** Home, then the section, then the page: the trail a search result may show instead of the address. */
function crumbs(path: string, name: string): Crumb[] {
  const trail: Crumb[] = [{ name: NAME, path: '' }];
  if (path.startsWith('docs/')) {
    trail.push({ name: 'Docs', path: 'docs/getting-started/' });
    if (path.startsWith('docs/languages/') && path !== 'docs/languages/all/')
      trail.push({ name: 'Languages', path: 'docs/languages/all/' });
  } else if (path.startsWith('articles/') && path !== 'articles/') {
    trail.push({ name: 'Articles', path: 'articles/' });
  }
  trail.push({ name, path });
  return trail;
}

const person = { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url } as const;
const image = `${SITE_URL}/${SHARE_IMAGE.file}`;

/** The structured data of a page, as the objects of one `@graph`. */
function graph(path: string, name: string, description: string): object[] {
  const url = urlOf(path);
  const site = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: NAME,
    url: `${SITE_URL}/`,
    inLanguage: 'en',
    publisher: person,
  };
  if (path === '') {
    return [
      site,
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#software`,
        name: NAME,
        description,
        url: `${SITE_URL}/`,
        image,
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'Typography library',
        operatingSystem: 'Any (Node.js 20.10 or later, Bun, browsers)',
        softwareVersion: pkg.version,
        license: 'https://opensource.org/licenses/MIT',
        downloadUrl: NPM_URL,
        installUrl: NPM_URL,
        programmingLanguage: 'TypeScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: person,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
    ];
  }
  const items: object[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs(path, name).map((crumb, at) => ({
        '@type': 'ListItem',
        position: at + 1,
        name: crumb.name,
        item: urlOf(crumb.path),
      })),
    },
  ];
  const post = article(path);
  if (post) {
    items.push({
      '@type': 'Article',
      headline: post.title,
      description: post.summary,
      datePublished: post.date,
      dateModified: post.date,
      image,
      author: person,
      publisher: person,
      inLanguage: 'en',
      mainEntityOfPage: url,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    });
  } else if (path === 'playground/' || path === 'font-checker/') {
    items.push({
      '@type': 'WebApplication',
      name,
      description,
      url,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any (in a browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: person,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    });
  } else if (path.startsWith('docs/')) {
    items.push({
      '@type': 'TechArticle',
      headline: name,
      description,
      url,
      image,
      author: person,
      publisher: person,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    });
  }
  return items;
}

/**
 * What a search engine and a link preview read from the head, written once for every page from the
 * page's own title and description: the canonical address, Open Graph and Twitter cards, the colour
 * of the browser bar, the feed, icons and structured data. A page that says `noindex` gets none of it.
 */
export function seoHead(html: string, path: string): string {
  if (hidden(html)) return '';
  const title = decode(/<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? NAME);
  const description = decode(/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '');
  const name = title.replace(` · ${NAME}`, '');
  const url = urlOf(path);
  const post = article(path);
  const attr = escapeAttribute;
  const root = rootOf(path);
  const lines = [
    `<link rel="canonical" href="${url}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />',
    `<meta name="author" content="${AUTHOR.name}" />`,
    '<meta name="theme-color" content="#fcfcfc" media="(prefers-color-scheme: light)" />',
    '<meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />',
    `<meta property="og:site_name" content="${NAME}" />`,
    `<meta property="og:type" content="${post ? 'article' : 'website'}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${attr(name)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="${SHARE_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${SHARE_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="${attr(SHARE_ALT)}" />`,
    ...(post
      ? [
          `<meta property="article:published_time" content="${post.date}" />`,
          `<meta property="article:author" content="${AUTHOR.url}" />`,
        ]
      : []),
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${attr(name)}" />`,
    `<meta name="twitter:description" content="${attr(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${attr(SHARE_ALT)}" />`,
    `<link rel="icon" href="${root}icon-192.png" type="image/png" sizes="192x192" />`,
    `<link rel="apple-touch-icon" href="${root}apple-touch-icon.png" />`,
    `<link rel="alternate" type="application/atom+xml" title="${NAME}: articles" href="${root}feed.xml" />`,
  ];
  const data = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph(path, name, description),
  });
  // `<` is escaped so that no text in the data can close the script element early.
  lines.push(`<script type="application/ld+json">${data.replace(/</g, '\\u003c')}</script>`);
  return lines.join('\n');
}

const xml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** `sitemap.xml`: every page that may be indexed; an article carries the date it was written. */
export function sitemap(pages: Iterable<[string, string]>): string {
  const rows = [...pages]
    .filter(([, html]) => !hidden(html))
    .map(([path]) => path)
    .sort((a, b) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b)))
    .map((path) => {
      const date = article(path)?.date;
      return `  <url><loc>${xml(urlOf(path))}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join('\n')}
</urlset>
`;
}

export const robots = (): string => `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

/** `feed.xml`: an Atom feed of the articles, newest first. */
export function feed(): string {
  const posts = articles();
  const updated = `${posts[0]?.date ?? '1970-01-01'}T00:00:00Z`;
  const entries = posts
    .map(
      (post) => `  <entry>
    <title>${xml(post.title)}</title>
    <link href="${xml(urlOf(post.path))}" />
    <id>${xml(urlOf(post.path))}</id>
    <published>${post.date}T00:00:00Z</published>
    <updated>${post.date}T00:00:00Z</updated>
    <summary>${xml(post.summary)}</summary>
  </entry>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <title>${NAME}: articles</title>
  <subtitle>Notes on typography and on how ${NAME} makes its decisions.</subtitle>
  <link href="${SITE_URL}/feed.xml" rel="self" />
  <link href="${SITE_URL}/articles/" />
  <id>${SITE_URL}/articles/</id>
  <updated>${updated}</updated>
  <author><name>${AUTHOR.name}</name><uri>${AUTHOR.url}</uri></author>
${entries}
</feed>
`;
}

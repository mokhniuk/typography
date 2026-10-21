import { page, rootOf } from './chrome';
import { type Article, articles, type Doc, docs } from './content';
import { issueUrl, NAME } from './site';

const esc = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const when = (date: string): string =>
  new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date));

function sidebar(all: Doc[], current: string): string {
  const root = rootOf(current);
  const groups = new Map<string, Doc[]>();
  for (const doc of all) {
    if (doc.group === 'Languages' && doc.path !== 'docs/languages/all/') continue;
    groups.set(doc.group, [...(groups.get(doc.group) ?? []), doc]);
  }
  const sections = [...groups]
    .map(
      ([group, items]) => `<section>
  <h2>${esc(group)}</h2>
  <ul>${items
    .map(
      (doc) =>
        `<li><a href="${root}${doc.path}"${doc.path === current ? ' aria-current="page"' : ''}>${esc(doc.label)}</a></li>`,
    )
    .join('')}</ul>
</section>`,
    )
    .join('\n');
  return `<nav aria-label="Documentation" data-sidebar>
  <details open>
    <summary>Documentation</summary>
    ${sections}
  </details>
</nav>`;
}

function contents(doc: Doc): string {
  const items = doc.headings.filter((heading) => heading.depth === 2);
  if (items.length < 2) return '';
  return `<aside aria-label="On this page">
  <h2>On this page</h2>
  <ul>${items.map((heading) => `<li><a href="#${heading.id}">${esc(heading.text)}</a></li>`).join('')}</ul>
</aside>`;
}

function neighbours(all: Doc[], doc: Doc): string {
  const flow = all.filter(
    (item) => item.group !== 'Languages' || item.path === 'docs/languages/all/',
  );
  const at = flow.indexOf(doc);
  if (at < 0) return '';
  const root = rootOf(doc.path);
  const prev = flow[at - 1];
  const next = flow[at + 1];
  const link = (item: Doc | undefined, rel: 'prev' | 'next') =>
    item
      ? `<a href="${root}${item.path}" rel="${rel}"><small>${rel === 'prev' ? 'Previous' : 'Next'}</small><span>${esc(item.label)}</span></a>`
      : '';
  return `<nav aria-label="Pages in order" data-pager>${link(prev, 'prev')}${link(next, 'next')}</nav>`;
}

/** The line at the end of a page that opens an issue about it, its title and address filled in. */
const report = (what: string, path: string): string => {
  const href = issueUrl(`${what}: `, `On the page \`/${path}\`:\n\n`);
  return `<p data-report>Something wrong or unclear here? <a href="${esc(href)}" rel="noopener">Report an issue</a>.</p>`;
};

function docPage(all: Doc[], doc: Doc): string {
  const root = rootOf(doc.path);
  const here = `<p data-crumbs><a href="${root}docs/">Docs</a> <span aria-hidden="true">/</span> ${esc(doc.group)}</p>`;
  return page({
    path: doc.path,
    title: doc.title,
    description: doc.lead.slice(0, 200),
    mainAttrs: 'data-layout="docs"',
    body: `${sidebar(all, doc.path)}
<article data-hanging>
${here}
${doc.html}
${report(`Docs, ${doc.title}`, doc.path)}
${neighbours(all, doc)}
</article>
${contents(doc)}`,
  });
}

function docsIndex(all: Doc[]): string {
  const root = rootOf('docs/');
  const cards = all
    .filter((doc) => doc.group !== 'Languages' || doc.path === 'docs/languages/all/')
    .map(
      (doc) =>
        `<li><a href="${root}${doc.path}"><small>${esc(doc.group)}</small><strong>${esc(doc.label)}</strong><span>${esc(doc.lead.slice(0, 130))}${doc.lead.length > 130 ? '…' : ''}</span></a></li>`,
    )
    .join('\n');
  return page({
    path: 'docs/',
    title: 'Documentation',
    description:
      'Install, use and look up every option, rule and language of the typography engine.',
    mainAttrs: 'data-layout="index"',
    body: `<div class="container">
<header>
  <h1>Documentation</h1>
  <p>Everything the engine does, with the reasons for it. The reference pages are generated from the code, so they say what the engine does today.</p>
</header>
<ul data-cards>
${cards}
</ul>
</div>`,
  });
}

function articlePage(all: Article[], article: Article): string {
  const root = rootOf(article.path);
  const at = all.indexOf(article);
  const newer = all[at - 1];
  const older = all[at + 1];
  const link = (item: Article | undefined, rel: 'prev' | 'next') =>
    item
      ? `<a href="${root}${item.path}" rel="${rel}"><small>${rel === 'prev' ? 'Newer' : 'Older'}</small><span>${esc(item.title)}</span></a>`
      : '';
  return page({
    path: article.path,
    title: article.title,
    description: article.summary,
    mainAttrs: 'data-layout="article"',
    body: `<article data-hanging>
<header>
  <p data-crumbs><a href="${root}articles/">Articles</a></p>
  <h1>${esc(article.title)}</h1>
  <p>${esc(article.summary)}</p>
  <p><time datetime="${article.date}">${when(article.date)}</time></p>
</header>
${article.html.replace(/^<h1[^>]*>[\s\S]*?<\/h1>\n?/, '')}
${report(`Article, ${article.title}`, article.path)}
<nav aria-label="More articles" data-pager>${link(newer, 'prev')}${link(older, 'next')}</nav>
</article>`,
  });
}

function articlesIndex(all: Article[]): string {
  const root = rootOf('articles/');
  const items = all
    .map(
      (article) => `<li>
  <article>
    <time datetime="${article.date}">${when(article.date)}</time>
    <h2><a href="${root}${article.path}">${esc(article.title)}</a></h2>
    <p>${esc(article.summary)}</p>
  </article>
</li>`,
    )
    .join('\n');
  return page({
    path: 'articles/',
    title: 'Articles',
    description: `Notes on typography and on how ${NAME} makes its decisions.`,
    mainAttrs: 'data-layout="index"',
    body: `<div class="container">
<header>
  <h1>Articles</h1>
  <p>Notes on typography on the screen, and on how each decision in the engine was made.</p>
</header>
<ol data-articles>
${items}
</ol>
</div>`,
  });
}

/** Every page the site builds from content, keyed by its path ("docs/api/"). */
export function generatedPages(): Map<string, string> {
  const all = docs();
  const posts = articles();
  const pages = new Map<string, string>();
  pages.set('docs/', docsIndex(all));
  for (const doc of all) pages.set(doc.path, docPage(all, doc));
  pages.set('articles/', articlesIndex(posts));
  for (const post of posts) pages.set(post.path, articlePage(posts, post));
  return pages;
}

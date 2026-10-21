import { GITHUB, NAME, NAV } from './site';

/** The relative path from a page at `path` ("docs/api/") back to the site root ("../../"). */
export const rootOf = (path: string): string => {
  const depth = path.split('/').filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
};

const MARK = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M4 18v-5.2C4 8.7 6.2 6.2 9.6 5.6l.5 1.9C8.3 8 7.3 9.2 7.2 11H10v7zm10 0v-5.2c0-4.1 2.2-6.6 5.6-7.2l.5 1.9c-1.8.5-2.8 1.7-2.9 3.5H20v7z" fill="currentColor"/></svg>`;

export function header(path: string): string {
  const root = rootOf(path);
  const current = (href: string) => (path.startsWith(href) ? ' aria-current="page"' : '');
  const links = NAV.map(
    (item) => `<li><a href="${root}${item.href}"${current(item.href)}>${item.label}</a></li>`,
  ).join('');
  return `<header>
  <nav aria-label="Main">
    <a href="${root}" data-brand>${MARK}<span>${NAME}</span></a>
    <ul>${links}<li><a href="${GITHUB}" rel="noopener">GitHub</a></li></ul>
    <button type="button" data-theme-toggle aria-label="Switch between light and dark">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg>
    </button>
  </nav>
</header>`;
}

export function footer(path: string): string {
  const root = rootOf(path);
  return `<footer>
  <div class="container">
    <p><strong>${NAME}</strong> sets running text the way a typesetter would: quotation marks by language, dashes, no-break spaces, hanging punctuation. This site is typeset by it.</p>
    <nav aria-label="Footer">
      <ul>
        <li><a href="${root}docs/getting-started/">Getting started</a></li>
        <li><a href="${root}docs/api/">API</a></li>
        <li><a href="${root}docs/rules/">Rules</a></li>
        <li><a href="${root}docs/languages/">Languages</a></li>
        <li><a href="${root}docs/changelog/">Changelog</a></li>
        <li><a href="${GITHUB}" rel="noopener">GitHub</a></li>
      </ul>
    </nav>
  </div>
</footer>`;
}

const THEME = `<script>try{const t=localStorage.getItem('typography-theme');if(t)document.documentElement.dataset.theme=t}catch{}</script>`;

/** A whole page: `body` goes inside `<main>` (its own element, with attributes in `mainAttrs`). */
export function page(options: {
  path: string;
  title: string;
  description: string;
  body: string;
  mainAttrs?: string;
  script?: string;
  head?: string;
}): string {
  const root = rootOf(options.path);
  const full = options.path ? `${options.title} · ${NAME}` : `${NAME}: ${options.title}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${full}</title>
<meta name="description" content="${options.description.replace(/"/g, '&quot;')}" />
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml" />
<link rel="stylesheet" href="${root}style.css" />
${THEME}
${options.head ?? ''}
</head>
<body>
<a href="#content" class="sr-only">Skip to the text</a>
${header(options.path)}
<main id="content" ${options.mainAttrs ?? ''}>
${options.body}
</main>
${footer(options.path)}
<script type="module" src="${root}main.ts"></script>
${options.script ?? ''}
</body>
</html>
`;
}

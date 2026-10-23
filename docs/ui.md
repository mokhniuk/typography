# UI conventions

These apply to every page this project ships: the playground (`apps/website/playground/`), the comparison page (`apps/bench/comparison.html`) and the website (`apps/website/`). The website is about typography, so its pages are set with the same care the engine takes over text: the build runs every page through `typesetHtml`.

## Markup

- Use the element that means the thing. Use `header`, `main`, `section`, `footer` and `nav` for regions. Use `form`, `fieldset` and `legend` for groups of controls, and `details` and `summary` for something that folds. Use `dialog` for a modal, and `dl`, `dt` and `dd` for name–value lists (a rule and what it did). Use `table` for tabular data, `figure` and `figcaption` for a chart or example, and `output` for a computed value such as a count. Use `kbd`, `code` and `small` for what they mean.
- A `div` or `span` is for layout or a hook that no element names.
- State goes in attributes: `hidden`, `aria-selected`, `aria-pressed`, `checked`, `open`, `data-*`. Do not add classes such as `is-active`.
- Accessibility comes from the element. A control has a `label`, a radio group has a `fieldset` and `legend`, and tabs use `role="tablist"`, `role="tab"` and `aria-selected`.

## Style

- One `style.css` per app. It styles elements (`button`, `select`, `textarea`, `fieldset`, `dl`, `table`, `details`) and attribute states (`[role="tab"][aria-selected="true"]`, `[hidden]`).
- Classes are the exception. Allowed: `container` (a width-limited wrapper), `sr-only` (visually hidden, still read aloud) and `primary` (the one main action on a screen). Add another only when no element or attribute can carry the meaning, and list it here.
- An `id` is a hook for the script and for `label for`. Do not style by `id`.
- Every value a theme could change is a custom property on `:root`: colors, corner radii, spacing, font sizes, font families, line length and control height. No literal colors, radii or font sizes in rules; layout numbers (a grid track, a breakpoint) may be literal.

### Tokens

| Group | Tokens |
| --- | --- |
| Color | `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-line`, `--color-accent`, `--color-accent-text`, `--color-ins`, `--color-ins-text`, `--color-del`, `--color-del-text` |
| Corners | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill` |
| Spacing | `--space-1` … `--space-6` (the website adds `--space-7`, `--space-8`) |
| Type size | `--size-xs`, `--size-sm`, `--size-md`, `--size-lg`, `--size-xl` (the website adds `--size-2xl`, `--size-3xl`, `--size-display`, fluid with `clamp()`) |
| Fonts | `--font-ui`, `--font-text` (reading text; a serif in the playground, the same sans as the UI on the website), `--font-mono` |
| Measure | `--measure` (reading line length), `--control-height`, `--container` (page width) |
| Rhythm | `--baseline` (the website: the 8px vertical grid; `--baseline-line`, `--baseline-half` colour its overlay rows) |
| Controls | `--select-arrow`: the drawn arrow of a `select` (`appearance: none`), an SVG data URI in `--color-muted`, set again for the dark theme because a data URI cannot read a variable |

The website is black and white (near-black on near-white, no tint; the diff colours are neutral greys). It also has `--color-rule` (the strong line), `--color-paper` (a second background), `--color-code-bg`, `--color-code-text`, `--color-code-muted`, `--color-code-line` (code blocks are dark in both themes; `--color-ins`/`--color-del` are greys, not green and red), `--header-height` and `--pane-height`. A page may add its own tokens (the comparison page has chart colors). Name them in the same groups (`--color-good`), never as one-off literals.

### Theme

The light theme is the default on `:root`. The dark one is set twice, once for the system preference and once for an explicit switch:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark tokens */ }
}
:root[data-theme="dark"] { /* the same dark tokens */ }
```

A theme switch then only sets `data-theme` on `<html>`.

## Dependencies

No runtime dependencies. A page is HTML, one stylesheet and plain TypeScript, built by the root's `vite`. It imports the engine from `../../src` (the boundary test checks this). Only the benchmark (`apps/bench/`) uses outside packages, to measure them.

The comparison page is published as an Artifact, so it is one self-contained file with its CSS inline and fonts from Google Fonts. It still uses the token names and the markup rules above.

## The website

`apps/website/` is a multi-page static site built by the root's `vite` (`bun run website`, `bun run website:build` writes `apps/website/dist`). It follows the rules above and uses no classes beyond the three allowed: variants and hooks are `data-*` attributes (`data-layout`, `data-page`, `data-hero`, `data-install`, `data-examples`, `data-pager`, ...), which `style.css` selects.

- Hand-written pages: `index.html`, `playground/index.html`, `font-checker/index.html`, `404.html` (the list is `hand` in `build/plugin.ts`). `<!--header-->`, `<!--footer-->` and `<!--examples-->` and `{{version}}`, `{{rules}}`, `{{langs}}` and the like are filled in at build time from `build/` and the engine, so the numbers cannot go stale.
- Generated pages: the docs are the files listed in `DOC_FILES` in `apps/website/build/content.ts` (`apps/website/content/docs/getting-started.md`, `docs/api.md`, `cli.md`, `rules.md`, `languages.md`, `limits.md`, `practices.md`, `contributing.md` and `CHANGELOG.md`, in that order) plus the generated `docs/languages/*.md`; `README.md`, `ui.md`, `backlog.md` and `ideas.md` are not published; articles are `content/articles/YYYY-MM-DD-slug.md` with `title`, `date` and `summary` front matter. Add a file and the page, the index entry and the links appear. A link written `/docs/api/` in content is a link to a page of the site; one to another repository file goes to GitHub. The list and order of docs pages is `DOC_FILES` in `build/content.ts`.
- The playground page is `playground/index.html` with its script and modules beside it (`playground/*.ts`, tested there); its CSS lives in `style.css` under `[data-page="playground"]`.
- The font checker (`font-checker/`) is its own page and script: load a font file (read with `FontFace`, never uploaded) or name an installed font, pick languages, and get the glyph coverage of every character the rules can insert plus the letters of each language that fonts often lack, the `avoid` config for what is missing, the examples set in the font at two measures with hanging punctuation, and a text preset measured from the font. The measuring itself is the engine's (`src/dom/glyphs.ts`); the letters it asks about are `font-checker/letters.ts`, and `letters.test.ts` fails if a language pack has no line there. `font-checker/page.test.ts` loads the page's script against a stub browser, so a script that throws on load, or asks for an element the markup does not have, fails the suite. Its CSS is under `[data-page="font-checker"]`.
- Every page is typeset by the engine at build (`build/plugin.ts`, options in `TYPESET` in `build/site.ts`: English with American quotes), and the browser hangs punctuation in `[data-hanging]` text.
- Every page links relatively (`base: './'`), so the site works at the root of a host or under a path. The one exception is `404.html`: the host serves it for a missing address at any depth, so a relative link there would resolve against that address (`/docs/typo/` loading `/docs/assets/style.css`). Its links are rewritten to start at the site root, prefixed with `BASE` (`build/site.ts`) — `/` unless the environment variable `SITE_BASE` says otherwise. The rewrite is `rootLinks` in `build/plugin.ts`, in a `generateBundle` hook with `order: 'post'`, because Vite's own HTML plugin emits the page in its `generateBundle` and before that there is nothing to fix up.

- Vertical rhythm: `--baseline` (8px) is the vertical module, the design grid's second axis. Line heights are its multiples — 24px for UI text, code and tables, 32px for reading text (articles, ledes, the specimen), and headings and the landing's pull quote round up with `round(up, n em, 8px)` over a unitless fallback — and the vertical margins, paddings and gaps between blocks use the spacing tokens that are its multiples (`--space-3` and up; `--space-4`, 12px, stays horizontal). `--header-height` (56px), `--control-height` (40px), `--pane-height` (416px) and the article covers (176px) sit on it too. The overlay shows both axes: the pink columns and the blue rows — a faint line every 8px, a stronger one every 32px — toggled together with G, or turned on with `?grid`. It is a development tool only: `main.ts` keeps all of it behind `import.meta.env.DEV`, which a build replaces with `false`, so the published site carries none of that code and cannot draw the overlay however this browser left it.
- Layouts sit on the 12 columns (8 from 1024px, 4 from 600px) and every region spans whole ones: the landing's sections are a 3-column label and a 9-column body, and its pull quote takes the middle eight (`3 / -3`). The grid rules are in one block at the end of `style.css`.

### Deployment

The site ships as a container: `Dockerfile` at the repository root builds it with Bun and serves it
with nginx (`apps/website/nginx.conf`). The build context is the root, because the site imports the
engine from `src/` and its docs pages from `docs/`.

```sh
docker build -t typography-website .
docker run --rm -p 8080:80 typography-website
```

On a Docker host (this project deploys to Coolify) the settings are: build pack **Dockerfile**, base
directory `/`, Dockerfile `/Dockerfile`, exposed port **80**, then the domain (`typography.mokhni.uk`). Nothing else is
needed: the image holds a finished static site, so there is no runtime configuration, no environment
variable and no volume. For a site served under a path rather than at the root of a host, pass the
build argument `SITE_BASE=/path/` (it reaches `BASE` above; only the 404 page reads it).

What nginx does, and why: a page per directory is found by `try_files $uri $uri/`, so `/docs/api`
redirects to `/docs/api/` and the page's relative links resolve from there; `absolute_redirect off`
keeps that redirect on the host it was asked for rather than the container's own name; `error_page
404 /404.html` serves the 404 page for an address that is not there; asset names carry a hash of
their contents and are cached for a year, while a page is `no-cache` because a deployment rewrites
it in place. Checked on the built image: every page 200, `/docs/api` 301 to the slash, a deep
missing path serving the styled 404 page, `font/woff2` for the fonts and gzip on the stylesheet.

- Fonts: KyivType Sans (Regular, Medium, Bold; Latin and Cyrillic) is self-hosted in `apps/website/fonts/KyivType/`, with Poppins (Latin and Latin Extended, SIL OFL) as the fallback; see `fonts/README.md`.
- Landing copy is a draft for the author to review; `data-raw` marks text that must show exactly as written, so the build's own typesetting skips it.

# UI conventions

These apply to every page this project ships: the playground (`apps/playground/`), the comparison page (`apps/bench/comparison.html`) and the website (`apps/website/`). The website is about typography, so its pages are set with the same care the engine takes over text: the build runs every page through `typesetHtml`.

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
| Fonts | `--font-ui`, `--font-text` (reading text, a serif), `--font-mono` |
| Measure | `--measure` (reading line length), `--control-height`, `--container` (page width) |
| Controls | `--select-arrow`: the drawn arrow of a `select` (`appearance: none`), an SVG data URI in `--color-muted`, set again for the dark theme because a data URI cannot read a variable |

The website also has `--color-paper` (a second background), `--color-code-bg`, `--color-code-text`, `--color-code-muted`, `--color-code-line` (code blocks are dark in both themes), `--header-height` and `--pane-height`. A page may add its own tokens (the comparison page has chart colors). Name them in the same groups (`--color-good`), never as one-off literals.

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

- Hand-written pages: `index.html`, `playground/index.html`, `404.html`. `<!--header-->`, `<!--footer-->` and `<!--examples-->` and `{{version}}`, `{{rules}}`, `{{langs}}` and the like are filled in at build time from `build/` and the engine, so the numbers cannot go stale.
- Generated pages: the docs are the repository's own Markdown (`docs/*.md`, `docs/languages/*.md`, `CHANGELOG.md`) plus `content/docs/`; articles are `content/articles/YYYY-MM-DD-slug.md` with `title`, `date` and `summary` front matter. Add a file and the page, the index entry and the links appear. A link written `/docs/api/` in content is a link to a page of the site; one to another repository file goes to GitHub. The list and order of docs pages is `DOC_FILES` in `build/content.ts`.
- The playground page reuses `apps/playground/main.ts` and its markup; its CSS lives in the website's `style.css` under `[data-page="playground"]`.
- Every page is typeset by the engine at build (`build/plugin.ts`, options in `TYPESET` in `build/site.ts`: English with American quotes), and the browser hangs punctuation in `[data-hanging]` text.
- `404.html` is rewritten to root-relative links so it works at any depth; deploy the site at the root of its host.

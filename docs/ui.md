# UI conventions

These apply to every page this project ships: the playground (`apps/playground/`), the comparison page (`apps/bench/comparison.html`) and the website when it exists. The website will be about typography, so its pages are set with the same care the engine takes over text.

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
| Spacing | `--space-1` … `--space-6` |
| Type size | `--size-xs`, `--size-sm`, `--size-md`, `--size-lg`, `--size-xl` |
| Fonts | `--font-ui`, `--font-text` (reading text, a serif), `--font-mono` |
| Measure | `--measure` (reading line length), `--control-height`, `--container` (page width) |
| Controls | `--select-arrow`: the drawn arrow of a `select` (`appearance: none`), an SVG data URI in `--color-muted`, set again for the dark theme because a data URI cannot read a variable |

A page may add its own tokens (the comparison page has chart colors). Name them in the same groups (`--color-good`), never as one-off literals.

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

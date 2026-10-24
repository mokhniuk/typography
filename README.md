# Typography Engine

The package is `@mokhniuk/typography`. Website, docs and playground: [typography.mokhni.uk](https://typography.mokhni.uk).

**Real quotation marks, dashes and spaces, in 27 languages.** A typography engine for running text: plain strings in, typeset strings out, nothing marked up in the source. Tags, links and code are left alone.

[![npm](https://img.shields.io/npm/v/@mokhniuk/typography)](https://www.npmjs.com/package/@mokhniuk/typography)
[![CI](https://github.com/mokhniuk/typography/actions/workflows/release.yml/badge.svg)](https://github.com/mokhniuk/typography/actions/workflows/release.yml)
![34 rules](https://img.shields.io/badge/rules-34-4c72b0)
![27 languages](https://img.shields.io/badge/languages-27-4c72b0)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-2ca02c)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![1 MB in 38 ms](https://img.shields.io/badge/1%20MB%20of%20text-38%20ms-2ca02c)

```diff
- Ada said: "The sign read 'Closed' again" - and laughed... We're used to it by now.
+ Ada said: “The sign read ‘Closed’ again” — and laughed… We’re used to it by now.

- The workshop runs 21-26 September, 10:00-12:00, for 125000 people , and the screens are 1920x1080.
+ The workshop runs 21–26 September, 10:00–12:00, for 125,000 people, and the screens are 1920×1080.

- Outside it is -5 C, +-2 C at night. Add 1/2 cup of sugar. Read on -> p. 12.
+ Outside it is −5 °C, ±2 °C at night. Add ½ cup of sugar. Read on → p. 12.
```

The group separator in `125,000`, the dropped space before the comma, and the `°`, `±` and `½` come from opt-in rules: `enable: ['number.group', 'space.before-punctuation', 'symbol.degree', 'symbol.plusminus', 'symbol.fraction']`. Everything else above is the default.

It also puts no-break spaces where a line should not break (after one-letter words, inside ranges, before units), nests quotations in the marks each language expects, and can hang opening punctuation in the margin. English gets `“…”` with `‘…’` inside, as above; `quoteStyle: 'us'` gives the same marks in any language, `quoteStyle: 'guillemets'` gives this project's house style `«…»` with `„…“` inside in any language, and the `literary` register gives British `‘…’`.

[![The website: the engine running live, with hanging punctuation](https://raw.githubusercontent.com/mokhniuk/typography/main/docs/media/website-hero-light.webp)](https://typography.mokhni.uk)

## Install

From npm, with any package manager:

```sh
npm install @mokhniuk/typography
pnpm add @mokhniuk/typography
bun add @mokhniuk/typography
yarn add @mokhniuk/typography
```

Pick a version from [CHANGELOG.md](CHANGELOG.md) if you want to pin one. The package is compiled ESM with `.d.ts` declarations and has no dependencies (`react` is an optional peer, for the `./react` entry only). The `typo` command runs on Node 20.10 or later and on Bun. Versions follow semver, and a minor release may change output. Local linking and bundler notes: [docs/contributing.md](docs/contributing.md#using-it-from-another-project).

## Use

```ts
import { explain, typographic } from '@mokhniuk/typography';

typographic('He said "we\'re here" - and left.', 'en');
// He said “we’re here”~— and~left.     (~ is a no-break space)

typographic('He said "we\'re here"', 'en', { register: 'literary' });
// He said ‘we’re here’

typographic('He said "hi"', 'de', { quoteStyle: 'us' }); // “hi” in any language
typographic('He said "hi"', 'en', { quoteStyle: 'guillemets' }); // «hi», the house style

explain('He said "hi"... 21-26');
// { output: 'He said “hi”… 21–26',
//   changes: [{ rule: 'quote', from: '"', to: '“' }, …] }
```

A project writes its options once and spreads them into every call; an option given to a call replaces the config's:

```ts
import { defineConfig } from '@mokhniuk/typography';

export const site = defineConfig({ lang: 'uk', quoteStyle: 'us', hangAmount: 0.5 }); // checked here
typesetHtml(html, site);
typesetMarkdown(md, { ...site, lang: 'de' });
<TypographyRoot config={site}>…</TypographyRoot>
```

Start from a preset when you have no opinion yet: `defineConfig({ ...presets.web, lang: 'uk' })`; `web` (articles), `book` (running prose, literary register) and `ui` (short labels, narrow boxes) are plain objects ([docs/api.md](docs/api.md#presets)).

`typo --config typography.config.ts` reads it too, and so does a `typography` key in `package.json` ([docs/api.md](docs/api.md#config)).

### Entry points

| Entry | Use it for | Exports |
|---|---|---|
| `@mokhniuk/typography` | The whole engine and the plain-text mode | everything in `src/core` (`typographic`, `explain`, `typesetBlock`, `defineConfig`, `RULES`, `RULE_IDS`, `DEFAULT_RULES`, `LANGS`, `PACKS`, `resolvePack`, `checkConfig`, `addRule`, `selectRules`, `REGISTERS`, `NBSP`, `splitHangs`, `diff`, `ruleGlyphs`, `insertedCharacters`, `insertedGlyphs`, `keepAvoided`, `CURRENCY_CODES`, `CURRENCY_SIGNS`, `CURRENCY_WORDS` and their types) plus `typesetText` |
| `@mokhniuk/typography/text` | Plain text a paragraph at a time | `typesetText` |
| `@mokhniuk/typography/html` | An HTML string | `typesetHtml` |
| `@mokhniuk/typography/markdown` | A Markdown document | `typesetMarkdown` |
| `@mokhniuk/typography/rehype` | A unified/rehype pipeline, or any hast tree | default `rehypeTypography`, `typesetHast` |
| `@mokhniuk/typography/markdown-it` | A markdown-it pipeline | default `markdownItTypography` (a plugin) |
| `@mokhniuk/typography/vue` | Vue 3 pages | default plugin that registers `v-typography`, `vTypography`, `createDirective` |
| `@mokhniuk/typography/dom` | Hanging punctuation in the browser, no framework | `hangPunctuation`, `hangScript`, `markHangs`, `hangStyle`, `typesetElement`; glyph checks `supports`, `glyphStatus`, `missingGlyphs`, `missingIn`, `fontOf` |
| `@mokhniuk/typography/react` | React pages | `Typeset`, `TypographyRoot`, `HangText`, `HangScript`, `useHangingPunctuation`, `useMissingGlyphs`, `TypographyContext` |
| `@mokhniuk/typography/lite` | One language: the engine and the text, HTML and Markdown modes with no pack; `lang` is a pack | `typographic`, `explain`, `typesetText`, `typesetHtml`, `typesetMarkdown`, the rule table and its helpers ([docs/api.md](docs/api.md#lite)) |
| `@mokhniuk/typography/lang/<code>` | One language pack, the code in lower case (`./lang/uk`, `./lang/de-ch`; 27 entries) | the pack under its name (`uk`, `deCH`) and as the default export |
| `typo` (bin) | The command line; Node 20.10 or later, or Bun | see [docs/cli.md](docs/cli.md) |

Every mode takes the same options (`lang`, `register`, `quoteStyle`, `disable`, `enable`, `rules`, `avoid`, `onChange`; `nbsp` for HTML output and `hangAmount` for hanging marks); signatures and the full option table are in [docs/api.md](docs/api.md).

### The modes in one glance

```ts
import { typesetText } from '@mokhniuk/typography/text';
typesetText('First "paragraph" - here.\n\nSecond...', { lang: 'en' });
// keeps line breaks and indentation; an unchanged paragraph comes back byte for byte

import { typesetHtml } from '@mokhniuk/typography/html';
typesetHtml('<p>She said "go" - <a href="/x">Read more -></a></p>', { lang: 'en' });
// tags, attributes, comments, <pre>, <code>, <script>, <style> untouched

import { typesetMarkdown } from '@mokhniuk/typography/markdown';
typesetMarkdown('# "Title" - subtitle\n\n`a -> b` stays.', { lang: 'en' });

import rehypeTypography from '@mokhniuk/typography/rehype';
unified().use(remarkParse).use(remarkRehype).use(rehypeTypography, { lang: 'uk' }).use(rehypeStringify);
// reads each element's lang attribute; skips data-typography="off" and code
```

One language only: `/lite` loads no pack, and the page brings the one it sets (11.5 KB brotli for this call, against 14.4 KB for `/text` with all 27):

```ts
import { typesetText } from '@mokhniuk/typography/lite';
import { uk } from '@mokhniuk/typography/lang/uk';
typesetText('Він сказав "привіт"', { lang: uk }); // Він сказав «привіт»
```

```tsx
import { Typeset, TypographyRoot } from '@mokhniuk/typography/react';

<TypographyRoot lang="uk">
  <p><Typeset text={'Він сказав "камінь" - і пішов'} /></p>
</TypographyRoot>
```

```sh
typo note.txt                  # typeset to standard output
cat note.txt | typo -l uk      # from standard input
typo -w docs/*.md              # rewrite files in place
typo -c docs/*.md              # change nothing; exit 1 if any file would change (CI)
```

## Why this engine

Measured, not promised: every claim below comes from [a published benchmark](apps/bench/RESULTS.md) that runs this package and six others over the same style-neutral checks — every case, check and output is in the file, so any check can be contested. **Read it with care: the cases were written by this package's author.** They test what is right (a German quotation is „…“ or »…«; an ISO date is not a range), not one tool's house style — this package's former English `«…»` default (now `quoteStyle: 'guillemets'`) was reported as a failure there too.

Passed / scored; `–` means the tool has no such feature or language, and is not held against it. Each tool scores against its own denominator. The table shows eight of the groups; the total row counts all sixteen (every group but Registers).

| | @mokhniuk/typography | @mokhniuk/typography literary | typograf | typopo | richtypo | tipograph | smartypants |
|---|---|---|---|---|---|---|---|
| Quotes | **41/41** | **41/41** | 33/37 | 20/20 | 14/18 | 24/27 | 14/17 |
| Nested quotes | **25/25** | **25/25** | 0/21 | 4/4 | 0/2 | 10/11 | 1/1 |
| Dashes | **37/37** | **37/37** | 7/33 | 11/15 | 9/13 | 20/22 | 6/12 |
| Ranges | **25/25** | **25/25** | 0/21 | 4/4 | 0/2 | 11/11 | 0/1 |
| No-break spaces | **13/13** | **13/13** | 5/13 | 4/6 | 4/9 | 1/11 | 0/5 |
| Abbreviations | **5/5** | **5/5** | 0/5 | 2/3 | 0/1 | 0/4 | 0/1 |
| Symbols | **19/19** | **19/19** | 10/19 | 7/16 | 5/16 | 12/18 | 5/15 |
| Safety | **33/33** | **33/33** | 28/29 | 11/12 | 9/10 | 17/19 | 7/9 |
| **Total, all 16 groups** | **260/260** | **260/260** | 135/236 | 86/112 | 70/107 | 127/169 | 53/90 |

Speed, English text in one piece, the median of several runs (typograf is the closest tool in scope; the 0.16.1 run):

| Tool | 10 KB | 100 KB | 1 MB |
|---|---|---|---|
| **@mokhniuk/typography** | **0 ms** | **4 ms** | **38 ms** |
| typograf | 1 ms | 6 ms | 58 ms |
| tipograph | 0 ms | 1 ms | 11 ms |
| smartypants | 0 ms | 1 ms | 10 ms |
| retext-smartypants | 4 ms | 27 ms | 577 ms |
| typopo | 21 ms | 1089 ms | 98742 ms |
| richtypo | 2499 ms | not run (~249 s) | not run (~24835 s) |

The tools that beat it on speed (tipograph, smartypants) score far below it on the checks; typograf, the closest in scope, is about 1.5× slower on large text, and typopo and richtypo slow down quadratically.

## What is in the box

- **34 rules** — quotes, apostrophes, dashes, ranges, no-break spaces, symbols, numbers, money, phone numbers; 24 on by default, 10 opt-in ([docs/rules.md](docs/rules.md)).
- **27 languages** — the 24 official EU languages, `uk`, `de-CH` and `fr-CH`, each one pack with its quote marks, dash habits, elisions and abbreviations ([docs/languages.md](docs/languages.md)).
- **Two registers** — `display` for interface and marketing text, `literary` for book-like text.
- **Every format** — plain text, HTML, Markdown, hast trees (rehype plugin), React components, the DOM, a CLI.
- **`explain`** — every change comes with the rule that made it and the before/after, so nothing is a mystery.
- **Hanging punctuation** — opening marks hang in the margin at any width, no line-break measuring, with an inline script so prerendered pages do not jump ([more below](#hanging-punctuation-without-a-jump-on-a-prerendered-page)).
- **A font without the glyph** — `avoid` names the characters a font cannot draw and the rules keep the text as it was typed instead of inserting them; in a browser `TypographyRoot` measures the page's own font and fills that list in, and the website's font checker writes it for a font file ([docs/api.md](docs/api.md#avoid)).
- **Ship one language** — `@mokhniuk/typography/lite` carries no language pack and each pack is its own entry, `@mokhniuk/typography/lang/<code>`: one call that typesets Ukrainian is 11.5 KB brotli instead of 14.4 KB ([docs/api.md](docs/api.md#loading-only-the-languages-used)).
- **Zero dependencies** — nothing in the package imports anything outside it; `react` is an optional peer for the `./react` entry only. Compiled ESM with declarations, so Node and plain tooling work.
- **Safe by construction** — code, tags, URLs and protected spans are never touched; an unknown rule name throws instead of silently passing.

## When does it run?

The engine is a function; it runs when your code calls it. Nothing runs at install or at commit.

| Where your text is | Call it | When | What the browser gets |
|---|---|---|---|
| Static site (Astro, Eleventy, Vite, Next export) | `typesetHtml`, `typesetMarkdown`, the rehype or markdown-it plugin | At build | Finished HTML |
| Server-rendered React (Next, Remix) | `Typeset` / `TypographyRoot` | On each server render | Finished HTML; hydration matches |
| Client only (SPA, Vue directive, `typesetElement`) | the same modes in the browser | After JS loads | Plain text first, then typeset |
| Source files | `typo -w` to rewrite, `typo -c` to check | By hand, a pre-commit hook or CI | The source itself is changed |

Typeset at build or render time and keep the source plain, with one shared config. Recipes per tool: [docs/recipes.md](docs/recipes.md).

## The playground

Paste text, HTML or Markdown; see the result, every change with the rule that made it, and a preview with hanging punctuation. It runs entirely in the browser. It is a page of the website: `bun run website` serves it along with the docs and articles.

![The playground: input beside the typeset result, with the changes counted](https://raw.githubusercontent.com/mokhniuk/typography/main/docs/media/playground.webp)

## Hanging punctuation without a jump on a prerendered page

Hanging never measures where lines break: the space beside each mark carries the mark's width and goes away at a break, so marks hang wherever a line happens to start, at any width and in any alignment (left-to-right text). A mark's exact width is measured; before that the marks carry a rough width, and on a prerendered page the inline pass (`TypographyRoot`, or `<HangScript />` placed last inside the element that holds the text) runs as the page is parsed, so the marks do not shift when the bundle loads. The cost is about 2.2 kB of inline HTML; `early={false}` turns it off where a content security policy forbids inline scripts. How to check it on your own page, and what has not been measured: [docs/limits.md](docs/limits.md).

## What is not finished

Honesty over gloss — before you depend on it, know where it is weak:

- No language has been read by a native speaker. The packs follow published style guides; the review status per language is in [docs/languages.md](docs/languages.md).
- The abbreviation lists are short, and some language conventions were not checked. Known limits: [docs/limits.md](docs/limits.md).
- Every rule has a decision record with its sources in [resources/sources.md](resources/sources.md) — including the decisions that are still unchecked.
- Some input cannot be read with certainty (a stray quote mark in unbalanced text, such as `He said "born 1985". Then she left"`): such cases are listed as limits, not guessed at.

## Documentation

| Page | What it has |
|---|---|
| [docs/api.md](docs/api.md) | Every entry point, signature, option table, the `Change` type, hanging functions and React components |
| [docs/rules.md](docs/rules.md) | One section per rule, in running order, with examples (generated; `bun run docs:rules`) |
| [docs/languages.md](docs/languages.md) | Quote marks, dashes, orphan letters, abbreviations and `%`/`€` spacing per language; review status |
| [docs/cli.md](docs/cli.md) | All flags, exit codes, standard input, format by extension, examples |
| [docs/limits.md](docs/limits.md) | Known limits, speed, benchmark caveats |
| [docs/recipes.md](docs/recipes.md) | Recipes: plain HTML, Vue, Svelte, Astro, Next.js, Vite, markdown-it, unified, and what to leave to CSS |
| [docs/practices.md](docs/practices.md) | Good practices: what to bind and with which rule, what to leave to CSS, column width, what never to do |
| [docs/contributing.md](docs/contributing.md) | Tests, adding a rule or a language, the benchmark, the playground, releasing, using it from another project |
| [CHANGELOG.md](CHANGELOG.md) | What changed in each release, and whether it can change output you already have |

## Develop

```sh
bun test src apps/website resources
bun run typecheck
bun run docs:rules     # regenerate docs/rules.md
```

The package stays self-contained: `src/boundary.test.ts` fails if anything in `src/` or `apps/website/playground/` imports from outside the package or from anything but `react`. See [docs/contributing.md](docs/contributing.md).

## Licence

MIT, see [LICENSE](LICENSE).

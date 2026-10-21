# @podiia/typography

A typography engine for running text. Plain strings in, typeset strings out; nothing is marked up in the source. It sets quotation marks by language, nesting level and register, dashes and number ranges, apostrophes, ellipses, arrows and symbols, and no-break spaces. It also has modes that typeset HTML, Markdown and hast trees without touching markup or code, a command line, and a way to hang opening punctuation in the margin.

There are 29 rules, 20 on by default and 9 you switch on (see [docs/rules.md](docs/rules.md)), and 26 languages: the 24 official languages of the EU, `uk` and `ch`; `en` is the default (see [docs/languages.md](docs/languages.md); no language has been read by a native speaker yet). American quotes are an option, `quoteStyle: 'us'`. Two registers: `display` (the default, for marketing and interface text) and `literary` (book-like text; it has its own rules for English and Ukrainian only).

## Status

- Private (`"private": true`), not published to any registry.
- Ships `.ts` sources with no build step. It needs Bun or a TypeScript-aware bundler.
- The core has no dependencies. `react` (18 or later) is an optional peer dependency, needed only by `./react`.
- The abbreviation lists are short and have not been read by a native speaker, and some language conventions were not checked. Read [docs/limits.md](docs/limits.md) and [docs/languages.md](docs/languages.md) before relying on a language. What each rule rests on, and which decisions are still unchecked, is in [resources/sources.md](resources/sources.md) (also as a page to open in a browser: `resources/sources.html`).

## Install and use

Depend on a release tag over SSH (the repository is private, so the machine needs access to it):

```sh
bun add git+ssh://git@github.com/mokhniuk/typography.git#vX.Y.Z
```

Replace `vX.Y.Z` with a version from [CHANGELOG.md](CHANGELOG.md). Releases are plain git tags, created from `version` in `package.json` when a commit reaches `main`. A consumer takes a new version when it changes the tag. Tag handling in Bun, linking for local development and bundler notes are in [docs/contributing.md](docs/contributing.md#using-it-from-another-project).

Nothing in the package imports anything outside the folder except `react` (the `./react` entry only).

## Entry points

| Entry | Use it for | Exports |
|---|---|---|
| `@podiia/typography` | The whole engine and the plain-text mode | everything in `src/core` (`typographic`, `explain`, `typesetBlock`, `RULES`, `RULE_IDS`, `LANGS`, `REGISTERS`, `NBSP`, `splitHangs`, `diff` and their types) plus `typesetText` |
| `@podiia/typography/text` | Plain text a paragraph at a time | `typesetText` |
| `@podiia/typography/html` | An HTML string | `typesetHtml` |
| `@podiia/typography/markdown` | A Markdown document | `typesetMarkdown` |
| `@podiia/typography/rehype` | A unified/rehype pipeline, or any hast tree | default `rehypeTypography`, `typesetHast` |
| `@podiia/typography/dom` | Hanging punctuation in the browser, no framework | `hangPunctuation`, `hangScript` |
| `@podiia/typography/react` | React pages | `Typeset`, `TypographyRoot`, `HangText`, `HangScript`, `useHangingPunctuation`, `TypographyContext` |
| `typo` (bin) | The command line; needs Bun | see [docs/cli.md](docs/cli.md) |

Every function that typesets takes `lang`, `register`, `quoteStyle`, `disable`, `enable`, `rules` and `onChange`; the full table of options and the signatures are in [docs/api.md](docs/api.md).

### Main entry

```ts
import { explain, typographic } from '@podiia/typography';

typographic('He said "we\'re here" - and left.', 'en');
// He said «we’re here»~— and left.     (~ is a no-break space)

typographic('He said "we\'re here"', 'en', { register: 'literary' });
// He said ‘we’re here’

typographic('21-26 - x', 'en', { disable: ['dash.range'] }); // a rule, or a group such as 'space', off

typographic('He said "hi"', 'de', { quoteStyle: 'us' }); // “hi” in any language (default: the language's own marks)
typographic('Call 1000000 , now', 'en', { enable: ['number.group', 'space.before-punctuation'] });
// nine rules are off until named in `enable`; docs/rules.md lists them

explain('He said "hi"... 21-26');
// { output: 'He said «hi»… 21–26',
//   changes: [{ rule: 'quote', from: '"', to: '«' }, { rule: 'quote', from: '"', to: '»' }, …] }
```

An unknown rule name throws, so a typo cannot pass for "everything stays on".

### Text

```ts
import { typesetText } from '@podiia/typography/text';

typesetText('First "paragraph" - here.\n\nSecond...', { lang: 'en' });
```

Keeps line breaks, indentation and blank lines; a paragraph that needs no change comes back byte for byte.

### HTML

```ts
import { typesetHtml } from '@podiia/typography/html';

typesetHtml('<p>She said "go" - <a href="/x">Read more -></a></p>', { lang: 'en' });
```

Tags, attributes, comments and the content of `<pre>`, `<code>`, `<script>`, `<style>` and a few other elements are left as they were. `nbsp: 'char'` writes a real no-break space instead of `&nbsp;`.

### Markdown

```ts
import { typesetMarkdown } from '@podiia/typography/markdown';

typesetMarkdown('# "Title" - subtitle\n\n`a -> b` stays.', { lang: 'en' });
```

### rehype

```ts
import rehypeTypography from '@podiia/typography/rehype';

unified().use(remarkParse).use(remarkRehype).use(rehypeTypography, { lang: 'uk' }).use(rehypeStringify);
```

`typesetHast(tree, options)` does the same on any hast tree. It reads an element's `lang` attribute and skips `data-typography="off"` as well as code.

### DOM

```ts
import { hangPunctuation, hangScript } from '@podiia/typography/dom';

const stop = hangPunctuation(document.querySelector('article')!); // marks wrapped in [data-hang] hang in the margin
// hangScript() returns the source of an inline script that does the same as the page is parsed.
```

Hanging is measured, so it works wherever a line happens to wrap. It handles left-aligned, left-to-right text only.

### React

```tsx
import { Typeset, TypographyRoot } from '@podiia/typography/react';

<TypographyRoot lang="uk">
  <p><Typeset text={'Він сказав "камінь" - і пішов'} /></p>
</TypographyRoot>
```

`TypographyRoot` also sends the hanging pass inline (`early`, default `true`) so that on a prerendered page the marks do not move when the bundle loads; set `early={false}` where a content security policy forbids inline scripts.

### Command line

```sh
typo note.txt                  # typeset to standard output
cat note.txt | typo -l uk      # from standard input
typo -w docs/*.md              # rewrite files in place
typo -c docs/*.md              # change nothing; exit 1 if any file would change (CI)
```

Run it as `bun run src/cli/main.ts` before the `typo` bin is linked.

## Documentation

| Page | What it has |
|---|---|
| [docs/api.md](docs/api.md) | Every entry point, signature, option table, the `Change` type, hanging functions and React components |
| [docs/rules.md](docs/rules.md) | One section per rule, in running order, with examples (generated; `bun run docs:rules`) |
| [docs/languages.md](docs/languages.md) | Quote marks, dashes, orphan letters, abbreviations and `%`/`€` spacing per language; review status; what is not implemented |
| [docs/cli.md](docs/cli.md) | All flags, exit codes, standard input, format by extension, examples |
| [docs/limits.md](docs/limits.md) | Known limits, speed, benchmark caveats |
| [docs/contributing.md](docs/contributing.md) | Tests, adding a rule or a language, the benchmark, the playground, releasing, using it from another project |
| [docs/backlog.md](docs/backlog.md) | What is missing against the other tools, by priority, with the measurements behind each item |
| [CHANGELOG.md](CHANGELOG.md) | What changed in each release, and whether it can change output you already have |

## Hanging punctuation without a jump on a prerendered page

Hanging is measured, so on a prerendered page the marks that start a wrapped line would move by their own width once the bundle has loaded. `TypographyRoot` (and `<HangScript />`, for a page that wires the hook itself; put it last inside the element that holds the text) sends the same pass inline, so it runs as the page is parsed. The cost is the length of `hangScript()`, about 1.4 kB of HTML (`hangScript().length` prints it). `early={false}` turns it off.

To check this on your own page: block the JavaScript bundle (for example in the browser's developer tools), load the page at a narrow width, and count the marks that start a wrapped line and are already hung at first paint; then let the bundle load and count the marks that move. Without the inline script the first count is low and the second high; with it, the first should be all and the second none. This is a method, not a result: it has not been measured on any page that ships with this package, and it needs a production build (the inline script has not been looked at in a dev server; see [docs/limits.md](docs/limits.md)).

## Web page

`bun run playground` serves a page where you paste text, HTML or Markdown and get the typeset result, with a view of what changed, a preview with hanging punctuation and a switch for each rule. `bun run playground:build` writes a static site to `apps/playground/dist`. It runs entirely in the browser.

## Benchmark

`apps/bench/RESULTS.md` holds the results of running this package, typograf, typopo, richtypo, tipograph, smartypants and retext-smartypants over the same style-neutral checks, with every case, check and output. The runner is a separate project in `apps/bench/` that git ignores (see [docs/contributing.md](docs/contributing.md#the-benchmark)). The cases were written by this package's author: read them in the results, contest them, and read the caveats at the top of the results and in [docs/limits.md](docs/limits.md). This package is roughly 5 times slower than typograf on large text.

## Develop

```sh
bun test src apps/playground resources
bun run typecheck
bun run docs:rules     # regenerate docs/rules.md
```

The package has to stay self-contained: `src/boundary.test.ts` fails if anything in `src/` or `apps/playground/` imports from outside the package or from anything but `react`. See [docs/contributing.md](docs/contributing.md).

## Licence

No licence is granted; the package is private. The owner has to choose one before it is shared.

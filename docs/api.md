# API reference

Every entry point in `package.json` `exports`, plus the `typo` command (see [cli.md](cli.md)). All of them ship as TypeScript sources: there is no build step and no `.d.ts` files; a TypeScript-aware bundler or Bun reads the `.ts` directly. The package is private and not published to a registry; it is installed from a git tag (see [contributing.md](contributing.md#using-it-from-another-project)), and the import names below are its package name `@podiia/typography`.

| Entry | Source | What it exports |
|---|---|---|
| `.` | `src/index.ts` | everything in `src/core` (below: the engine, `TypographyConfig`, `defineConfig`, `checkConfig`), plus `typesetText` and `TextOptions` |
| `./text` | `src/text/index.ts` | `typesetText`, `TextOptions` |
| `./html` | `src/html/index.ts` | `typesetHtml`, `HtmlOptions` |
| `./markdown` | `src/markdown/index.ts` | `typesetMarkdown`, `MarkdownOptions` |
| `./rehype` | `src/rehype/index.ts` | default `rehypeTypography`, `typesetHast`, `RehypeOptions` |
| `./dom` | `src/dom/index.ts` | `hangPunctuation`, `hangScript`, `markHangs`, `hangStyle` |
| `./react` | `src/react/index.ts` | `Typeset`, `TypographyRoot`, `HangText`, `HangScript`, `useHangingPunctuation`, `TypographyContext`, `TypographySetting` |
| bin `typo` | `src/cli/main.ts` | the command line; needs Bun |

The main entry is not only plain text: it carries the whole engine (`typographic`, `explain`, `RULES`, `splitHangs`, ...) and the plain-text mode. It does not export the HTML, Markdown, rehype, DOM or React modules; import those from their own entry.

## Options

These are the options the functions below take. Which function takes which is in the table after them.

| Option | Type | Default | Meaning |
|---|---|---|---|
| `lang` | `Lang` | `'en'` | Language of the text. `Lang` is the union of the 26 pack codes (the 24 EU languages, `uk`, and `ch` for Swiss usage), derived from the packs in `src/core/lang/`; `LANGS` lists them. See [languages.md](languages.md). |
| `register` | `Register` | `'display'` | `'display'` (marketing and interface text) or `'literary'` (book-like text). `literary` has its own rules for English (British quotes, spaced en dash); every other language keeps its display rules. The dialogue dash is the same in both registers. |
| `quoteStyle` | `QuoteStyle` | `'language'` | `'language'` is the language's own quote marks (its literary ones in the literary register). `'us'` is `“…”` with `‘…’` inside for any language, and takes precedence over both the language table and the literary register. The rehype plugin does not read `lang="en-US"` as US quotes: a page's `<html lang="en-US">` must not change its output, so set the option. |
| `enable` | `readonly string[]` | none | Rules to switch on that are off by default (`Rule.defaultOn: false`): ids or groups, checked like `disable`. Enabling a rule that is already on does nothing; a rule named in both `enable` and `disable` throws. Nine built-in rules are off by default (`space.before-punctuation`, `space.after-comma`, `punctuation.double`, `space.trailing`, `symbol.plusminus`, `symbol.fraction`, `symbol.degree`, `symbol.implies`, `number.group`); see [rules.md](rules.md) and [limits.md](limits.md#opt-in-rules). |
| `rules` | `readonly Rule[]` | `RULES` | The list of rules to run, in order, instead of the built-in one; build it with `addRule`. `disable` and `enable` are checked against this list, not the built-in one. A rule with `defaultOn: false` in it runs only when named in `enable`. |
| `disable` | `readonly string[]` | none | Rules to switch off: ids (`'dash.range'`) or groups (`'space'`, or `'space.*'`). A name that matches no rule throws an `Error` that lists the rule ids, so a typo cannot pass for "everything stays on". See [rules.md](rules.md). |
| `onChange` | `(change: Change) => void` | none | Called with each change a rule makes, in the order the rules ran (not in text order). Costs one word-level diff per rule that changed anything. |
| `blockStart` | `boolean` | `true` | Whether the text opens its paragraph. Only then can its first dash be read as a dialogue dash (`dash.dialogue`), in the languages that write dialogue with one. Taken by `typographic` and `explain` only; the text, HTML, Markdown and rehype modes always treat each block as opening a paragraph. |
| `nbsp` | `'entity' \| 'char'` | `'entity'` | HTML only (`--nbsp` on the command line). How a no-break space is written in a block that changed: as `&nbsp;`, or as the character U+00A0. Every mode accepts it, so a config spreads into any of them; only `typesetHtml` reads it. |
| `hangAmount` | `number`, 0 to 1 | `1` | How far hanging punctuation hangs: `TypographyRoot` sets it as the CSS custom property `--hang-amount` on its `div` (see [`hangPunctuation`](#hangpunctuationel-htmlelement---void)). The string modes and the command line accept it and do nothing with it. |
| `config` | `TypographyConfig` | none | A prop of `TypographyRoot` and `Typeset`: every option above in one object. See [Config](#config). |
| `hangAmount` | `number`, 0 to 1 | none: set as `--hang-amount` on the root's `div` (`style="--hang-amount:0.5"`); left out, the `div` has no style and the amount is inherited through CSS |
| `early` | `boolean` | `true` | A prop of `TypographyRoot`, not an engine option. Whether the root sends the hanging pass inline (`HangScript`). Set `false` on a page whose content security policy forbids inline scripts. |

`quoteStyle`, `enable` and `rules` go wherever `register` and `disable` go (every function and component in the table, including `TypographyRoot` and `Typeset`, and `--quotes` and `--enable` on the command line). `TypographyRoot` and `Typeset` also take `disable` and `onChange`.

| Function or component | `lang` | `register` | `disable` | `onChange` | `blockStart` | `nbsp` | `early` |
|---|---|---|---|---|---|---|---|
| `typographic(text, lang, options)` | argument | yes | yes | yes | yes | | |
| `explain(text, lang, options)` | argument | yes | yes | (it sets it) | yes | | |
| `typesetText`, `typesetMarkdown`, `typesetHast`, `rehypeTypography` | yes | yes | yes | yes | | | |
| `typesetHtml` | yes | yes | yes | yes | | yes | |
| `Typeset` | prop | prop | prop | prop | `atStart` prop | | |
| `TypographyRoot` | prop | prop | prop | prop | | | prop |

## Config

A project's typography in one object, `TypographyConfig`: the options above under the same names, so it spreads straight into any call, and `TypographyRoot`, `Typeset` and the command line read it as a whole.

```ts
type TypographyConfig = {
  lang?: Lang;
  register?: Register;
  quoteStyle?: QuoteStyle;
  disable?: readonly string[];
  enable?: readonly string[];
  rules?: readonly Rule[];   // only from a module, not JSON
  nbsp?: 'entity' | 'char';  // read by the HTML mode only
  hangAmount?: number;       // 0 to 1, read by TypographyRoot only
};
```

```ts
// typography.config.ts
import { defineConfig } from '@podiia/typography';

export default defineConfig({ lang: 'uk', quoteStyle: 'us', enable: ['symbol.plusminus'], hangAmount: 0.5 });
```

```ts
import site from './typography.config';

typographic(text, site.lang, site);
typesetHtml(html, site);
typesetMarkdown(md, { ...site, lang: 'de' });   // an option of the call beats the config's
unified().use(rehypeTypography, site);
<TypographyRoot config={site}>…</TypographyRoot>
```

```sh
typo --config typography.config.ts page.md   # or a "typography" key in package.json
```

- **Precedence**: an option given to a call replaces the config's value for that option. Lists are not merged: `{ ...site, disable: ['quote'] }` drops the config's `disable` and switches off `quote` only. On `TypographyRoot` and `Typeset` a prop beats `config`, which beats the outer root. On the command line a flag beats the config (see [cli.md](cli.md#config)).
- `defineConfig(config): TypographyConfig` returns `config` unchanged after checking it, so a mistake throws where the config is written: an unknown key, a `lang`, `register`, `quoteStyle` or `nbsp` that is not one of its values, a `hangAmount` outside 0 to 1, or a name in `disable` or `enable` that matches no rule (checked against the config's `rules` when given, like `selectRules`). A plain object typed `TypographyConfig` works as well, unchecked.
- `checkConfig(value: unknown): TypographyConfig` is the same check for a value read from JSON (a file, a `package.json` key, a pasted text); the command line and the playground use it.
- The playground's "Config" panel shows its switches as a config, ready for `package.json` or a file, and applies one pasted back.
- A new option goes into `TypographyConfig`; `ModeOptions` is derived from it, so it reaches every mode's type.

## The change record

```ts
type Change = {
  /** The id of the rule that made it. */
  rule: string;
  from: string; // what left
  to: string;   // what arrived in its place
};
```

A change is a stretch that one rule replaced, found by a word-level diff of the text before and after that rule ran (words, single spaces and single punctuation marks are compared; a no-break space is a different token from a space). One rule can report several changes. In the HTML, Markdown, text and rehype modes, a block that the mode could not map back onto its markup is kept as it came and reports nothing.

`diff(before, after): DiffRun[]` (with `type DiffRun = { kind: 'same' | 'del' | 'ins'; text: string }`) is the same diff, exported from the main entry. Above four million table cells it returns the middle as one deletion and one insertion.

## Main entry, `.`

### `typographic(text, lang = 'en', options = {}): string`

```ts
type TypographicOptions = {
  register?: Register;     // default 'display'
  quoteStyle?: QuoteStyle; // default 'language'
  blockStart?: boolean;    // default true
  disable?: readonly string[];
  enable?: readonly string[];
  rules?: readonly Rule[];
  onChange?: (change: Change) => void;
};
```

Applies the [rules](rules.md) to one plain string. Web addresses, emails and `` `code spans` `` are set aside while the rules run and come back exactly as written. A second run on the output changes nothing, in every language. German reads its own `»…«` and `›…‹` by where each mark stands, so two quotations in a row (`»a« und »b«`) are not taken for one.

```ts
import { typographic } from '@podiia/typography';

typographic('He said "we\'re here" - and left.', 'en');
// He said «we’re here»~— and left.   (~ is a no-break space)
typographic('He said "we\'re here"', 'en', { register: 'literary' });
// He said ‘we’re here’
typographic('21-26 - x', 'en', { disable: ['dash.range'] });
```

### `explain(text, lang = 'en', options = {}): { output: string; changes: Change[] }`

`options` is `TypographicOptions` without `onChange`. Returns the same string `typographic` would, and every change that was made to it, in the order the rules ran.

```ts
explain('He said "hi"... 21-26');
// { output: 'He said «hi»… 21–26',
//   changes: [{ rule: 'quote', from: '"', to: '«' }, { rule: 'quote', from: '"', to: '»' },
//             { rule: 'ellipsis', from: '...', to: '…' }, { rule: 'dash.range', from: '-', to: '–' }] }
```

### `typesetText(text, options = {}): string`

`TextOptions` is `ModeOptions` (a `TypographyConfig` and `onChange`). Typesets plain text a paragraph at a time: paragraphs are separated by blank lines, and each opens a block, so a dialogue dash is read at the start of every paragraph. Line breaks, indentation, trailing spaces and the blank lines between paragraphs are kept exactly; a paragraph that needs no change comes back byte for byte. A paragraph in which a rule would add or remove a line is kept as it came.

### `typesetBlock(joined, options): { text: string; keep: () => void }`

The building block of the modes. Typesets one block with `ModeOptions` and holds its changes back until `keep()` is called, so a block a mode throws away reports nothing. Use it to write a mode of your own.

### `ModeOptions`

```ts
type ModeOptions = TypographyConfig & {
  onChange?: (change: Change) => void;
};
```

Every mode takes the whole config: `nbsp` is read by the HTML mode only, `hangAmount` by none of them.

### Data

| Export | What it is |
|---|---|
| `TypographyConfig`, `defineConfig`, `checkConfig` | See [Config](#config). |
| `RULES: readonly Rule[]` | The rules in the order they run. `Rule` is `{ id: string; about: string; category?: RuleCategory; defaultOn?: boolean; when?(text, context): boolean; apply(text, context): string }`; `defaultOn: false` means the rule runs only when named in `enable`. `category` says what the rule is for (see `RULE_CATEGORIES`); every built-in rule has one, a custom rule may leave it out. `when` is an optional cheap test: when it returns false `apply` is skipped, so it must be false only if `apply` would return the text unchanged. A rule without `when` always runs. A custom rule made by spreading a built-in (`{ ...RULES[i], apply }`) copies its `when`: set `when: undefined`. |
| `selectRules({ rules?, disable?, enable? })` | The rules that run, in order. Names are checked against `rules` (the built-in list unless given); an unknown name, or a rule named in both `disable` and `enable`, throws. `without(disable)` is `selectRules({ disable })`. |
| `addRule(list, rule, position)` | A new list with `rule` at `{ before: id }`, `{ after: id }`, `{ first: true }` or `{ last: true }`. Does not change `list` or `RULES`; an unknown anchor or a duplicate id throws. |
| `RULE_IDS: readonly string[]` | `RULES.map(r => r.id)`. |
| `RULE_CATEGORIES`, `RuleCategory` | `['tradition', 'symbols', 'math', 'data']` and its union type. `tradition`: quotes, the apostrophe, dashes, the ellipsis, punctuation and the spaces of prose; `symbols`: arrows, ©, ®, ™; `math`: minus, ×, ±, fractions, ⇒; `data`: digit groups, ranges, units, percentages and currencies, dates. A label for lists (`typo --rules`, [rules.md](rules.md), the playground): it does not change what a rule does, and `disable` and `enable` take ids and groups of ids, not categories. |
| `LANGS: readonly Lang[]` | Every language that has a pack (26): the 24 EU languages, `uk` and `ch`. |
| `PACKS`, `PACK`, `LangPack` | The language packs (`src/core/lang/`), as a list and by code, and their type. See [contributing.md](contributing.md#adding-a-language). |
| `REGISTERS: readonly Register[]` | `display`, `literary`. |
| `NBSP` | The no-break space character, U+00A0. |
| `Context` | `{ lang, register, quoteStyle, blockStart }`, what a rule is given besides the text. |
| `Lang`, `Register`, `QuoteStyle` | The unions above; `Lang` is derived from the packs. |
| `splitHangs`, `TextPart`, `hangPieces`, `HangPiece` | See [Hanging punctuation](#hanging-punctuation). |

## `./text`

`typesetText` and `TextOptions`, as above. Use this entry when you want the plain-text mode and nothing else.

## `./html`

### `typesetHtml(html, options = {}): string`

```ts
type HtmlOptions = ModeOptions; // reads nbsp
```

Typesets the text of an HTML string. Tags, attributes, comments and the content of `<pre>`, `<code>`, `<script>`, `<style>`, `<kbd>`, `<samp>`, `<textarea>`, `<svg>`, `<math>` and `<template>` are left exactly as they were. Text is typeset a block at a time with each inline element standing in as a placeholder, so a quotation pairs across a link. A block whose text needs no change is returned byte for byte.

Entities: `&quot; &apos; &amp; &lt; &gt; &nbsp;`, the typographic names (`&mdash; &laquo; &hellip;` and so on), the printable signs the rules act on (`&euro; &copy; &reg; &trade; &deg; &times; &minus; &plusmn; &sect; &para; &frac12; &frac14; &frac34;`) and numeric references are read as the characters they stand for, so `5 &euro;` binds like `5 €`. In a block that changes, text is written back as Unicode characters, with `& < >` escaped and, by default, a no-break space as `&nbsp;`; the output needs UTF-8. Any other named entity (`&alpha;`, `&shy;`) is kept as it was.

```ts
import { typesetHtml } from '@podiia/typography/html';

typesetHtml('<p>She said "go" - <a href="/x">Read more -></a></p>', { lang: 'en' });
```

It does not read the `lang` attribute (pass `lang`), and it uses a tokenizer, not a real HTML parser: malformed markup is left alone rather than repaired. See [limits.md](limits.md).

## `./markdown`

### `typesetMarkdown(markdown, options = {}): string`

`MarkdownOptions` is `ModeOptions`. Typesets the prose of a Markdown document. Left alone: fenced and indented code, inline code, front matter, raw HTML, link and image targets, reference definitions, footnote markers, backslash escapes, entities, thematic breaks and table separator rows. The marker at the start of a line (`#`, `>`, `-`, `1.`) is kept and the text after it is typeset. A paragraph is typeset as a whole, line breaks included; a paragraph that needs no change comes back byte for byte, and so does the whitespace of every line.

```ts
import { typesetMarkdown } from '@podiia/typography/markdown';

typesetMarkdown('# "Title" - subtitle\n\n`a -> b` stays.', { lang: 'en' });
```

## `./rehype`

### `rehypeTypography(options = {})` (default export)

A unified plugin: `.use(rehypeTypography, { lang: 'uk' })`. It has no dependency: a hast node is read as plain data. `RehypeOptions` is `ModeOptions`.

```ts
import rehypeTypography from '@podiia/typography/rehype';

unified().use(remarkParse).use(remarkRehype).use(rehypeTypography, { lang: 'uk' }).use(rehypeStringify);
```

### `typesetHast(tree, options = {}): T`

Typesets any hast tree in place and returns the same tree. Text is typeset a block at a time with the inline elements inside it, so a quotation pairs across a link. Left alone: `pre`, `code`, `kbd`, `samp`, `textarea`, `script`, `style`, `svg`, `math`, `template`, any element with `data-typography="off"` (and its subtree), and every attribute. An element's `lang` (or `xmlLang`) property sets the language of its subtree, when its primary subtag is a language the package has a profile for (`uk-UA` is `uk`, `de-CH` is `de`); an inline element in another language is typeset on its own, so a quotation does not pair across it. hast text is already decoded, so entities are not a concern.

## `./dom`

Framework-free, browser only (it needs `getComputedStyle`, `ResizeObserver`, `MutationObserver` and `requestAnimationFrame`).

### `hangPunctuation(el: HTMLElement): () => void`

Hangs the punctuation marked by `HangText` or `markHangs` under `el`, at any width and in any alignment: an opening run (`« ( „ ¿`…, in `<span data-hang>`) hangs into the left margin wherever it starts a line, and a closing run (`» ) “ ’`…, with any `.,;:!?…` after it, in `<span data-hang-close>`) hangs into the right margin wherever it ends one, which shows in right-aligned, centred and (in Chrome and Firefox) justified text.

How: each mark gets a negative margin of its own width, and the space beside it carries the same width as extra `word-spacing`: the space before an opening run (`<span data-hang-space>`), and the space a closing span holds after its mark. In the middle of a line the two cancel, so every letter sits where it would without hanging. Where a line breaks at that space, the browser drops the space, its extra spacing goes with it, and the mark hangs. Nothing depends on where lines break, so nothing is re-measured when they move (a narrower window, a dialog that opens, a scrollbar that appears). Only each mark's width is measured, once, and stored in em (`--hang-w` on the mark, `--hang-open` on the space before an opening run), so it follows the text size.

An opening mark wrapped by the page with nothing before it opens its paragraph and always hangs; one glued to the text before it is left alone; for one with a plain space before it, the pass wraps that space itself. A closing span that does not hold the space after it (it ends an inline element, so the space is outside) hangs only where its block ends.

How far marks hang is the CSS custom property `--hang-amount` on the mark or any ancestor: a share of the width from `0` to `1` (`0.3` hangs by 30%, `0` not at all); unset is `1`. The margins and spacing read it in CSS, so changing it takes effect at once, with no new pass.

It runs once now, again when web fonts are ready (every mark is re-measured), when `el` or a `<dialog>` inside it is resized, and when text or elements under `el` change (new marks are measured). It returns a function that stops all of that. It marks the spans it has measured with `data-measured`. A mark with no width (a closed dialog) is left until it has one.

### `markHangs(el: HTMLElement): void`

Wraps the punctuation under `el` that should hang in the spans `hangPunctuation` reads, for markup that did not come from `HangText`: the output of the HTML, Markdown or rehype modes, or any page. A text node opens a word where it begins its block or follows text that ended in a space. Text in `pre`, `code`, `kbd`, `samp`, `script`, `style` and `textarea`, and text already wrapped, is left alone. Every span gets a rough width (0.4em per mark) so the text hangs at once; call `hangPunctuation(el)` after it for the exact widths.

### `hangStyle(piece, next)`

The attribute and inline style (`{ attr, style }`, style as CSS property names) of one `HangPiece`, with rough widths, as `HangText` and `markHangs` use them. For a renderer of your own.

This is measured on purpose. CSS `hanging-punctuation: first` covers only the first line and is supported only in Safari; using both would hang a mark twice.

### `hangScript(): string`

Returns the source of a script that runs `hangPunctuation` on its own parent element: `(<minified function>)(document.currentScript.parentElement)`. The string is generated from `hangPunctuation` by `bun run gen:script` into `src/dom/script.ts` and a test fails when it is out of date, so a server build and a client build print the same text (a bundler formats a function's source differently in each, and React's development build warns about two different scripts on hydration). The function is self-contained (only browser globals are free in it), which is what lets its source be sent to the page.

Placement: put it as an inline `<script>` as the last child of the element that holds the text, so the text before it has been parsed when it runs. The marks then hang as the page is parsed, not after the bundle has loaded and hydrated; without it, marks that start a wrapped line on a prerendered page move by their own width at that moment. It needs a content security policy that allows inline scripts.

```html
<p>
  <span data-hang>«</span>Quoted text that wraps over several lines...
  <script>(function hangPunctuation(el) { ... })(document.currentScript.parentElement)</script>
</p>
```

(The script body is the real function source; the elision is only for this page.)

## Hanging punctuation

### `splitHangs(text, atStart = true): TextPart[]`

```ts
type TextPart = { text: string; hang: boolean; lead: boolean };
```

Cuts `text` into plain runs and the runs of opening punctuation that should hang. The opening marks are `« ‹ „ “ ‘ ‚ » › ( [ { ¿ ¡`. A run is one or more of them (a stack such as `«(` counts as one) that starts a word and is followed by a letter or digit; a mark followed by a space or the end of the text is not hung. `atStart` says whether `text` itself begins a paragraph, so that its first character begins a word; a text that continues another (after a link) starts mid-word unless it opens with a space. `lead` is true for the run that opens the paragraph, which a page can hang by a rough offset before anything has been measured.

```ts
splitHangs('«Hello» he said');
// [{ text: '«', hang: true, lead: true }, { text: 'Hello» he said', hang: false, lead: false }]
```

`splitHangs` covers opening marks only; `hangPieces` adds closing ones.

### `hangPieces(text, atStart = true): HangPiece[]`

```ts
type HangPiece = { kind: 'text' | 'space' | 'open' | 'close'; text: string };
```

Cuts `text` for hanging on both sides: `open` is an opening run that starts a word and is followed by a letter or digit; `space` is the whitespace before it; `close` is a closing run (`» › « ‹ ” “ ’ ‘ ) ] }`) that ends a word, with any `.,;:!?…` after it, together with the whitespace after it (a closing run and an opening run around one space share it). `atStart` says whether a word starts at the first character (a paragraph start, or text after a space); a text that continues a word starts mid-word. The pieces' texts joined give `text` back. This is what `HangText` renders and `markHangs` wraps.

```ts
hangPieces('Grass (Camden House, 2027). He');
// [{ kind: 'text', text: 'Grass' }, { kind: 'space', text: ' ' }, { kind: 'open', text: '(' },
//  { kind: 'text', text: 'Camden House, 2027' }, { kind: 'close', text: '). ' }, { kind: 'text', text: 'He' }]
```

## `./react`

`react` (18 or later) is an optional peer dependency; only this entry needs it.

### `<TypographyRoot config? lang? register? quoteStyle? disable? enable? rules? onChange? hangAmount? early?>`

Wraps a page so its text is typeset: it sets the language and register every `Typeset` under it falls back to (a value is taken from the root's own prop, then from `config`, then from an outer root, then `en` and `display`), and hangs opening punctuation wherever a line starts with it. It renders one `<div>` around its children. On a prerendered page it also sends the hanging pass inline with `<HangScript />` as the last child of that div; `early={false}` turns that off.

| Prop | Type | Default |
|---|---|---|
| `children` | `ReactNode` | required |
| `config` | `TypographyConfig` | none; pass a constant. Its `nbsp` is not read. |
| `lang` | `Lang` | inherited |
| `register` | `Register` | inherited |
| `quoteStyle` | `QuoteStyle` | inherited |
| `disable`, `enable` | `readonly string[]` | inherited; pass a constant, not an inline array |
| `rules` | `readonly Rule[]` | inherited; pass a constant |
| `onChange` | `(change: Change) => void` | inherited; pass a stable function (`useCallback`). Called when a text is typeset, not on every render. |
| `early` | `boolean` | `true` |

### `<Typeset text atStart? config? lang? register? quoteStyle? disable? enable? rules? onChange?>`

A plain string, typeset in the language and register of the surrounding root (or those given as props, then in `config`), with its hanging marks wrapped in `data-hang` spans. Memoised on its arguments.

| Prop | Type | Default |
|---|---|---|
| `text` | `string` | required |
| `atStart` | `boolean` | `true`; set `false` for a string that continues a paragraph after an element. Also passed as `blockStart`. |
| `config` | `TypographyConfig` | none; its values beat the root's, its own props beat it. Pass a constant. |
| `lang`, `register`, `quoteStyle` | `Lang`, `Register`, `QuoteStyle` | from `TypographyRoot` |
| `disable`, `enable`, `rules`, `onChange` | as on `TypographyRoot` | from `TypographyRoot`; pass constants |

```tsx
import { Typeset, TypographyRoot } from '@podiia/typography/react';

<TypographyRoot lang="uk">
  <p><Typeset text={'Він сказав "камінь" - і пішов'} /></p>
</TypographyRoot>
```

### `<HangText text atStart?>`

Text that has already been through `typographic`, with the punctuation that hangs wrapped in spans (see `hangPieces` and `hangPunctuation`): an opening run in `<span data-hang>`, the space before it in `<span data-hang-space>`, a closing run with the space after it in `<span data-hang-close>`. Use it where you cut the text up yourself and so must typeset before you cut. Every span carries a rough width (0.4em per mark) from the first paint, so a prerendered page hangs before any script runs; the measuring then sets the exact width, a change of a fraction of a pixel.

### `<HangScript />`

Renders `hangScript()` as an inline `<script>`. Put it last inside the element that holds the text. On the server and while the page hydrates it renders the script; on any later client render it renders nothing, because scripts rendered by React are never run. `TypographyRoot` does this for you.

### `useHangingPunctuation(root: RefObject<HTMLElement | null>): void`

Runs `hangPunctuation` over everything under `root.current` for as long as the component is mounted (in a layout effect). For a page that wires the hook itself instead of using `TypographyRoot`.

### `TypographyContext` and `TypographySetting`

```ts
type TypographySetting = {
  lang: Lang;
  register: Register;
  quoteStyle?: QuoteStyle;
  enable?: readonly string[];
  rules?: readonly Rule[];
};
const TypographyContext: React.Context<TypographySetting>; // default { lang: 'en', register: 'display' }
```

What `Typeset` falls back to. `TypographyRoot` provides it.

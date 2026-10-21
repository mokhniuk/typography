# Getting started

Install the package, typeset a string, then pick the mode that matches where your text lives. Everything below runs as it is written.

## Install

The package is `@podiia/typography`. It reaches npm with 1.0; until then it is a git dependency on a release tag. The repository is private, so the machine needs SSH access to it.

```sh
bun add git+ssh://git@github.com/mokhniuk/typography.git#v{{version}}
```

After 1.0 this becomes `npm install @podiia/typography` (or `pnpm add`, `bun add`, `yarn add`). The package ships TypeScript sources and has no build step, so it needs Bun or a TypeScript-aware bundler. The core has no dependencies; `react` 18 or later is an optional peer, needed only by the React entry.

## Typeset a string

```ts
import { typographic } from '@podiia/typography';

typographic('He said "we\'re here" - and left.', 'en', { quoteStyle: 'us' });
// He said “we’re here” — and left.
```

The second argument is the language (`en` when you give none). The output is stable: a second run on it changes nothing, in every language.

English defaults to the package's house guillemets `«…»`. Pass `quoteStyle: 'us'` for `“…”` with `‘…’` inside, in any language. The `literary` register sets book-style marks where a language has them.

## See what it changed

```ts
import { explain } from '@podiia/typography';

explain('He said "hi"... 21-26', 'en', { quoteStyle: 'us' });
// { output: 'He said “hi”… 21–26', changes: [{ rule: 'quote', from: '"', to: '“' }, …] }
```

Every change names the rule behind it. Switch a rule off by its id, or a whole group (`space`, `dash`, `symbol`); rules that are off by default run only when named in `enable`. The [rules page](/docs/rules/) lists them all, and an unknown name throws, so a typo cannot pass for "everything stays on".

```ts
typographic('21-26 - x', 'en', { disable: ['dash.range'] });
typographic('Call 1000000 , now', 'en', { enable: ['number.group', 'space.before-punctuation'] });
```

## HTML, Markdown and pipelines

```ts
import { typesetHtml } from '@podiia/typography/html';
import { typesetMarkdown } from '@podiia/typography/markdown';

typesetHtml('<p>She said "go" - <a href="/x">Read more -></a></p>', { lang: 'en' });
typesetMarkdown('# "Title" - subtitle\n\n`a -> b` stays.', { lang: 'en' });
```

Tags, attributes, comments and the content of `pre`, `code`, `script` and `style` are left as they were. In a unified pipeline, use `@podiia/typography/rehype` as a plugin. This website is built that way: every page you read went through `typesetHtml`.

## React

```tsx
import { Typeset, TypographyRoot } from '@podiia/typography/react';

<TypographyRoot lang="uk">
  <p><Typeset text={'Він сказав "камінь" - і пішов'} /></p>
</TypographyRoot>
```

`TypographyRoot` also hangs opening and closing punctuation in the margin, and sends the small inline script that makes it right at first paint on a prerendered page.

## Command line

```sh
typo note.txt                  # typeset to standard output
typo -w docs/*.md              # rewrite files in place
typo -c docs/*.md              # change nothing; exit 1 if any file would change (CI)
```

## Where next

- [API reference](/docs/api/): every entry point, option and type.
- [Rules](/docs/rules/): what each rule does, with an example.
- [Languages](/docs/languages/): quote marks, dashes and spacing per language, and which are unreviewed.
- [Known limits](/docs/limits/): read this before you depend on a language.
- [Playground](/playground/): paste text and watch the rules act.

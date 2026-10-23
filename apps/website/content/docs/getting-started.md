# Getting started

Install the package, typeset a string, then pick the mode that matches where your text lives. Everything below runs as it is written.

## Install

The package is `@mokhniuk/typography`, version {{version}}, the first on npm. It is compiled ESM with TypeScript declarations, so Node and plain tooling work.

```sh
npm install @mokhniuk/typography
```

`pnpm add`, `bun add` and `yarn add` work the same. A release tag also installs from git; the repository is private, so the machine needs SSH access to it:

```sh
bun add git+ssh://git@github.com/mokhniuk/typography.git#v{{version}}
```

The core has no dependencies; `react` 18 or later is an optional peer, needed only by the React entry. The `typo` command runs on Node 20.10 or later, or Bun. Below 1.0.0 the package follows semver, so a minor release may change output.

## Typeset a string

```ts
import { typographic } from '@mokhniuk/typography';

typographic('He said "we\'re here" - and left.', 'en', { quoteStyle: 'us' });
// He said “we’re here” — and left.
```

The second argument is the language (`en` when you give none). The output is stable: a second run on it changes nothing, in every language.

English defaults to `“…”` with `‘…’` inside. Pass `quoteStyle: 'us'` for those marks in any language, or `quoteStyle: 'guillemets'` for the package's house style `«…»` with `„…“` inside, in any language. The `literary` register sets book-style marks where a language has them.

## See what it changed

```ts
import { explain } from '@mokhniuk/typography';

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
import { typesetHtml } from '@mokhniuk/typography/html';
import { typesetMarkdown } from '@mokhniuk/typography/markdown';

typesetHtml('<p>She said "go" - <a href="/x">Read more -></a></p>', { lang: 'en' });
typesetMarkdown('# "Title" - subtitle\n\n`a -> b` stays.', { lang: 'en' });
```

Tags, attributes, comments and the content of `pre`, `code`, `script` and `style` are left as they were. In a unified pipeline, use `@mokhniuk/typography/rehype` as a plugin. This website is built that way: every page you read went through `typesetHtml`.

## React

```tsx
import { Typeset, TypographyRoot } from '@mokhniuk/typography/react';

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

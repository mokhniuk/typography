# Recipes

How to use the engine from the tools you already have. Every recipe is a few lines over a mode described in [api.md](api.md); none needs a plugin. Pick the mode by where your text lives: a string (`/text`), an HTML string (`/html`), a Markdown string (`/markdown`), a hast tree (`/rehype`), a React tree (`/react`).

The recipes for Vue, Svelte, Astro, Next and Vite are the package's modes called from each tool's own hooks; they were written from the tools' documentation, and only the package calls in them are run by the package's tests. If one fails in your setup, [open an issue](https://github.com/mokhniuk/typography/issues) with the tool's version.

## One language, any framework

If a page sets one language, load one pack: `/lite` carries no pack and `/lang/<code>` is one. The recipes below use `/html` with a language code for brevity; swap in this pair to cut the bundle from about 30 KB brotli to about 12 ([api.md](api.md#loading-only-the-languages-used)):

```ts
import { typesetHtml } from '@mokhniuk/typography/lite';
import { uk } from '@mokhniuk/typography/lang/uk';

typesetHtml(html, { lang: uk });
```

Share one set of options across a project with `defineConfig` (main entry; it is not in `/lite`):

```ts
// typography.ts
import { defineConfig } from '@mokhniuk/typography';
export const site = defineConfig({ lang: 'en', quoteStyle: 'us' });
```

## Plain HTML, no build step

From a CDN that serves npm packages as ES modules (esm.sh, jsDelivr's `+esm`), in a page:

```html
<p id="lead">He said "we're here" - and left.</p>
<script type="module">
  import { typesetHtml } from 'https://esm.sh/@mokhniuk/typography/lite';
  import { en } from 'https://esm.sh/@mokhniuk/typography/lang/en';

  const el = document.getElementById('lead');
  el.innerHTML = typesetHtml(el.innerHTML, { lang: en });
</script>
```

Pin the version in the URL (`@mokhniuk/typography@0.18.0/lite`) so a minor release, which may change output, cannot change your page. Typesetting in the browser means the page shows the straight text until the script runs; where you can, typeset when you build instead (the Vite and Node recipes below).

Hanging punctuation in the browser without a framework is the `/dom` entry: `hangPunctuation(el)` ([api.md](api.md)).

## Vue

Typeset a string in a computed value. Use `typesetText` for a plain string and `typesetHtml` for HTML you already trust enough to render with `v-html`:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { typesetText } from '@mokhniuk/typography/text';

const props = defineProps<{ text: string; lang?: 'en' | 'uk' | 'de' }>();
const typeset = computed(() => typesetText(props.text, { lang: props.lang ?? 'en' }));
</script>

<template>
  <p>{{ typeset }}</p>
</template>
```

Typeset text, not markup, with `{{ }}`: Vue escapes it, so there is nothing to sanitise. For HTML, `v-html="typesetHtml(html, { lang })"` typesets the tags' text and leaves the markup as it was; it does not make untrusted HTML safe.

## Svelte

```svelte
<script lang="ts">
  import { typesetText } from '@mokhniuk/typography/text';
  export let text: string;
  export let lang = 'en';
  $: typeset = typesetText(text, { lang });
</script>

<p>{typeset}</p>
```

(`lang` here is a plain string; type it as `Lang` from the main entry to have a wrong code fail at compile time.)

## Astro

Astro's Markdown goes through remark and rehype, so the rehype plugin is the whole integration:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import rehypeTypography from '@mokhniuk/typography/rehype';

export default defineConfig({
  markdown: {
    smartypants: false, // let the engine own the quote marks, not both
    rehypePlugins: [[rehypeTypography, { lang: 'en' }]],
  },
});
```

The plugin reads each element's `lang` attribute, skips `code`, `pre` and `data-typography="off"`, and leaves attributes alone. In an `.astro` component, typeset a string in the frontmatter with `typesetText` and print it as usual.

## Next.js

Strings and HTML need no React entry, so a server component can call them:

```tsx
// app/page.tsx (a server component)
import { typesetText } from '@mokhniuk/typography/text';

export default function Page() {
  return <h1>{typesetText('He said "hi" - and left.', { lang: 'en' })}</h1>;
}
```

`/react` (`TypographyRoot`, `Typeset`) uses hooks and context, so it runs on the client; its files start with `'use client'` (since 0.18.1), so a server component can import it directly and Next sends it to the browser. Before that, re-export it from a file of your own that starts with `'use client'`.

`TypographyRoot` sends its hanging pass as an inline script; on a page with a strict content security policy, pass `early={false}` ([limits.md](limits.md)).

## Vite, or any build step

Typeset the HTML your tool emits, once, at build time, so the browser gets finished text. A small Vite plugin:

```ts
// vite.config.ts
import type { Plugin } from 'vite';
import { typesetHtml } from '@mokhniuk/typography/html';

const typography = (lang = 'en'): Plugin => ({
  name: 'typography',
  transformIndexHtml: { order: 'post', handler: (html) => typesetHtml(html, { lang }) },
});

export default { plugins: [typography('en')] };
```

`typesetHtml` leaves tags, attributes, `script`, `style`, `pre` and `code` as they were. It does not read the `lang` attribute of the elements it meets, so give it one language per call, or use the rehype plugin when a page mixes languages.

## markdown-it, remark, unified

markdown-it renders HTML, so typeset its output:

```ts
import MarkdownIt from 'markdown-it';
import { typesetHtml } from '@mokhniuk/typography/html';

const md = new MarkdownIt({ typographer: false }); // the engine does the quotes and dashes
const html = typesetHtml(md.render(source), { lang: 'en' });
```

Or typeset the Markdown source first with `typesetMarkdown(source, { lang })`, which leaves code, links and front matter alone. For remark and unified, chain `remark-rehype` and the plugin:

```ts
unified().use(remarkParse).use(remarkRehype).use(rehypeTypography, { lang: 'uk' }).use(rehypeStringify);
```

## Command line, CI, editors

`typo -w content/**/*.md` rewrites files; `typo -c` exits 1 if any file would change, which makes it a CI check ([cli.md](cli.md)). A `typography` key in `package.json` or a `typography.config.ts` holds the options.

## Leave to CSS what CSS does

The engine changes characters; CSS shapes lines. Use both, and do not use JavaScript for what a property does:

| Need | Use |
|---|---|
| Balanced short headings | `text-wrap: balance` on `h1`, `h2`, captions |
| No one-word last line in body text | `text-wrap: pretty` |
| Hyphenation | `hyphens: auto` with a `lang` attribute on the element |
| Quote marks, dashes, no-break spaces, ranges, symbols | this engine |
| Opening marks hanging in the margin | this engine (`hangPunctuation`); `hanging-punctuation` in CSS is Safari only |

[Good practices](practices.md) says what to bind and what to leave alone.

# Languages

One generated page per language, read from its pack: [languages/index.md](languages/index.md). Each page lists the quote marks and nesting, the sentence dash, orphan letters, abbreviations, `%` and currency spacing, number format, and the sources the pack was written from.

The engine has 26 language packs, `src/core/lang/<code>.ts`: the 24 official languages of the EU (`bg cs da de el en es et fi fr ga hr hu it lt lv mt nl pl pt ro sk sl sv`), Ukrainian (`uk`) and Swiss usage (`ch`). `Lang` is derived from the packs, and `en` is the default when none is given. American English is not a pack: it is the option `quoteStyle: 'us'` (`“…”` with `‘…’` inside) on any language.

## Read this first

- **No pack has been read by a native speaker.** Every pack has `reviewed: false`. The five oldest (`en uk de pl fr`) and `ch` came from general knowledge; the other twenty were written from published style guides (the EU Interinstitutional Style Guide first, then the national guide), and each page names its sources. Some of those sources could only be read in part, so a pack is a defensible style, not a certified one. Have a native reader check a language before you rely on it, then set `reviewed: true`.
- Which decisions have a source read, and which are still general knowledge, is recorded per rule in [sources.md](../resources/sources.md). Quote marks are `disputed` there: CLDR 46 differs from the engine for English, German, French level two and de-CH.
- The abbreviation lists are short on purpose: a list is only as long as its source. Add to a list only from a style guide.
- Dash profiles: German and literary British English use a spaced en dash for a break in the sentence; the packs written from the Interinstitutional Style Guide use the em dash where it says so. Croatian, Hungarian, Romanian, Slovak and Swedish use the spaced en dash their dialogue sources set before the words of the narrator. Dutch defaults to the spaced em dash, but usage there often prefers a spaced en dash; this was not verified.
- The package's benchmark has a few cases per language and mostly tests English. They check that the output is a defensible style, not that a native reader approves it.

## Quote marks

A quotation nested deeper than the levels a pack lists starts over from the first. Source marks may be curly, low, straight or guillemets; any mix is read, and the marks of the language and level are set. The `literary` register uses the pack's literary quotes where it has them (British English `‘…’` with `“…”` inside) and the display quotes otherwise.

`quoteStyle: 'us'` sets `“…”` with `‘…’` inside for any language and takes precedence over both the language's marks and the `literary` register. The default, `'language'`, keeps each language's own marks. English's own default is `«…»`, which is this package's house style; the benchmark counts it as a failure against its own check (see `bench/RESULTS.md`).

German nested quotes are `»outer ›inner‹ outer«`. The other common German style, `„outer ‚inner‘ outer“`, is not implemented.

## Dialogue dash

Where a language writes a line of dialogue with a dash instead of quotation marks, a paragraph that opens with a hyphen, en dash or em dash and a space is such a line (`dash.dialogue`), in both registers: the dash becomes the language's own, followed by a no-break space (`—~Привіт`), or attached with no space in Spanish (`—¿Esperamos?`). The pack field is `dialogueDash`; each language page shows it.

- Em dash: `uk pl fr it pt bg da` (Polish, Italian, Bulgarian and Danish use the dash the rest of the text uses); `es` attached.
- En dash: `ro hr sl hu fi sv cs sk lt`.
- Not set: `et` (dialogue is quoted), `el` and `lv` (not confirmed by a source read), and `en de ch nl mt ga`.

Only the start of the text (`blockStart`), and not when a later line of the same paragraph also opens with a dash: a dash after a line break is as likely a list marker, and a paragraph of such lines is a list. A single line that opens with `- ` in one of these languages is read as dialogue, so a one-item list written that way gets the dash too. Sources per language are in [sources.md](../resources/sources.md#dashdialogue).

## Not implemented

- A literary profile for most languages beyond English and Ukrainian: they fall back to display. German books use `„…“` with `‚…‘` inside.
- A quotation that continues across paragraphs (books reopen the quote at each paragraph start). Pairing is per string, so the lone opener is left as it is.
- A lone curly quotation mark (`“`, `„`) with no partner is left as written when its side cannot be told from where it stands.
- Per-level quote shapes that differ in kind (Latvian and Lithuanian single quotes), a third Swedish level, dotted time ranges (`9.00-18.30`), and abbreviations written without a full stop (Estonian `nr`, Finnish `klo`): listed in [backlog.md](backlog.md).
- Italian and Maltese truncation apostrophes (`po'`, `va'`) inside straight single quotes can close the quotation early.
- A `lang` outside `Lang` is a type error in TypeScript, throws at run time when text with quotes is typeset, and is refused by the command line.

# Changelog

Versions follow semver while the package is below 1.0.0: a **minor** release may change the output of the engine or the API (every entry says whether it can change output you already have), a **patch** release fixes a bug without changing output you rely on. If you depend on exact output, pin a tag and read this file before you move it.

## Unreleased

### Fixes

- A straight `"` whose next mark opens another quotation is a lone opener: `"a then "b" c` was set `«a then»b» c` (the two were paired one off and the spaces just inside the wrong pair were eaten) and is now `«a then „b“ c`; the same for a quotation left open before a line break (`He said "first line\nThen "x" and "y"`). Can change existing output: yes, for text with an unclosed straight quote before another quotation.
- A space just inside a quotation mark that is glued to a word on the outside moves out instead of going: `km‘ z and 10’` was `km«z and 10»` and is `km «z and 10»`; `a ‚b c ‘d e` was `a «b c»d e` and is `a «b c» d e`. No two words are glued together any more, and the result is stable on a second run. Can change existing output: yes, for such text. A new property test (`src/properties.test.ts`) holds every language and register to it: a space between two words may change or move past a mark, never go.
- A private-use character in the input (U+E000 to U+E003, the engine's own placeholders) no longer switches off the protection of addresses, emails and code spans, or reads as a quote mark: each is set aside as a zone of its own. Can change existing output: yes, only for text that held one.
- `->` and `<-` are no longer arrows at the end of an HTML comment or a long arrow (`-->`), in a double-headed one (`<->`, `<-->`) or in a comparison with a negative number (`x<-1`). Can change existing output: yes, for such text.
- Markdown: a `pre`, `script`, `style` or `textarea` block runs to its closing tag, blank lines included (its second half used to be typeset); a leading `---` is front matter only when it goes straight on and closes with `---` or `...` (a document opening with a thematic break was left untouched to the end). Can change existing output: yes, for such documents.
- HTML: the named entities `&euro; &copy; &reg; &trade; &deg; &times; &minus; &plusmn; &sect; &para; &frac12; &frac14; &frac34;` are read as their characters, so `5 &euro;` binds like `5 €` (it kept a breaking space; the rehype mode, which reads a parsed tree, already bound it), and are written as the character in a block that changes. Can change existing output: yes, for HTML with one of them in a block that changes. A new test (`src/modes.test.ts`) holds the HTML and rehype modes to the same text.
- One hanging pass per element: the inline script's pass is stopped when `useHangingPunctuation` (or a second `hangPunctuation` call) starts on the same root, instead of two sets of observers running on it. No output change.

### React

- `Typeset` and `TypographyRoot` take `disable` and `onChange`, like every other site. No output change.

### Tooling and docs

- `bun run compare` no longer fails with `ENOBUFS` on a large `src/` (the archive is written to a file).
- Biome (`biome.json`) lints the sources, and CI runs on pull requests and builds the playground.
- Docs brought up to date: `Lang` is the 26 pack codes (api.md, cli.md, limits.md), the text and React option tables list every option, hanging covers both sides at any alignment (README, `typography.ts`), the backlog counts and the sentence-dash item reflect 0.4.0, widows and runts are a CSS matter (limits.md), the accessibility checker moved to `docs/ideas.md`, and the compare and Gaelic items are gone.

## 0.4.1 (2026-10-21)

- Hanging punctuation is right at every width and in every alignment, and closing marks hang too. It used to find the marks that start a line and hang only those, but hanging a mark makes its word narrower, which can move it up to the line before; the pass then un-hung it, and after four rounds left whatever state it reached (seen in a bio dialog: `(Camden` at a line start not hung, `(AGS)` in mid-line hung over the space before it). Now each mark has a negative margin of its width and the space beside it carries that width as extra word spacing: mid-line the two cancel and every letter sits where plain text puts it; at a break the browser drops the space and the mark hangs. Line breaks are never measured, so nothing goes stale when they move. Opening runs hang left at a line start; closing runs (`» ) “ ’`…, with `.,;:!?…` after them, so `(AGS).` hangs `).`) hang right at a line end, which shows in right-aligned, centred and justified text (justified: Chrome, not Safari). Centred and indented text now hang too. `HangText` and the new `markHangs(el)` (for HTML, Markdown and rehype output, or any page) wrap the marks in `data-hang`, `data-hang-space` and `data-hang-close` spans with a rough 0.4em width, so text hangs at first paint; `hangPunctuation` measures the exact widths once (`--hang-w`, `--hang-open`). `--hang-amount` is read by CSS, so it applies live. `data-hung` is gone. New: `hangPieces`, `HangPiece` (core); `markHangs`, `hangStyle` (dom). Can change existing output: no for text; yes for the DOM: the markup `HangText` renders is new, and closing marks now hang.

## 0.4.0 (2026-10-21)

- `hangPunctuation` (and so `hangScript` and `TypographyRoot`) reads the CSS custom property `--hang-amount`: how far an opening mark hangs, as a share of its width from 0 to 1 (0 turns hanging off). Unset, it is 1, as before. `data-hung` now holds the share a mark was hung by instead of being empty. Can change existing output: no (the engine's text output is unchanged; hanging is unchanged unless the property is set).
- Dialogue dash in 17 languages, in both registers. A paragraph that opens with a hyphen or dash and a space is a line of dialogue where the language writes dialogue with a dash: em dash in `uk pl fr it pt bg da`, attached raya in `es` (`—¿Esperamos?`), en dash in `ro hr sl hu fi sv cs sk lt`, followed by a no-break space. Before, only Ukrainian in the literary register had it. A paragraph whose later line also opens with a dash is read as a list and left alone. Each language is backed by its orthography or language advice service (17 sources added to the registry; `dash.dialogue` is now `verified`). Greek and Latvian are not set: no source confirmed the dash. The pack field `dialogueDash` is now `{ mark, attached? }` instead of `true` (type `DialogueDash`). Can change existing output: yes, for a paragraph that opens with `- `, `– ` or `— ` in those languages (Ukrainian in the display register included).
- The sentence dash in Croatian, Hungarian, Romanian, Slovak and Swedish is the spaced en dash their dialogue sources set before the words of the narrator (it was the default em dash, marked unverified). Can change existing output: yes, for every spaced hyphen or dash in text in those five languages.
- Playground: a short and a long example in each of the 26 languages, with the HTML and Markdown examples written in the language too (they were English around the sample sentence); an inserted example that has not been edited follows a change of format or language (plain text no longer lands in HTML mode); the HTML preview hangs opening punctuation too, and a Hanging slider with four stops (0, 30%, 50%, 100%) sets `--hang-amount` for the previews, live; the list of what each rule did is a `dl`; markup is semantic and every theme value is a CSS variable, with a `data-theme` switch ready ([docs/ui.md](docs/ui.md)). Playground and docs only, cannot change existing output.

## 0.3.0 (2026-10-21)

- Two inch marks in one text are no longer read as a quotation: `A 2" pipe and a 4" pipe.` was set `A 2«pipe and a 4» pipe.` (the space after the first mark was lost) and now keeps both marks as written, as does `He is 5'10" and she is 5'6" tall.` A straight `"` that stands straight after a digit no longer opens a quotation; after a letter it still does (`Tallinn"ä"`). Can change existing output: yes, for text with a straight `"` directly after a digit that used to pair with a later `"` (two inch marks, or `5"` followed by a quotation); `"call 911"` and a quote after a space, bracket, dash or colon pair as before. Found by reading Practical Typography against the engine.

- A sources registry: `scripts/sources.ts` records, for each of the 29 rules, the sources read, why the rule exists, what others do instead, and a confidence (`verified`, `general-knowledge` or `disputed`). `bun run docs:sources` writes [docs/sources.md](docs/sources.md) `docs/sources.html` (decisions, with a filter by confidence) and `docs/bibliography.html` (every source in one table with author, link, description and where it is used), both self-contained pages; `src/sources.test.ts` fails when a rule has no entry, an entry cites an unknown source, a source is incomplete, `verified` has no source, or the page is stale. `docs/rules.md` links each rule to its entry. First pass: `quote` is `disputed` (CLDR differs from the engine for en, de, fr level two and de-CH), `space.percent`, `dash.sentence`, `space.number`, `space.title`, `space.copyright` and `space.abbreviation` are `verified` for the cases the sources cover, the rest stay `general-knowledge`. Second pass: 7 more sources (UAX #14, the OQLF French spacing table, five Practical Typography pages), `apostrophe`, `ellipsis`, `symbol.legal`, `symbol.multiply` and `space.collapse` now `verified` for English, `space.percent` also backed for French, and the gaps found are in the backlog (two inch marks in one text pair up as a quotation; no `§` spacing; French colon and `;` `!` `?` spacing). Docs and tests only, cannot change existing output.

## 0.2.1 (2026-10-21)

Performance only: no change to output, except the one case named in the last bullet.

### Speed

- The quote rule reads lone opening and closing marks in one scan instead of a repeated regex. A run of 40,000 `“` took 59 s and takes 7 ms; dialogue and unbalanced text went from about 180 to 200 ms per MB to 45 to 70 ms. Ordinary prose is unchanged. Two fixtures of adversarial input, generated by the engine as it was before any speed work, pin the output.
- Every rule but the quote rule is now linear on a long run of one character. Before, 20,000 characters of `x`, digits, `-`, `.` or `+-` took 360 ms in every call, because the email part of the zone shield (`src/core/zones.ts`) was tried from every position of the run; tens of thousands of spaces took seconds in `space.trailing`, `dash.sentence`, `space.association` and `space.arrow`, and a long digit run in `number.group`; an address ending in thousands of `)` in the shield. Each now finds a literal first and reads the run by hand.
- The opt-in `space.before-punctuation`, `punctuation.double` and `symbol.degree` no longer open with a lookbehind: 1 MB of prose costs about 1, 2 and 5 ms with them on (it was 40, 40 and 200). `symbol.degree` no longer reads the whole text before each match.
- `scripts/stress.ts` times each rule on long runs; `src/core/linear.test.ts` holds an equivalence test against each original implementation and a scaling test.
- Can change existing output: no, with one exception. Output and `explain` records are identical to the previous engine (`bun run compare --slice 6000`: 0 differences). The exception is a JavaScriptCore bug in the old zone regex that put the start of a `www.` address one character late when a run of word characters before it was followed by an astral character; the rewrite finds the address correctly. See [docs/limits.md](docs/limits.md#speed).

## 0.2.0 (2026-10-20)

Fixes that change output come first; everything new is opt-in or an option, so output you already have changes only where an entry says so.

### Fixes

- A seven-digit local phone number written with a hyphen (`555-1234`: three digits, a hyphen, four digits, no spaces) is left alone; it was set as a range (`555–1234`). A spaced pair (`555 - 1234`) is still a range. A real range of three and four digits written without spaces (`100-1200`) is now also left alone. Can change existing output: yes, for text with such a pair.
- An apostrophe for dropped letters is no longer taken for a quotation mark: `rock 'n' roll` stays `rock ’n’ roll` (it was `rock «n» roll`), and a leading apostrophe on `'til`, `'em`, `'cause`, `'bout`, `'round`, `'tis`, `'twas` and `'cos` becomes `’`. A quoted word that only starts like one (`the 'emergency' exit`, `the 'til' button`) is still a quotation. Can change existing output: yes, for English text with these words in single quotes.
- A run of three hyphens (`a --- b`) is no longer taken for a double hyphen with one more. Can change existing output: yes, for text with a run of exactly three hyphens.

### New: 20 languages

`bg cs da el es et fi ga hr hu it lt lv mt nl pt ro sk sl sv` join `en uk de pl fr ch`: all 24 official languages of the EU, Ukrainian and Swiss usage. Each is one pack, `src/core/lang/<code>.ts`, with quote marks and nesting, sentence dash, orphans, abbreviations, `%` spacing, number format and cited sources; a generated page per language is in `docs/languages/`. **None has been read by a native speaker** (`reviewed: false`); read the page before relying on one. `Lang` and `LANGS` are now derived from the packs, so a pack is the only place a language is named. Can change existing output: yes, for pages that set `lang="es"` (or any new code) on `rehype` or HTML text: that code used to fall back to English and now selects a real profile.

### New: options

- `quoteStyle: 'language' | 'us'` (default `'language'`) on every mode, the React components, the CLI (`--quotes us`) and the playground. `'us'` sets `“…”` with `‘…’` inside in any language and wins over the `literary` register. Existing output: unchanged by default.
- `enable: string[]`: switches on rules that are off by default, by id or group. A rule named in both `enable` and `disable` is an error.
- `rules: Rule[]` and `addRule(list, rule, { before | after | first | last })`: a custom rule list; names in `enable` and `disable` are checked against the list in use. `Rule` gains `defaultOn?` and `when?`. Can change existing output: yes, for a custom rule built by spreading a built-in (`{ ...RULES[i], apply }`): it copies the built-in's `when`, so it may be skipped; set `when: undefined`.
- CLI: `--enable`, `--quotes`; `--rules` marks the rules that are off by default.

### New: nine rules, off by default

Switch on with `enable` (or `--enable`): `space.before-punctuation`, `space.after-comma`, `punctuation.double`, `space.trailing`, `symbol.plusminus`, `symbol.fraction`, `symbol.degree`, `symbol.implies`, `number.group` (locale thousands separators from the pack: `1,000,000` en, no-break space uk/fr, `.` de). Their limits are in `docs/limits.md`. Existing output: unchanged unless you enable them. Ordinals are not done.

### Speed

1 MB of English prose in text mode: 324 ms to 33 ms (typograf: 59 ms). Cause: regular expressions that open with a lookbehind are tried at every position; rules now find a literal first and read the character before it (`src/core/scan.ts`), skip when a cheap trigger (`Rule.when`) is absent, and the quote rule returns early and rebuilds in one pass. A differential run against the previous engine (26 languages, both registers, both quote styles, opt-in rules on and off, text, HTML, Markdown and hast, output and `explain` records) found no difference, and `src/snapshot.test.ts` keeps a digest per language. One residual difference, on Bun only: with `symbol.fraction` on, ill-formed UTF-16 (a lone high surrogate right after a fraction, then a character at U+E000 or above) no longer gets its `½`. Can change existing output: no, for well-formed text.

### Tooling

`bun run compare` (differential run against a git ref), `bun run snapshot` and `docs:languages`; a loose speed budget in `src/speed.test.ts`; the benchmark has 250 scored cases for 26 languages and more competitors (still a separate project in `bench/`).

## 0.1.1 (2026-10-20)

- The inline hanging script is now a fixed, minified string (`src/dom/script.ts`, generated by `bun run gen:script`), about 1.4 kB instead of about 2.4 kB, instead of the function's source printed at run time. React's development build warned about a hydration mismatch because a server build and a client build print a function differently; it no longer does. The mark spans also tell React to ignore the margin and data attributes that the script sets before hydration. Behaviour of the marks is unchanged. Can change existing output: only the text of the inline `<script>` on a prerendered page, which is smaller.

## 0.1.0 (2026-10-20)

The first release as a project of its own. The engine was developed inside another repository; everything under "Before 0.1.0" is that history, by date. Nothing about the output changed in the move.

## Before 0.1.0

## 2026-10-20

### German quotations in a row are stable

German output (`»a« und »b«`) is now read the same way on a second run. Before, the `«` that ends one quotation and the `»` that opens the next were taken for a pair, so running the engine again (for example `typo --check` after `typo --write`) changed the text. In German the pairs are now `»…«` and `›…‹`, each read by where the marks stand, and a text written `«…»` is read by position too. First-run output on ordinary text is unchanged (checked on 57,024 combinations of text, language and register); the difference is only in text that was already typeset, or that holds two quotations in a row. Can change existing output: yes, for German text with two adjacent quotations that had been run through the engine twice.

### Hanging punctuation is sent inline, so it runs as the page is parsed

New: `hangScript()` (from `./dom`), `<HangScript />` and `useHangingPunctuation` (from `./react`), and an `early` prop on `TypographyRoot` (default `true`). `hangPunctuation` was rewritten to be self-contained so its source can be sent to the page.

Can change existing output: yes, for React pages. `TypographyRoot` now renders an inline `<script>` (the length of `hangScript()`, about 2.4 kB) on the server and while hydrating, so a prerendered page changes. Pass `early={false}` to keep the old output, and do that on any page whose content security policy forbids inline scripts. The marks that start a wrapped line now hang at first paint instead of moving by their own width once the bundle has loaded.

### A rehype plugin

New entry `./rehype`: the default export `rehypeTypography` and `typesetHast(tree, options)`. It reads an element's `lang`, skips code and `data-typography="off"`, and typesets a block at a time so a quotation pairs across a link. Existing output: unchanged (new entry; the sets of block and raw elements are now shared with the HTML mode, with no change).

### German nested quotations are `»outer ›inner‹ outer«`

Before, a German quotation inside a quotation was set `»outer „inner“ outer«`, a mix no style guide uses. Now the inner level is `›…‹`.

Can change existing output: yes, for German text with a nested quotation. Plain German quotations are unchanged.

### Edge cases found by seeded property tests

So that a second run (`typo --check` after `--write`) reports nothing:

- A lone quotation mark is read by where it stands, whatever its shape, so a `«` or `»` that a first pass set is read the same way again; a French `«` with its no-break space too.
- A stack of opening marks is read until none is left.
- A web address no longer swallows a closing `‘`, `’` or `„`.
- A leading curly `’` on a year is an apostrophe even before a closing `’`.
- A double hyphen between numbers is a range.
- A chain of en dashes, or a time, is not a range.

Can change existing output: yes, for the inputs named, which are unusual. A comparison with the previous commit over 64,980 combinations of real text, language, register and block start found no difference.

### Dash profiles, abbreviations, `%` and `€`, minus, multiplication, lone quotes

- German and literary British English set a break in the sentence with a spaced en dash; other languages keep the em dash.
- New rules, each switchable by id: `space.abbreviation` (`z. B.`, `Nr. 5`, `вул. Хрещатик`, `ul. Marszałkowska`, `Fig. 2`; short lists, not read by a native speaker), `space.percent` (German and French: `5 %`, `49 €`), `symbol.minus` (`-5` becomes `−5`) and `symbol.multiply` (`1920x1080` becomes `1920×1080`; not `0x1F`, not identifiers).
- The rule `symbol` is now `symbol.legal`. The group name `symbol` still switches it off, but a change reported by `explain` or `onChange` now carries `symbol.legal` as its rule, so code that compared the id to `'symbol'` must change.
- A straight `"` with no partner is now set as an opening or a closing mark, so a quotation that runs over several paragraphs no longer keeps straight quotes. An inch mark (`5'10"`) is left alone.

Can change existing output: yes. A comparison on real text found only the intended differences (the German dash, lone quotes, `%` in French, minus, abbreviations).

### Rules have ids; `disable`, `explain` and `onChange`

The engine is split into `quotes`, `dashes`, `spaces`, `marks` and `zones` and run from the `RULES` table in order. New API: `RULES`, `RULE_IDS`, the `disable` option (ids or groups; an unknown name throws), `explain(text, lang, options)` returning `{ output, changes }`, the `onChange` option and the `Change` type. The text, HTML and Markdown modes and the command line (`--disable`, `--rules`, `--explain`, `--json`) take them too. Apostrophes now belong to their own rule, `apostrophe`.

Can change existing output: no. The split output was compared with the previous engine over 114,816 combinations of real text, language, register and block start, with no difference.

### Plain-text mode and the `typo` command

New: `typesetText` (a paragraph at a time, keeping line breaks, indentation and blank lines) and the `typo` command (needs Bun): standard input or files, text, HTML or Markdown picked from the extension, `--write`, and `--check` (exit 1 if a file would change). Existing output: unchanged (new).

### Addresses and code are protected; HTML and Markdown modes

- Web addresses, emails and `` `code spans` `` are set aside while the rules run and come back exactly as written, so `12-15` in a path or `->` in a command survives.
- A leading apostrophe on a year (`'90s`) no longer stops a quotation from pairing.
- An arrow keeps a no-break space against its word (`Read more →`, `← Back`).
- New entries `./html` (`typesetHtml`) and `./markdown` (`typesetMarkdown`): they typeset the text and leave tags, attributes, code and structure as they were; a block that needs no change comes back byte for byte.

Can change existing output: yes, for text that holds an address, an email or a code span, a year with a leading apostrophe, or an arrow with a plain space.

### The engine becomes its own package

The code, which first lived inside the app's internationalisation package, moved into a package of its own, with entries `.` (the rules), `./dom` (the framework-free hanging measurer) and `./react`. A boundary test fails if anything in the package imports from outside it. No behaviour change; the import path changed.

## 2026-10-18

### A number binds only to a short word

`space.number` now binds a number to the word after it only when that word has at most nine letters (`21 September`, `15 people`, `5 km`), and no longer binds a month to its year (`September 2026`). A chain of bound words could outgrow a narrow column on a phone. Can change existing output: yes, wherever a number was followed by a longer word, or a month by a year, which now wrap freely.

### The literary register

New: a second axis next to language, the `register` option (`display` or `literary`) and the `Register` type. `display` is the default and is unchanged. `literary` sets British English quotes (`‘outer “inner” outer’`) and a Ukrainian dialogue line, opened by a dash, with an em dash and a no-break space; other languages keep their display rules. In React, `<TypographyRoot register="literary">` or `<Typeset register=…>`.

Can change existing output: no, unless you opt in.

## 2026-10-17

### Ranges and hanging

- Number ranges, spaced or not (`10:00 – 12:00`, `21 – 26 September`), become en dashes instead of sentence breaks; identifiers, partial dates and phone numbers keep their hyphen. Can change existing output: yes, for a spaced range, which was set as a sentence dash.
- Hanging marks are measured once and kept rather than reset on every page change, and are skipped in centred, right-aligned and indented text. Can change existing output: yes, for such text, where a mark no longer hangs.
- The documentation of `typographic` no longer claimed that German output is safe to run twice; at that date it was not. It is now: see 2026-10-20.

### The first rules

New: `typographic(text, lang)` and `splitHangs(text, atStart)`. Quotation by language and nesting level (`«outer „inner“»` for English and Ukrainian; `»outer „inner“«` for German, changed later, see 2026-10-20; and Polish, French and Swiss), dashes (a spaced hyphen is an em dash, a numeric range an en dash), the typographic apostrophe, the ellipsis, arrows and `©` `®` `™`, and no-break spaces after titles and initials, between a number and its unit or month, and after one-letter words per language. Plain TypeScript with no dependencies.

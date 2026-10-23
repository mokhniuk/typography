# Backlog

What the package still lacks. The comparison with typograf, typopo, richtypo, tipograph, smartypants and retext-smartypants was made at 0.2.0 (2026-10-20, versions in [../apps/bench/RESULTS.md](../apps/bench/RESULTS.md)); the file is kept current since. Our audience is the EU, Ukraine and the US; tools for a single other language (Russian, Chinese) are out of scope.

Priorities: **P0** blocks the audience, **P1** closes a gap other tools do not have, **P2** is worth doing later. An item is done when its test exists and the docs say so; move it out of this file into [../CHANGELOG.md](../CHANGELOG.md).

## Where we stand

| | typography-engine | best other | Source |
|---|---|---|---|
| Benchmark checks passed (default / literary register) | 250 / 250, 250 / 250 | typograf 132 / 226 | `apps/bench/RESULTS.md` |
| 1 MB of English, text mode | 49 ms (0.15.0 run, short-word rule on, on a quieter machine than the 0.14.0 run's 74 ms against typograf's 115) | typograf 71 ms, tipograph 15 ms, smartypants 12 ms | `cd apps/bench && bun run bench` (the ratios are what count) |
| Target languages covered (27) | 27 | typograf 21 of 27, tipograph 11 | [languages/index.md](languages/index.md) |

The 27 target languages are the 24 official languages of the EU, Ukrainian, and German and French as written in Switzerland (`de-CH`, `fr-CH`); US English is not a pack but the option `quoteStyle: 'us'`. The 8 default-run misses of the 0.14.0 run were the house `«…»` for English, which the checks count as a failure; since 0.15.0 English defaults to `“…”` and the house style is `quoteStyle: 'guillemets'`, and the default run passes every check: 250/250. The cases were written by this package's author; read the caveats in [limits.md](limits.md). The cases for the twenty new languages come from the same style guides as the packs, so they are not an independent test.

## P0

### Native-speaker review of the 20 new languages

Every pack has `reviewed: false`: bg cs da el es et fi ga hr hu it lt lv mt nl pt ro sk sl sv (plus the older uk de pl fr en and the Swiss de-CH fr-CH, never reviewed either). They were written from style guides, and several sources (Pravidla 2000, Svenska skrivregler, the RAE, the Maltese Language Council, DOOM) could only be read in part. For each language: a native reader goes through its generated page ([languages/index.md](languages/index.md)), corrects the pack, and flips `reviewed` to `true`. This is the step after the npm release and before 1.0.0.

## P1

### Finish the sources registry

[sources.md](../resources/sources.md) has 17 of 33 decisions still `general-knowledge` (ten of them opt-in rules with no source read, seven default-on), one `disputed`, 15 `verified` for the cases and languages named in each entry (mostly English; `dash.dialogue` since 0.4.0 for 17 languages). Read the sources and upgrade them, and have a native speaker check each language. Found while building it (2026-10-20, CLDR 46):

- `quote` is `disputed`: CLDR has German `„ “ ‚ ‘` (the engine sets `» « › ‹`), French `« »` with `« »` inside (the engine uses `“ ”`), and de-CH `„ “ ‚ ‘` (the engine's `de-CH` pack sets `« » ‹ ›`). Decide per language whether the engine or CLDR is right, citing a guide. English follows CLDR since 0.15.0 (`“ ” ‘ ’`; the house `«…»` is `quoteStyle: 'guillemets'`).
- `space.percent` / currency: CLDR sets a no-break space before the currency sign in `uk`, `pl` and `fr-CH`; the engine leaves `49€` alone there.
- Gaps found against Practical Typography and OQLF (2026-10-20, probed in the engine; both sources were read as fetch-tool summaries, check them first):
  - French `:` gets a no-break space before it, and `;` `!` `?` none or a fine space (OQLF). The engine sets none of these. A France or Swiss guide may differ, so read one before building it.
  - `ellipsis` (P2): a no-break space on a side with no text (`... and so`).
  - Out of scope, by design: repeated `!!` or `?!` and one exclamation mark per three pages (a lint, not a substitution), superscript ordinals (Butterick says not to, and the engine already leaves `1st` alone).
- Reading list, none read yet, each to be read before it is cited: Bringhurst, *The Elements of Typographic Style*, 4th ed. (Hartley & Marks, 2013), section 5.2.1; *The Chicago Manual of Style*, 18th ed. (University of Chicago Press, 2024); Butterick, *Typography for Lawyers*, 2nd ed. (O'Connors, 2015); ISO 80000-1 (the SI Brochure, 9th ed., was read in 0.8.0 and backs `symbol.degree`); Knuth and Plass, "Breaking Paragraphs into Lines", *Software: Practice and Experience* 11 (1981) 1119–1184; Dyson on on-screen line length and Beier, *Reading Letters* (BIS, 2012), as context only. No peer-reviewed study of punctuation, dash or no-break-space conventions was found; the empirical work found (Ho Sang and Petrarca, *Visible Language* 59(3), 2025, a review of 42 studies) is about typeface, size and line length, so no rule here should cite research.
- Unread, to read next: Pravopys 2019 (§ 161 "Тире" for `dash.dialogue`, the quote section; mon.gov.ua refused the fetch), the Swiss Federal Chancellery Schreibweisungen § 2.1.1 (the PDF has no extractable text here; needs a PDF reader), Imprimerie nationale Lexique, Duden, Chicago, Bringhurst, and a guide that prefers `−` and `×` (`symbol.minus`, `symbol.multiply`).

### Inch marks and quotations: the cases left

Found in the review of the inch-mark fix (2026-10-21). It is a limit, listed in [limits.md](limits.md):

- **An inch mark inside a quotation** (`He said "a 5" hole" ok`) closes the quotation at the inch mark, leaving the real closer lone (`«a 5» hole»`). Same on main. A closer after a digit followed by a letter or space and another `"` later is the ambiguous case; research what other tools do before choosing.

### Language gaps found while writing the packs

Each is a limit of the pack format or an unverified choice, not a crash:

- **Sentence dash unverified** for nl: the pack uses the spaced em dash; usage there often prefers a spaced en dash (hr, hu, ro, sk and sv were settled in 0.4.0 from their dialogue sources).
- **Italian and Maltese truncation apostrophe** (`po'`, `va'`, `da'`, `di'`) inside straight single quotes closes the quotation early. The pack format has no field for trailing apostrophes.
- **Dialogue dash for Greek and Latvian.** The Triantafyllidis dictionary says a dash marks a change of speaker in Greek, but the character and spacing were not confirmed; no Latvian source was found. Read one before setting `dialogueDash`.
- **The dash before the words of the narrator** in Spanish is attached inside (`—¿Esperamos? —preguntó—.`), and Finnish, Danish, Slovenian and Swedish use a comma there, not a dash; the engine sets a spaced dash wherever one is typed.
- **Spanish and Greek paired dash** (`—inciso—`, attached inside) cannot be expressed: `sentenceDash` is one symmetric spaced dash.
- **Abbreviations without a full stop** (Estonian `nr`, `lk`; Finnish `klo`, `nro`) are not matched; the abbreviation rule needs the stop.
- **Per-level quote shapes** (Latvian and Lithuanian use single quotes at a level) are one pair per level in the pack.
- **Dotted time ranges** (`9.00-18.30`, Latvian and others) are read as numbers, not as a time range.
- **Swedish level 3** restarts oddly, because Swedish defines no third level.
- **Three levels of straight quotes** are ambiguous and not stable on a second pass (inherent, all languages).
- **`rock 'n' roll`** is handled only in the packs that list the elision `n`.
- **`number.group`** treats `de-CH` and `fr-CH` as no-break-space grouped (Swiss Federal Chancellery); five-digit amounts after a capital word are skipped; the ZIP-code guard is English, German, Italian and French in shape.
- **`symbol.degree`** knows an English label list only (`Type C`, `Vitamin C`).
- **`space.short-word`** lists are editorial in all five packs, and twenty-one languages have none (see the item below); on by default since 0.14.0.
- The opt-in rules' own limits are in [limits.md](limits.md#opt-in-rules).

### Font checker: what is left

Shipped in 0.10.0 on the website (`/font-checker/`): a font file or an installed name, the languages, the coverage of every character the rules insert and of the letters fonts often lack (own, borrowed, none), the `avoid` config it writes, the examples set in the font at two measures, and a preset measured from the font. Still open:

- **The detection is a width comparison** (`src/dom/glyphs.ts`): a glyph exactly as wide as the fallback's in both probes is reported as missing, and a font that draws a wrong glyph of its own as present. If that proves too unreliable in practice, read the `cmap` table instead (a small table reader, written here, no dependency).
- **The letters each language's readers actually miss** (`apps/website/font-checker/letters.ts`) are this package's own list; a native reader should check them, with the pack review (the P0 item above).
- **The preset rests on no read source.** The size, line height, measure and hang amount are measured from the font with editorial rules of thumb; the reading list in the sources item (Dyson, Beier) is unread, so the page says the numbers are a starting point. Read it, or drop the preset.
- **The playground has no font field**: it shows which characters each rule inserts and takes an `avoid` list, but it cannot load a font. Sharing the checker's measuring with the playground would let a reader see the real font there too.

### Currencies: what is left

Done in 0.10.0: a sign or code before the amount is bound, the groups of a hand-grouped amount are bound (so `space.number` and `number.group` agree), and the signs and codes are one table (`src/core/currency.ts`). Still open:

- **Placement and spacing per locale** (`€49.99` in en, `49,99 €` in de, fr and uk, `49,99 zł` in pl) is not applied: the engine never moves a symbol, which is right, but only `€` has a pack field (`currencySpace`) that says whether a space belongs between amount and symbol. A field per sign, or a general one, needs a source per language.
- **Swiss apostrophe grouping** (`CHF 1'000`) is not read as a number group, and the apostrophe is not a quote.
- **CLDR sets a no-break space before the currency sign in `uk`, `pl` and `fr-CH`**; the engine leaves `49€` alone there (see the sources item above).
- **A three-letter code that is not money** (`PIN 1234`) is bound as if it were: the rule reads the shape, not the meaning (a limit, in [limits.md](limits.md)).

### Irish (`ga`): make the pack real

The pack exists but is thin, because the Irish edition of the Interinstitutional Style Guide (`style-guide.europa.eu/ga`, section 4.2.3) could not be read; what is there comes from the Publications Office quotation table and from statements about Irish in the Maltese edition. Open:

- **Quotes:** `‘…’` then `“…”` (the Publications Office table) against `“…”` first (Wikipedia). Settle it from the Irish ISG or Foras na Gaeilge / An Gúm, or from a native reader.
- **Sentence dash and ranges:** not read; the pack defaults to the spaced em dash.
- **Short words and abbreviations:** none (`orphans`, `abbreviations` empty). Candidates to source: `a`, `i`, `is`, `ar`, `le`, `go`, `de`, `do`; abbreviations such as `m.sh.`, `srl.`, `lch.` (Foras na Gaeilge's lists).
- **Initial mutations:** the hyphen and apostrophe forms (`an t-athair`, `na h-oibrithe`, `d'fhág`, `b'fhéidir`) pass through unchanged today and a test pins `d'`, `b'`, `m'`; add goldens for `t-`, `n-` and `h-` prefixes (`an t-uisce`, `i n-Éirinn`, `go h-álainn`) inside and outside quotes, since a hyphen after a single letter must never read as a range or a dash.
- **Review:** `reviewed: false`; get an Irish reader to check the page.

### Short words, conjunctions and the end of the line: what is left

Shipped in 0.14.0: `space.short-word` is on by default (the sources allow either in body text and require binding in titles; display text is this engine's register), with `disable` for the body-text convention. Shipped in 0.13.0: `rock ’n’ roll` is bound on both sides of the `’n’` (`space.operator`, which already bound `&`, `+` and `=`), and `space.short-word` binds a short word to a word that opens with a quotation mark, an apostrophe or a bracket (`the~’90s`). Shipped in 0.10.0: the opt-in rule `space.short-word` and the pack field `shortWords`, with editorial lists for cs, en, pl, sk and uk, for titles and headings — the read sources (PWN Poradnia, ÚJČ) say such a word may stay at a line end in body text and must travel with what it belongs to in a title. `space.orphan` (one-letter words), `space.number`, `space.title`, `space.initial` and `space.abbreviation` were there already. Still open:

- **The word lists are editorial.** No style guide read gives a list of two- and three-letter words for any language. Find one per language, or have a native reader settle each list; five packs have one, the other twenty-one have none.
- **The rule does not know a title from body text.** It is switched on where titles are set. A rule that binds in a heading only would need the markup, so it belongs in the HTML, Markdown and rehype modes, not in the string engine.
- **The last words of a paragraph (widows and runts)** are decided: not a string rule, CSS `text-wrap: pretty` on the page (written down in [limits.md](limits.md)).
- **How to bind, not only what:** a no-break space is a character and travels with the text (copy, search, screen readers read it as a space), a `<span style="white-space: nowrap">` is markup and stays on the page. The HTML, rehype and React modes could offer `bind: 'nbsp' | 'nowrap'` (the text mode and the CLI on plain text have only the character). Research what the two do to search, copy, hyphenation and `text-wrap: pretty` before choosing a default; the string engine keeps the no-break space.
- **One-letter words in other languages:** cs and pl are backed by a read source (ÚJČ, PWN Poradnia); sk is an editorial convention from secondary sources (no Slovak authority could be read: jazykovaporadna.sme.sk and the Pravidlá PDF returned nothing); uk's class rule is backed by a Zhytomyr handbook but its letters are ours. Open: a Slovak authority for sk; a native reviewer for Bulgarian (a class rule in one anonymous 2005 guide, no letters, nothing bound). Searched and found nothing: sl, hr, de, fr, es, it. Known limit: the orphan lookbehind does not see combining marks, so NFD text can mis-bind a word-final list letter (see limits.md).

### Speed: what is left

No quadratic input is known outside the rules since 0.15.0 (the two the probes found in 0.13.1, a long run of spaces inside a line in the text mode and many `<` that never close in the HTML mode, are fixed and timed by `scripts/stress.ts`); nothing superlinear is known in the rules (0.2.1). Typical text costs 30 ms per MB on a quiet machine (74 in the 0.14.0 run on a busier one, 49 in the 0.15.0 run; the short-word rule is on by default since 0.14.0); with every rule on, the biggest are `space.short-word` (17%), `quote`, `space.abbreviation` at about 5 ms per MB each, then `space.title` at 3. `space.number` doubled in 0.10.0 when money and hand-grouped numbers were added to it, and is one scan since 0.12.0 (about 3 ms per MB). Further gains would be constant-factor work on those; tipograph and smartypants (10 to 20 ms) do much less. The zone scan (`shield`, zones.ts) is timed as a row of its own by the profile and `scripts/stress.ts` since 0.12.0, and the profile runs on the fuzz corpus as well as on prose; a 300 ms per MB cost in the scan went unseen until then because both tools timed the rules only, on prose with no backtick or address. React already memoises per component (`useMemo` in `Typeset`), so no paragraph cache is needed. German prose costs about three times English, French or Ukrainian (19 ms against 6 to 8 per 100 KB, the "Speed by input" table, 2026-10-22) where typograf costs the same in all four; profile `de` to find the rule.

## P2 (deferred by choice)

### Phone numbers: locale formats

`phone.bind` (opt-in) only keeps an international number whole; it never reformats one and leaves local numbers alone (a limit, in [limits.md](limits.md#opt-in-rules)). Each language writes its numbers in its own groups (`+49 30 1234567`, `+33 1 23 45 67 89`, `+380 44 123 45 67`) and some bind a local number too. Read a national numbering plan or style guide per language before binding or grouping anything beyond what is typed.

### Load only the languages used

Every entry point carries all 27 language packs: 57 KB of the 87 KB minified bundle of `/text` (16 of 26 KB brotli), and `/dom` weighs 89 KB as well (check what of the engine hanging punctuation really pulls in). A way to load only the languages used (a pack registry the caller fills, or one entry per language) would bring a one-language bundle near typograf's 15 KB brotli. Numbers from `bun run size` (2026-10-22).

### A larger real-text benchmark

English has 96 cases and each other language six. Add a real-text corpus per language (a few paragraphs with a hand-made expected output, written by a native reader) and score the other tools on it. Keep each case a statement of what is right, not of what one tool produces.

## Not doing

- **Ordinals** (`1st`, `1-й`, `1.`): no consensus form across the audience's languages, and no tool in the comparison does them well. Digit grouping shipped as the opt-in rule `number.group`.

## How this was measured

Everything above can be regenerated from the separate benchmark project in `apps/bench/` (see [contributing.md](contributing.md#the-benchmark)): `bun run bench` (quality, speed, engines, bundle size, dependencies and hard inputs; each table also runs alone as `size`, `deps`, `engines`, `probes`), `bun run latency` (a paragraph), `bun run profile` (our rules, one by one) and `bun run features` (the same English inputs through every tool). The comparison page that draws on them is a snapshot; update this file when the numbers move.

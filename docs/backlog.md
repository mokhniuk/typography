# Backlog

What the package still lacks, after the 0.2.0 work that closed the gaps found by comparing it with typograf, typopo, richtypo, tipograph, smartypants and retext-smartypants (2026-10-20, versions in [../bench/RESULTS.md](../bench/RESULTS.md)). Our audience is the EU, Ukraine and the US; tools for a single other language (Russian, Chinese) are out of scope.

Priorities: **P0** blocks the audience, **P1** closes a gap other tools do not have, **P2** is worth doing later. An item is done when its test exists and the docs say so; move it out of this file into [../CHANGELOG.md](../CHANGELOG.md).

## Where we stand

| | podiia | best other | Source |
|---|---|---|---|
| Benchmark checks passed (default / literary register) | 242 / 250, 250 / 250 | typograf 131 / 226 | `apps/bench/RESULTS.md` |
| 1 MB of English, text mode | 33 ms | typograf 59 ms, tipograph 12 ms, smartypants 10 ms | `cd apps/bench && bun run bench` |
| Target languages covered (26) | 26 | typograf 22, tipograph 12 | [languages/index.md](languages/index.md) |

The 26 target languages are the 24 official languages of the EU, Ukrainian and US English (the option `quoteStyle: 'us'`). Podiia's 8 default-run misses are all the house `«…»` for English, which the checks count as a failure; the literary register passes every check. The cases were written by this package's author; read the caveats in [limits.md](limits.md). The cases for the twenty new languages come from the same style guides as the packs, so they are not an independent test.

## P0

### Native-speaker review of the 20 new languages

Every pack has `reviewed: false`: bg cs da el es et fi ga hr hu it lt lv mt nl pt ro sk sl sv (plus the older uk de pl fr ch en, never reviewed either). They were written from style guides, and several sources (Pravidla 2000, Svenska skrivregler, the RAE, the Maltese Language Council, DOOM) could only be read in part. For each language: a native reader goes through its generated page ([languages/index.md](languages/index.md)), corrects the pack, and flips `reviewed` to `true`.

## P1

### Finish the sources registry

[sources.md](../resources/sources.md) has 11 of 29 decisions still `general-knowledge` (the nine opt-in rules have no source read), one `disputed`, 17 `verified` for the cases and languages named in each entry (mostly English; `dash.dialogue` since 0.4.0 for 17 languages). Read the sources and upgrade them, and have a native speaker check each language. Found while building it (2026-10-20, CLDR 46):

- `quote` is `disputed`: CLDR has English `“ ” ‘ ’` (see the American quotes item above), German `„ “ ‚ ‘` (the engine sets `» « › ‹`), French `« »` with `« »` inside (the engine uses `“ ”`), and de-CH `„ “ ‚ ‘` (the engine's `ch` profile is the fr-CH one: `« » ‹ ›`). Decide per language whether the engine or CLDR is right, citing a guide.
- `space.percent` / currency: CLDR sets a no-break space before the currency sign in `uk`, `pl` and `fr-CH`; the engine leaves `49€` alone there.
- Gaps found against Practical Typography and OQLF (2026-10-20, probed in the engine; both sources were read as fetch-tool summaries, check them first):
  - `space.section` (P1): no-break space after `§` and `¶`, doubled `§§` `¶¶`; `§ 5` keeps an ordinary space now.
  - French `:` gets a no-break space before it, and `;` `!` `?` none or a fine space (OQLF). The engine sets none of these. A France or Swiss guide may differ, so read one before building it.
  - `ellipsis` (P2): a no-break space on a side with no text (`... and so`); keep the last two words of a paragraph together (P2, or document `text-wrap: pretty`).
  - Out of scope, by design: repeated `!!` or `?!` and one exclamation mark per three pages (a lint, not a substitution), superscript ordinals (Butterick says not to, and the engine already leaves `1st` alone).
  - `dash.sentence`: the engine's spaced em dash with a no-break space before it matches neither Butterick (unspaced em, spaced acceptable) nor Bringhurst (spaced en, from a search result, not read). Pick one and cite it.
- Reading list, none read yet, each to be read before it is cited: Bringhurst, *The Elements of Typographic Style*, 4th ed. (Hartley & Marks, 2013), section 5.2.1; *The Chicago Manual of Style*, 18th ed. (University of Chicago Press, 2024); Butterick, *Typography for Lawyers*, 2nd ed. (O'Connors, 2015); BIPM, *SI Brochure*, 9th ed. (2019), section 5.4 (space between value and unit, plane-angle exception) and ISO 80000-1; Knuth and Plass, "Breaking Paragraphs into Lines", *Software: Practice and Experience* 11 (1981) 1119–1184; Dyson on on-screen line length and Beier, *Reading Letters* (BIS, 2012), as context only. No peer-reviewed study of punctuation, dash or no-break-space conventions was found; the empirical work found (Ho Sang and Petrarca, *Visible Language* 59(3), 2025, a review of 42 studies) is about typeface, size and line length, so no rule here should cite research.
- Unread, to read next: Pravopys 2019 (§ 161 "Тире" for `dash.dialogue`, the quote section; mon.gov.ua refused the fetch), the Swiss Federal Chancellery Schreibweisungen § 2.1.1 (the PDF has no extractable text here; needs a PDF reader), Imprimerie nationale Lexique, Duden, a Polish or Ukrainian typography guide for `space.orphan`, Chicago, Bringhurst, and a guide that prefers `−` and `×` (`symbol.minus`, `symbol.multiply`).

### Inch marks and quotations: the cases left

Found in the review of the inch-mark fix (2026-10-21). Each is a limit, listed in [limits.md](limits.md):

- **A quotation glued to a digit** (`5"a"`) is half set: the opener is skipped as an inch mark, the lone-mark pass then converts the closer (`5"a»`). Main set it `5«a»`. Decide: leave both marks as written, or pair them. Fix in the lone-mark pass of `src/core/quotes.ts` (`closeLone` must not close a `"` whose partner was refused as an inch mark).
- **An inch mark inside a quotation** (`He said "a 5" hole" ok`) closes the quotation at the inch mark, leaving the real closer lone (`«a 5» hole»`). Same on main. A closer after a digit followed by a letter or space and another `"` later is the ambiguous case; research what other tools do before choosing.
- **Non-ASCII digits** (`𝟐"`, Arabic-Indic) before the mark: the pair scan tests one UTF-16 unit with `\p{N}`, and the lone-mark pass tests ASCII `\d`. Make both read the code point and the same digit class, with a golden test.
- **Speed guard:** the straight pair is a hand scan (`pairStraight`), because a regex re-read to the end of the text for every inch mark with no closer (1.2 s per MB with 35 of them). Add a case with many inch marks and no closer to `scripts/stress.ts` and `src/speed.test.ts`.

### Language gaps found while writing the packs

Each is a limit of the pack format or an unverified choice, not a crash:

- **Sentence dash unverified** for nl: the pack uses the spaced em dash; usage there often prefers a spaced en dash (hr, hu, ro, sk and sv were settled in 0.4.0 from their dialogue sources).
- **Italian and Maltese truncation apostrophe** (`po'`, `va'`, `da'`, `di'`) inside straight single quotes closes the quotation early. The pack format has no field for trailing apostrophes.
- **Dialogue dash for Greek and Latvian.** The Triantafyllidis dictionary says a dash marks a change of speaker in Greek, but the character and spacing were not confirmed; no Latvian source was found. Read one before setting `dialogueDash`.
- **The dash before the words of the narrator** in Spanish is attached inside (`—¿Esperamos? —preguntó—.`), and Finnish, Danish, Slovenian and Swedish use a comma there, not a dash; the engine sets a spaced dash wherever one is typed.
- **Spanish and Greek paired dash** (`—inciso—`, attached inside) cannot be expressed: `sentenceDash` is one symmetric spaced dash.
- **`percentSpace` is one flag** for `%` and for currency, but the sources treat them differently.
- **Abbreviations without a full stop** (Estonian `nr`, `lk`; Finnish `klo`, `nro`) are not matched; the abbreviation rule needs the stop.
- **Per-level quote shapes** (Latvian and Lithuanian use single quotes at a level) are one pair per level in the pack.
- **Dotted time ranges** (`9.00-18.30`, Latvian and others) are read as numbers, not as a time range.
- **Swedish level 3** restarts oddly, because Swedish defines no third level.
- **Three levels of straight quotes** are ambiguous and not stable on a second pass (inherent, all languages).
- **`rock 'n' roll`** is handled only in the packs that list the elision `n`.
- **`number.group`** treats `ch` as no-break-space grouped (Swiss Federal Chancellery); five-digit amounts after a capital word are skipped; the ZIP-code guard is English, German, Italian and French in shape.
- **`symbol.degree`** knows an English label list only (`Type C`, `Vitamin C`).
- The opt-in rules' own limits are in [limits.md](limits.md#opt-in-rules).

### A configuration per project

Today every call site repeats its options (`lang`, `register`, `quoteStyle`, `enable`, `disable`, `rules`, `nbsp`, `--hang-amount` in CSS), the playground keeps its own state in `localStorage`, and the house choices (English guillemets) live in the engine's defaults. Plan: one object that names a project's typography, used everywhere.

- A `preset` (or `config`) type: the options above plus `hangAmount` and the characters to avoid (next item), with the same names the functions take, so it spreads straight into any call. Shipped presets for a house style (`podiia`: guillemets in English) and for the plain language defaults; a project writes its own as a constant.
- Read by every site: `typographic` and the modes (`preset` option, the explicit options winning), `TypographyRoot` (one prop instead of six), the CLI (`typo --config typography.config.ts` or a `typography` key in `package.json`), and the playground (import and export the current switches as a preset, so what was tried on the page is what the project ships).
- This is also where the English default quote question is settled: the engine defaults to the language standard, the house preset restores the house style (see the sources entry for `quote`, `disputed`).
- Done when one preset constant drives the CLI, a React page and the playground with identical output, `docs/api.md` documents it next to the options, and the option-threading list in `CLAUDE.md` names it.

### Keep the original when the font lacks the glyph

A rule that inserts a character the font does not have shows a box or a mismatched fallback glyph; the text as typed is better. The engine is string to string and cannot see the font, so the plan is an option that names the characters to avoid:

- A rule whose output would contain an avoided character is skipped for that match, and the original stays (the change is not recorded by `explain`). Default on, with a documented default set of characters the engine expects every font to have; the user lists what their font lacks (for example `⇒`, `½ ¼ ¾`, `−`, `→`). The candidates at risk are the symbols the rules insert: `⇒ ½ ¼ ¾ ± − × → ← ™ ® ° …` and the quote marks of unusual fonts.
- Threaded through every mode like `enable` was: `typographic`, `typesetBlock`, text, HTML, Markdown, rehype, React, CLI, playground, `scripts/gen-rules-doc.ts`.
- Docs: explained next to the other options, and every opt-in rule and flag gets a before/after preview in the docs and the playground (a "preview" for each feature flag), so a reader sees what a flag changes and which characters it needs.
- Later, a browser add-on: `supports(char)` in the React/DOM layer (`document.fonts.check` or a canvas measure), used when given; server rendering uses the option.
- Done when: a golden test per rule shows the original text kept when its character is avoided, idempotence holds, and `explain` records nothing for the skipped match.

### Font checker: is this font ready for this language and these rules

A tool on the website (and in the playground): upload a font file, or name an installed one, pick languages, and get a verdict.

- **Glyph coverage**: the characters every rule can insert (`« » „ “ ‚ ‘ ‹ › “ ” ’ … – — − × ± ½ ¼ ¾ ° § ¶ © ® ™ → ← ⇒`, the no-break and thin spaces) and the letters of each selected language that fonts most often lack (Ukrainian `ґ є і ї`, Polish `ł ą ę ś ź ż`, Maltese `ħ ġ ċ ż`, Irish fada vowels, Romanian `ș ț` with comma below, Latvian and Lithuanian macrons and ogoneks), each as present, missing, or present as a fallback glyph (the browser substitutes silently; `document.fonts.check` and a canvas width comparison against the fallback font tell them apart). The missing ones become the `avoid` list of the item above, copied as a preset.
- **Rendered examples**: the long example of each selected language, typeset by the engine with the current switches, set in the font at two widths, with hanging punctuation on, so the reader sees the quotes, dashes and marks the font actually draws.
- **Rating and recommendation**: a score per language from the coverage, and a suggested text preset: size, line height for a vertical rhythm, measure (45 to 90 characters), `--hang-amount` for the font's quote marks (a wide guillemet hangs less than a thin `‘`). The rhythm and measure advice rests on the reading list in the sources item (Dyson, Beier), cited as context, not as rules.
- Runs in the browser with no dependencies, per `docs/ui.md`: the font is loaded with `FontFace`, never uploaded anywhere; the glyph table is read with the browser's own measuring, not an OpenType parser, unless the fallback detection proves too unreliable (then a small table reader for `cmap`, written here).
- Done when a font with a known gap (a system font without `ґ`, a display font without `»`) is reported with the exact characters, the `avoid` preset it writes makes the engine keep the original text for them, and the examples page renders every selected language.

### Phone numbers

Today the engine only protects them: a hyphenated phone number is not read as a range (`555-1234`, `044-123-45-67`, `+49 30 123456-0` keep their hyphens), and nothing else is done. Checked on 0.2.1:

- `+380 44 123 45 67`, `+44 20 7946 0958` and `+1 (555) 123-4567` keep plain spaces inside, so a number can wrap in the middle. Only the space before a following word is bound (`123 45 67~now`).
- Plan: an opt-in rule `phone.bind` (off by default, named in the changelog) that joins the groups of an international number (`+` or `00`, then digits, spaces, hyphens and parentheses, at least seven digits) with no-break spaces and non-breaking hyphens (U+2011) so it never wraps, without reformatting the digits. Locale formats (`+380 44 123 45 67`, `(555) 123-4567`) are a pack field for later; start with "do not break", not "reformat".
- Guards: dates (`2026-10-20`), ranges (`100-1200`), ISO numbers, IBANs, and anything in a link or `tel:` href are left alone; `number.group` must not group a phone number.
- Done when: golden tests per shape above, no change to dates, ranges and identifiers, idempotence, and the letters-and-digits property holds (U+2011 replaces `-`, so the property needs a hyphen-aware check).

### Currencies

Partly there: `space.number` binds a number to the symbol or code after it (`49~€`, `100~USD`, `5~$`, `20~zł`, `100~грн`), and `space.percent` handles `%` and `€` spacing for de and fr only. Gaps found on 0.2.1:

- **Code or symbol before the amount** is not bound: `USD 5 000` and `€ 49.99` can wrap between the code and the number.
- **Grouped amounts** keep plain spaces between the groups unless `number.group` (opt-in) is on: `1 000 грн` becomes `1 000~грн`, so the number can still break in the middle.
- **Placement and spacing per locale** (`€49.99` in en, `49,99 €` in de, fr and uk, `49,99 zł` in pl) is not applied: the engine never moves a symbol, which is right, but the pack has no field that says whether a space belongs between amount and symbol. `percentSpace` is one flag for both `%` and currency (see the language gaps above); split it into `percentSpace` and `currencySpace`.
- **Swiss apostrophe grouping** (`CHF 1'000`) is not read as a number group, and the apostrophe is not a quote.
- **Symbols and codes** are an inline list; a code list (ISO 4217) and the symbols of the audience's currencies (`€ $ £ ₴ zł Kč Ft lei лв kr`) should be one table in `src/core`, not in two rules.
- Done when: golden tests per locale for the amount, the symbol and the code before and after; `space.number` and `number.group` agree on grouped amounts; no rule moves or adds a currency symbol.

### Rule categories

The rules are a flat list with dotted group names (`dash`, `space`, `symbol`, `number`, ...) that describe the mechanism, not why a reader would want a rule. Plan: a `category` tag on `Rule` (`tradition`, `symbols`, `math`, `data` for phone numbers, currencies, units and dates), the ids unchanged so `disable` and `enable` keep working; shown as a column in `typo --rules`, `docs/rules.md` and as groups in the playground. Half a day; no output change.

### Irish (`ga`): make the pack real

The pack exists but is thin, because the Irish edition of the Interinstitutional Style Guide (`style-guide.europa.eu/ga`, section 4.2.3) could not be read; what is there comes from the Publications Office quotation table and from statements about Irish in the Maltese edition. Open:

- **Quotes:** `‘…’` then `“…”` (the Publications Office table) against `“…”` first (Wikipedia). Settle it from the Irish ISG or Foras na Gaeilge / An Gúm, or from a native reader.
- **Sentence dash and ranges:** not read; the pack defaults to the spaced em dash.
- **Short words and abbreviations:** none (`orphans`, `abbreviations` empty). Candidates to source: `a`, `i`, `is`, `ar`, `le`, `go`, `de`, `do`; abbreviations such as `m.sh.`, `srl.`, `lch.` (Foras na Gaeilge's lists).
- **Initial mutations:** the hyphen and apostrophe forms (`an t-athair`, `na h-oibrithe`, `d'fhág`, `b'fhéidir`) pass through unchanged today and a test pins `d'`, `b'`, `m'`; add goldens for `t-`, `n-` and `h-` prefixes (`an t-uisce`, `i n-Éirinn`, `go h-álainn`) inside and outside quotes, since a hyphen after a single letter must never read as a range or a dash.
- **`€`:** the pack puts a no-break space before `€` through `percentSpace`, but Irish writes `€30`. Needs the split of `percentSpace` into `percentSpace` and `currencySpace` (see Currencies).
- **Review:** `reviewed: false`; get an Irish reader to check the page.

### Short words, conjunctions and the end of the line

Today `space.orphan` binds a one-letter word in a language's list to the next word (`a~long`, `в~місті`), `space.number` binds a number to a short word, and `space.title`, `space.initial` and `space.abbreviation` bind their cases. Not covered, checked on 0.2.1:

- `&`, `+`, `=` and other operators between words (`Tom & Jerry`, `rock + roll`) get no no-break space: a line can end on `&`, or start with it.
- Short words of two or three letters (`to`, `of`, `the`; `на`, `до`; `der`, `die`) are bound only where a pack lists them as one-letter orphans.
- **The last words of a paragraph (widows and runts)** are decided: not a string rule, CSS `text-wrap: pretty` on the page (written down in [limits.md](limits.md)).
- **How to bind, not only what:** a no-break space is a character and travels with the text (copy, search, screen readers read it as a space), a `<span style="white-space: nowrap">` is markup and stays on the page. The HTML, rehype and React modes could offer `bind: 'nbsp' | 'nowrap'` (the text mode and the CLI on plain text have only the character). Research what the two do to search, copy, hyphenation and `text-wrap: pretty` before choosing a default; the string engine keeps the no-break space.
- **A good-practices page** (`docs/practices.md`, later the website): what to bind (one-letter words, a number and its unit, a title and a name, an operator between words, a short tail), what to leave to CSS (`text-wrap: pretty`, `balance` for headings, `hyphens`), how a column width changes the answer, and what never to do (bind a whole line, bind inside a link text that wraps). Written from the sources registry, with before/after examples rendered at two widths.
- Done when each rule has golden tests per language that has the pattern, no rule can bind a whole line, and the practices page exists with an example per rule.

### Speed: what is left

Nothing superlinear is known (0.2.1). Typical text costs 30 to 60 ms per MB; the biggest rules are `quote`, `space.abbreviation` and `space.title` at 5 to 10 ms each. Further gains would be constant-factor work on those; tipograph and smartypants (10 to 20 ms) do much less. React already memoises per component (`useMemo` in `Typeset`), so no paragraph cache is needed.

## P2 (deferred by choice)

### Cleanups in the sources scripts

Found in the review (2026-10-21), none changes output:

- `resources/bibliography-html.ts` `usage()` repeats `usedBy()` of `resources/sources-html.ts` (which rules cite a source), and `esc` is defined in both. Export one of each (from `sources.ts`) so the two pages cannot disagree.
- The anchor slug is written two ways (`slug()` and `rule.replaceAll('.', '-')`, and `replaceAll('.', '')` in `gen-rules-doc.ts`). One function, one anchor format, checked by a test that every `docs/rules.md` link lands on an anchor in `sources.md`.
- `sources.html` prints an empty "Used by:" for a source no decision cites, `bibliography.html` says "unused". Say "unused" in both.
- `render()` in `sources.ts` and `sources-html.ts` skip a rule with no decision, while `gen-rules-doc.ts` links it as `general-knowledge`. `resources/sources.test.ts` stops that from shipping today; make the generators fail loudly instead of skipping, so a run outside the test cannot write a page that disagrees with its counts.
- The nine opt-in rules have `general-knowledge` entries with no source (`space.before-punctuation`, `space.after-comma`, `punctuation.double`, `symbol.implies`, `number.group`, `symbol.plusminus`, `symbol.fraction`, `symbol.degree`, `space.trailing`). Read a source for each and upgrade; the SI brochure for `symbol.degree`, a guide for the grouping separator of each language for `number.group`. Counted in "Finish the sources registry" above.

### Publish to npm, with a licence and compiled output (1.0.0)

The package ships `.ts` sources, is private, installs from a git tag, and has no licence. A consumer needs Bun or a TypeScript-aware bundler. This is the last step of 1.0.0, after the website, the open bugs and the docs: ship JavaScript with `.d.ts` files (ESM) so Node and plain tooling work, a `LICENSE`, a CI matrix with Node, then publish. Output changes become major releases from 1.0.0 on, so the decisions that change output (the English default quotes, the `ch` code, the `percentSpace` split) land before it.

### A larger real-text benchmark

English has 96 cases and each other language six. Add a real-text corpus per language (a few paragraphs with a hand-made expected output, written by a native reader) and score the other tools on it. Keep each case a statement of what is right, not of what one tool produces.

## Not doing

- **Ordinals** (`1st`, `1-й`, `1.`): no consensus form across the audience's languages, and no tool in the comparison does them well. Digit grouping shipped as the opt-in rule `number.group`.

## How this was measured

Everything above can be regenerated from the separate benchmark project in `apps/bench/` (see [contributing.md](contributing.md#the-benchmark)): `bun run bench` (quality and large-text speed), `bun run latency` (a paragraph), `bun run profile` (our rules, one by one) and `bun run features` (the same English inputs through every tool). The comparison page that draws on them is a snapshot; update this file when the numbers move.

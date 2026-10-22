# Changelog

Versions follow semver while the package is below 1.0.0: a **minor** release may change the output of the engine or the API (every entry says whether it can change output you already have), a **patch** release fixes a bug without changing output you rely on. If you depend on exact output, pin a tag and read this file before you move it.

## Unreleased

### Tooling and docs

- The landing page, the articles and the hand-written docs say what the engine does today: only English has a literary register, twelve packs set a spaced en dash, closing marks hang too, `avoid` keeps one stretch (a quotation whole), a lone mark is read by position, git is the install that works until 1.0, and the counts of sources and cases are the current ones. The landing shows `space.section`, `space.operator`, money, `phone.bind` and `space.short-word`, and a test runs its code sample. `docs/languages/uk.md` prints its one-letter words instead of escaped code points. No output change.

## 0.11.0 (2026-10-22)

### Changes

- The package is renamed from `@podiia/typography` to `@mokhniuk/typography`. Every import changes
  with it (`@mokhniuk/typography/html`, `/markdown`, `/rehype`, `/dom`, `/react`), and so does the
  dependency entry; the git address of the repository is the same, so moving a consumer is a change
  of the key in `package.json` and of the import specifiers. Nothing in the engine's behaviour is
  touched. Can change existing output: no.
- The website and the tool are called **Typography Engine**, not Podiia Typography: the page titles,
  the header, the footer and the docs. The benchmark and the comparison page name this package
  `typography-engine` in their tables, where it used to be `podiia`. The old name is left in the
  entries below, which are the history of the package under it.

## 0.10.0 (2026-10-22)

### New: an option

- `avoid` keeps a rule's paired changes together: the quotation rule carries `avoidWhole`, so if one
  of its marks would have to be dropped, the text keeps every quotation mark as it was typed. A
  quotation with its opening mark converted and its closing mark as typed is worse than one left
  alone, and the two are separate changes to the diff `avoid` works on. Every other rule still drops
  one change at a time (`1/2` can become `½` while `1/4` stays, when only `¼` is avoided).
- `avoid`: the characters the font cannot draw, as one string (`avoid: '⇒½¼¾−'`, `--avoid "⇒½¼¾−"`, a field in the playground, part of `TypographyConfig`). A rule that would insert one of them leaves that one stretch of text as it was typed, and nothing is reported for it (`explain` and `onChange` only see what reached the text); the rest of the rule's work still happens. A box or another font's glyph is worse than the text as written, which is the whole reason. What the rules can insert is now data: `ruleGlyphs(lang?)` per rule, `insertedCharacters(lang?)` and `insertedGlyphs(lang?)` as one string, the quote marks and digit separators read from the packs; `docs/rules.md` prints the characters of every rule. `keepAvoided` is exported for a custom pipeline. Can change existing output: only when `avoid` is set (in React, see below).
- In a browser the list writes itself: `./dom` gained `supports`, `glyphStatus`, `missingGlyphs`, `missingIn` and `fontOf`, which measure whether the page's font draws a character itself or lets a fallback draw it (one canvas, two probes per character), and `TypographyRoot` measures the font of its own `div` once `document.fonts.ready` resolves and adds what is missing to `avoid` (`avoidMissing`, on by default; `useMissingGlyphs` is exported for a page that wires the context itself). A server-rendered page is typeset as usual first and only a real gap in the font changes a text. Can change existing output: yes, in React and only where the page's font truly lacks a mark; set `avoidMissing={false}` to keep the old behaviour.

### New: two rules

- `phone.bind` (off by default, `enable: ['phone.bind']`): an international phone number is kept whole — no-break spaces between its groups and U+2011 (the non-breaking hyphen) inside it — without reformatting the digits (`+380 44 123 45 67`, `+44 20 7946 0958`, `+1 (555) 123-4567`, `+49 30 123456-0`, `0049 30 1234567`). It reads a number that opens with `+` or `00` directly followed by a digit and holds seven to fifteen digits (ITU-T E.164); a local number (`555-1234`, `044-123-45-67`), a date, a range, an IBAN group and a `tel:` link are left as typed, and so is a run of more than fifteen digits, so a number standing against a date does not swallow it. It runs before `number.group`, `dash.range` and `symbol.minus`, so none of them reads a phone number. Can change existing output: only when enabled.
- `space.short-word` (off by default, `enable: ['space.short-word']`): a short word of two or three letters stays with the word after it, for titles and headings (`Welcome to~the city`, `Zapraszamy do~Gdańska`). Five packs carry a list in the new field `shortWords` (`cs en pl sk uk`); every other language has none and the rule does nothing. It is off by default for the reason the sources give: Wolański (PWN Poradnia) and the ÚJČ advice service both say such a word may stay at a line end in body text and must travel with what it belongs to in a title. The lists are editorial, not read from a style guide. It never binds more than two words in a row, and a word that already follows a no-break space is left free. Can change existing output: only when enabled.

### Changes

- Money stays whole (`space.number`, on by default): a currency sign or code before the amount is bound to it (`USD 5 000` → `USD~5~000`, `€ 49.99` → `€~49.99`, `zł 50` → `zł~50`), and the digit groups of a number the writer grouped by hand are bound (`1 000 грн` → `1~000~грн`, `1 000 000` → `1~000~000`), which is what the opt-in `number.group` does to a bare number, so the two now agree. A phone number is kept out of it by its shape: a leading zero (`09 123 456`), a group run after another digit group (`+380 44 123 45 67`) and four digits at the end (`555 123 4567`) are left alone. `₴ ¥ ₺` are now bound after a number as `€ $ £` already were. The signs and codes are one table, `src/core/currency.ts` (ISO 4217 codes and the signs of the audience's currencies), exported as `CURRENCY_CODES`, `CURRENCY_SIGNS` and `CURRENCY_WORDS` and read by both `space.number` and `space.percent`. No rule moves, adds or removes a currency sign. A space that opens the text is not read as the space after a sign (` 5 apples` keeps its leading space). Can change existing output: yes, for text with money or a number written in groups.

### Tooling and docs

- A font checker on the website (`/font-checker/`): load a font file (read with `FontFace`, never uploaded) or name an installed font, pick languages, and get the coverage of every character the rules can insert plus the letters of each language that fonts most often lack (own, borrowed from another font, or nowhere to be found), the `avoid` config for what is missing, the example of each language set in the font at two measures with hanging punctuation, and a text preset measured from the font (size, line height on the 8px grid, measure, `--hang-amount`). No output change.
- The playground shows the characters each rule can insert, in the language in use, and strikes them through when `avoid` holds one; it has a field for `avoid`, and the config it exports and imports carries it. No output change.
- The benchmark was re-run (`apps/bench/RESULTS.md`): the checks are unchanged (242/250, and 250/250 in the literary register), and the Slovak outputs of 0.9.0 are in the file now. The whole speed table was measured in one run on a busier machine, so every tool is about twice its earlier figure (this package 63 ms per MB, typograf 118, tipograph 22, smartypants 18); the ratios are what the numbers are for, and README, limits.md and backlog.md now quote this run. `space.number` costs about 10 ms per MB instead of 5, the money and grouped-number work being three linear passes where one would do (noted in the backlog). No output change.
- `docs/rules.md` prints the characters every rule can insert and links them to `avoid`; a docs example may now be marked as one that shows text a rule leaves alone (`keeps`), which is how the `avoid` and phone-number guards are shown. `src/core/glyphs.test.ts` proves for every rule that giving it its own characters to avoid changes nothing. No output change.

## 0.9.0 (2026-10-22)

### Changes

- Slovak binds the one-letter words `v k s u z o a i` (both cases) to the next word, so a line does not end on them (`k~lesu`, `a~v~noci`); a word that merely ends in one of the letters (`Slovensko v Európe`) is untouched, and two-letter words are not bound. The list is an editorial convention from secondary sources (a typography article, a wikibook style guide, a design studio page), not a read authority, so the decision stays `general-knowledge` for sk. Can change existing output: yes, in sk.

### Tooling and docs

- The `space.orphan` decision record now cites more sources. Polish: Wolański in the PWN Poradnia lists `a i o u w z` (capitals too) as a recommendation for lines over about 40 characters; the list is unchanged, and the Polish list is now registry-verified from that entry. Czech: the ÚJČ Jazyková poradna (read raw) and the ČSN 01 6910 mention, with the nuance that the norm lists `k s v z o u` and the poradna recommends `a i` as well; the engine still binds all eight. Ukrainian: a Zhytomyr typesetting handbook backs the class (one-letter prepositions and conjunctions in books, "не слід"); the letter list is the engine's own, so Ukrainian stays `general-knowledge`. Two-letter words stay unbound everywhere (PWN and ÚJČ both let them stay in body text). No output change.

## 0.8.0 (2026-10-22)

### Fixes

- A straight `"` glued after a digit-adjacent mark stays as typed: `5"a"` was set `5"a»` (the opener refused as an inch mark, the closer converted) and now stays `5"a"`; the lone `"` is left only when the nearest earlier straight `"` follows a digit, is followed by a non-space, and no quotation that was paired or read as an opener or closer stands between the two (a raw lone mark in the gap does not cancel it). In the HTML and Markdown modes a tag between the digit and the `"` no longer makes it an opener (the tag placeholder is skipped). The digit before a straight `"` is also read as a whole code point of the Unicode number class in both quote passes, so `𝟐" pipe` and `a ٢" bolt` keep the inch mark (the first was a quotation opener, the second had its mark closed). Can change existing output: yes, for text with a straight `"` glued after such a mark, and for text with a non-ASCII digit before a `"`.

### New: a rule

- `space.section` (on by default): a typed space between `§` or `¶` (or the doubled `§§` `¶¶`) and a number becomes a no-break space, so a mark never ends a line apart from its reference (`§ 5`, `§§ 5–7`, `¶ 12`). `§5` with no typed space is left as typed, like `€30`, and `§` before a word or at the end of the text is untouched. Source: Butterick, Practical Typography, "Paragraph and section marks". The run of spaces may mix breaking and no-break ones (`§` NBSP space `5`, `§` space NBSP `5`; the result is one no-break space) and the number may be in any script (`§ ٥`, `§ 𝟓`). Can change existing output: yes, for text with `§` or `¶`, a space and a digit.
- `space.operator` (on by default): a lone `&`, `+` or `=` between two words, with a single typed space or no-break space on each side, gets no-break spaces on both sides, so a line never ends on the operator or starts with it (`Tom & Jerry`, `rock + roll`, `Fischer = champion`). Operators chain: `Tom & Jerry & Co` binds end to end into one unbreakable unit, and a pathological chain could bind a whole line. An operator next to an inline tag (`Tom &amp; <em>Jerry</em>`) or after a word ending in a combining mark (decomposed `café & bar`) stays unbound. Numbers (`2 + 2`, `x = 5`), doubled operators (`&&`, `==`, `+=`) and operators typed with no spaces (`R&D`, `x+y`) are untouched. The HTML mode now writes an `&` that stands before a no-break space as `&amp;`. No citable source was found; the decision is `general-knowledge`. Can change existing output: yes, for an operator between two words.

### Tooling and docs

- The decision records read two more sources. The SI brochure (BIPM, 9th ed., 5.4.3 and 5.4.4) now backs `symbol.degree` (a space before `°C`, none for a plane-angle degree) and is cited, with the places where the engine differs, in `number.group`; it says nothing on `±` or the minus sign, so those two stay general knowledge. The Greek, Finnish, Italian and Danish editions of the Interinstitutional Style Guide and the Czech language handbook were read for the euro: all five write `30 €` with a space, so `currencySpace` stays on in `el`, `fi`, `it`, `da` and `cs` (the backlog's doubt was about the `€` symbol in the Danish guide, whose source showed the code `EUR` after the figure; the guide's euro-symbol passage writes `et beløb på 30 €`). The backlog item on `currencySpace` without a source is closed. No output change.
- `space.orphan` is verified for cs from ÚJČ entry 880 (k s v z o u a i; the fetched summary does not mention two-letter words); the pl and uk lists are unchanged and unverified. No output change.
- A good-practices page, `docs/practices.md` (also on the website): what to bind and with which rule, what to leave to CSS, column width, what never to do, and the no-break space against markup. It cites only sources read and says "general knowledge" for the rest. No output change.

## 0.7.0 (2026-10-21)

### Fixes

- A lone quotation mark reads the text past a tag beside it: in the HTML, Markdown and rehype modes `said; <ins>“</ins>now` kept its `“` (it was turned to `”`, the tag read as a letter before the mark), and `</a>»n't«` is `«n’t»`. A page whose changed marks are wrapped in tags is now stable when typeset again. Can change existing output: yes, for HTML and Markdown with a lone mark next to a tag.
- `markHangs` hangs a mark that markup cuts off from its word (`<ins>“</ins>Curiouser`, `“<em>Alice</em>`): it reads the next text in the block, so the opening mark hangs, and an apostrophe in its own element (`I<ins>’</ins>m`) is no longer wrapped as a closing mark. `hangPieces` takes the character after the text as a third argument, `after`. Can change existing output: no for text; yes for the DOM `markHangs` builds.

### Tooling and docs

- A website in `apps/website`: landing page, the docs and changelog built from this repository's Markdown, articles, and the playground; every page is typeset by the engine and hangs its punctuation from the first paint. Not part of the package. The playground runs without its config panel on a page that has none. No output change.
- The language pages (`docs/languages/*.md`) put every pattern of quotation marks in a code span (`„…“`, `«outer ‹inner› outer»`, and the examples quoted in a pack's notes), so a page that typesets its text in another language cannot turn them into its own. No output change.

## 0.6.0 (2026-10-21)

- A configuration per project: `TypographyConfig` gathers `lang`, `register`, `quoteStyle`, `disable`, `enable`, `rules`, `nbsp` and `hangAmount` under the names the functions take, so one object spreads into every call (`typesetHtml(html, site)`, `typographic(text, site.lang, site)`, `use(rehypeTypography, site)`); an option given to a call replaces the config's value, lists are not merged. `defineConfig` returns a config after checking it (unknown key, bad value, unknown rule name) and `checkConfig` checks one read from JSON. `TypographyRoot` and `Typeset` take `config` (their own props beat it, it beats the outer root), and `TypographyRoot` takes `hangAmount`, set as `--hang-amount` on its `div`. `typo --config <file>` reads a module's default export or a JSON file, and without it the `typography` key of `package.json`; flags beat the config. The playground shows its switches as a config and applies a pasted one. `ModeOptions` is now `TypographyConfig` plus `onChange` (so every mode accepts `nbsp` and `hangAmount`; only HTML reads `nbsp`), `HtmlOptions` is `ModeOptions`, and the `Io` of the command line has `importModule`. Can change existing output: no.
- Rule categories: every rule has a `category` that says what it is for, `tradition` (quotes, the apostrophe, dashes, the ellipsis, punctuation and the spaces of prose), `symbols` (arrows, ©, ®, ™), `math` (minus, ×, ±, fractions, ⇒) or `data` (digit groups, ranges, units, percentages and currencies, dates). `typo --rules` and `docs/rules.md` show it as a column, and the playground groups its rule switches by it. New exports: `RULE_CATEGORIES`, `RuleCategory`; `Rule` has an optional `category` (every built-in rule sets it; a custom rule may leave it out). Rule ids are unchanged, so `disable` and `enable` take the same names; a category is not a name they take. Can change existing output: no (the engine's output is unchanged; the `typo --rules` listing has a new column).
- The pack field `percentSpace` no longer covers `€`: a new field, `currencySpace`, says whether a `€` typed after a number gets a no-break space (`49€` becomes `49~€`). The rule is still `space.percent`. Irish, Maltese, Portuguese, Latvian, Lithuanian and Estonian set `percentSpace` and not `currencySpace`, because their style guides write `€30` with no space or show money only as the code `EUR`; the other packs that spaced `€` keep doing it. `€30` is never touched, and a typed space (`30 €`) is still bound by `space.number`. Can change existing output: yes, in ga, mt, pt, lv, lt and et only: `30€` stays `30€` instead of becoming `30~€`; `%` is spaced as before.

## 0.5.0 (2026-10-21)

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

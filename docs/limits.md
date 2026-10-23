# Known limits

What the engine deliberately leaves alone, what it knowingly does not do, and what has not been looked at. Nothing here is a surprise to the author; some of it is waiting for a page that needs it.

## What the rules leave alone

- Web addresses, emails and `` `code spans` `` come back exactly as written, so `12-15` in a path and `->` in a command survive. (Only that backtick form is a code span in plain text; HTML and Markdown have their own, see below.)
- A leading apostrophe on a year (`'90s`) does not stop a quotation from pairing.
- A straight `"` after a digit is an inch mark (`5'10"`), not a closing quote, and a straight `"` straight after a digit never opens a quotation, so two inch marks in one text (`a 2" pipe and a 4" pipe`) stay inch marks. A quote after a letter still opens one (`Tallinn"ä"`). A quote after any other digit is read as closing, so `"call 911"` is still a quotation. Known gap: an inch mark inside a quotation (`"a 5" hole"`) closes it early, as before. A quotation glued to a digit (`5"a"`) keeps both marks as written, and the digit before the mark may be of any script (`𝟐"`, `٢"`).
- Hyphens that are not ranges: identifiers, partial dates (`2026-10`) and phone numbers keep their hyphen. Only ascending numbers are ranges. An unspaced three-digit and four-digit pair (`555-1234`) is read as a local phone number, so a real range like `100-1200` written without spaces keeps its hyphen; spaced (`100 - 1200`) it is a range.
- A single quoted letter `n` (`he said 'n'`) is read as the `’n’` of rock 'n' roll, not as a quotation, and so are the words `'til`, `'em`, `'cause`, `'bout`, `'round`, `'tis`, `'twas` and `'cos` when a single quote opens them.
- A hyphen between equals is never changed into an en dash: a program cannot tell East-West (en dash) from one-week (hyphen), so those pairs are fixed in the text itself.

## Rule behaviour to know about

- **A quotation is written in double quotes in the source.** A plural possessive inside a single-quoted one (`‘the dogs’ bone’`) is read as the end of the quotation.
- **A space just inside a quotation mark goes** (`" stone "` is `“stone”`), unless the mark is glued to a word on the outside (`km‘ z`, `c ‘d`, `Nr." %"`): then the space was typed on the wrong side of the mark and moves out (`km “z`, `c” d`), so that no two words are glued together. A straight `"` whose next mark opens another quotation (`"a then "b" c`) is a lone opener, read by where it stands.
- **`(C)`, `(R)` and `(TM)` always become `© ® ™`**, including an uppercase `(C)` used as a list marker; lowercase `(c)` needs a year after it. `->` and `<-` become arrows except as the end of a comment or long arrow (`-->`), a double-headed one (`<->`), or a comparison with a negative number (`x<-1`).
- **A quote with no partner is read by where it stands.** A lone straight `"` or curly mark (`“`, `„`) that opens a word becomes the language's opening mark, one that closes a word its closing mark; a mark with a space on both sides, whose side cannot be told, is left as written.
- **A quotation that continues across paragraphs** (books reopen the quote at each paragraph start) is not followed. Pairing is per paragraph: a lone straight opener is converted by where it stands, but the quotation is not carried into the next paragraph.
- **`symbol.minus` reads `-5` as a minus after a space or a parenthesis**, so a command-line flag in prose (`use -9`) becomes `−9`. Switch the rule off for that text, or put the flag in a code span.
- **The last words of a paragraph are not kept together** (widows and runts): a no-break space is a line-break constraint, and what looks right depends on the column width, which a string rule cannot see. Use CSS `text-wrap: pretty` (or `balance` for headings) on the page instead.
- **A number range can break after its en dash** (`21–` then `26 September` on the next line). A word joiner after the dash would stop it; it is not done because it changes the characters that are copied out of the text.
- **`%` and `€` get a no-break space only where the pack says so** (`space.percent`, pack fields `percentSpace` and `currencySpace`; each language page in [languages/](languages/index.md) says which). Ukrainian and Polish usage was not checked, and English puts the euro sign first.
- **Orphan binding assumes NFC text.** The lookbehind of `space.orphan` does not see combining marks, so in decomposed text a combining mark on the letter before a word-final list letter (decomposed `ňa`: the lookbehind sees the mark, not a letter) makes that list letter bind as if it were a standalone word. This holds in every pack with a list (cs, en, pl, sk, uk); NFC text is correct. Not fixed.
- **`space.short-word` binds in body text too.** On by default since 0.14.0: a two- or three-letter word from the pack's list stays with the word after it (`Welcome to~the city`). The sources read (PWN Poradnia, ÚJČ) say such a word may stay at a line end in body text and must not in a title; the engine binds everywhere because it sets display text, where a line ending on `to` is the stumble readers notice. For long body text in a narrow column, or where a native reader prefers the body-text convention, `disable: ['space.short-word']`. Only five packs have a list (cs, en, pl, sk, uk), editorial, not read from a style guide; the other 21 languages bind one-letter words only. It never binds more than two words in a row (`in the house` becomes `in~the house`), and the next word may open with a quotation mark, an apostrophe or a bracket (`the~’90s`).
- **The abbreviation lists are short and have not been read by a native speaker.** See [languages.md](languages.md).
- **Dash profiles come from the style guides, not from a native reader.** Twelve packs set a spaced en dash (`cs de et fi hr hu lt lv ro sk sl sv`, from the Interinstitutional Style Guide and the national guides), English does in the literary register, and every other pack gets the spaced em dash.
- **German has only the guillemet nesting** (`»outer ›inner‹ outer«`). The more common `„outer ‚inner‘ outer“` is not implemented.
- **Literary differs from display for `en` only.** Every other language, `uk` included, gives the same output in both registers. Not implemented: literary profiles for `de`, `pl`, `fr`, `de-CH` and `fr-CH`. American English is not a register but `quoteStyle: 'us'`.
- **The literary register has been tested but not looked at on a real page.** It has unit tests and a rendered check of the British quotes and the hanging marks, not of a Ukrainian dialogue page.
- **`space.operator` binds chains end to end.** A lone `&`, `+` or `=` between two letter words is bound on both sides, so a chain (`Tom & Jerry & Co`, `one + two + three + four + five`) binds end to end into one unbreakable unit; a pathological chain could bind a whole line. It does not bind an operator next to an inline tag in HTML or Markdown (`Tom &amp; <em>Jerry</em>`: the tag placeholder is not a letter), after a word ending in a combining mark (decomposed `café & bar`), or where either side of it is not a letter (a digit, a bracket, a full stop, the start or end of the text, as in `2 + 2` and `x = 5`).

## Money and grouped numbers

- **A number the writer grouped by hand is bound as one number** by `space.number` (`1 000 000` keeps its groups together), and a phone number written in groups of three looks exactly like one. The guards are the shape: a leading zero (`09 123 456`), a group run that follows another digit group (`+380 44 123 45 67`), and four digits at the end (`555 123 4567`) are left alone. What is left is a number of 1–3 digits followed by groups of exactly three with nothing else around it, which in prose is an amount; `number.group` reads the same shape as one number. A seven-digit number written `555 123 456`, with no country code, is bound as an amount.
- **A currency sign or code binds to the amount after it** (`USD 5 000`, `€ 49.99`). The codes are ISO 4217 and the signs are the ones of the audience's currencies (`src/core/currency.ts`); a code of three capitals that is not currency (`ISO 9001` has no space-then-digit shape, but `PIN 1234` does) binds too where it stands before a number. The engine never moves, adds or removes a sign: placement per language (`€49.99` in English, `49,99 €` in German) is the writer's.

## Fonts and `avoid`

- **The engine cannot see a font.** `avoid` is a list you give it (see [api.md](api.md#avoid)); the measuring in `./dom` writes that list in a browser, and `TypographyRoot` uses it by default (`avoidMissing`).
- **The measuring compares advance widths**, so a font whose glyph is exactly as wide as the fallback's in both probes is reported as missing, and a font that draws a wrong glyph of its own is reported as present. A no-break space cannot be measured at all and is never reported.
- **`avoid` drops a whole change, not a character.** A rule that rewrites a stretch (a spaced dash) leaves that whole stretch as it was typed if any character it would insert is avoided. The quotation rule goes further (`avoidWhole`): one mark it cannot set means the text keeps every quotation mark as typed, since its marks come in pairs.
- **In React the measured list covers every language**, not only the root's, because a `Typeset` under it may set its own; a mark no rule inserts in the language in use costs nothing to avoid.
- **In React the text can change after the fonts load.** The first paint is the ordinary typeset text; once `document.fonts.ready` resolves and a gap is found, the texts under the root are set again. Set `avoidMissing={false}` for a page that must not do that.
- **The font checker's verdict and preset are a starting point**, not research: the score is the share of characters the font draws itself, and the size, line height, measure and hang amount are measured from the font with editorial rules of thumb.

## Opt-in rules

Ten rules are off until named in `enable` (`number.group` is described in the rules page) ([rules.md](rules.md)). Their known limits:

- **`space.before-punctuation`** removes a space before `, . ; : ! ? )` only when the mark is not followed by a letter or digit, so a decimal (` .5`), a file extension (` .gitignore`), `!=` and `??` stay. A colon between digits (`10 : 30`) and an emoticon (` :)`, ` ;-)`) are left. A dot is not pulled against another dot, so `. . .` never becomes `...`. French keeps its space before `: ; ! ?` (it needs one) but loses it before `, . )`. It is not aware of prose that is really code: `a ?. b` outside a code span is left only because of its guards.
- **`space.after-comma`** adds a space only when a letter follows the comma. `1,5`, `1,000` and `3,14` are untouched, and so is `a,b` inside a web address, email or code span. It cannot tell `a,b` in a CSV or a list of variables from a missed space, so use it on prose.
- **`punctuation.double`** collapses a run of `!` or `?` that is attached to the word before it and not followed by a letter or digit (`Wow!!!` becomes `Wow!`). `?!` and `!?` stay. `a ?? b`, `!!x` and `(!!y)` are left. `...` belongs to `ellipsis`.
- **`space.trailing`** trims spaces and tabs at the end of each line (not a no-break space, not a line break). `typesetText` strips and restores trailing spaces itself by design, so the rule matters for `typographic()` and the HTML and Markdown modes only. `typographic()` removes a Markdown hard break (two trailing spaces); `typesetMarkdown` keeps it.
- **`symbol.plusminus`** turns `+-` into `±` only before a digit and not after a letter, digit or `+`. A range written right after it (`+-0.2-5`) is read as a range only on a second run, because `dash.range` runs before the sign exists.
- **`symbol.fraction`** knows `1/2`, `1/4` and `3/4` only, as whole numbers: not `11/2`, `1/20`, `a1/2`, `1/2/2026`, `5/1/2`, `0.1/2` or `1/2a`. `2 1/2` becomes `2 ½` (a mixed number keeps its integer; some fonts show `2½` closer). Other fractions (`2/3`, `1/3`) are left. The rule binds a short word after the fraction (`½ cup`) with a no-break space itself, because `space.number` only looks for a digit before the space.
- **`symbol.degree`** reads `20°C`, `20 °C`, `20° C` and `20 C` (also `F`) and writes number, no-break space, `°C`. The degree sign is the signal: a bare `20 C` is read as a temperature unless the word before the number is a single letter or a label such as Type, Class, Section, Plan, Grade, Level, Vitamin (an English list; `Vitamin C 5 C` is left). `20C` with no space, `20 Cat`, `20 F1` and `5 C.E.` are left. Kelvin and `ºC` (a masculine ordinal) are not handled.
- **`phone.bind`** only keeps a number whole; it never reformats one. It reads a number that opens with `+` or `00` followed directly by a digit and holds seven to fifteen digits (ITU-T E.164), with digits, spaces, hyphens and brackets inside. So a local number (`555-1234`, `044-123-45-67`), a number written `+ 49 30 …` with a space after the sign, and a number of more than fifteen digits are left as typed — the last on purpose, because a phone number standing directly against a date or another figure would otherwise swallow it (`+49 30 1234567 2026-10-20` is nineteen digits and is left alone). A date, a range, an IBAN group and a `tel:` link are left alone. Locale formats per language are not applied (in [backlog.md](backlog.md#phone-numbers-locale-formats)). The hyphens become U+2011, so a text search for the typed hyphen no longer finds them.
- **`symbol.implies`** turns `=>` into `⇒`. Not `=>>`, `==>`, `=>=` or `<=>`. Outside a code span it cannot tell an arrow function in prose from an implication.

## HTML mode

- The `lang` attribute is not read; pass `lang`. (The rehype plugin does read it.)
- A tag is told from text by a tokenizer, not by a real HTML parser: malformed markup is left alone rather than repaired.
- Any named entity other than the ones listed in [api.md](api.md) (`&alpha;`, `&shy;`) is kept as it was, and the rules do not see the character it stands for.
- A block in which a rule would lose or add a placeholder or a line cannot be mapped back onto its markup, so it is kept as it came and reports no changes.

## Markdown mode

- A list nested four spaces deep is read as indented code and left as it was; use two.
- The language is not read from front matter; pass `lang`.
- A hyphen at the start of a line is a list marker, so a dialogue line must open with an em dash or en dash in a Markdown file.

## Rehype

- Only an element's `lang` (or `xmlLang`) property sets the language of its subtree, and only if it names a pack: the longest run of its leading subtags that is a pack code, in any case (`de-CH`, `de-ch` and `de-CH-1996` are `de-CH`; `de-AT` is `de`; `uk-UA` is `uk`).

## Hanging punctuation

- **The inline hanging script (`HangScript`) was checked in a Vite dev server and a production build by the author** (no hydration warning, no console errors) for the earlier version; the current one was checked in Chrome and WebKit (Safari's engine) in a static page with the markup `HangText` renders plus the inline script (the speaker bio that showed the bug, 28 widths, left and right) and in the playground (left, right, justified and centred text, 21 widths, two amounts: every line-start opener and line-end closer hung by its width, every letter mid-line where plain text puts it), not yet in a React app with hydration. It needs a content security policy that allows inline scripts (`early={false}` otherwise). After updating the package, clear the bundler's dependency cache (for Vite, `node_modules/.vite`), or the dev server may keep the old script.
- **It needs a content security policy that allows inline scripts.** On a page that forbids them, use `early={false}` on `TypographyRoot` and drop `<HangScript />`; the marks then hang by a rough width (0.4em) from the first paint and shift by the small difference once the bundle has loaded and measured them.
- **Hanging is left-to-right only**: right-to-left text would need the margins on the other side.
- **Safari does not hang a closing mark at the end of a justified line**: it stretches the line to the edge anyway. Right-aligned and centred lines hang there, and Chrome hangs justified ones; nothing breaks either way.
- **A mark at a span edge loses its kerning with the letter beside it** (a fraction of a pixel in WebKit), as any wrapped character does.
- **Hanging covers quotes, brackets and the `.,;:!?…` right after a closing one**; a full stop or comma alone at a line end does not hang.
- `hangPunctuation` is a browser function. It needs `getComputedStyle`, `ResizeObserver`, `MutationObserver` and `requestAnimationFrame`.

## Speed

Since 0.2.0 the package is faster than typograf on English text in one piece, and about 3 to 4 times slower than tipograph and smartypants, which do much less (smartypants only quotes, dashes and ellipses; neither has abbreviations or ranges). The benchmark (`apps/bench/RESULTS.md`, generated on the author's machine) reports, for English text in one piece, text mode, the median of several runs (the 0.16.1 run):

| Tool | 10 KB | 100 KB | 1000 KB |
|---|---|---|---|
| this package | 0 ms | 4 ms | 38 ms |
| typograf | 1 ms | 6 ms | 58 ms |
| typopo | 21 ms | 1089 ms | 98742 ms |
| richtypo | 2499 ms | not run (the file estimates about 249 s, extrapolating a quadratic) | not run |
| tipograph | 0 ms | 1 ms | 11 ms |
| smartypants | 0 ms | 1 ms | 10 ms |
| retext-smartypants | 4 ms | 27 ms | 577 ms |

Every figure here is from one run of the benchmark, so only the ratios between the tools mean anything: the 0.14.0 run, on a busier machine, put this package at 74 ms and typograf at 115 at 1 MB, and the 0.12.0 run put them at 30 and 58, and since 0.14.0 the short-word rule runs by default and costs about 8 ms per MB of English (17% of the rule time in the profile). That is about 1.5 times faster than typograf at 1 MB (38 against 58 ms in the 0.16.1 run; 49 against 71 in the 0.15.0 run); 0.2.0 took it from 0.32 s (the output is identical: a differential run against the engine as it was before the speed work, over 2.5 million combinations, finds no difference). The cost is linear in the text. What made the old engine slow was a regular expression that opens with a lookbehind, which the engine tries at every position; the rules now find a literal first and read the character before it (`src/core/scan.ts`), and a rule is skipped when a cheap test (`Rule.when`) shows its trigger is absent. The quote rule is about 10 ms per MB of ordinary prose (the 0.10.0 run, see [backlog.md](backlog.md)), 60 to 100 ms on text full of unpaired marks.

Since 0.2.1 no known input makes a rule superlinear: a run of one opening mark (`“` repeated 40,000 times) took a minute and now takes about 7 ms, and text full of dialogue or unpaired marks costs about 45 to 70 ms per MB (it was 180 to 200). Every rule is linear on a long run of one character (spaces, digits, `x`, `-`, `--`, `.`, `+-`, `1x`, `!`, `)`), and the opt-in `space.before-punctuation`, `punctuation.double` and `symbol.degree` no longer open with a lookbehind (about 1, 2 and 5 ms per MB when switched on, from 40, 40 and 200). `bun scripts/stress.ts` times each rule at 20,000, 40,000 and 80,000 characters of each such run and flags a doubling that costs more than 2.5 times; `src/core/linear.test.ts` holds the loose version of that as a test. The zone scan that sets code spans, addresses and emails aside before the rules run is outside the rules, and until 0.12.0 it cost 300 ms per MB on text with lone backticks and no line break (a regex flag it did not need); no benchmark text has a backtick, which is why the table above never showed it. The scan is timed as a row of its own by `scripts/stress.ts` and the profile since then. Outside the rules, the two inputs the benchmark's probes found quadratic in 0.13.1 (`bun run probes`) are linear since 0.15.0: a long run of spaces inside one line in the text mode (40,000 spaces took about 1.3 s, now about 2 ms) and many `<` that never close in the HTML mode (8,000 took about 0.8 s, now under 1 ms); `scripts/stress.ts` times both modes as rows of their own.

On a JavaScriptCore engine (Bun) a lookbehind with `\p{L}` or `\p{N}` does not see letters outside the Basic Multilingual Plane. The scan helpers reproduce whatever the running engine does, so the output equals the old engine's on the same runtime. One residual difference exists, only for ill-formed UTF-16 (a lone high surrogate directly after a fraction, followed by a character at U+E000 or above) and only with `symbol.fraction` on: the `½` is skipped. Well-formed text cannot reach it. A second JavaScriptCore quirk is in the original zone regex (`src/core/zones.ts`): when its email alternative scans a run of word characters, dots and hyphens that holds a `www.` and an astral character follows, the old engine reported the address one character late (`.www.😀)😀` zoned `ww.😀)😀`). The rewrite finds the address correctly, so on such text, and only there, the output differs from the old engine's. Speed numbers depend on the machine; re-run the benchmark (see [contributing.md](contributing.md#the-benchmark)) to see your own. `src/speed.test.ts` is a loose budget (linear scaling, a 1 MB ceiling), not a measurement.

## Benchmark caveats

These are repeated at the top of `apps/bench/RESULTS.md`.

- The style-neutral cases (252: 250 are scored for this package, plus 2 register cases) were written by the author of this package. They check what is right (a German quotation is `„…“` or `»…«`; an ISO date is not a range), not one tool's house style, but a tool's default that differs from them is reported as a failure. This package's default run passes every check (250/250) since 0.15.0, when English became `“…”`; its house style `«…»` is `quoteStyle: 'guillemets'`, which the checks would count as a failure for English. Read the cases in `apps/bench/RESULTS.md` and contest them.
- They cover what typography tools claim to do, not everything a typographer cares about.
- Most cases are English: 96 of the 252 cases are English, 11 Ukrainian, 10 German, 8 Polish, 7 French and 6 each for the other twenty languages (a quote, a nested quote, a dash, a range, a sample and a stability check). None is Swiss (`de-CH`, `fr-CH`). The 6 cases per new language come from the same style guides as its pack, so they do not test it independently.
- typograf was run with its default rules and the locales it ships that this package also covers. The only typographic rule it has off by default for these languages (`common/nbsp/afterNumber`) is also run, as a separate column. The other default-off rules insert a final newline, strip or escape HTML, wrap paragraphs, or are for a language this package does not cover.
- typopo only supports English and German here, and a language a tool does not support is not scored, so the totals compare different numbers of cases: read each tool's row against its own denominator.
- richtypo was run with its recommended rules for English and French (it has none for the other languages). tipograph was run with its default presets for English, German, Polish and French (no Ukrainian). smartypants and retext-smartypants were run for English only: they have no locale, so another language would be judged on English quotes. smartypants was given quotes, dashes and ellipses (`qde`); retext-smartypants has default options. The last three are text only here, except richtypo and tipograph, which read HTML.
- Speed is one machine, one run of each size, best of three below 1 MB.

Where the time goes in this package, and what to do about it, is in [backlog.md](backlog.md).

## Distribution

- The package ships compiled ESM with `.d.ts` declarations, has no dependencies, and is MIT-licensed (see the README). The command line needs Node 20.10 or later, or Bun.
- Every entry point except `/dom` (which holds only the hanging-punctuation code, 2.4 KB brotli) carries all 27 language packs (16 of the 26 KB brotli of one call), so a one-language page pays for the other 26; the backlog has the item "Load only the languages used".
- There is no CommonJS build: the package is ESM only.

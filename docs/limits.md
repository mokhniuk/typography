# Known limits

What the engine deliberately leaves alone, what it knowingly does not do, and what has not been looked at. Nothing here is a surprise to the author; some of it is waiting for a page that needs it.

## What the rules leave alone

- Web addresses, emails and `` `code spans` `` come back exactly as written, so `12-15` in a path and `->` in a command survive. (Only that backtick form is a code span in plain text; HTML and Markdown have their own, see below.)
- A leading apostrophe on a year (`'90s`) does not stop a quotation from pairing.
- A straight `"` after a digit is an inch mark (`5'10"`), not a closing quote. A quote after any other digit is read as closing.
- Hyphens that are not ranges: identifiers, partial dates (`2026-10`) and phone numbers keep their hyphen. Only ascending numbers are ranges. An unspaced three-digit and four-digit pair (`555-1234`) is read as a local phone number, so a real range like `100-1200` written without spaces keeps its hyphen; spaced (`100 - 1200`) it is a range.
- A single quoted letter `n` (`he said 'n'`) is read as the `’n’` of rock 'n' roll, not as a quotation, and so are the words `'til`, `'em`, `'cause`, `'bout`, `'round`, `'tis`, `'twas` and `'cos` when a single quote opens them.
- A hyphen between equals is never changed into an en dash: a program cannot tell East-West (en dash) from one-week (hyphen), so those pairs are fixed in the text itself.

## Rule behaviour to know about

- **A quotation is written in double quotes in the source.** A plural possessive inside a single-quoted one (`‘the dogs’ bone’`) is read as the end of the quotation.
- **A quote with no partner is only handled for the straight `"`.** A lone curly mark (`“`, `„`) is left as written, because whether it opens or closes depends on the language.
- **A quotation that continues across paragraphs** (books reopen the quote at each paragraph start) is not followed. Pairing is per string, so the lone opener is left as it is.
- **`symbol.minus` reads `-5` as a minus after a space or a parenthesis**, so a command-line flag in prose (`use -9`) becomes `−9`. Switch the rule off for that text, or put the flag in a code span.
- **A number range can break after its en dash** (`21–` then `26 September` on the next line). A word joiner after the dash would stop it; it is not done because it changes the characters that are copied out of the text.
- **`%` and `€` get a no-break space in German and French only** (`space.percent`). Ukrainian and Polish usage was not checked, and English puts the euro sign first.
- **The abbreviation lists are short and have not been read by a native speaker.** See [languages.md](languages.md).
- **Dash profiles beyond German and literary British English were not checked.** Every other language gets the spaced em dash.
- **German has only the guillemet nesting** (`»outer ›inner‹ outer«`). The more common `„outer ‚inner‘ outer“` is not implemented.
- **Literary exists for `en` and `uk` only.** The other languages fall back to display. Not implemented: literary profiles for `de`, `pl`, `fr` and `ch`, and American English.
- **The literary register has been tested but not looked at on a real page.** It has unit tests and a rendered check of the British quotes and the hanging marks, not of a Ukrainian dialogue page.

## Opt-in rules

Eight rules are off until named in `enable` ([rules.md](rules.md)). Their known limits:

- **`space.before-punctuation`** removes a space before `, . ; : ! ? )` only when the mark is not followed by a letter or digit, so a decimal (` .5`), a file extension (` .gitignore`), `!=` and `??` stay. A colon between digits (`10 : 30`) and an emoticon (` :)`, ` ;-)`) are left. A dot is not pulled against another dot, so `. . .` never becomes `...`. French keeps its space before `: ; ! ?` (it needs one) but loses it before `, . )`. It is not aware of prose that is really code: `a ?. b` outside a code span is left only because of its guards.
- **`space.after-comma`** adds a space only when a letter follows the comma. `1,5`, `1,000` and `3,14` are untouched, and so is `a,b` inside a web address, email or code span. It cannot tell `a,b` in a CSV or a list of variables from a missed space, so use it on prose.
- **`punctuation.double`** collapses a run of `!` or `?` that is attached to the word before it and not followed by a letter or digit (`Wow!!!` becomes `Wow!`). `?!` and `!?` stay. `a ?? b`, `!!x` and `(!!y)` are left. `...` belongs to `ellipsis`.
- **`space.trailing`** trims spaces and tabs at the end of each line (not a no-break space, not a line break). `typesetText` strips and restores trailing spaces itself by design, so the rule matters for `typographic()` and the HTML and Markdown modes only. A Markdown hard break (two trailing spaces) is removed by it.
- **`symbol.plusminus`** turns `+-` into `±` only before a digit and not after a letter, digit or `+`. A range written right after it (`+-0.2-5`) is read as a range only on a second run, because `dash.range` runs before the sign exists.
- **`symbol.fraction`** knows `1/2`, `1/4` and `3/4` only, as whole numbers: not `11/2`, `1/20`, `a1/2`, `1/2/2026`, `5/1/2`, `0.1/2` or `1/2a`. `2 1/2` becomes `2 ½` (a mixed number keeps its integer; some fonts show `2½` closer). Other fractions (`2/3`, `1/3`) are left. The rule binds a short word after the fraction (`½ cup`) with a no-break space itself, because `space.number` only looks for a digit before the space.
- **`symbol.degree`** reads `20°C`, `20 °C`, `20° C` and `20 C` (also `F`) and writes number, no-break space, `°C`. The degree sign is the signal: a bare `20 C` is read as a temperature unless the word before the number is a single letter or a label such as Type, Class, Section, Plan, Grade, Level, Vitamin (an English list; `Vitamin C 5 C` is left). `20C` with no space, `20 Cat`, `20 F1` and `5 C.E.` are left. Kelvin and `ºC` (a masculine ordinal) are not handled.
- **`symbol.implies`** turns `=>` into `⇒`. Not `=>>`, `==>`, `=>=` or `<=>`. Outside a code span it cannot tell an arrow function in prose from an implication.

## HTML mode

- The `lang` attribute is not read; pass `lang`. (The rehype plugin does read it.)
- A tag is told from text by a tokenizer, not by a real HTML parser: malformed markup is left alone rather than repaired.
- Any named entity other than the ones listed in [api.md](api.md) (`&copy;`, `&euro;`) is kept as it was.
- A block in which a rule would lose or add a placeholder or a line cannot be mapped back onto its markup, so it is kept as it came and reports no changes.

## Markdown mode

- A list nested four spaces deep is read as indented code and left as it was; use two.
- The language is not read from front matter; pass `lang`.
- A hyphen at the start of a line is a list marker, so a Ukrainian dialogue line must open with an em dash in a Markdown file.

## Rehype

- Only an element's `lang` (or `xmlLang`) property sets the language of its subtree, and only if its primary subtag is one of `en`, `uk`, `de`, `pl`, `fr`, `ch`; `de-CH` is read as `de`, not `ch`.

## Hanging punctuation

- **The inline hanging script (`HangScript`) was checked in a Vite dev server and a production build by the author** (no hydration warning, no console errors, marks hang as the page is parsed); that check is not reproducible from this folder. It needs a content security policy that allows inline scripts (`early={false}` otherwise). After updating the package, clear the bundler's dependency cache (for Vite, `node_modules/.vite`), or the dev server may keep the old script.
- **It needs a content security policy that allows inline scripts.** On a page that forbids them, use `early={false}` on `TypographyRoot` and drop `<HangScript />`; the marks then hang once the bundle has loaded, and a mark that starts a wrapped line on a prerendered page moves by its own width at that moment.
- **Hanging is left-to-right, left-aligned text only.** Right-to-left, centred and indented text have no hang; a mark that starts a line in a justified paragraph is not given an optical margin on the right either.
- Hanging covers opening marks only. Closing quotes, commas and full stops hang at the end of a line, which shows only in justified text.
- `hangPunctuation` is a browser function. It needs `getComputedStyle`, `ResizeObserver`, `MutationObserver` and `requestAnimationFrame`.

## Speed

About 5 times slower than typograf on large text, and about 14 times slower than tipograph and smartypants, which do much less (smartypants only quotes, dashes and ellipses; neither has abbreviations or ranges). The benchmark (`bench/RESULTS.md`, generated 2026-10-20 on the author's machine) reports, for English text in one piece, text mode, best of three (one run at 1 MB):

| Tool | 10 KB | 100 KB | 1000 KB |
|---|---|---|---|
| this package | 3 ms | 33 ms | 324 ms |
| typograf | 1 ms | 6 ms | 60 ms |
| typopo | 20 ms | 1047 ms | 114894 ms |
| richtypo | 4945 ms | not run (the file estimates about 492 s, extrapolating a quadratic) | not run |
| tipograph | 0 ms | 2 ms | 24 ms |
| smartypants | 0 ms | 2 ms | 22 ms |
| retext-smartypants | 5 ms | 47 ms | 1019 ms |

That is 0.32 s against 0.06 s for typograf at 1 MB. Fast enough for a page; a build over very large content would want the per-rule regular expressions combined. Not done: nothing here is near the limit. Speed numbers depend on the machine; re-run the benchmark (see [contributing.md](contributing.md#the-benchmark)) to see your own.

## Benchmark caveats

These are repeated at the top of `bench/RESULTS.md`.

- The style-neutral cases (69 are scored for this package, plus 2 register cases) were written by the author of this package. They check what is right (a German quotation is `„…“` or `»…«`; an ISO date is not a range), not one tool's house style, but a tool's default that differs from them is reported as a failure, including this package's own `«…»` for English. Read the cases in `bench/RESULTS.md` and contest them.
- They cover what typography tools claim to do, not everything a typographer cares about.
- Most cases are English: of the 66 cases in the benchmark (the 5 stability checks are separate), 34 are English, 9 German, 10 Ukrainian, 7 Polish and 6 French. None is Swiss (`ch`).
- typograf was run with its default rules and the locales it ships that this package also covers. The only typographic rule it has off by default for these languages (`common/nbsp/afterNumber`) is also run, as a separate column. The other default-off rules insert a final newline, strip or escape HTML, wrap paragraphs, or are for a language this package does not cover.
- typopo only supports English and German here, and a language a tool does not support is not scored, so the totals compare different numbers of cases: read each tool's row against its own denominator.
- richtypo was run with its recommended rules for English and French (it has none for the other languages). tipograph was run with its default presets for English, German, Polish and French (no Ukrainian). smartypants and retext-smartypants were run for English only: they have no locale, so another language would be judged on English quotes. smartypants was given quotes, dashes and ellipses (`qde`); retext-smartypants has default options. The last three are text only here, except richtypo and tipograph, which read HTML.
- Speed is one machine, one run of each size, best of three below 1 MB.

Where the time goes in this package, and what to do about it, is in [backlog.md](backlog.md).

## Distribution

- The package is private, ships `.ts` sources and has no build step. It needs Bun or a TypeScript-aware bundler.
- No licence is granted. See the README.

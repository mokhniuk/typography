# Backlog

What the package still lacks, after the 0.2.0 work that closed the gaps found by comparing it with typograf, typopo, richtypo, tipograph, smartypants and retext-smartypants (2026-10-20, versions in [../bench/RESULTS.md](../bench/RESULTS.md)). Our audience is the EU, Ukraine and the US; tools for a single other language (Russian, Chinese) are out of scope.

Priorities: **P0** blocks the audience, **P1** closes a gap other tools do not have, **P2** is worth doing later. An item is done when its test exists and the docs say so; move it out of this file into [../CHANGELOG.md](../CHANGELOG.md).

## Where we stand

| | podiia | best other | Source |
|---|---|---|---|
| Benchmark checks passed (default / literary register) | 242 / 250, 250 / 250 | typograf 131 / 226 | `bench/RESULTS.md` |
| 1 MB of English, text mode | 33 ms | typograf 59 ms, tipograph 12 ms, smartypants 10 ms | `cd bench && bun run bench` |
| Target languages covered (26) | 26 | typograf 22, tipograph 12 | [languages/index.md](languages/index.md) |

The 26 target languages are the 24 official languages of the EU, Ukrainian and US English (the option `quoteStyle: 'us'`). Podiia's 8 default-run misses are all the house `«…»` for English, which the checks count as a failure; the literary register passes every check. The cases were written by this package's author; read the caveats in [limits.md](limits.md). The cases for the twenty new languages come from the same style guides as the packs, so they are not an independent test.

## P0

### Native-speaker review of the 20 new languages

Every pack has `reviewed: false`: bg cs da el es et fi ga hr hu it lt lv mt nl pt ro sk sl sv (plus the older uk de pl fr ch en, never reviewed either). They were written from style guides, and several sources (Pravidla 2000, Svenska skrivregler, the RAE, the Maltese Language Council, DOOM) could only be read in part. For each language: a native reader goes through its generated page ([languages/index.md](languages/index.md)), corrects the pack, and flips `reviewed` to `true`.

## P1

### Language gaps found while writing the packs

Each is a limit of the pack format or an unverified choice, not a crash:

- **Sentence dash unverified** for nl, sv, hu, sk, ro: the pack uses the spaced em dash; usage there often prefers a spaced en dash.
- **Italian and Maltese truncation apostrophe** (`po'`, `va'`, `da'`, `di'`) inside straight single quotes closes the quotation early. The pack format has no field for trailing apostrophes.
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

### Keep the original when the font lacks the glyph

A rule that inserts a character the font does not have shows a box or a mismatched fallback glyph; the text as typed is better. The engine is string to string and cannot see the font, so the plan is an option that names the characters to avoid:

- A rule whose output would contain an avoided character is skipped for that match, and the original stays (the change is not recorded by `explain`). Default on, with a documented default set of characters the engine expects every font to have; the user lists what their font lacks (for example `⇒`, `½ ¼ ¾`, `−`, `→`). The candidates at risk are the symbols the rules insert: `⇒ ½ ¼ ¾ ± − × → ← ™ ® ° …` and the quote marks of unusual fonts.
- Threaded through every mode like `enable` was: `typographic`, `typesetBlock`, text, HTML, Markdown, rehype, React, CLI, playground, `scripts/gen-rules-doc.ts`.
- Docs: explained next to the other options, and every opt-in rule and flag gets a before/after preview in the docs and the playground (a "preview" for each feature flag), so a reader sees what a flag changes and which characters it needs.
- Later, a browser add-on: `supports(char)` in the React/DOM layer (`document.fonts.check` or a canvas measure), used when given; server rendering uses the option.
- Done when: a golden test per rule shows the original text kept when its character is avoided, idempotence holds, and `explain` records nothing for the skipped match.

### Speed: what is left

Nothing superlinear is known (0.2.1). Typical text costs 30 to 60 ms per MB; the biggest rules are `quote`, `space.abbreviation` and `space.title` at 5 to 10 ms each. Further gains would be constant-factor work on those; tipograph and smartypants (10 to 20 ms) do much less. React already memoises per component (`useMemo` in `Typeset`), so no paragraph cache is needed.

## P2 (deferred by choice)

### Publish to npm, with a licence and compiled output

The package ships `.ts` sources, is private, installs from a git tag, and has no licence. A consumer needs Bun or a TypeScript-aware bundler. Ship JavaScript with `.d.ts` files (ESM) so Node and plain tooling work, publish, and choose a licence. Until then every competitor is easier to adopt. Skipped on purpose in the 0.2.0 run.

### A larger real-text benchmark

English has 96 cases and each other language six. Add a real-text corpus per language (a few paragraphs with a hand-made expected output, written by a native reader) and score the other tools on it. Keep each case a statement of what is right, not of what one tool produces.

## Not doing

- **Ordinals** (`1st`, `1-й`, `1.`): no consensus form across the audience's languages, and no tool in the comparison does them well. Digit grouping shipped as the opt-in rule `number.group`.

## How this was measured

Everything above can be regenerated from the separate benchmark project in `bench/` (see [contributing.md](contributing.md#the-benchmark)): `bun run bench` (quality and large-text speed), `bun run latency` (a paragraph), `bun run profile` (our rules, one by one) and `bun run features` (the same English inputs through every tool). The comparison page that draws on them is a snapshot; update this file when the numbers move.

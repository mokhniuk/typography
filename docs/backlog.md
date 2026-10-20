# Backlog

What the package still needs, found by comparing it with typograf, typopo, richtypo, tipograph, smartypants and retext-smartypants on English text (2026-10-20, versions in [../bench/RESULTS.md](../bench/RESULTS.md)). Our audience is the EU, Ukraine and the US; tools for a single other language (Russian, Chinese) are out of scope.

Priorities: **P0** blocks the audience, **P1** closes a gap other tools do not have, **P2** is worth doing later. An item is done when its test exists and the docs say so; move it out of this file into [../CHANGELOG.md](../CHANGELOG.md).

## Where we stand

| | podiia | best other | Source |
|---|---|---|---|
| English checks passed (default) | 30 / 34 | typograf 22 (24 with its `afterNumber` rule on) | `bench/RESULTS.md` |
| English checks passed (literary register) | 34 / 34 | | `bench/RESULTS.md` |
| 1 MB of English, text mode | 324 ms | typograf 60 ms, tipograph 24 ms, smartypants 22 ms | `cd bench && bun run bench` |
| 1 KB paragraph | 0.7 ms per call | typograf 0.14 ms, tipograph 0.04 ms | `bun run latency` in `bench/` |
| Target languages covered (26) | 5 | typograf 22, tipograph 12 | below |
| Features of 37 in the feature matrix (✓ = 1, ◐ = ½) | 29 | typograf 22.5 | the comparison page |

The 26 target languages are the 24 official languages of the EU, Ukrainian and US English. The 34 checks were written by this package's author; read the caveats in [limits.md](limits.md).

Only we have: registers, change reports (`explain`), hanging punctuation, a React component, a rehype plugin. Only we are safe on every one of URLs, emails and code spans.

## P0

### American English quotes

English gets `«…»` with `„…“` inside, and the literary register is British (`‘…’` with `“…”` inside). There is no `“…”` with `‘…’` profile, and every other tool in the comparison produces `“…”` by default. Add the American profile and decide what the English default is. This is the one thing a US user hits first.

- Done when: `typographic('He said "stone"', 'en', { … })` can return `He said “stone”`, with a nested pair `“a ‘b’ c”`, and a golden test and a `docs/languages.md` row say so.

### EU languages, tier 1: es, it, pt, nl, cs, sk, ro, hu, sv

typograf ships 20 of the 24 EU languages; we ship 4 (plus Ukrainian). These nine are the ones a user will compare us on. For each: quote marks and nesting, dash style, the no-break rules, and `%`/currency spacing, from a style guide and not from memory, then a native reader's check (see [contributing.md](contributing.md#adding-a-language)).

## P1

### Missing English rules

What typograf, typopo or tipograph do and we do not (from `bun run features` in `bench/`):

| Rule | Example | Done by |
|---|---|---|
| Space before punctuation removed | `word , and` to `word, and` | typograf, typopo |
| Fractions and ± | `1/2` to `½`, `+-5` to `±5` | typograf; typopo and tipograph do ± |
| Degree sign | `20 C` to `20 °C` | typograf |
| Trailing spaces trimmed | | typograf, typopo; we keep them in text mode on purpose, so this one is opt-in |
| Doubled punctuation | `!!`, `??` | typograf |
| Space after a comma | `a,b` to `a, b` | typograf |
| `=>` and other arrows | `=>` to `⇒` | nobody |

Any rule that edits more than typography (adding a space, removing one) ships off by default and is named in the changelog as such.

### Speed to within 2× of typograf

We are linear in the text (10× the text, 10× the time) but 5× slower than typograf, which has more rules. Measured causes:

- One regex pass with a `\p{L}` lookbehind over 1 MB costs 27 ms; a trivial pass costs 0.5 ms. We have 35 `\p{…}` classes and 26 lookbehinds in `src`; typograf's source has none.
- `quote` is 38% of the time (about 190 to 225 ms per MB): it repeats its regexes until nothing changes. Replacing its final character loop with one `replace` saved only 17% of the rule, so the regexes are the cost, not the loop.
- Then `space.abbreviation` 10%, `symbol.multiply` 9%, `apostrophe` 8%, `space.title` 8%.

In order: (1) skip a rule when its trigger is absent from the text; (2) replace `\p{L}` and lookbehinds in hot regexes with fixed letter classes and captured prefixes; (3) pair quotes in one scan with a stack; (4) merge the passes that share a regex; (5) memoise by paragraph in the React components; (6) a speed budget in CI. Measure each step with `bun run profile` in `bench/` before the next. Target: 1 MB in about 120 ms. Timings on one machine vary by up to 2× between runs, so compare within a run.

### Publish to npm, with a licence and compiled output

The package ships `.ts` sources, is private, installs from a git tag, and has no licence. A consumer needs Bun or a TypeScript-aware bundler. Ship JavaScript with `.d.ts` files (ESM) so Node and plain tooling work, publish, and choose a licence. Until then every competitor is easier to adopt.

### Custom rule API

typograf (`addRule`) and richtypo (a list of functions) let a user add or reorder rules. Ours is a fixed table. Expose `addRule` with an insert position, keeping the id, `disable` and `explain` behaviour; the order contract in [contributing.md](contributing.md#adding-a-rule) stays.

## P2

### EU languages, tiers 2 and 3

Tier 2: da, fi, el, bg, hr, sl. Tier 3: lt, lv, et, ga, mt. No tool covers hr, lt or mt, so this is where we could lead.

### A bigger benchmark

There are 34 English checks and 71 in all. Grow English to 100 or more, add a real-text corpus per language (a few paragraphs with a hand-made expected output), and score the new languages against typograf and tipograph as they land. Keep each case a statement of what is right, not of what one tool produces.

### Digit grouping and ordinals

No tool in the comparison does locale-aware thousands separators (`1,000,000` for en, `1 000 000` for uk and fr, `1.000.000` for de) or ordinals well. Worth doing once the languages exist.

## Language coverage

Counting English and US English as two of the 26. A dot means the tool ships rules for the language.

| Language | podiia | typograf | tipograph | typopo | richtypo | smartypants, retext |
|---|---|---|---|---|---|---|
| en | ● | ● | ● | ● | ● | ● |
| en-US (`“…”`) | | ● | ● | ● | ● | ● |
| uk, de, fr, pl | ● | uk de fr pl | de fr pl | de | fr | |
| es, it | | ● | ● | | | |
| pt | | | ● | | | |
| nl, ro, hu, el, bg, sl, et, lv, ga | | ● | | | | |
| cs | | ● | ● | ● | | |
| sk | | ● | | ● | | |
| sv, da, fi | | ● | ● | | | |
| hr, lt, mt | | | | | | |

typograf has 29 locales in all, tipograph 16, typopo 6, richtypo 3.

## How this was measured

Everything above can be regenerated from the separate benchmark project in `bench/` (see [contributing.md](contributing.md#the-benchmark)): `bun run bench` (quality and large-text speed), `bun run latency` (a paragraph), `bun run profile` (our rules, one by one) and `bun run features` (the same English inputs through every tool). The comparison page that draws on them is a snapshot of 2026-10-20; update this file when the numbers move.

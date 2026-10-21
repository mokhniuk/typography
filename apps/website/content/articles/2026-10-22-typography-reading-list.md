---
title: What to read about typography
date: 2026-10-22
glyph: ¶
summary: The guides, standards and books behind this engine's rules — what we have read and cite, and what still sits on the reading pile.
---

# What to read about typography

Every rule in this engine carries a decision record naming its source, so this list is not a shelf of good intentions: it is what the project actually reads, plus the books waiting their turn. Where we have only skimmed something, it says so.

## Free, online, read first

- **Matthew Butterick, [Practical Typography](https://practicaltypography.com/)**. The best starting point there is: short, opinionated, free to read. The engine cites its pages on quotes, apostrophes, dashes, ellipses, word spaces, non-breaking spaces, math symbols and legal symbols. One honest caveat: we read several of those pages as fetched summaries, and the sources registry marks them accordingly.
- **Office québécois de la langue française, [Banque de dépannage linguistique](https://vitrinelinguistique.oqlf.gouv.qc.ca/)**. The clearest free reference for French spacing around punctuation — with the usual warning that Québec usage and France usage differ.
- **[Unicode CLDR](https://cldr.unicode.org/)**. Not prose but data: which quotation marks and number separators each locale declares. The engine checked its 26 languages against CLDR 46 and marks the places where published style guides disagree with it as `disputed` rather than picking silently.
- **[UAX #14, the Unicode line breaking algorithm](https://www.unicode.org/reports/tr14/)**. Why a no-break space works and where a browser may break a line.
- **NIST, [SI unit rules and style conventions](https://physics.nist.gov/cuu/Units/checklist.html)**. The checklist behind `25 °C` and the space between a value and its unit.

## National guides, one per language

Each of the engine's 26 language packs was written from a published guide: Pravopys 2019 for Ukrainian, the RAE's *Ortografía* for Spanish, the Internetová jazyková příručka for Czech, Språkrådet for Swedish, Kotus for Finnish, Treccani for Italian, Dansk Sprognævn for Danish, and so on. The generated [language pages](/docs/languages/) name the guide behind every pack — and also admit that no pack has been reviewed by a native speaker yet.

## Books on the pile

These are the standard works. We recommend them the way everyone does — and unlike everyone, we will say plainly that the project has not finished reading them yet, which is why no rule cites them so far.

- **Robert Bringhurst, *The Elements of Typographic Style*, 4th ed.** The book on the craft; section 5 covers analphabetic symbols — dashes, quotes, spaces.
- ***The Chicago Manual of Style*, 18th ed.** The reference for American editorial practice, including the unspaced em dash the engine deliberately does not default to.
- **Matthew Butterick, *Typography for Lawyers*, 2nd ed.** Practical Typography's stricter sibling.
- **Jost Hochuli, *Detail in Typography*.** Sixty pages on letters, words and lines; the shortest serious book on microtypography.
- **James Felici, *The Complete Manual of Typography*, 2nd ed.** The production handbook: what every mark is for and how to set it.

One more honest note: we looked for peer-reviewed evidence on punctuation and spacing conventions and found none — the empirical literature studies typefaces, sizes and line lengths, not dashes. Typographic rules are tradition, recorded in guides. That is exactly why each of this engine's rules names the guide it follows.

## See the decisions

The sources registry in the repository holds every rule's record: the claim, the citation, and whether it is `verified`, `general-knowledge` or `disputed`. The [rules reference](/docs/rules/) links each rule to its entry.

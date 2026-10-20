# Languages

The engine has profiles for six languages, `Lang = 'en' | 'uk' | 'de' | 'pl' | 'fr' | 'ch'` (`ch` is Swiss usage), and `en` is the default when none is given. The data below is read from `src/core/profiles.ts`; this page is written by hand, so when you change that file, change this page too.

## Read this first

- The abbreviation lists are short and have not been read by a native speaker. They came from general knowledge, not from a style guide. Add to them only from a style guide, and have a native reader check them before you rely on them. French and Swiss have none.
- Dash profiles beyond German and literary British English were not checked. Every other language gets the spaced em dash; Polish, French and Swiss usage was not looked into.
- No native-speaker review of any profile is recorded in the repository. The package's benchmark (its cases are in `bench/RESULTS.md`, written by the package author) has a handful of cases per language, mostly English: they check that the output is a defensible style, not that a native reader approves it.
- What is not implemented is listed at the end of this page.

## Summary

| | `en` | `uk` | `de` | `pl` | `fr` | `ch` |
|---|---|---|---|---|---|---|
| Display quotes, level 1 | `« »` | `« »` | `» «` | `„ ”` | `«~ ~»` | `« »` |
| Level 2 | `„ “` | `„ “` | `› ‹` | `« »` | `“ ”` | `‹ ›` |
| Level 3 | `‚ ‘` | `‚ ‘` | starts over from level 1 | starts over | starts over | starts over |
| Literary quotes | `‘ ’`, then `“ ”` | as display | as display | as display | as display | as display |
| Sentence dash, display | em `—` | em | en `–` | em | em | em |
| Sentence dash, literary | en `–` | em | en `–` | em | em | em |
| Dialogue dash (literary) | no | yes | no | no | no | no |
| Orphan letters | `a A I` | `а в і ї й з у о` (both cases) | none | `a i o u w z` (both cases) | none | none |
| Abbreviations | page only | together, bind, page | together, bind, page | bind, page | none | none |
| `%` and `€` spacing | no | no | yes | no | yes | no |

`~` stands for a no-break space. In the table, an en dash is `–` and an em dash is `—`; a sentence dash is always preceded by a no-break space and followed by a plain space.

## Quote marks

A quotation nested deeper than the levels listed starts over from the first. Source marks may be curly, German-low, straight or guillemets; any mix is read, and the marks of the language and level are set.

| Lang | Display, by level | Literary |
|---|---|---|
| `en` | 1 `«…»`, 2 `„…“`, 3 `‚…‘` | 1 `‘…’`, 2 `“…”` (a third level reopens with `‘`) |
| `uk` | 1 `«…»`, 2 `„…“`, 3 `‚…‘` | the same as display |
| `de` | 1 `»…«`, 2 `›…‹` | the same as display |
| `pl` | 1 `„…”`, 2 `«…»` | the same as display |
| `fr` | 1 `«~…~»` (a no-break space inside the guillemets), 2 `“…”` | the same as display |
| `ch` | 1 `«…»`, 2 `‹…›` | the same as display |

German nested quotes are `»outer ›inner‹ outer«`. The other common German style, `„outer ‚inner‘ outer“`, is not implemented.

English display uses guillemets, which is this package's house style; the benchmark counts it as a failure against its own check (see `bench/RESULTS.md`). For British-style English quotes, use the literary register, which is British (`‘…’` with `“…”` inside). American English (`“…”` with `‘…’` inside) does not exist as a profile.

## Sentence dash

A spaced hyphen, en dash, em dash or double hyphen between words is a break in the sentence and is set as a no-break space, the dash, a space.

| Lang | Display | Literary |
|---|---|---|
| `en` | `—` | `–` |
| `de` | `–` | `–` |
| `uk`, `pl`, `fr`, `ch` | `—` | `—` |

A hyphen or en dash between two numbers is a range in every language and becomes an unspaced en dash (`dash.range`); that rule does not depend on the language.

The Ukrainian dialogue dash (`dash.dialogue`) applies when `lang` is `uk`, `register` is `literary` and the text opens its paragraph (`blockStart`): a hyphen, en dash or em dash followed by a space at the very start becomes `—~`. Only the start of the text: a dash after a line break is as likely a list marker.

## Orphan letters

One-letter words that must not be stranded at the end of a line get a no-break space after them (`space.orphan`).

| Lang | Letters |
|---|---|
| `en` | `a`, `A`, `I` |
| `pl` | `a i o u w z`, upper and lower case |
| `uk` | `а в і ї й з у о`, upper and lower case |
| `de`, `fr`, `ch` | none |

## Abbreviations

Parts of an abbreviation stay together, and some stay with what follows (`space.abbreviation`). The lists are short and not yet read by a native speaker.

- `together`: the parts of one abbreviation (`z. B.`).
- `bind`: stays with the word or number after it (`Nr. 5`, `ul. Marszałkowska`).
- `page`: stays with a number only (`S. 12`).

| Lang | together | bind | page |
|---|---|---|---|
| `en` | | | `No`, `Nos`, `Fig`, `Figs`, `Vol`, `Ch`, `Sec`, `Art`, `p`, `pp` |
| `de` | `z. B.`, `d. h.`, `u. a.`, `u. U.`, `i. d. R.`, `v. a.`, `s. o.`, `s. u.` | `Nr`, `Abb`, `Tab`, `Tel`, `Bd`, `Hrsg`, `vgl`, `ca` | `S` |
| `uk` | `т. д.`, `т. п.`, `т. ч.` | `м`, `вул`, `просп`, `пров`, `пл`, `обл`, `ім`, `див`, `рис`, `табл` | `с`, `ст`, `ч` |
| `pl` | | `ul`, `al`, `pl`, `os`, `im`, `godz`, `zob`, `np`, `tzw`, `tel`, `ks`, `św`, `mgr`, `inż` | `nr`, `s`, `poz` |
| `fr`, `ch` | none | none | none |

Titles (`Prof.`, `Dr.`, `Mr.`, `Mrs.`, `Ms.`, `Mx.`, `St.`, `Hon.`, `Rev.`, `Sr.`, `Jr.`) and initials are not per language: `space.title` and `space.initial` apply to every language.

## `%` and `€`

`space.percent` puts a no-break space between a number and `%` or `€` in German and French only (`5 %`, `49 €`). Ukrainian and Polish usage was not checked, and English puts the euro sign first. A space that is already there is handled by `space.number` in every language, which binds a number to a short word or unit (or `%`, `°`, `€`, `$`, `£`) after it.

## Review status

| Part | Status |
|---|---|
| Quote marks per language | Set from general knowledge of each language's conventions; no native-speaker review recorded. German has one style only. |
| Sentence dash: German, literary British English | Checked (the spaced en dash is the convention). |
| Sentence dash: all other languages | Not checked; em dash by default. |
| Abbreviation lists | Short, from general knowledge, not read by a native speaker. |
| `%` and `€` | German and French only; other languages not checked. |
| Orphan letters | English, Polish and Ukrainian; others have none. Not read by a native speaker. |

## Not implemented

- A literary profile for `de`, `pl`, `fr` and `ch`. They fall back to display. German books use `„…“` with `‚…‘` inside; Polish dialogue opens with a dash like Ukrainian.
- American English quotes, as display or literary.
- Dash profiles beyond the two named above.
- A quotation that continues across paragraphs (books reopen the quote at each paragraph start). Pairing is per string, so the lone opener is left as it is.
- A lone curly quotation mark (`“`, `„`) with no partner is left as written, because whether it opens or closes depends on the language.
- Abbreviations for French and Swiss.
- Languages other than the six. A `lang` outside `Lang` is a type error in TypeScript, throws at run time when text with quotes is typeset, and is refused by the command line.

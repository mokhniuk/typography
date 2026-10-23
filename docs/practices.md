# Good practices

What to bind with a no-break space, what to leave to the browser, and what never to do. In the examples `~` stands for a no-break space (U+00A0), as in [rules.md](rules.md). Where a decision has a source read, the claim links to its record in [sources.md](../resources/sources.md); where it says "general knowledge" no source was read, and the advice is a judgement.

## What to bind

A no-break space keeps two words on one line. Bind a pair when a line that ends or starts between them reads as a mistake. Each rule below does it, and each can be switched off by its id in `disable`.

- **A one-letter word and the word after it** (`space.orphan`). A line should not end on a lone `a`, `i` or `в`.

  ```text
  (en)  before  A cat and I      after  A~cat and~I   (the second ~ is space.short-word's)
  (uk)  before  Він і я в домі   after  Він і~я в~домі
  ```

  Each pack carries its own list: English `a` and `I`, Czech `k s v z o u a i`, Polish `a i o u w z`, Slovak `v k s u z o a i`, Ukrainian `а в і ї й з у о`. What backs each ([space.orphan](../resources/sources.md#spaceorphan)): Czech and Polish are source-backed (the Czech Language Institute's handbook and language advice, ČSN 01 6910 as the poradna reports it; Wolański in the PWN Poradnia, who gives the Polish list as a recommendation for lines over about 40 characters). Ukrainian has a source for the class only (a Zhytomyr typesetting handbook says one-letter prepositions and conjunctions should not end a line in books), the letters are ours. Slovak is an editorial convention from secondary sources, and English `a` and `I` have no source. A language with no list binds nothing; see [languages.md](languages.md). Two- and three-letter words (`to`, `of`, `na`, `do`) are the next rule's.

- **A short word and the word after it** (`space.short-word`, on by default since 0.14.0). A line should not end on `to` or `do`.

  ```text
  (en)  before  Welcome to the city of light
        after   Welcome to~the city of~light
  (pl)  before  Zapraszamy do Gdańska       after  Zapraszamy do~Gdańska
  ```

  Why it is on everywhere, and when to turn it off. The sources read say two things: in a title or heading such a word must travel with what it belongs to, and in body text it may stay at the end of a line (Wolański in the PWN Poradnia for Polish, the ÚJČ advice service for Czech; [space.short-word](../resources/sources.md#spaceshort-word)). "May" is a permission, not a recommendation, so either default is within the sources. This engine sets display text (web pages, headings, short copy), where a line that ends on `to` is the stumble readers notice, and typograf and typopo bind these words by default too, so the rule runs unless you switch it off: `disable: ['space.short-word']` (or `--disable space.short-word`) for long body text in a narrow column, or where a native reader prefers the body-text convention. What it does not do: it never binds more than two words in a row, so a chain cannot grow into a whole line (`in the house` becomes `in~the house`); it binds only the words a pack lists, and five packs have a list (`cs en pl sk uk`), this package's own enumeration, not read from a guide; the other 22 languages have no list (nor one for one-letter words), so nothing is bound there. The next word may open with a quotation mark, an apostrophe or a bracket (`the~’90s`).

- **An amount of money and its sign or code** (`space.number`). A figure must not be parted from the money it counts, on either side, and a number written in groups must not break inside itself.

  ```text
  (en)  before  USD 5 000, € 49.99, 100 USD   after  USD~5~000, €~49.99, 100~USD
  (uk)  before  1 000 грн                     after  1~000~грн
  ```

  The signs and codes are one table (`src/core/currency.ts`): ISO 4217 codes and the signs of the audience's currencies. The engine never moves, adds or removes a sign — where it stands is yours to write. The group spaces of a number grouped by hand are bound whatever follows, which is what the opt-in `number.group` does to a bare number, so the two agree; the guards that keep a phone number out of it are in [limits.md](limits.md).

- **A phone number, whole** (`phone.bind`, off by default). A number that wraps in the middle cannot be read out or dialled.

  ```text
  (en)  before  Call +380 44 123 45 67 or +1 (555) 123-4567
        after   Call +380~44~123~45~67~or +1~(555)~123‑4567
  ```

  Only an international number (`+` or `00`, seven to fifteen digits) is bound, and the digits are never reformatted; the hyphens become U+2011, which does not break. Dates, ranges, IBANs and `tel:` links are left alone ([phone.bind](../resources/sources.md#phonebind)).

- **A number and its unit or month** (`space.number`, `space.percent`). A figure should not be left alone at the end of a line.

  ```text
  (en)  before  On 21 September, 15 people paid 5 %.
        after   On~21~September, 15~people paid 5~%.
  (de)  before  5% and 49€      after  5~% and 49~€
  ```

  The rule binds a number to the short word after it (up to nine letters), whatever the word is: a unit, a month, or `and` (`Fig. 2 and p. 14` gives `Fig.~2~and p.~14`). The space between a value and its unit is backed by [space.number](../resources/sources.md#spacenumber); that the space is a no-break one, and the month case, are our choice. `%` and `€` get the space only in the languages whose pack says so ([space.percent](../resources/sources.md#spacepercent)).

- **A title and the name after it, an initial and the surname, an abbreviation and what it qualifies** (`space.title`, `space.initial`, `space.abbreviation`).

  ```text
  (en)  before  Prof. Dr. Oksana opens.   after  Prof.~Dr.~Oksana opens.
  (en)  before  Written by K. Słoboda.    after  Written by~K.~Słoboda.
  (en)  before  See Fig. 2, p. 14.         after  See Fig.~2, p.~14.
  ```

  Titles and the English abbreviation case are backed by a source read ([space.title](../resources/sources.md#spacetitle), [space.abbreviation](../resources/sources.md#spaceabbreviation)). The German, Ukrainian and Polish abbreviation lists, and the initial rule ([space.initial](../resources/sources.md#spaceinitial)), are general knowledge.

- **An operator between two words** (`space.operator`). A line should neither end on `&` nor start with it; the `’n’` of rock ’n’ roll is an "and" with its letters dropped and is bound the same way.

  ```text
  (en)  before  Tom & Jerry, rock + roll, rock ’n’ roll
        after   Tom~&~Jerry, rock~+~roll, rock~’n’~roll
  ```

  General knowledge: no style guide that speaks of operators between words was found ([space.operator](../resources/sources.md#spaceoperator)). Numbers (`2 + 2`) and unspaced forms (`R&D`) are left alone.

- **A section mark and its number** (`space.section`).

  ```text
  (en)  before  See § 5, ¶¶ 3, 4           after  See §~5, ¶¶~3, 4
  ```

  Backed by a source read: Butterick says the mark is always followed by a nonbreaking space ([space.section](../resources/sources.md#spacesection)).

## What to leave to CSS

Some problems depend on where the line breaks, and a string rule cannot see that. Set them on the page.

- **`text-wrap: pretty` for body text.** It keeps the last line of a paragraph from being one short word (a widow or runt). A no-break space cannot do this reliably: the right choice depends on the column width. The engine does not try; see [limits.md](limits.md). Support and exact behaviour differ between browsers, so look at the result in the ones you target.
- **`text-wrap: balance` for headings.** It evens out the lines of a short block, so a heading does not end on one word.
- **`hyphens: auto` with the right `lang`.** A narrow justified column has loose lines without it. It needs the `lang` attribute of the text, and it is the browser's dictionary that decides where a word splits, not the engine.

All three are general knowledge here: no source in the registry covers them.

## Column width

- A narrow column (a phone, a sidebar) punishes every binding: each bound pair is a longer unbreakable unit, and the lines around it come out short or loose.
- A wide column (over about 75 characters a line; a rule of thumb, general knowledge) hides the problem, because it has fewer line ends for a short word to land on; a bound pair rarely straddles a break, so bindings are cheap to keep.
- With justified text a long bound unit makes the spaces on its line stretch, so check the result in the narrowest column you ship.
- A chain of bindings (`Tom & Jerry & Co`, `Prof. Dr. K. Słoboda`) is one unit as long as the whole chain, so in a narrow column it moves to the next line as a block.
- Judge the page at two widths, the narrowest and the widest, not at one.

## What never to do

- **Do not bind a whole line.** A run of no-break spaces leaves the browser no place to break, and the text overflows its column. The rules bind pairs; a chain of operators (`one + two + three + four + five`) is the known case that can grow long ([limits.md](limits.md)). Do not add a no-break space between every word by hand.
- **Do not bind inside link text that wraps.** A long link or button label with no-break spaces cannot wrap and may overflow on a phone. Keep the link text short, or leave it unbound. The engine itself binds inside link text too, so disable the relevant rules for such blocks if that matters.
- **Do not use no-break spaces to fix a widow.** Use `text-wrap: pretty`.
- **Do not bind for a layout you have not looked at.** A binding that reads well in one column can be worst in another.

## A no-break space is a character

The engine writes U+00A0 into the text (and, before `; ! ?` in French, the narrow U+202F). It travels with the text: it is copied out, found by search in some tools and not in others, and screen readers read it as a space. It also stays where the text goes, which suits plain text, Markdown and email. A `<span style="white-space: nowrap">` is markup instead: it stays on the page, and copying gives ordinary spaces. Which is better for search, copy, hyphenation and `text-wrap: pretty` has not been researched; the string engine keeps the no-break space, and the backlog holds the question. Nothing here promises a `nowrap` mode.

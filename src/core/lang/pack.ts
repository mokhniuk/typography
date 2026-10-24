/** Quote marks of one nesting level. */
export type Level = readonly [open: string, close: string];

/**
 * Abbreviations whose parts must not be split by a line break. Short lists, not yet
 * read by a native speaker: add to them only from a style guide.
 *  - `together`: the parts of one abbreviation (z. B.);
 *  - `bind`: an abbreviation that stays with the word or number after it (Nr. 5, ul. Marszałkowska);
 *  - `page`: one that stays with a number only (S. 12);
 *  - `bare`: one written without a full stop that stays with the number after it (klo 17, nr 5).
 */
export type Abbreviations = {
  together?: readonly string[];
  bind?: readonly string[];
  page?: readonly string[];
  /** Written without a full stop (klo, nro, nr, lk): bound to a number after it, never to a word. */
  bare?: readonly string[];
};

/**
 * How a language writes numbers: the group separator (1 000 000) and the decimal marks it accepts,
 * the language's own first (`,`); a second one is read as a decimal mark too, never a separator
 * (`,.` in Switzerland: 4,16 and the franc amount Fr. 327.65).
 */
export type NumberFormat = { group: string; decimal: string };

/**
 * Everything the engine knows about one language. A language is "in" the package
 * when it is listed in `PACKS` (lang/index.ts); the engine is handed the pack of the
 * text (`Context.pack`), and no rule names a language: it reads a field of the pack.
 */
/** The dash that opens a line of dialogue, and whether the text follows it with no space. */
export type DialogueDash = { mark: '—' | '–'; attached?: boolean };

export type LangPack = {
  /** The language code (`en`, `uk`, ...). `Lang` is the union of every pack's code. */
  code: string;
  /** English name, with the native one in brackets when it differs: `German (Deutsch)`. */
  name: string;
  /** A sentence for the playground that shows quotes, dashes, a range and an arrow. */
  sample: string;
  /** Quote marks for each nesting level; a quotation nested deeper than listed starts over from the first. */
  quotes: readonly Level[];
  /** Quote marks of the literary register, where it differs from the display ones. */
  literary?: readonly Level[];
  /** One-letter words the language must not strand at the end of a line. Global, with one capture group. */
  orphans?: RegExp;
  /**
   * Short words (two or three letters: prepositions, conjunctions, articles) that travel with the
   * word after them, for the rule `space.short-word` (on by default since 0.14.0; `disable` turns
   * it off). Written in lower case; the rule also matches the capitalised form, and never binds more
   * than two words in a row. The read sources (PWN Poradnia for Polish, the ÚJČ advice service for
   * Czech) say such a word MAY stay at a line end in body text and must travel with what it belongs
   * to in a title; the entries themselves are editorial, not read from a list in a style guide.
   */
  shortWords?: readonly string[];
  abbreviations?: Abbreviations;
  /** The spaced dash that sets off a break in the sentence, when it is not an em dash. */
  sentenceDash?: string;
  /** The same in the literary register. */
  sentenceDashLiterary?: string;
  /** A no-break space between a number and a % typed against it (5% becomes 5 %). */
  percentSpace?: boolean;
  /** A no-break space between a number and a € typed after it (49€ becomes 49 €). A € before the number (€49) is never touched. */
  currencySpace?: boolean;
  /**
   * How a line of dialogue opens, where the language writes dialogue with a dash rather than in quotes:
   * the dash (`mark`) and, unless `attached` (Spanish), a no-break space after it. A paragraph that opens
   * with a hyphen or dash and a space is read as such a line, in both registers.
   */
  dialogueDash?: DialogueDash;
  /**
   * Quote pairs written the other way round (German »…« and ›…‹), as [open, close]. Read as the
   * usual «…», the « that ends one quotation and the » that opens the next would pair, so these
   * pairs are matched only where an opening mark stands at an opening position and a closing one
   * at a closing position. A guillemet pair listed here replaces the usual one of that shape.
   */
  turnedPairs?: readonly (readonly [open: string, close: string])[];
  /**
   * Words that start with an apostrophe for dropped letters, written without it: `em`, `til`.
   * The entry `n` also reads rock 'n' roll. Either case of the first letter matches.
   */
  elisions?: readonly string[];
  /**
   * Words that end in an apostrophe for dropped letters (Italian `po`, Maltese `ta`), written lower
   * case without it. After one of them, a ' or ’ followed by a space, punctuation or the end is an
   * apostrophe (po’), never a quotation mark. Either case of the first letter matches.
   */
  truncations?: readonly string[];
  /** Characters besides a space and a bracket that may stand before an opening quote mark (Spanish ¿ ¡). */
  openers?: string;
  /**
   * The language opens and closes a quotation with the same mark (Swedish ”…”). Carried and
   * documented only: no code reads it. Such a language works because a mark with no partner is read
   * by where it stands (an opening one after a space or the start, a closing one after a word).
   */
  sameMarkQuotes?: boolean;
  numbers?: NumberFormat;
  /**
   * The space the language sets before high punctuation (French): `colon` before `:`, `others` before
   * `; ! ?` (French: U+00A0 and U+202F). `space.high-punctuation` sets it where a letter or digit stands
   * before the mark, replacing a typed space; the opt-in `space.before-punctuation` keeps a space typed
   * before a mark that has one here, since the space is correct in the language, not a fault.
   */
  highPunctuation?: { colon?: string; others?: string };
  /**
   * A bare temperature with no degree sign (`20 C`) is read as one by `symbol.degree`, after a word
   * that is not a label (English; the label list is English). Without it, only a number with the
   * degree sign is read.
   */
  bareTemperature?: boolean;
  /** Whether a native speaker has read the pack. */
  reviewed: boolean;
};

/**
 * What a reader of a pack's page should know, kept out of the pack so that no bundle carries it: the
 * engine never reads it. One module per language in `lang/prose/`, read by the documentation
 * generators and the tests, and not shipped in the package.
 */
export type PackProse = {
  /** The style guides the pack was written from. */
  sources: readonly string[];
  /** What a reader should know: choices made, alternatives, doubts. */
  notes: string;
};

/**
 * Whether `value` is a language pack, read at run time where a value may be a code or a pack (a
 * config, an option): an object with a string `code`, a string `name` and a non-empty array of
 * `quotes` whose levels are pairs of strings. A shallower check would let `{ code: 'xx', quotes: [] }`
 * from a JSON config through, and the engine would then drop every quotation mark.
 */
export const isPack = (value: unknown): value is LangPack => {
  if (typeof value !== 'object' || value === null) return false;
  const { code, name, quotes } = value as { code?: unknown; name?: unknown; quotes?: unknown };
  return (
    typeof code === 'string' &&
    typeof name === 'string' &&
    Array.isArray(quotes) &&
    quotes.length > 0 &&
    quotes.every(
      (level) =>
        Array.isArray(level) &&
        level.length === 2 &&
        typeof level[0] === 'string' &&
        typeof level[1] === 'string',
    )
  );
};

/**
 * Typography for running text, kept apart from React so it can be tested.
 *
 * Source texts stay plain strings, the way the organisers write them: curly or
 * straight quotes, hyphens for dashes, nothing marked up. Two things happen to
 * them on the way to the page, and both live here:
 *
 *  - `typographic` applies the house rules below, in one pass; each rule has an id
 *    (see RULES in rules.ts) so it can be switched off (`disable`) or reported
 *    (`explain`);
 *  - `splitHangs` finds the opening punctuation that should hang in the margin
 *    when it starts a line, so the first letter lines up with the rest of the
 *    lines (see `hangPunctuation` in ../dom for the measuring).
 *
 * The rules `typographic` applies, and what it deliberately leaves alone:
 *
 *  - Quotation, by language and by level (see PROFILES): «…» with „…“ inside it
 *    for English and Ukrainian, »…« with ›…‹ inside for German, „…” with «…» for
 *    Polish, and so on. Source quotes may be curly,
 *    German-low, straight, or already «…».
 *  - Dashes: a spaced hyphen, en dash or em dash, or a double hyphen, is a break
 *    in the sentence and becomes a spaced em dash, with the space before it
 *    non-breaking so a line never starts with it. A hyphen or en dash between
 *    two numbers, spaced or not, is a range and becomes an unspaced en dash
 *    (21–26, 10:00–12:00); ascending numbers only, and not identifiers, partial
 *    dates (2026-10) or phone numbers. Not automated, because
 *    a program cannot tell East-West (en dash) from one-week (hyphen): pairs of
 *    equals are fixed in the text itself.
 *  - Registers (see Register): `display` is all of the above. `literary` changes the
 *    quotation of English to British, ‘outer “inner” outer’, and sets a Ukrainian
 *    dialogue line, opened by a dash, with an em dash and a non-breaking space. Other
 *    languages keep their display rules. Write a quotation in double quotes in the
 *    source: a plural possessive inside a single-quoted one (‘the dogs’ bone’) is
 *    read as the end of the quotation.
 *  - The typographic apostrophe ’, the ellipsis …, arrows → ←, and © ® ™ from
 *    (c) before a year, (C), (R) and (TM).
 *  - Non-breaking spaces where a break reads badly: after titles and initials
 *    (Prof. Dr. K. Słoboda), between a number and a short word after it (21
 *    September, 15 people, 5 %; a longer word stays free, so a chain of bound words
 *    never outgrows a narrow column), before «e.V.», after ©, and after one-letter
 *    words that a language must not strand at a line end.
 *  - An arrow keeps a non-breaking space against the word it belongs to («Read more →»,
 *    «← Back»), so it never wraps onto a line of its own.
 *  - Runs of spaces collapse to one.
 *  - Left alone: web addresses, emails and `code spans` come back exactly as written
 *    (so `12-15` in a path and `->` in a command survive), and a leading apostrophe
 *    on a year (’90s) does not stop a quotation from pairing.
 *
 * Hanging covers opening marks at the start of a line and closing marks at its
 * end (see `hangPieces` and `hangPunctuation` in ../dom).
 */

import type { TypographyConfig } from './config';
import { type DiffRun, diff } from './diff';
import { DEFAULT_RULES, type Rule, selectRules } from './rules';
import type { Context, Lang, QuoteStyle, Register } from './types';
import { shield } from './zones';

export type Change = {
  /** The id of the rule that made it. */
  rule: string;
  from: string;
  to: string;
};

export type TypographicOptions = {
  /** What the text is for; `display` unless a page says it is book-like text. */
  register?: Register | undefined;
  /** `language` (the default): the language's quote marks. `us`: “…” and ‘…’ in any language and register. */
  quoteStyle?: QuoteStyle | undefined;
  /** Whether `text` opens its paragraph. Only then can its first dash be a dialogue dash. */
  blockStart?: boolean | undefined;
  /** Rules to switch off: ids (`dash.range`) or groups (`space`). An unknown name throws. */
  disable?: readonly string[] | undefined;
  /** Rules to switch on that are off by default (`defaultOn: false`): ids or groups. An unknown name throws; so does one also in `disable`. */
  enable?: readonly string[] | undefined;
  /** The list of rules to run, in order, instead of the built-in `RULES` (see `addRule`). `disable` and `enable` are checked against it. */
  rules?: readonly Rule[] | undefined;
  /** Called with each change a rule makes, in the order the rules ran. Costs a diff per rule that changed anything. */
  onChange?: ((change: Change) => void) | undefined;
  /**
   * Characters the font cannot draw, as one string (`'⇒½¼¾−'`). Wherever a rule would insert one of
   * them, that one change is dropped and the text stays as it was typed, which reads better than a
   * box or another font's glyph; nothing is reported for it. Costs a diff per rule that changed
   * anything, so it is only paid when it is set. See `insertedCharacters` in glyphs.ts for what the
   * rules can insert, and the font checker for finding the characters a font lacks.
   */
  avoid?: string | undefined;
};

/**
 * `after`, with every change that brought in an avoided character undone. The text is compared with
 * the same word-level diff `explain` uses, so a "change" here is one stretch a rule rewrote: the
 * stretch is kept as it was typed if what arrived holds a character of `avoided`.
 */
export function keepAvoided(before: string, after: string, avoided: ReadonlySet<string>): string {
  let out = '';
  let from = '';
  let to = '';
  const settle = () => {
    out += [...to].some((ch) => avoided.has(ch)) ? from : to;
    from = '';
    to = '';
  };
  for (const run of diff(before, after)) {
    if (run.kind === 'same') {
      settle();
      out += run.text;
    } else if (run.kind === 'del') from += run.text;
    else to += run.text;
  }
  settle();
  return out;
}

/** Pairs each stretch that left with the stretch that arrived in its place. */
function changesOf(rule: string, runs: readonly DiffRun[]): Change[] {
  const out: Change[] = [];
  let open: Change | null = null;
  for (const run of runs) {
    if (run.kind === 'same') {
      open = null;
    } else {
      if (!open) {
        open = { rule, from: '', to: '' };
        out.push(open);
      }
      if (run.kind === 'del') open.from += run.text;
      else open.to += run.text;
    }
  }
  return out;
}

/**
 * Applies the house rules (see the header) to a plain string. Running it again on
 * its own output changes nothing, in every language (German reads its own »…« and
 * ›…‹ by where each mark stands, see `turnedPairs` on the pack and quotes.ts).
 */
export function typographic(
  text: string,
  lang: Lang = 'en',
  {
    register = 'display',
    quoteStyle = 'language',
    blockStart = true,
    disable,
    enable,
    rules: custom,
    onChange,
    avoid,
  }: TypographicOptions = {},
): string {
  const rules =
    disable?.length || enable?.length || custom
      ? selectRules({ rules: custom, disable, enable })
      : DEFAULT_RULES;
  const context: Context = { lang, register, quoteStyle, blockStart };
  const avoided = avoid ? new Set([...avoid]) : null;
  const [shielded, restore] = shield(text);
  let out = shielded;
  for (const rule of rules) {
    if (rule.when && !rule.when(out, context)) continue;
    const applied = rule.apply(out, context);
    const next = avoided && applied !== out ? keepAvoided(out, applied, avoided) : applied;
    if (onChange && next !== out) {
      for (const change of changesOf(rule.id, diff(out, next))) onChange(change);
    }
    out = next;
  }
  return restore(out);
}

/** The typeset text and every change that was made to it, with the rule that made it. */
export function explain(
  text: string,
  lang: Lang = 'en',
  options: Omit<TypographicOptions, 'onChange'> = {},
): { output: string; changes: Change[] } {
  const changes: Change[] = [];
  const output = typographic(text, lang, { ...options, onChange: (c) => changes.push(c) });
  return { output, changes };
}

/**
 * What the text, HTML, Markdown and rehype modes take besides the text: a `TypographyConfig` (so a
 * project's config spreads straight in, and a field added to it reaches every mode) and `onChange`.
 * `nbsp` is read by the HTML mode only and `hangAmount` by none of them.
 */
export type ModeOptions = TypographyConfig & {
  /** Called with each change made to the text. A block a mode cannot map back is not reported. */
  onChange?: ((change: Change) => void) | undefined;
};

/**
 * Typesets one block of text for a mode. Its changes are held back until `keep()`,
 * so a block the mode throws away (it cannot map the result back onto its markup)
 * reports nothing. Every option goes on to `typographic` as it is, so a new one needs no change here.
 */
export function typesetBlock(
  joined: string,
  options: ModeOptions,
): { text: string; keep: () => void } {
  const found: Change[] = [];
  const { onChange } = options;
  const text = typographic(joined, options.lang, {
    ...options,
    blockStart: true,
    onChange: onChange ? (change) => found.push(change) : undefined,
  });
  return {
    text,
    keep: () => {
      for (const change of found) onChange?.(change);
    },
  };
}

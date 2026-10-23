/**
 * What each rule can put into the text that the writer did not type. A font that lacks one of these
 * draws a box or lets another font draw it, and the text as typed would have been better, so two
 * things read this table: the `avoid` option (see `TypographyConfig`), which lists the characters a
 * font cannot draw and makes the engine keep the original text wherever a rule would insert one, and
 * the font checker, which tells a reader which of them a font has.
 *
 * The quote marks and the digit separator come from the language packs, so a new pack is covered
 * without a change here. `src/core/glyphs.test.ts` fails if a rule has no entry, and proves that a
 * rule given its own characters to avoid changes nothing.
 */

import { type LangPack, PACKS } from './lang/index.ts';
import { RULE_IDS } from './rules.ts';
import type { Lang } from './types.ts';
import { NBSP } from './types.ts';

/** The quote marks of the `us` and `guillemets` styles, which any language can be set in. */
const STYLE_QUOTES = '“”‘’«»„‚';

/** The characters a rule inserts whatever the language. A rule that only removes text has none. */
const FIXED: Readonly<Record<string, string>> = {
  apostrophe: '’',
  ellipsis: '…',
  'space.before-punctuation': '',
  'space.after-comma': '',
  'punctuation.double': '',
  arrow: '→←',
  'symbol.implies': '⇒',
  'symbol.legal': '©®™',
  'phone.bind': `${NBSP}‑`,
  'dash.range': '–',
  'symbol.plusminus': '±',
  'symbol.minus': '−',
  'symbol.multiply': '×',
  'symbol.fraction': '½¼¾',
  'space.collapse': '',
  'space.title': NBSP,
  'space.initial': NBSP,
  'space.abbreviation': NBSP,
  'space.number': NBSP,
  'space.percent': NBSP,
  'symbol.degree': `°${NBSP}`,
  'space.section': NBSP,
  'space.association': NBSP,
  'space.copyright': NBSP,
  'space.operator': NBSP,
  'space.short-word': NBSP,
  'space.orphan': NBSP,
  'space.arrow': NBSP,
  'space.trailing': '',
};

/** Every character of `text`, each once, in the order they first appear. */
const unique = (text: string): string => [...new Set([...text])].join('');

const packsOf = (lang?: Lang): readonly LangPack[] =>
  lang ? (PACKS as readonly LangPack[]).filter((pack) => pack.code === lang) : PACKS;

/** The quote marks of a language (both registers), or of every language. */
function quoteMarks(lang?: Lang): string {
  const marks = packsOf(lang).flatMap((pack) =>
    [...pack.quotes, ...(pack.literary ?? []), ...(pack.turnedPairs ?? [])].flat(),
  );
  return unique(marks.join('') + STYLE_QUOTES);
}

/** The dashes a language sets for a break in the sentence and for a line of dialogue. */
function dashes(lang?: Lang): string {
  const packs = packsOf(lang);
  return unique(
    `—${NBSP}${packs
      .map(
        (pack) =>
          `${pack.sentenceDash ?? ''}${pack.sentenceDashLiterary ?? ''}${pack.dialogueDash?.mark ?? ''}`,
      )
      .join('')}`,
  );
}

/** The digit separators `number.group` writes. */
const separators = (lang?: Lang): string =>
  unique(
    packsOf(lang)
      .map((pack) => pack.numbers?.group ?? '')
      .join(''),
  );

/**
 * The characters each rule can insert, by rule id. Without `lang` it is every language's marks at
 * once (what the docs show); with one, only that language's.
 */
export function ruleGlyphs(lang?: Lang): Readonly<Record<string, string>> {
  return {
    ...FIXED,
    quote: quoteMarks(lang),
    'dash.dialogue': dashes(lang),
    'dash.sentence': dashes(lang),
    'number.group': separators(lang),
  };
}

/**
 * Every character any rule can insert (`lang`: in that language only), the no-break space included.
 * The font checker lists these; the `avoid` option takes the ones a font cannot draw.
 */
export const insertedCharacters = (lang?: Lang): string =>
  unique(RULE_IDS.map((id) => ruleGlyphs(lang)[id] ?? '').join(''));

/**
 * The same without the no-break space, which is the marks a font draws. Measuring a space against a
 * fallback font says nothing (both are blank), so the font-aware pass only ever tests these.
 */
export const insertedGlyphs = (lang?: Lang): string =>
  insertedCharacters(lang).replaceAll(NBSP, '');

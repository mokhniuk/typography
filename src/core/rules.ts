import { dashRange, dashSentence, dialogue } from './dashes';
import { apostrophe, arrows, ellipsis, legal, minus, multiply } from './marks';
import { SENTENCE_DASH, SENTENCE_DASH_LITERARY } from './profiles';
import { quotes } from './quotes';
import {
  abbreviations,
  arrowSpace,
  association,
  collapse,
  copyright,
  initials,
  numberUnit,
  orphans,
  titles,
  unitSymbol,
} from './spaces';
import type { Context } from './types';

/** One step of the typography, with a name that can be switched off or reported. */
export type Rule = {
  /** `group.name`, or a single word for a rule that stands alone. */
  id: string;
  about: string;
  apply: (text: string, context: Context) => string;
};

/** The rules, in the order they run. */
export const RULES: readonly Rule[] = [
  {
    id: 'quote',
    about: 'Quotation marks by language, register and nesting level, from any source style',
    apply: (text, { lang, register }) => quotes(text, lang, register),
  },
  {
    id: 'apostrophe',
    about: "A straight ' in a word or before a year becomes ’",
    apply: apostrophe,
  },
  { id: 'ellipsis', about: '... becomes …', apply: ellipsis },
  { id: 'arrow', about: '-> and <- become → and ←', apply: arrows },
  { id: 'symbol.legal', about: '(c) before a year, (C), (R) and (TM) become © ® ™', apply: legal },
  {
    id: 'dash.dialogue',
    about:
      'A Ukrainian dialogue line (literary register) opens with an em dash and a no-break space',
    apply: (text, { lang, register, blockStart }) =>
      register === 'literary' && lang === 'uk' && blockStart ? dialogue(text) : text,
  },
  {
    id: 'dash.range',
    about: 'A hyphen between two numbers (21-26, 10:00-12:00) becomes an unspaced en dash',
    apply: dashRange,
  },
  {
    id: 'dash.sentence',
    about:
      'A spaced hyphen, dash or double hyphen becomes a spaced dash (em; en in German and literary British English), no-break before it',
    apply: (text, { lang, register }) =>
      dashSentence(
        text,
        (register === 'literary' ? SENTENCE_DASH_LITERARY[lang] : undefined) ??
          SENTENCE_DASH[lang] ??
          '—',
      ),
  },
  {
    id: 'symbol.minus',
    about: 'A hyphen before a digit (-5) becomes a minus sign (−5)',
    apply: minus,
  },
  {
    id: 'symbol.multiply',
    about: 'The letter x between numbers (1920x1080, 3 x 4) becomes ×',
    apply: multiply,
  },
  { id: 'space.collapse', about: 'A run of spaces becomes one', apply: collapse },
  { id: 'space.title', about: 'No-break space after Prof., Dr., Mr. …', apply: titles },
  { id: 'space.initial', about: 'No-break space after an initial (K. Słoboda)', apply: initials },
  {
    id: 'space.abbreviation',
    about:
      'Parts of an abbreviation stay together (z. B.), and Nr., ul., S. stay with what follows',
    apply: (text, { lang }) => abbreviations(text, lang),
  },
  {
    id: 'space.number',
    about:
      'No-break space between a number and a short word or unit after it, up to nine letters (21 September, 5 %)',
    apply: numberUnit,
  },
  {
    id: 'space.percent',
    about: 'German and French: a no-break space between a number and % or € (5 %, 49 €)',
    apply: (text, { lang }) => unitSymbol(text, lang),
  },
  { id: 'space.association', about: 'No-break space before e.V.', apply: association },
  { id: 'space.copyright', about: 'No-break space after ©', apply: copyright },
  {
    id: 'space.orphan',
    about: 'No-break space after a one-letter word the language must not strand at a line end',
    apply: (text, { lang }) => orphans(text, lang),
  },
  { id: 'space.arrow', about: 'No-break space before → and after ←', apply: arrowSpace },
];

export const RULE_IDS: readonly string[] = RULES.map((rule) => rule.id);

/**
 * The rules that remain when `disable` is applied. An entry is a rule id (`dash.range`)
 * or a group (`space`, or `space.*`), which switches off every rule in it. An entry
 * that names nothing is an error: a typo must not pass for "everything stays on".
 */
export function without(disable: readonly string[]): readonly Rule[] {
  const off = new Set<string>();
  for (const entry of disable) {
    const name = entry.replace(/\.\*$/, '');
    const matches = RULE_IDS.filter((id) => id === name || id.startsWith(`${name}.`));
    if (!matches.length) {
      throw new Error(`Unknown typography rule "${entry}". Rules: ${RULE_IDS.join(', ')}`);
    }
    for (const id of matches) off.add(id);
  }
  return RULES.filter((rule) => !off.has(rule.id));
}

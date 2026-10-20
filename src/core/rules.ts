import { dashRange, dashSentence, dialogue } from './dashes';
import { apostrophe, arrows, ellipsis, legal, minus, multiply } from './marks';
import { PACK, PACKS } from './lang';
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
  /** Whether the rule runs unless it is switched off. `false`: it runs only when named in `enable`. Default `true`. */
  defaultOn?: boolean;
  apply: (text: string, context: Context) => string;
};

/** Short English names of some packs, joined for a description: `German and French`. */
function names(packs: readonly { name: string }[]): string {
  const list = packs.map((pack) => pack.name.split(' (')[0] ?? pack.name);
  return list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list.at(-1)}` : (list[0] ?? '');
}

/**
 * The rules, in the order they run.
 *
 * Reserved places. Rules planned for the opt-in set and for digit grouping go in these places, so
 * that two people adding rules do not choose different orders (src/core/rules-order.test.ts holds
 * the built-in order and checks each of these once the rule exists). Do not add them here ahead
 * of their implementation.
 *
 *  - `number.group` goes after `dash.dialogue` and before `dash.range`, hence before
 *    `space.number`: it works on a bare number, and a spaced thousands group (1 000) must be
 *    one number by the time the number rules look at it.
 *  - `symbol.fraction` goes before `space.number`, after `symbol.multiply`, so 1/2 is ½ before a
 *    unit is bound to it.
 *  - `symbol.plusminus` goes immediately before `symbol.minus`: +- becomes ± before a hyphen
 *    ahead of a digit is read as a minus.
 *  - the punctuation-space rules (`space.before-punctuation`, `space.after-comma`,
 *    `punctuation.double`) go immediately after `ellipsis`: a ... is already … when they run, and
 *    they run before any rule that binds a space.
 *  - `symbol.degree` goes after `space.number` (and `space.percent`): the number rules bind the
 *    degree sign's space first, and this rule only tidies what is left.
 *  - `space.trailing` is the last rule, so nothing runs after it and it cannot be undone by one.
 */
export const RULES: readonly Rule[] = [
  {
    id: 'quote',
    about: 'Quotation marks by language, register and nesting level, from any source style',
    apply: (text, { lang, register, quoteStyle }) => quotes(text, lang, register, quoteStyle),
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
      register === 'literary' && PACK[lang].dialogueDash && blockStart ? dialogue(text) : text,
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
    about: `${names(PACKS.filter((pack) => 'percentSpace' in pack && pack.percentSpace))}: a no-break space between a number and % or € (5 %, 49 €)`,
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

/** The rules that run when nothing is switched on or off: every rule that is not `defaultOn: false`. */
export const DEFAULT_RULES: readonly Rule[] = RULES.filter((rule) => rule.defaultOn !== false);

/** The ids of `list` that an entry names: an id, or a group (`space`, or `space.*`). An entry that names nothing is an error. */
function named(list: readonly Rule[], entries: readonly string[]): Set<string> {
  const ids = new Set<string>();
  for (const entry of entries) {
    const name = entry.replace(/\.\*$/, '');
    const matches = list.filter((rule) => rule.id === name || rule.id.startsWith(`${name}.`));
    if (!matches.length) {
      throw new Error(
        `Unknown typography rule "${entry}". Rules: ${list.map((rule) => rule.id).join(', ')}`,
      );
    }
    for (const rule of matches) ids.add(rule.id);
  }
  return ids;
}

/**
 * The rules that run, in order. `rules` is the list in use (the built-in `RULES` unless given).
 * An entry of `disable` or `enable` is a rule id (`dash.range`) or a group (`space`, or `space.*`),
 * checked against that list, not the built-in one; an entry that names nothing is an error, so a
 * typo cannot pass for "everything stays on". A rule with `defaultOn: false` runs only if `enable`
 * names it. A rule named by both `disable` and `enable` is an error: there is no silent winner.
 */
export function selectRules({
  rules = RULES,
  disable = [],
  enable = [],
}: {
  rules?: readonly Rule[] | undefined;
  disable?: readonly string[] | undefined;
  enable?: readonly string[] | undefined;
} = {}): readonly Rule[] {
  const off = named(rules, disable);
  const on = named(rules, enable);
  for (const id of on) {
    if (off.has(id)) throw new Error(`Typography rule "${id}" is in both disable and enable`);
  }
  return rules.filter((rule) => !off.has(rule.id) && (rule.defaultOn !== false || on.has(rule.id)));
}

/**
 * The rules that remain when `disable` is applied to the built-in list: an entry is a rule id
 * (`dash.range`) or a group (`space`, or `space.*`). An entry that names nothing is an error.
 */
export function without(disable: readonly string[]): readonly Rule[] {
  return selectRules({ disable });
}

/** Where `addRule` puts a rule: next to another one, or at an end of the list. */
export type RulePosition =
  | { before: string }
  | { after: string }
  | { first: true }
  | { last: true };

/**
 * A new list with `rule` added at `position`; `list` is not changed, and neither is `RULES`.
 * An anchor that is not in the list, or a rule whose id is already there, is an error.
 */
export function addRule(
  list: readonly Rule[],
  rule: Rule,
  position: RulePosition,
): readonly Rule[] {
  if (list.some((other) => other.id === rule.id)) {
    throw new Error(`Typography rule "${rule.id}" is already in the list`);
  }
  if ('first' in position) return [rule, ...list];
  if ('last' in position) return [...list, rule];
  const anchor = 'before' in position ? position.before : position.after;
  const at = list.findIndex((other) => other.id === anchor);
  if (at < 0) {
    throw new Error(
      `Unknown typography rule "${anchor}". Rules: ${list.map((other) => other.id).join(', ')}`,
    );
  }
  const index = 'before' in position ? at : at + 1;
  return [...list.slice(0, index), rule, ...list.slice(index)];
}

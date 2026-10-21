import { dashRange, dashSentence, dialogue } from './dashes';
import {
  afterComma,
  beforePunctuation,
  degrees,
  doubleMarks,
  fractions,
  implies,
  plusMinus,
  trailingSpace,
} from './extra';
import { PACK, PACKS } from './lang';
import { apostrophe, arrows, ellipsis, legal, minus, multiply } from './marks';
import { groupNumbers } from './numbers';
import { ORPHANS, SENTENCE_DASH, SENTENCE_DASH_LITERARY } from './profiles';
import { quotes } from './quotes';
import {
  abbreviations,
  arrowSpace,
  association,
  collapse,
  copyright,
  initials,
  mayAbbreviate,
  numberUnit,
  orphans,
  titles,
  unitSymbol,
} from './spaces';
import type { Context } from './types';

/**
 * Why a reader would want a rule, as opposed to its id, which names the mechanism:
 * - `tradition`: the conventions of setting prose (quotes, dashes, the ellipsis, punctuation and
 *   the spaces around it, what must not be split at a line end);
 * - `symbols`: signs typed as ASCII stand-ins that have a character of their own (arrows, ©, ®, ™);
 * - `math`: signs of arithmetic and logic (minus, ×, ±, fractions, ⇒);
 * - `data`: numbers with what they measure: groups of digits, ranges, units, currencies, dates.
 */
export const RULE_CATEGORIES = ['tradition', 'symbols', 'math', 'data'] as const;
export type RuleCategory = (typeof RULE_CATEGORIES)[number];

/** One step of the typography, with a name that can be switched off or reported. */
export type Rule = {
  /** `group.name`, or a single word for a rule that stands alone. */
  id: string;
  about: string;
  /**
   * What the rule is for (see `RULE_CATEGORIES`), shown by `typo --rules`, `docs/rules.md` and the
   * playground. Every built-in rule has one; a custom rule may leave it out. It does not change what
   * the rule does, and `disable` and `enable` still take ids and groups of ids.
   */
  category?: RuleCategory;
  /** Whether the rule runs unless it is switched off. `false`: it runs only when named in `enable`. Default `true`. */
  defaultOn?: boolean;
  /**
   * An optional cheap test of the text. If it returns `false`, `apply` MUST return the text unchanged,
   * so the rule is skipped, and no change is recorded (`onChange` and `explain` only see rules that
   * changed something). A rule without `when` always runs, as every custom rule does.
   * `rules.when.test.ts` checks it on every built-in rule that has one.
   */
  when?: (text: string, context: Context) => boolean;
  apply: (text: string, context: Context) => string;
};

const has = (needle: string) => (text: string) => text.includes(needle);
const hasAny =
  (...needles: string[]) =>
  (text: string) =>
    needles.some((needle) => text.includes(needle));

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
    category: 'tradition',
    about: 'Quotation marks by language, register and nesting level, from any source style',
    apply: (text, { lang, register, quoteStyle }) => quotes(text, lang, register, quoteStyle),
  },
  {
    id: 'apostrophe',
    category: 'tradition',
    about: "A straight ' in a word or before a year becomes ’",
    when: has("'"),
    apply: apostrophe,
  },
  {
    id: 'ellipsis',
    category: 'tradition',
    about: '... becomes …',
    when: has('...'),
    apply: ellipsis,
  },
  {
    id: 'space.before-punctuation',
    category: 'tradition',
    about: 'Removes a space before , . ; : ! ? ) (French keeps the space before : ; ! ?)',
    defaultOn: false,
    when: hasAny(' ', '\t'),
    apply: (text, { lang }) => beforePunctuation(text, lang),
  },
  {
    id: 'space.after-comma',
    category: 'tradition',
    about: 'A comma followed directly by a letter gets a space (a,b becomes a, b)',
    defaultOn: false,
    when: has(','),
    apply: afterComma,
  },
  {
    id: 'punctuation.double',
    category: 'tradition',
    about: 'A run of ! or ? becomes one mark (Wow!!! becomes Wow!); ?! and !? stay',
    defaultOn: false,
    when: hasAny('!!', '??'),
    apply: doubleMarks,
  },
  { id: 'arrow', category: 'symbols', about: '-> and <- become → and ←', apply: arrows },
  {
    id: 'symbol.implies',
    category: 'math',
    about: '=> becomes ⇒',
    defaultOn: false,
    when: has('=>'),
    apply: implies,
  },
  {
    id: 'symbol.legal',
    category: 'symbols',
    about: '(c) before a year, (C), (R) and (TM) become © ® ™',
    apply: legal,
  },
  {
    id: 'dash.dialogue',
    category: 'tradition',
    about:
      'A paragraph opening with a dash is a line of dialogue, in languages that write dialogue that way: their dash and a no-break space (Ukrainian — Привіт)',
    apply: (text, { lang, blockStart }) => {
      const style = PACK[lang].dialogueDash;
      return style && blockStart ? dialogue(text, style) : text;
    },
  },
  {
    id: 'number.group',
    category: 'data',
    about:
      'Digits of an integer of five or more are grouped in threes with the language separator (1,000,000; 1 000 000)',
    defaultOn: false,
    apply: (text, { lang }) => groupNumbers(text, lang),
  },
  {
    id: 'dash.range',
    category: 'data',
    about: 'A hyphen between two numbers (21-26, 10:00-12:00) becomes an unspaced en dash',
    when: hasAny('-', '–'),
    apply: dashRange,
  },
  {
    id: 'dash.sentence',
    category: 'tradition',
    about:
      'A spaced hyphen, dash or double hyphen becomes a spaced dash (em; en in German and literary British English), no-break before it',
    when: hasAny('-', '–', '—'),
    apply: (text, { lang, register }) =>
      dashSentence(
        text,
        (register === 'literary' ? SENTENCE_DASH_LITERARY[lang] : undefined) ??
          SENTENCE_DASH[lang] ??
          '—',
      ),
  },
  {
    id: 'symbol.plusminus',
    category: 'math',
    about: '+- before a digit becomes ± (+-5 becomes ±5)',
    defaultOn: false,
    when: has('+-'),
    apply: plusMinus,
  },
  {
    id: 'symbol.minus',
    category: 'math',
    about: 'A hyphen before a digit (-5) becomes a minus sign (−5)',
    when: has('-'),
    apply: minus,
  },
  {
    id: 'symbol.multiply',
    category: 'math',
    about: 'The letter x between numbers (1920x1080, 3 x 4) becomes ×',
    when: has('x'),
    apply: multiply,
  },
  {
    id: 'symbol.fraction',
    category: 'math',
    about: '1/2, 1/4 and 3/4 become ½ ¼ ¾, as whole numbers only (not 11/2, 1/20 or a date)',
    defaultOn: false,
    when: has('/'),
    apply: fractions,
  },
  {
    id: 'space.collapse',
    category: 'tradition',
    about: 'A run of spaces becomes one',
    when: has('  '),
    apply: collapse,
  },
  {
    id: 'space.title',
    category: 'tradition',
    about: 'No-break space after Prof., Dr., Mr. …',
    when: has('.'),
    apply: titles,
  },
  {
    id: 'space.initial',
    category: 'tradition',
    about: 'No-break space after an initial (K. Słoboda)',
    when: has('.'),
    apply: initials,
  },
  {
    id: 'space.abbreviation',
    category: 'tradition',
    about:
      'Parts of an abbreviation stay together (z. B.), and Nr., ul., S. stay with what follows',
    when: (text, { lang }) => mayAbbreviate(text, lang),
    apply: (text, { lang }) => abbreviations(text, lang),
  },
  {
    id: 'space.number',
    category: 'data',
    about:
      'No-break space between a number and a short word or unit after it, up to nine letters (21 September, 5 %)',
    apply: numberUnit,
  },
  {
    id: 'space.percent',
    category: 'data',
    about: `${names(PACKS.filter((pack) => 'percentSpace' in pack && pack.percentSpace))}: a no-break space between a number and % or € (5 %, 49 €)`,
    when: (text, { lang }) => !!PACK[lang].percentSpace && hasAny('%', '€')(text),
    apply: (text, { lang }) => unitSymbol(text, lang),
  },
  {
    id: 'symbol.degree',
    category: 'data',
    about: '20 C, 20°C and 20 °C become 20 °C, with a no-break space before the unit',
    defaultOn: false,
    when: hasAny('C', 'F'),
    apply: (text, { lang }) => degrees(text, lang),
  },
  {
    id: 'space.association',
    category: 'tradition',
    about: 'No-break space before e.V.',
    when: has('e.V.'),
    apply: association,
  },
  {
    id: 'space.copyright',
    category: 'symbols',
    about: 'No-break space after ©',
    when: has('©'),
    apply: copyright,
  },
  {
    id: 'space.orphan',
    category: 'tradition',
    about: 'No-break space after a one-letter word the language must not strand at a line end',
    when: (_text, { lang }) => ORPHANS[lang] !== undefined,
    apply: (text, { lang }) => orphans(text, lang),
  },
  {
    id: 'space.arrow',
    category: 'symbols',
    about: 'No-break space before → and after ←',
    when: hasAny('→', '←'),
    apply: arrowSpace,
  },
  {
    id: 'space.trailing',
    category: 'tradition',
    about: 'Spaces and tabs at the end of a line are removed',
    defaultOn: false,
    when: hasAny(' ', '\t'),
    apply: trailingSpace,
  },
] satisfies readonly (Rule & { category: RuleCategory })[];

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
  const seen = new Set<string>();
  for (const rule of rules) {
    if (seen.has(rule.id)) throw new Error(`Typography rule "${rule.id}" is already in the list`);
    seen.add(rule.id);
  }
  const off = named(rules, disable);
  const on = named(rules, enable);
  // Enabling a rule that is on already does nothing, so a group that holds a rule `disable` names is no
  // clash. One does arise for a rule `enable` could turn on, and for a rule both lists name by its own id.
  const literally = (list: readonly string[], id: string) => list.some((name) => name === id);
  for (const rule of rules) {
    const turnedOn = rule.defaultOn === false && on.has(rule.id);
    if (
      off.has(rule.id) &&
      (turnedOn || (literally(enable, rule.id) && literally(disable, rule.id)))
    ) {
      throw new Error(`Typography rule "${rule.id}" is in both disable and enable`);
    }
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

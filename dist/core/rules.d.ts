import type { Context } from './types.js';
/**
 * Why a reader would want a rule, as opposed to its id, which names the mechanism:
 * - `tradition`: the conventions of setting prose (quotes, dashes, the ellipsis, punctuation and
 *   the spaces around it, what must not be split at a line end);
 * - `symbols`: signs typed as ASCII stand-ins that have a character of their own (arrows, ©, ®, ™);
 * - `math`: signs of arithmetic and logic (minus, ×, ±, fractions, ⇒);
 * - `data`: numbers with what they measure: groups of digits, ranges, units, currencies, dates.
 */
export declare const RULE_CATEGORIES: readonly ['tradition', 'symbols', 'math', 'data'];
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
     * Whether the rule's changes belong together where `avoid` is set: if one of them would bring in a
     * character the font cannot draw, every change of this rule is dropped for that text, not only
     * that one. The quotation rule sets it, because an opening and a closing mark are two changes and
     * a quotation with one mark converted and one as typed is worse than one left alone.
     */
    avoidWhole?: boolean;
    /**
     * An optional cheap test of the text. If it returns `false`, `apply` MUST return the text unchanged,
     * so the rule is skipped, and no change is recorded (`onChange` and `explain` only see rules that
     * changed something). A rule without `when` always runs, as every custom rule does.
     * `rules.when.test.ts` checks it on every built-in rule that has one.
     */
    when?: (text: string, context: Context) => boolean;
    apply: (text: string, context: Context) => string;
};
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
 *  - `phone.bind` goes before `number.group`, hence before `dash.range` and `symbol.minus`: a phone
 *    number's groups must not be grouped as digits, and its hyphens are U+2011 before any rule can
 *    read them as a range or a minus sign.
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
export declare const RULES: readonly Rule[];
export declare const RULE_IDS: readonly string[];
/** The rules that run when nothing is switched on or off: every rule that is not `defaultOn: false`. */
export declare const DEFAULT_RULES: readonly Rule[];
/**
 * The rules that run, in order. `rules` is the list in use (the built-in `RULES` unless given).
 * An entry of `disable` or `enable` is a rule id (`dash.range`) or a group (`space`, or `space.*`),
 * checked against that list, not the built-in one; an entry that names nothing is an error, so a
 * typo cannot pass for "everything stays on". A rule with `defaultOn: false` runs only if `enable`
 * names it. A rule named by both `disable` and `enable` is an error: there is no silent winner.
 */
export declare function selectRules({ rules, disable, enable, }?: {
    rules?: readonly Rule[] | undefined;
    disable?: readonly string[] | undefined;
    enable?: readonly string[] | undefined;
}): readonly Rule[];
/**
 * The rules that remain when `disable` is applied to the built-in list: an entry is a rule id
 * (`dash.range`) or a group (`space`, or `space.*`). An entry that names nothing is an error.
 */
export declare function without(disable: readonly string[]): readonly Rule[];
/** Where `addRule` puts a rule: next to another one, or at an end of the list. */
export type RulePosition = {
    before: string;
} | {
    after: string;
} | {
    first: true;
} | {
    last: true;
};
/**
 * A new list with `rule` added at `position`; `list` is not changed, and neither is `RULES`.
 * An anchor that is not in the list, or a rule whose id is already there, is an error.
 */
export declare function addRule(list: readonly Rule[], rule: Rule, position: RulePosition): readonly Rule[];

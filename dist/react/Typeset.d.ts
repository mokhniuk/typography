import { type Change, type Lang, type QuoteStyle, type Register, type Rule, type TypographyConfig } from '../core/index.js';
import { type TypographySetting } from './context.js';
/** Sets `text` with the language, register and rules of `setting`; what `Typeset` renders. */
export declare function typesetFor(text: string, setting: TypographySetting, atStart: boolean): string;
/**
 * A plain string, typeset in the language and register of the surrounding `TypographyRoot`. A value
 * is taken from its own prop, then from `config`, then from the root.
 */
export declare function Typeset({ text, atStart, config, lang, register, quoteStyle, disable, enable, rules, onChange, avoid, }: {
    text: string;
    /** Whether `text` opens its paragraph; false for a string that continues one after an element. */
    atStart?: boolean | undefined;
    /** A config (see `TypographyConfig`) that overrides the root's values; its own props beat it. Pass a constant. */
    config?: TypographyConfig | undefined;
    /** Overrides the language of the surrounding `TypographyRoot`. */
    lang?: Lang | undefined;
    /** Overrides the register of the surrounding `TypographyRoot`. */
    register?: Register | undefined;
    /** Overrides the quote style of the surrounding `TypographyRoot`. */
    quoteStyle?: QuoteStyle | undefined;
    /** Overrides the rules switched off by the surrounding `TypographyRoot`. Pass a constant, not an inline array. */
    disable?: readonly string[] | undefined;
    /** Overrides the opt-in rules of the surrounding `TypographyRoot`. Pass a constant, not an inline array. */
    enable?: readonly string[] | undefined;
    /** Overrides the rule list of the surrounding `TypographyRoot`. Pass a constant, not an inline array. */
    rules?: readonly Rule[] | undefined;
    /** Overrides the change listener of the surrounding `TypographyRoot`. Pass a stable function (`useCallback`). */
    onChange?: ((change: Change) => void) | undefined;
    /** Characters the font cannot draw; overrides the root's list (its own and the measured ones). */
    avoid?: string | undefined;
}): import("react").JSX.Element;

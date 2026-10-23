import { type ReactNode, type RefObject } from 'react';
import type { Change, Lang, LangPack, QuoteStyle, Register, Rule, TypographyConfig } from '../core/index.js';
/**
 * Sends the hanging pass inline, to run on the parent of this element as the page is
 * parsed (see `hangScript`). Put it last inside the element that holds the text. On the
 * server and while the page hydrates it renders the script; on any later client render
 * it renders nothing, because scripts rendered by React are never run.
 */
export declare function HangScript(): import("react").JSX.Element | null;
/** Runs the hanging pass over everything under `root`, for as long as it is mounted. */
export declare function useHangingPunctuation(root: RefObject<HTMLElement | null>): void;
/**
 * The characters the font of `root` cannot draw, measured once the fonts of the page have loaded
 * (see `missingGlyphs` in ../dom). Empty on the server and until the measure is made, so the first
 * paint is the ordinary typeset text and only a real gap in the font changes it.
 *
 * Every language's marks are measured, not only the root's: a `Typeset` under this root may set a
 * language of its own, and a mark no rule inserts in the language in use costs nothing to avoid.
 * Pass `lang` to measure one language's marks only.
 */
export declare function useMissingGlyphs(root: RefObject<HTMLElement | null>, on: boolean, lang?: Lang | LangPack): string;
/**
 * Wraps a page so its text is typeset: sets the language and register every
 * `Typeset` under it falls back to, and hangs opening punctuation wherever a line
 * starts with it. A value is taken from the root's own prop, then from `config`, then
 * from an outer root.
 *
 * On a prerendered page it also sends the hanging pass inline (`hangScript`), so the
 * marks hang as the page is parsed and do not move when the bundle has loaded. Turn
 * that off with `early={false}`, for a page with a content security policy that
 * forbids inline scripts.
 */
export declare function TypographyRoot({ children, config, lang, register, quoteStyle, disable, enable, rules, onChange, avoid, avoidMissing, hangAmount, early, }: {
    children: ReactNode;
    /** A project's config (see `TypographyConfig`); a prop given here beats it. Pass a constant. `nbsp` is not read. */
    config?: TypographyConfig | undefined;
    /** A language code or a pack (pass a constant). */
    lang?: Lang | LangPack | undefined;
    register?: Register | undefined;
    /** `language` (the default) or `us`: “…” and ‘…’ in any language. */
    quoteStyle?: QuoteStyle | undefined;
    /** Rules to switch off: ids or groups; pass a constant, not an inline array. */
    disable?: readonly string[] | undefined;
    /** Rules to switch on that are off by default; pass a constant, not an inline array. */
    enable?: readonly string[] | undefined;
    /** The list of rules to run instead of the built-in one; pass a constant. */
    rules?: readonly Rule[] | undefined;
    /** Called with each change made to a text under this root; pass a stable function (`useCallback`). */
    onChange?: ((change: Change) => void) | undefined;
    /** Characters the font cannot draw: a rule that would insert one leaves the text as typed. */
    avoid?: string | undefined;
    /**
     * Whether to add the characters the page's own font cannot draw to `avoid`, measured in the
     * browser (`true` by default). They are measured once the fonts have loaded, so a server-rendered
     * page is typeset as usual first and only a real gap in the font changes a text. Set it to `false`
     * for a page that must render the same everywhere, or to name the characters yourself with `avoid`.
     */
    avoidMissing?: boolean | undefined;
    /** How far marks hang, 0 to 1: set as `--hang-amount` on the root's div. Left out, it is inherited through CSS. */
    hangAmount?: number | undefined;
    early?: boolean;
}): import("react").JSX.Element;

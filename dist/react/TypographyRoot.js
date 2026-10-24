'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, } from 'react';
import { insertedGlyphs } from '../core/index.js';
import { hangPunctuation, hangScript, missingIn } from '../dom/index.js';
import { TypographyContext } from './context.js';
/**
 * Sends the hanging pass inline, to run on the parent of this element as the page is
 * parsed (see `hangScript`). Put it last inside the element that holds the text. On the
 * server and while the page hydrates it renders the script; on any later client render
 * it renders nothing, because scripts rendered by React are never run.
 */
export function HangScript() {
    const prerendering = useServerRender();
    if (!prerendering)
        return null;
    // The function's source is printed by the server build and by the client build, and a bundler
    // formats it differently (comments, whitespace); the script has already run, so the text is not read again.
    // biome-ignore lint/security/noDangerouslySetInnerHtml: the source is this package's own function, not user input
    return _jsx("script", { suppressHydrationWarning: true, dangerouslySetInnerHTML: { __html: hangScript() } });
}
/** Runs the hanging pass over everything under `root`, for as long as it is mounted. */
export function useHangingPunctuation(root) {
    useLayoutEffect(() => {
        const el = root.current;
        return el ? hangPunctuation(el) : undefined;
    }, [root]);
}
const subscribe = () => () => { };
/**
 * The characters the font of `root` cannot draw, measured once the fonts of the page have loaded
 * (see `missingGlyphs` in ../dom). Empty on the server and until the measure is made, so the first
 * paint is the ordinary typeset text and only a real gap in the font changes it.
 *
 * Every language's marks are measured, not only the root's: a `Typeset` under this root may set a
 * language of its own, and a mark no rule inserts in the language in use costs nothing to avoid.
 * Pass `lang` to measure one language's marks only.
 */
export function useMissingGlyphs(root, on, lang) {
    const [missing, setMissing] = useState('');
    useEffect(() => {
        const el = root.current;
        if (!on || !el) {
            setMissing('');
            return;
        }
        let live = true;
        const measure = () => {
            if (live)
                setMissing(missingIn(insertedGlyphs(lang), el));
        };
        const fonts = typeof document === 'undefined' ? undefined : document.fonts;
        if (fonts)
            fonts.ready.then(measure, measure);
        else
            measure();
        return () => {
            live = false;
        };
    }, [root, lang, on]);
    return missing;
}
/** True on the server and while the page hydrates; false on any client render after that. */
const useServerRender = () => useSyncExternalStore(subscribe, () => false, () => true);
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
export function TypographyRoot({ children, config, lang, register, quoteStyle, disable, enable, rules, onChange, avoid, avoidMissing = true, hangAmount, early = true, }) {
    const root = useRef(null);
    const inherited = useContext(TypographyContext);
    const language = lang ?? config?.lang ?? inherited.lang;
    const setting = register ?? config?.register ?? inherited.register;
    const style = quoteStyle ?? config?.quoteStyle ?? inherited.quoteStyle;
    const switchedOff = disable ?? config?.disable ?? inherited.disable;
    const switchedOn = enable ?? config?.enable ?? inherited.enable;
    const list = rules ?? config?.rules ?? inherited.rules;
    const listener = onChange ?? inherited.onChange;
    const amount = hangAmount ?? config?.hangAmount;
    const given = avoid ?? config?.avoid ?? inherited.avoid ?? '';
    const missing = useMissingGlyphs(root, avoidMissing);
    const without = missing ? given + missing : given;
    const value = useMemo(() => ({
        lang: language,
        register: setting,
        quoteStyle: style,
        disable: switchedOff,
        enable: switchedOn,
        rules: list,
        onChange: listener,
        avoid: without,
    }), [language, setting, style, switchedOff, switchedOn, list, listener, without]);
    useHangingPunctuation(root);
    return (_jsx(TypographyContext.Provider, { value: value, children: _jsxs("div", { ref: root, style: amount === undefined ? undefined : { '--hang-amount': String(amount) }, children: [children, early ? _jsx(HangScript, {}) : null] }) }));
}

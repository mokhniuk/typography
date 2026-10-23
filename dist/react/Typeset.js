import { jsx as _jsx } from "react/jsx-runtime";
import { useContext, useMemo } from 'react';
import { typographic, } from '../core/index.js';
import { TypographyContext } from './context.js';
import { HangText } from './HangText.js';
/** Sets `text` with the language, register and rules of `setting`; what `Typeset` renders. */
export function typesetFor(text, setting, atStart) {
    return typographic(text, setting.lang, {
        register: setting.register,
        quoteStyle: setting.quoteStyle,
        blockStart: atStart,
        disable: setting.disable,
        enable: setting.enable,
        rules: setting.rules,
        onChange: setting.onChange,
        avoid: setting.avoid,
    });
}
/**
 * A plain string, typeset in the language and register of the surrounding `TypographyRoot`. A value
 * is taken from its own prop, then from `config`, then from the root.
 */
export function Typeset({ text, atStart = true, config, lang, register, quoteStyle, disable, enable, rules, onChange, avoid, }) {
    const inherited = useContext(TypographyContext);
    const language = lang ?? config?.lang ?? inherited.lang;
    const setting = register ?? config?.register ?? inherited.register;
    const style = quoteStyle ?? config?.quoteStyle ?? inherited.quoteStyle;
    const switchedOff = disable ?? config?.disable ?? inherited.disable;
    const switchedOn = enable ?? config?.enable ?? inherited.enable;
    const list = rules ?? config?.rules ?? inherited.rules;
    const listener = onChange ?? inherited.onChange;
    const without = avoid ?? config?.avoid ?? inherited.avoid;
    // The rules are a dozen regex passes; hover state in a parent re-renders this often.
    const formatted = useMemo(() => typesetFor(text, {
        lang: language,
        register: setting,
        quoteStyle: style,
        disable: switchedOff,
        enable: switchedOn,
        rules: list,
        onChange: listener,
        avoid: without,
    }, atStart), [text, language, setting, style, switchedOff, switchedOn, list, listener, without, atStart]);
    return _jsx(HangText, { text: formatted, atStart: atStart });
}

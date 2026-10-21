import { useContext, useMemo } from 'react';
import {
  type Change,
  type Lang,
  type QuoteStyle,
  type Register,
  type Rule,
  typographic,
} from '../core';
import { TypographyContext, type TypographySetting } from './context';
import { HangText } from './HangText';

/** Sets `text` with the language, register and rules of `setting`; what `Typeset` renders. */
export function typesetFor(text: string, setting: TypographySetting, atStart: boolean): string {
  return typographic(text, setting.lang, {
    register: setting.register,
    quoteStyle: setting.quoteStyle,
    blockStart: atStart,
    disable: setting.disable,
    enable: setting.enable,
    rules: setting.rules,
    onChange: setting.onChange,
  });
}

/** A plain string, typeset in the language and register of the surrounding `TypographyRoot`. */
export function Typeset({
  text,
  atStart = true,
  lang,
  register,
  quoteStyle,
  disable,
  enable,
  rules,
  onChange,
}: {
  text: string;
  /** Whether `text` opens its paragraph; false for a string that continues one after an element. */
  atStart?: boolean | undefined;
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
}) {
  const inherited = useContext(TypographyContext);
  const language = lang ?? inherited.lang;
  const setting = register ?? inherited.register;
  const style = quoteStyle ?? inherited.quoteStyle;
  const switchedOff = disable ?? inherited.disable;
  const switchedOn = enable ?? inherited.enable;
  const list = rules ?? inherited.rules;
  const listener = onChange ?? inherited.onChange;
  // The rules are a dozen regex passes; hover state in a parent re-renders this often.
  const formatted = useMemo(
    () =>
      typesetFor(
        text,
        {
          lang: language,
          register: setting,
          quoteStyle: style,
          disable: switchedOff,
          enable: switchedOn,
          rules: list,
          onChange: listener,
        },
        atStart,
      ),
    [text, language, setting, style, switchedOff, switchedOn, list, listener, atStart],
  );
  return <HangText text={formatted} atStart={atStart} />;
}

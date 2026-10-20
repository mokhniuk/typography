import { useContext, useMemo } from 'react';
import { type Lang, type QuoteStyle, type Register, type Rule, typographic } from '../core';
import { TypographyContext, type TypographySetting } from './context';
import { HangText } from './HangText';

/** Sets `text` with the language, register and rules of `setting`; what `Typeset` renders. */
export function typesetFor(text: string, setting: TypographySetting, atStart: boolean): string {
  return typographic(text, setting.lang, {
    register: setting.register,
    quoteStyle: setting.quoteStyle,
    blockStart: atStart,
    enable: setting.enable,
    rules: setting.rules,
  });
}

/** A plain string, typeset in the language and register of the surrounding `TypographyRoot`. */
export function Typeset({
  text,
  atStart = true,
  lang,
  register,
  quoteStyle,
  enable,
  rules,
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
  /** Overrides the opt-in rules of the surrounding `TypographyRoot`. Pass a constant, not an inline array. */
  enable?: readonly string[] | undefined;
  /** Overrides the rule list of the surrounding `TypographyRoot`. Pass a constant, not an inline array. */
  rules?: readonly Rule[] | undefined;
}) {
  const inherited = useContext(TypographyContext);
  const language = lang ?? inherited.lang;
  const setting = register ?? inherited.register;
  const style = quoteStyle ?? inherited.quoteStyle;
  const switchedOn = enable ?? inherited.enable;
  const list = rules ?? inherited.rules;
  // The rules are a dozen regex passes; hover state in a parent re-renders this often.
  const formatted = useMemo(
    () =>
      typesetFor(
        text,
        { lang: language, register: setting, quoteStyle: style, enable: switchedOn, rules: list },
        atStart,
      ),
    [text, language, setting, style, switchedOn, list, atStart],
  );
  return <HangText text={formatted} atStart={atStart} />;
}

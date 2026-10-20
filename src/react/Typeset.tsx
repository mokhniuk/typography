import { useContext, useMemo } from 'react';
import { type Lang, type Register, typographic } from '../core';
import { TypographyContext } from './context';
import { HangText } from './HangText';

/** A plain string, typeset in the language and register of the surrounding `TypographyRoot`. */
export function Typeset({
  text,
  atStart = true,
  lang,
  register,
}: {
  text: string;
  /** Whether `text` opens its paragraph; false for a string that continues one after an element. */
  atStart?: boolean | undefined;
  /** Overrides the language of the surrounding `TypographyRoot`. */
  lang?: Lang | undefined;
  /** Overrides the register of the surrounding `TypographyRoot`. */
  register?: Register | undefined;
}) {
  const inherited = useContext(TypographyContext);
  const language = lang ?? inherited.lang;
  const setting = register ?? inherited.register;
  // The rules are a dozen regex passes; hover state in a parent re-renders this often.
  const formatted = useMemo(
    () => typographic(text, language, { register: setting, blockStart: atStart }),
    [text, language, setting, atStart],
  );
  return <HangText text={formatted} atStart={atStart} />;
}

/**
 * The space before French high punctuation (`space.high-punctuation`): the pack's `highPunctuation`
 * names the space set before a colon (`colon`) and before `; ! ?` (`others`). French (Lacroux,
 * Orthotypographie; OQLF): a no-break word space before `:`, a narrow no-break space before `; ! ?`,
 * between a letter or digit and the mark only.
 */
import type { LangPack } from './lang/pack.js';
export type HighPunctuation = NonNullable<LangPack['highPunctuation']>;
/**
 * Sets `setting.colon` before a colon and `setting.others` before `; ! ?`, where a letter or digit
 * stands straight before the mark or before the spaces typed in front of it (which the set space
 * replaces). Never between two marks (`?!` takes one space, before the `?`; nothing after `…` `.`
 * `)` `»`), never at a line start, nothing after the mark. Linear: each mark reads back only the run
 * of spaces before it, and runs before two marks never overlap.
 */
export declare function highPunctuation(text: string, setting: HighPunctuation): string;

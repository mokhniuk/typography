import type { DialogueDash } from './lang/pack.js';
/**
 * A line of dialogue opens with the language's dash: «— Привіт, — сказав він.», «—¿Esperamos?».
 * A hyphen, en dash or em dash followed by a space at the very start of the text is taken for it,
 * followed by a no-break space unless the pack has the dash `attached`. Only the start, and not when
 * another line of the paragraph opens with a dash too: a dash after a line break is as likely a list
 * marker, and a paragraph of such lines is a list.
 */
export declare function dialogue(text: string, { mark, attached }: DialogueDash): string;
/** A hyphen, double hyphen or en dash between two numbers is a range: an unspaced en dash. */
export declare function dashRange(text: string): string;
/** A spaced hyphen or dash, or a double hyphen, is a break in the sentence: non-breaking space, `dash`, space. */
export declare function dashSentence(text: string, dash?: string): string;

import { type LangPack } from './lang/index.js';
import type { Lang, QuoteStyle, Register } from './types.js';
/** The quote setter of one pack: marks of its language, register and nesting level; source quotes may be of any style. */
export declare function quotesFor(pack: LangPack): (text: string, register?: Register, quoteStyle?: QuoteStyle) => string;
/** Sets the quotation marks of the language, register and nesting level; source quotes may be of any style. */
export declare function quotes(text: string, lang: Lang, register: Register, quoteStyle?: QuoteStyle): string;

import type { LangPack } from './lang/pack.js';
import type { QuoteStyle, Register } from './types.js';
type Turned = (text: string) => string;
/** `set` is a parameter for the equality test (quotes.turned.test.ts) only; quotes.ts passes none. */
export declare function turnedPair(open: string, close: string, openerBefore: RegExp, set?: typeof setPair): Turned;
declare function setPair(inner: string, before: string | undefined, after: string | undefined): string;
/** The quote setter of one pack: marks of its language, register and nesting level; source quotes may be of any style. */
export declare function quotesFor(pack: LangPack): (text: string, register?: Register, quoteStyle?: QuoteStyle) => string;
/** Sets the quotation marks of the pack's language, register and nesting level; source quotes may be of any style. */
export declare function quotes(text: string, pack: LangPack, register: Register, quoteStyle?: QuoteStyle): string;
export {};

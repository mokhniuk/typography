/**
 * The money the engine knows, in one table: the ISO 4217 codes of the audience's currencies and the
 * signs written for them. Two rules read it — `space.number` (a sign or code bound to its amount) and
 * `space.percent` (the euro sign after an amount, where a pack asks for it) — so a sign is listed once.
 *
 * The engine never moves, adds or removes a currency sign: it only keeps a sign, a code and the
 * digits of an amount on one line. Placement per language (€49.99 in English, 49,99 € in German) is
 * the writer's.
 */
/** ISO 4217 codes of the currencies of the EU, Ukraine and the US, and of the money written beside them. */
export declare const CURRENCY_CODES: readonly ['EUR', 'USD', 'GBP', 'UAH', 'CHF', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'SEK', 'DKK', 'NOK', 'ISK', 'TRY', 'CAD', 'AUD', 'JPY', 'CNY'];
/**
 * Currency signs that are not letters. A sign may stand before the amount ($5, € 49.99) or after it
 * (49 €), so these are the ones a rule can look for without a word boundary.
 */
export declare const CURRENCY_SIGNS = "\u20AC$\u00A3\u20B4\u00A5\u20BA";
/**
 * Signs written with letters, which the languages of the audience write after the amount
 * (5 000 zł, 100 Kč, 2 000 Ft, 50 lei, 10 лв, 99 kr, 1 000 грн). A short word after a number is
 * already bound to it by `space.number`; they are listed here so one table names every currency the
 * engine knows, for the docs and for the font checker.
 */
export declare const CURRENCY_WORDS: readonly ['zł', 'Kč', 'Ft', 'lei', 'лв', 'kr', 'грн'];
/** The euro sign, the one currency sign a language pack can ask for a space before (`currencySpace`). */
export declare const EURO = "\u20AC";
/** The percent sign, which `space.number` and `space.percent` both read. */
export declare const PERCENT = "%";
/** `€`, `$`, `USD`, `zł`: every way of naming money, as one alternation for a regex. */
export declare const CURRENCY_ALTERNATION: string;

/**
 * Whether `value` is a language pack, read at run time where a value may be a code or a pack (a
 * config, an option): an object with a string `code`, a string `name` and a non-empty array of
 * `quotes` whose levels are pairs of strings. A shallower check would let `{ code: 'xx', quotes: [] }`
 * from a JSON config through, and the engine would then drop every quotation mark.
 */
export const isPack = (value) => {
    if (typeof value !== 'object' || value === null)
        return false;
    const { code, name, quotes } = value;
    return (typeof code === 'string' &&
        typeof name === 'string' &&
        Array.isArray(quotes) &&
        quotes.length > 0 &&
        quotes.every((level) => Array.isArray(level) &&
            level.length === 2 &&
            typeof level[0] === 'string' &&
            typeof level[1] === 'string'));
};

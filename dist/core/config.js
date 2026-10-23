import { LANGS } from './profiles.js';
import { selectRules } from './rules.js';
const KEYS = [
    'lang',
    'register',
    'quoteStyle',
    'disable',
    'enable',
    'rules',
    'avoid',
    'nbsp',
    'hangAmount',
];
const oneOf = (key, value, allowed) => {
    if (!allowed.includes(value)) {
        throw new Error(`config: ${key} is ${allowed.map((a) => `"${a}"`).join(', ')}, not ${JSON.stringify(value)}`);
    }
};
const names = (key, value) => {
    if (!Array.isArray(value) || !value.every((name) => typeof name === 'string')) {
        throw new Error(`config: ${key} is a list of rule ids or groups, not ${JSON.stringify(value)}`);
    }
};
/**
 * Checks a value read from anywhere (a JSON file, a `package.json` key, a pasted text) and returns it
 * as a config: an unknown key, a value of the wrong kind, or a rule name that matches no rule
 * (checked against `rules` when given) throws an `Error` that says which.
 */
export function checkConfig(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`config: expected an object, not ${JSON.stringify(value) ?? String(value)}`);
    }
    const config = value;
    for (const key of Object.keys(config)) {
        if (!KEYS.includes(key)) {
            throw new Error(`config: unknown key "${key}" (${KEYS.join(', ')})`);
        }
    }
    const { lang, register, quoteStyle, disable, enable, rules, avoid, nbsp, hangAmount } = config;
    if (lang !== undefined)
        oneOf('lang', lang, LANGS);
    if (register !== undefined)
        oneOf('register', register, ['display', 'literary']);
    if (quoteStyle !== undefined)
        oneOf('quoteStyle', quoteStyle, ['language', 'us', 'guillemets']);
    if (nbsp !== undefined)
        oneOf('nbsp', nbsp, ['entity', 'char']);
    if (avoid !== undefined && typeof avoid !== 'string') {
        throw new Error(`config: avoid is a string of the characters the font cannot draw, not ${JSON.stringify(avoid)}`);
    }
    if (hangAmount !== undefined &&
        (typeof hangAmount !== 'number' || !(hangAmount >= 0 && hangAmount <= 1))) {
        throw new Error(`config: hangAmount is a number from 0 to 1, not ${JSON.stringify(hangAmount)}`);
    }
    if (disable !== undefined)
        names('disable', disable);
    if (enable !== undefined)
        names('enable', enable);
    if (rules !== undefined &&
        (!Array.isArray(rules) ||
            !rules.every((rule) => rule && typeof rule.id === 'string' && typeof rule.apply === 'function'))) {
        throw new Error('config: rules is a list of rules ({ id, about, apply }), built with addRule; it can only come from a module, not JSON');
    }
    try {
        selectRules({
            rules: rules,
            disable: disable,
            enable: enable,
        });
    }
    catch (error) {
        throw new Error(`config: ${error instanceof Error ? error.message : String(error)}`);
    }
    return config;
}
/**
 * Returns `config` as it is, after checking it (see `checkConfig`), so a mistake in a project's
 * config throws where the config is written, not at the first call that uses it. A plain object
 * typed `TypographyConfig` works as well, unchecked.
 */
export function defineConfig(config) {
    checkConfig(config);
    return config;
}

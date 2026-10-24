import { resolvePack } from '../core/index.js';
import { typesetElement } from '../dom/typeset.js';
/** The directive object itself, for `app.directive('typography', vTypography)` or a component's `directives`. */
export function createDirective(defaults = {}) {
    const run = (el, binding) => {
        const options = { ...defaults, ...binding.value };
        typesetElement(el, { ...options, lang: resolvePack(options.lang) });
    };
    return { mounted: run, updated: run };
}
export const vTypography = createDirective();
/** The plugin: `app.use(typography, options)` registers `v-typography` with those options as its defaults. */
export default {
    install(app, options = {}) {
        app.directive('typography', createDirective(options));
    },
};

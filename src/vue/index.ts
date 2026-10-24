import { type ModeOptions, resolvePack } from '../core/index.ts';
import { type DomNode, typesetElement } from '../dom/typeset.ts';

/**
 * A Vue 3 directive (and a plugin that registers it) that typesets the text of an element in the
 * browser. It needs no dependency: the parts of Vue it touches are described below as plain data.
 *
 *     createApp(App).use(typography, { lang: 'uk' })     // once
 *     <p v-typography>He said "hi" - ok.</p>             // anywhere
 *     <article v-typography="{ lang: 'de' }">...</article>
 *
 * The value of the directive replaces the plugin's options for that element (a language, a register, a
 * preset: `v-typography="presets.book"`). It runs when the element is mounted and again after every
 * update, on the element's whole subtree (see `typesetElement`). It runs in the browser only: Vue
 * does not call a directive while rendering on a server, so server-rendered text arrives as it was
 * written until the page hydrates. To typeset on the server, call `typesetText` or `typesetHtml` on
 * the string.
 */
export type VueOptions = ModeOptions;

type Binding = { value?: VueOptions | undefined };
type Element = DomNode;

/** The directive object itself, for `app.directive('typography', vTypography)` or a component's `directives`. */
export function createDirective(defaults: VueOptions = {}) {
  const run = (el: Element, binding: Binding) => {
    const options = { ...defaults, ...binding.value };
    typesetElement(el, { ...options, lang: resolvePack(options.lang) });
  };
  return { mounted: run, updated: run };
}

export const vTypography = createDirective();

/** The plugin: `app.use(typography, options)` registers `v-typography` with those options as its defaults. */
export default {
  install(
    app: { directive(name: string, definition: unknown): unknown },
    options: VueOptions = {},
  ) {
    app.directive('typography', createDirective(options));
  },
};

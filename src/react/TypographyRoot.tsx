'use client';

import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type {
  Change,
  Lang,
  LangPack,
  QuoteStyle,
  Register,
  Rule,
  TypographyConfig,
} from '../core/index.ts';
import { insertedGlyphs } from '../core/index.ts';
import { hangPunctuation, hangScript, missingIn } from '../dom/index.ts';
import { TypographyContext } from './context.ts';

/**
 * Sends the hanging pass inline, to run on the parent of this element as the page is
 * parsed (see `hangScript`). Put it last inside the element that holds the text. On the
 * server and while the page hydrates it renders the script; on any later client render
 * it renders nothing, because scripts rendered by React are never run.
 */
export function HangScript() {
  const prerendering = useServerRender();
  if (!prerendering) return null;
  // The function's source is printed by the server build and by the client build, and a bundler
  // formats it differently (comments, whitespace); the script has already run, so the text is not read again.
  // biome-ignore lint/security/noDangerouslySetInnerHtml: the source is this package's own function, not user input
  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: hangScript() }} />;
}

/** Runs the hanging pass over everything under `root`, for as long as it is mounted. */
export function useHangingPunctuation(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = root.current;
    return el ? hangPunctuation(el) : undefined;
  }, [root]);
}

const subscribe = () => () => {};

/**
 * The characters the font of `root` cannot draw, measured once the fonts of the page have loaded
 * (see `missingGlyphs` in ../dom). Empty on the server and until the measure is made, so the first
 * paint is the ordinary typeset text and only a real gap in the font changes it.
 *
 * Every language's marks are measured, not only the root's: a `Typeset` under this root may set a
 * language of its own, and a mark no rule inserts in the language in use costs nothing to avoid.
 * Pass `lang` to measure one language's marks only.
 */
export function useMissingGlyphs(
  root: RefObject<HTMLElement | null>,
  on: boolean,
  lang?: Lang | LangPack,
): string {
  const [missing, setMissing] = useState('');
  useEffect(() => {
    const el = root.current;
    if (!on || !el) {
      setMissing('');
      return;
    }
    let live = true;
    const measure = () => {
      if (live) setMissing(missingIn(insertedGlyphs(lang), el));
    };
    const fonts = typeof document === 'undefined' ? undefined : document.fonts;
    if (fonts) fonts.ready.then(measure, measure);
    else measure();
    return () => {
      live = false;
    };
  }, [root, lang, on]);
  return missing;
}

/** True on the server and while the page hydrates; false on any client render after that. */
const useServerRender = () =>
  useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );

/**
 * Wraps a page so its text is typeset: sets the language and register every
 * `Typeset` under it falls back to, and hangs opening punctuation wherever a line
 * starts with it. A value is taken from the root's own prop, then from `config`, then
 * from an outer root.
 *
 * On a prerendered page it also sends the hanging pass inline (`hangScript`), so the
 * marks hang as the page is parsed and do not move when the bundle has loaded. Turn
 * that off with `early={false}`, for a page with a content security policy that
 * forbids inline scripts.
 */
export function TypographyRoot({
  children,
  config,
  lang,
  register,
  quoteStyle,
  disable,
  enable,
  rules,
  onChange,
  avoid,
  avoidMissing = true,
  hangAmount,
  early = true,
}: {
  children: ReactNode;
  /** A project's config (see `TypographyConfig`); a prop given here beats it. Pass a constant. `nbsp` is not read. */
  config?: TypographyConfig | undefined;
  /** A language code or a pack (pass a constant). */
  lang?: Lang | LangPack | undefined;
  register?: Register | undefined;
  /** `language` (the default) or `us`: “…” and ‘…’ in any language. */
  quoteStyle?: QuoteStyle | undefined;
  /** Rules to switch off: ids or groups; pass a constant, not an inline array. */
  disable?: readonly string[] | undefined;
  /** Rules to switch on that are off by default; pass a constant, not an inline array. */
  enable?: readonly string[] | undefined;
  /** The list of rules to run instead of the built-in one; pass a constant. */
  rules?: readonly Rule[] | undefined;
  /** Called with each change made to a text under this root; pass a stable function (`useCallback`). */
  onChange?: ((change: Change) => void) | undefined;
  /** Characters the font cannot draw: a rule that would insert one leaves the text as typed. */
  avoid?: string | undefined;
  /**
   * Whether to add the characters the page's own font cannot draw to `avoid`, measured in the
   * browser (`true` by default). They are measured once the fonts have loaded, so a server-rendered
   * page is typeset as usual first and only a real gap in the font changes a text. Set it to `false`
   * for a page that must render the same everywhere, or to name the characters yourself with `avoid`.
   */
  avoidMissing?: boolean | undefined;
  /** How far marks hang, 0 to 1: set as `--hang-amount` on the root's div. Left out, it is inherited through CSS. */
  hangAmount?: number | undefined;
  early?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const inherited = useContext(TypographyContext);
  const language = lang ?? config?.lang ?? inherited.lang;
  const setting = register ?? config?.register ?? inherited.register;
  const style = quoteStyle ?? config?.quoteStyle ?? inherited.quoteStyle;
  const switchedOff = disable ?? config?.disable ?? inherited.disable;
  const switchedOn = enable ?? config?.enable ?? inherited.enable;
  const list = rules ?? config?.rules ?? inherited.rules;
  const listener = onChange ?? inherited.onChange;
  const amount = hangAmount ?? config?.hangAmount;
  const given = avoid ?? config?.avoid ?? inherited.avoid ?? '';
  const missing = useMissingGlyphs(root, avoidMissing);
  const without = missing ? given + missing : given;
  const value = useMemo(
    () => ({
      lang: language,
      register: setting,
      quoteStyle: style,
      disable: switchedOff,
      enable: switchedOn,
      rules: list,
      onChange: listener,
      avoid: without,
    }),
    [language, setting, style, switchedOff, switchedOn, list, listener, without],
  );
  useHangingPunctuation(root);
  return (
    <TypographyContext.Provider value={value}>
      <div
        ref={root}
        style={
          amount === undefined ? undefined : ({ '--hang-amount': String(amount) } as CSSProperties)
        }
      >
        {children}
        {early ? <HangScript /> : null}
      </div>
    </TypographyContext.Provider>
  );
}

import {
  type ReactNode,
  type RefObject,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import type { Lang, Register, Rule } from '../core';
import { hangPunctuation, hangScript } from '../dom';
import { TypographyContext } from './context';

/**
 * Sends the hanging pass inline, to run on the parent of this element as the page is
 * parsed (see `hangScript`). Put it last inside the element that holds the text. On the
 * server and while the page hydrates it renders the script; on any later client render
 * it renders nothing, because scripts rendered by React are never run.
 */
export function HangScript() {
  const prerendering = useServerRender();
  if (!prerendering) return null;
  // biome-ignore lint/security/noDangerouslySetInnerHtml: the source is this package's own function, not user input
  // The function's source is printed by the server build and by the client build, and a bundler
  // formats it differently (comments, whitespace); the script has already run, so the text is not read again.
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
 * starts with it. A value left out is inherited from an outer root.
 *
 * On a prerendered page it also sends the hanging pass inline (`hangScript`), so the
 * marks hang as the page is parsed and do not move when the bundle has loaded. Turn
 * that off with `early={false}`, for a page with a content security policy that
 * forbids inline scripts.
 */
export function TypographyRoot({
  children,
  lang,
  register,
  enable,
  rules,
  early = true,
}: {
  children: ReactNode;
  lang?: Lang | undefined;
  register?: Register | undefined;
  /** Rules to switch on that are off by default; pass a constant, not an inline array. */
  enable?: readonly string[] | undefined;
  /** The list of rules to run instead of the built-in one; pass a constant. */
  rules?: readonly Rule[] | undefined;
  early?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const inherited = useContext(TypographyContext);
  const language = lang ?? inherited.lang;
  const setting = register ?? inherited.register;
  const switchedOn = enable ?? inherited.enable;
  const list = rules ?? inherited.rules;
  const value = useMemo(
    () => ({ lang: language, register: setting, enable: switchedOn, rules: list }),
    [language, setting, switchedOn, list],
  );
  useHangingPunctuation(root);
  return (
    <TypographyContext.Provider value={value}>
      <div ref={root}>
        {children}
        {early ? <HangScript /> : null}
      </div>
    </TypographyContext.Provider>
  );
}

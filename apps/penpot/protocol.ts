import { LANGS } from '../../src/index.ts';
import type { Settings } from '../figma/settings.ts';

/** What the panel sends to the plugin code. */
export type ToPlugin =
  | { type: 'ready' }
  | { type: 'format'; scope: 'selection' | 'page' }
  | { type: 'save'; settings: unknown };

/** What the plugin code sends to the panel. */
export type ToPanel =
  | { type: 'init'; settings: Settings; theme: 'light' | 'dark' }
  | { type: 'result'; message: string; changed: boolean }
  | { type: 'theme'; theme: 'light' | 'dark' };

/** A message from the panel, or `null` when it is not one of the three. */
export function readMessage(value: unknown): ToPlugin | null {
  if (!value || typeof value !== 'object') return null;
  const message = value as Record<string, unknown>;
  if (message.type === 'ready') return { type: 'ready' };
  if (message.type === 'save') return { type: 'save', settings: message.settings };
  if (message.type === 'format' && (message.scope === 'selection' || message.scope === 'page'))
    return { type: 'format', scope: message.scope };
  return null;
}

const QUOTES = { language: 'Language quotes', us: 'US quotes', guillemets: 'Guillemets' } as const;

/** One line for the Format tab: `German · Display · Language quotes`. */
export function describeSettings({ lang, register, quoteStyle }: Settings): string {
  const language = new Intl.DisplayNames(['en'], { type: 'language' }).of(LANGS.includes(lang) ? lang : 'en') ?? lang;
  return [language, register.charAt(0).toUpperCase() + register.slice(1), QUOTES[quoteStyle]].join(' · ');
}

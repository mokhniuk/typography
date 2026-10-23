import { withPack } from '../core/resolve.ts';
import type { ModeOptions } from '../core/typography.ts';
import { typesetText as set } from './text.ts';

/**
 * Typesets plain text a paragraph at a time. Paragraphs are separated by blank
 * lines, and each opens a block (so a Ukrainian dialogue dash is read at the start
 * of every paragraph, not only of the file). Line breaks, indentation, trailing
 * spaces and the blank lines between paragraphs are kept exactly; a paragraph that
 * needs no change comes back byte for byte.
 */
export type TextOptions = ModeOptions;

export function typesetText(text: string, options: TextOptions = {}): string {
  return set(text, withPack(options));
}

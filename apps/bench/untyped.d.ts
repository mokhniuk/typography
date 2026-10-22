// These benchmark competitors ship no type declarations.
declare module 'smartypants' {
  export function smartypantsu(text: string, options?: string | number): string;
}
declare module 'tipograph' {
  export default function tipograph(options?: Record<string, unknown>): (text: string) => string;
}

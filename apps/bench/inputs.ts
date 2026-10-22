/** The English paragraph every speed table repeats, shared by the in-process tables and the engine driver. */
export const PARAGRAPH =
  'He said "we\'re here" - and left... The lab runs 21-26 September, 10:00-12:00, Prof. Dr. K. Smith opens it (c) 2026. ' +
  'It is 5 km from a quiet stone house in the old town, and the "memory walk" starts there at 9:30 - bring a coat. ';

/** The paragraph repeated to at least `size` characters, in one piece. */
export const text = (size: number) => PARAGRAPH.repeat(Math.ceil(size / PARAGRAPH.length));

/** The paragraph repeated and cut to exactly `size` characters: a short input, as a page sends. */
export const short = (size: number) => text(size).slice(0, size);

/** Median and 95th percentile of a list of timings. */
export function spread(ms: number[]): { median: number; p95: number } {
  const s = [...ms].sort((a, b) => a - b);
  const at = (q: number) => s[Math.min(s.length - 1, Math.ceil(q * s.length) - 1)] ?? Number.NaN;
  return { median: at(0.5), p95: at(0.95) };
}

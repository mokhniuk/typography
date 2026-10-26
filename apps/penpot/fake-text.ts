/**
 * A stand-in for a Penpot `Text` shape, for tests. Its behaviour is what the real-Penpot spike found
 * (docs/superpowers/specs/2026-10-26-penpot-plugin-design.md, "Spike findings"): the `characters` setter
 * flattens every character to the style of the first one; `getRange` reads `'mixed'` for a property that
 * differs inside the range, and its setters write the whole range.
 */
import type { Run, Style } from './runs.ts';
import { PROPS, type RangeLike, type TextLike } from './styles.ts';

const DEFAULTS: Style = {
  fontId: 'gfont-source-sans-pro',
  fontFamily: 'sourcesanspro',
  fontVariantId: 'regular',
  fontSize: '14',
  fontWeight: '400',
  fontStyle: 'normal',
  lineHeight: '1.2',
  letterSpacing: '0',
  textTransform: 'none',
  textDecoration: 'none',
  direction: 'ltr',
  align: 'left',
  fills: [{ fillColor: '#000000', fillOpacity: 1 }],
};

/** All thirteen properties, the given ones over the defaults. */
export const fullStyle = (overrides: Style): Style => ({ ...DEFAULTS, ...overrides });

export class FakeText implements TextLike {
  /** Every range setter call, as `start-end:property`. */
  writes: string[] = [];
  /** How many times `getRange` was called. */
  rangeReads = 0;
  private text: string;
  private units: Style[];
  private failing = new Map<string, number>();
  private failText = 0;

  constructor(text: string, runs: readonly Run[]) {
    this.text = text;
    this.units = Array.from({ length: text.length }, () => fullStyle({}));
    for (const { start, end, style } of runs) for (let i = start; i < end; i++) this.units[i] = style;
  }

  get characters(): string {
    return this.text;
  }

  set characters(value: string) {
    if (this.failText > 0) {
      this.failText--;
      throw new Error('characters setter failed');
    }
    const first = this.units[0] ?? fullStyle({});
    this.text = value;
    this.units = Array.from({ length: value.length }, () => first);
  }

  /** The next `times` writes of `property` (default one) throw; the next `times` sets of `characters` for `'characters'`. */
  failOn(property: string, times = 1): void {
    if (property === 'characters') this.failText = times;
    else this.failing.set(property, times);
  }

  getRange(start: number, end: number): RangeLike {
    this.rangeReads++;
    const range: RangeLike = {};
    for (const prop of PROPS) {
      Object.defineProperty(range, prop, {
        enumerable: true,
        get: () => {
          const values = this.units.slice(start, end).map((unit) => JSON.stringify(unit[prop]));
          return new Set(values).size > 1 ? 'mixed' : this.units[start]?.[prop];
        },
        set: (value: unknown) => {
          const left = this.failing.get(prop) ?? 0;
          if (left > 0) {
            this.failing.set(prop, left - 1);
            throw new Error(`${prop} setter failed`);
          }
          this.writes.push(`${start}-${end}:${prop}`);
          for (let i = start; i < end; i++) this.units[i] = { ...this.units[i], [prop]: value };
        },
      });
    }
    return range;
  }
}

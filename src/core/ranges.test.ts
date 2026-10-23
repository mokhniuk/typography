import { describe, expect, test } from 'bun:test';
import { dashRange } from './dashes.ts';
import { typographic } from './index.ts';
import type { Lang } from './types.ts';
import { NBSP } from './types.ts';

const t = (text: string, lang: Lang = 'en') => typographic(text, lang).replaceAll(NBSP, '~');

describe('time ranges written with a full stop (9.00-18.30)', () => {
  test('a dotted time range takes an unspaced en dash, as a colon one does', () => {
    expect(dashRange('9.00-18.30')).toBe('9.00–18.30');
    expect(dashRange('9.15-18.30')).toBe('9.15–18.30');
    expect(dashRange('8.00-9.00')).toBe('8.00–9.00');
    expect(dashRange('8.00 - 9.00')).toBe('8.00–9.00');
    expect(dashRange('8.00 – 9.00')).toBe('8.00–9.00');
    expect(dashRange('8.00--9.00')).toBe('8.00–9.00');
    expect(dashRange('0.00-24.00')).toBe('0.00–24.00');
    expect(dashRange('open 09.30-17.45 daily')).toBe('open 09.30–17.45 daily');
  });

  test('through the whole engine, in English and in Latvian (ISG 10.1.7: 9.00–18.30)', () => {
    expect(t('Open 9.00-18.30.')).toBe('Open 9.00–18.30.');
    expect(t('Open 9.00 - 18.30.')).toBe('Open 9.00–18.30.');
    expect(t('Biroja darba laiks: 9.00-18.30', 'lv')).toBe('Biroja darba laiks: 9.00–18.30');
  });

  test('the colon form is unchanged', () => {
    expect(dashRange('10:00-12:00')).toBe('10:00–12:00');
    expect(dashRange('10:00 – 12:00')).toBe('10:00–12:00');
    // Not checked as a time with a colon, as before: an overnight span keeps its en dash.
    expect(dashRange('22:00-02:00')).toBe('22:00–02:00');
  });

  test('decimals are no time: one-digit minutes are left alone', () => {
    expect(dashRange('1.5-2.5')).toBe('1.5-2.5');
    expect(dashRange('0.5-1.5 mm')).toBe('0.5-1.5 mm');
  });

  test('not a time: minutes over 59, hours over 24, a descending pair, mixed separators', () => {
    expect(dashRange('1.75-2.80')).toBe('1.75-2.80');
    expect(dashRange('25.00-26.00')).toBe('25.00-26.00');
    expect(dashRange('18.30-9.00')).toBe('18.30-9.00');
    expect(dashRange('9.00-18:30')).toBe('9.00-18:30');
  });

  test('part of a longer number or a date is left alone', () => {
    expect(dashRange('1.10.00-12.00')).toBe('1.10.00-12.00');
    expect(dashRange('1.10-5.10.2026')).toBe('1.10-5.10.2026');
    expect(dashRange('v1.10-1.20')).toBe('v1.10-1.20');
    expect(dashRange('9.00-18.300')).toBe('9.00-18.300');
  });
});

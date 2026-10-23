import { describe, expect, test } from 'bun:test';
import { typographic } from './index.ts';
import type { LangPack } from './lang/pack.ts';
import { abbreviations, mayAbbreviate } from './spaces.ts';
import type { Lang } from './types.ts';
import { NBSP } from './types.ts';

const t = (text: string, lang: Lang) => typographic(text, lang).replaceAll(NBSP, '~');

describe('abbreviations written without a full stop (Abbreviations.bare)', () => {
  test('Finnish: klo and nro stay with the number after them (ISG 4.2.3, 10.7.1)', () => {
    expect(t('Kokous alkaa klo 17 ja päättyy klo 18.30.', 'fi')).toBe(
      'Kokous alkaa klo~17~ja päättyy klo~18.30.',
    );
    expect(t('Asiakirja nro 5', 'fi')).toBe('Asiakirja nro~5');
  });

  test('Estonian: nr and lk stay with the number after them (ISG 4.2.3: "nr• ELT L•", "lk• ELT C•")', () => {
    expect(t('otsus nr 5', 'et')).toBe('otsus nr~5');
    expect(t('vt lk 12', 'et')).toBe('vt lk~12');
  });

  test('the Finnish abbreviations with a full stop still bind', () => {
    expect(t('s. 12 ja p. 0123', 'fi')).toBe('s.~12~ja p.~0123');
  });

  test('only before a number, and only as a word of its own', () => {
    expect(t('Oklo 5', 'fi')).toBe('Oklo 5');
    expect(t('klo viisi', 'fi')).toBe('klo viisi');
    expect(t('Kaklo 5 ja kloori 5', 'fi')).toBe('Kaklo 5~ja kloori 5');
    expect(t('linnr 5', 'et')).toBe('linnr 5');
    expect(t('nrX 5', 'et')).toBe('nrX 5');
  });

  test('written with a full stop, nr. is not a bare abbreviation: unchanged in Estonian, bound in Polish', () => {
    expect(t('otsus nr. 5', 'et')).toBe('otsus nr. 5');
    expect(t('pokój nr. 5', 'pl')).toBe('pokój nr.~5');
  });

  test('the cheap test lets a bare abbreviation through without a full stop, and skips text without a digit', () => {
    const pack = { code: 'xx', abbreviations: { bare: ['klo'] } } as unknown as LangPack;
    expect(mayAbbreviate('klo 17', pack)).toBe(true);
    expect(abbreviations('klo 17', pack)).toBe(`klo${NBSP}17`);
    expect(mayAbbreviate('klo viisi', pack)).toBe(false);
    expect(abbreviations('klo viisi', pack)).toBe('klo viisi');
  });
});

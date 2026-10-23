import { describe, expect, test } from 'bun:test';
import { typographic } from '../index.ts';
import { NBSP } from '../types.ts';
import { es } from './es.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'es', options).replaceAll(NBSP, '~');

wellFormed(es, 'es.test.ts');

// ISG = Libro de estilo interinstitucional (Oficina de Publicaciones de la UE), PDF of 19 April 2022,
// section numbers as in that edition; see `sources` in es.ts.
describe('Spanish quotation (ISG 10.1.12: «…» then “…” then ‘…’)', () => {
  test('ISG 10.1.12: angular quotes first', () => {
    expect(t('Dijo "hola" y se fue.')).toBe('Dijo «hola» y se fue.');
    expect(t('Dijo “hola” y se fue.')).toBe('Dijo «hola» y se fue.');
    expect(t('Dijo «hola» y se fue.')).toBe('Dijo «hola» y se fue.');
  });

  test('ISG 10.1.12: English quotes inside, single quotes at the third level', () => {
    expect(t('“x ‘y’ z”')).toBe('«x “y” z»');
    expect(t('“x ‘y “z” y’ x”')).toBe('«x “y ‘z’ y” x»');
  });

  test('ISG 10.1.12 example: «Elena me comentó: “Menudo ‘marrón’ me ha caído”»', () => {
    expect(t('El otro día me dijo: “Elena me comentó: ‘Menudo “marrón” me ha caído’”.')).toBe(
      'El otro día me dijo: «Elena me comentó: “Menudo ‘marrón’ me ha caído”».',
    );
    const ready = 'El otro día me dijo: «Elena me comentó: “Menudo ‘marrón’ me ha caído”».';
    expect(t(ready)).toBe(ready);
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Dijo "sí" y "no" a la vez.')).toBe('Dijo «sí» y «no» a la vez.');
  });
});

describe('Spanish ¿ and ¡ before a quotation (ISG 10.1.11)', () => {
  test('a quotation opens after ¿ and ¡ and still closes', () => {
    expect(t('¿"Qué"?')).toBe('¿«Qué»?');
    expect(t('¡«Hola»!')).toBe('¡«Hola»!');
    expect(t('¡"Hola"!')).toBe('¡«Hola»!');
    expect(t('¡“Hola”!')).toBe('¡«Hola»!');
    expect(t("¡'Hola'!")).toBe('¡«Hola»!');
  });

  test('two quotations inside one question', () => {
    expect(t('¿"Qué" y "cómo"?')).toBe('¿«Qué» y «cómo»?');
  });

  test('the question mark may stand inside the quotation: «¿Cómo te fue?»', () => {
    expect(t('Me dijo "¿Cómo te fue?" ayer.')).toBe('Me dijo «¿Cómo te fue?» ayer.');
    expect(t('Gritó: "¡Vámonos!" y salió.')).toBe('Gritó: «¡Vámonos!» y salió.');
  });

  test('a nested quotation after ¿ keeps its level', () => {
    expect(t('“¿Dijo ‘no’?”')).toBe('«¿Dijo “no”?»');
  });
});

describe('Spanish spaces', () => {
  test('ISG 10.3.1.4: a fixed space before % ; ISG 7.3.3: before the euro code', () => {
    expect(t('el 5% y 49€')).toBe('el 5~% y 49~€');
  });

  test('ISG 10.4: an abbreviation is not split across lines', () => {
    expect(t('en EE. UU. y JJ. OO. de las 2 p. m.')).toBe('en EE.~UU. y JJ.~OO. de las 2~p.~m.');
    expect(t('véase p. 12, pp. 12')).toBe('véase p.~12, pp.~12');
    expect(t('el Sr. Gil')).toBe('el Sr.~Gil');
  });
});

describe('Spanish idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of [
      'Dijo "hola" y se fue.',
      '¿"Qué" y "cómo"?',
      '“x ‘y “z” y’ x”',
      'el 5% y 49€ en EE. UU.',
      'Me dijo "¿Cómo te fue?" ayer.',
    ]) {
      const once = typographic(input, 'es');
      expect(typographic(once, 'es')).toBe(once);
    }
  });
});

describe('Spanish pack data', () => {
  test('ISG 6.5: comma for decimals, a fixed space between groups of three', () => {
    expect(es.numbers).toEqual({ group: NBSP, decimal: ',' });
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- ¿Esperamos? - preguntó.')).toBe('—¿Esperamos?~— preguntó.');
    expect(t('- ¿Esperamos? - preguntó.', { register: 'literary' })).toBe(
      '—¿Esperamos?~— preguntó.',
    );
  });
});

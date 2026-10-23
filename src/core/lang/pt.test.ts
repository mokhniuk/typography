import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types.ts';
import { typographic } from '../typography.ts';
import { wellFormed } from './pack-checks.test-utils.ts';
import { pt } from './pt.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'pt', options).replaceAll(NBSP, '~');

wellFormed(pt, 'pt.test.ts');

// ISG = Código de Redação Interinstitucional (Serviço das Publicações da UE, Portuguese of Portugal),
// PDF of 19 April 2022; Ciberdúvidas = Ciberdúvidas da Língua Portuguesa; see `sources` in pt.ts.
describe('European Portuguese quotation (ISG 4.2.3: «…» then “…” then ‘…’)', () => {
  test('ISG 4.2.3: angular quotes first', () => {
    expect(t('Ele disse "olá" e saiu.')).toBe('Ele disse «olá» e saiu.');
    expect(t('Ele disse “olá” e saiu.')).toBe('Ele disse «olá» e saiu.');
    expect(t('Ele disse «olá» e saiu.')).toBe('Ele disse «olá» e saiu.');
  });

  test('ISG 4.2.3: “…” inside, ‘…’ at the third level', () => {
    expect(t('“x ‘y’ z”')).toBe('«x “y” z»');
    expect(t('“x ‘y “z” y’ x”')).toBe('«x “y ‘z’ y” x»');
  });

  test('ISG 10.4.10 and Ciberdúvidas example: «O chefe disse … “… ‘relatório’ …”»', () => {
    const ready =
      '«O chefe disse ao seu subordinado: “Disfarce quando ouvir a palavra ‘relatório’, combinado?”»';
    expect(
      t(
        '“O chefe disse ao seu subordinado: ‘Disfarce quando ouvir a palavra “relatório”, combinado?’”',
      ),
    ).toBe(ready);
    expect(t(ready)).toBe(ready);
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Disse "sim" e "não" ao mesmo tempo.')).toBe('Disse «sim» e «não» ao mesmo tempo.');
  });

  test('Brazilian Portuguese: quoteStyle us gives “…” with ‘…’ inside', () => {
    expect(t('Ele disse "olá" e saiu.', { quoteStyle: 'us' })).toBe('Ele disse “olá” e saiu.');
    expect(t('"x \'y\' z"', { quoteStyle: 'us' })).toBe('“x ‘y’ z”');
  });
});

describe('Portuguese apostrophe', () => {
  test('an apostrophe inside a word (d’Ouro) does not break a quotation', () => {
    expect(t('Disse "o Sol d\'Ouro" ontem.')).toBe('Disse «o Sol d’Ouro» ontem.');
  });
});

describe('Portuguese spaces', () => {
  test('ISG 6.4: a fixed space before %; currencySpace is off, so none is added before €', () => {
    expect(t('os 5% e 49€')).toBe('os 5~% e 49€');
    expect(t('30€')).toBe('30€');
    expect(t('€30')).toBe('€30');
  });

  test('ISG A3: an abbreviation is not split across lines', () => {
    expect(t('isto, p. ex. aquilo, em 50 a. C. e 30 d. C.')).toBe(
      'isto, p.~ex. aquilo, em 50~a.~C. e 30~d.~C.',
    );
    expect(t('veja p. 12, N. B. e P. S. isto')).toBe('veja p.~12, N.~B. e P.~S. isto');
  });
});

describe('Portuguese idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of [
      'Ele disse "olá" e saiu.',
      '“x ‘y “z” y’ x”',
      'os 5% e 49€, p. ex. aquilo',
      'Disse "o Sol d\'Ouro" ontem.',
    ]) {
      const once = typographic(input, 'pt');
      expect(typographic(once, 'pt')).toBe(once);
    }
  });
});

describe('Portuguese pack data', () => {
  test('ISG 6.5: comma for decimals, a fixed space between groups of three', () => {
    expect(pt.numbers).toEqual({ group: NBSP, decimal: ',' });
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Esperamos? - perguntou.')).toBe('—~Esperamos?~— perguntou.');
    expect(t('- Esperamos? - perguntou.', { register: 'literary' })).toBe(
      '—~Esperamos?~— perguntou.',
    );
  });
});

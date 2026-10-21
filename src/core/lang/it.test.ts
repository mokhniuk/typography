import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { it } from './it';
import { wellFormed } from './pack-checks';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'it', options).replaceAll(NBSP, '~');

wellFormed(it, 'it.test.ts');

// ISG = Manuale interistituzionale di convenzioni redazionali (Ufficio delle pubblicazioni dell'UE),
// PDF of 19 April 2022; Treccani = Enciclopedia dell'italiano; see `sources` in it.ts.
describe('Italian quotation (ISG 4.2.3: «…» then “…” then ‘…’; Treccani: bassa first, alta inside)', () => {
  test('ISG 4.2.3: caporali first', () => {
    expect(t('Disse "ciao" e uscì.')).toBe('Disse «ciao» e uscì.');
    expect(t('Disse “ciao” e uscì.')).toBe('Disse «ciao» e uscì.');
    expect(t('Disse «ciao» e uscì.')).toBe('Disse «ciao» e uscì.');
  });

  test('ISG 4.2.3: “…” inside, ‘…’ at the third level', () => {
    expect(t('“x ‘y’ z”')).toBe('«x “y” z»');
    expect(t('“x ‘y “z” y’ x”')).toBe('«x “y ‘z’ y” x»');
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Disse "sì" e "no" insieme.')).toBe('Disse «sì» e «no» insieme.');
  });
});

describe('Italian apostrophe (ISG 4: the typographic ’; Treccani: elision l’amica, truncation po’, years ’48)', () => {
  test('elision inside a word, outside a quotation', () => {
    expect(t("L'amico dell'architetto, quell'albero e un'idea.")).toBe(
      'L’amico dell’architetto, quell’albero e un’idea.',
    );
  });

  test('elision inside a quotation does not break the pair', () => {
    expect(t('Disse "l\'amico dell\'architetto" ieri.')).toBe(
      'Disse «l’amico dell’architetto» ieri.',
    );
    expect(t('Disse “l’amico dell’architetto” ieri.')).toBe(
      'Disse «l’amico dell’architetto» ieri.',
    );
  });

  test("truncation po' keeps its apostrophe outside a quotation", () => {
    expect(t("Mangia un po' di pane.")).toBe('Mangia un po’ di pane.');
    expect(t("Un po' di pane e un po' di vino.")).toBe('Un po’ di pane e un po’ di vino.');
  });

  test("truncation po' inside a quotation, and a quotation after it", () => {
    expect(t('Disse "un po\' di pane" e basta.')).toBe('Disse «un po’ di pane» e basta.');
    expect(t('Un po\' di pane, disse "basta".')).toBe('Un po’ di pane, disse «basta».');
    expect(t('Disse "dammi un po\'" e uscì.')).toBe('Disse «dammi un po’» e uscì.');
  });

  test("a year with its first digits dropped: ’48, nel ’64", () => {
    expect(t("Nel '64, nel '48.")).toBe('Nel ’64, nel ’48.');
    expect(t('Disse "nel \'64, era qui" ieri.')).toBe('Disse «nel ’64, era qui» ieri.');
  });
});

describe('Italian spaces', () => {
  test('ISG 6.4: a fixed space before %', () => {
    expect(t('il 5% e 49€')).toBe('il 5~% e 49~€');
  });

  test('ISG A3: a short abbreviation stays with what it introduces', () => {
    expect(t('si veda pag. 12, n. 5')).toBe('si veda pag.~12, n.~5');
    expect(t('ad es. questo e p. es. quello')).toBe('ad~es. questo e p.~es. quello');
  });
});

describe('Italian idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of [
      'Disse "ciao" e uscì.',
      "Disse \"l'amico\" e un po' di pane.",
      '“x ‘y “z” y’ x”',
      "Nel '64 il 5% a pag. 12.",
    ]) {
      const once = typographic(input, 'it');
      expect(typographic(once, 'it')).toBe(once);
    }
  });
});

describe('Italian pack data', () => {
  test('ISG 6.5: comma for decimals, a fixed space between groups of three', () => {
    expect(it.numbers).toEqual({ group: NBSP, decimal: ',' });
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Aspettiamo? - chiese.')).toBe('—~Aspettiamo?~— chiese.');
    expect(t('- Aspettiamo? - chiese.', { register: 'literary' })).toBe('—~Aspettiamo?~— chiese.');
  });
});

import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types.ts';
import { typographic } from '../typography.ts';
import { nl } from './nl.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'nl', options).replaceAll(NBSP, '~');

wellFormed(nl, 'nl.test.ts');

// Sources read: Taaladvies.net "Dubbele of enkele aanhalingstekens bij een citaat" (Taalunie),
// nl.wikipedia "Aanhalingsteken" (apostrophe is not a quote mark), Vlaanderen Team Taaladvies
// "Procentteken (spatie)" and "Apostrof (taalkundige term, gebruik)".
describe('Dutch', () => {
  test('Taaladvies.net: double marks for the quotation, single inside it: “…” with ‘…’', () => {
    expect(t('"x \'y\' z"')).toBe('“x ‘y’ z”');
    expect(t('«x ‹y› z»')).toBe('“x ‘y’ z”');
  });

  test('the traditional „…” is read and set as “…”', () => {
    expect(t('„x ‚y’ z”')).toBe('“x ‘y’ z”');
  });

  test('Dutch marks already in place are kept', () => {
    expect(t('“x ‘y’ z”')).toBe('“x ‘y’ z”');
  });

  test('a third level starts over from “…”', () => {
    expect(t('“x ‘y “w” y’ x”')).toBe('“x ‘y “w” y’ x”');
  });

  test('Vlaanderen Team Taaladvies: ’s avonds outside a quotation keeps an apostrophe', () => {
    expect(t("Ze gaat 's avonds naar huis")).toBe('Ze gaat ’s avonds naar huis');
    expect(t('Ze gaat ’s avonds naar huis')).toBe('Ze gaat ’s avonds naar huis');
  });

  test('a written ’n feestje keeps its curly apostrophe (a straight one is not protected, see notes)', () => {
    expect(t('Ze gaat naar ’n feestje')).toBe('Ze gaat naar ’n feestje');
  });

  test('nl.wikipedia: ’t huis and ’m outside a quotation are apostrophes, not opening quotes', () => {
    expect(t("Ik zie 't huis en geef 'm een boek")).toBe('Ik zie ’t huis en geef ’m een boek');
  });

  test('zo’n and m’n are letters either side of the apostrophe', () => {
    expect(t("zo'n huis en m'n boek")).toBe('zo’n huis en m’n boek');
  });

  test('apostrophes inside a quotation, at its start and in the middle', () => {
    expect(t('Hij zei: "ik zie \'t huis en zo\'n boom"')).toBe(
      'Hij zei: “ik zie ’t huis en zo’n boom”',
    );
    expect(t('Hij zei: "kom \'s avonds"')).toBe('Hij zei: “kom ’s avonds”');
  });

  test('a one-word single quotation is still a quotation', () => {
    expect(t("Het woord 'huis' is kort")).toBe('Het woord “huis” is kort');
  });

  test('Taaladvies: percent is usually written without a space, so none is added', () => {
    expect(t('Een groei van 5% in 2025')).toBe('Een groei van 5% in 2025');
  });

  test('the goldens are idempotent', () => {
    for (const text of [
      '"x \'y\' z"',
      "Ze gaat 's avonds naar 'n feestje",
      "Ik zie 't huis en zo'n boom",
      'Hij zei: "ik zie \'t huis"',
      'Een groei van 5%',
    ]) {
      const once = typographic(text, 'nl');
      expect(typographic(once, 'nl')).toBe(once);
    }
  });
});

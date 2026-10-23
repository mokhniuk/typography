import { describe, expect, test } from 'bun:test';
import { typographic } from './index.ts';
import { NBSP } from './types.ts';

const t = (text: string, lang?: Parameters<typeof typographic>[1]) =>
  typographic(text, lang).replaceAll(NBSP, '~');

/** The output, and the output typeset again, are the expected text. */
const same = (text: string, expected: string, lang?: Parameters<typeof typographic>[1]) => {
  expect(t(text, lang)).toBe(expected);
  expect(t(typographic(text, lang), lang)).toBe(expected);
};

describe('an inch mark inside a quotation', () => {
  test('a " after a digit is an inch mark when a later " closes the quotation', () => {
    same('He said "a 5" hole" ok', 'He said “a~5" hole” ok');
    same('"a 5" hole"', '“a~5" hole”');
    same('"a 5" hole" and "b"', '“a~5" hole” and~“b”');
    same('"Cut a 2" pipe," he said.', '“Cut a~2" pipe,” he said.');
  });

  test('several inch marks inside one quotation', () => {
    same('"a 2" and a 4" pipe" ok', '“a~2" and~a~4" pipe” ok');
    same('"He is 5\'10" tall," she said.', '“He is 5\'10" tall,” she said.');
  });

  test('in another language the quotation takes its marks and the inch mark stays', () => {
    same('Er sagte "ein 5" Loch" heute.', 'Er sagte »ein 5" Loch« heute.', 'de');
    same('Disse "un tubo da 2" e basta" ieri.', 'Disse «un tubo da 2" e basta» ieri.', 'it');
  });

  test('a quotation that ends in a digit still closes when nothing later can close it', () => {
    same('"5"', '“5”');
    same('"a 5"', '“a~5”');
    same('call 911"', 'call 911"');
    same('He said "call 911" and left.', 'He said “call 911” and~left.');
    // The next " opens a quotation of its own (a space before it, a word after it).
    same('He said "call 911" and "b".', 'He said “call 911” and~“b”.');
    same('"I am 6" he said, "really"', '“I~am 6” he said, “really”');
    // A later inch mark cannot close the quotation either.
    same('"call 911" and the 4" pipe', '“call 911” and~the 4" pipe');
  });

  test('a later " in another paragraph does not close the quotation', () => {
    same('"call 911"\n\nthen he" left', '“call 911”\n\nthen he” left');
  });

  test('a quotation glued to a digit keeps both marks, as before', () => {
    same('5"a"', '5"a"');
    same('5"ab cd"', '5"ab cd"');
  });
});

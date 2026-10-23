import { describe, expect, test } from 'bun:test';
import { typesetHtml } from '../html/index.ts';
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

  test('only a quotation that opens where one opens holds an inch mark, and only before a space or punctuation', () => {
    // Glued to a word, as in a URL: read as before.
    same('see https://a.b/x?q="1"&r=a b" ok', 'see https://a.b/x?q=“1”&r=a~b” ok');
    // A letter straight after the mark: not an inch mark.
    same('"a 5"x y"', '“a~5”x y”');
    // A line break straight after the mark: the quotation ends there (a time, a list).
    same('"from 10:00-12:00"\n-- bc"', '“from 10:00–12:00”\n-- bc”');
  });

  test('the later " closes only after a letter or closing punctuation', () => {
    same('"5" --" kg', '“5” --” kg');
  });

  test('in HTML the later " closes across a tag', () => {
    expect(typesetHtml('<p>"a 5" <b>hole</b>" ok</p>', { lang: 'en', nbsp: 'char' })).toBe(
      `<p>“a${NBSP}5" <b>hole</b>” ok</p>`,
    );
  });

  test('a later " in another paragraph does not close the quotation', () => {
    same('"call 911"\n\nthen he" left', '“call 911”\n\nthen he” left');
    same('"call 911" now.\n\nThen he" left', '“call 911” now.\n\nThen he” left');
    // A single line break is inside the paragraph.
    same('"a 5" hole\nand more" ok', '“a~5" hole\nand~more” ok');
  });

  test('a quotation glued to a digit keeps both marks, as before', () => {
    same('5"a"', '5"a"');
    same('5"ab cd"', '5"ab cd"');
  });
});

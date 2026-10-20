import { describe, expect, test } from 'bun:test';
import { type Lang, RULE_IDS, typographic } from './index';

/** The engine with only `id` switched on (it is off by default). */
const only = (id: string, text: string, lang: Lang = 'en'): string =>
  typographic(text, lang, { disable: RULE_IDS.filter((other) => other !== id), enable: [id] });

describe('space.before-punctuation', () => {
  const run = (text: string, lang: Lang = 'en') => only('space.before-punctuation', text, lang);

  test('removes a space before , . ; : ! ? )', () => {
    expect(run('Hello , world . Yes ; no : ok ! Really ? (see this )')).toBe(
      'Hello, world. Yes; no: ok! Really? (see this)',
    );
  });
  test('French keeps the space before : ; ! ? but still tidies , . )', () => {
    expect(run('Oui : non ; bon ! vrai ? ici , la . (x )', 'fr')).toBe(
      'Oui : non ; bon ! vrai ? ici, la. (x)',
    );
  });
  test('leaves a decimal, a file extension and a comparison alone', () => {
    expect(run('a .5 and a .gitignore and a != b and a ?? b')).toBe(
      'a .5 and a .gitignore and a != b and a ?? b',
    );
  });
  test('leaves an ellipsis, a spaced time or ratio and emoticons alone', () => {
    expect(run('Well ... then 10 : 30 and 3 :2 fine :) and ;-) and :D')).toBe(
      'Well ... then 10 : 30 and 3 :2 fine :) and ;-) and :D',
    );
    expect(run('Well … then')).toBe('Well … then');
  });
  test('keeps line breaks and a space at a line start', () => {
    expect(run('one\n ,two\nthree \n. four')).toBe('one\n ,two\nthree \n. four');
  });
  test('is idempotent', () => {
    const once = run('a , b ;  c .');
    expect(run(once)).toBe(once);
  });
  test('is off by default', () => {
    expect(typographic('so , yes')).toBe('so , yes');
  });
});

describe('space.after-comma', () => {
  const run = (text: string) => only('space.after-comma', text);
  test('adds a space when a letter follows', () => {
    expect(run('a,b and Ünï,ça')).toBe('a, b and Ünï, ça');
  });
  test('not between digits, before a quote or bracket, or at a line end', () => {
    expect(run('1,5 and 1,000 and 3,14 and "a,"b (c,) d,\ne')).toBe(
      '1,5 and 1,000 and 3,14 and "a,"b (c,) d,\ne',
    );
  });
  test('not in an address, email or code span', () => {
    expect(run('see https://a.b/x,y and a,b@c.de and `p,q`')).toBe(
      'see https://a.b/x,y and a,b@c.de and `p,q`',
    );
  });
  test('is idempotent', () => {
    expect(run(run('a,b,c'))).toBe('a, b, c');
  });
});

describe('punctuation.double', () => {
  const run = (text: string) => only('punctuation.double', text);
  test('a run of ! or ? becomes one mark', () => {
    expect(run('Wow!!! Really?? What!!!!')).toBe('Wow! Really? What!');
  });
  test('?! and !? stay, and a long run beside them collapses', () => {
    expect(run('What?! No!? Hmm!!?')).toBe('What?! No!? Hmm!?');
  });
  test('leaves code-like uses alone: a ?? b, !!x, (!!y)', () => {
    expect(run('a ?? b and !!x and (!!y) and Hi!!there')).toBe(
      'a ?? b and !!x and (!!y) and Hi!!there',
    );
  });
  test('keeps !! inside a code span', () => {
    expect(run('Yes!! `a!!` ok')).toBe('Yes! `a!!` ok');
  });
});

describe('space.trailing', () => {
  const run = (text: string) => only('space.trailing', text);
  test('trims spaces and tabs at the end of every line, keeping the lines', () => {
    expect(run('a  \nb\t \n\nc   ')).toBe('a\nb\n\nc');
  });
  test('leaves a no-break space and inner spaces alone', () => {
    expect(run('a b \nc  d')).toBe('a b \nc  d');
  });
  test('keeps CRLF', () => {
    expect(run('a \r\nb ')).toBe('a\r\nb');
  });
});

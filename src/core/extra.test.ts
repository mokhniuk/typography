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
  test('never builds a ... out of spaced dots', () => {
    // A spaced ellipsis is a form of its own: it keeps its spaces (it used to lose the first one).
    expect(run('a .. . b and . . .')).toBe('a .. . b and . . .');
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
    expect(run('a b\u00A0\nc  d')).toBe('a b\u00A0\nc  d');
  });
  test('keeps CRLF', () => {
    expect(run('a \r\nb ')).toBe('a\r\nb');
  });
});

describe('symbol.plusminus', () => {
  const run = (text: string) => only('symbol.plusminus', text);
  test('+- before a digit becomes ±', () => {
    expect(run('Tolerance +-5 mm, (+-0.2) and +-10%')).toBe('Tolerance ±5 mm, (±0.2) and ±10%');
  });
  test('not after a letter or digit, not before a non-digit', () => {
    expect(run('a+-b and 1+-5 and x+-5 and +-x and +-')).toBe(
      'a+-b and 1+-5 and x+-5 and +-x and +-',
    );
  });
  test('runs before symbol.minus: no stray minus is left', () => {
    expect(typographic('+-5 and -5', 'en', { enable: ['symbol.plusminus'] })).toBe(
      '±5\u00A0and \u22125',
    );
  });
});

describe('symbol.fraction', () => {
  const run = (text: string) => only('symbol.fraction', text);
  test('1/2, 1/4 and 3/4 become ½ ¼ ¾ (and bind a short word after)', () => {
    expect(run('Add 1/2, 1/4 and 3/4.')).toBe('Add ½, ¼\u00A0and ¾.');
  });
  test('only as whole numbers: not 11/2, 1/20, a1/2, dates, 2/3, paths', () => {
    const text =
      '11/2 and 1/20 and a1/2 and 1/2/2026 and 2/3 and 5/1/2 and 0.1/2 and 1/2a and x/1/4';
    expect(run(text)).toBe(text);
  });
  test('not inside a web address', () => {
    expect(run('see https://a.b/1/2 now')).toBe('see https://a.b/1/2 now');
  });
  test('a mixed number keeps its integer: 2 1/2 becomes 2 ½', () => {
    expect(run('2 1/2 cups')).toBe('2 ½\u00A0cups');
  });
  test('binds a short word (up to nine letters) like space.number, and is stable', () => {
    expect(run('1/2 cup')).toBe('½\u00A0cup');
    expect(run(run('1/2 cup'))).toBe('½\u00A0cup');
    expect(run('1/2 of it and 3/4 kilometres')).toBe('½\u00A0of it and ¾ kilometres');
  });
});

describe('symbol.degree', () => {
  const run = (text: string) => only('symbol.degree', text);
  const out = '20\u00A0°C';
  test('every spelling of a temperature becomes number, no-break space, °C', () => {
    expect(run('20°C')).toBe(out);
    expect(run('20 °C')).toBe(out);
    expect(run('20 C')).toBe(out);
    expect(run('20\u00A0°C')).toBe(out);
    expect(run('20° C')).toBe(out);
    expect(run('68 F and -5 C and 3,5 °C')).toBe('68\u00A0°F and -5\u00A0°C and 3,5\u00A0°C');
  });
  test('two temperatures in a row are both read, in one pass', () => {
    expect(run('20 C 20 F and 20° C 68 F')).toBe('20\u00A0°C 20\u00A0°F and 20\u00A0°C 68\u00A0°F');
  });
  test('is idempotent on its own output and after space.number', () => {
    expect(run(out)).toBe(out);
    expect(typographic('20 °C and 20 C', 'en', { enable: ['symbol.degree'] })).toBe(
      `${out} and ${out}`,
    );
  });
  test('only a standalone C or F: not 20 Celsius, 20 Cat, 20C, 20 F1, a bare degree', () => {
    const text = '20 Celsius and 20 Cat and 20C and 20 F1 and 20° and 5 C.E. and B20 C';
    expect(run(text)).toBe(text);
  });
  test('a bare C or F after a label or a single letter is not a temperature', () => {
    const text = 'Vitamin C 5 C and Type 2 F and Section 5 C and Plan 3 F';
    expect(run(text)).toBe(text);
    expect(run('Vitamin C 5 °C')).toBe('Vitamin C 5\u00A0°C');
  });
});

describe('symbol.implies', () => {
  const run = (text: string) => only('symbol.implies', text);
  test('=> becomes ⇒', () => {
    expect(run('A => B and x=>y')).toBe('A ⇒ B and x⇒y');
  });
  test('not =>> , ==> , =>= or <=>', () => {
    expect(run('a =>> b ==> c =>= d <=> e')).toBe('a =>> b ==> c =>= d <=> e');
  });
  test('not inside a code span', () => {
    expect(run('`(x) => x` and a => b')).toBe('`(x) => x` and a ⇒ b');
  });
  test('runs after arrow: -> and => in one text', () => {
    expect(typographic('a -> b => c', 'en', { enable: ['symbol.implies'] })).toContain('⇒');
  });
});

describe('review findings', () => {
  const all = (text: string, lang: Lang = 'en') =>
    typographic(text, lang, {
      enable: [
        'space.before-punctuation',
        'space.after-comma',
        'punctuation.double',
        'space.trailing',
        'symbol.plusminus',
        'symbol.fraction',
        'symbol.degree',
        'symbol.implies',
      ],
    });
  const twice = (text: string, lang: Lang = 'en') => all(all(text, lang), lang);

  test('a space before a Markdown image is not a space before punctuation', () => {
    expect(only('space.before-punctuation', 'x [link](http://a.com) ![alt](i.png) y')).toBe(
      'x [link](http://a.com) ![alt](i.png) y',
    );
    expect(only('space.before-punctuation', 'see ![a](b) now')).toBe('see ![a](b) now');
    expect(only('space.before-punctuation', 'Wow ! really')).toBe('Wow! really');
  });

  test('a comma a letter follows is pulled in once and spaced once, in a single pass', () => {
    expect(all('Hello ,world')).toBe('Hello, world');
    expect(all('a, b ,c')).toBe('a, b, c');
    for (const text of ['Hello ,world', 'a, b ,c', 'a ,b', 'fr: Salut ,ça va']) {
      expect(twice(text)).toBe(all(text));
    }
    expect(only('space.before-punctuation', 'Hello ,world')).toBe('Hello,world');
  });

  test('a run of marks followed by a letter or digit is left whole', () => {
    expect(only('punctuation.double', 'Wow!!!x')).toBe('Wow!!!x');
    expect(only('punctuation.double', 'Wow!!!1')).toBe('Wow!!!1');
    expect(only('punctuation.double', 'Hi!!!Bob')).toBe('Hi!!!Bob');
    expect(only('punctuation.double', 'Wow!!!_x')).toBe('Wow!!!_x');
    expect(only('punctuation.double', 'Wow!!! ok')).toBe('Wow! ok');
  });

  test('a fraction before a closing quote is left, so a second pass cannot read it differently', () => {
    expect(only('symbol.fraction', '3/4" pipe')).toBe('3/4" pipe');
    expect(only('symbol.fraction', '1/2".')).toBe('1/2".');
    expect(only('symbol.fraction', 'add 3/4 cup')).toBe(`add ¾${'\u00A0'}cup`);
  });

  test('a spaced ellipsis keeps its spaces', () => {
    expect(only('space.before-punctuation', 'Wait . . . what')).toBe('Wait . . . what');
    expect(only('space.before-punctuation', 'a . . b')).toBe('a . . b');
  });

  test('a bare number and C or F is a temperature only in English', () => {
    expect(only('symbol.degree', 'It was 20 C today')).toBe(`It was 20${'\u00A0'}°C today`);
    expect(only('symbol.degree', 'Abschnitt 3 C und Punkt 2 F', 'de')).toBe(
      'Abschnitt 3 C und Punkt 2 F',
    );
    expect(only('symbol.degree', 'Pytanie 3 C, wariant 2 F', 'pl')).toBe(
      'Pytanie 3 C, wariant 2 F',
    );
    // With the degree sign it is read in every language.
    expect(only('symbol.degree', 'Heute 20°C', 'de')).toBe(`Heute 20${'\u00A0'}°C`);
  });
});

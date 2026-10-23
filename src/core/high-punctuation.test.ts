import { describe, expect, test } from 'bun:test';
import { highPunctuation } from './high-punctuation.ts';
import { type Lang, typographic } from './index.ts';
import { NBSP } from './types.ts';

/** U+202F, the narrow no-break space (shown as `^`; the no-break space U+00A0 as `~`). */
const NNBSP = '\u202F';
const show = (text: string) => text.replaceAll(NBSP, '~').replaceAll(NNBSP, '^');
const fr = (text: string, options?: Parameters<typeof typographic>[2]) =>
  show(typographic(text, 'fr', options));
const FR = { colon: NBSP, others: NNBSP };

describe('space.high-punctuation (French)', () => {
  test('a no-break space before a colon, a narrow one before ; ! ?', () => {
    expect(fr('Voici: le plan')).toBe('Voici~: le plan');
    expect(fr('à demain; sinon')).toBe('à demain^; sinon');
    expect(fr('Attention!')).toBe('Attention^!');
    expect(fr('Pourquoi?')).toBe('Pourquoi^?');
  });

  test('after a digit too', () => {
    expect(fr('En 2024? Oui: 12!')).toBe('En 2024^? Oui~: 12^!');
  });

  test('a typed space before the mark becomes the right no-break space', () => {
    expect(fr('Voici : le plan ; Pourquoi ? Attention !')).toBe(
      'Voici~: le plan^; Pourquoi^? Attention^!',
    );
    expect(fr('Pourquoi  ?')).toBe('Pourquoi^?');
    // A typed no-break space before ; ! ? is narrowed, a narrow one before : widened.
    expect(fr(`demain${NBSP}; sinon${NBSP}!`)).toBe('demain^; sinon^!');
    expect(fr(`Voici${NNBSP}: le plan`)).toBe('Voici~: le plan');
    expect(fr('Pourquoi\u2009?')).toBe('Pourquoi^?');
  });

  test('the right space already there is left as it is', () => {
    const right = `Voici${NBSP}: le plan${NNBSP}; Pourquoi${NNBSP}? Oui${NNBSP}!`;
    expect(typographic(right, 'fr')).toBe(right);
  });

  test('nothing between two punctuation marks: a run takes one space, before its first mark', () => {
    expect(fr('Quoi?! Non!!! Hein?? Ah!?')).toBe('Quoi^?! Non^!!! Hein^?? Ah^!?');
    expect(fr('Quoi ?!')).toBe('Quoi^?!');
  });

  test('nothing after an ellipsis, a full stop, a bracket or a quote mark', () => {
    expect(fr('Quoi…? Bien...! etc.: suite')).toBe('Quoi…? Bien…! etc.: suite');
    expect(fr('un mot (?) et [!] ici')).toBe('un mot (?) et [!] ici');
    expect(fr('« oui »? et « non »!')).toBe('«~oui~»? et «~non~»!');
  });

  test('inside a quotation, before the closing guillemet', () => {
    expect(fr('Il dit "Pourquoi?" et part.')).toBe('Il dit «~Pourquoi^?~» et part.');
  });

  test('nothing is set after the mark', () => {
    expect(fr('Voici:\tle plan')).toBe('Voici~:\tle plan');
    expect(fr('Pourquoi?\nParce que.')).toBe('Pourquoi^?\nParce que.');
  });

  test('never at a line start', () => {
    expect(fr('? non\n: oui\n; et\n! ah')).toBe('? non\n: oui\n; et\n! ah');
    expect(fr('un\n ? deux')).toBe('un\n ? deux');
  });

  test('a colon between digits is a time or a ratio, never high punctuation', () => {
    // (space.number binds a number to a short word after it, so each one ends a line here.)
    expect(fr('à 10:30\n13:52:45\nen 16:9\nratio 3:2')).toBe(
      'à 10:30\n13:52:45\nen 16:9\nratio 3:2',
    );
    expect(fr('10 : 30\n3 :2\n10h:30')).toBe('10 : 30\n3 :2\n10h:30');
  });

  test('a mark a letter or digit follows is not sentence punctuation', () => {
    expect(fr('a:b, x?y, a;b et Note:3')).toBe('a:b, x?y, a;b et Note:3');
  });

  test('emoticons and code-like marks are left as they are', () => {
    expect(fr('super:) et bien;-) ou ok:D et :P')).toBe('super:) et bien;-) ou ok:D et :P');
    expect(fr('a!=b et voir![image](x.png) et a?=b')).toBe('a!=b et voir![image](x.png) et a?=b');
    expect(fr('C:\\Users et C:/x')).toBe('C:\\Users et C:/x');
  });

  test('web addresses, emails and code spans are set aside', () => {
    expect(fr('Voir https://exemple.fr/a?b=1! et www.exemple.fr:8080 ou `x? y; z!`')).toBe(
      'Voir https://exemple.fr/a?b=1! et www.exemple.fr:8080 ou `x? y; z!`',
    );
  });

  test('a ? or ! before a closing bracket takes its space', () => {
    expect(fr('(vraiment?) et [non!]')).toBe('(vraiment^?) et [non^!]');
  });

  test('is idempotent', () => {
    const text = 'Voici : le plan ; Pourquoi?! Attention ! "Quoi?" 10:30';
    const once = typographic(text, 'fr');
    expect(typographic(once, 'fr')).toBe(once);
  });

  test('can be switched off, and is reported to onChange', () => {
    expect(fr('Pourquoi?', { disable: ['space.high-punctuation'] })).toBe('Pourquoi?');
    const changes: string[] = [];
    typographic('Pourquoi?', 'fr', { onChange: (change) => changes.push(change.rule) });
    expect(changes).toEqual(['space.high-punctuation']);
  });

  test('a font that cannot draw the narrow space keeps the text as typed there', () => {
    expect(fr('Voici: oui?', { avoid: NNBSP })).toBe('Voici~: oui?');
  });
});

describe('space.high-punctuation in other languages', () => {
  test('sets nothing in en, de and fr-CH (no pack field)', () => {
    const text = 'Why? Look: here; now! Pourquoi ? Voici : ça ; ok !';
    for (const lang of ['en', 'de', 'fr-CH'] as const satisfies readonly Lang[]) {
      expect(typographic(text, lang)).toBe(
        typographic(text, lang, { disable: ['space.high-punctuation'] }),
      );
    }
    expect(typographic('Pourquoi? Voici: ça', 'fr-CH')).toBe('Pourquoi? Voici: ça');
  });
});

describe('highPunctuation()', () => {
  test('only the marks the setting names', () => {
    expect(show(highPunctuation('Voici: oui?', { colon: NBSP }))).toBe('Voici~: oui?');
    expect(show(highPunctuation('Voici: oui?', { others: NNBSP }))).toBe('Voici: oui^?');
    expect(highPunctuation('Voici: oui?', {})).toBe('Voici: oui?');
  });

  test('at the start and the end of the text', () => {
    expect(highPunctuation('?', FR)).toBe('?');
    expect(show(highPunctuation('a?', FR))).toBe('a^?');
    expect(highPunctuation(' ?', FR)).toBe(' ?');
  });

  test('a letter outside the BMP counts as a letter where the engine sees one', () => {
    expect(['\u{1D51E}?', `\u{1D51E}${NNBSP}?`]).toContain(highPunctuation('\u{1D51E}?', FR));
  });
});

/** 4x the input takes under 8x the time (the shape of linear.test.ts). */
function scales(name: string, run: (text: string) => unknown, input: (n: number) => string) {
  const best = (text: string) => {
    let fastest = Number.POSITIVE_INFINITY;
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      run(text);
      fastest = Math.min(fastest, performance.now() - start);
    }
    return Math.max(fastest, 2);
  };
  test(`${name} scales linearly`, () => {
    run(input(2000));
    const small = best(input(10_000));
    const large = best(input(40_000));
    expect(large).toBeLessThan(small * 8);
  }, 30_000);
}

describe('highPunctuation() is linear', () => {
  const run = (text: string) => highPunctuation(text, FR);
  const rep = (unit: string) => (n: number) => unit.repeat(Math.ceil(n / unit.length));
  scales('on spaces then a mark', run, (n) => `a${' '.repeat(n)}?`);
  scales('on spaces then a letter', run, (n) => `${' '.repeat(n)}a`);
  scales('on a run of marks', run, rep('?'));
  scales('on "a ? "', run, rep('a ? '));
  scales('on "1:2"', run, rep('1:2'));
  scales('on " :"', run, rep(' :'));
});

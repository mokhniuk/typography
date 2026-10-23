import { describe, expect, test } from 'bun:test';
import { explain, NBSP, typographic } from './index.ts';
import { PACK } from './lang/index.ts';

/** The rule is off by default, so every case names it; `~` is a no-break space. */
const on = (text: string, lang: Parameters<typeof typographic>[1] = 'en') =>
  typographic(text, lang, { enable: ['space.short-word'] }).replaceAll(NBSP, '~');

describe('space.short-word', () => {
  test('is on by default (since 0.14.0), and off with disable', () => {
    expect(typographic('Welcome to the show')).toBe(`Welcome to${NBSP}the show`);
    expect(typographic('Welcome to the show', 'en', { disable: ['space.short-word'] })).toBe(
      'Welcome to the show',
    );
  });

  test('a short word stays with the word after it', () => {
    expect(on('Welcome to Kyiv')).toBe('Welcome to~Kyiv');
    expect(on('The end of the line')).toBe('The~end of~the line');
    expect(on('By the sea')).toBe('By~the sea');
  });

  test('never binds more than two words in a row', () => {
    expect(on('to the shop')).toBe('to~the shop');
    expect(on('in and of the house')).toBe('in~and of~the house');
  });

  test('only a whole word, and only before a word', () => {
    expect(on('tomorrow in Lviv')).toBe('tomorrow in~Lviv');
    expect(on('the toy')).toBe('the~toy');
    expect(on('Preto in')).toBe('Preto in');
    expect(on('come in .')).toBe('come in .');
    expect(on('come in')).toBe('come in');
  });

  test('every language with a list binds its own words', () => {
    expect(on('Vítejte do Prahy', 'cs')).toBe('Vítejte do~Prahy');
    expect(on('Zapraszamy do Gdańska', 'pl')).toBe('Zapraszamy do~Gdańska');
    expect(on('Vitajte do Košíc', 'sk')).toBe('Vitajte do~Košíc');
    expect(on('Ласкаво просимо до Києва', 'uk')).toBe('Ласкаво просимо до~Києва');
  });

  test('a language without a list is untouched', () => {
    expect(on('Willkommen in Berlin', 'de')).toBe('Willkommen in Berlin');
    expect(PACK.de.shortWords).toBeUndefined();
  });

  test('is stable, and explain names the rule', () => {
    const once = typographic('Welcome to the show', 'en', { enable: ['space.short-word'] });
    expect(typographic(once, 'en', { enable: ['space.short-word'] })).toBe(once);
    expect(explain('Welcome to Kyiv', 'en', { enable: ['space.short-word'] }).changes).toEqual([
      { rule: 'space.short-word', from: ' ', to: NBSP },
    ]);
  });
});

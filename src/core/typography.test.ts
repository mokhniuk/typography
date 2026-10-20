import { describe, expect, test } from 'bun:test';
import { explain, NBSP, RULE_IDS, RULES, splitHangs, typographic } from './index';

/** The rules output (and expect) non-breaking spaces, which look like spaces: show them as ~. */
const t = (
  text: string,
  lang?: Parameters<typeof typographic>[1],
  options?: Parameters<typeof typographic>[2],
) => typographic(text, lang, options).replaceAll(NBSP, '~');

const literary = { register: 'literary' } as const;

describe('quotes', () => {
  test('sets the site style «outer „inner“» from any source style', () => {
    expect(t('the “Polish-Soviet friendship”')).toBe('the «Polish-Soviet friendship»');
    expect(t('so "referendum of memory," then')).toBe('so «referendum of memory,» then');
    expect(t('„Erinnerung“ heute')).toBe('«Erinnerung» heute');
  });

  test('nests by level', () => {
    expect(t('“outer ‘inner’ outer”')).toBe('«outer „inner“ outer»');
    expect(t('"x \'y\' z"')).toBe('«x „y“ z»');
    expect(t('“x ‘y “z” y’ x”')).toBe('«x „y ‚z‘ y“ x»');
    expect(t('«x „y“ z»')).toBe('«x „y“ z»');
  });

  test('an apostrophe inside a quotation does not break it', () => {
    expect(t('He said “we’re here” today')).toBe('He said «we’re here» today');
    expect(t('He said "we\'re here" today')).toBe('He said «we’re here» today');
    expect(t('“outer ‘don’t panic’ outer”')).toBe('«outer „don’t panic“ outer»');
    expect(t('“Maria’s stone”')).toBe('«Maria’s stone»');
  });

  test('a quotation nested deeper than the profile has starts over', () => {
    expect(t('“x ‘y “z” y’ x”', 'de')).toBe('»x ›y »z« y‹ x«');
    expect(t('“x ‘y “z” y’ x”', 'pl')).toBe('„x «y „z” y» x”');
    expect(t('“1 ‘2 “3 ‘4’ 3” 2’ 1”')).toBe('«1 „2 ‚3 «4» 3‘ 2“ 1»');
  });

  test('converts a quoted single word and leaves apostrophes alone', () => {
    expect(t("as 'ours' — and Maria's stone")).toBe('as «ours»~— and Maria’s stone');
  });

  test('has a profile per language', () => {
    expect(t('“x ‘y’ z”', 'uk')).toBe('«x „y“ z»');
    expect(t('“x ‘y’ z”', 'de')).toBe('»x ›y‹ z«');
    expect(t('“x ‘y’ z”', 'pl')).toBe('„x «y» z”');
    expect(t('“x ‘y’ z”', 'ch')).toBe('«x ‹y› z»');
    expect(t('“x ‘y’ z”', 'fr')).toBe('«~x “y” z~»');
  });
});

describe('dashes', () => {
  test('a spaced hyphen or dash is an em dash with a non-breaking space before it', () => {
    expect(t('word - word')).toBe('word~— word');
    expect(t('word – word')).toBe('word~— word');
    expect(t('word — word')).toBe('word~— word');
    expect(t('word--word')).toBe('word~— word');
  });

  test('a hyphen between numbers is an en dash', () => {
    expect(t('21-26 September')).toBe('21–26~September');
    expect(t('2019-2024')).toBe('2019–2024');
    expect(t('10:00-12:00')).toBe('10:00–12:00');
  });

  test('a spaced range between numbers is an en dash too, not a sentence break', () => {
    expect(t('10:00 – 12:00')).toBe('10:00–12:00');
    expect(t('21 – 26 September')).toBe('21–26~September');
    expect(t('1914 - 1918')).toBe('1914–1918');
  });

  test('leaves identifiers, partial dates, phone numbers and descending pairs alone', () => {
    expect(t('2026-10')).toBe('2026-10');
    expect(t('030-1234')).toBe('030-1234');
    expect(t('+49 30 1234-5678')).toBe('+49 30 1234-5678');
    expect(t('ISO 9001-2')).toBe('ISO 9001-2');
    expect(t('score 3-1')).toBe('score 3-1');
  });

  test('leaves a seven-digit local phone number alone, but not a spaced range', () => {
    expect(t('call 555-1234')).toBe('call 555-1234');
    expect(t('call 555-1234 now')).toBe('call 555-1234~now');
    expect(t('555 - 1234')).toBe('555–1234');
  });

  test('leaves dates, chains and compounds alone', () => {
    expect(t('2026-10-19')).toBe('2026-10-19');
    expect(t('one-week, value-based, 20th- and 21st-century')).toBe(
      'one-week, value-based, 20th- and 21st-century',
    );
  });

  test('keeps a list marker at a line start', () => {
    expect(t('first\n- second')).toBe('first\n- second');
  });
});

describe('marks and symbols', () => {
  test('apostrophe, ellipsis, arrows', () => {
    expect(t("societies' complicity and don't")).toBe('societies’ complicity and don’t');
    expect(t("the '90s")).toBe('the ’90s');
    expect(t('wait...')).toBe('wait…');
    expect(t('a -> b <- c')).toBe('a~→ b ←~c');
  });

  test('© ® ™', () => {
    expect(t('(c) 2026 Vitsche')).toBe('©~2026~Vitsche');
    expect(t('(C) Vitsche')).toBe('© Vitsche');
    expect(t('Brand(R) and Brand(TM)')).toBe('Brand® and Brand™');
  });

  test('(c) as a list marker is left alone', () => {
    expect(t('(a), (b), (c) then')).toBe('(a), (b), (c) then');
  });
});

describe('arrows', () => {
  test('an arrow stays with the word it points from or to', () => {
    expect(t('Read more ->')).toBe('Read more~→');
    expect(t('<- Back to events')).toBe('←~Back to events');
    expect(t('Read more →')).toBe('Read more~→');
  });
});

describe('spaces', () => {
  test('titles and initials stay with the name', () => {
    expect(t('Prof. Dr. Oksana Dovgopolova')).toBe('Prof.~Dr.~Oksana Dovgopolova');
    expect(t('with K. Słoboda')).toBe('with K.~Słoboda');
  });

  test('numbers stay with what follows', () => {
    expect(t('21 September 2026')).toBe('21~September 2026');
    expect(t('15 people, 5 %')).toBe('15~people, 5~%');
    expect(t('2026 commemorations')).toBe('2026 commemorations');
  });

  test('e.V.', () => {
    expect(t('Vitsche e.V.')).toBe('Vitsche~e.V.');
  });

  test('one-letter words by language', () => {
    expect(t('a stone and I', 'en')).toBe('a~stone and I');
    expect(t('pamięć w kamieniu', 'pl')).toBe('pamięć w~kamieniu');
    expect(t('пам’ять в камені', 'uk')).toBe('пам’ять в~камені');
    expect(t('z. B. das', 'de')).toBe('z.~B. das');
  });

  test('collapses runs of spaces', () => {
    expect(t('stone   and  memory')).toBe('stone and memory');
  });
});

describe('text that is left alone', () => {
  test('web addresses, emails and code spans come back as they were', () => {
    expect(t('see https://example.com/12-15 (c) 2026')).toBe(
      'see https://example.com/12-15 ©~2026',
    );
    expect(t('write to a-b@example.org -> now')).toBe('write to a-b@example.org~→ now');
    expect(t('run `cmd -> out --force` now')).toBe('run `cmd -> out --force` now');
    expect(t('go to www.example.com/a--b and wait...')).toBe(
      'go to www.example.com/a--b and wait…',
    );
  });

  test('punctuation after an address is not part of it', () => {
    expect(t('see "https://example.com/x".')).toBe('see «https://example.com/x».');
    expect(t('(see https://example.com/x), then')).toBe('(see https://example.com/x), then');
    expect(t('at https://en.wikipedia.org/wiki/Foo_(bar).')).toBe(
      'at https://en.wikipedia.org/wiki/Foo_(bar).',
    );
    expect(t("at 'https://example.com'")).toBe('at «https://example.com»');
  });

  test('the text around them is still typeset', () => {
    expect(t('“quoted” https://a.b/c-d - and more')).toBe('«quoted» https://a.b/c-d~— and more');
  });
});

describe('an apostrophe that stands for dropped letters', () => {
  test('rock \'n\' roll is not a quotation', () => {
    expect(t("rock 'n' roll")).toBe('rock ’n’ roll');
    expect(t('“rock \'n\' roll” forever')).toBe('«rock ’n’ roll» forever');
    expect(t("Rock 'N' Roll")).toBe('Rock ’N’ Roll');
  });

  test('a leading apostrophe on \'til, \'em and \'cause is an apostrophe', () => {
    expect(t("'til dawn and 'em all")).toBe('’til dawn and ’em all');
    expect(t("Wait 'cause it's late, 'Til then")).toBe('Wait ’cause it’s late, ’Til then');
  });

  test('a quoted word that starts like one is still a quotation', () => {
    expect(t("the 'emergency' exit")).toBe('the «emergency» exit');
    expect(t("the 'til' button")).toBe('the «til» button');
  });

  test('is stable on its own output', () => {
    for (const s of ["rock 'n' roll", "'til dawn and 'em all"]) {
      expect(t(t(s))).toBe(t(s));
    }
  });
});

describe('a leading apostrophe on a year', () => {
  test('does not stop a quotation from pairing', () => {
    expect(t('“the ’90s were loud”')).toBe('«the ’90s were loud»');
    expect(t('"the \'90s were loud"')).toBe('«the ’90s were loud»');
    expect(t('“we left in ’24”')).toBe('«we left in ’24»');
  });

  test('a quoted number is still a quotation', () => {
    expect(t("as '12' says")).toBe('as «12» says');
  });
});

describe('literary register', () => {
  test('English is set the British way, ‘outer “inner” outer’, from any source style', () => {
    expect(t('“x ‘y’ z”', 'en', literary)).toBe('‘x “y” z’');
    expect(t('"x \'y\' z"', 'en', literary)).toBe('‘x “y” z’');
    expect(t('„x ‚y‘ z“', 'en', literary)).toBe('‘x “y” z’');
    expect(t('«x „y“ z»', 'en', literary)).toBe('‘x “y” z’');
  });

  test('a third level reopens with the single mark', () => {
    expect(t('“1 ‘2 “3” 2’ 1”', 'en', literary)).toBe('‘1 “2 ‘3’ 2” 1’');
  });

  test('apostrophes survive inside a quotation', () => {
    expect(t('“we’re in Maria’s house”', 'en', literary)).toBe('‘we’re in Maria’s house’');
    expect(t('"don\'t panic"', 'en', literary)).toBe('‘don’t panic’');
  });

  test('a plural possessive inside a single-quoted source ends the quotation (known limit)', () => {
    // Write the quotation in double quotes and the engine sets the level.
    expect(t('‘the dogs’ bone’')).not.toBe('«the dogs’ bone»');
    expect(t('"the dogs\' bone"', 'en', literary)).toBe('‘the dogs’ bone’');
  });

  test('Ukrainian keeps its quotes and sets a dialogue line with a dash', () => {
    expect(t('“x ‘y’ z”', 'uk', literary)).toBe('«x „y“ z»');
    expect(t('- Привіт, - сказав він.', 'uk', literary)).toBe('—~Привіт,~— сказав він.');
    expect(t('– Привіт', 'uk', literary)).toBe('—~Привіт');
    expect(t('— Привіт', 'uk', literary)).toBe('—~Привіт');
    expect(t('- «Привіт»', 'uk', literary)).toBe('—~«Привіт»');
  });

  test('a dash that does not open the paragraph is not a dialogue dash', () => {
    expect(t('- Привіт', 'uk', { ...literary, blockStart: false })).toBe('- Привіт');
    expect(t('first\n- second', 'uk', literary)).toBe('first\n- second');
    expect(t('Привіт, привіт', 'uk', literary)).toBe('Привіт, привіт');
    expect(t('-5 градусів', 'uk', literary)).toBe('−5~градусів');
  });

  test('the dialogue dash is Ukrainian and literary only', () => {
    expect(t('- Привіт', 'uk')).toBe('- Привіт');
    expect(t('- Hello', 'en', literary)).toBe('- Hello');
  });

  test('a language with no literary profile keeps its display rules', () => {
    const sample = '“x ‘y’ z” - and 21-26 September';
    for (const lang of ['de', 'pl', 'fr', 'ch'] as const) {
      expect(t(sample, lang, literary)).toBe(t(sample, lang));
    }
  });

  test('the display register is the default and unchanged', () => {
    expect(t('“x ‘y’ z”', 'en', { register: 'display' })).toBe('«x „y“ z»');
    expect(t('“x ‘y’ z”', 'en')).toBe(t('“x ‘y’ z”', 'en', { register: 'display' }));
  });

  test('is idempotent', () => {
    const sample = {
      en: '“a ‘b’ c” — and 21-26 September 2026, don’t... Prof. K. Słoboda',
      uk: '- Він сказав: “привіт ‘всім’” - і пішов... 21-26 вересня',
    };
    for (const lang of ['en', 'uk'] as const) {
      const once = typographic(sample[lang], lang, literary);
      expect(typographic(once, lang, literary)).toBe(once);
    }
  });
});

test('typographic is idempotent', () => {
  const sample =
    "“a ‘b’ c” — and 21-26 September 2026, Prof. Dr. K. Słoboda... don't (c) 2026 -> x";
  for (const lang of ['en', 'uk', 'de', 'pl', 'fr', 'ch'] as const) {
    const once = typographic(sample, lang);
    expect(typographic(once, lang)).toBe(once);
  }
});

describe('splitHangs', () => {
  const hung = (text: string, atStart = true) =>
    splitHangs(text, atStart)
      .filter((p) => p.hang)
      .map((p) => p.text);

  test('finds the opening mark of a paragraph', () => {
    expect(splitHangs('«Between» is', true)).toEqual([
      { text: '«', hang: true, lead: true },
      { text: 'Between» is', hang: false, lead: false },
    ]);
  });

  test('finds opening marks that start any word, and only those', () => {
    expect(hung('see (In)glorious «Bastards» and word(s) here')).toEqual(['(', '«']);
  });

  test('knows the opening marks of every profile', () => {
    expect(hung('„low“ and »de« and ‚x‘ and ›y‹')).toEqual(['„', '»', '‚', '›']);
  });

  test('hangs the British opening marks and leaves a dialogue dash alone', () => {
    expect(hung('‘a “b” c’ and ’90s')).toEqual(['‘', '“']);
    expect(hung(`—${NBSP}Привіт`)).toEqual([]);
  });

  test('treats a stack of opening marks as one run', () => {
    expect(hung('«„Eva Yakubovska“»')).toEqual(['«„']);
  });

  test('ignores a mark on its own or at the very end', () => {
    expect(hung('a ( b « ')).toEqual([]);
    expect(hung('open (')).toEqual([]);
  });

  test('a continuing text starts mid-word unless it opens with a space', () => {
    expect(hung('«quoted»', false)).toEqual([]);
    expect(hung(' «quoted»', false)).toEqual(['«']);
  });

  test('a non-breaking space also starts a word', () => {
    expect(hung(`a${NBSP}«quoted»`)).toEqual(['«']);
  });

  test('only the paragraph opener is lead', () => {
    const parts = splitHangs('«a» then «b»', true).filter((p) => p.hang);
    expect(parts.map((p) => p.lead)).toEqual([true, false]);
  });

  test('plain text comes back whole', () => {
    expect(splitHangs('nothing to hang', true)).toEqual([
      { text: 'nothing to hang', hang: false, lead: false },
    ]);
  });
});

describe('German quotations in a row', () => {
  test('two quotations are not read as one », und «', () => {
    expect(t('Er sagte "Haus" und "Tür".', 'de')).toBe('Er sagte »Haus« und »Tür«.');
    expect(t('Er sagte »Haus« und »Tür«.', 'de')).toBe('Er sagte »Haus« und »Tür«.');
    expect(t('Sie las „Das Haus“ und »die Tür« laut.', 'de')).toBe(
      'Sie las »Das Haus« und »die Tür« laut.',
    );
  });

  test('a text written «…» is read by where each mark stands', () => {
    expect(t('Er sagte «Haus» und «Tür».', 'de')).toBe('Er sagte »Haus« und »Tür«.');
  });

  test('a second pass over German output changes nothing', () => {
    const once = typographic('Sie las „Das Haus“ und „die „Tür“ im Haus“ laut.', 'de');
    expect(typographic(once, 'de')).toBe(once);
  });
});

describe('dash by language', () => {
  test('a break in the sentence is an em dash, a spaced en dash in German', () => {
    expect(t('x - y', 'en')).toBe('x~— y');
    expect(t('x - y', 'uk')).toBe('x~— y');
    expect(t('x - y', 'de')).toBe('x~– y');
    expect(t('x – y', 'de')).toBe('x~– y');
    expect(t('x -- y', 'de')).toBe('x~– y');
  });

  test('British literary English sets a spaced en dash too', () => {
    expect(t('x - y', 'en', literary)).toBe('x~– y');
    expect(t('x - y', 'uk', literary)).toBe('x~— y');
  });

  test('a range is still an en dash without spaces', () => {
    expect(t('21-26 - x', 'de')).toBe('21–26~– x');
  });
});

describe('abbreviations', () => {
  test('the parts stay together', () => {
    expect(t('z. B. das und d. h. dies', 'de')).toBe('z.~B. das und d.~h. dies');
    expect(t('і т. д. і т. п.', 'uk')).toBe('і~т.~д. і~т.~п.');
  });

  test('one that introduces something stays with it', () => {
    expect(t('Nr. 5, Abb. 2 und Tel. 030', 'de')).toBe('Nr.~5, Abb.~2~und Tel.~030');
    expect(t('вул. Хрещатик, м. Київ', 'uk')).toBe('вул.~Хрещатик, м.~Київ');
    expect(t('ul. Marszałkowska 5', 'pl')).toBe('ul.~Marszałkowska 5');
  });

  test('a page or number reference stays with its number only', () => {
    expect(t('siehe S. 12', 'de')).toBe('siehe S.~12');
    expect(t('see Fig. 2 and p. 5', 'en')).toBe('see Fig.~2~and p.~5');
    expect(t('Er ging. S. war da', 'de')).toBe('Er ging. S. war da');
    expect(t('the end. Fig. next', 'en')).toBe('the end. Fig. next');
  });

  test('a language with no list keeps its text', () => {
    expect(t('z. B. das', 'fr')).toBe('z. B. das');
  });
});

describe('symbols between numbers and with them', () => {
  test('a minus sign before a number', () => {
    expect(t('-5 °C and (-3)')).toBe('−5~°C and (−3)');
    expect(t('2026-10-19, a-5, tracking-[-0.01em]')).toBe('2026-10-19, a-5, tracking-[-0.01em]');
  });

  test('the letter x between numbers is a multiplication sign', () => {
    expect(t('1920x1080 and 10x15cm and 1x2x3')).toBe('1920×1080~and 10×15cm and 1×2×3');
    expect(t('3 x 4')).toBe('3~× 4');
    expect(t('12.5x3,5')).toBe('12.5×3,5');
  });

  test('not a hex number or an identifier', () => {
    expect(t('0x1F, v2x3, x2x3, 3xl, 2x faster')).toBe('0x1F, v2x3, x2x3, 3xl, 2x faster');
  });

  test('German and French set % and € apart from the number', () => {
    expect(t('5% und 49€', 'de')).toBe('5~% und 49~€');
    expect(t('5% et 49€', 'fr')).toBe('5~% et 49~€');
    expect(t('5% and 49€', 'en')).toBe('5% and 49€');
    expect(t('5% i 49€', 'pl')).toBe('5% i~49€');
  });
});

describe('a quote with no partner', () => {
  test('an opening one after a space, a closing one after a word', () => {
    expect(t('"first paragraph')).toBe('«first paragraph');
    expect(t('last words."')).toBe('last words.»');
    expect(t('and then "more')).toBe('and then «more');
  });

  test('a lone quote opens the level for the quotation inside it', () => {
    expect(t('"he said “yes” and left')).toBe('«he said „yes“ and left');
  });

  test('an inch mark is left alone', () => {
    expect(t('a 5\'10" man')).toBe('a~5\'10" man');
  });

  test('two inch marks in one text are not read as a quotation', () => {
    expect(t('A 2" pipe and a 4" pipe.')).toBe('A~2" pipe and a~4" pipe.');
    expect(t('He is 5\'10" and she is 5\'6" tall.')).toBe('He is 5\'10" and she is 5\'6" tall.');
    expect(t('Cut 2" off, then 3" more.', 'de')).toBe('Cut 2" off, then 3" more.');
  });

  test('a quotation that ends in a digit still closes, and one opens after a dash or a colon', () => {
    expect(t('He said "call 911" and left.')).toBe('He said «call 911» and left.');
    expect(t('He said: "stop"')).toBe('He said: «stop»');
    expect(t('Stop—"now"—he said.')).toBe('Stop—«now»—he said.');
  });

  test('literary text takes the marks of its register', () => {
    expect(t('"first', 'en', literary)).toBe('‘first');
    expect(t('last."', 'en', literary)).toBe('last.’');
  });
});

describe('rules', () => {
  test('every rule has an id, a description and a place in a group or on its own', () => {
    expect(RULES.map((r) => r.id)).toEqual(RULE_IDS as string[]);
    expect(new Set(RULE_IDS).size).toBe(RULE_IDS.length);
    for (const rule of RULES) {
      expect(rule.id).toMatch(/^[a-z]+(?:\.[a-z]+)?$/);
      expect(rule.about.length).toBeGreaterThan(10);
    }
  });

  test('a rule can be switched off by its id', () => {
    expect(t('21-26 - x', 'en', { disable: ['dash.range'] })).toBe('21-26~— x');
    expect(t('wait...', 'en', { disable: ['ellipsis'] })).toBe('wait...');
    expect(t('"x"', 'en', { disable: ['quote'] })).toBe('"x"');
  });

  test('a group switches off every rule in it, with or without .*', () => {
    expect(t('Prof. Dr. K. Słoboda 5 km', 'en', { disable: ['space'] })).toBe(
      'Prof. Dr. K. Słoboda 5 km',
    );
    expect(t('Prof. Dr. Oksana', 'en', { disable: ['space.*'] })).toBe('Prof. Dr. Oksana');
    expect(t('x - y 1-2', 'en', { disable: ['dash'] })).toBe('x - y 1-2');
  });

  test('a rule that is not on still leaves the others on', () => {
    expect(t('"x" - y', 'en', { disable: ['space'] })).toBe('«x»~— y');
  });

  test('an unknown rule is an error, not silence', () => {
    expect(() => typographic('x', 'en', { disable: ['dash.rnge'] })).toThrow(
      /Unknown typography rule/,
    );
    expect(() => typographic('x', 'en', { disable: ['spac'] })).toThrow(/Rules: quote/);
  });
});

describe('explain', () => {
  test('returns the output and each change with its rule', () => {
    const { output, changes } = explain('He said "hi"... 21-26 -> x');
    expect(output).toBe(typographic('He said "hi"... 21-26 -> x'));
    expect(changes.map((c) => c.rule)).toEqual(
      expect.arrayContaining(['quote', 'ellipsis', 'dash.range', 'arrow']),
    );
    expect(changes.filter((c) => c.rule === 'quote').map((c) => [c.from, c.to])).toEqual([
      ['"', '«'],
      ['"', '»'],
    ]);
    expect(changes.find((c) => c.rule === 'ellipsis')).toEqual({
      rule: 'ellipsis',
      from: '...',
      to: '…',
    });
  });

  test('text that needs no change reports none', () => {
    expect(explain('Plain text.').changes).toEqual([]);
  });

  test('a switched-off rule reports nothing', () => {
    const { changes } = explain('wait...', 'en', { disable: ['ellipsis'] });
    expect(changes).toEqual([]);
  });

  test('a no-break space is reported, not hidden', () => {
    const { changes } = explain('a - b');
    const dash = changes.find((c) => c.rule === 'dash.sentence');
    expect(dash?.to).toContain('—');
    expect(dash?.to.includes(NBSP)).toBe(true);
  });
});

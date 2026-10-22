import { describe, expect, test } from 'bun:test';
import { EXAMPLES, runOnly } from '../../scripts/gen-rules-doc';
import { insertedCharacters, insertedGlyphs, ruleGlyphs } from './glyphs';
import { explain, LANGS, NBSP, RULE_IDS, RULES, typographic } from './index';

describe('the characters the rules insert', () => {
  test('every rule has an entry, and no entry names a rule that is gone', () => {
    const glyphs = ruleGlyphs();
    expect(Object.keys(glyphs).sort()).toEqual([...RULE_IDS].sort());
  });

  test('the quote marks and the separators come from the packs', () => {
    for (const lang of LANGS) {
      const own = ruleGlyphs(lang);
      expect(own.quote).toContain('“');
      expect(insertedCharacters(lang)).toContain(own.quote?.[0] ?? '');
    }
    expect(ruleGlyphs('en').quote).toContain('«');
    expect(ruleGlyphs('de').quote).toContain('»');
    expect(ruleGlyphs('en')['number.group']).toBe(',');
    expect(ruleGlyphs()['number.group']).toContain(',');
  });

  test('the glyph list is the character list without the no-break space', () => {
    expect(insertedCharacters()).toContain(NBSP);
    expect(insertedGlyphs()).not.toContain(NBSP);
    expect(insertedGlyphs()).toContain('…');
  });
});

describe('avoid', () => {
  test('a rule that would insert an avoided character leaves the text as it was', () => {
    expect(typographic('Wait... what?', 'en', { avoid: '…' })).toBe('Wait... what?');
    expect(typographic('He said "stone"', 'en', { avoid: '«»' })).toBe('He said "stone"');
    expect(typographic('Read more ->', 'en', { avoid: '→' })).toBe('Read more ->');
    expect(typographic('It was -5', 'en', { avoid: '−' })).toBe('It was -5');
  });

  test('the other changes of the same rule still happen', () => {
    expect(
      typographic('A 1/2 cup and 1/4', 'en', { avoid: '¼', enable: ['symbol.fraction'] }),
    ).toBe(`A${NBSP}½${NBSP}cup and${NBSP}1/4`);
  });

  test('the quotation rule keeps every mark as typed when one of them is avoided', () => {
    // Its marks come in pairs: half a converted quotation is worse than one left alone.
    expect(typographic('Řekl "dům" a odešel', 'cs', { avoid: '„' })).toBe(
      `Řekl "dům" a${NBSP}odešel`,
    );
    expect(typographic('He said "x" and "y"...', 'en', { avoid: '«' })).toBe(
      `He said "x" and${NBSP}"y"…`,
    );
    // Avoiding the inner level keeps the outer pair too: they are one rule's work. The straight
    // marks then stay as typed, and the apostrophe rule claims the single one, as it does whenever
    // the quotation rule leaves it (the same output as `disable: ['quote']`).
    expect(typographic(`He said "we said 'no' twice"`, 'en', { avoid: '„“' })).toBe(
      typographic(`He said "we said 'no' twice"`, 'en', { disable: ['quote'] }),
    );
    // A rule whose changes stand on their own still drops one change at a time.
    expect(
      typographic('A 1/2 cup and 1/4', 'en', { avoid: '¼', enable: ['symbol.fraction'] }),
    ).toBe(`A${NBSP}½${NBSP}cup and${NBSP}1/4`);
  });

  test('nothing is reported for a change that was dropped', () => {
    expect(explain('Wait... what?', 'en', { avoid: '…' }).changes).toEqual([]);
    const { changes } = explain('Wait... what? Read more ->', 'en', { avoid: '…' });
    expect(changes.map((change) => change.rule)).toEqual(['arrow', 'space.arrow']);
  });

  test('a no-break space can be avoided too, and the plain space stays', () => {
    expect(typographic('21 September', 'en', { avoid: NBSP })).toBe('21 September');
  });

  test('is stable on its own output, and an empty list changes nothing', () => {
    const once = typographic('He said "wait..." - 21 September 1/2', 'en', { avoid: '…½' });
    expect(typographic(once, 'en', { avoid: '…½' })).toBe(once);
    expect(typographic('He said "stone"... ->', 'en', { avoid: '' })).toBe(
      typographic('He said "stone"... ->'),
    );
  });

  test('every rule with characters of its own keeps the original when they are avoided', () => {
    for (const rule of RULES) {
      const glyphs = ruleGlyphs()[rule.id] ?? '';
      if (!glyphs) continue;
      for (const example of EXAMPLES[rule.id] ?? []) {
        const own = ruleGlyphs(example.lang ?? 'en')[rule.id] ?? '';
        const kept = runOnly(rule.id, { ...example, avoid: own });
        expect(kept, `${rule.id}: ${JSON.stringify(example.input)}`).toBe(example.input);
      }
    }
  });
});

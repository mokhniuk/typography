import { describe, expect, test } from 'bun:test';
import { digest } from '../../scripts/gen-quote-fixture';
import { PACKS } from './lang';
import { quotes } from './quotes';
import mainFixture from './quotes.fixture.json';
import loneFixture from './quotes.lone.fixture.json';

// `quotes.fixture.json` was generated once from the frozen engine (the source before the speed work, commit 8a34c24; `speed-baseline` has since moved) by
// `scripts/gen-quote-fixture.ts`: adversarial quote inputs run through every language, register and
// quote style. A speed change to `quotes.ts` must reproduce every output byte for byte.
// `quotes.lone.fixture.json` is the second class (`loneInputs`): long runs of one mark, many lone marks, mixes.
for (const [name, fixture] of [
  ['', mainFixture],
  ['lone marks, ', loneFixture],
] as const) {
  describe(`quotes against the frozen engine (${name}${fixture.inputs.length} inputs)`, () => {
    const codes = PACKS.map((pack) => pack.code);
    const got = digest(
      (text, lang, register, style) =>
        quotes(text, lang as never, register as never, style as never),
      codes,
      fixture.inputs,
    );

    test('the combinations are the packs, registers and styles', () => {
      expect(got.combos).toEqual(fixture.combos);
    });

    test('every input gives the frozen output in every combination', () => {
      const bad = fixture.inputDigests
        .map((expected, i) => (got.inputDigests[i] === expected ? -1 : i))
        .filter((i) => i >= 0);
      // The first few failing inputs, with the frozen output when the fixture stored it for this combination.
      const shown = bad.slice(0, 5).map((i) => ({
        i,
        input: fixture.inputs[i],
        combo: fixture.combos[i % fixture.combos.length],
        frozen: fixture.sample[i],
        now: got.sample[i],
      }));
      expect({ count: bad.length, shown }).toEqual({ count: 0, shown: [] });
    });

    test('every combination digests to the frozen one', () => {
      const bad = fixture.comboDigests.flatMap((expected, c) =>
        got.comboDigests[c] === expected ? [] : [fixture.combos[c]],
      );
      expect(bad).toEqual([]);
    });

    test('the stored sample outputs match', () => {
      expect(got.sample).toEqual(fixture.sample);
    });
  });
}

// A long run of one mark used to be quadratic (the fix-point over opening marks): 40,000 of them took a minute.
describe('quotes on long runs of one mark', () => {
  for (const mark of ['“', '«', '„', '”', '"']) {
    test(`40,000 ${mark} are read in linear time`, () => {
      const start = performance.now();
      for (const text of [
        `x ${mark.repeat(40000)}y`,
        `x ${mark.repeat(40000)}`,
        mark.repeat(40000),
      ]) {
        expect(quotes(text, 'en', 'display', 'language').length).toBe(text.length);
      }
      expect(performance.now() - start).toBeLessThan(1500);
    });
  }
});

// A refused inch mark (`5"x"`) is looked up once per lone closer: the cost stays that of the marks.
describe('quotes on long runs of glued quotations', () => {
  test('480 KB of 5"x"» are read in linear time', () => {
    const text = '5"x"» '.repeat(80000);
    const start = performance.now();
    expect(quotes(text, 'en', 'display', 'language').length).toBeGreaterThan(0);
    expect(performance.now() - start).toBeLessThan(1500);
  });
});

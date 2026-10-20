import { describe, expect, test } from 'bun:test';
import { digest } from '../../scripts/gen-quote-fixture';
import fixture from './quotes.fixture.json';
import { PACKS } from './lang';
import { quotes } from './quotes';

// `quotes.fixture.json` was generated once from the frozen engine (`speed-baseline`) by
// `scripts/gen-quote-fixture.ts`: adversarial quote inputs run through every language, register and
// quote style. A speed change to `quotes.ts` must reproduce every output byte for byte.
describe('quotes against the frozen engine', () => {
  const codes = PACKS.map((pack) => pack.code);
  const got = digest(
    (text, lang, register, style) => quotes(text, lang as never, register as never, style as never),
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
    const bad = fixture.comboDigests.flatMap((expected, c) => (got.comboDigests[c] === expected ? [] : [fixture.combos[c]]));
    expect(bad).toEqual([]);
  });

  test('the stored sample outputs match', () => {
    expect(got.sample).toEqual(fixture.sample);
  });
});

import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types.ts';
import { typographic } from '../typography.ts';
import { ch } from './ch.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'ch', options).replaceAll(NBSP, '~');

wellFormed(ch, 'ch.test.ts');

describe('Swiss', () => {
  test('quotes are «…» with ‹…› inside, no space inside the marks', () => {
    expect(t('“x ‘y’ z”')).toBe('«x ‹y› z»');
  });

  test('the sentence dash is the em dash, unlike German', () => {
    expect(t('x - y')).toBe('x~— y');
  });
});

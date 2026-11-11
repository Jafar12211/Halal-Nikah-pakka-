import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeLanguageCode } from './translations';

test('restores English, Telugu and Urdu language preferences', () => {
  assert.equal(normalizeLanguageCode('en'), 'en');
  assert.equal(normalizeLanguageCode('te'), 'te');
  assert.equal(normalizeLanguageCode('ur'), 'ur');
});

test('falls back safely for missing or unsupported language preferences', () => {
  assert.equal(normalizeLanguageCode(null), 'en');
  assert.equal(normalizeLanguageCode(undefined), 'en');
  assert.equal(normalizeLanguageCode('fr'), 'en');
  assert.equal(normalizeLanguageCode('UR'), 'en');
});

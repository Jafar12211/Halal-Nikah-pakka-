import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mergeAdminClaims } from '../../scripts/admin-claims.mjs';

test('adds admin claim without discarding existing custom claims', () => {
  assert.deepEqual(
    mergeAdminClaims({ support: true, region: 'staging' }),
    { support: true, region: 'staging', admin: true },
  );
});

test('sets admin claim for users without existing custom claims', () => {
  assert.deepEqual(mergeAdminClaims(), { admin: true });
});

test('rejects malformed custom claims rather than silently replacing them', () => {
  assert.throws(() => mergeAdminClaims(null), /must be an object/);
  assert.throws(() => mergeAdminClaims([]), /must be an object/);
});

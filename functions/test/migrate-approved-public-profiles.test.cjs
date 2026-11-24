'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { toPublicProfile } = require('../scripts/migrate-approved-public-profiles.cjs');

test('publishes only approved, verified profiles and strips private fields', () => {
  const source = {
    userId: 'candidate-1',
    candidateName: 'A Candidate',
    gender: 'bride',
    age: 25,
    height: '5\'4"',
    maritalStatus: 'Never Married',
    religion: { sect: 'Sunni', salah: 'Daily', guardianPhone: 'must-not-copy' },
    education: 'Graduate',
    profession: 'Teacher',
    employedIn: 'Private',
    annualIncomeRange: 'Not disclosed',
    district: 'East Godavari',
    mandalCity: 'Yanam',
    motherTongue: 'Urdu',
    partnerPreferences: { minAge: 25, maxAge: 32, privateContact: 'must-not-copy' },
    mustHaves: ['Kindness'],
    dealBreakers: ['Smoking'],
    aboutCandidate: 'A short introduction',
    photos: ['profilePhotos/candidate-1/items/photo-1', 'data:image/jpeg;base64,private'],
    photoPrivacy: 'visible',
    avatarInitials: 'AC',
    avatarBgColor: '#047857',
    documents: [{ storagePath: 'identityDocuments/candidate-1/items/id-1' }],
    guardianWaliContact: { phone: '+910000000000' },
    familyDetails: { fatherNameAndOcc: 'Private' },
    email: 'private@example.com',
    phone: '+910000000000',
    approvalNotes: 'Private review notes',
    approvalStatus: 'approved',
    isVerified: true,
    favoritesCount: 1,
    interestsReceivedCount: 2,
  };

  const result = toPublicProfile('candidate-1', source, 'timestamp');
  assert.ok(result);
  assert.deepEqual(result.photos, ['profilePhotos/candidate-1/items/photo-1']);
  assert.deepEqual(result.documents, []);
  assert.equal(result.userId, 'candidate-1');
  for (const privateKey of ['guardianWaliContact', 'familyDetails', 'email', 'phone', 'approvalNotes']) {
    assert.equal(Object.hasOwn(result, privateKey), false);
  }
  assert.equal(Object.hasOwn(result.religion, 'guardianPhone'), false);
  assert.equal(Object.hasOwn(result.partnerPreferences, 'privateContact'), false);
});

test('does not publish pending, unverified, or invalid registrations', () => {
  const base = {
    userId: 'candidate-1',
    candidateName: 'A Candidate',
    gender: 'bride',
    age: 25,
    maritalStatus: 'Never Married',
    approvalStatus: 'approved',
    isVerified: true,
  };
  assert.equal(toPublicProfile('candidate-1', { ...base, approvalStatus: 'pending' }), null);
  assert.equal(toPublicProfile('candidate-1', { ...base, isVerified: false }), null);
  assert.equal(toPublicProfile('candidate-1', { ...base, age: 17 }), null);
  assert.equal(toPublicProfile('another-user', base), null);
});

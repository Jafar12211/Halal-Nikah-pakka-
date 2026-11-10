import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterProfiles,
  calculateCompatibilityScore,
  validateRegistrationForm,
  generateWhatsAppShareMessage,
  generateBiodataText,
  OFFICIAL_REGISTRATION_URL,
  RegistrationInput
} from './matrimony';
import { MatrimonyProfile, FilterState } from '../types/matrimony';

const sampleProfile: MatrimonyProfile = {
  id: 'np-101',
  registeredBy: 'parent',
  registrantName: 'Mohammed Abdul Raheem (Father)',
  candidateName: 'Dr. Fatima Raheem',
  gender: 'bride',
  age: 26,
  height: `5'4"`,
  maritalStatus: 'Never Married',
  city: 'Hyderabad',
  stateCountry: 'Telangana, India',
  motherTongue: 'Urdu',
  sect: 'Sunni Hanafi',
  religiousPractice: {
    salah: '5 times daily',
    hijabOrBeard: 'Observes Hijab/Niqab',
    quranRecitation: 'Daily',
    halalDiet: true,
    hajjUmrahDone: true,
  },
  education: 'MBBS, MD Pediatrics',
  profession: 'Pediatric Specialist',
  employedIn: 'Defense / Healthcare',
  annualIncomeRange: '₹14 - 18 Lakhs',
  familyDetails: {
    fatherNameAndOcc: 'Er. Mohammed Abdul Raheem (Retd. Chief Engineer)',
    motherNameAndOcc: 'Tahira Begum (Homemaker)',
    brothersCount: 1,
    brothersMarried: 1,
    sistersCount: 1,
    sistersMarried: 0,
    nativePlace: 'Hyderabad',
    familyValues: 'Traditional & Practicing'
  },
  partnerPreferences: {
    minAge: 27,
    maxAge: 32,
    educationPreference: 'Doctor, Engineer, or Professional Master degree',
    maritalStatusPreference: ['Never Married'],
    locationPreference: ['Hyderabad', 'Bengaluru', 'Dubai'],
    religiosityPreference: 'Practicing, 5 times Salah'
  },
  aboutCandidate: 'Alhamdulillah well-mannered, deen-conscious, balanced between professional medical practice and Islamic family values.',
  guardianWaliContact: {
    name: 'Mohammed Abdul Raheem',
    relationship: 'Father',
    phone: '+91 98490 12345',
    preferredCallTime: '6:00 PM - 9:00 PM',
    visibility: 'verified_families_only'
  },
  isVerified: true,
  verificationBadge: 'Family Reference Verified',
  photoPrivacy: 'blurred_until_request',
  avatarInitials: 'FR',
  avatarBgColor: '#047857',
  createdAt: '2026-03-01',
  interestsCount: 12
};

test('filterProfiles filters correctly by gender and age', () => {
  const profiles: MatrimonyProfile[] = [
    sampleProfile,
    {
      ...sampleProfile,
      id: 'np-102',
      candidateName: 'Zayd Khan',
      gender: 'groom',
      age: 29,
      city: 'Bengaluru'
    }
  ];

  const filterBride: FilterState = {
    gender: 'bride',
    city: 'All Cities',
    sect: 'All Sects',
    maritalStatus: 'All',
    minAge: 20,
    maxAge: 30,
    education: 'All',
    searchQuery: '',
    userCity: 'All Cities',
    radiusKm: 0,
  };

  const results = filterProfiles(profiles, filterBride);
  assert.equal(results.length, 1);
  assert.equal(results[0].candidateName, 'Dr. Fatima Raheem');

  const filterCity: FilterState = {
    ...filterBride,
    gender: 'all',
    city: 'Bengaluru'
  };
  const cityResults = filterProfiles(profiles, filterCity);
  assert.equal(cityResults.length, 1);
  assert.equal(cityResults[0].candidateName, 'Zayd Khan');
});

test('calculateCompatibilityScore awards points for Salah and Verification', () => {
  const result = calculateCompatibilityScore(sampleProfile, { minAge: 25, maxAge: 30 });
  assert.ok(result.score >= 85);
  assert.ok(result.highlights.includes('Punctual with 5 daily Salah'));
  assert.ok(result.highlights.includes('Manually verified family background'));
});

test('validateRegistrationForm rejects missing essential fields', () => {
  const invalidData: RegistrationInput = {
    registeredBy: 'self',
    registrantName: '',
    candidateName: '',
    gender: '',
    age: 16,
    height: '',
    maritalStatus: 'Never Married',
    city: '',
    motherTongue: '',
    sect: '',
    salah: '',
    education: '',
    profession: '',
    annualIncomeRange: '',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '123',
    consentConfirmed: false
  };

  const result = validateRegistrationForm(invalidData);
  assert.equal(result.isValid, false);
  assert.ok(result.errors.candidateName);
  assert.ok(result.errors.gender);
  assert.ok(result.errors.age);
  assert.ok(result.errors.guardianName);
  assert.ok(result.errors.guardianPhone);
  assert.ok(result.errors.consentConfirmed);
});

test('validateRegistrationForm accepts valid candidate profile', () => {
  const validData: RegistrationInput = {
    registeredBy: 'parent',
    registrantName: 'Mr. Khan',
    candidateName: 'Omar Khan',
    gender: 'groom',
    age: 28,
    height: `5'11"`,
    maritalStatus: 'Never Married',
    city: 'Hyderabad',
    motherTongue: 'Urdu',
    sect: 'Sunni Hanafi',
    salah: '5 times daily',
    education: 'B.Tech Computer Science',
    profession: 'Software Architect',
    annualIncomeRange: '₹18 - 25 Lakhs',
    guardianName: 'Mohammed Khan',
    guardianRelation: 'Father',
    guardianPhone: '+91 9876543210',
    consentConfirmed: true
  };

  const result = validateRegistrationForm(validData);
  assert.equal(result.isValid, true);
  assert.equal(Object.keys(result.errors).length, 0);
});

test('generateWhatsAppShareMessage generates encoded text with registration link', () => {
  const encoded = generateWhatsAppShareMessage();
  const decoded = decodeURIComponent(encoded);
  assert.ok(decoded.includes('NIKAH PAKKA'));
  assert.ok(decoded.includes(OFFICIAL_REGISTRATION_URL));
  assert.equal(decoded.includes('freebuff.page/profile'), false);
  assert.ok(decoded.includes('Our Small Request'));
});

test('generateBiodataText produces complete structured biodata with Wali contact', () => {
  const text = generateBiodataText(sampleProfile);
  assert.ok(text.includes('NIKAH PAKKA - VERIFIED MATRIMONIAL BIODATA'));
  assert.ok(text.includes('Dr. Fatima Raheem'));
  assert.ok(text.includes('Mohammed Abdul Raheem'));
  assert.ok(text.includes('5 times daily'));
});

test('VALID_GOVT_DOC_TYPES strictly accepts only Aadhaar, PAN, Passport, and Driving Licence', async () => {
  const { VALID_GOVT_DOC_TYPES, isValidGovtDocType, maskGovtIdNumber } = await import('./matrimony');

  assert.deepEqual([...VALID_GOVT_DOC_TYPES], ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving Licence']);
  assert.equal(isValidGovtDocType('Aadhaar Card'), true);
  assert.equal(isValidGovtDocType('PAN Card'), true);
  assert.equal(isValidGovtDocType('Passport'), true);
  assert.equal(isValidGovtDocType('Driving Licence'), true);

  // Rejects other document types
  assert.equal(isValidGovtDocType('Voter ID'), false);
  assert.equal(isValidGovtDocType('Ration Card'), false);
  assert.equal(isValidGovtDocType('College ID'), false);

  // Test masking
  assert.equal(maskGovtIdNumber('123456787860', 'Aadhaar Card'), 'XXXX-XXXX-7860');
  assert.equal(maskGovtIdNumber('ABCDE1234F', 'PAN Card'), 'XXXX-XX-234F');
  assert.equal(maskGovtIdNumber('M1234567', 'Passport'), 'PASS-XXXX-4567');
  assert.equal(maskGovtIdNumber('AP0420210009876', 'Driving Licence'), 'DL-XXXX-9876');
});


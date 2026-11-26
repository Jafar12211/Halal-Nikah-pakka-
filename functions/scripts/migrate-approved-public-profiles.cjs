'use strict';

const ALLOWED_RELIGION_KEYS = [
  'sect', 'salah', 'hijabOrBeard', 'quranRecitation',
  'fastingRamadan', 'halalDiet',
];
const ALLOWED_PREFERENCE_KEYS = [
  'minAge', 'maxAge', 'minHeight', 'preferredDistricts',
  'educationPreference', 'maritalStatusPreference', 'religiosityPreference',
];
const VALID_GENDERS = new Set(['bride', 'groom']);
const VALID_MARITAL_STATUSES = new Set(['Never Married', 'Divorced', 'Widowed']);

function pickMap(source, allowedKeys) {
  const input = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
  return Object.fromEntries(allowedKeys.filter((key) => Object.hasOwn(input, key)).map((key) => [key, input[key]]));
}

function stringList(value, max = 30) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').slice(0, max)
    : [];
}

/**
 * Convert one already-approved private registration into the strict public
 * allowlist. Guardian contacts, family details, identity documents, email,
 * phone, approval notes, and all other private fields are never copied.
 */
function toPublicProfile(uid, data, serverTimestamp = new Date().toISOString()) {
  if (
    !uid ||
    data?.userId !== uid ||
    data?.approvalStatus !== 'approved' ||
    data?.isVerified !== true ||
    typeof data?.candidateName !== 'string' ||
    !data.candidateName.trim() ||
    !VALID_GENDERS.has(data.gender) ||
    !Number.isFinite(Number(data.age)) ||
    Number(data.age) < 18 ||
    Number(data.age) > 100 ||
    !VALID_MARITAL_STATUSES.has(data.maritalStatus)
  ) {
    return null;
  }

  const photoPrivacy = data.photoPrivacy === 'visible' ? 'visible' : 'avatar_only';
  const photos = photoPrivacy === 'visible' && Array.isArray(data.photos)
    ? data.photos
        .filter((photo) => typeof photo === 'string' && photo.startsWith(`profilePhotos/${uid}/`))
        .slice(0, 10)
    : [];

  return {
    userId: uid,
    candidateName: data.candidateName.trim().slice(0, 100),
    gender: data.gender,
    age: Number(data.age),
    height: typeof data.height === 'string' ? data.height : '',
    maritalStatus: data.maritalStatus,
    religion: pickMap(data.religion, ALLOWED_RELIGION_KEYS),
    education: typeof data.education === 'string' ? data.education : '',
    profession: typeof data.profession === 'string' ? data.profession : '',
    employedIn: typeof data.employedIn === 'string' ? data.employedIn : '',
    annualIncomeRange: typeof data.annualIncomeRange === 'string' ? data.annualIncomeRange : '',
    district: typeof data.district === 'string' ? data.district : '',
    mandalCity: typeof data.mandalCity === 'string' ? data.mandalCity : '',
    motherTongue: typeof data.motherTongue === 'string' ? data.motherTongue : '',
    partnerPreferences: pickMap(data.partnerPreferences, ALLOWED_PREFERENCE_KEYS),
    mustHaves: stringList(data.mustHaves),
    dealBreakers: stringList(data.dealBreakers),
    aboutCandidate: typeof data.aboutCandidate === 'string' ? data.aboutCandidate : '',
    photos,
    photoPrivacy,
    avatarInitials: typeof data.avatarInitials === 'string' ? data.avatarInitials : '',
    avatarBgColor: typeof data.avatarBgColor === 'string' ? data.avatarBgColor : '#047857',
    documents: [],
    isVerified: true,
    approvalStatus: 'approved',
    createdAt: data.createdAt || serverTimestamp,
    updatedAt: serverTimestamp,
    favoritesCount: Number.isFinite(Number(data.favoritesCount)) && Number(data.favoritesCount) >= 0 ? Number(data.favoritesCount) : 0,
    interestsReceivedCount: Number.isFinite(Number(data.interestsReceivedCount)) && Number(data.interestsReceivedCount) >= 0 ? Number(data.interestsReceivedCount) : 0,
  };
}

function toProfilePreview(data) {
  const age = Number(data?.age);
  if (
    data?.approvalStatus !== 'approved' ||
    data?.isVerified !== true ||
    !VALID_GENDERS.has(data?.gender) ||
    typeof data?.candidateName !== 'string' || !data.candidateName.trim() ||
    !VALID_MARITAL_STATUSES.has(data?.maritalStatus) ||
    !Number.isFinite(age) || age < 18 || age > 100
  ) return null;
  const ageBand = age < 25 ? '18-24' : age >= 60 ? '60+' : `${Math.floor(age / 5) * 5}-${Math.floor(age / 5) * 5 + 4}`;
  return {
    gender: data.gender,
    ageBand,
    district: typeof data.district === 'string' ? data.district.slice(0, 80) : '',
    approvalStatus: 'approved',
    isVerified: true,
  };
}

async function runMigration() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'nikah-pakka';
  if (projectId !== 'nikah-pakka') {
    throw new Error(`Refusing to migrate profiles for unexpected project: ${projectId}`);
  }
  const { initializeApp, applicationDefault, getApps } = require('firebase-admin/app');
  const { getFirestore, FieldValue } = require('firebase-admin/firestore');
  const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId });
  const db = getFirestore(app);
  const marker = db.doc('_systemMigrations/locked-profile-access-v2');
  const existingMarker = await marker.get();
  if (existingMarker.exists) {
    process.stdout.write('Sanitized public-profile migration already completed; skipping.\\n');
    return;
  }

  const registrations = await db.collection('registrations').get();
  let batch = db.batch();
  let batchCount = 0;
  let published = 0;
  let skipped = 0;
  let previewsPublished = 0;
  let membershipsUpgraded = 0;
  const commitBatch = async () => {
    if (batchCount) await batch.commit();
    batch = db.batch();
    batchCount = 0;
  };

  for (const registration of registrations.docs) {
    const publicProfile = toPublicProfile(registration.id, registration.data(), FieldValue.serverTimestamp());
    if (!publicProfile) {
      skipped += 1;
      continue;
    }
    batch.set(db.doc(`publicProfiles/${registration.id}`), publicProfile, { merge: false });
    const preview = toProfilePreview(registration.data());
    if (preview) {
      batch.set(db.doc(`profilePreviews/${registration.id}`), {
        ...preview,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: false });
      previewsPublished += 1;
    }
    batchCount += 1;
    published += 1;
    if (batchCount >= 400) await commitBatch();
  }
  // Preserve existing membership records and add a Timestamp expiry derived
  // from their existing ISO endsAt value. No plan, amount, or status is changed.
  const memberships = await db.collection('memberships').get();
  for (const membership of memberships.docs) {
    const data = membership.data();
    if (data.expiresAt && typeof data.expiresAt.toDate === 'function') continue;
    const endDate = typeof data.endsAt === 'string' ? new Date(data.endsAt) : null;
    if (endDate && Number.isFinite(endDate.getTime())) {
      batch.set(membership.ref, { expiresAt: endDate }, { merge: true });
      batchCount += 1;
      membershipsUpgraded += 1;
      if (batchCount >= 400) await commitBatch();
    }
  }
  await commitBatch();
  await marker.set({
    migration: 'locked-profile-access-v2',
    completedAt: FieldValue.serverTimestamp(),
    published,
    skipped,
    previewsPublished,
    membershipsUpgraded,
  });
  process.stdout.write(`Locked profile access migration complete. Full profiles: ${published}; previews: ${previewsPublished}; memberships upgraded: ${membershipsUpgraded}; skipped: ${skipped}.\\n`);
}

if (require.main === module) {
  runMigration().catch((error) => {
    console.error('Sanitized public-profile migration failed:', error);
    process.exitCode = 1;
  });
}

module.exports = { toPublicProfile, toProfilePreview };

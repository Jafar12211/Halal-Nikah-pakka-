#!/usr/bin/env node

/**
 * Secure Staging Administrator Setup Script
 *
 * Requirements:
 * 1. Application Default Credentials (ADC) or GOOGLE_APPLICATION_CREDENTIALS
 *    for GCP/Firebase project "nikah-pakka-staging".
 * 2. Runs ONLY if the target project matches "nikah-pakka-staging".
 *
 * Usage:
 *   node scripts/grant-staging-admin.mjs <target-email-or-uid>
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const TARGET_EMAIL = process.argv[2] || 'jafarmd0007@gmail.com';
const EXPECTED_PROJECT_ID = 'nikah-pakka-staging';

const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID_STAGING || EXPECTED_PROJECT_ID;

if (projectId !== EXPECTED_PROJECT_ID) {
  console.error(`FAIL-CLOSED: This script only runs against "${EXPECTED_PROJECT_ID}". Detected project: "${projectId}".`);
  process.exit(1);
}

const app = initializeApp({
  credential: applicationDefault(),
  projectId: EXPECTED_PROJECT_ID,
});

const auth = getAuth(app);

async function grantAdmin() {
  console.log(`Auditing target user "${TARGET_EMAIL}" in project "${EXPECTED_PROJECT_ID}"...`);
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(TARGET_EMAIL);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      try {
        userRecord = await auth.getUser(TARGET_EMAIL);
      } catch {
        console.error(`User "${TARGET_EMAIL}" not found in project "${EXPECTED_PROJECT_ID}".`);
        process.exit(1);
      }
    } else {
      throw err;
    }
  }

  console.log(`Found user: UID=${userRecord.uid}, email=${userRecord.email}`);
  await auth.setCustomUserClaims(userRecord.uid, { admin: true });
  console.log(`✔ Successfully granted { admin: true } claim to user ${userRecord.uid} (${userRecord.email}).`);
  console.log('NOTE: The user must refresh their ID token (sign out and sign in again) to receive the claim.');
}

grantAdmin().catch((err) => {
  console.error('Error granting admin custom claim:', err.message);
  process.exit(1);
});

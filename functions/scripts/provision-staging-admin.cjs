'use strict';

// One-time, staging-only provisioning for the designated Nikah Pakka administrator.
// Never point this script at production or accept an arbitrary email/project.
const path = require('node:path');
const admin = require('firebase-admin');

const PROJECT_ID = 'nikah-pakka-staging';
const ADMIN_EMAIL = 'jafarmd0007@gmail.com';

async function main() {
  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is required.');
  }

  const serviceAccount = require(path.resolve(credentialPath));
  if (serviceAccount.project_id !== PROJECT_ID) {
    throw new Error(`Refusing to run: credential project is "${serviceAccount.project_id}", expected "${PROJECT_ID}".`);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: PROJECT_ID,
  });

  const auth = admin.auth();
  const user = await auth.getUserByEmail(ADMIN_EMAIL);
  const mergedClaims = { ...(user.customClaims || {}), admin: true };

  await auth.setCustomUserClaims(user.uid, mergedClaims);

  const verifiedUser = await auth.getUser(user.uid);
  if (verifiedUser.customClaims?.admin !== true) {
    throw new Error('Admin custom claim verification failed.');
  }

  console.log(`Staging admin claim assigned and verified for ${ADMIN_EMAIL} (UID: ${user.uid}).`);
}

main().catch((error) => {
  console.error('Staging admin provisioning failed:', error.message);
  process.exitCode = 1;
});

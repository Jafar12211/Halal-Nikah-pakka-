const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

initializeApp();

const db = getFirestore();
const auth = getAuth();
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || '{}');
// Match the web app's current Firebase default bucket. The Functions
// emulator may inject a legacy *.appspot.com value in FIREBASE_CONFIG even
// when this project uses *.firebasestorage.app. An explicit STORAGE_BUCKET
// still supports projects configured with a custom bucket.
const storageBucketName =
  process.env.STORAGE_BUCKET ||
  (process.env.GCLOUD_PROJECT
    ? `${process.env.GCLOUD_PROJECT}.firebasestorage.app`
    : firebaseConfig.storageBucket);
const storage = getStorage();

const MAX_AUTH_AGE_SECONDS = 5 * 60;

function assertRecentlyAuthenticated(request) {
  const authTime = Number(request.auth?.token?.auth_time);
  const now = Math.floor(Date.now() / 1000);

  if (!Number.isFinite(authTime) || authTime > now + 60 || now - authTime > MAX_AUTH_AGE_SECONDS) {
    throw new HttpsError(
      'failed-precondition',
      'For your security, sign in again and retry account deletion.',
    );
  }
}

async function recursivelyDeleteDocument(path) {
  await db.recursiveDelete(db.doc(path));
}

async function deleteMatchingDocuments(query) {
  const snapshot = await query.get();
  for (const document of snapshot.docs) {
    // recursiveDelete also removes any nested messages or other subcollections.
    await db.recursiveDelete(document.ref);
  }
}

async function deleteUserFirestoreData(uid) {
  // Delete account-root documents and every nested subcollection under them.
  await recursivelyDeleteDocument(`registrations/${uid}`);
  await recursivelyDeleteDocument(`publicProfiles/${uid}`);
  await recursivelyDeleteDocument(`users/${uid}`);

  // Remove both sides of private requests involving this account.
  await deleteMatchingDocuments(
    db.collection('interestRequests').where('senderUserId', '==', uid),
  );
  await deleteMatchingDocuments(
    db.collection('interestRequests').where('receiverUserId', '==', uid),
  );

  // Conversations and their nested messages are account-linked private data.
  await deleteMatchingDocuments(
    db.collection('conversations').where('participantUserIds', 'array-contains', uid),
  );

  // Add every future top-level user-linked collection here before launch.
}

async function deleteUserStorageData(uid) {
  // Resolve the configured/default bucket explicitly so local emulators and
  // deployed Functions target the same project bucket.
  const bucket = storageBucketName
    ? storage.bucket(storageBucketName)
    : storage.bucket();
  for (const prefix of [
    `profilePhotos/${uid}/`,
    `identityDocuments/${uid}/`,
  ]) {
    // Enumerate and delete each object explicitly. This is reliable across
    // the Cloud Storage service and the Firebase Storage emulator, whereas
    // bucket.deleteFiles({ prefix }) may not remove emulator objects.
    const [files] = await bucket.getFiles({ prefix });
    for (const file of files) {
      await file.delete({ ignoreNotFound: true });
    }
  }
}

exports.deleteOwnAccount = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Sign in before deleting your account.');
    }

    assertRecentlyAuthenticated(request);
    const uid = request.auth.uid;

    try {
      // Keep Authentication deletion last. If a cleanup step fails, the account
      // remains available for a fresh sign-in and a safe retry.
      await deleteUserFirestoreData(uid);
      await deleteUserStorageData(uid);
      await auth.deleteUser(uid);

      logger.info('User account and owned data deleted', { uid });
      return { success: true };
    } catch (error) {
      logger.error('Account deletion cleanup failed', {
        uid,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new HttpsError(
        'internal',
        'We could not finish deleting your account. Your sign-in account has been retained where possible; please retry or contact support.',
      );
    }
  },
);

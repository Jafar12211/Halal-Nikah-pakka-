const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { after, before, beforeEach, test } = require('node:test');

// This suite must run only against local Firebase emulators.
const projectId = 'nikah-pakka';
const authHost = '127.0.0.1:9099';
const firestoreHost = '127.0.0.1:8080';
const storageHost = '127.0.0.1:9199';
const functionsHost = '127.0.0.1:5001';

process.env.GCLOUD_PROJECT = projectId;
process.env.FIREBASE_CONFIG = JSON.stringify({
  projectId,
  storageBucket: 'nikah-pakka.firebasestorage.app',
});
process.env.FIREBASE_AUTH_EMULATOR_HOST = authHost;
process.env.FIRESTORE_EMULATOR_HOST = firestoreHost;
process.env.FIREBASE_STORAGE_EMULATOR_HOST = storageHost;

const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

const app = initializeApp({
  projectId,
  storageBucket: 'nikah-pakka.firebasestorage.app',
}, 'account-deletion-test-runner');
const auth = getAuth(app);
const db = getFirestore(app);
const bucket = getStorage(app).bucket();

let owner;
let otherUser;
const createdUids = new Set();

async function createEmulatorUser() {
  const response = await fetch(
    `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `deletion-test-${randomUUID()}@example.test`,
        password: 'Test-only-Password-123!',
        returnSecureToken: true,
      }),
    },
  );
  const body = await response.json();
  assert.equal(response.ok, true, `Auth emulator user creation failed: ${JSON.stringify(body)}`);
  createdUids.add(body.localId);
  return { uid: body.localId, idToken: body.idToken };
}

async function invokeDelete(idToken) {
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  return fetch(
    `http://${functionsHost}/${projectId}/us-central1/deleteOwnAccount`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ data: {} }),
    },
  );
}

async function seedOwnedData(uid, otherUid) {
  await db.doc(`registrations/${uid}`).set({ userId: uid, candidateName: 'Emulator test' });
  await db.doc(`registrations/${uid}/private/nested`).set({ secret: 'test-only' });
  await db.doc(`publicProfiles/${uid}`).set({ userId: uid, approvalStatus: 'approved' });
  await db.doc(`users/${uid}`).set({ uid });
  await db.doc(`users/${uid}/savedProfiles/${otherUid}`).set({ profileId: otherUid });

  await db.doc('interestRequests/sent-by-owner').set({
    senderUserId: uid, receiverUserId: otherUid, status: 'pending',
  });
  await db.doc('interestRequests/received-by-owner').set({
    senderUserId: otherUid, receiverUserId: uid, status: 'pending',
  });
  await db.doc('interestRequests/unrelated').set({
    senderUserId: otherUid, receiverUserId: 'unrelated-user', status: 'pending',
  });

  await db.doc('conversations/owned-conversation').set({
    participantUserIds: [uid, otherUid],
  });
  await db.doc('conversations/owned-conversation/messages/message-1').set({
    senderUserId: uid, text: 'test-only message',
  });
  await db.doc('conversations/unrelated-conversation').set({
    participantUserIds: [otherUid, 'unrelated-user'],
  });

  await bucket.file(`profilePhotos/${uid}/test-photo.png`).save(Buffer.from('test-photo'));
  await bucket.file(`identityDocuments/${uid}/test-id.pdf`).save(Buffer.from('test-id'));
}

before(async () => {
  // Fail early rather than accidentally exercising a deployed endpoint.
  assert.match(authHost, /^127\\.0\\.0\\.1:/);
  assert.match(firestoreHost, /^127\\.0\\.0\\.1:/);
  assert.match(storageHost, /^127\\.0\\.0\\.1:/);
  assert.match(functionsHost, /^127\\.0\\.0\\.1:/);
});

beforeEach(async () => {
  owner = await createEmulatorUser();
  otherUser = await createEmulatorUser();
});

after(async () => {
  // Best-effort cleanup also handles a test that fails before invoking deletion.
  for (const uid of createdUids) {
    try {
      await db.recursiveDelete(db.doc(`registrations/${uid}`));
      await db.recursiveDelete(db.doc(`publicProfiles/${uid}`));
      await db.recursiveDelete(db.doc(`users/${uid}`));
      await bucket.deleteFiles({ prefix: `profilePhotos/${uid}/` });
      await bucket.deleteFiles({ prefix: `identityDocuments/${uid}/` });
      await auth.deleteUser(uid);
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        // Keep teardown non-fatal; the emulator itself is disposable.
      }
    }
  }
  await deleteApp(app);
});

test('unauthenticated callers cannot delete an account', async () => {
  const response = await invokeDelete();
  assert.equal(response.status, 401);
  assert.equal((await auth.getUser(owner.uid)).uid, owner.uid);
});

test('a signed-in member can delete only their own account and linked data', async () => {
  await seedOwnedData(owner.uid, otherUser.uid);

  const response = await invokeDelete(owner.idToken);
  const body = await response.json();

  assert.equal(response.ok, true, JSON.stringify(body));
  assert.equal(body.result?.success ?? body.data?.success, true);

  await assert.rejects(
    auth.getUser(owner.uid),
    (error) => error.code === 'auth/user-not-found',
  );

  for (const path of [
    `registrations/${owner.uid}`,
    `registrations/${owner.uid}/private/nested`,
    `publicProfiles/${owner.uid}`,
    `users/${owner.uid}`,
    `users/${owner.uid}/savedProfiles/${otherUser.uid}`,
    'interestRequests/sent-by-owner',
    'interestRequests/received-by-owner',
    'conversations/owned-conversation',
    'conversations/owned-conversation/messages/message-1',
  ]) {
    assert.equal((await db.doc(path).get()).exists, false, `Expected ${path} to be deleted`);
  }

  assert.equal((await db.doc('interestRequests/unrelated').get()).exists, true);
  assert.equal((await db.doc('conversations/unrelated-conversation').get()).exists, true);
  assert.equal((await auth.getUser(otherUser.uid)).uid, otherUser.uid);

  const [photoExists] = await bucket.file(`profilePhotos/${owner.uid}/test-photo.png`).exists();
  const [identityExists] = await bucket.file(`identityDocuments/${owner.uid}/test-id.pdf`).exists();
  assert.equal(photoExists, false, 'Profile photo should be deleted');
  assert.equal(identityExists, false, 'Private identity document should be deleted');
});

test('a caller cannot delete another member by supplying their UID', async () => {
  // The callable takes no UID argument: the authenticated token is the sole
  // source of the account identifier. A caller can delete only their own user.
  const response = await invokeDelete(otherUser.idToken);
  const body = await response.json();

  assert.equal(response.ok, true, JSON.stringify(body));
  assert.equal(body.result?.success ?? body.data?.success, true);
  await assert.rejects(
    auth.getUser(otherUser.uid),
    (error) => error.code === 'auth/user-not-found',
  );
  assert.equal((await auth.getUser(owner.uid)).uid, owner.uid);
});

test('a request with an invalid bearer token is rejected', async () => {
  const response = await invokeDelete('not-a-valid-firebase-id-token');
  assert.equal(response.status, 401);
  assert.equal((await auth.getUser(owner.uid)).uid, owner.uid);
});

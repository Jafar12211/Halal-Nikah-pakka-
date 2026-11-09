# Nikah Pakka Firebase Functions

## deleteOwnAccount

Callable function in `us-central1` used by the signed-in member after reauthentication.

Security and deletion order:

1. Requires Firebase Authentication on the callable request.
2. Requires `auth_time` to be no more than five minutes old.
3. Uses the Admin SDK to recursively delete `registrations/{uid}`, `publicProfiles/{uid}`, and `users/{uid}`, including nested subcollections.
4. Deletes interest requests where the account is sender or recipient.
5. Deletes conversations where `participantUserIds` contains the account; nested messages are recursively removed.
6. Deletes the account's `profilePhotos/{uid}/` and `identityDocuments/{uid}/` Storage prefixes.
7. Deletes the Firebase Authentication user last.

The function intentionally retains immutable `auditLogs` for administrative accountability. Whenever a new top-level collection stores user-linked data, add its cleanup query here before using that collection in production.

## Install and deploy

From the repository root:

```bash
cd functions
npm install
cd ..
npx firebase-tools@13.2.0 deploy --only functions:deleteOwnAccount --project nikah-pakka
```

Cloud Functions deployment requires a Firebase project on the Blaze billing plan and the relevant Google Cloud APIs. Review billing and regional settings before deployment. Do not deploy until the project owner explicitly approves.

## Local validation

```bash
cd functions
npm install
npm run check
```

The callable currently does not enforce App Check. Configure and verify App Check in the web client and function before enabling enforcement; turning it on prematurely would block legitimate account deletion calls.


## Account-deletion emulator integration tests

From the repository root, install the Functions dependencies and run all required local emulators:

```bash
npm install --prefix functions
npx firebase-tools emulators:exec --only auth,firestore,storage,functions --project nikah-pakka "npm run test:account-deletion --prefix functions"
```

The suite creates disposable users through the Auth Emulator and seeds only emulator Firestore and Storage. It calls the Functions Emulator over its local callable HTTP endpoint. It verifies unauthenticated and invalid-token rejection, that the authenticated UID is the deletion target, recursive Firestore cleanup, preservation of unrelated records and users, and removal of both private Storage prefixes. It does not call production Firebase services.

Do not run this suite against a deployed endpoint or point its emulator host constants at a remote service.

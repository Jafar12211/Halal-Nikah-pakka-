# Nikah Pakka – Firebase security setup

This patch is a security foundation, not a claim that every application workflow has already been migrated.

## What changed

- Email/password registration and sign-in now use Firebase Authentication. Registration sends Firebase's email-verification message; the old hard-coded demo OTP is no longer used by the registration handler.
- Google sign-in continues to use Firebase Authentication.
- The browser no longer grants admin role merely because an account uses a particular email address. All newly authenticated client accounts are members by default.
- Admin access in Firestore rules now requires the trusted Firebase Auth custom claim `admin: true`.
- Private `registrations/{uid}` documents are readable only by their owner or an admin. This prevents exposing guardian contact and identity-verification metadata to every signed-in member.
- Public demo profiles are not seeded in production builds. Existing browser local storage is not automatically erased.

## Important: assign the administrator claim securely

Do not add an admin email check in React, do not edit a user's local storage role, and do not expose a service-account key in the browser or repository.

An administrator must set the custom claim from a trusted environment using Firebase Admin SDK, after independently verifying the intended account UID. Example for a trusted Node.js environment with Application Default Credentials:

```js
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp({ credential: applicationDefault() });
const uid = 'REPLACE_WITH_VERIFIED_FIREBASE_AUTH_UID';
await getAuth().setCustomUserClaims(uid, { admin: true });
console.log('Admin claim assigned. Ask the user to sign out and sign in again.');
```

Run this only from a secured admin workstation or trusted server with least-privilege credentials. Never commit credentials. A user must refresh their ID token (normally by signing out and back in) before the claim appears in the client token.

## Firestore data model still required for full launch

The current UI and storage service still contain legacy local-storage workflows for interests, conversations, messages, and parts of profile management. Those are not made production-safe by this patch. In particular:

1. Migrate member-owned data to Firestore and scope every read/write to authenticated participant UIDs.
2. Publish a separate `publicProfiles/{uid}` document containing only approved, non-sensitive fields. Do not copy guardian phone numbers, document metadata, date of birth, or private family details into it.
3. Write `publicProfiles` only from a trusted backend after an admin approval action. The current rules permit reads by signed-in users and writes only by admins.
4. Move identity documents to a private Storage path with restrictive Storage Rules and never expose their download URLs publicly.
5. Implement account deletion as a trusted, authenticated deletion workflow that removes Firestore documents, Storage objects, and the Firebase Auth user, with recent-login/re-authentication handling.
6. Replace the remaining local-only messaging, interests, audit-log and admin-dashboard actions before production launch.

## Deploy rules

Review the rules against the deployed app and test with the Firebase Emulator Suite before publishing:

```bash
firebase deploy --only firestore:rules
```

The rules intentionally deny all unspecified collections. Some existing screens may not function until their Firestore collections and access rules are migrated. Do not loosen the catch-all rule to `allow read, write: if true`.

## Build check

Install dependencies with `npm install`, then run `npm run lint` and `npm run build`. These checks were not completed in the preparation environment because dependency installation did not finish. Resolve any compiler errors and run emulator security tests before deployment.

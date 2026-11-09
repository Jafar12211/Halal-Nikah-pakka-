# Nikah Pakka – Firebase security setup

This patch is a security foundation, not a claim that every application workflow has already been migrated.

## What changed

- Email/password registration and sign-in now use Firebase Authentication. Registration sends Firebase's email-verification message; the old hard-coded demo OTP is no longer used by the registration handler.
- Google sign-in continues to use Firebase Authentication.
- The browser no longer grants admin role merely because an account uses a particular email address. All newly authenticated client accounts are members by default.
- Admin access in Firestore rules now requires the trusted Firebase Auth custom claim `admin: true`.
- Private `registrations/{uid}` documents are readable only by their owner or an admin. This prevents exposing guardian contact and identity-verification metadata to every signed-in member.
- Members can save approved public profiles in their own `users/{uid}/savedProfiles/{profileId}` subcollection. These are private bookmarks shared across the member's signed-in devices; they do not send an interest request or notify another family.
- A separate `interestRequests/{requestId}` data model and Firestore rules now support requests between approved members. Only the sender and recipient can read a request; only the recipient can accept or decline it. The service layer is present, but the request UI and live notification workflow still need integration and testing.
- Legacy fictional profiles and conversations are no longer automatically seeded into browser local storage. Existing legacy local bookmarks are migrated when they still refer to approved public profiles.

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

1. Connect the new Firestore interest-request service to the profile and interests screens; add recipient consent/accept-decline UI, request status display, abuse reporting/blocking, and notifications. Current requests are private to sender and recipient, but UI integration and live workflow validation remain outstanding.
2. Replace the disabled/local-only messaging preview with a Firestore-backed, participant-scoped conversation system. Do not describe messages as encrypted unless end-to-end encryption is actually implemented.
3. Move privileged profile approval, publication and account-wide cleanup to trusted Cloud Functions or another server-side Admin SDK environment. The current admin custom claim and rules protect the browser-based admin actions, but the server-side boundary is still recommended for production.
4. Complete account deletion for every future user-owned collection and subcollection, and provide a recoverable server-side cleanup process for partial failures.
5. Implement photo access requests and mutual-consent reveal only if that feature is required. Until then, non-visible photos remain private and are not revealed by saving a profile.
6. Validate the complete authentication, registration, upload, admin review and deletion flows against the live Firebase project before launch.

## Deploy rules

Review the rules against the deployed app and test with the Firebase Emulator Suite before publishing:

```bash
firebase deploy --only firestore:rules
```

The rules intentionally deny all unspecified collections. Some existing screens may not function until their Firestore collections and access rules are migrated. Do not loosen the catch-all rule to `allow read, write: if true`.

## Build check

Install dependencies with `npm install`, then run `npm run lint` and `npm run build`. These checks were not completed in the preparation environment because dependency installation did not finish. Resolve any compiler errors and run emulator security tests before deployment.

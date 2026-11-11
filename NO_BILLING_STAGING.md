# Nikah Pakka – No-Billing (Spark Plan) Staging Setup

This document outlines the strict no-billing architecture and isolation safeguards implemented for staging environment `nikah-pakka-staging`.

## 1. No-Billing Safeguards & Plan Restrictions
- **No Cloud Billing**: The staging Firebase project operates under the Spark (Free) plan.
- **No Cloud Functions Deployment**: Google Cloud requires an active billing account (Blaze plan) to deploy 2nd-gen Cloud Functions. In accordance with strict no-billing directives, Cloud Functions (`deleteOwnAccount`) are tested via the local Firebase Functions Emulator and are not deployed to live Cloud Functions without billing authorization. The hosted staging account-deletion control is therefore disabled with an explanation; it can be enabled only after the callable is deployed and verified.
- **Fail-Closed Storage Uploads**: Profile-photo and private identity-document uploads are permitted only when `VITE_USE_FIREBASE_EMULATORS=true` connects the app to the local Firebase Storage Emulator. Hosted staging rejects both upload paths in the service layer, even if a UI control is bypassed. Candidate profiles display secure SVG placeholder avatars.
- **No Base64 in Firestore**: No binary or image base64 payloads are stored in Firestore documents.

## 2. Firebase Emulators
- Firebase Emulators (Auth, Firestore, Storage, Functions) are configured in `firebase.json` for reproducible testing and security rule verification.
- Security rules tests verify fine-grained read/write permissions, size limits, content-type checks, and ownership assertions on port `9199` for Storage and port `8080` for Firestore.
- Emulators are strictly enabled only when `VITE_USE_FIREBASE_EMULATORS=true` in development/test environments, preventing accidental leakage.

## 3. Administrator Setup
- To assign administrator status to `jafarmd0007@gmail.com`, execute `scripts/grant-staging-admin.mjs`.
- The script asserts that the runtime target is strictly `nikah-pakka-staging` before making any modifications.

## 4. Staging Hosting deployment credential

The web app configuration is public Firebase client configuration and is committed in `firebase-applet-config.json`; it is validated against the exact staging project during CI. It does not need to be duplicated as a GitHub secret.

To enable the optional staging Firestore-rules and Hosting preview deployment, add one GitHub Actions repository secret named `FIREBASE_SERVICE_ACCOUNT_STAGING` containing a service-account JSON credential scoped to `nikah-pakka-staging` with the minimum Firebase Hosting and Firestore rules deployment permissions. Never paste the private key into chat, commit it, or use a production service account. The workflow rejects any project ID other than `nikah-pakka-staging`.

## 5. Absolute Protection of Production
- Production project `nikah-pakka` (project number `655818278889`) is strictly off-limits.
- Staging validation scripts (`scripts/validate-staging-config.cjs`) reject any production project references or credentials.

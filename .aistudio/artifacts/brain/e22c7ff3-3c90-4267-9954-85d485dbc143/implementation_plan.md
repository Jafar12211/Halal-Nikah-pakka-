# Firebase Integration Implementation Plan

## Overview
We will integrate Firebase Authentication (Google, Phone OTP, Email/Password) and Cloud Firestore into the existing application. Local storage will be maintained as a fallback, with new profile registrations synchronized to Firestore.

## Proposed Changes

### 1. Backend & Configuration
- **Firebase Initialization**: Set up `firebase.ts` to initialize Firebase App, Auth, and Firestore using `firebase-applet-config.json`.
- **Firestore Blueprint**: Update `firebase-blueprint.json` to define the `registrations` collection schema.
- **Security Rules**: Implement `firestore.rules` enforcing strict access control:
  - Users can only read/write their own documents.
  - Only authorized administrators can list all registrations or update verification statuses.
  - Implement validation helpers (`isValidRegistration`) to prevent data corruption.

### 2. Authentication & Data Service
- **`firestoreService.ts`**: Create a service layer to handle:
  - Google Sign-In, Phone OTP, and Email/Password authentication.
  - Firestore operations (`setDoc`, `getDocs`, `updateDoc`).
  - Robust error handling using a custom `handleFirestoreError` function to ensure diagnostic JSON logging for security failures.
- **`AuthModal.tsx`**: Refactor to integrate Firebase Auth providers. Ensure new registrations trigger synchronization to Firestore.

### 3. Application State & Dashboard
- **`App.tsx`**: Update state management to synchronize profile creation with Firestore and load data from Firestore for the admin dashboard.
- **`AdminDashboardModal.tsx`**: Update to fetch data from Firestore and implement loading/empty states.
- **Immutability & Security**: Enforce server-side security rules to prevent unauthorized modification of sensitive fields (e.g., `verificationStatus`).

## Security Audit Plan
- **Red Team Audit**:
  - Test "Shadow Update" attacks to inject unauthorized fields.
  - Test "Spoofing" attacks on admin email/claims.
  - Verify PII isolation (users cannot access others' sensitive data).

## Verification
- Test registration with a new Google account and verify Firestore document creation.
- Verify admin dashboard loads records from Firestore.
- Run unit tests to confirm valid/invalid registration data handling.

# Nikah Pakka staging release validation

This branch is an isolated validation snapshot of the canonical staging application.

Validation scope:
- TypeScript checks and production asset build
- Utility, admin, and feature-flag tests
- Firestore and Firebase Storage security rules emulator tests
- Cloud Functions syntax, dependency audit, and account-deletion emulator tests

This branch is not a production deployment and must not be used to deploy production Firebase rules.

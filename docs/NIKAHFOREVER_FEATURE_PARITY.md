# Nikah Pakka — Matrimony Feature Parity Plan

Reference reviewed: NikahForever public website and FAQ (reviewed 2026-11-21).
Target: `staging/nikah-pakka-firebase-3067789459907626439` only. Production must remain untouched.

## Existing functionality confirmed in the staging source
- Firebase email/password registration and sign-in, Google sign-in, email verification and password reset.
- Private member registrations and separately published approved/verified public profiles.
- Admin-only profile review, government-document metadata verification, approval/rejection/suspension and audit logging.
- Profile biodata, family/Wali details, candidate consent, partner preferences and photo privacy field.
- Public profile directory with age, city/district, sect, marital-status, education and text filters.
- Firestore-synced saved profiles/bookmarks and interest requests.
- Telugu, Urdu and English UI.
- Compatibility-score helper exists, but currently uses a mostly fixed baseline and does not calculate a genuine two-sided preference match.

## Reference features to add or complete
1. **Real compatibility matching** — explainable, deterministic scoring against the signed-in member's preferences; do not label it AI unless an actual model is safely deployed.
2. **Family-managed profiles** — allow a parent/guardian/sibling to register an adult candidate only with explicit candidate consent; record who manages the profile and their relationship. Never permit under-18 profiles.
3. **Profile discovery** — extend filters for age, height, education, profession, marital status, sect, location, religious preferences and partner preference matching; retain the existing Godavari/Yanam defaults.
4. **Shortlist and interests** — keep cross-device saved profiles and mutual-interest state; provide cancel/decline/report controls and prevent duplicate or self-directed requests.
5. **Safe member communication** — implement only after secure Firestore conversation rules and a clear guardian/family safety model. Do not display fake or local-only chat as live.
6. **Photo privacy** — implement blur/hidden/selected-member access requests with server-enforced authorization. A client-side CSS blur is not access control.
7. **Block and report** — private, authenticated records; block must suppress both profiles and interactions; report must create an admin-review queue without exposing reporter identity.
8. **Profile pause / visibility** — allow members to hide and restore their own public listing without deleting private biodata.
9. **Verification and trust indicators** — show only evidence-backed badges. Keep government ID and identity files private; never claim 100% verified or machine-learning verification unless implemented and tested.
10. **Account deletion and privacy** — retain secure reauthentication and trusted backend cleanup. No insecure client-side deletion workaround.
11. **Help and trust pages** — FAQ, privacy policy, terms, child-safety standards, contact/support and success stories using original Nikah Pakka content.
12. **Mobile and language polish** — preserve responsive layouts and English/Telugu/Urdu support across new workflows.

## No-cost and security guardrails
- Do not enable Firebase billing/Blaze, paid APIs, paid WhatsApp/SMS providers, or third-party paid services.
- Use existing Firebase free-tier capabilities only where available and within quota; never promise unlimited usage.
- Do not store government IDs or private photos in public Firestore, localStorage, or public URLs.
- Do not implement fake OTP, fixed OTPs, client-side trust badges, fake chat, fabricated testimonials, or fake statistics.
- If a feature requires paid infrastructure or a trusted backend unavailable on the current Spark project, leave it clearly disabled and document the blocker rather than weakening security.
- All changes remain on this feature branch until CI and security tests pass and the user approves merging into staging. No production deployment.

## Delivery sequence
- Phase A: security/data-model audit and compatibility scoring + discovery improvements.
- Phase B: family-managed profiles, profile pause, block/report and photo access requests with Firestore rules and emulator tests.
- Phase C: safe chat only if rules and deployment constraints allow it.
- Phase D: help/trust pages, accessibility, localization and end-to-end staging validation.

## Acceptance criteria
- Every member can read/update only their own private registration.
- Only trusted admin claims can moderate or access restricted verification records.
- Public listings contain only approved, verified and visibility-enabled profiles.
- Blocks, reports and photo grants are enforced by backend rules, not only UI state.
- Every new security rule has positive and negative emulator tests.
- TypeScript, unit, security and production-build workflows pass.
- No changes are made to production Firebase or the production branch.

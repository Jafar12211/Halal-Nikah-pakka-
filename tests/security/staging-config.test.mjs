import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { validateConfig, EXPECTED_STAGING_CONFIG } = require("../../scripts/validate-staging-config.cjs");

test("validateConfig rejects placeholder appId ending in :staging", () => {
  assert.throws(() => {
    validateConfig({
      projectId: "nikah-pakka-staging",
      messagingSenderId: "593974062791",
      authDomain: "nikah-pakka-staging.firebaseapp.com",
      storageBucket: "nikah-pakka-staging.firebasestorage.app",
      apiKey: EXPECTED_STAGING_CONFIG.apiKey,
      appId: "1:593974062791:web:staging"
    });
  }, /Placeholder appId detected/);
});

test("validateConfig rejects arbitrary non-registered appId", () => {
  assert.throws(() => {
    validateConfig({
      projectId: "nikah-pakka-staging",
      messagingSenderId: "593974062791",
      authDomain: "nikah-pakka-staging.firebaseapp.com",
      storageBucket: "nikah-pakka-staging.firebasestorage.app",
      apiKey: EXPECTED_STAGING_CONFIG.apiKey,
      appId: "1:593974062791:web:abcdef0123456789"
    });
  }, /Expected registered staging appId/);
});

test("validateConfig rejects incorrect or fabricated API key", () => {
  assert.throws(() => {
    validateConfig({
      projectId: "nikah-pakka-staging",
      messagingSenderId: "593974062791",
      authDomain: "nikah-pakka-staging.firebaseapp.com",
      storageBucket: "nikah-pakka-staging.firebasestorage.app",
      apiKey: "AIzaSyFakeKeyForTestOnly12345678",
      appId: EXPECTED_STAGING_CONFIG.appId
    });
  }, /Expected registered staging apiKey/);
});

test("validateConfig rejects missing required keys", () => {
  assert.throws(() => {
    validateConfig({
      projectId: "nikah-pakka-staging",
      authDomain: "nikah-pakka-staging.firebaseapp.com",
      storageBucket: "nikah-pakka-staging.firebasestorage.app",
    });
  }, /Missing or invalid required Firebase configuration field/);
});

test("validateConfig rejects production project ID or project number", () => {
  assert.throws(() => {
    validateConfig({
      projectId: "nikah-pakka",
      messagingSenderId: "655818278889",
      authDomain: "nikah-pakka.firebaseapp.com",
      storageBucket: "nikah-pakka.firebasestorage.app",
      apiKey: EXPECTED_STAGING_CONFIG.apiKey,
      appId: "1:655818278889:web:41569b3545534e9e4d6d78"
    });
  }, /Expected projectId to be "nikah-pakka-staging"/);
});

test("validateConfig accepts the exact registered staging configuration", () => {
  assert.equal(
    validateConfig({
      projectId: "nikah-pakka-staging",
      messagingSenderId: "593974062791",
      authDomain: "nikah-pakka-staging.firebaseapp.com",
      storageBucket: "nikah-pakka-staging.firebasestorage.app",
      apiKey: "AIzaSyDxj2kaWnp1hiT80roblkfhn2XMfrX9iNY",
      appId: "1:593974062791:web:a197d5d58974836af858e2",
      measurementId: "G-B320MVNCF1"
    }),
    true
  );
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { validateConfig } = require("../../scripts/validate-staging-config.cjs");

test("validateConfig rejects placeholder appId ending in :staging", () => {
  assert.throws(() => {
    validateConfig({
      projectId: "nikah-pakka-staging",
      messagingSenderId: "593974062791",
      authDomain: "nikah-pakka-staging.firebaseapp.com",
      storageBucket: "nikah-pakka-staging.firebasestorage.app",
      apiKey: "AIzaSyFakeKeyForTestOnly12345678",
      appId: "1:593974062791:web:staging"
    });
  }, /Placeholder appId detected/);
});

test("validateConfig rejects production project ID or project number", () => {
  assert.throws(() => {
    validateConfig({
      projectId: "nikah-pakka",
      messagingSenderId: "655818278889",
      authDomain: "nikah-pakka.firebaseapp.com",
      storageBucket: "nikah-pakka.firebasestorage.app",
      apiKey: "AIzaSyFakeKeyForTestOnly12345678",
      appId: "1:655818278889:web:41569b3545534e9e4d6d78"
    });
  }, /Expected projectId to be "nikah-pakka-staging"/);
});

test("validateConfig accepts valid non-placeholder staging config", () => {
  assert.equal(
    validateConfig({
      projectId: "nikah-pakka-staging",
      messagingSenderId: "593974062791",
      authDomain: "nikah-pakka-staging.firebaseapp.com",
      storageBucket: "nikah-pakka-staging.firebasestorage.app",
      apiKey: "AIzaSyFakeKeyForTestOnly12345678",
      appId: "1:593974062791:web:abcdef0123456789"
    }),
    true
  );
});

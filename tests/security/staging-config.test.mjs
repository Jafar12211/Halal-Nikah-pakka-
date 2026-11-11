import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { validateConfig, EXPECTED_STAGING_CONFIG } = require("../../scripts/validate-staging-config.cjs");

const validConfig = () => ({ ...EXPECTED_STAGING_CONFIG });

test("validateConfig accepts only the exact registered staging Web App configuration", () => {
  assert.equal(validateConfig(validConfig()), true);
});

test("validateConfig rejects placeholder values", () => {
  const config = validConfig();
  config.appId = "1:593974062791:web:placeholder";
  assert.throws(() => validateConfig(config), /Placeholder value detected/);
});

test("validateConfig rejects arbitrary non-placeholder appIds", () => {
  const config = validConfig();
  config.appId = "1:593974062791:web:abcdef0123456789";
  assert.throws(() => validateConfig(config), /appId.*does not match the exact registered staging Web App value/);
});

test("validateConfig rejects production Firebase configurations", () => {
  assert.throws(() => validateConfig({
    ...validConfig(),
    projectId: "nikah-pakka",
    messagingSenderId: "655818278889",
    authDomain: "nikah-pakka.firebaseapp.com",
    storageBucket: "nikah-pakka.firebasestorage.app",
    appId: "1:655818278889:web:41569b3545534e9e4d6d78"
  }), /Production Firebase configuration detected/);
});

test("validateConfig rejects every missing required configuration key", () => {
  for (const key of Object.keys(EXPECTED_STAGING_CONFIG)) {
    const config = validConfig();
    delete config[key];
    assert.throws(
      () => validateConfig(config),
      new RegExp(`Missing or invalid required Firebase configuration field: "\\${key}"`)
    );
  }
});

test("validateConfig rejects mismatched values for every registered staging field", () => {
  for (const key of Object.keys(EXPECTED_STAGING_CONFIG)) {
    const config = validConfig();
    config[key] = `wrong-${key}`;
    assert.throws(
      () => validateConfig(config),
      new RegExp(`field "\\${key}" does not match the exact registered staging Web App value`)
    );
  }
});

test("validateConfig rejects non-object configuration values", () => {
  assert.throws(() => validateConfig(null), /must be a JSON object/);
  assert.throws(() => validateConfig([]), /must be a JSON object/);
});

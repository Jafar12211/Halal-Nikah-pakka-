import assert from "node:assert/strict";
import { test } from "node:test";
import { isAdminUser } from "../../src/utils/admin.ts";

test("isAdminUser correctly identifies admin by role claim only", () => {
  assert.equal(isAdminUser(null), false);
  assert.equal(isAdminUser(undefined), false);
  assert.equal(isAdminUser({ role: "member", email: "user@example.com" }), false);
  assert.equal(isAdminUser({ role: "member", email: "jafarmd0007@gmail.com" }), false);
  assert.equal(isAdminUser({ role: "admin", email: "jafarmd0007@gmail.com" }), true);
  assert.equal(isAdminUser({ role: "admin", email: "another-admin@example.com" }), true);
});

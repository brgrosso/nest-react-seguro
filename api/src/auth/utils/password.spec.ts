import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, verifyPassword } from "./password.ts";

test("hashPassword no guarda el texto plano", async () => {
  const password = "ChangeMe_Admin1!";
  const stored = await hashPassword(password);
  assert.equal(stored.includes(password), false);
  assert.equal(await verifyPassword(password, stored), true);
  assert.equal(await verifyPassword("otra-clave-mala", stored), false);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { Role } from "../../generated/prisma/client";
import { hasRole } from "./roles.guard.ts";

test("USER no entra a rutas ADMIN", () => {
  assert.equal(hasRole(Role.USER, [Role.ADMIN]), false);
  assert.equal(hasRole(Role.ADMIN, [Role.ADMIN]), true);
});

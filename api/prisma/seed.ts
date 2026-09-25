import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, Role } from "../src/generated/prisma/client";
import { hashPassword } from "../src/auth/utils/password";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function seed() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@seguro.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe_Admin1!";

  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, passwordHash: await hashPassword(password) },
    create: {
      email,
      passwordHash: await hashPassword(password),
      role: Role.ADMIN,
    },
  });

  console.log(`Admin listo: ${email}`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "../config/load-env.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "..", "..", ".env");
dotenv.config({ path: rootEnvPath });

const prisma = new PrismaClient();

const SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "10", 10);
const HASH_ROUNDS = Number.isNaN(SALT_ROUNDS) ? 10 : SALT_ROUNDS;
const ADMIN_EMAIL = "gerencia@winove.com.br";
const ADMIN_PASSWORD = "123456789amilase";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, HASH_ROUNDS);

  const admin = await prisma.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
    },
  });

  console.log("Admin user is ready:");
  console.log(`ID: ${admin.id}`);
  console.log(`Email: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Failed to create admin user", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

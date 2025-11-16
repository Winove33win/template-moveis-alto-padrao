#!/usr/bin/env node
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const readline = require("readline");
const { randomUUID } = require("crypto");

const envPath = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: envPath });

const DEV_ENV_VALUES = new Set(["development", "dev", "test", ""]); // empty => local shell

function toInteger(value, defaultValue) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function requireEnvVars() {
  const needsHost = !process.env.DB_SOCKET_PATH;
  const required = ["DB_USER", "DB_PASSWORD", "DB_NAME"];
  if (needsHost) {
    required.push("DB_HOST", "DB_PORT");
  }

  const missing = required.filter((variable) => !process.env[variable]);
  if (missing.length) {
    console.error("As variáveis de ambiente a seguir são obrigatórias:");
    missing.forEach((variable) => console.error(`- ${variable}`));
    process.exit(1);
  }
}

function buildPoolConfig() {
  const baseConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: Math.max(1, toInteger(process.env.DB_POOL_LIMIT, 5)),
    queueLimit: Math.max(0, toInteger(process.env.DB_QUEUE_LIMIT, 0)),
  };

  if (process.env.DB_SOCKET_PATH) {
    return {
      ...baseConfig,
      socketPath: process.env.DB_SOCKET_PATH,
    };
  }

  return {
    ...baseConfig,
    host: process.env.DB_HOST,
    port: toInteger(process.env.DB_PORT, 3306),
  };
}

function isDevelopmentEnvironment() {
  const env = (process.env.NODE_ENV || "").toLowerCase();
  return DEV_ENV_VALUES.has(env);
}

async function ask(question, rl) {
  return await new Promise((resolve) => rl.question(question, resolve));
}

async function resolveAdminCredentials() {
  let adminEmail = (process.env.ADMIN_EMAIL || "").trim();
  let adminPassword = process.env.ADMIN_PASSWORD || "";

  const shouldPrompt = !adminEmail || !adminPassword;
  const canPrompt =
    shouldPrompt && isDevelopmentEnvironment() && process.stdin.isTTY && process.stdout.isTTY;

  let rl;
  try {
    if (canPrompt) {
      rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      if (!adminEmail) {
        adminEmail = (await ask("Informe o ADMIN_EMAIL do administrador: ", rl)).trim();
      }
      if (!adminPassword) {
        adminPassword = (await ask("Informe o ADMIN_PASSWORD do administrador: ", rl)).trim();
      }
    }
  } finally {
    if (rl) {
      rl.close();
    }
  }

  const missing = [];
  if (!adminEmail) {
    missing.push("ADMIN_EMAIL");
  }
  if (!adminPassword) {
    missing.push("ADMIN_PASSWORD");
  }

  if (missing.length) {
    throw new Error(
      `Defina ${missing.length > 1 ? "as variáveis" : "a variável"} obrigatórias ${missing.join(", ")} antes de executar este script.`
    );
  }

  return { adminEmail, adminPassword };
}

async function ensureAdmin(pool, credentials) {
  const { adminEmail, adminPassword } = credentials;

  const saltRounds = toInteger(process.env.BCRYPT_SALT_ROUNDS, 10);
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds || 10);

  const [existing] = await pool.query(
    `SELECT id FROM admin_users WHERE email = ? LIMIT 1`,
    [adminEmail]
  );

  if (existing.length) {
    const adminId = existing[0].id;
    await pool.query(
      `UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
      [hashedPassword, adminId]
    );
    return { id: adminId, email: adminEmail, updated: true };
  }

  const adminId = randomUUID();
  await pool.query(
    `INSERT INTO admin_users (id, email, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, NOW(), NOW())`,
    [adminId, adminEmail, hashedPassword]
  );

  return { id: adminId, email: adminEmail, updated: false };
}

async function main() {
  requireEnvVars();
  const credentials = await resolveAdminCredentials();
  const pool = await mysql.createPool(buildPoolConfig());
  try {
    const admin = await ensureAdmin(pool, credentials);
    if (admin.updated) {
      console.log(`Senha do administrador ${admin.email} atualizada com sucesso.`);
    } else {
      console.log(`Administrador criado com email ${admin.email}.`);
    }
    console.log("Utilize as credenciais configuradas para acessar o painel.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Falha ao preparar usuário admin:", error.message || error);
  process.exit(1);
});

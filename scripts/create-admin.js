#!/usr/bin/env node
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");

const envPath = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: envPath });

const DEFAULT_ADMIN_EMAIL = "gerencia@winove.com.br";
const DEFAULT_ADMIN_PASSWORD = "123456789amilase";

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

async function ensureAdmin(pool) {
  const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const adminPassword =
    process.env.ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("Defina ADMIN_PASSWORD ou ADMIN_DEFAULT_PASSWORD para criar o usuário");
  }

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
  const pool = await mysql.createPool(buildPoolConfig());
  try {
    const admin = await ensureAdmin(pool);
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

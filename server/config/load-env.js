import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "..", "..", ".env");

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

function encode(value) {
  return encodeURIComponent(value ?? "");
}

function hasValue(value) {
  return typeof value === "string" && value.trim() !== "";
}

function buildConnectionString() {
  const usingSocket = hasValue(process.env.DB_SOCKET_PATH);
  const requiredVars = ["DB_USER", "DB_PASSWORD", "DB_NAME"];
  if (!usingSocket) {
    requiredVars.push("DB_HOST", "DB_PORT");
  }

  const missing = requiredVars.filter((variable) => !hasValue(process.env[variable]));
  if (missing.length) {
    return null;
  }

  const user = encode(process.env.DB_USER);
  const password = encode(process.env.DB_PASSWORD);
  const host = encode(process.env.DB_HOST ?? "localhost");
  const port = Number.parseInt(process.env.DB_PORT ?? "3306", 10);
  const database = encode(process.env.DB_NAME);

  const url = new URL(`mysql://${user}:${password}@${host}:${Number.isNaN(port) ? 3306 : port}/${database}`);

  if (usingSocket) {
    url.searchParams.set("socketPath", process.env.DB_SOCKET_PATH.trim());
  }

  return url.toString();
}

if (!hasValue(process.env.DATABASE_URL)) {
  const derivedUrl = buildConnectionString();
  if (derivedUrl) {
    process.env.DATABASE_URL = derivedUrl;
  }
}

export function ensureDatabaseUrl() {
  if (!hasValue(process.env.DATABASE_URL)) {
    throw new Error(
      "DATABASE_URL is not configured. Provide DATABASE_URL or the DB_* environment variables before starting the server."
    );
  }
}

ensureDatabaseUrl();

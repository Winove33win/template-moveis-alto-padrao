#!/usr/bin/env node
import "../config/load-env.js";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prismaBinary = process.platform === "win32"
  ? path.resolve(__dirname, "..", "node_modules", ".bin", "prisma.cmd")
  : path.resolve(__dirname, "..", "node_modules", ".bin", "prisma");

if (!fs.existsSync(prismaBinary)) {
  console.error("Prisma CLI binary not found. Make sure dependencies are installed.");
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node ./scripts/run-prisma.js <command> [..options]");
  process.exit(1);
}

const child = spawn(prismaBinary, args, {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("Failed to run Prisma CLI:", error);
  process.exit(1);
});

// app.js
const express = require("express");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const mysql = require("mysql2/promise");

const requiredEnv = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

for (const variable of requiredEnv) {
  if (!process.env[variable]) {
    console.error(`[FALTANDO ENV] ${variable}`);
    process.exit(1);
  }
}

async function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

process.on("unhandledRejection", (error) => {
  console.error("[UNHANDLED REJECTION]", error);
});

process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT EXCEPTION]", error);
});

(async () => {
  try {
    const app = express();
    const PORT = process.env.PORT || 3000;
    const distPath = path.join(__dirname, "dist");
    const indexFile = path.join(distPath, "index.html");

    const pool = await createPool();

    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(compression());

    app.get("/healthz", async (_req, res) => {
      try {
        await pool.query("SELECT 1");
        res.json({ status: "ok" });
      } catch (error) {
        console.error("[HEALTHZ ERROR]", error);
        res.status(500).json({ status: "error" });
      }
    });

    app.get("/api/produtos", async (_req, res) => {
      try {
        const [rows] = await pool.query(
          "SELECT id, name, slug FROM products LIMIT 50"
        );
        res.json(rows);
      } catch (error) {
        console.error("[API PRODUTOS ERRO]", error);
        res.status(500).json({ error: "Erro ao buscar produtos" });
      }
    });

    app.use(
      express.static(distPath, {
        index: false,
        maxAge: "1d",
        etag: true,
      })
    );

    app.get("*", (_req, res) => {
      res.sendFile(indexFile);
    });

    app.listen(PORT, () => {
      console.log(`✅ Server rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[SERVER INIT ERROR]", error);
    process.exit(1);
  }
})();

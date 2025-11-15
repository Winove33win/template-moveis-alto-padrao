// app.js
const express = require("express");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const mysql = require("mysql2/promise");

const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const requiredEnv = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

function toInteger(value, defaultValue) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function validateEnvVariables() {
  const requiresHost = !process.env.DB_SOCKET_PATH;
  const envToValidate = requiresHost
    ? requiredEnv
    : requiredEnv.filter((variable) => !["DB_HOST", "DB_PORT"].includes(variable));
  const missingVariables = envToValidate.filter((variable) => !process.env[variable]);
  const hasJwtSecret = Boolean(process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET);

  if (!hasJwtSecret) {
    missingVariables.push("JWT_SECRET ou ADMIN_JWT_SECRET");
  }

  if (missingVariables.length) {
    missingVariables.forEach((variable) => console.error(`[FALTANDO ENV] ${variable}`));
    console.error(
      "Defina as variáveis obrigatórias no painel/arquivo .env antes de iniciar o servidor."
    );
    process.exit(1);
  }
}

validateEnvVariables();


const fsPromises = fs.promises;
const uploadsDir = path.join(__dirname, "public", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, callback) => {
    const timestamp = Date.now();
    const uniqueSuffix = `${timestamp}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    const sanitizedBase = path
      .basename(file.originalname, extension)
      .replace(/[^a-z0-9_-]/gi, "")
      .slice(0, 40);
    const baseName = sanitizedBase || "media";
    callback(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({ storage });

function normalizeText(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeList(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => Boolean(item));
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item) => Boolean(item));
  }
  return [];
}

function parseProductPayload(body) {
  const rawPayload = body?.payload ?? body?.data ?? null;
  if (!rawPayload) {
    return {};
  }

  if (typeof rawPayload === "object") {
    return rawPayload;
  }

  try {
    return JSON.parse(rawPayload);
  } catch (error) {
    const parseError = new Error("Payload inválido - JSON malformado");
    parseError.status = 400;
    throw parseError;
  }
}

function resolveMediaPayload(mediaPayload = [], files = []) {
  return mediaPayload.map((item, index) => {
    const alt = normalizeText(item?.alt);
    const fileIndex =
      typeof item?.fileIndex === "number" && Number.isFinite(item.fileIndex)
        ? item.fileIndex
        : null;

    if (fileIndex !== null) {
      const file = files[fileIndex];
      if (!file) {
        const error = new Error(`Arquivo de mídia não encontrado para o índice ${fileIndex}`);
        error.status = 400;
        throw error;
      }
      return {
        position: index,
        src: path.posix.join("/uploads", file.filename),
        alt,
        filename: file.filename,
      };
    }

    if (!item?.src) {
      const error = new Error("Cada mídia deve possuir um caminho existente ou um arquivo enviado");
      error.status = 400;
      throw error;
    }

    let source = item.src;
    if (typeof source === "string" && source.includes("/uploads/")) {
      const start = source.indexOf("/uploads/");
      source = source.slice(start);
    }

    return {
      position: index,
      src: source,
      alt,
    };
  });
}

async function cleanupUploadedFiles(files = []) {
  await Promise.all(
    files.map((file) =>
      fsPromises.unlink(file.path).catch((error) => {
        if (error.code !== "ENOENT") {
          console.warn(`Falha ao remover upload temporário ${file.filename}:`, error);
        }
      })
    )
  );
}

async function deleteUploadsForMedia(mediaItems = []) {
  const deletions = mediaItems
    .map((item) => item?.src)
    .filter((src) => typeof src === "string" && src.startsWith("/uploads/"))
    .map((src) => path.basename(src))
    .filter((filename) => Boolean(filename) && filename !== ".gitkeep")
    .map(async (filename) => {
      const filePath = path.join(uploadsDir, filename);
      try {
        await fsPromises.unlink(filePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.warn(`Falha ao remover arquivo ${filename}:`, error);
        }
      }
    });

  await Promise.all(deletions);
}

async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function replaceProductMedia(connection, productId, mediaItems = []) {
  await connection.query("DELETE FROM product_media WHERE product_id = ?", [productId]);
  if (!mediaItems.length) {
    return;
  }

  const placeholders = mediaItems.map(() => "(?, ?, ?, ?)").join(", ");
  const params = [];
  mediaItems.forEach((item) => {
    params.push(productId, item.position, item.src, item.alt ?? null);
  });

  await connection.query(
    `INSERT INTO product_media (product_id, position, src, alt) VALUES ${placeholders}`,
    params
  );
}

async function replaceSimpleList(connection, table, column, productId, values = []) {
  await connection.query(`DELETE FROM ${table} WHERE product_id = ?`, [productId]);
  if (!values.length) {
    return;
  }

  const placeholders = values.map(() => "(?, ?)").join(", ");
  const params = [];
  values.forEach((value) => {
    params.push(productId, value);
  });

  await connection.query(
    `INSERT INTO ${table} (product_id, ${column}) VALUES ${placeholders}`,
    params
  );
}

async function fetchCategories() {
  const [categoryRows] = await pool.query(
    `SELECT id, slug, name, headline, description, hero_image AS heroImage, hero_alt AS heroAlt, seo_title AS seoTitle, seo_description AS seoDescription, position
       FROM catalog_categories
       ORDER BY position ASC`
  );

  const categoryIds = categoryRows.map((row) => row.id);
  const highlightsByCategory = new Map();

  if (categoryIds.length) {
    const [highlightRows] = await pool.query(
      `SELECT category_id AS categoryId, text
         FROM category_highlights
         WHERE category_id IN (?)
         ORDER BY id ASC`,
      [categoryIds]
    );

    highlightRows.forEach((highlight) => {
      const items = highlightsByCategory.get(highlight.categoryId) ?? [];
      items.push(highlight.text);
      highlightsByCategory.set(highlight.categoryId, items);
    });
  }

  return categoryRows.map((row) => ({
    id: row.slug,
    uuid: row.id,
    slug: row.slug,
    name: row.name,
    headline: row.headline ?? null,
    description: row.description ?? null,
    heroImage: row.heroImage ?? null,
    heroAlt: row.heroAlt ?? null,
    seo: {
      title: row.seoTitle ?? null,
      description: row.seoDescription ?? null,
    },
    highlights: highlightsByCategory.get(row.id) ?? [],
    position: row.position ?? 0,
  }));
}

async function fetchProducts({ categorySlug, productId } = {}) {
  const filters = [];
  const params = [];

  if (categorySlug) {
    filters.push("c.slug = ?");
    params.push(categorySlug);
  }

  if (productId) {
    filters.push("p.id = ?");
    params.push(productId);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const [productRows] = await pool.query(
    `SELECT p.id, p.slug, p.category_id AS categoryUuid, c.slug AS categorySlug, p.name, p.summary, p.description, p.designer, p.dimensions, p.light_source AS lightSource, p.lead_time AS leadTime, p.warranty
       FROM products p
       LEFT JOIN catalog_categories c ON c.id = p.category_id
       ${whereClause}
       ORDER BY p.name ASC`,
    params
  );

  if (!productRows.length) {
    return [];
  }

  const productIds = productRows.map((row) => row.id);

  const mediaByProduct = new Map();
  const materialsByProduct = new Map();
  const finishOptionsByProduct = new Map();
  const customizationsByProduct = new Map();

  const [mediaRows] = await pool.query(
    `SELECT id, product_id AS productId, src, alt, position
       FROM product_media
       WHERE product_id IN (?)
       ORDER BY position ASC`,
    [productIds]
  );
  mediaRows.forEach((media) => {
    const items = mediaByProduct.get(media.productId) ?? [];
    items.push({
      id: media.id,
      src: media.src,
      alt: media.alt ?? null,
      order: media.position,
    });
    mediaByProduct.set(media.productId, items);
  });

  const [materialRows] = await pool.query(
    `SELECT product_id AS productId, name
       FROM product_materials
       WHERE product_id IN (?)
       ORDER BY id ASC`,
    [productIds]
  );
  materialRows.forEach((material) => {
    const items = materialsByProduct.get(material.productId) ?? [];
    items.push(material.name);
    materialsByProduct.set(material.productId, items);
  });

  const [finishRows] = await pool.query(
    `SELECT product_id AS productId, name
       FROM product_finish_options
       WHERE product_id IN (?)
       ORDER BY id ASC`,
    [productIds]
  );
  finishRows.forEach((finish) => {
    const items = finishOptionsByProduct.get(finish.productId) ?? [];
    items.push(finish.name);
    finishOptionsByProduct.set(finish.productId, items);
  });

  const [customRows] = await pool.query(
    `SELECT product_id AS productId, description
       FROM product_customizations
       WHERE product_id IN (?)
       ORDER BY id ASC`,
    [productIds]
  );
  customRows.forEach((customization) => {
    const items = customizationsByProduct.get(customization.productId) ?? [];
    items.push(customization.description);
    customizationsByProduct.set(customization.productId, items);
  });

  return productRows.map((row) => ({
    id: row.slug ?? row.id,
    uuid: row.id,
    slug: row.slug ?? row.id,
    categoryId: row.categorySlug ?? row.categoryUuid,
    categoryUuid: row.categoryUuid,
    name: row.name,
    summary: row.summary ?? null,
    description: row.description ?? null,
    media: (mediaByProduct.get(row.id) ?? []).sort((a, b) => a.order - b.order),
    specs: {
      designer: row.designer ?? null,
      dimensions: row.dimensions ?? null,
      materials: materialsByProduct.get(row.id) ?? [],
      finishOptions: finishOptionsByProduct.get(row.id) ?? [],
      lightSource: row.lightSource ?? null,
      leadTime: row.leadTime ?? null,
      warranty: row.warranty ?? null,
      customization: customizationsByProduct.get(row.id) ?? [],
    },
  }));
}

const DB_SOCKET_PATH = process.env.DB_SOCKET_PATH;
const DB_POOL_LIMIT = Math.max(1, toInteger(process.env.DB_POOL_LIMIT, 10));
const DB_QUEUE_LIMIT = Math.max(0, toInteger(process.env.DB_QUEUE_LIMIT, 0));
const DB_CONNECT_RETRIES = Math.max(1, toInteger(process.env.DB_CONNECT_RETRIES, 5));
const DB_CONNECT_RETRY_DELAY_MS = Math.max(
  0,
  toInteger(process.env.DB_CONNECT_RETRY_DELAY_MS, 2000)
);

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || "2h";
const SALT_ROUNDS = toInteger(process.env.BCRYPT_SALT_ROUNDS, 10);

function buildPoolConfig() {
  const baseConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: DB_POOL_LIMIT,
    queueLimit: DB_QUEUE_LIMIT,
  };

  if (DB_SOCKET_PATH) {
    return { ...baseConfig, socketPath: DB_SOCKET_PATH };
  }

  return {
    ...baseConfig,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
  };
}

async function createPool() {
  return mysql.createPool(buildPoolConfig());
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initializePoolWithRetry() {
  let attempt = 0;
  let lastError;

  while (attempt < DB_CONNECT_RETRIES) {
    attempt += 1;

    let candidatePool;
    try {
      candidatePool = await createPool();
      await candidatePool.query("SELECT 1");
      if (attempt > 1) {
        console.log(`✅ Conectado ao banco após ${attempt} tentativas`);
      }
      return candidatePool;
    } catch (error) {
      lastError = error;
      if (typeof candidatePool?.end === "function") {
        candidatePool.end().catch((endError) => {
          console.warn("[DB POOL CLEANUP ERRO]", endError);
        });
      }
      console.error(
        `[DB CONNECTION ERROR] Tentativa ${attempt}/${DB_CONNECT_RETRIES} falhou:`,
        error?.message || error
      );
      if (attempt >= DB_CONNECT_RETRIES) {
        break;
      }
      await sleep(DB_CONNECT_RETRY_DELAY_MS);
    }
  }

  console.error("Não foi possível estabelecer conexão com o banco de dados.");
  if (lastError) {
    console.error(lastError);
  }
  process.exit(1);
}

let pool;

process.on("unhandledRejection", (error) => {
  console.error("[UNHANDLED REJECTION]", error);
});

process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT EXCEPTION]", error);
});

(async () => {
  try {
    const app = express();
    const adminRouter = express.Router();
    const PORT = process.env.PORT || 3000;
    const distPath = path.join(__dirname, "dist");
    const indexFile = path.join(distPath, "index.html");

    pool = await initializePoolWithRetry();

    function mapCategoryRow(row, highlights = []) {
      return {
        id: row.slug,
        uuid: row.id,
        slug: row.slug,
        name: row.name,
        headline: row.headline ?? null,
        description: row.description ?? null,
        heroImage: row.heroImage ?? null,
        heroAlt: row.heroAlt ?? null,
        seo: {
          title: row.seoTitle ?? null,
          description: row.seoDescription ?? null,
        },
        highlights,
        position: row.position ?? 0,
      };
    }

    function mapProductRow(row, relations) {
      return {
        id: row.slug ?? row.id,
        uuid: row.id,
        slug: row.slug ?? row.id,
        categoryId: row.categorySlug ?? row.categoryUuid,
        categoryUuid: row.categoryUuid,
        name: row.name,
        summary: row.summary ?? null,
        description: row.description ?? null,
        media: relations.media ?? [],
        assets: relations.assets ?? [],
        specs: {
          designer: row.designer ?? null,
          dimensions: row.dimensions ?? null,
          materials: relations.materials ?? [],
          finishOptions: relations.finishOptions ?? [],
          lightSource: row.lightSource ?? null,
          leadTime: row.leadTime ?? null,
          warranty: row.warranty ?? null,
          customization: relations.customizations ?? [],
        },
      };
    }

    async function fetchCategoryById(categoryId) {
      const [categoryRows] = await pool.query(
        `SELECT id, slug, name, headline, description, hero_image AS heroImage, hero_alt AS heroAlt,
                seo_title AS seoTitle, seo_description AS seoDescription, position
         FROM catalog_categories
         WHERE id = ?`,
        [categoryId]
      );

      if (!categoryRows.length) {
        return null;
      }

      const [highlightRows] = await pool.query(
        `SELECT text
         FROM category_highlights
         WHERE category_id = ?
         ORDER BY id ASC`,
        [categoryId]
      );

      return mapCategoryRow(categoryRows[0], highlightRows.map((item) => item.text));
    }

    async function fetchProductById(productId) {
      const [productRows] = await pool.query(
        `SELECT p.id, p.slug, p.category_id AS categoryUuid, c.slug AS categorySlug, p.name, p.summary,
                p.description, p.designer, p.dimensions, p.light_source AS lightSource,
                p.lead_time AS leadTime, p.warranty
         FROM products p
         LEFT JOIN catalog_categories c ON c.id = p.category_id
         WHERE p.id = ?`,
        [productId]
      );

      if (!productRows.length) {
        return null;
      }

      const [mediaRows] = await pool.query(
        `SELECT src, alt, position
         FROM product_media
         WHERE product_id = ?
         ORDER BY position ASC`,
        [productId]
      );

      const [materialRows] = await pool.query(
        `SELECT name
         FROM product_materials
         WHERE product_id = ?
         ORDER BY id ASC`,
        [productId]
      );

      const [finishRows] = await pool.query(
        `SELECT name
         FROM product_finish_options
         WHERE product_id = ?
         ORDER BY id ASC`,
        [productId]
      );

      const [customRows] = await pool.query(
        `SELECT description
         FROM product_customizations
         WHERE product_id = ?
         ORDER BY id ASC`,
        [productId]
      );

      const [assetRows] = await pool.query(
        `SELECT id, type, url, title, description
         FROM product_assets
         WHERE product_id = ?
         ORDER BY id ASC`,
        [productId]
      );

      return mapProductRow(productRows[0], {
        media: mediaRows.map((row) => ({
          src: row.src,
          alt: row.alt ?? null,
          order: row.position,
        })),
        materials: materialRows.map((row) => row.name),
        finishOptions: finishRows.map((row) => row.name),
        customizations: customRows.map((row) => row.description),
        assets: assetRows.map((row) => ({
          id: row.id,
          type: row.type,
          url: row.url,
          title: row.title ?? null,
          description: row.description ?? null,
        })),
      });
    }

async function findAdminByEmail(email) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const [rows] = await pool.query(
    `SELECT id, LOWER(email) AS email, password_hash AS passwordHash
     FROM admin_users
     WHERE LOWER(email) = ?
     LIMIT 1`,
    [normalizedEmail]
  );
  return rows[0] ?? null;
}


    async function findAdminById(id) {
      const [rows] = await pool.query(
        `SELECT id, email, password_hash AS passwordHash
         FROM admin_users
         WHERE id = ?`,
        [id]
      );
      return rows[0] ?? null;
    }

    async function authenticate(req, res, next) {
      const authorization = req.headers.authorization;
      if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token não fornecido" });
      }

      const token = authorization.substring("Bearer ".length);

      try {
        const payload = jwt.verify(token, JWT_SECRET);
        const admin = await findAdminById(payload.sub);

        if (!admin) {
          return res.status(401).json({ message: "Usuário não encontrado" });
        }

        req.user = { id: admin.id, email: admin.email };
        next();
      } catch (error) {
        console.error("[AUTH ERROR]", error);
        res.status(401).json({ message: "Token inválido" });
      }
    }

    async function replaceCategoryHighlights(connection, categoryId, highlights) {
      await connection.query("DELETE FROM category_highlights WHERE category_id = ?", [categoryId]);

      if (!Array.isArray(highlights) || highlights.length === 0) {
        return;
      }

      const values = highlights
        .filter((text) => typeof text === "string" && text.trim().length)
        .map((text) => [categoryId, text.trim()]);

      if (!values.length) {
        return;
      }

      await connection.query(
        "INSERT INTO category_highlights (category_id, text) VALUES ?",
        [values]
      );
    }

    async function replaceProductMedia(connection, productId, media) {
      await connection.query("DELETE FROM product_media WHERE product_id = ?", [productId]);

      if (!Array.isArray(media) || media.length === 0) {
        return;
      }

      const values = media.map((item, index) => [
        productId,
        item.src,
        item.alt ?? null,
        item.order ?? index,
      ]);

      await connection.query(
        "INSERT INTO product_media (product_id, src, alt, position) VALUES ?",
        [values]
      );
    }

    async function replaceProductMaterials(connection, productId, materials) {
      await connection.query("DELETE FROM product_materials WHERE product_id = ?", [productId]);

      if (!Array.isArray(materials) || materials.length === 0) {
        return;
      }

      const values = materials.map((name) => [productId, name]);

      await connection.query(
        "INSERT INTO product_materials (product_id, name) VALUES ?",
        [values]
      );
    }

    async function replaceProductFinishOptions(connection, productId, options) {
      await connection.query("DELETE FROM product_finish_options WHERE product_id = ?", [productId]);

      if (!Array.isArray(options) || options.length === 0) {
        return;
      }

      const values = options.map((name) => [productId, name]);

      await connection.query(
        "INSERT INTO product_finish_options (product_id, name) VALUES ?",
        [values]
      );
    }

    async function replaceProductCustomizations(connection, productId, customizations) {
      await connection.query("DELETE FROM product_customizations WHERE product_id = ?", [productId]);

      if (!Array.isArray(customizations) || customizations.length === 0) {
        return;
      }

      const values = customizations.map((description) => [productId, description]);

      await connection.query(
        "INSERT INTO product_customizations (product_id, description) VALUES ?",
        [values]
      );
    }

    async function replaceProductAssets(connection, productId, assets) {
      await connection.query("DELETE FROM product_assets WHERE product_id = ?", [productId]);

      if (!Array.isArray(assets) || assets.length === 0) {
        return;
      }

      const values = assets.map((asset) => [
        productId,
        asset.type,
        asset.url,
        asset.title ?? null,
        asset.description ?? null,
      ]);

      await connection.query(
        "INSERT INTO product_assets (product_id, type, url, title, description) VALUES ?",
        [values]
      );
    }

    function buildUpdateSet(payload, fields) {
      const updates = [];
      const values = [];

      for (const field of fields) {
        if (payload[field] !== undefined) {
          const column =
            field === "heroImage"
              ? "hero_image"
              : field === "heroAlt"
              ? "hero_alt"
              : field === "seoTitle"
              ? "seo_title"
              : field === "seoDescription"
              ? "seo_description"
              : field === "categoryId"
              ? "category_id"
              : field === "lightSource"
              ? "light_source"
              : field === "leadTime"
              ? "lead_time"
              : field;
          updates.push(`${column} = ?`);
          values.push(payload[field]);
        }
      }

      updates.push("updated_at = NOW()");
      return { updates, values };
    }

    function generateToken(admin) {
      return jwt.sign({ sub: admin.id, email: admin.email }, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRATION,
      });
    }

  function adminLoginHandlerFactory() {
  return async (req, res) => {
    try {
      const { email, password } = req.body ?? {};

      if (!email || !password) {
        return res.status(400).json({ message: "Credenciais obrigatórias" });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      console.log("[ADMIN LOGIN] Tentando login para:", normalizedEmail);

      const admin = await findAdminByEmail(normalizedEmail);

      if (!admin) {
        console.warn("[ADMIN LOGIN] Usuário não encontrado:", normalizedEmail);
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      console.log("[ADMIN LOGIN] Usuário encontrado:", admin.email);

      let passwordMatches = false;

      try {
        passwordMatches = await bcrypt.compare(password, admin.passwordHash);
      } catch (err) {
        console.error("[ADMIN LOGIN] Erro no bcrypt.compare:", err);
      }

      if (!passwordMatches) {
        console.warn("[ADMIN LOGIN] Senha inválida para:", admin.email);
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const token = generateToken(admin);

      res.json({
        token,
        user: {
          id: admin.id,
          email: admin.email,
        },
      });
    } catch (error) {
      console.error("[AUTH LOGIN ERRO]", error);
      res.status(500).json({ message: "Erro ao autenticar" });
    }
  };
}


    const handleAdminLogin = adminLoginHandlerFactory();
    adminRouter.post("/login", handleAdminLogin);

    async function handleAdminPasswordChange(req, res) {
      try {
        const { currentPassword, newPassword } = req.body ?? {};

        if (!currentPassword || !newPassword) {
          return res
            .status(400)
            .json({ message: "Senha atual e nova senha são obrigatórias" });
        }

        const admin = await findAdminById(req.user.id);

        if (!admin) {
          return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const passwordMatches = await bcrypt.compare(currentPassword, admin.passwordHash);

        if (!passwordMatches) {
          return res.status(401).json({ message: "Senha atual inválida" });
        }

        const rounds = Number.isNaN(SALT_ROUNDS) ? 10 : SALT_ROUNDS;
        const hashedPassword = await bcrypt.hash(newPassword, rounds);

        await pool.query(
          `UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
          [hashedPassword, admin.id]
        );

        res.json({ message: "Senha atualizada com sucesso" });
      } catch (error) {
        console.error("[AUTH CHANGE PASSWORD ERRO]", error);
        res.status(500).json({ message: "Erro ao atualizar senha" });
      }
    }

    function registerAdminAuthRoutes(target, basePath = "") {
      const prefix = basePath || "";
      target.post(`${prefix}/auth/login`, handleAdminLogin);
      target.post(`${prefix}/auth/change-password`, authenticate, handleAdminPasswordChange);
    }

    registerAdminAuthRoutes(app, "/api");
    registerAdminAuthRoutes(adminRouter);

    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(compression());

    app.use("/uploads", express.static(uploadsDir));

    app.use(express.json());
    app.use("/api/admin", adminRouter);
    


    app.get("/healthz", async (_req, res) => {
      try {
        await pool.query("SELECT 1");
        res.json({ status: "ok" });
      } catch (error) {
        console.error("[HEALTHZ ERROR]", error);
        res.status(500).json({ status: "error" });
      }
    });

    app.post("/api/catalog/categories", authenticate, async (req, res) => {
      const { highlights, ...payload } = req.body ?? {};

      if (!payload.slug || !payload.name) {
        return res.status(400).json({ message: "Slug e nome são obrigatórios" });
      }

      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        const categoryId = randomUUID();

        await connection.query(
          `INSERT INTO catalog_categories
             (id, slug, name, headline, description, hero_image, hero_alt, seo_title, seo_description, position, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            categoryId,
            payload.slug,
            payload.name,
            payload.headline ?? null,
            payload.description ?? null,
            payload.heroImage ?? null,
            payload.heroAlt ?? null,
            payload.seoTitle ?? null,
            payload.seoDescription ?? null,
            payload.position ?? 0,
          ]
        );

        if (highlights !== undefined) {
          await replaceCategoryHighlights(connection, categoryId, highlights);
        }

        await connection.commit();

        const category = await fetchCategoryById(categoryId);
        res.status(201).json(category);
      } catch (error) {
        await connection.rollback();
        console.error("[API CATALOG CATEGORIES CREATE ERRO]", error);
        res.status(500).json({ message: "Erro ao criar categoria" });
      } finally {
        connection.release();
      }
    });

    app.put("/api/catalog/categories/:categoryId", authenticate, async (req, res) => {
      const { categoryId } = req.params;
      const { highlights, ...payload } = req.body ?? {};

      const existing = await fetchCategoryById(categoryId);

      if (!existing) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }

      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        const { updates, values } = buildUpdateSet(payload, [
          "slug",
          "name",
          "headline",
          "description",
          "heroImage",
          "heroAlt",
          "seoTitle",
          "seoDescription",
          "position",
        ]);

        if (updates.length) {
          await connection.query(
            `UPDATE catalog_categories SET ${updates.join(", ")} WHERE id = ?`,
            [...values, categoryId]
          );
        }

        if (highlights !== undefined) {
          await replaceCategoryHighlights(connection, categoryId, highlights);
        }

        await connection.commit();

        const category = await fetchCategoryById(categoryId);
        res.json(category);
      } catch (error) {
        await connection.rollback();
        console.error("[API CATALOG CATEGORIES UPDATE ERRO]", error);
        res.status(500).json({ message: "Erro ao atualizar categoria" });
      } finally {
        connection.release();
      }
    });

    app.delete("/api/catalog/categories/:categoryId", authenticate, async (req, res) => {
      const { categoryId } = req.params;

      try {
        const [result] = await pool.query(
          `DELETE FROM catalog_categories WHERE id = ?`,
          [categoryId]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Categoria não encontrada" });
        }

        res.status(204).end();
      } catch (error) {
        console.error("[API CATALOG CATEGORIES DELETE ERRO]", error);
        res.status(500).json({ message: "Erro ao remover categoria" });
      }
    });

    const categoryRoutes = ["/api/catalog/categories", "/api/categorias"];
    app.get(categoryRoutes, async (_req, res) => {
      try {
        const categories = await fetchCategories();
        res.json(categories);
      } catch (error) {
        console.error("[API CATALOG CATEGORIES ERRO]", error);
        res.status(500).json({ error: "Erro ao buscar categorias" });
      }
    });

    app.post("/api/catalog/products", authenticate, async (req, res) => {
      const payload = req.body ?? {};

      if (!payload.slug || !payload.categoryId || !payload.name) {
        return res
          .status(400)
          .json({ message: "Slug, categoria e nome são obrigatórios" });
      }

      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        const productId = randomUUID();

        await connection.query(
          `INSERT INTO products
             (id, slug, category_id, name, summary, description, designer, dimensions, light_source, lead_time, warranty, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            productId,
            payload.slug,
            payload.categoryId,
            payload.name,
            payload.summary ?? null,
            payload.description ?? null,
            payload.designer ?? null,
            payload.dimensions ?? null,
            payload.lightSource ?? null,
            payload.leadTime ?? null,
            payload.warranty ?? null,
          ]
        );

        await replaceProductMedia(connection, productId, payload.media);
        await replaceProductAssets(connection, productId, payload.assets);
        await replaceProductMaterials(connection, productId, payload.materials);
        await replaceProductFinishOptions(connection, productId, payload.finishOptions);
        await replaceProductCustomizations(
          connection,
          productId,
          payload.customizations
        );

        await connection.commit();

        const product = await fetchProductById(productId);
        res.status(201).json(product);
      } catch (error) {
        await connection.rollback();
        console.error("[API CATALOG PRODUCTS CREATE ERRO]", error);
        res.status(500).json({ message: "Erro ao criar produto" });
      } finally {
        connection.release();
      }
    });

    app.put("/api/catalog/products/:productId", authenticate, async (req, res) => {
      const { productId } = req.params;
      const payload = req.body ?? {};

      const existing = await fetchProductById(productId);

      if (!existing) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        const { updates, values } = buildUpdateSet(payload, [
          "slug",
          "categoryId",
          "name",
          "summary",
          "description",
          "designer",
          "dimensions",
          "lightSource",
          "leadTime",
          "warranty",
        ]);

        if (updates.length) {
          await connection.query(
            `UPDATE products SET ${updates.join(", ")} WHERE id = ?`,
            [...values, productId]
          );
        }

        if (payload.media !== undefined) {
          await replaceProductMedia(connection, productId, payload.media);
        }
        if (payload.assets !== undefined) {
          await replaceProductAssets(connection, productId, payload.assets);
        }
        if (payload.materials !== undefined) {
          await replaceProductMaterials(connection, productId, payload.materials);
        }
        if (payload.finishOptions !== undefined) {
          await replaceProductFinishOptions(
            connection,
            productId,
            payload.finishOptions
          );
        }
        if (payload.customizations !== undefined) {
          await replaceProductCustomizations(
            connection,
            productId,
            payload.customizations
          );
        }

        await connection.commit();

        const product = await fetchProductById(productId);
        res.json(product);
      } catch (error) {
        await connection.rollback();
        console.error("[API CATALOG PRODUCTS UPDATE ERRO]", error);
        res.status(500).json({ message: "Erro ao atualizar produto" });
      } finally {
        connection.release();
      }
    });

    app.delete("/api/catalog/products/:productId", authenticate, async (req, res) => {
      const { productId } = req.params;

      try {
        const [result] = await pool.query(
          `DELETE FROM products WHERE id = ?`,
          [productId]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Produto não encontrado" });
        }

        res.status(204).end();
      } catch (error) {
        console.error("[API CATALOG PRODUCTS DELETE ERRO]", error);
        res.status(500).json({ message: "Erro ao remover produto" });
      }
    });

    const productRoutes = ["/api/catalog/products", "/api/produtos"];
    app.get(productRoutes, async (req, res) => {
      const categorySlug =
        req.query?.category ?? req.query?.categoria ?? req.query?.categorySlug ?? req.query?.slug ?? null;

      try {
        const products = await fetchProducts({ categorySlug });
        res.json(products);
      } catch (error) {
        console.error("[API CATALOG PRODUCTS ERRO]", error);
        res.status(500).json({ error: "Erro ao buscar produtos" });
      }
    });

    app.post(
      "/api/catalog/products",
      upload.array("mediaFiles"),
      async (req, res) => {
        try {
          const payload = parseProductPayload(req.body);
          if (!payload?.name || !payload?.slug || !payload?.categoryId) {
            return res
              .status(400)
              .json({ error: "Campos obrigatórios ausentes: nome, slug ou categoria" });
          }


          const resolvedMedia = resolveMediaPayload(payload.media ?? [], req.files ?? []);
          const specs = payload?.specs ?? {};

          const productId = await withTransaction(async (connection) => {
            const newProductId = randomUUID();
            await connection.query(
              `INSERT INTO products (id, slug, category_id, name, summary, description, designer, dimensions, light_source, lead_time, warranty)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                newProductId,
                payload.slug,
                payload.categoryId,
                payload.name,
                normalizeText(payload.summary),
                normalizeText(payload.description),
                normalizeText(specs.designer),
                normalizeText(specs.dimensions),
                normalizeText(specs.lightSource),
                normalizeText(specs.leadTime),
                normalizeText(specs.warranty),
              ]
            );


            await replaceProductMedia(connection, newProductId, resolvedMedia);
            await replaceSimpleList(
              connection,
              "product_materials",
              "name",
              newProductId,
              normalizeList(specs.materials)
            );
            await replaceSimpleList(
              connection,
              "product_finish_options",
              "name",
              newProductId,
              normalizeList(specs.finishOptions)
            );
            await replaceSimpleList(
              connection,
              "product_customizations",
              "description",
              newProductId,
              normalizeList(specs.customization)
            );

            return newProductId;
          });

          const [created] = await fetchProducts({ productId });
          res.status(201).json(created);
        } catch (error) {
          await cleanupUploadedFiles(req.files ?? []);
          console.error("[API CREATE PRODUCT ERRO]", error);
          const status = Number.isInteger(error.status) ? error.status : 500;
          res.status(status).json({ error: error.message ?? "Erro ao criar produto" });
        }
      }
    );

    app.put(
      "/api/catalog/products/:productId",
      upload.array("mediaFiles"),
      async (req, res) => {
        const { productId } = req.params;

        try {
          const [existing] = await fetchProducts({ productId });
          if (!existing) {
            return res.status(404).json({ error: "Produto não encontrado" });
          }

          const payload = parseProductPayload(req.body);
          if (!payload?.name || !payload?.slug || !payload?.categoryId) {
            return res
              .status(400)
              .json({ error: "Campos obrigatórios ausentes: nome, slug ou categoria" });
          }

          const resolvedMedia = resolveMediaPayload(payload.media ?? [], req.files ?? []);
          const specs = payload?.specs ?? {};

          await withTransaction(async (connection) => {
            await connection.query(
              `UPDATE products
                 SET slug = ?,
                     category_id = ?,
                     name = ?,
                     summary = ?,
                     description = ?,
                     designer = ?,
                     dimensions = ?,
                     light_source = ?,
                     lead_time = ?,
                     warranty = ?
               WHERE id = ?`,
              [
                payload.slug,
                payload.categoryId,
                payload.name,
                normalizeText(payload.summary),
                normalizeText(payload.description),
                normalizeText(specs.designer),
                normalizeText(specs.dimensions),
                normalizeText(specs.lightSource),
                normalizeText(specs.leadTime),
                normalizeText(specs.warranty),
                productId,
              ]
            );

            await replaceProductMedia(connection, productId, resolvedMedia);
            await replaceSimpleList(
              connection,
              "product_materials",
              "name",
              productId,
              normalizeList(specs.materials)
            );
            await replaceSimpleList(
              connection,
              "product_finish_options",
              "name",
              productId,
              normalizeList(specs.finishOptions)
            );
            await replaceSimpleList(
              connection,
              "product_customizations",
              "description",
              productId,
              normalizeList(specs.customization)
            );
          });

          const removedMedia = (existing.media ?? []).filter(
            (media) => !resolvedMedia.some((item) => item.src === media.src)
          );
          await deleteUploadsForMedia(removedMedia);

          const [updated] = await fetchProducts({ productId });
          res.json(updated);
        } catch (error) {
          await cleanupUploadedFiles(req.files ?? []);
          console.error("[API UPDATE PRODUCT ERRO]", error);
          const status = Number.isInteger(error.status) ? error.status : 500;
          res.status(status).json({ error: error.message ?? "Erro ao atualizar produto" });
        }
      }
    );


    app.post("/api/uploads/cleanup", async (_req, res) => {
      try {
        const filesOnDisk = await fsPromises.readdir(uploadsDir);
        const [mediaRows] = await pool.query("SELECT src FROM product_media");
        const referenced = new Set(
          mediaRows
            .map((row) => row?.src)
            .filter((src) => typeof src === "string" && src.startsWith("/uploads/"))
            .map((src) => path.basename(src))
        );

        const products = productRows.map((row) => ({
          id: row.slug ?? row.id,
          uuid: row.id,
          slug: row.slug ?? row.id,
          categoryId: row.categorySlug ?? row.categoryUuid,
          categoryUuid: row.categoryUuid,
          name: row.name,
          summary: row.summary ?? null,
          description: row.description ?? null,
          media: (mediaByProduct.get(row.id) ?? []).sort((a, b) => a.order - b.order),
          assets: assetsByProduct.get(row.id) ?? [],
          specs: {
            designer: row.designer ?? null,
            dimensions: row.dimensions ?? null,
            materials: materialsByProduct.get(row.id) ?? [],
            finishOptions: finishOptionsByProduct.get(row.id) ?? [],
            lightSource: row.lightSource ?? null,
            leadTime: row.leadTime ?? null,
            warranty: row.warranty ?? null,
            customization: customizationsByProduct.get(row.id) ?? [],
          },
        }));


        const removed = [];
        for (const file of filesOnDisk) {
          if (file === ".gitkeep") {
            continue;
          }
          const filePath = path.join(uploadsDir, file);
          const stats = await fsPromises.stat(filePath);
          if (!stats.isFile()) {
            continue;
          }
          if (!referenced.has(file)) {
            await fsPromises.unlink(filePath);
            removed.push(file);
          }
        }

        res.json({ removed, totalRemoved: removed.length });
      } catch (error) {
        console.error("[API UPLOAD CLEANUP ERRO]", error);
        res.status(500).json({ error: "Erro ao limpar uploads" });
      }
    });

    app.get("/healthz", async (_req, res) => {
      try {
        await pool.query("SELECT 1");
        res.json({ status: "ok" });
      } catch (error) {
        console.error("[HEALTHCHECK ERROR]", error);
        res.status(500).json({ status: "error", message: "Banco de dados indisponível" });
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

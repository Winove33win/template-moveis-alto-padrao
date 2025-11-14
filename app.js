// app.js
const express = require("express");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const mysql = require("mysql2/promise");
const multer = require("multer");
const fs = require("fs");
const { randomUUID } = require("crypto");

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
    const PORT = process.env.PORT || 3000;
    const distPath = path.join(__dirname, "dist");
    const indexFile = path.join(distPath, "index.html");

    pool = await createPool();

    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(compression());
    app.use("/uploads", express.static(uploadsDir));

    app.get("/healthz", async (_req, res) => {
      try {
        await pool.query("SELECT 1");
        res.json({ status: "ok" });
      } catch (error) {
        console.error("[HEALTHZ ERROR]", error);
        res.status(500).json({ status: "error" });
      }
    });

    app.get("/api/catalog/categories", async (_req, res) => {
      try {
        const [categoryRows] = await pool.query(
          `SELECT id, slug, name, headline, description, hero_image AS heroImage, hero_alt AS heroAlt, seo_title AS seoTitle, seo_description AS seoDescription, position
           FROM catalog_categories
           ORDER BY position ASC`
        );

        const categoryIds = categoryRows.map((row) => row.id);

        let highlightsByCategory = new Map();
        if (categoryIds.length) {
          const [highlightRows] = await pool.query(
            `SELECT category_id AS categoryId, text
             FROM category_highlights
             WHERE category_id IN (?)
             ORDER BY id ASC`,
            [categoryIds]
          );

          highlightsByCategory = highlightRows.reduce((map, highlight) => {
            const items = map.get(highlight.categoryId) ?? [];
            items.push(highlight.text);
            map.set(highlight.categoryId, items);
            return map;
          }, new Map());
        }

        const categories = categoryRows.map((row) => ({
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

        res.json(categories);
      } catch (error) {
        console.error("[API CATALOG CATEGORIES ERRO]", error);
        res.status(500).json({ error: "Erro ao buscar categorias" });
      }
    });

    app.get("/api/catalog/products", async (req, res) => {
      const { category: categorySlug } = req.query;

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

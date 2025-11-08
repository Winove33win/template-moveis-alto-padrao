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
        const [productRows] = await pool.query(
          `SELECT p.id, p.slug, p.category_id AS categoryUuid, c.slug AS categorySlug, p.name, p.summary, p.description, p.designer, p.dimensions, p.light_source AS lightSource, p.lead_time AS leadTime, p.warranty
           FROM products p
           LEFT JOIN catalog_categories c ON c.id = p.category_id
           ${categorySlug ? "WHERE c.slug = ?" : ""}
           ORDER BY p.name ASC`,
          categorySlug ? [categorySlug] : []
        );

        const productIds = productRows.map((row) => row.id);

        const mediaByProduct = new Map();
        const materialsByProduct = new Map();
        const finishOptionsByProduct = new Map();
        const customizationsByProduct = new Map();

        if (productIds.length) {
          const [mediaRows] = await pool.query(
            `SELECT product_id AS productId, src, alt, position
             FROM product_media
             WHERE product_id IN (?)
             ORDER BY position ASC`,
            [productIds]
          );
          mediaRows.forEach((media) => {
            const items = mediaByProduct.get(media.productId) ?? [];
            items.push({
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
        }

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

        res.json(products);
      } catch (error) {
        console.error("[API CATALOG PRODUCTS ERRO]", error);
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

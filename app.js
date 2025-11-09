// app.js
const express = require("express");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;

if (!JWT_SECRET) {
  console.error("[FALTANDO ENV] JWT_SECRET ou ADMIN_JWT_SECRET");
  process.exit(1);
}

const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || "2h";
const SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

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
      const [rows] = await pool.query(
        `SELECT id, email, password_hash AS passwordHash
         FROM admin_users
         WHERE email = ?`,
        [email]
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

    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(compression());
    app.use(express.json());

    app.post("/api/auth/login", async (req, res) => {
      try {
        const { email, password } = req.body ?? {};

        if (!email || !password) {
          return res.status(400).json({ message: "Credenciais obrigatórias" });
        }

        const admin = await findAdminByEmail(email);

        if (!admin) {
          return res.status(401).json({ message: "Credenciais inválidas" });
        }

        const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

        if (!passwordMatches) {
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
    });

    app.post("/api/auth/change-password", authenticate, async (req, res) => {
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
    });

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
        const assetsByProduct = new Map();

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

          const [assetRows] = await pool.query(
            `SELECT product_id AS productId, id, type, url, title, description
             FROM product_assets
             WHERE product_id IN (?)
             ORDER BY id ASC`,
            [productIds]
          );
          assetRows.forEach((asset) => {
            const items = assetsByProduct.get(asset.productId) ?? [];
            items.push({
              id: asset.id,
              type: asset.type,
              url: asset.url,
              title: asset.title ?? null,
              description: asset.description ?? null,
            });
            assetsByProduct.set(asset.productId, items);
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

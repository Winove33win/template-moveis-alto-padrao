import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import multer from "multer";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, "..", "..", ".env");
dotenv.config({ path: rootEnvPath });

const prisma = new PrismaClient();
const app = express();

const uploadsDir = path.resolve(__dirname, "..", "..", "public", "uploads");
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

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use("/uploads", express.static(uploadsDir));

const API_PREFIX = "/api";

function buildBaseUrl(req) {
  const host = req.get("x-forwarded-host") || req.get("host");
  const protocol = req.get("x-forwarded-proto") || req.protocol;
  if (!host) {
    return "";
  }
  return `${protocol}://${host}`;
}

function mapCategory(record) {
  return {
    id: record.slug,
    uuid: record.id,
    slug: record.slug,
    name: record.name,
    headline: record.headline ?? null,
    description: record.description ?? null,
    heroImage: record.heroImage ?? null,
    heroAlt: record.heroAlt ?? null,
    seo: {
      title: record.seoTitle ?? null,
      description: record.seoDescription ?? null,
    },
    highlights: record.highlights?.map((highlight) => highlight.text) ?? [],
    position: record.position,
  };
}

function mapProduct(record, baseUrl = "") {
  const prefix = baseUrl && baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return {
    id: record.slug ?? record.id,
    uuid: record.id,
    slug: record.slug ?? record.id,
    categoryId: record.category?.slug ?? record.categoryId,
    categoryUuid: record.categoryId,
    name: record.name,
    summary: record.summary ?? null,
    description: record.description ?? null,
    media:
      record.media?.map((item) => ({
        id: item.id,
        src:
          item.src && item.src.startsWith("/uploads") && prefix
            ? `${prefix}${item.src}`
            : item.src,
        alt: item.alt ?? null,
        order: item.position,
      })) ?? [],
    specs: {
      designer: record.designer ?? null,
      dimensions: record.dimensions ?? null,
      materials: record.materials?.map((item) => item.name) ?? [],
      finishOptions: record.finishOptions?.map((item) => item.name) ?? [],
      lightSource: record.lightSource ?? null,
      leadTime: record.leadTime ?? null,
      warranty: record.warranty ?? null,
      customization:
        record.customizations?.map((item) => item.description) ?? [],
    },
  };
}

app.get(`${API_PREFIX}/health`, (_req, res) => {
  res.json({ status: "ok" });
});

app.get(`${API_PREFIX}/catalog/categories`, async (_req, res, next) => {
  try {
    const categories = await prisma.catalogCategory.findMany({
      include: {
        highlights: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { position: "asc" },
    });
    res.json(categories.map(mapCategory));
  } catch (error) {
    next(error);
  }
});

app.get(`${API_PREFIX}/catalog/products`, async (req, res, next) => {
  try {
    const { category: categorySlug } = req.query;

    const products = await prisma.product.findMany({
      where: categorySlug
        ? {
            category: {
              slug: categorySlug,
            },
          }
        : undefined,
      include: {
        media: {
          orderBy: { position: "asc" },
        },
        materials: true,
        finishOptions: true,
        customizations: true,
        category: true,
      },
      orderBy: { name: "asc" },
    });

    const baseUrl = buildBaseUrl(req);
    res.json(products.map((product) => mapProduct(product, baseUrl)));
  } catch (error) {
    next(error);
  }
});

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

async function deleteUploadsForMedia(mediaItems = []) {
  const deletions = mediaItems
    .map((item) => item?.src)
    .filter((src) => typeof src === "string" && src.startsWith("/uploads/"))
    .map((src) => path.basename(src))
    .filter((filename) => Boolean(filename) && filename !== ".gitkeep")
    .map(async (filename) => {
      const filePath = path.join(uploadsDir, filename);
      try {
        await fs.promises.unlink(filePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.warn(`Falha ao remover arquivo ${filename}:`, error);
        }
      }
    });

  await Promise.all(deletions);
}

function buildProductDataFromPayload(payload, resolvedMedia) {
  const specs = payload?.specs ?? {};

  return {
    slug: payload.slug,
    categoryId: payload.categoryId,
    name: payload.name,
    summary: normalizeText(payload.summary),
    description: normalizeText(payload.description),
    designer: normalizeText(specs.designer),
    dimensions: normalizeText(specs.dimensions),
    lightSource: normalizeText(specs.lightSource),
    leadTime: normalizeText(specs.leadTime),
    warranty: normalizeText(specs.warranty),
    media: {
      deleteMany: {},
      create: resolvedMedia.map((media) => ({
        position: media.position,
        src: media.src,
        alt: media.alt,
      })),
    },
    materials: {
      deleteMany: {},
      create: normalizeList(specs.materials).map((name) => ({ name })),
    },
    finishOptions: {
      deleteMany: {},
      create: normalizeList(specs.finishOptions).map((name) => ({ name })),
    },
    customizations: {
      deleteMany: {},
      create: normalizeList(specs.customization).map((description) => ({ description })),
    },
  };
}

app.post(
  `${API_PREFIX}/catalog/products`,
  upload.array("mediaFiles"),
  async (req, res, next) => {
    try {
      const payload = parseProductPayload(req.body);
      if (!payload?.name || !payload?.slug || !payload?.categoryId) {
        return res
          .status(400)
          .json({ message: "Campos obrigatórios ausentes: nome, slug ou categoria" });
      }

      const resolvedMedia = resolveMediaPayload(payload.media ?? [], req.files ?? []);

      const created = await prisma.product.create({
        data: {
          slug: payload.slug,
          categoryId: payload.categoryId,
          name: payload.name,
          summary: normalizeText(payload.summary),
          description: normalizeText(payload.description),
          designer: normalizeText(payload.specs?.designer),
          dimensions: normalizeText(payload.specs?.dimensions),
          lightSource: normalizeText(payload.specs?.lightSource),
          leadTime: normalizeText(payload.specs?.leadTime),
          warranty: normalizeText(payload.specs?.warranty),
          media: {
            create: resolvedMedia.map((media) => ({
              position: media.position,
              src: media.src,
              alt: media.alt,
            })),
          },
          materials: {
            create: normalizeList(payload.specs?.materials).map((name) => ({ name })),
          },
          finishOptions: {
            create: normalizeList(payload.specs?.finishOptions).map((name) => ({ name })),
          },
          customizations: {
            create: normalizeList(payload.specs?.customization).map((description) => ({
              description,
            })),
          },
        },
        include: {
          media: {
            orderBy: { position: "asc" },
          },
          materials: true,
          finishOptions: true,
          customizations: true,
          category: true,
        },
      });

      const baseUrl = buildBaseUrl(req);
      res.status(201).json(mapProduct(created, baseUrl));
    } catch (error) {
      next(error);
    }
  }
);

app.put(
  `${API_PREFIX}/catalog/products/:productId`,
  upload.array("mediaFiles"),
  async (req, res, next) => {
    const { productId } = req.params;

    try {
      const existing = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          media: true,
        },
      });

      if (!existing) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      const payload = parseProductPayload(req.body);
      if (!payload?.name || !payload?.slug || !payload?.categoryId) {
        return res
          .status(400)
          .json({ message: "Campos obrigatórios ausentes: nome, slug ou categoria" });
      }

      const resolvedMedia = resolveMediaPayload(payload.media ?? [], req.files ?? []);

      const updated = await prisma.product.update({
        where: { id: productId },
        data: buildProductDataFromPayload(payload, resolvedMedia),
        include: {
          media: {
            orderBy: { position: "asc" },
          },
          materials: true,
          finishOptions: true,
          customizations: true,
          category: true,
        },
      });

      const removedMedia = existing.media.filter(
        (media) => !resolvedMedia.some((item) => item.src === media.src)
      );

      await deleteUploadsForMedia(removedMedia);

      const baseUrl = buildBaseUrl(req);
      res.json(mapProduct(updated, baseUrl));
    } catch (error) {
      next(error);
    }
  }
);

app.post(`${API_PREFIX}/uploads/cleanup`, async (_req, res, next) => {
  try {
    const filesOnDisk = await fs.promises.readdir(uploadsDir);
    const mediaRecords = await prisma.productMedia.findMany({ select: { src: true } });
    const referencedFiles = new Set(
      mediaRecords
        .map((item) => item?.src)
        .filter((src) => typeof src === "string" && src.startsWith("/uploads/"))
        .map((src) => path.basename(src))
    );

    const removed = [];
    for (const file of filesOnDisk) {
      if (file === ".gitkeep") {
        continue;
      }
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.promises.stat(filePath);
      if (!stats.isFile()) {
        continue;
      }
      if (!referencedFiles.has(file)) {
        await fs.promises.unlink(filePath);
        removed.push(file);
      }
    }

    res.json({ removed, totalRemoved: removed.length });
  } catch (error) {
    next(error);
  }
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = Number.isInteger(err.status) ? err.status : 500;
  const message = err.message ?? "Erro interno do servidor";
  res.status(status).json({ message });
});

const port = Number(process.env.SERVER_PORT) || 4000;

const server = app.listen(port, () => {
  console.log(`🚀 Catalog API pronta em http://localhost:${port}`);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

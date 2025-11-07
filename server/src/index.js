import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, "..", "..", ".env");
dotenv.config({ path: rootEnvPath });

const prisma = new PrismaClient();
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

const API_PREFIX = "/api";

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

function mapProduct(record) {
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
        src: item.src,
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

    res.json(products.map(mapProduct));
  } catch (error) {
    next(error);
  }
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Erro interno do servidor" });
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

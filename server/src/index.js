import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION ?? "2h";
const SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "10", 10);
const JWT_SECRET = process.env.JWT_SECRET ?? process.env.ADMIN_JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT secret is not configured. Set JWT_SECRET or ADMIN_JWT_SECRET.");
  process.exit(1);
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
    assets:
      record.assets?.map((item) => ({
        id: item.id,
        type: item.type,
        url: item.url,
        title: item.title ?? null,
        description: item.description ?? null,
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

function pickDefined(target, source, keys) {
  for (const key of keys) {
    if (source[key] !== undefined) {
      target[key] = source[key];
    }
  }
  return target;
}

function buildMediaCreateData(media = []) {
  if (!Array.isArray(media) || media.length === 0) {
    return undefined;
  }
  return {
    create: media.map((item, index) => ({
      src: item.src,
      alt: item.alt ?? null,
      position: item.order ?? index,
    })),
  };
}

function buildMediaUpdateData(media) {
  if (!Array.isArray(media)) {
    return undefined;
  }
  return {
    deleteMany: {},
    create: media.map((item, index) => ({
      src: item.src,
      alt: item.alt ?? null,
      position: item.order ?? index,
    })),
  };
}

function buildSimpleRelationCreateData(items = [], field = "name") {
  if (!Array.isArray(items) || items.length === 0) {
    return undefined;
  }
  return {
    create: items.map((value) => ({ [field]: value })),
  };
}

function buildSimpleRelationUpdateData(items, field = "name") {
  if (!Array.isArray(items)) {
    return undefined;
  }
  return {
    deleteMany: {},
    create: items.map((value) => ({ [field]: value })),
  };
}

function buildAssetsCreateData(assets = []) {
  if (!Array.isArray(assets) || assets.length === 0) {
    return undefined;
  }
  return {
    create: assets.map((asset) => ({
      type: asset.type,
      url: asset.url,
      title: asset.title ?? null,
      description: asset.description ?? null,
    })),
  };
}

function buildAssetsUpdateData(assets) {
  if (!Array.isArray(assets)) {
    return undefined;
  }
  return {
    deleteMany: {},
    create: assets.map((asset) => ({
      type: asset.type,
      url: asset.url,
      title: asset.title ?? null,
      description: asset.description ?? null,
    })),
  };
}

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authorization.substring("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const admin = await prisma.adminUser.findUnique({ where: { id: payload.sub } });

    if (!admin) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    req.user = { id: admin.id, email: admin.email };
    next();
  } catch (error) {
    console.error("[AUTH ERROR]", error);
    return res.status(401).json({ message: "Token inválido" });
  }
}

const apiRouter = express.Router();
const authRouter = express.Router();
const catalogRouter = express.Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Credenciais obrigatórias" });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign({ sub: admin.id, email: admin.email }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/change-password", authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Senha atual e nova senha são obrigatórias" });
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: req.user.id } });

    if (!admin) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, admin.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Senha atual inválida" });
    }

    const rounds = Number.isNaN(SALT_ROUNDS) ? 10 : SALT_ROUNDS;
    const hashedPassword = await bcrypt.hash(newPassword, rounds);

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: hashedPassword },
    });

    res.json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    next(error);
  }
});

catalogRouter.get("/categories", async (_req, res, next) => {
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

catalogRouter.post("/categories", authenticate, async (req, res, next) => {
  try {
    const { highlights, ...payload } = req.body ?? {};

    if (!payload.slug || !payload.name) {
      return res.status(400).json({ message: "Slug e nome são obrigatórios" });
    }

    const highlightItems = Array.isArray(highlights)
      ? highlights
          .filter((text) => typeof text === "string" && text.trim().length)
          .map((text) => ({ text: text.trim() }))
      : [];

    const data = pickDefined({}, payload, [
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

    const category = await prisma.catalogCategory.create({
      data: {
        ...data,
        highlights: highlightItems.length ? { create: highlightItems } : undefined,
      },
      include: {
        highlights: {
          orderBy: { id: "asc" },
        },
      },
    });

    res.status(201).json(mapCategory(category));
  } catch (error) {
    next(error);
  }
});

catalogRouter.put("/categories/:categoryId", authenticate, async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { highlights, ...payload } = req.body ?? {};

    const existing = await prisma.catalogCategory.findUnique({ where: { id: categoryId } });

    if (!existing) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }

    const data = pickDefined({}, payload, [
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

    const highlightItems = Array.isArray(highlights)
      ? highlights
          .filter((text) => typeof text === "string" && text.trim().length)
          .map((text) => ({ text: text.trim() }))
      : undefined;

    const category = await prisma.catalogCategory.update({
      where: { id: categoryId },
      data: {
        ...data,
        highlights: highlightItems
          ? {
              deleteMany: {},
              create: highlightItems,
            }
          : undefined,
      },
      include: {
        highlights: {
          orderBy: { id: "asc" },
        },
      },
    });

    res.json(mapCategory(category));
  } catch (error) {
    next(error);
  }
});

catalogRouter.delete("/categories/:categoryId", authenticate, async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    await prisma.catalogCategory.delete({ where: { id: categoryId } });

    res.status(204).end();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    next(error);
  }
});

catalogRouter.get("/products", async (req, res, next) => {
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
        assets: {
          orderBy: { id: "asc" },
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

catalogRouter.post("/products", authenticate, async (req, res, next) => {
  try {
    const payload = req.body ?? {};

    if (!payload.slug || !payload.categoryId || !payload.name) {
      return res
        .status(400)
        .json({ message: "Slug, categoria e nome são obrigatórios" });
    }

    const data = pickDefined({}, payload, [
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

    const product = await prisma.product.create({
      data: {
        ...data,
        media: buildMediaCreateData(payload.media),
        assets: buildAssetsCreateData(payload.assets),
        materials: buildSimpleRelationCreateData(payload.materials),
        finishOptions: buildSimpleRelationCreateData(payload.finishOptions),
        customizations: buildSimpleRelationCreateData(payload.customizations, "description"),
      },
      include: {
        media: { orderBy: { position: "asc" } },
        assets: { orderBy: { id: "asc" } },
        materials: true,
        finishOptions: true,
        customizations: true,
        category: true,
      },
    });

    res.status(201).json(mapProduct(product));
  } catch (error) {
    next(error);
  }
});

catalogRouter.put("/products/:productId", authenticate, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const payload = req.body ?? {};

    const existing = await prisma.product.findUnique({ where: { id: productId } });

    if (!existing) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    const data = pickDefined({}, payload, [
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

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        media: buildMediaUpdateData(payload.media),
        assets: buildAssetsUpdateData(payload.assets),
        materials: buildSimpleRelationUpdateData(payload.materials),
        finishOptions: buildSimpleRelationUpdateData(payload.finishOptions),
        customizations: buildSimpleRelationUpdateData(payload.customizations, "description"),
      },
      include: {
        media: { orderBy: { position: "asc" } },
        assets: { orderBy: { id: "asc" } },
        materials: true,
        finishOptions: true,
        customizations: true,
        category: true,
      },
    });

    res.json(mapProduct(product));
  } catch (error) {
    next(error);
  }
});

catalogRouter.delete("/products/:productId", authenticate, async (req, res, next) => {
  try {
    const { productId } = req.params;

    await prisma.product.delete({ where: { id: productId } });

    res.status(204).end();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    next(error);
  }
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/catalog", catalogRouter);

app.use(API_PREFIX, apiRouter);

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

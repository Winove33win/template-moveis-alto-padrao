import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import path from "path";
import { createRequire } from "module";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const dataPath = path.resolve(__dirname, "..", "..", "src", "data", "products.js");

async function loadData() {
  const module = await import(require.resolve(dataPath));
  return module;
}

async function main() {
  const { productCategories, products } = await loadData();

  console.log("🧹 Limpando dados existentes...");
  await prisma.productCustomization.deleteMany();
  await prisma.productFinishOption.deleteMany();
  await prisma.productMaterial.deleteMany();
  await prisma.productMedia.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryHighlight.deleteMany();
  await prisma.catalogCategory.deleteMany();

  const categorySlugToId = new Map();

  console.log("🗂️ Inserindo categorias...");
  for (const [index, category] of productCategories.entries()) {
    const created = await prisma.catalogCategory.create({
      data: {
        slug: category.slug,
        name: category.name,
        headline: category.headline ?? null,
        description: category.description ?? null,
        heroImage: category.heroImage ?? null,
        heroAlt: category.heroAlt ?? null,
        seoTitle: category.seo?.title ?? null,
        seoDescription: category.seo?.description ?? null,
        position: index,
        highlights: {
          create: (category.highlights ?? []).map((text) => ({ text })),
        },
      },
    });

    categorySlugToId.set(category.slug, created.id);
    categorySlugToId.set(category.id, created.id);
  }

  console.log("🪑 Inserindo produtos...");
  for (const product of products) {
    const categoryId = categorySlugToId.get(product.categoryId);
    if (!categoryId) {
      console.warn(`Categoria não encontrada para o produto ${product.name}. Pulando...`);
      continue;
    }

    await prisma.product.create({
      data: {
        slug: product.id,
        categoryId,
        name: product.name,
        summary: product.summary ?? null,
        description: product.description ?? null,
        designer: product.specs?.designer ?? null,
        dimensions: product.specs?.dimensions ?? null,
        lightSource: product.specs?.lightSource ?? null,
        leadTime: product.specs?.leadTime ?? null,
        warranty: product.specs?.warranty ?? null,
        media: {
          create: (product.media ?? []).map((item, index) => ({
            position: index,
            src: item.src,
            alt: item.alt ?? null,
          })),
        },
        materials: {
          create: (product.specs?.materials ?? []).map((name) => ({ name })),
        },
        finishOptions: {
          create: (product.specs?.finishOptions ?? []).map((name) => ({ name })),
        },
        customizations: {
          create: (product.specs?.customization ?? []).map((description) => ({ description })),
        },
      },
    });
  }

  console.log("✅ Seed concluído");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

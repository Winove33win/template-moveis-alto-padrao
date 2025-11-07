import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const dataModulePath = path.resolve(__dirname, "..", "..", "src", "data", "products.js");
const { productCategories, products } = await import(require.resolve(dataModulePath));

function sqlString(value) {
  if (value == null) {
    return "NULL";
  }

  const escaped = String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''");
  return `'${escaped}'`;
}

const statements = [];

statements.push("SET FOREIGN_KEY_CHECKS=0;");

for (const table of [
  "product_customizations",
  "product_finish_options",
  "product_materials",
  "product_media",
  "products",
  "category_highlights",
  "catalog_categories",
]) {
  statements.push(`TRUNCATE TABLE \`${table}\`;`);
}

const categorySlugToId = new Map();

productCategories.forEach((category, index) => {
  const categoryId = category.slug;

  statements.push(
    "INSERT INTO `catalog_categories` " +
      "(`id`, `slug`, `name`, `headline`, `description`, `hero_image`, `hero_alt`, `seo_title`, `seo_description`, `position`) VALUES " +
      `(${sqlString(categoryId)}, ${sqlString(category.slug)}, ${sqlString(category.name)}, ${sqlString(category.headline)}, ${sqlString(category.description)}, ${sqlString(category.heroImage)}, ${sqlString(category.heroAlt)}, ${sqlString(category.seo?.title)}, ${sqlString(category.seo?.description)}, ${index});`
  );

  for (const highlight of category.highlights ?? []) {
    statements.push(
      "INSERT INTO `category_highlights` (`category_id`, `text`) VALUES " +
        `(${sqlString(categoryId)}, ${sqlString(highlight)});`
    );
  }

  categorySlugToId.set(category.slug, categoryId);
  categorySlugToId.set(category.id, categoryId);
});

products.forEach((product) => {
  const categoryId = categorySlugToId.get(product.categoryId);
  if (!categoryId) {
    console.warn(`Categoria não encontrada para o produto ${product.name}. Pulando...`);
    return;
  }

  const productId = product.id;

  statements.push(
    "INSERT INTO `products` " +
      "(`id`, `slug`, `category_id`, `name`, `summary`, `description`, `designer`, `dimensions`, `light_source`, `lead_time`, `warranty`) VALUES " +
      `(${sqlString(productId)}, ${sqlString(product.id)}, ${sqlString(categoryId)}, ${sqlString(product.name)}, ${sqlString(product.summary)}, ${sqlString(product.description)}, ${sqlString(product.specs?.designer)}, ${sqlString(product.specs?.dimensions)}, ${sqlString(product.specs?.lightSource)}, ${sqlString(product.specs?.leadTime)}, ${sqlString(product.specs?.warranty)});`
  );

  (product.media ?? []).forEach((item, index) => {
    statements.push(
      "INSERT INTO `product_media` (`product_id`, `position`, `src`, `alt`) VALUES " +
        `(${sqlString(productId)}, ${index}, ${sqlString(item.src)}, ${sqlString(item.alt)});`
    );
  });

  (product.specs?.materials ?? []).forEach((name) => {
    statements.push(
      "INSERT INTO `product_materials` (`product_id`, `name`) VALUES " +
        `(${sqlString(productId)}, ${sqlString(name)});`
    );
  });

  (product.specs?.finishOptions ?? []).forEach((name) => {
    statements.push(
      "INSERT INTO `product_finish_options` (`product_id`, `name`) VALUES " +
        `(${sqlString(productId)}, ${sqlString(name)});`
    );
  });

  (product.specs?.customization ?? []).forEach((description) => {
    statements.push(
      "INSERT INTO `product_customizations` (`product_id`, `description`) VALUES " +
        `(${sqlString(productId)}, ${sqlString(description)});`
    );
  });
});

statements.push("SET FOREIGN_KEY_CHECKS=1;");

const outputPath = path.resolve(__dirname, "catalog_seed.sql");
await fs.writeFile(outputPath, statements.join("\n") + "\n", "utf8");

console.log(`Arquivo SQL gerado em ${outputPath}`);

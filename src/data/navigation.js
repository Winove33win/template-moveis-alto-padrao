import { productCategories as catalogCategories } from "./products";

export const navItems = [
  { label: "Início", to: "/" },
  { label: "Ambientes", to: "/ambientes" },
  { label: "Sobre", to: "/sobre" },
  { label: "Consultoria", to: "/consultoria" },
];

export function buildProductCategoryPath(slug) {
  return `/produtos/${slug}`;
}

export const productMenuItems = [
  { label: "Visão geral", to: "/produtos", kind: "overview" },
  ...catalogCategories.map((category) => ({
    label: category.name,
    slug: category.slug,
    to: buildProductCategoryPath(category.slug),
    kind: "category",
  })),
];

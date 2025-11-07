import { productCategories as catalogCategories } from "./products";

export const navItems = [
  { label: "Início", to: "/" },
  { label: "Coleções", to: "/colecoes" },
  { label: "Ambientes", to: "/ambientes" },
  { label: "Sobre", to: "/sobre" },
  { label: "Consultoria", to: "/consultoria" },
  { label: "Produtos", to: "/produtos" },
];

export const productCategories = catalogCategories.map((category) => ({
  label: category.name,
  slug: category.slug,
}));

export function buildProductCategoryPath(slug) {
  return `/produtos/${slug}`;
}

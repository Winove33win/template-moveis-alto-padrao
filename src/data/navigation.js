export const navItems = [
  { label: "Início", to: "/" },
  { label: "Coleções", to: "/colecoes" },
  { label: "Ambientes", to: "/ambientes" },
  { label: "Sobre", to: "/sobre" },
  { label: "Consultoria", to: "/consultoria" },
];

export const productCategories = [
  { label: "Abajures", slug: "abajures" },
  { label: "Banquetas", slug: "banquetas" },
  { label: "Mesa de jantar", slug: "mesa-de-jantar" },
  { label: "Mesas laterais", slug: "mesas-laterais" },
  { label: "Sofás", slug: "sofas" },
  { label: "Cadeiras", slug: "cadeiras" },
  { label: "Mesas", slug: "mesas" },
  { label: "Poltronas", slug: "poltronas" },
];

export function buildProductCategoryPath(slug) {
  return `/produtos/${slug}`;
}

const DEFAULT_BASE_URL = "/api";
const CATEGORY_PATHS = ["/catalog/categories", "/categorias"];
const PRODUCT_PATHS = ["/catalog/products", "/produtos"];

function getBaseUrl() {
  const base = import.meta.env?.VITE_API_BASE_URL ?? DEFAULT_BASE_URL;
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function sanitizeParams(params) {
  if (!params) {
    return undefined;
  }
  const filteredEntries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!filteredEntries.length) {
    return undefined;
  }
  return Object.fromEntries(filteredEntries);
}

function buildUrl(path, params) {
  const baseUrl = getBaseUrl();
  const targetPath = path.startsWith("/") ? path : `/${path}`;
  const searchParams = params ? new URLSearchParams(params) : null;
  const url = `${baseUrl}${targetPath}`;
  return searchParams && searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    const error = new Error(message || `Falha ao carregar dados (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function fetchFromPaths(paths, params) {
  let lastError = null;
  for (const path of paths) {
    try {
      const url = buildUrl(path, sanitizeParams(params));
      return await fetchJson(url);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("Não foi possível carregar os dados do catálogo");
}

function normalizeCollection(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }
  return [];
}

function normalizeCategory(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const slug = record.slug ?? record.id ?? record.uuid ?? record.codigo ?? null;
  const uuid = record.uuid ?? record.id ?? null;
  const seoTitle = record.seo?.title ?? record.seoTitle ?? record.seo_title ?? record.metaTitle ?? null;
  const seoDescription =
    record.seo?.description ?? record.seoDescription ?? record.seo_description ?? record.metaDescription ?? null;
  const highlightSource = record.highlights ?? record.destaques ?? [];
  const highlights = Array.isArray(highlightSource)
    ? highlightSource
        .map((item) => (typeof item === "string" ? item : item?.text ?? item?.descricao ?? null))
        .filter(Boolean)
    : [];

  return {
    id: slug ?? uuid,
    uuid,
    slug: slug ?? uuid,
    name: record.name ?? record.nome ?? record.title ?? "",
    headline: record.headline ?? record.chamada ?? record.head ?? null,
    description: record.description ?? record.descricao ?? null,
    heroImage: record.heroImage ?? record.hero_image ?? record.hero ?? record.capa ?? null,
    heroAlt: record.heroAlt ?? record.hero_alt ?? record.heroDescription ?? null,
    seo: {
      title: seoTitle,
      description: seoDescription,
    },
    highlights,
    position: record.position ?? record.order ?? 0,
  };
}

function normalizeMediaItems(media = [], fallbackId) {
  if (!Array.isArray(media)) {
    return [];
  }

  return media
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `${fallbackId ?? "media"}-${index}`,
          src: item,
          alt: null,
          order: index,
        };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const src = item.src ?? item.url ?? item.path ?? item.image ?? null;
      if (!src) {
        return null;
      }

      return {
        id: item.id ?? item.uuid ?? `${fallbackId ?? "media"}-${index}`,
        src,
        alt: item.alt ?? item.description ?? item.descricao ?? null,
        order: item.order ?? item.position ?? index,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : item?.name ?? item?.descricao ?? null)).filter(Boolean);
  }
  return [];
}

function normalizeProduct(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const slug = record.slug ?? record.id ?? record.uuid ?? record.codigo ?? null;
  const uuid = record.uuid ?? record.id ?? null;
  const categorySlug =
    record.categoryId ??
    record.category_id ??
    record.categorySlug ??
    record.category?.slug ??
    record.categoriaId ??
    record.categoriaSlug ??
    null;

  const mediaSource = record.media ?? record.images ?? record.fotos ?? [];
  const assetsSource = record.assets ?? record.arquivos ?? record.links ?? [];
  const rawSpecs = record.specs ?? record.especificacoes ?? {};

  const materials = normalizeList(rawSpecs.materials ?? rawSpecs.materiais ?? record.materials);
  const finishOptions = normalizeList(rawSpecs.finishOptions ?? rawSpecs.acabamentos ?? record.finishOptions);
  const customization = normalizeList(rawSpecs.customization ?? rawSpecs.personalizacoes ?? record.customizations);

  const assets = Array.isArray(assetsSource)
    ? assetsSource
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          return {
            id: item.id ?? item.uuid ?? item.url ?? null,
            type: item.type ?? item.tipo ?? null,
            url: item.url ?? item.src ?? null,
            title: item.title ?? item.titulo ?? null,
            description: item.description ?? item.descricao ?? null,
          };
        })
        .filter((item) => item?.url)
    : [];

  return {
    id: slug ?? uuid,
    uuid,
    slug: slug ?? uuid,
    categoryId: categorySlug ?? record.categoryUuid ?? record.category_uuid ?? null,
    categoryUuid: record.categoryUuid ?? record.category_uuid ?? record.categoryId ?? null,
    name: record.name ?? record.nome ?? "",
    summary: record.summary ?? record.resumo ?? record.description ?? null,
    description: record.description ?? record.detalhes ?? null,
    media: normalizeMediaItems(mediaSource, slug ?? uuid),
    assets,
    specs: {
      designer: rawSpecs.designer ?? record.designer ?? rawSpecs.autor ?? null,
      dimensions: rawSpecs.dimensions ?? record.dimensions ?? rawSpecs.dimensoes ?? null,
      materials,
      finishOptions,
      lightSource: rawSpecs.lightSource ?? record.lightSource ?? rawSpecs.iluminacao ?? null,
      leadTime: rawSpecs.leadTime ?? record.leadTime ?? rawSpecs.prazo ?? null,
      warranty: rawSpecs.warranty ?? record.warranty ?? rawSpecs.garantia ?? null,
      customization,
    },
  };
}

export async function fetchCatalogCategories() {
  const payload = await fetchFromPaths(CATEGORY_PATHS);
  return normalizeCollection(payload)
    .map(normalizeCategory)
    .filter(Boolean)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export async function fetchCatalogProducts({ category } = {}) {
  const params = category ? { category } : undefined;
  const payload = await fetchFromPaths(PRODUCT_PATHS, params);
  return normalizeCollection(payload).map(normalizeProduct).filter(Boolean);
}

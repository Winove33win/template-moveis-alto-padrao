const DEFAULT_BASE_URL = "/api";

function getBaseUrl() {
  const base = import.meta.env?.VITE_API_BASE_URL ?? DEFAULT_BASE_URL;
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function buildUrl(path, params) {
  const baseUrl = getBaseUrl();
  const targetPath = path.startsWith("/") ? path : `/${path}`;
  const query = params ? new URLSearchParams(params) : null;
  const url = `${baseUrl}${targetPath}`;
  return query && query.toString() ? `${url}?${query.toString()}` : url;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Falha ao carregar dados (${response.status})`);
  }
  return response.json();
}

export function fetchCatalogCategories() {
  return fetchJson(buildUrl("/catalog/categories"));
}

export function fetchCatalogProducts({ category } = {}) {
  const params = category ? { category } : undefined;
  return fetchJson(buildUrl("/catalog/products", params));
}

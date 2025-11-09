const DEFAULT_BASE_URL = "/api";

function getBaseUrl() {
  const base = import.meta.env?.VITE_API_BASE_URL ?? DEFAULT_BASE_URL;
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function buildUrl(path) {
  const baseUrl = getBaseUrl();
  const targetPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${targetPath}`;
}

async function fetchJson(url, options) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Falha na requisição";
    try {
      const body = await response.json();
      message = body?.message ?? message;
    } catch (error) {
      message = await response.text().catch(() => message);
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getAdminSession() {
  return fetchJson(buildUrl("/admin/session"), { method: "GET" });
}

export function loginAdmin(credentials) {
  return fetchJson(buildUrl("/admin/login"), {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function logoutAdmin() {
  return fetchJson(buildUrl("/admin/logout"), {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function createCatalogCategory(data) {
  return fetchJson(buildUrl("/admin/catalog/categories"), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCatalogCategory(id, data) {
  return fetchJson(buildUrl(`/admin/catalog/categories/${id}`), {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCatalogCategory(id) {
  return fetchJson(buildUrl(`/admin/catalog/categories/${id}`), {
    method: "DELETE",
  });
}

export function createCatalogProduct(data) {
  return fetchJson(buildUrl("/admin/catalog/products"), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCatalogProduct(id, data) {
  return fetchJson(buildUrl(`/admin/catalog/products/${id}`), {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCatalogProduct(id) {
  return fetchJson(buildUrl(`/admin/catalog/products/${id}`), {
    method: "DELETE",
  });
}

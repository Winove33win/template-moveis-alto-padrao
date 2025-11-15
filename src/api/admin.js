const DEFAULT_BASE_URL = "/api";
const ADMIN_TOKEN_KEY = "catalog_admin_token";

let adminToken = null;

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadStoredToken() {
  if (adminToken) {
    return adminToken;
  }

  if (!isBrowser()) {
    return null;
  }

  adminToken = window.localStorage.getItem(ADMIN_TOKEN_KEY);
  return adminToken;
}

export function setAdminToken(token) {
  adminToken = token ?? null;

  if (!isBrowser()) {
    return;
  }

  if (adminToken) {
    window.localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
  } else {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function clearAdminToken() {
  setAdminToken(null);
}

function getAdminToken() {
  return loadStoredToken();
}

export function getAdminAuthHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getBaseUrl() {
  const base = import.meta.env?.VITE_API_BASE_URL ?? DEFAULT_BASE_URL;
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function buildUrl(path) {
  const baseUrl = getBaseUrl();
  const targetPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${targetPath}`;
}


async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Falha na requisição (${response.status})`);
  }
  return response.json();
}

function serializeSpecs(specs = {}) {
  return {
    designer: specs.designer ?? null,
    dimensions: specs.dimensions ?? null,
    lightSource: specs.lightSource ?? null,
    leadTime: specs.leadTime ?? null,
    warranty: specs.warranty ?? null,
    materials: specs.materials ?? [],
    finishOptions: specs.finishOptions ?? [],
    customization: specs.customization ?? [],
  };
}

export function prepareProductFormData(product) {
  const formData = new FormData();
  const files = [];

  const mediaPayload = (product.media ?? []).map((item) => {
    const payloadItem = {
      alt: item.alt ?? null,
    };

    if (item.id) {
      payloadItem.id = item.id;
    }

    if (typeof File !== "undefined" && item.file instanceof File) {
      const index = files.push(item.file) - 1;
      payloadItem.fileIndex = index;
    } else if (item.src) {
      payloadItem.src = item.src;
    }

    return payloadItem;
  });

  const payload = {
    slug: product.slug,
    categoryId: product.categoryId,
    name: product.name,
    summary: product.summary ?? null,
    description: product.description ?? null,
    specs: serializeSpecs(product.specs),
    media: mediaPayload,
  };

  formData.append("payload", JSON.stringify(payload));
  files.forEach((file) => formData.append("mediaFiles", file));

  return formData;
}

export async function createProduct(product) {
  const response = await fetch(buildUrl("/catalog/products"), {
    method: "POST",
    body: prepareProductFormData(product),
    headers: {
      ...getAdminAuthHeaders(),
    },
    credentials: "include",
  });

  return handleResponse(response);
}

export async function updateProduct(productId, product) {
  const response = await fetch(buildUrl(`/catalog/products/${productId}`), {
    method: "PUT",
    body: prepareProductFormData(product),
    headers: {
      ...getAdminAuthHeaders(),
    },
    credentials: "include",
  });

  return handleResponse(response);
}

export async function cleanupOrphanUploads() {
  const response = await fetch(buildUrl("/uploads/cleanup"), {
    method: "POST",
    headers: {
      ...getAdminAuthHeaders(),
    },
    credentials: "include",
  });

  return handleResponse(response);
}

async function fetchJson(url, options) {
  const authHeaders = getAdminAuthHeaders();
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
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

export async function loginAdmin(credentials) {
  const session = await fetchJson(buildUrl("/admin/login"), {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (session?.token) {
    setAdminToken(session.token);
  }

  return session;
}

export async function logoutAdmin() {
  try {
    return await fetchJson(buildUrl("/admin/logout"), {
      method: "POST",
      body: JSON.stringify({}),
    });
  } finally {
    clearAdminToken();
  }
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

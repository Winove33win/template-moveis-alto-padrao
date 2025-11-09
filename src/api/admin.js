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
  });

  return handleResponse(response);
}

export async function updateProduct(productId, product) {
  const response = await fetch(buildUrl(`/catalog/products/${productId}`), {
    method: "PUT",
    body: prepareProductFormData(product),
  });

  return handleResponse(response);
}

export async function cleanupOrphanUploads() {
  const response = await fetch(buildUrl("/uploads/cleanup"), {
    method: "POST",
  });

  return handleResponse(response);
}

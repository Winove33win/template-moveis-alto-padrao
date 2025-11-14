import { useEffect, useMemo, useRef, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchCatalogCategories, fetchCatalogProducts } from "@/api/catalog";
import {
  cleanupOrphanUploads,
  createProduct,
  updateProduct,
} from "@/api/admin";
import "./AdminProducts.css";

function createKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `media-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function extractUploadPath(src) {
  if (typeof src !== "string") {
    return null;
  }
  const marker = "/uploads/";
  const index = src.indexOf(marker);
  if (index === -1) {
    return src;
  }
  return src.slice(index);
}

function createEmptyForm(defaultCategoryUuid = "") {
  return {
    uuid: null,
    slug: "",
    name: "",
    categoryUuid: defaultCategoryUuid,
    summary: "",
    description: "",
    designer: "",
    dimensions: "",
    lightSource: "",
    leadTime: "",
    warranty: "",
    materialsText: "",
    finishOptionsText: "",
    customizationText: "",
    media: [],
  };
}

function createMediaState(item = {}) {
  return {
    key: item.key ?? createKey(),
    id: item.id ?? null,
    src: item.src ?? null,
    storedSrc: item.storedSrc ?? extractUploadPath(item.src ?? null),
    alt: item.alt ?? "",
    file: item.file ?? null,
    preview: item.preview ?? null,
  };
}

function productToFormState(product, defaultCategoryUuid = "") {
  if (!product) {
    return createEmptyForm(defaultCategoryUuid);
  }

  const sortedMedia = [...(product.media ?? [])].sort((a, b) => a.order - b.order);

  return {
    uuid: product.uuid ?? product.id ?? null,
    slug: product.slug ?? "",
    name: product.name ?? "",
    categoryUuid: product.categoryUuid ?? defaultCategoryUuid,
    summary: product.summary ?? "",
    description: product.description ?? "",
    designer: product.specs?.designer ?? "",
    dimensions: product.specs?.dimensions ?? "",
    lightSource: product.specs?.lightSource ?? "",
    leadTime: product.specs?.leadTime ?? "",
    warranty: product.specs?.warranty ?? "",
    materialsText: (product.specs?.materials ?? []).join("\n"),
    finishOptionsText: (product.specs?.finishOptions ?? []).join("\n"),
    customizationText: (product.specs?.customization ?? []).join("\n"),
    media: sortedMedia.map((item) =>
      createMediaState({
        id: item.id,
        src: item.src,
        storedSrc: extractUploadPath(item.src),
        alt: item.alt ?? "",
      })
    ),
  };
}

function textToList(value) {
  if (!value) {
    return [];
  }
  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => Boolean(entry));
}

function normalizeMediaForPayload(mediaItems = []) {
  return mediaItems.map((item) => {
    const altText = item.alt?.trim() ?? "";
    const normalized = {
      id: item.id ?? null,
      alt: altText ? altText : null,
    };

    if (item.file) {
      normalized.file = item.file;
    } else if (item.storedSrc) {
      normalized.src = item.storedSrc;
    }

    return normalized;
  });
}

function buildPayloadFromForm(formState) {
  return {
    uuid: formState.uuid ?? null,
    slug: formState.slug.trim(),
    name: formState.name.trim(),
    categoryId: formState.categoryUuid,
    summary: formState.summary.trim() || null,
    description: formState.description.trim() || null,
    specs: {
      designer: formState.designer.trim() || null,
      dimensions: formState.dimensions.trim() || null,
      lightSource: formState.lightSource.trim() || null,
      leadTime: formState.leadTime.trim() || null,
      warranty: formState.warranty.trim() || null,
      materials: textToList(formState.materialsText),
      finishOptions: textToList(formState.finishOptionsText),
      customization: textToList(formState.customizationText),
    },
    media: normalizeMediaForPayload(formState.media),
  };
}

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const mediaPreviewUrls = useRef([]);

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["catalogCategories"],
    queryFn: fetchCatalogCategories,
  });

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ["catalogProducts"],
    queryFn: fetchCatalogProducts,
  });

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [formState, setFormState] = useState(() =>
    createEmptyForm(categories?.[0]?.uuid ?? "")
  );
  const [status, setStatus] = useState(null);

  const defaultCategoryUuid = useMemo(
    () => categories?.[0]?.uuid ?? "",
    [categories]
  );

  const isLoading = isLoadingCategories || isLoadingProducts;

  useEffect(() => {
    if (!formState.categoryUuid && defaultCategoryUuid) {
      setFormState((previous) => ({
        ...previous,
        categoryUuid: previous.categoryUuid || defaultCategoryUuid,
      }));
    }
  }, [defaultCategoryUuid, formState.categoryUuid]);

  useEffect(() => {
    if (products.length && !selectedProductId) {
      setSelectedProductId(products[0].uuid ?? products[0].id);
    }
  }, [products, selectedProductId]);

  useEffect(() => {
    function clearPreviews() {
      mediaPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      mediaPreviewUrls.current = [];
    }

    if (!selectedProductId) {
      clearPreviews();
      setFormState(productToFormState(null, defaultCategoryUuid));
      return;
    }

    const product = products.find(
      (item) => item.uuid === selectedProductId || item.id === selectedProductId
    );
    if (product) {
      clearPreviews();
      setFormState(productToFormState(product, defaultCategoryUuid));
    }
  }, [
    selectedProductId,
    products,
    defaultCategoryUuid,
  ]);

  const productMutation = useMutation({
    mutationFn: async (payload) => {
      const { uuid, ...data } = payload;
      if (uuid) {
        return updateProduct(uuid, data);
      }
      return createProduct(data);
    },
    onSuccess: (result) => {
      mediaPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      mediaPreviewUrls.current = [];
      setStatus({ type: "success", message: "Produto salvo com sucesso." });
      setFormState(productToFormState(result, defaultCategoryUuid));
      setSelectedProductId(result.uuid);
      queryClient.invalidateQueries({ queryKey: ["catalogProducts"] });
    },
    onError: (error) => {
      setStatus({ type: "error", message: error.message });
    },
  });

  const cleanupMutation = useMutation({
    mutationFn: cleanupOrphanUploads,
    onSuccess: (result) => {
      const removed = Array.isArray(result?.removed) ? result.removed.length : 0;
      const totalRemoved =
        typeof result?.totalRemoved === "number"
          ? result.totalRemoved
          : removed;
      setStatus({
        type: "success",
        message:
          totalRemoved > 0
            ? `Uploads órfãos removidos: ${totalRemoved}`
            : "Nenhum arquivo órfão encontrado.",
      });
    },
    onError: (error) => {
      setStatus({ type: "error", message: error.message });
    },
  });

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  };

  const handleCategoryChange = (event) => {
    const { value } = event.target;
    setFormState((previous) => ({ ...previous, categoryUuid: value }));
  };

  const handleMediaAltChange = (index, value) => {
    setFormState((previous) => {
      const media = [...previous.media];
      media[index] = { ...media[index], alt: value };
      return { ...previous, media };
    });
  };

  const handleMediaRemove = (index) => {
    setFormState((previous) => {
      const media = [...previous.media];
      const [removed] = media.splice(index, 1);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
        mediaPreviewUrls.current = mediaPreviewUrls.current.filter(
          (url) => url !== removed.preview
        );
      }
      return { ...previous, media };
    });
  };

  const handleMediaMove = (index, direction) => {
    setFormState((previous) => {
      const media = [...previous.media];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= media.length) {
        return previous;
      }
      [media[index], media[targetIndex]] = [media[targetIndex], media[index]];
      return { ...previous, media };
    });
  };

  const handleAddMedia = (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    setFormState((previous) => {
      const additions = files.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        mediaPreviewUrls.current.push(previewUrl);
        return createMediaState({
          file,
          preview: previewUrl,
          src: previewUrl,
          storedSrc: null,
          alt: "",
        });
      });

      return { ...previous, media: [...previous.media, ...additions] };
    });

    event.target.value = "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus(null);

    if (!formState.name.trim() || !formState.slug.trim() || !formState.categoryUuid) {
      setStatus({
        type: "error",
        message: "Preencha nome, slug e categoria do produto.",
      });
      return;
    }

    const payload = buildPayloadFromForm(formState);
    productMutation.mutate(payload);
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
  };

  const handleCreateNew = () => {
    mediaPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    mediaPreviewUrls.current = [];
    setSelectedProductId(null);
    setFormState(createEmptyForm(defaultCategoryUuid));
  };

  return (
    <div className="admin-products">
      <aside className="admin-products__sidebar">
        <div className="admin-products__sidebar-header">
          <h1>Gerenciar produtos</h1>
          <div className="admin-products__sidebar-actions">
            <button type="button" className="admin-button" onClick={handleCreateNew}>
              Novo produto
            </button>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={() => cleanupMutation.mutate()}
              disabled={cleanupMutation.isPending}
            >
              {cleanupMutation.isPending ? "Limpando..." : "Limpar uploads órfãos"}
            </button>
          </div>
        </div>
        {isLoading ? (
          <p className="admin-products__empty">Carregando dados...</p>
        ) : null}
        {categoriesError ? (
          <p className="admin-products__error">{categoriesError.message}</p>
        ) : null}
        {productsError ? (
          <p className="admin-products__error">{productsError.message}</p>
        ) : null}
        {!isLoading && products.length === 0 ? (
          <p className="admin-products__empty">Nenhum produto cadastrado.</p>
        ) : null}
        <ul className="admin-products__list">
          {products.map((product) => (
            <li key={product.uuid ?? product.id}>
              <button
                type="button"
                onClick={() =>
                  handleSelectProduct(product.uuid ?? product.id)
                }
                className={
                  selectedProductId === product.uuid ||
                  selectedProductId === product.id
                    ? "admin-products__list-button admin-products__list-button--active"
                    : "admin-products__list-button"
                }
              >
                {product.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="admin-products__main">
        <form className="admin-products__form" onSubmit={handleSubmit}>
          {status ? (
            <div
              className={
                status.type === "success"
                  ? "admin-status admin-status--success"
                  : "admin-status admin-status--error"
              }
            >
              {status.message}
            </div>
          ) : null}
          <section className="admin-section">
            <h2>Informações básicas</h2>
            <div className="admin-grid">
              <label>
                <span>Nome</span>
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label>
                <span>Slug</span>
                <input
                  type="text"
                  name="slug"
                  value={formState.slug}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label>
                <span>Categoria</span>
                <select
                  name="categoryUuid"
                  value={formState.categoryUuid ?? ""}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="" disabled>
                    Selecione uma categoria
                  </option>
                  {categories.map((category) => (
                    <option key={category.uuid} value={category.uuid}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Resumo</span>
                <textarea
                  name="summary"
                  value={formState.summary}
                  onChange={handleFieldChange}
                  rows={2}
                />
              </label>
            </div>
            <label>
              <span>Descrição</span>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleFieldChange}
                rows={5}
              />
            </label>
          </section>

          <section className="admin-section">
            <h2>Especificações</h2>
            <div className="admin-grid">
              <label>
                <span>Designer</span>
                <input
                  type="text"
                  name="designer"
                  value={formState.designer}
                  onChange={handleFieldChange}
                />
              </label>
              <label>
                <span>Dimensões</span>
                <input
                  type="text"
                  name="dimensions"
                  value={formState.dimensions}
                  onChange={handleFieldChange}
                />
              </label>
              <label>
                <span>Fonte de luz</span>
                <input
                  type="text"
                  name="lightSource"
                  value={formState.lightSource}
                  onChange={handleFieldChange}
                />
              </label>
              <label>
                <span>Prazo de produção</span>
                <input
                  type="text"
                  name="leadTime"
                  value={formState.leadTime}
                  onChange={handleFieldChange}
                />
              </label>
              <label>
                <span>Garantia</span>
                <input
                  type="text"
                  name="warranty"
                  value={formState.warranty}
                  onChange={handleFieldChange}
                />
              </label>
            </div>
            <div className="admin-grid admin-grid--three">
              <label>
                <span>Materiais (um por linha)</span>
                <textarea
                  name="materialsText"
                  value={formState.materialsText}
                  onChange={handleFieldChange}
                  rows={4}
                />
              </label>
              <label>
                <span>Acabamentos (um por linha)</span>
                <textarea
                  name="finishOptionsText"
                  value={formState.finishOptionsText}
                  onChange={handleFieldChange}
                  rows={4}
                />
              </label>
              <label>
                <span>Customizações (uma por linha)</span>
                <textarea
                  name="customizationText"
                  value={formState.customizationText}
                  onChange={handleFieldChange}
                  rows={4}
                />
              </label>
            </div>
          </section>

          <section className="admin-section">
            <h2>Mídia do produto</h2>
            <div className="admin-upload">
              <label className="admin-upload__label">
                <span>Adicionar imagens</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddMedia}
                />
              </label>
              <p className="admin-upload__hint">
                A ordem das imagens define a apresentação no catálogo. Utilize os botões
                abaixo para reordenar ou remover itens.
              </p>
            </div>
            <div className="admin-media-grid">
              {formState.media.map((item, index) => (
                <div key={item.key} className="admin-media-card">
                  {item.src ? (
                    <img src={item.src} alt={item.alt || `Imagem ${index + 1}`} />
                  ) : (
                    <div className="admin-media-card__placeholder">Pré-visualização indisponível</div>
                  )}
                  <label>
                    <span>Texto alternativo</span>
                    <input
                      type="text"
                      value={item.alt}
                      onChange={(event) => handleMediaAltChange(index, event.target.value)}
                    />
                  </label>
                  <div className="admin-media-card__actions">
                    <button
                      type="button"
                      className="admin-button admin-button--ghost"
                      onClick={() => handleMediaMove(index, -1)}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="admin-button admin-button--ghost"
                      onClick={() => handleMediaMove(index, 1)}
                      disabled={index === formState.media.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="admin-button admin-button--danger"
                      onClick={() => handleMediaRemove(index)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="admin-actions">
            <button
              type="submit"
              className="admin-button admin-button--primary"
              disabled={productMutation.isPending}
            >
              {productMutation.isPending
                ? "Salvando..."
                : formState.uuid
                ? "Atualizar produto"
                : "Criar produto"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

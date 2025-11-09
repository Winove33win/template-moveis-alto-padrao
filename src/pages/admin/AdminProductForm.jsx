import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCatalogCategories, useCatalogProducts } from "@/hooks/useCatalogQueries";
import { useAdminCatalog } from "@/hooks/useAdminCatalog";

const INITIAL_FORM_STATE = {
  name: "",
  slug: "",
  summary: "",
  description: "",
  categoryId: "",
  media: [{ src: "", alt: "" }],
  designer: "",
  dimensions: "",
  materials: [""],
  finishOptions: [""],
  lightSource: "",
  leadTime: "",
  warranty: "",
  customizations: [""],
};

export default function AdminProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [feedback, setFeedback] = useState(null);
  const isEditing = Boolean(productId);

  const { data: categories } = useCatalogCategories();
  const { data: products, isLoading: isLoadingProducts } = useCatalogProducts(
    {},
    { enabled: isEditing }
  );

  const product = useMemo(() => {
    if (!isEditing || !products?.length) {
      return null;
    }
    return products.find((item) => item.id === productId || item.slug === productId) ?? null;
  }, [isEditing, products, productId]);

  const {
    createProduct,
    createProductStatus,
    updateProduct,
    updateProductStatus,
    deleteProduct,
  } = useAdminCatalog();

  useEffect(() => {
    if (!product) {
      return;
    }
    setFormState({
      name: product.name ?? "",
      slug: product.slug ?? "",
      summary: product.summary ?? "",
      description: product.description ?? "",
      categoryId: product.categoryUuid ?? product.categoryId ?? "",
      media: product.media?.length
        ? product.media.map((item) => ({ src: item.src ?? "", alt: item.alt ?? "" }))
        : [{ src: "", alt: "" }],
      designer: product.specs?.designer ?? "",
      dimensions: product.specs?.dimensions ?? "",
      materials: product.specs?.materials?.length ? [...product.specs.materials] : [""],
      finishOptions: product.specs?.finishOptions?.length
        ? [...product.specs.finishOptions]
        : [""],
      lightSource: product.specs?.lightSource ?? "",
      leadTime: product.specs?.leadTime ?? "",
      warranty: product.specs?.warranty ?? "",
      customizations: product.specs?.customization?.length
        ? [...product.specs.customization]
        : [""],
    });
  }, [product]);

  const handleBasicChange = (event) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormState((previous) => {
      const nextValues = [...previous[field]];
      nextValues[index] = value;
      return { ...previous, [field]: nextValues };
    });
  };

  const addArrayItem = (field) => {
    setFormState((previous) => ({
      ...previous,
      [field]: [...previous[field], field === "media" ? { src: "", alt: "" } : ""],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormState((previous) => ({
      ...previous,
      [field]: previous[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    const payload = {
      name: formState.name,
      slug: formState.slug,
      summary: formState.summary,
      description: formState.description,
      categoryId: formState.categoryId,
      media: formState.media
        .filter((item) => item.src && item.src.trim().length > 0)
        .map((item, index) => ({
          src: item.src,
          alt: item.alt,
          position: index,
        })),
      specs: {
        designer: formState.designer,
        dimensions: formState.dimensions,
        materials: formState.materials.filter((item) => item && item.trim().length > 0),
        finishOptions: formState.finishOptions.filter((item) => item && item.trim().length > 0),
        lightSource: formState.lightSource,
        leadTime: formState.leadTime,
        warranty: formState.warranty,
        customization: formState.customizations.filter(
          (item) => item && item.trim().length > 0
        ),
      },
    };

    try {
      if (isEditing) {
        await updateProduct({ id: product?.uuid ?? product?.id ?? productId, data: payload });
      } else {
        await createProduct(payload);
      }
      setFeedback({ type: "success", message: "Produto salvo com sucesso" });
      navigate("/admin/catalogo");
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  };

  const handleDelete = async () => {
    if (!product) {
      return;
    }
    if (!window.confirm("Deseja realmente remover este produto?")) {
      return;
    }
    setFeedback(null);
    try {
      await deleteProduct(product.uuid ?? product.id);
      setFeedback({ type: "success", message: "Produto removido" });
      navigate("/admin/catalogo");
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  };

  const isPending = createProductStatus.isPending || updateProductStatus.isPending;

  return (
    <div className="admin-form-page">
      <header className="admin-form-page__header">
        <div>
          <h1>{isEditing ? "Editar produto" : "Novo produto"}</h1>
          <p>Configure informações e mídias que serão exibidas na vitrine.</p>
        </div>
        <Link to="/admin/catalogo" className="btn btn-outline">
          Voltar
        </Link>
      </header>

      {feedback ? (
        <div className={`admin-feedback admin-feedback--${feedback.type}`}>
          {feedback.message}
        </div>
      ) : null}

      {isEditing && isLoadingProducts && !product ? (
        <p>Carregando produto...</p>
      ) : isEditing && !isLoadingProducts && !product ? (
        <p>Produto não encontrado. Verifique o link ou cadastre um novo produto.</p>
      ) : (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
            <label className="admin-form__field">
              <span>Nome</span>
              <input name="name" value={formState.name} onChange={handleBasicChange} required />
            </label>
            <label className="admin-form__field">
              <span>Slug</span>
              <input name="slug" value={formState.slug} onChange={handleBasicChange} required />
            </label>
            <label className="admin-form__field">
              <span>Resumo</span>
              <input name="summary" value={formState.summary} onChange={handleBasicChange} />
            </label>
            <label className="admin-form__field admin-form__field--textarea">
              <span>Descrição completa</span>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleBasicChange}
                rows={5}
              />
            </label>
            <label className="admin-form__field">
              <span>Categoria</span>
              <select
                name="categoryId"
                value={formState.categoryId}
                onChange={handleBasicChange}
                required
              >
                <option value="" disabled>
                  Selecione uma categoria
                </option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.uuid ?? category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="admin-form__fieldset">
            <legend>Mídias</legend>
            {formState.media.map((item, index) => (
              <div key={index} className="admin-form__array-field admin-form__array-field--media">
                <div className="admin-form__field">
                  <span>URL</span>
                  <input
                    value={item.src}
                    onChange={(event) => handleArrayChange("media", index, {
                      ...item,
                      src: event.target.value,
                    })}
                    placeholder="https://..."
                  />
                </div>
                <div className="admin-form__field">
                  <span>Texto alternativo</span>
                  <input
                    value={item.alt}
                    onChange={(event) => handleArrayChange("media", index, {
                      ...item,
                      alt: event.target.value,
                    })}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => removeArrayItem("media", index)}
                  disabled={formState.media.length === 1}
                >
                  Remover
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline" onClick={() => addArrayItem("media")}>
              Adicionar mídia
            </button>
          </fieldset>

          <fieldset className="admin-form__fieldset">
            <legend>Materiais</legend>
            {formState.materials.map((material, index) => (
              <div key={index} className="admin-form__array-field">
                <input
                  value={material}
                  onChange={(event) => handleArrayChange("materials", index, event.target.value)}
                  placeholder="Nome do material"
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => removeArrayItem("materials", index)}
                  disabled={formState.materials.length === 1}
                >
                  Remover
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline" onClick={() => addArrayItem("materials")}>
              Adicionar material
            </button>
          </fieldset>

          <fieldset className="admin-form__fieldset">
            <legend>Acabamentos</legend>
            {formState.finishOptions.map((finish, index) => (
              <div key={index} className="admin-form__array-field">
                <input
                  value={finish}
                  onChange={(event) => handleArrayChange("finishOptions", index, event.target.value)}
                  placeholder="Opção de acabamento"
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => removeArrayItem("finishOptions", index)}
                  disabled={formState.finishOptions.length === 1}
                >
                  Remover
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => addArrayItem("finishOptions")}
            >
              Adicionar acabamento
            </button>
          </fieldset>

          <fieldset className="admin-form__fieldset">
            <legend>Detalhes adicionais</legend>
            <label className="admin-form__field">
              <span>Designer</span>
              <input name="designer" value={formState.designer} onChange={handleBasicChange} />
            </label>
            <label className="admin-form__field">
              <span>Dimensões</span>
              <input name="dimensions" value={formState.dimensions} onChange={handleBasicChange} />
            </label>
            <label className="admin-form__field">
              <span>Fonte de luz</span>
              <input name="lightSource" value={formState.lightSource} onChange={handleBasicChange} />
            </label>
            <label className="admin-form__field">
              <span>Prazo de entrega</span>
              <input name="leadTime" value={formState.leadTime} onChange={handleBasicChange} />
            </label>
            <label className="admin-form__field">
              <span>Garantia</span>
              <input name="warranty" value={formState.warranty} onChange={handleBasicChange} />
            </label>
          </fieldset>

          <fieldset className="admin-form__fieldset">
            <legend>Personalizações</legend>
            {formState.customizations.map((customization, index) => (
              <div key={index} className="admin-form__array-field">
                <input
                  value={customization}
                  onChange={(event) =>
                    handleArrayChange("customizations", index, event.target.value)
                  }
                  placeholder="Opção de personalização"
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => removeArrayItem("customizations", index)}
                  disabled={formState.customizations.length === 1}
                >
                  Remover
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => addArrayItem("customizations")}
            >
              Adicionar personalização
            </button>
          </fieldset>

          <div className="admin-form__actions">
            {isEditing && product ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleDelete}
                disabled={updateProductStatus.isPending}
              >
                Excluir produto
              </button>
            ) : null}
            <button type="submit" className="btn" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar produto"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

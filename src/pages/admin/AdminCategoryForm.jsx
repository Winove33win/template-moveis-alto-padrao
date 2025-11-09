import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCatalogCategories } from "@/hooks/useCatalogQueries";
import { useAdminCatalog } from "@/hooks/useAdminCatalog";

const INITIAL_FORM_STATE = {
  name: "",
  slug: "",
  headline: "",
  description: "",
  heroImage: "",
  heroAlt: "",
  position: 0,
  seoTitle: "",
  seoDescription: "",
  highlights: [""],
};

export default function AdminCategoryForm() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [feedback, setFeedback] = useState(null);
  const isEditing = Boolean(categoryId);

  const { data: categories, isLoading } = useCatalogCategories({ enabled: isEditing });
  const category = useMemo(() => {
    if (!isEditing || !categories?.length) {
      return null;
    }
    return (
      categories.find((item) => item.id === categoryId || item.slug === categoryId) ?? null
    );
  }, [categories, categoryId, isEditing]);

  const {
    createCategory,
    createCategoryStatus,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
  } = useAdminCatalog();

  useEffect(() => {
    if (!category) {
      return;
    }
    setFormState({
      name: category.name ?? "",
      slug: category.slug ?? "",
      headline: category.headline ?? "",
      description: category.description ?? "",
      heroImage: category.heroImage ?? "",
      heroAlt: category.heroAlt ?? "",
      position: category.position ?? 0,
      seoTitle: category.seo?.title ?? "",
      seoDescription: category.seo?.description ?? "",
      highlights: category.highlights?.length ? [...category.highlights] : [""],
    });
  }, [category]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  };

  const handleHighlightChange = (index, value) => {
    setFormState((previous) => {
      const nextHighlights = [...previous.highlights];
      nextHighlights[index] = value;
      return { ...previous, highlights: nextHighlights };
    });
  };

  const addHighlight = () => {
    setFormState((previous) => ({
      ...previous,
      highlights: [...previous.highlights, ""],
    }));
  };

  const removeHighlight = (index) => {
    setFormState((previous) => ({
      ...previous,
      highlights: previous.highlights.filter((_, highlightIndex) => highlightIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    const payload = {
      name: formState.name,
      slug: formState.slug,
      headline: formState.headline,
      description: formState.description,
      heroImage: formState.heroImage,
      heroAlt: formState.heroAlt,
      position: Number(formState.position) || 0,
      seo: {
        title: formState.seoTitle,
        description: formState.seoDescription,
      },
      highlights: formState.highlights.filter((item) => item && item.trim().length > 0),
    };

    try {
      if (isEditing) {
        await updateCategory({ id: category?.uuid ?? category?.id ?? categoryId, data: payload });
      } else {
        await createCategory(payload);
      }
      setFeedback({ type: "success", message: "Categoria salva com sucesso" });
      navigate("/admin/catalogo");
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  };

  const handleDelete = async () => {
    if (!category) {
      return;
    }
    if (!window.confirm("Deseja realmente remover esta categoria?")) {
      return;
    }
    setFeedback(null);
    try {
      await deleteCategory(category.uuid ?? category.id);
      setFeedback({ type: "success", message: "Categoria removida" });
      navigate("/admin/catalogo");
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  };

  const isPending = createCategoryStatus.isPending || updateCategoryStatus.isPending;

  return (
    <div className="admin-form-page">
      <header className="admin-form-page__header">
        <div>
          <h1>{isEditing ? "Editar categoria" : "Nova categoria"}</h1>
          <p>Configure as informações exibidas no catálogo público.</p>
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

      {isEditing && isLoading && !category ? (
        <p>Carregando categoria...</p>
      ) : isEditing && !isLoading && !category ? (
        <p>Categoria não encontrada. Verifique o link ou cadastre uma nova categoria.</p>
      ) : (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
            <label className="admin-form__field">
              <span>Nome</span>
              <input name="name" value={formState.name} onChange={handleChange} required />
            </label>
            <label className="admin-form__field">
              <span>Slug</span>
              <input name="slug" value={formState.slug} onChange={handleChange} required />
            </label>
            <label className="admin-form__field">
              <span>Headline</span>
              <input name="headline" value={formState.headline} onChange={handleChange} />
            </label>
            <label className="admin-form__field admin-form__field--textarea">
              <span>Descrição</span>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleChange}
                rows={4}
              />
            </label>
            <label className="admin-form__field">
              <span>Imagem principal (URL)</span>
              <input name="heroImage" value={formState.heroImage} onChange={handleChange} />
            </label>
            <label className="admin-form__field">
              <span>Texto alternativo</span>
              <input name="heroAlt" value={formState.heroAlt} onChange={handleChange} />
            </label>
            <label className="admin-form__field">
              <span>Posição</span>
              <input
                type="number"
                name="position"
                value={formState.position}
                onChange={handleChange}
                min="0"
              />
            </label>
          </div>

          <fieldset className="admin-form__fieldset">
            <legend>Destaques</legend>
            {formState.highlights.map((highlight, index) => (
              <div key={index} className="admin-form__array-field">
                <input
                  value={highlight}
                  onChange={(event) => handleHighlightChange(index, event.target.value)}
                  placeholder="Descrição do destaque"
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => removeHighlight(index)}
                  disabled={formState.highlights.length === 1}
                >
                  Remover
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline" onClick={addHighlight}>
              Adicionar destaque
            </button>
          </fieldset>

          <fieldset className="admin-form__fieldset">
            <legend>SEO</legend>
            <label className="admin-form__field">
              <span>Título</span>
              <input name="seoTitle" value={formState.seoTitle} onChange={handleChange} />
            </label>
            <label className="admin-form__field admin-form__field--textarea">
              <span>Descrição</span>
              <textarea
                name="seoDescription"
                value={formState.seoDescription}
                onChange={handleChange}
                rows={3}
              />
            </label>
          </fieldset>

          <div className="admin-form__actions">
            {isEditing && category ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleDelete}
                disabled={updateCategoryStatus.isPending}
              >
                Excluir categoria
              </button>
            ) : null}
            <button type="submit" className="btn" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar categoria"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

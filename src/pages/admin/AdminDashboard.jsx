import { useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useCatalogCategories, useCatalogProducts } from "@/hooks/useCatalogQueries";
import { useAdminCatalog } from "@/hooks/useAdminCatalog";

export default function AdminDashboard() {
  const { data: categories, isLoading: isLoadingCategories } = useCatalogCategories();
  const { data: products, isLoading: isLoadingProducts } = useCatalogProducts();
  const [feedback, setFeedback] = useState(null);

  const {
    deleteCategory,
    deleteCategoryStatus,
    deleteProduct,
    deleteProductStatus,
  } = useAdminCatalog();

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Deseja remover a categoria "${category.name}"?`)) {
      return;
    }
    setFeedback(null);
    try {
      await deleteCategory(category.uuid ?? category.id);
      setFeedback({ type: "success", message: "Categoria removida com sucesso" });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Deseja remover o produto "${product.name}"?`)) {
      return;
    }
    setFeedback(null);
    try {
      await deleteProduct(product.uuid ?? product.id);
      setFeedback({ type: "success", message: "Produto removido com sucesso" });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div>
          <h1>Catálogo</h1>
          <p>Gerencie categorias, produtos e mídias do portfólio.</p>
        </div>
        <div className="admin-dashboard__actions">
          <Link className="btn" to="/admin/catalogo/categorias/nova">
            Nova categoria
          </Link>
          <Link className="btn btn-outline" to="/admin/catalogo/produtos/novo">
            Novo produto
          </Link>
        </div>
      </header>

      {feedback ? (
        <div className={`admin-feedback admin-feedback--${feedback.type}`}>
          {feedback.message}
        </div>
      ) : null}

      <section className="admin-dashboard__section">
        <header>
          <h2>Categorias</h2>
          <span>
            {isLoadingCategories
              ? "Carregando..."
              : `${categories?.length ?? 0} categorias cadastradas`}
          </span>
        </header>
        {isLoadingCategories ? (
          <p>Carregando categorias...</p>
        ) : categories?.length ? (
          <ul className="admin-list">
            {categories.map((category) => (
              <li key={category.id} className="admin-list__item">
                <div>
                  <strong>{category.name}</strong>
                  <p className="admin-list__meta">Slug: {category.slug}</p>
                </div>
                <div className="admin-list__actions">
                  <Link to={`/admin/catalogo/categorias/${category.id}`} className="btn btn-ghost">
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleDeleteCategory(category)}
                    disabled={deleteCategoryStatus.isPending}
                  >
                    {deleteCategoryStatus.isPending ? "Removendo..." : "Remover"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma categoria cadastrada até o momento.</p>
        )}
      </section>

      <section className="admin-dashboard__section">
        <header>
          <h2>Produtos</h2>
          <span>
            {isLoadingProducts
              ? "Carregando..."
              : `${products?.length ?? 0} produtos cadastrados`}
          </span>
        </header>
        {isLoadingProducts ? (
          <p>Carregando produtos...</p>
        ) : products?.length ? (
          <div className="admin-product-grid">
            {products.map((product) => (
              <div key={product.id} className="admin-product-grid__item">
                <ProductCard product={product} />
                <div className="admin-product-grid__actions">
                  <Link to={`/admin/catalogo/produtos/${product.id}`} className="btn btn-ghost">
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleDeleteProduct(product)}
                    disabled={deleteProductStatus.isPending}
                  >
                    {deleteProductStatus.isPending ? "Removendo..." : "Remover"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhum produto cadastrado até o momento.</p>
        )}
      </section>
    </div>
  );
}

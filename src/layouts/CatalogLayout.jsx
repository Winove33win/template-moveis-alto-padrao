import { useMemo } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { useCatalogCategories, useCatalogProducts } from "@/hooks/useCatalogQueries";
import "./CatalogLayout.css";

export function CatalogLayout() {
  const params = useParams();
  const categoriesQuery = useCatalogCategories();
  const productsQuery = useCatalogProducts();

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];

  const activeCategorySlug = useMemo(() => {
    if (params.categoryId) {
      return params.categoryId;
    }
    if (params.productId) {
      const product = products.find(
        (item) => item.id === params.productId || item.slug === params.productId
      );
      return product?.categoryId;
    }
    return undefined;
  }, [params.categoryId, params.productId, products]);

  return (
    <div className="catalog-layout">
      <div className="catalog-layout__background" aria-hidden="true" />
      <div className="catalog-layout__subnav">
        <div className="container">
          <nav aria-label="Catálogo de produtos" className="catalog-layout__tabs">
            <NavLink to="/produtos" end className={({ isActive }) => (isActive ? "is-active" : "")}>
              Visão geral
            </NavLink>
            {categories.map((category) => (
              <NavLink
                key={category.uuid ?? category.slug ?? category.id}
                to={`/produtos/${category.slug}`}
                className={({ isActive }) =>
                  isActive || activeCategorySlug === category.slug ? "is-active" : ""
                }
              >
                {category.name}
              </NavLink>
            ))}
            {!categories.length && categoriesQuery.isLoading ? (
              <span className="catalog-layout__loading" role="status">
                Carregando categorias...
              </span>
            ) : null}
          </nav>
        </div>
      </div>
      <Outlet
        context={{
          categories,
          categoriesQuery,
          products,
          productsQuery,
        }}
      />
    </div>
  );
}

export default CatalogLayout;

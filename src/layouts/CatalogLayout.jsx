import { useMemo } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { getProductById, productCategories } from "@/data/products";
import "./CatalogLayout.css";

export function CatalogLayout() {
  const params = useParams();

  const activeCategoryId = useMemo(() => {
    if (params.categoryId) {
      return params.categoryId;
    }
    if (params.productId) {
      return getProductById(params.productId)?.categoryId;
    }
    return undefined;
  }, [params.categoryId, params.productId]);

  return (
    <div className="catalog-layout">
      <div className="catalog-layout__background" aria-hidden="true" />
      <div className="catalog-layout__subnav">
        <div className="container">
          <nav aria-label="Catálogo de produtos" className="catalog-layout__tabs">
            <NavLink to="/produtos" end className={({ isActive }) => (isActive ? "is-active" : "")}>
              Visão geral
            </NavLink>
            {productCategories.map((category) => (
              <NavLink
                key={category.id}
                to={`/produtos/${category.slug}`}
                className={({ isActive }) =>
                  isActive || activeCategoryId === category.id ? "is-active" : ""
                }
              >
                {category.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <Outlet context={{ categories: productCategories }} />
    </div>
  );
}

export default CatalogLayout;

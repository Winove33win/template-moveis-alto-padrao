import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import "./Products.css";

export default function ProductsPage() {
  const { categories = [], categoriesQuery, products = [], productsQuery } =
    useOutletContext() ?? {};
  const [activeCategory, setActiveCategory] = useState("all");

  const isLoading = categoriesQuery?.isLoading || productsQuery?.isLoading;
  const isError = categoriesQuery?.isError || productsQuery?.isError;
  const error = categoriesQuery?.error ?? productsQuery?.error;

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      if (category?.slug) {
        map.set(category.slug, category);
      }
    });
    return map;
  }, [categories]);

  const visibleProducts = useMemo(() => {
    if (activeCategory === "all") {
      return products;
    }
    return products.filter((product) => product.categoryId === activeCategory);
  }, [activeCategory, products]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const schema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Catálogo Nobile Design",
      description:
        "Seleção curada de móveis, iluminação e peças de apoio assinadas pela Nobile Design.",
      hasPart: visibleProducts.map((product, index) => ({
        "@type": "Product",
        position: index + 1,
        name: product.name,
        url: origin ? `${origin}/produto/${product.slug ?? product.id}` : undefined,
        category: categoryMap.get(product.categoryId)?.name,
        description: product.summary,
      })),
    }),
    [visibleProducts, categoryMap, origin]
  );

  return (
    <div className="catalog-page">
      <Seo
        title="Catálogo Nobile Design — móveis e iluminação sob medida"
        description="Conheça a coleção completa de móveis, sofás, cadeiras, mesas, banquinhos e iluminação assinados pela Nobile Design."
        canonical={origin ? `${origin}/produtos` : undefined}
        schema={schema}
      />
      <div className="container catalog-page__container">
        <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Produtos" }]} />
        <header className="catalog-page__hero">
          <span className="eyebrow">Catálogo 2024</span>
          <h1>Produtos autorais para ambientes residenciais e corporativos.</h1>
          <p>
            Explore uma curadoria de móveis de alto padrão, iluminação e peças de apoio desenhadas para projetos exclusivos.
            Utilize os filtros por categoria para encontrar a solução ideal para o seu ambiente.
          </p>
        </header>

        <div className="catalog-page__filters" role="tablist" aria-label="Filtrar produtos por categoria">
          <button
            type="button"
            role="tab"
            className={activeCategory === "all" ? "is-active" : ""}
            aria-selected={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.uuid ?? category.slug}
              type="button"
              role="tab"
              className={activeCategory === category.slug ? "is-active" : ""}
              aria-selected={activeCategory === category.slug}
              onClick={() => setActiveCategory(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="catalog-page__status" role="status">
            Carregando catálogo...
          </p>
        ) : null}

        {isError ? (
          <p className="catalog-page__status" role="alert">
            Não foi possível carregar os produtos. {error?.message ?? "Tente novamente mais tarde."}
          </p>
        ) : null}

        {!isLoading && !isError ? (
          <section className="catalog-grid" aria-live="polite">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.uuid ?? product.id}
                product={product}
                category={categoryMap.get(product.categoryId)}
              />
            ))}
          </section>
        ) : null}

        <section className="catalog-page__cta">
          <div>
            <h2>Precisa de ajuda para compor o ambiente completo?</h2>
            <p>
              Nossos designers montam o projeto com peças coordenadas, paleta de acabamentos e planejamento de iluminação para
              cada ambiente.
            </p>
          </div>
          <a
            className="btn btn-primary"
            href="https://wa.me/5511999999999?text=Olá! Gostaria de receber uma curadoria completa de produtos Nobile."
            target="_blank"
            rel="noreferrer"
          >
            Falar com a consultoria
          </a>
        </section>
      </div>
    </div>
  );
}

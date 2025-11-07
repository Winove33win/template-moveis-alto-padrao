import { useMemo } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import "./Products.css";

export default function ProductsCategoryPage() {
  const { categories = [], categoriesQuery, products = [], productsQuery } =
    useOutletContext() ?? {};
  const { categoryId } = useParams();

  const isLoading = categoriesQuery?.isLoading || productsQuery?.isLoading;
  const isError = categoriesQuery?.isError || productsQuery?.isError;
  const error = categoriesQuery?.error ?? productsQuery?.error;

  const category = useMemo(
    () =>
      categories.find(
        (item) => item.slug === categoryId || item.id === categoryId
      ),
    [categories, categoryId]
  );

  const categoryProducts = useMemo(() => {
    if (!category) {
      return [];
    }
    return products.filter((product) => product.categoryId === category.slug);
  }, [category, products]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const schema = useMemo(() => {
    if (!category) {
      return undefined;
    }
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${category.name} — Catálogo Nobile Design`,
      description: category.description,
      about: {
        "@type": "ProductCollection",
        name: category.name,
      },
      hasPart: categoryProducts.map((product, index) => ({
        "@type": "Product",
        position: index + 1,
        name: product.name,
        url: origin ? `${origin}/produto/${product.slug ?? product.id}` : undefined,
        category: category.name,
        description: product.summary,
      })),
    };
  }, [category, categoryProducts, origin]);

  if (isLoading) {
    return (
      <div className="catalog-page">
        <div className="container catalog-page__container">
          <p className="catalog-page__status" role="status">
            Carregando categoria...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="catalog-page">
        <div className="container catalog-page__container">
          <p className="catalog-page__status" role="alert">
            Não foi possível carregar a categoria. {error?.message ?? "Tente novamente."}
          </p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="catalog-page">
        <div className="container catalog-page__container">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Produtos", to: "/produtos" }, { label: "Categoria" }]} />
          <div className="catalog-page__empty">
            <h1>Categoria não encontrada</h1>
            <p>Não encontramos produtos para a categoria selecionada. Explore o catálogo completo.</p>
            <Link className="btn btn-primary" to="/produtos">
              Voltar para o catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <Seo
        title={`${category.seo?.title ?? category.name} — Nobile Design`}
        description={category.seo?.description ?? category.description}
        canonical={origin ? `${origin}/produtos/${category.slug}` : undefined}
        schema={schema}
      />
      <div className="container catalog-page__container">
        <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Produtos", to: "/produtos" }, { label: category.name }]} />
        <section className="catalog-category">
          <div className="catalog-category__content">
            <span className="eyebrow">{category.name}</span>
            <h1>{category.headline}</h1>
            <p>{category.description}</p>
            {category.highlights?.length ? (
              <ul className="catalog-category__highlights">
                {category.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
          {category.heroImage ? (
            <div className="catalog-category__media" aria-hidden="true">
              <img src={category.heroImage} alt={category.heroAlt ?? category.name} loading="lazy" />
            </div>
          ) : null}
        </section>

        <section className="catalog-grid" aria-live="polite">
          {categoryProducts.map((product) => (
            <ProductCard key={product.uuid ?? product.id} product={product} category={category} />
          ))}
        </section>

        <section className="catalog-page__cta catalog-page__cta--surface">
          <div>
            <h2>Solicite a cartela de materiais desta categoria</h2>
            <p>
              Enviamos amostras de tecidos, lâminas de madeira, pedras e metais que combinam com os produtos escolhidos para
              facilitar a especificação.
            </p>
          </div>
          <a
            className="btn btn-outline"
            href={`https://wa.me/5511999999999?text=${encodeURIComponent(
              `Gostaria de receber a cartela da categoria ${category.name}.`
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Solicitar cartela
          </a>
        </section>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import Seo from "@/components/Seo";
import { getCategoryById, getProductById, products } from "@/data/products";
import { useQuoteModal } from "@/context/QuoteModalContext";
import "./Products.css";

const SPEC_LABELS = {
  designer: "Designer",
  dimensions: "Dimensões",
  materials: "Materiais",
  finishOptions: "Acabamentos",
  lightSource: "Fonte de luz",
  leadTime: "Prazo de produção",
  warranty: "Garantia",
  customization: "Personalização",
};

function renderSpecValue(value) {
  if (!value) {
    return "-";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value;
}

export default function ProductDetailPage() {
  const { categories } = useOutletContext();
  const params = useParams();
  const { open } = useQuoteModal();

  const product = useMemo(() => getProductById(params.productId), [params.productId]);

  const category = useMemo(() => {
    if (!product) {
      return undefined;
    }
    return getCategoryById(product.categoryId) ?? categories?.find((item) => item.id === product.categoryId);
  }, [product, categories]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const schema = useMemo(() => {
    if (!product) {
      return undefined;
    }
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.summary ?? product.description,
      image: product.media?.map((item) => (origin ? `${origin}${item.src}` : item.src)),
      category: category?.name,
      brand: {
        "@type": "Brand",
        name: "Nobile Design",
      },
      productionDate: "2024",
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/PreOrder",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "BRL",
          description: "Valores sob consulta conforme projeto",
        },
      },
    };
  }, [product, category, origin]);

  if (!product) {
    return (
      <div className="catalog-page">
        <div className="container catalog-page__container">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Produtos", to: "/produtos" }, { label: "Produto" }]} />
          <div className="catalog-page__empty">
            <h1>Produto não encontrado</h1>
            <p>Talvez o item tenha sido descontinuado ou o link esteja incorreto. Volte para o catálogo e descubra novas peças.</p>
            <Link className="btn btn-primary" to="/produtos">
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <Seo
        title={`${product.name} — ${category?.name ?? "Produto"} | Nobile Design`}
        description={product.summary ?? product.description}
        canonical={origin ? `${origin}/produto/${product.id}` : undefined}
        schema={schema}
      />
      <div className="container catalog-page__container">
        <Breadcrumbs
          items={[
            { label: "Início", to: "/" },
            { label: "Produtos", to: "/produtos" },
            category ? { label: category.name, to: `/produtos/${category.slug}` } : undefined,
            { label: product.name },
          ].filter(Boolean)}
        />

        <article className="catalog-detail">
          <div className="catalog-detail__gallery">
            {product.media?.map((item) => (
              <figure key={item.src}>
                <img src={item.src} alt={item.alt} loading="lazy" />
              </figure>
            ))}
          </div>
          <div className="catalog-detail__content">
            <span className="eyebrow">{category?.name ?? "Produto"}</span>
            <h1>{product.name}</h1>
            {product.description ? <p>{product.description}</p> : null}

            <div className="catalog-detail__actions">
              <button type="button" className="btn btn-primary" onClick={open}>
                Solicitar proposta personalizada
              </button>
              <a
                className="btn btn-outline"
                href={`https://wa.me/5511999999999?text=${encodeURIComponent(
                  `Olá! Gostaria de informações sobre o produto ${product.name}.`
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Conversar no WhatsApp
              </a>
            </div>

            <section>
              <h2>Ficha técnica</h2>
              <dl className="catalog-detail__specs">
                {Object.entries(product.specs ?? {}).map(([key, value]) => (
                  <div key={key}>
                    <dt>{SPEC_LABELS[key] ?? key}</dt>
                    <dd>{renderSpecValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </article>

        <section className="catalog-related">
          <header>
            <h2>Combine com</h2>
            <p>Peças que dialogam com o design do {product.name} para compor ambientes completos.</p>
          </header>
          <div className="catalog-related__list">
            {products
              .filter((item) => item.id !== product.id && item.categoryId === product.categoryId)
              .slice(0, 3)
              .map((related) => (
                <Link key={related.id} to={`/produto/${related.id}`} className="catalog-related__item">
                  <img src={related.media?.[0]?.src} alt={related.media?.[0]?.alt ?? related.name} loading="lazy" />
                  <span>{related.name}</span>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}

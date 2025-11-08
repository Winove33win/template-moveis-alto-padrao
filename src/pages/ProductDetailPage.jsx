import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import Seo from "@/components/Seo";
import { useQuoteModal } from "@/context/QuoteModalContext";
import ImageModal from "@/components/ImageModal";
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
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "-";
  }

  if (typeof value === "string") {
    return value.trim() || "-";
  }

  if (!value) {
    return "-";
  }

  return value;
}

export default function ProductDetailPage() {
  const { categories = [], categoriesQuery, products = [], productsQuery } =
    useOutletContext() ?? {};
  const params = useParams();
  const { open } = useQuoteModal();
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const lastFocusedTriggerRef = useRef(null);

  const isLoading = categoriesQuery?.isLoading || productsQuery?.isLoading;
  const isError = categoriesQuery?.isError || productsQuery?.isError;
  const error = categoriesQuery?.error ?? productsQuery?.error;

  const product = useMemo(
    () =>
      products.find(
        (item) => item.id === params.productId || item.slug === params.productId
      ),
    [products, params.productId]
  );

  const category = useMemo(() => {
    if (!product) {
      return undefined;
    }
    return (
      categories.find(
        (item) =>
          item.slug === product.categoryId ||
          item.id === product.categoryId ||
          item.uuid === product.categoryUuid
      ) ?? null
    );
  }, [product, categories]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }
    return products
      .filter(
        (item) =>
          item.slug !== product.slug &&
          item.id !== product.id &&
          item.categoryId === product.categoryId
      )
      .slice(0, 3);
  }, [products, product]);

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
      image: product.media?.map((item) =>
        origin ? `${origin}${item.src}` : item.src
      ),
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

  const normalizedMedia = useMemo(() => {
    if (!product?.media) {
      return [];
    }

    return product.media.map((item) => ({
      ...item,
      alt: item.alt ?? product.name,
    }));
  }, [product]);

  const handleOpenImageModal = useCallback(
    (index, target) => {
      if (!normalizedMedia.length) {
        return;
      }

      lastFocusedTriggerRef.current = target;
      setActiveMediaIndex(index);
      setImageModalOpen(true);
    },
    [normalizedMedia.length]
  );

  const handleCloseImageModal = useCallback(() => {
    setImageModalOpen(false);

    const focusTarget = lastFocusedTriggerRef.current;

    if (!focusTarget) {
      return;
    }

    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => {
        focusTarget.focus();
      });
    } else {
      setTimeout(() => {
        focusTarget.focus();
      }, 0);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="catalog-page">
        <div className="container catalog-page__container">
          <p className="catalog-page__status" role="status">
            Carregando produto...
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
            Não foi possível carregar os detalhes do produto. {error?.message ?? "Tente novamente."}
          </p>
        </div>
      </div>
    );
  }

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
        canonical={origin ? `${origin}/produto/${product.slug ?? product.id}` : undefined}
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
            {normalizedMedia.map((item, index) => (
              <figure
                key={item.src}
                role="button"
                tabIndex={0}
                aria-label={`Ampliar imagem ${index + 1} de ${normalizedMedia.length}`}
                aria-haspopup="dialog"
                onClick={(event) => handleOpenImageModal(index, event.currentTarget)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenImageModal(index, event.currentTarget);
                  }
                }}
              >
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
                {Object.entries(SPEC_LABELS).map(([key, label]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>{renderSpecValue(product.specs?.[key])}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </article>

        <ImageModal
          isOpen={isImageModalOpen}
          media={normalizedMedia}
          initialIndex={activeMediaIndex}
          onClose={handleCloseImageModal}
        />

        <section className="catalog-related">
          <header>
            <h2>Combine com</h2>
            <p>Peças que dialogam com o design do {product.name} para compor ambientes completos.</p>
          </header>
          <div className="catalog-related__list">
            {relatedProducts.map((related) => (
              <Link key={related.uuid ?? related.id} to={`/produto/${related.slug ?? related.id}`} className="catalog-related__item">
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

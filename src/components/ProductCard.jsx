import { Link } from "react-router-dom";
import { useQuoteModal } from "@/context/QuoteModalContext";
import "./ProductCard.css";

export default function ProductCard({ product, category }) {
  const { open } = useQuoteModal();

  if (!product) {
    return null;
  }

  const primaryImage = product.media?.[0];

  return (
    <article className="catalog-card">
      {primaryImage ? (
        <div className="catalog-card__media">
          <img src={primaryImage.src} alt={primaryImage.alt} loading="lazy" />
        </div>
      ) : null}
      <div className="catalog-card__content">
        {category?.name ? <span className="catalog-card__badge">{category.name}</span> : null}
        <h3>{product.name}</h3>
        {product.summary ? <p>{product.summary}</p> : null}
        <div className="catalog-card__actions">
          <Link className="btn btn-outline" to={`/produto/${product.id}`}>
            Ver detalhes
          </Link>
          <button type="button" className="btn btn-ghost" onClick={open}>
            Solicitar proposta
          </button>
        </div>
      </div>
    </article>
  );
}

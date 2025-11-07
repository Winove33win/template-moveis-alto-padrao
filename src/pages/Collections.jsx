import { useState, useMemo } from "react";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { Filter, SlidersHorizontal } from "lucide-react";
import "./Collections.css";

const categories = [
  {
    id: "sofas",
    name: "Sofás Esculturais",
    environment: "Living",
    description: "Modelos modulares, chaises e sofás lineares com acabamentos em bouclé, linho e couro natural.",
    image: "/assets/Sofas/Sofas%20(4).png",
    materials: ["Bouclé europeu", "Couro natural", "Linho premium"],
    finishes: ["Off-white", "Caramelo", "Grafite"],
    leadTime: "30 a 45 dias",
    priceRange: "R$ 9k – 22k",
  },
  {
    id: "mesas-jantar",
    name: "Mesas de Jantar",
    environment: "Jantar",
    description: "Tampo em lâmina natural, pedra ou vidro acidato com bases esculturais em metal ou madeira maciça.",
    image: "/assets/Mesa%20de%20jantar/Mesa%20de%20jantar%20(4).png",
    materials: ["Lâmina de nogueira", "Granito italiano", "Aço carbono"],
    finishes: ["Fosco", "Semi brilho", "Pedras naturais"],
    leadTime: "35 a 50 dias",
    priceRange: "R$ 12k – 28k",
  },
  {
    id: "cadeiras",
    name: "Cadeiras e Banquetas",
    environment: "Jantar",
    description: "Estofadas com espumas de alta densidade, estrutura em madeira torneada e detalhes em metais nobres.",
    image: "/assets/cadeiras/cadeiras%20(4).png",
    materials: ["Madeira maciça", "Tecido aquaclean", "Detalhes em latão"],
    finishes: ["Carvalho", "Ébano", "Latão escovado"],
    leadTime: "25 a 35 dias",
    priceRange: "R$ 2,5k – 7k",
  },
  {
    id: "poltronas",
    name: "Poltronas e Chaise",
    environment: "Quartos",
    description: "Curvas acolhedoras, costura artesanal e opção de base giratória para ambientes de descanso e leitura.",
    image: "/assets/poltronas/poltronas%20(2).png",
    materials: ["Linho italiano", "Veludo de seda", "Base em madeira maciça"],
    finishes: ["Azul petróleo", "Verde sálvia", "Areia"],
    leadTime: "20 a 30 dias",
    priceRange: "R$ 4,5k – 11k",
  },
  {
    id: "apoiadores",
    name: "Mesas Laterais & Aparadores",
    environment: "Living",
    description: "Peças funcionais com tampo em pedra, madeira ou vidro fumê, ideais para composições com sofás e poltronas.",
    image: "/assets/Mesas%20laterais/Mesas%20laterais%20(5).png",
    materials: ["Mármore travertino", "Vidro fumê", "Alumínio anodizado"],
    finishes: ["Natural", "Bronze", "Noir"],
    leadTime: "25 a 40 dias",
    priceRange: "R$ 3k – 9k",
  },
  {
    id: "iluminacao",
    name: "Iluminação & Abajures",
    environment: "Corporate",
    description: "Abajures, colunas e pendentes com design autoral, cúpulas em tecidos nobres e metal escovado.",
    image: "/assets/Abajures/Abajures%20(6).png",
    materials: ["Latão", "Couro", "Vidro soprado"],
    finishes: ["Dourado escovado", "Preto ônix", "Branco seda"],
    leadTime: "20 a 30 dias",
    priceRange: "R$ 1,8k – 6k",
  },
];

const filters = ["Todos", "Living", "Jantar", "Quartos", "Corporate"];

export default function Collections() {
  const [filter, setFilter] = useState("Todos");
  const { open } = useQuoteModal();

  const visibleCategories = useMemo(() => {
    if (filter === "Todos") return categories;
    return categories.filter((category) => category.environment === filter);
  }, [filter]);

  return (
    <div className="collections">
      <section className="collections-hero">
        <div>
          <span className="eyebrow">Coleções Nobile</span>
          <h1>Cenários completos com curadoria de móveis, iluminação e peças de apoio.</h1>
          <p>
            Estruture ambientes residenciais e corporativos com uma seleção de móveis de alto padrão. Combine texturas, proporções
            e acabamentos que valorizam a arquitetura sem perder o conforto.
          </p>
          <div className="collections-filters">
            <div className="collections-filter-label">
              <SlidersHorizontal size={16} />
              Filtrar por ambiente
            </div>
            <div className="collections-filter-buttons" role="tablist" aria-label="Filtrar coleções por ambiente">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`collections-filter ${filter === item ? "is-active" : ""}`}
                  onClick={() => setFilter(item)}
                  role="tab"
                  aria-selected={filter === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="collections-hero__visual" aria-hidden>
          <img src="/assets/Sofas/Sofas%20(5).png" alt="Coleção de mobiliário" loading="lazy" />
        </div>
      </section>

      <section className="collections-section">
        <header className="section__header">
          <span className="eyebrow">Catálogo</span>
          <h2>Escolha uma coleção para iniciar o seu projeto</h2>
        </header>
        <div className="collections-grid">
          {visibleCategories.map((category) => (
            <article key={category.id} className="collections-card">
              <div className="collections-card__media">
                <img src={category.image} alt={category.name} loading="lazy" />
                <span className="collections-card__badge">{category.environment}</span>
              </div>
              <div className="collections-card__content">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <div className="collections-card__details">
                  <div>
                    <strong>Materiais</strong>
                    <ul>
                      {category.materials.map((material) => (
                        <li key={material}>{material}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Acabamentos</strong>
                    <ul>
                      {category.finishes.map((finish) => (
                        <li key={finish}>{finish}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="collections-card__meta">
                  <span>Prazo médio: {category.leadTime}</span>
                  <span>Investimento: {category.priceRange}</span>
                </div>
                <div className="collections-card__actions">
                  <a className="btn btn-ghost" href={`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá! Tenho interesse na coleção ${category.name}.`)}`} target="_blank" rel="noreferrer">
                    Conversar sobre a coleção
                  </a>
                  <button type="button" className="btn btn-outline--light" onClick={open}>
                    Solicitar projeto
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="collections-section collections-section--surface">
        <header className="section__header">
          <span className="eyebrow">Personalização</span>
          <h2>Combine tecidos, metais e pedras com nosso acervo exclusivo</h2>
          <p>
            Nosso laboratório de materiais conta com mais de 150 opções de tecidos, 30 lâminas naturais de madeira, pedras
            brasileiras e importadas, além de acabamentos em metais nobres. Criamos cartelas sob medida para cada projeto.
          </p>
        </header>
        <div className="collections-materials">
          {["Tecidos & Couros", "Lâminas naturais", "Pedras & superfícies", "Metais especiais"].map((item) => (
            <article key={item} className="collections-material">
              <Filter size={18} />
              <div>
                <h3>{item}</h3>
                <p>
                  Consultoria para selecionar texturas, cores e acabamentos que dialogam com a arquitetura do projeto e garantem
                  longevidade às peças.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

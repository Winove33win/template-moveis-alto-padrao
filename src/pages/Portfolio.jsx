import { useMemo } from "react";
import { LayoutGrid } from "lucide-react";
import { useCatalogCategories } from "@/hooks/useCatalogQueries";
import { useQuoteModal } from "@/context/QuoteModalContext";
import "./Portfolio.css";

const ENVIRONMENT_BLUEPRINTS = [
  {
    id: "living-room",
    eyebrow: "Receber & Convivência",
    title: "Sala de Estar Integrada",
    description:
      "Conectamos sofás modulares, mesas de centro escultóricas e poltronas envolventes para criar uma área social fluida, com circulações amplas e pontos de luz acolhedores.",
    hero: {
      src: "/assets/Sofas/Sofas%20(6).png",
      alt: "Sala de estar integrada com sofá modular e mesa de centro orgânica",
    },
    categories: ["sofas", "poltronas", "mesas", "mesas-laterais"],
    inspirations: [
      {
        id: "living-highlight-1",
        title: "Ilha de convivência",
        description: "Sofás com módulos generosos e acabamento em bouclé europeu para encontros prolongados.",
        image: "/assets/Sofas/Sofas%20(5).png",
        alt: "Sofá modular claro com almofadas sobre tapete neutro",
      },
      {
        id: "living-highlight-2",
        title: "Cantos de leitura",
        description: "Poltronas esculturais com base giratória que criam lounges intimistas.",
        image: "/assets/poltronas/Poltronas%20(5).png",
        alt: "Poltrona giratória revestida em veludo",
      },
      {
        id: "living-highlight-3",
        title: "Apoios funcionais",
        description: "Mesas laterais em pedra natural para acomodar luminárias, obras de arte e objetos afetivos.",
        image: "/assets/Mesas%20laterais/Mesas%20laterais%20(3).png",
        alt: "Mesa lateral em pedra ao lado de sofá",
      },
    ],
    ctaLabel: "Projetar minha sala de estar",
  },
  {
    id: "gourmet-kitchen",
    eyebrow: "Gastronomia & Bares",
    title: "Cozinha Gourmet Viva",
    description:
      "Planejamos bancadas com banquetas sob medida, mesas de jantar versáteis e cadeiras ergonômicas para receber com conforto e protagonismo visual.",
    hero: {
      src: "/assets/Banquetas/Banquetas%20(5).png",
      alt: "Cozinha gourmet com banquetas altas em couro",
    },
    categories: ["banquetas", "mesa-de-jantar", "cadeiras"],
    inspirations: [
      {
        id: "kitchen-highlight-1",
        title: "Bancada protagonista",
        description: "Banquetas com altura personalizada e apoio para os pés em metal escovado.",
        image: "/assets/Banquetas/Banquetas%20(2).png",
        alt: "Banquetas estofadas dispostas em bancada",
      },
      {
        id: "kitchen-highlight-2",
        title: "Mesa para encontros",
        description: "Mesas de jantar com tampo em pedra natural que equilibram sofisticação e praticidade.",
        image: "/assets/Mesa%20de%20jantar/Mesa%20de%20jantar%20(5).png",
        alt: "Mesa de jantar redonda com cadeiras estofadas",
      },
      {
        id: "kitchen-highlight-3",
        title: "Conforto contínuo",
        description: "Cadeiras acolhedoras que convidam a permanecer à mesa por longas horas.",
        image: "/assets/cadeiras/cadeira%20(3).png",
        alt: "Cadeira de jantar com encosto curvo em tecido claro",
      },
    ],
    ctaLabel: "Montar minha cozinha gourmet",
  },
  {
    id: "master-suite",
    eyebrow: "Retiro Privativo",
    title: "Suíte Master Esculpida",
    description:
      "Criamos refúgios com chaises envolventes, mesas laterais leves e iluminação difusa para momentos de pausa e autocuidado.",
    hero: {
      src: "/assets/poltronas/Poltronas%20(6).png",
      alt: "Suíte master com chaise estofada e iluminação suave",
    },
    categories: ["poltronas", "mesas-laterais", "abajures"],
    inspirations: [
      {
        id: "suite-highlight-1",
        title: "Chaise de relax",
        description: "Chaises com costura canaletada que abraçam o corpo e valorizam a suíte.",
        image: "/assets/poltronas/Poltronas%20(2).png",
        alt: "Chaise clara em ambiente íntimo",
      },
      {
        id: "suite-highlight-2",
        title: "Apoios sutis",
        description: "Mesas laterais com tampos em mármore para acomodar livros e fragrâncias.",
        image: "/assets/Mesas%20laterais/Mesas%20laterais%20(4).png",
        alt: "Mesa lateral em mármore ao lado de poltrona",
      },
      {
        id: "suite-highlight-3",
        title: "Luz envolvente",
        description: "Abajures com cúpulas em tecidos nobres que criam atmosferas acolhedoras.",
        image: "/assets/Abajures/Abajures%20(5).png",
        alt: "Abajur em mármore sobre aparador de madeira",
      },
    ],
    ctaLabel: "Personalizar minha suíte",
  },
  {
    id: "home-office",
    eyebrow: "Work & Lifestyle",
    title: "Home Office Imersivo",
    description:
      "Desenhamos escritórios em casa com mesas amplas, cadeiras ergonômicas e iluminação pontual para jornadas produtivas com estética refinada.",
    hero: {
      src: "/assets/mesas/Mesa%20(6).png",
      alt: "Home office com mesa ampla e cadeira estofada",
    },
    categories: ["mesas", "cadeiras", "abajures"],
    inspirations: [
      {
        id: "office-highlight-1",
        title: "Superfícies amplas",
        description: "Mesas com tampos orgânicos que acomodam tecnologia e peças decorativas.",
        image: "/assets/mesas/Mesa%20(5).png",
        alt: "Mesa orgânica com acabamento em madeira",
      },
      {
        id: "office-highlight-2",
        title: "Postura impecável",
        description: "Cadeiras giratórias com apoio lombar para equilíbrio entre ergonomia e design.",
        image: "/assets/cadeiras/cadeira%20(2).png",
        alt: "Cadeira giratória clara em frente à mesa",
      },
      {
        id: "office-highlight-3",
        title: "Foco com atmosfera",
        description: "Iluminação de tarefa com abajures em metal e vidro soprado.",
        image: "/assets/Abajures/Abajures%20(3).png",
        alt: "Abajur com base em latão sobre escrivaninha",
      },
    ],
    ctaLabel: "Organizar meu home office",
  },
];

const CURATED_CATEGORY_COUNT = new Set(
  ENVIRONMENT_BLUEPRINTS.flatMap((environment) => environment.categories)
).size;

const gallery = [
  {
    id: "gallery-sofa-detail",
    image: "/assets/Sofas/Sofas%20(3).png",
    alt: "Detalhe de sofá com costura aparente",
    caption: "Sofás com costura alfaiataria e pés metálicos leves.",
  },
  {
    id: "gallery-banquetas",
    image: "/assets/Banquetas/Banquetas%20(3).png",
    alt: "Banquetas altas em madeira e couro",
    caption: "Banquetas com apoio para pés em metal escovado.",
  },
  {
    id: "gallery-mesas-laterais",
    image: "/assets/Mesas%20laterais/Mesas%20laterais%20(2).png",
    alt: "Mesas laterais sobre tapete claro",
    caption: "Mesas laterais orgânicas em pedra e madeira.",
  },
  {
    id: "gallery-abajur",
    image: "/assets/Abajures/Abajures%20(6).png",
    alt: "Abajur com cúpula cilíndrica em linho",
    caption: "Iluminação difusa para atmosferas acolhedoras.",
  },
  {
    id: "gallery-cadeiras",
    image: "/assets/cadeiras/cadeira%20(4).png",
    alt: "Cadeiras estofadas ao redor de mesa",
    caption: "Cadeiras com encosto envolvente e base torneada.",
  },
  {
    id: "gallery-mesa-centro",
    image: "/assets/mesas/Mesa%20(3).png",
    alt: "Mesa de centro orgânica em frente ao sofá",
    caption: "Mesas de centro com mix de materiais contrastantes.",
  },
];

export default function Portfolio() {
  const { open } = useQuoteModal();
  const categoriesQuery = useCatalogCategories();
  const categories = categoriesQuery.data ?? [];

  const categoriesBySlug = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      map.set(category.slug, category);
    });
    return map;
  }, [categories]);

  const environments = useMemo(
    () =>
      ENVIRONMENT_BLUEPRINTS.map((environment) => ({
        ...environment,
        categories: environment.categories.map((slug) => {
          const category = categoriesBySlug.get(slug);
          return {
            slug,
            label:
              category?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
            headline: category?.headline,
          };
        }),
      })),
    [categoriesBySlug]
  );

  return (
    <div className="portfolio">
      <section className="portfolio-hero">
        <div>
          <span className="eyebrow">Portfólio por ambiente</span>
          <h1>Ambientes completos para viver com sofisticação e conforto</h1>
          <p>
            Do living à suíte, combinamos mobiliário autoral, iluminação cênica e acessórios para entregar projetos integrados e
            personalizados em cada etapa da casa.
          </p>
          <div className="portfolio-hero__actions">
            <button type="button" className="btn btn-primary" onClick={open}>
              Solicitar curadoria personalizada
            </button>
            <a className="btn btn-outline--dark" href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">
              Falar com especialista
            </a>
          </div>
          <ul className="portfolio-hero__stats">
            <li>
              <strong>{environments.length} ambientes</strong>
              <span>curadorias completas para cada momento da casa</span>
            </li>
            <li>
              <strong>{CURATED_CATEGORY_COUNT} categorias</strong>
              <span>mobiliário, iluminação e acessórios integrados</span>
            </li>
          </ul>
        </div>
        <div className="portfolio-hero__visual">
          <img
            src="/assets/Sofas/Sofas%20(2).png"
            alt="Sala de estar com sofá modular e mesa de centro"
            loading="lazy"
          />
        </div>
      </section>

      <section className="portfolio-section">
        <header className="section__header">
          <span className="eyebrow">Curadoria por ambiente</span>
          <h2>Como desenhamos experiências em cada espaço</h2>
          <p>
            Explore inspirações e as categorias-chave do nosso catálogo que utilizamos para compor cada ambiente do portfólio.
          </p>
        </header>
        <div className="portfolio-environments">
          {environments.map((environment) => (
            <article key={environment.id} className="environment-card">
              <div className="environment-card__media">
                <img src={environment.hero.src} alt={environment.hero.alt} loading="lazy" />
              </div>
              <div className="environment-card__content">
                <div className="environment-card__header">
                  <span className="eyebrow">{environment.eyebrow}</span>
                  <h3>{environment.title}</h3>
                </div>
                <p>{environment.description}</p>
                <div className="environment-card__categories" role="list">
                  {environment.categories.map((category) => (
                    <a
                      key={category.slug}
                      className="environment-card__chip"
                      href={`/produtos/${category.slug}`}
                      role="listitem"
                      title={category.headline ?? undefined}
                    >
                      <span>{category.label}</span>
                    </a>
                  ))}
                </div>
                <div className="environment-card__inspirations">
                  {environment.inspirations.map((inspiration) => (
                    <article key={inspiration.id} className="environment-card__inspiration">
                      <figure>
                        <img src={inspiration.image} alt={inspiration.alt} loading="lazy" />
                      </figure>
                      <div>
                        <h4>{inspiration.title}</h4>
                        <p>{inspiration.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="environment-card__actions">
                  <button type="button" className="btn btn-outline--light" onClick={open}>
                    {environment.ctaLabel}
                  </button>
                  <a
                    className="link"
                    href={`https://wa.me/5511999999999?text=${encodeURIComponent(
                      `Olá! Gostaria de criar um projeto para ${environment.title.toLowerCase()}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Conversar pelo WhatsApp
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio-section portfolio-section--surface">
        <header className="section__header">
          <span className="eyebrow">Galeria</span>
          <h2>Texturas, materiais e luz em harmonia</h2>
          <p>Confira alguns registros de detalhes que fazem parte das nossas composições exclusivas.</p>
        </header>
        <div className="portfolio-gallery">
          {gallery.map((item) => (
            <figure key={item.id}>
              <img src={item.image} alt={item.alt} loading="lazy" />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
        <div className="portfolio-gallery__cta">
          <LayoutGrid size={18} />
          <span>Agende uma visita guiada ao nosso showroom imersivo para conhecer as coleções completas.</span>
        </div>
      </section>

      <section className="portfolio-section portfolio-section--cta">
        <div className="portfolio-cta">
          <div className="portfolio-cta__content">
            <span className="eyebrow">Consultoria Nobile</span>
            <h2>Transforme cada ambiente com uma curadoria guiada</h2>
            <p>
              Nossa equipe acompanha todo o processo — do briefing à instalação — conectando peças de diferentes categorias para
              criar ambientes com identidade própria.
            </p>
            <div className="portfolio-cta__actions">
              <button type="button" className="btn btn-primary" onClick={open}>
                Solicitar consultoria por ambiente
              </button>
              <a className="btn btn-outline--dark" href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">
                Agendar conversa no WhatsApp
              </a>
            </div>
          </div>
          <div className="portfolio-cta__media">
            <img
              src="/assets/Abajures/Abajures%20(4).png"
              alt="Abajur em mármore iluminando mesa lateral"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

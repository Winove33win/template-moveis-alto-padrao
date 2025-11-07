import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";
import "./Home.css";

const WA_NUMBER = "5511999999999";
const WHATSAPP_MESSAGE = "Olá! Gostaria de conversar sobre móveis de alto padrão para o meu projeto.";
const waLink = (product) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    product ? `Olá! Tenho interesse em ${product} e gostaria de receber mais detalhes.` : WHATSAPP_MESSAGE
  )}`;

const heroHighlights = [
  { label: "Designers parceiros", value: "18" },
  { label: "Projetos entregues", value: "320+" },
  { label: "Materiais nobres", value: "Curadoria global" },
];

const collections = [
  {
    id: "living",
    title: "Living Contemporâneo",
    description: "Sofás modulares, mesas laterais e aparadores que valorizam linhas puras e acabamentos artesanais.",
    image: "/assets/Sofas/Sofas%20(3).png",
    tags: ["Sofás", "Mesas laterais"],
  },
  {
    id: "jantar",
    title: "Jantar Esculpido",
    description: "Mesas de jantar esculpidas e cadeiras estofadas com tecidos exclusivos e conforto de showroom.",
    image: "/assets/Mesa%20de%20jantar/Mesa%20de%20jantar%20(5).png",
    tags: ["Mesas", "Cadeiras"],
  },
  {
    id: "luminos",
    title: "Luzes de Assinatura",
    description: "Abajures, pendentes e luminárias que finalizam o ambiente com atmosfera acolhedora.",
    image: "/assets/Abajures/Abajures%20(4).png",
    tags: ["Iluminação", "Decor"],
  },
  {
    id: "refugio",
    title: "Refúgio Privativo",
    description: "Poltronas envolventes, banquetas e peças de apoio que equilibram ergonomia e estética.",
    image: "/assets/poltronas/poltronas%20(3).png",
    tags: ["Poltronas", "Banquetas"],
  },
];

const featuredProducts = [
  {
    id: "milano-sofa",
    name: "Sofá Milano",
    category: "Living",
    price: "R$ 12.990",
    materials: "Madeira certificada, espuma HR e tecido bouclé europeu.",
    dimensions: "230 × 95 × 85 cm",
    image: "/assets/Sofas/Sofas%20(6).png",
  },
  {
    id: "oslo-table",
    name: "Mesa de Jantar Oslo",
    category: "Jantar",
    price: "R$ 9.480",
    materials: "Tampo em lâmina natural e base em aço carbono com pintura eletrostática.",
    dimensions: "220 × 110 × 75 cm",
    image: "/assets/Mesas%20laterais/Mesas%20laterais%20(4).png",
  },
  {
    id: "arcos-chair",
    name: "Poltrona Arcos",
    category: "Assentos",
    price: "R$ 5.690",
    materials: "Estrutura em madeira torneada e estofado em linho italiano.",
    dimensions: "82 × 78 × 84 cm",
    image: "/assets/poltronas/poltronas%20(6).png",
  },
];

const testimonials = [
  {
    quote:
      "O atendimento consultivo da Nobile entregou um projeto completo para nosso apartamento. Cada peça parece feita sob medida.",
    author: "Marina & Roberto",
    detail: "São Paulo · Cobertura Jardins",
  },
  {
    quote:
      "Escolhemos a linha Living Contemporâneo e o resultado foi um ambiente sofisticado, com conforto impecável e entrega pontual.",
    author: "Carolina F.",
    detail: "Curitiba · Casa Alto da Glória",
  },
  {
    quote:
      "Materiais nobres e acabamentos perfeitos. O time sugeriu combinações que elevaram nossa sala de reuniões ao padrão internacional.",
    author: "Studio Valente",
    detail: "Porto Alegre · Escritório boutique",
  },
];

const services = [
  {
    title: "Consultoria signature",
    description:
      "Briefing detalhado, moodboards e seleção de peças exclusivas que respeitam a identidade do projeto e o estilo de vida.",
  },
  {
    title: "Customização e acabamentos",
    description: "Opções de tecidos, lâminas naturais, metais e pedras selecionadas para criar combinações únicas.",
  },
  {
    title: "Instalação premium",
    description: "Logística especializada, montagem in loco e inspeção final com checklist de qualidade Nobile.",
  },
];

export default function Home() {
  const { open } = useQuoteModal();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">
            <Sparkles size={16} /> Mobiliário de alto padrão
          </span>
          <h1>
            Design sob medida para ambientes que inspiram.
            <span>Produção artesanal, acabamentos impecáveis e atendimento consultivo.</span>
          </h1>
          <p>
            Curadoria de móveis contemporâneos com assinatura brasileira e internacional. Projetamos e entregamos espaços
            completos, valorizando a arquitetura e a rotina de quem vive cada ambiente.
          </p>
          <div className="hero__actions">
            <a className="btn btn-primary" href={waLink()} target="_blank" rel="noreferrer">
              Comprar via WhatsApp
              <ArrowRight size={16} />
            </a>
            <button type="button" className="btn btn-outline--dark" onClick={open}>
              Solicitar consultoria
            </button>
          </div>
          <ul className="hero__metrics">
            {heroHighlights.map((item) => (
              <li key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="hero__visual">
          <div className="hero__visual-main" aria-hidden>
            <img src="/assets/Sofas/Sofas%20(2).png" alt="Sala de estar sofisticada" loading="lazy" />
          </div>
          <div className="hero__visual-secondary" aria-hidden>
            <img src="/assets/Mesas%20laterais/Mesas%20laterais%20(3).png" alt="Detalhe de mesa de apoio" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="section">
        <header className="section__header">
          <span className="eyebrow">Coleções</span>
          <h2>Ambientes assinados que traduzem o seu estilo</h2>
          <p>
            Explore nossas linhas exclusivas para living, jantar, suítes e espaços corporativos. Cada coleção combina peças
            versáteis, materiais nobres e proporções generosas.
          </p>
        </header>
        <div className="collection-grid">
          {collections.map((collection) => (
            <article key={collection.id} className="collection-card">
              <div className="collection-card__media">
                <img src={collection.image} alt={collection.title} loading="lazy" />
              </div>
              <div className="collection-card__body">
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
                <ul className="chip-list">
                  {collection.tags.map((tag) => (
                    <li key={tag} className="chip">
                      {tag}
                    </li>
                  ))}
                </ul>
                <a className="link" href="/colecoes">
                  Ver detalhes da coleção
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tonal">
        <header className="section__header">
          <span className="eyebrow">Destaques</span>
          <h2>Peças curadas para o seu projeto</h2>
          <p>
            Seleção de móveis com acabamentos premium, pronta para inspirar seu próximo ambiente. Todas as peças podem ser
            adaptadas em dimensões e revestimentos.
          </p>
        </header>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-card__image">
                <img src={product.image} alt={product.name} loading="lazy" />
              </div>
              <div className="product-card__content">
                <div className="product-card__heading">
                  <span>{product.category}</span>
                  <h3>{product.name}</h3>
                </div>
                <p>{product.materials}</p>
                <ul>
                  <li>
                    <strong>Dimensões:</strong> {product.dimensions}
                  </li>
                  <li>
                    <strong>Investimento:</strong> {product.price}
                  </li>
                </ul>
                <div className="product-card__actions">
                  <a className="btn btn-ghost" href={waLink(product.name)} target="_blank" rel="noreferrer">
                    Conversar sobre a peça
                  </a>
                  <button type="button" className="btn btn-outline--light" onClick={open}>
                    Solicitar proposta
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="story">
          <div className="story__content">
            <header className="section__header">
              <span className="eyebrow">Manifesto</span>
              <h2>Nossa assinatura é transformar ambientes em experiências</h2>
              <p>
                Desde {currentYear - 18}, a Nobile Design atua com um time multidisciplinar de designers, arquitetos e artesãos
                que acompanham todo o ciclo: briefing, curadoria, prototipagem, produção e instalação.
              </p>
            </header>
            <ul className="story__list">
              <li>
                <strong>Materiais responsáveis</strong>
                <span>Certificações FSC, tecidos de baixo impacto e metais de procedência rastreada.</span>
              </li>
              <li>
                <strong>Acabamentos personalizados</strong>
                <span>Catálogo com mais de 150 opções de tecidos, couros, madeiras e pedras naturais.</span>
              </li>
              <li>
                <strong>Experiência completa</strong>
                <span>Showroom imersivo, consultoria em 3D e pós-venda dedicado para manutenção e renovação.</span>
              </li>
            </ul>
          </div>
          <div className="story__visual" aria-hidden>
            <img src="/assets/mesas/Mesa%20(4).png" alt="Equipe da Nobile trabalhando em protótipo" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="section section--tonal">
        <header className="section__header">
          <span className="eyebrow">Como trabalhamos</span>
          <h2>Processo curado para cada fase do projeto</h2>
        </header>
        <div className="service-grid">
          {services.map((service) => (
            <article key={service.title} className="service-card">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <header className="section__header">
          <span className="eyebrow">Depoimentos</span>
          <h2>Experiências de quem escolheu a Nobile</h2>
        </header>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.author} className="testimonial">
              <p>“{testimonial.quote}”</p>
              <footer>
                <strong>{testimonial.author}</strong>
                <span>{testimonial.detail}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="section section--accent">
        <div className="cta-card">
          <div className="cta-card__content">
            <span className="eyebrow">Pronto para começar?</span>
            <h2>Agende uma consultoria signature</h2>
            <p>
              Receba atendimento personalizado para escolher móveis, acabamentos e iluminação que valorizem cada ambiente do seu
              projeto.
            </p>
            <div className="cta-card__actions">
              <a className="btn btn-inverse" href={waLink()} target="_blank" rel="noreferrer">
                Falar via WhatsApp
              </a>
              <button type="button" className="btn btn-outline--dark" onClick={open}>
                Enviar briefing
              </button>
            </div>
          </div>
          <div className="cta-card__visual" aria-hidden>
            <img src="/assets/cadeiras/cadeiras%20(5).png" alt="Consultora apresentando projeto" loading="lazy" />
          </div>
        </div>
      </section>
    </div>
  );
}

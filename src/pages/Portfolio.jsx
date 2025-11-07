import { useQuoteModal } from "@/context/QuoteModalContext";
import { useMemo } from "react";
import { Camera, LayoutGrid } from "lucide-react";
import "./Portfolio.css";

const projects = [
  {
    id: "cobertura-jardins",
    title: "Cobertura Jardins",
    location: "São Paulo · Residencial",
    description: "Living integrado com sofá modular Milano, poltronas Arcos e mesa de centro em pedra travertino.",
    image: "/assets/Sofas/Sofas%20(3).png",
    highlights: ["Sofá Milano", "Mesa lateral Noir", "Luminária Coluna Aura"],
  },
  {
    id: "casa-lago",
    title: "Casa à Beira do Lago",
    location: "Brasília · Residencial",
    description: "Sala de jantar escandinava com mesa Oslo, cadeiras Bari estofadas e pendente em latão escovado.",
    image: "/assets/Mesa%20de%20jantar/Mesa%20de%20jantar%20(6).png",
    highlights: ["Mesa Oslo", "Cadeiras Bari", "Pendente Axis"],
  },
  {
    id: "studio-valente",
    title: "Studio Valente",
    location: "Porto Alegre · Corporativo",
    description: "Sala de reuniões com mesa em lâmina de nogueira, poltronas giratórias e iluminação linear em led quente.",
    image: "/assets/mesas/Mesa%20(6).png",
    highlights: ["Mesa Nogueira", "Poltronas Axis", "Painel acústico"],
  },
  {
    id: "suite-master",
    title: "Suíte Master Esculpida",
    location: "Curitiba · Residencial",
    description: "Poltrona chaise com tecido veludo, iluminação difusa e aparador suspenso em lâmina de carvalho.",
    image: "/assets/poltronas/poltronas%20(5).png",
    highlights: ["Chaise Verona", "Abajur Halo", "Aparador Linear"],
  },
];

const gallery = [
  "/assets/Sofas/Sofas%20(2).png",
  "/assets/cadeiras/cadeiras%20(3).png",
  "/assets/Mesas%20laterais/Mesas%20laterais%20(2).png",
  "/assets/Abajures/Abajures%20(5).png",
  "/assets/Banquetas/Banquetas%20(2).png",
  "/assets/mesas/Mesa%20(3).png",
];

export default function Portfolio() {
  const { open } = useQuoteModal();
  const totalProjects = useMemo(() => projects.length, []);

  return (
    <div className="portfolio">
      <section className="portfolio-hero">
        <div>
          <span className="eyebrow">Ambientes</span>
          <h1>Projetos que combinam estética, conforto e funcionalidade</h1>
          <p>
            A Nobile Design atua do briefing ao pós-venda, integrando mobiliário, iluminação e acessórios para entregar ambientes
            completos. Explore alguns dos nossos projetos mais recentes.
          </p>
          <div className="portfolio-hero__actions">
            <button type="button" className="btn btn-primary" onClick={open}>
              Solicitar curadoria
            </button>
            <a className="btn btn-outline--dark" href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">
              Falar com especialista
            </a>
          </div>
          <ul className="portfolio-hero__stats">
            <li>
              <strong>{totalProjects} projetos</strong>
              <span>residenciais e corporativos entregues</span>
            </li>
            <li>
              <strong>Experiência imersiva</strong>
              <span>visitas guiadas no showroom e tour digital</span>
            </li>
          </ul>
        </div>
        <div className="portfolio-hero__visual" aria-hidden>
          <img src="/assets/Mesas%20laterais/Mesas%20laterais%20(6).png" alt="Ambiente assinado" loading="lazy" />
        </div>
      </section>

      <section className="portfolio-section">
        <header className="section__header">
          <span className="eyebrow">Seleção</span>
          <h2>Alguns dos ambientes que assinamos</h2>
        </header>
        <div className="portfolio-grid">
          {projects.map((project) => (
            <article key={project.id} className="portfolio-card">
              <div className="portfolio-card__media">
                <img src={project.image} alt={project.title} loading="lazy" />
              </div>
              <div className="portfolio-card__content">
                <h3>{project.title}</h3>
                <span>{project.location}</span>
                <p>{project.description}</p>
                <ul>
                  {project.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <a
                  className="link"
                  href={`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá! Gostaria de referências do projeto ${project.title}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver detalhes com o consultor
                </a>
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
          {gallery.map((image) => (
            <figure key={image}>
              <img src={image} alt="Detalhe de projeto" loading="lazy" />
            </figure>
          ))}
        </div>
        <div className="portfolio-gallery__cta">
          <LayoutGrid size={18} />
          <span>Agende uma visita guiada ao nosso showroom imersivo para conhecer as coleções completas.</span>
        </div>
      </section>

      <section className="portfolio-section">
        <header className="section__header">
          <span className="eyebrow">Produção audiovisual</span>
          <h2>Produzimos ensaios fotográficos e vídeos para apresentar o seu projeto</h2>
          <p>
            Conte com nosso time de fotografia para registrar os ambientes assinados e criar materiais de divulgação para seus
            clientes ou investidores.
          </p>
        </header>
        <div className="portfolio-media">
          <article>
            <Camera size={24} />
            <h3>Ensaios fotográficos</h3>
            <p>Direção de arte, produção e pós-tratamento para imagens com estética editorial.</p>
          </article>
          <article>
            <Camera size={24} />
            <h3>Vídeos 4K</h3>
            <p>Captação em movimento com narrativa que valoriza a arquitetura e os elementos de design.</p>
          </article>
          <article>
            <Camera size={24} />
            <h3>Tour interativo</h3>
            <p>Produção de tour virtual e realidade aumentada para apresentações remotas.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

import { useQuoteModal } from "@/context/QuoteModalContext";
import { CheckCircle2 } from "lucide-react";
import "./About.css";

const timeline = [
  {
    year: "2006",
    title: "O início",
    description: "Fundação da Nobile Design com foco em móveis sob medida para residências de alto padrão em São Paulo.",
  },
  {
    year: "2012",
    title: "Curadoria internacional",
    description: "Parcerias estratégicas com designers brasileiros e europeus para ampliar o portfólio de peças assinadas.",
  },
  {
    year: "2018",
    title: "Showroom imersivo",
    description: "Inauguração do showroom conceito com ambientes completos e experiências sensoriais de materiais.",
  },
  {
    year: "2023",
    title: "Consultoria signature",
    description: "Equipe multidisciplinar de arquitetos e especialistas oferecendo jornada de atendimento personalizada de ponta a ponta.",
  },
];

const values = [
  {
    title: "Design autoral",
    description: "Peças exclusivas, com estética minimalista e proporções que respeitam a arquitetura contemporânea.",
  },
  {
    title: "Sustentabilidade real",
    description: "Matérias-primas certificadas, fornecedores auditados e processos que reduzem desperdícios.",
  },
  {
    title: "Precisão na execução",
    description: "Equipe própria de marcenaria, tapeçaria e metalurgia para garantir acabamento impecável em cada detalhe.",
  },
];

const team = [
  {
    name: "Laura Mendes",
    role: "Diretora Criativa",
    bio: "Designer com passagem por estúdios em Milão e Barcelona, lidera a curadoria das coleções e collabs exclusivas.",
  },
  {
    name: "Ricardo Vasconcellos",
    role: "Head de Projetos",
    bio: "Arquiteto responsável pela consultoria signature, coordena a implementação dos ambientes residenciais e corporativos.",
  },
  {
    name: "Bianca Azevedo",
    role: "Especialista em Materiais",
    bio: "Pesquisa acabamentos, tecidos e pedras em fornecedores nacionais e internacionais para customizar cada projeto.",
  },
];

export default function About() {
  const { open } = useQuoteModal();

  return (
    <div className="about">
      <section className="about-hero">
        <div className="about-hero__copy">
          <span className="eyebrow">Sobre a Nobile</span>
          <h1>Fazemos móveis que traduzem histórias, em sintonia com a arquitetura e o estilo de vida.</h1>
          <p>
            Há quase duas décadas, a Nobile Design cria mobiliário de alto padrão com olhar artesanal e tecnologia de produção
            precisa. Cada projeto nasce do diálogo com arquitetos, designers de interiores e clientes que buscam sofisticação sem
            excessos.
          </p>
          <div className="about-hero__actions">
            <button type="button" className="btn btn-primary" onClick={open}>
              Agendar consultoria
            </button>
            <a className="btn btn-outline--dark" href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">
              WhatsApp comercial
            </a>
          </div>
        </div>
        <div className="about-hero__visual" aria-hidden>
          <img src="/assets/Banquetas/Banquetas%20(3).png" alt="Equipe Nobile em processo artesanal" loading="lazy" />
        </div>
      </section>

      <section className="about-section">
        <header className="section__header">
          <span className="eyebrow">Nossa essência</span>
          <h2>Design contemporâneo, processos artesanais e compromisso com a longevidade das peças.</h2>
        </header>
        <div className="about-values">
          {values.map((value) => (
            <article key={value.title} className="about-value">
              <CheckCircle2 size={24} />
              <div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-section--surface">
        <header className="section__header">
          <span className="eyebrow">Linha do tempo</span>
          <h2>Construímos relacionamentos duradouros com projetos e parceiros</h2>
        </header>
        <div className="about-timeline">
          {timeline.map((item) => (
            <article key={item.year} className="about-timeline__item">
              <span>{item.year}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <header className="section__header">
          <span className="eyebrow">Equipe signature</span>
          <h2>Especialistas dedicados a elevar cada detalhe</h2>
        </header>
        <div className="about-team">
          {team.map((member) => (
            <article key={member.name} className="about-team__member">
              <h3>{member.name}</h3>
              <span>{member.role}</span>
              <p>{member.bio}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

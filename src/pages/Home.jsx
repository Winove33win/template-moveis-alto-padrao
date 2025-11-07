import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuoteModal } from "@/context/QuoteModalContext";
import {
  BarChart2,
  Boxes,
  CheckCircle,
  Leaf,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function Home() {
  const { open } = useQuoteModal();

  return (
    <div>
      <section className="hero" id="home">
        <div className="hero__background" aria-hidden="true" />
        <div className="container hero__content">
          <motion.div
            className="hero__copy"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="badge">Logística 4.0 sem complicação</span>
            <h1>
              Agilidade e previsibilidade para operações logísticas que não podem parar
            </h1>
            <p>
              Somos parceiros estratégicos de indústrias e varejistas que precisam de transporte confiável, monitoramento em
              tempo real e atendimento consultivo para crescer.
            </p>
            <div className="hero__actions">
              <button type="button" className="btn btn-primary" onClick={open}>
                Solicite uma cotação
              </button>
              <Link to="/servicos" className="hero__secondary hero__secondary--light">
                Conheça nossos serviços
              </Link>
            </div>
            <dl className="hero__metrics">
              <div>
                <dt>98%</dt>
                <dd>SLA de entregas dentro do prazo</dd>
              </div>
              <div>
                <dt>+1.200</dt>
                <dd>Cidades atendidas em todo o Brasil</dd>
              </div>
              <div>
                <dt>24/7</dt>
                <dd>Central de monitoramento ativa</dd>
              </div>
            </dl>
          </motion.div>
          <motion.div
            className="hero__media"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
          >
            <div className="hero__card">
              <img src="/camiao-na-rodovia-ao-por-sol.jpg" alt="Caminhão na rodovia ao pôr do sol" />
              <div className="hero__card-content">
                <p>Monitoramento em tempo real via torre de controle dedicada.</p>
                <ul>
                  <li>
                    <CheckCircle size={18} /> Rastreamento por rota
                  </li>
                  <li>
                    <CheckCircle size={18} /> Ajustes proativos durante a viagem
                  </li>
                  <li>
                    <CheckCircle size={18} /> Comunicação integrada com seu time
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <motion.div className="section__header" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={container}>
            <motion.span className="section__kicker" variants={item}>
              O que entregamos
            </motion.span>
            <motion.h2 variants={item}>Soluções completas para toda a cadeia logística</motion.h2>
            <motion.p variants={item}>
              Nossa frota híbrida, infraestrutura de armazenagem e time consultivo garantem desempenho extremo do seu supply chain.
            </motion.p>
          </motion.div>
          <motion.div className="grid grid-3" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            <motion.article className="card" variants={item}>
              <Truck size={28} className="card__icon" />
              <h3>Transporte fracionado premium</h3>
              <p>
                Rede dedicada de cross-docking, veículos rastreados e SLA de coleta sob medida para operações B2B.
              </p>
              <Link to="/servicos" className="card__link">
                Detalhar solução
              </Link>
            </motion.article>
            <motion.article className="card" variants={item}>
              <Boxes size={28} className="card__icon" />
              <h3>Logística integrada</h3>
              <p>
                Planejamento, armazenagem e distribuição coordenados pelo nosso time de especialistas com dados em tempo real.
              </p>
              <Link to="/servicos" className="card__link">
                Ver mais
              </Link>
            </motion.article>
            <motion.article className="card" variants={item}>
              <ShieldCheck size={28} className="card__icon" />
              <h3>Operações sensíveis</h3>
              <p>
                Camadas adicionais de segurança, monitoramento 24/7 e protocolos de contingência para cargas de alto valor.
              </p>
              <Link to="/servicos" className="card__link">
                Entenda como
              </Link>
            </motion.article>
          </motion.div>
        </div>
      </section>

      <section className="section section--split" id="about">
        <div className="container section__split">
          <motion.div className="section__split-copy" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={container}>
            <motion.span className="section__kicker" variants={item}>
              Quem está por trás
            </motion.span>
            <motion.h2 variants={item}>Mais de 20 anos orquestrando rotas pelo país</motion.h2>
            <motion.p variants={item}>
              Nascemos como uma transportadora de cargas fracionadas e evoluímos para parceiro estratégico dos maiores players do
              varejo e da indústria, combinando tecnologia, pessoas e processos.
            </motion.p>
            <motion.ul className="list" variants={container}>
              <motion.li variants={item}>
                <Users size={18} /> 280 especialistas em logística, atendimento e tecnologia
              </motion.li>
              <motion.li variants={item}>
                <BarChart2 size={18} /> Torre de controle com dashboards de performance sob demanda
              </motion.li>
              <motion.li variants={item}>
                <Leaf size={18} /> Operação carbono compensado e compromisso ESG
              </motion.li>
            </motion.ul>
            <motion.div className="section__cta" variants={item}>
              <Link to="/sobre" className="btn btn-primary">
                Conheça nossa história
              </Link>
              <Link to="/contato" className="section__cta-secondary">
                Fale com especialistas
              </Link>
            </motion.div>
          </motion.div>
          <motion.figure
            className="section__split-media"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <img src="/retrato-de-entregador-distribuindo-encomendas.jpg" alt="Entregador distribuindo encomendas" />
          </motion.figure>
        </div>
      </section>

      <section className="section section--highlight" id="advantages">
        <div className="container section__highlight">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
            <motion.span className="section__kicker" variants={item}>
              Resultados na prática
            </motion.span>
            <motion.h2 variants={item}>Performance comprovada com grandes marcas</motion.h2>
            <motion.p variants={item}>
              Cases de implementação mostram reduções de até 32% no lead time e satisfação dos clientes finais acima de 90%.
            </motion.p>
          </motion.div>
          <motion.div className="grid grid-3" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            {["Setup em 15 dias", "Dashboard em tempo real", "Equipe dedicada"].map((title) => (
              <motion.article className="card" key={title} variants={item}>
                <h3>{title}</h3>
                <p>
                  Processos desenhados lado a lado com seu time para entregar previsibilidade desde o onboarding até a operação diária.
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section" id="sustainability">
        <div className="container section__sustainability">
          <motion.div
            className="section__sustainability-copy"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={container}
          >
            <motion.span className="section__kicker" variants={item}>
              Compromisso ESG
            </motion.span>
            <motion.h2 variants={item}>Sustentabilidade e impacto positivo</motion.h2>
            <motion.p variants={item}>
              Frota com veículos híbridos, compensação de carbono e projetos sociais junto às comunidades onde atuamos.
            </motion.p>
            <motion.ul className="list" variants={container}>
              <motion.li variants={item}>
                <Leaf size={18} /> Neutralização de 100% das emissões diretas
              </motion.li>
              <motion.li variants={item}>
                <ShieldCheck size={18} /> Treinamentos de segurança e direção defensiva
              </motion.li>
              <motion.li variants={item}>
                <Users size={18} /> Programas de formação para motoristas e familiares
              </motion.li>
            </motion.ul>
          </motion.div>
          <motion.figure
            className="section__sustainability-media"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <img src="/Background.jpg" alt="Galpão logístico moderno" />
          </motion.figure>
        </div>
      </section>

      <section className="section section--cta">
        <div className="container section__cta-wrapper">
          <motion.div
            className="section__cta-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Vamos acelerar sua cadeia logística?</h2>
            <p>
              Preencha alguns detalhes sobre a sua operação e receba um plano personalizado com oportunidades de melhoria.
            </p>
            <div className="section__cta">
              <button type="button" className="btn btn-primary" onClick={open}>
                Iniciar proposta
              </button>
              <Link to="/contato" className="section__cta-secondary">
                Outros canais
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;

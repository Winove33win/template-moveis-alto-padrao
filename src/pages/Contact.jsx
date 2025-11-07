import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";

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

function Contact() {
  const { open } = useQuoteModal();

  return (
    <div className="page">
      <section className="page-hero contact-hero">
        <div className="container page-hero__inner">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="badge">Contato</span>
            <h1>Estamos prontos para acelerar sua operação</h1>
            <p>
              Escolha o canal ideal para falar com a LogiPro. Nossa equipe responde com agilidade e acompanha toda a jornada.
            </p>
            <div className="hero__actions">
              <button type="button" className="btn btn-primary" onClick={open}>
                Solicitar cotação
              </button>
              <a className="hero__secondary" href="mailto:contato@logipro.com.br">
                Enviar e-mail direto
              </a>
            </div>
          </motion.div>
          <motion.figure
            className="page-hero__media"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            <img src="/retrato-de-entregador-distribuindo-encomendas.jpg" alt="Profissional de logística trabalhando" />
          </motion.figure>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-grid">
          <motion.form className="card contact-form" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={container}>
            <motion.h2 variants={item}>Envie uma mensagem</motion.h2>
            <motion.p variants={item}>
              Responderemos em até um dia útil. Compartilhe os detalhes da sua demanda para conectarmos ao time certo.
            </motion.p>
            <motion.label variants={item}>
              Nome completo
              <input type="text" name="name" placeholder="Seu nome" required />
            </motion.label>
            <motion.label variants={item}>
              Empresa
              <input type="text" name="company" placeholder="Nome da empresa" />
            </motion.label>
            <motion.label variants={item}>
              E-mail corporativo
              <input type="email" name="email" placeholder="email@empresa.com" required />
            </motion.label>
            <motion.label variants={item}>
              Telefone
              <input type="tel" name="phone" placeholder="(00) 00000-0000" />
            </motion.label>
            <motion.label variants={item}>
              Mensagem
              <textarea name="message" rows="4" placeholder="Conte-nos sobre sua operação"></textarea>
            </motion.label>
            <motion.button type="submit" className="btn btn-primary" variants={item}>
              <Send size={18} /> Enviar mensagem
            </motion.button>
          </motion.form>
          <motion.div className="card contact-info" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
            <motion.h2 variants={item}>Outros canais</motion.h2>
            <motion.ul className="contact-list" variants={container}>
              <motion.li variants={item}>
                <Mail size={20} /> contato@logipro.com.br
              </motion.li>
              <motion.li variants={item}>
                <Phone size={20} /> +55 (11) 3000-0000
              </motion.li>
              <motion.li variants={item}>
                <MapPin size={20} /> Av. das Operações, 450 - São Paulo/SP
              </motion.li>
              <motion.li variants={item}>
                <Clock size={20} /> Atendimento: segunda a sexta, 8h às 18h
              </motion.li>
            </motion.ul>
            <motion.div className="contact-cta" variants={item}>
              <h3>Precisa de atendimento imediato?</h3>
              <p>Nossa torre de controle funciona 24/7 e prioriza ocorrências críticas em minutos.</p>
              <button type="button" className="btn btn-outline btn-outline--dark" onClick={open}>
                Abrir chamado urgente
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section section--map">
        <div className="container section__cta-wrapper">
          <motion.div
            className="section__cta-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Visite nosso centro de operações</h2>
            <p>Agende uma visita guiada e conheça nossa infraestrutura de rastreamento e cross-docking.</p>
            <div className="section__cta">
              <a className="btn btn-primary" href="https://maps.app.goo.gl/" target="_blank" rel="noreferrer">
                Ver no mapa
              </a>
              <button type="button" className="section__cta-secondary" onClick={open}>
                Agendar visita
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Contact;

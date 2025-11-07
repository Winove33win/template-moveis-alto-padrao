import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function TermsOfUse() {
  return (
    <div className="page">
      <section className="page-hero">
        <div className="container page-hero__inner">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <span className="badge">Termos de Uso</span>
            <h1>Condições de uso do site e serviços Nobile Design</h1>
            <p>
              Utilize este espaço para descrever as regras que regem a navegação, os atendimentos consultivos e a apresentação do
              catálogo digital da Nobile Design. Substitua os textos por cláusulas aprovadas pelo jurídico.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container legal-text">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            <motion.h2 variants={item}>1. Aceitação</motion.h2>
            <motion.p variants={item}>
              Explique que ao acessar este site ou solicitar atendimento, o usuário concorda com as condições estabelecidas, bem
              como com políticas complementares como privacidade e cookies.
            </motion.p>

            <motion.h2 variants={item}>2. Responsabilidades</motion.h2>
            <motion.p variants={item}>
              Detalhe as responsabilidades da Nobile Design na apresentação de informações sobre produtos, prazos e suporte, e as
              obrigações do usuário ao fornecer dados corretos e respeitar direitos autorais das imagens e conteúdos exibidos.
            </motion.p>

            <motion.h2 variants={item}>3. Limitações de garantia</motion.h2>
            <motion.p variants={item}>
              Indique limites de responsabilidade quanto a indisponibilidade do site, conteúdos de terceiros e alterações de
              portfólio sem aviso prévio, sempre observando as legislações aplicáveis.
            </motion.p>

            <motion.h2 variants={item}>4. Disposições finais</motion.h2>
            <motion.p variants={item}>
              Inclua cláusulas sobre vigência, alterações nestes termos, foro competente e canais oficiais para dúvidas ou
              solicitações relacionadas aos serviços oferecidos pela marca.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default TermsOfUse;

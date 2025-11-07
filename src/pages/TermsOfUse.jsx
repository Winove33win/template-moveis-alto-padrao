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
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="badge">Termos de Uso</span>
            <h1>Condições para utilização dos serviços LogiPro</h1>
            <p>
              A seguir você encontra cláusulas padrão que estabelecem direitos e responsabilidades entre a LogiPro e os usuários.
              Os conteúdos são placeholders e devem ser substituídos pela versão revisada pelo departamento jurídico.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container legal-text">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            <motion.h2 variants={item}>1. Aceitação dos termos</motion.h2>
            <motion.p variants={item}>
              Explique que ao acessar os canais digitais da LogiPro, o usuário concorda com as políticas e obrigações estabelecidas
              nesta página, incluindo requisitos de elegibilidade e regras de conduta.
            </motion.p>

            <motion.h2 variants={item}>2. Obrigações das partes</motion.h2>
            <motion.p variants={item}>
              Detalhe as responsabilidades da LogiPro na entrega dos serviços, bem como os deveres dos clientes no fornecimento de
              informações corretas, pagamento de valores e observância das normas de segurança.
            </motion.p>

            <motion.h2 variants={item}>3. Limitações de responsabilidade</motion.h2>
            <motion.p variants={item}>
              Esclareça situações em que a LogiPro não será responsabilizada por danos indiretos, eventos de força maior ou falhas
              ocasionadas por terceiros, indicando limites e exceções aplicáveis.
            </motion.p>

            <motion.h2 variants={item}>4. Disposições gerais</motion.h2>
            <motion.p variants={item}>
              Inclua cláusulas sobre vigência, alteração dos termos, foro competente e canais de comunicação para esclarecimento de
              dúvidas ou reclamações referentes aos serviços prestados.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default TermsOfUse;

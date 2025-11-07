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

function PrivacyPolicy() {
  return (
    <div className="page">
      <section className="page-hero">
        <div className="container page-hero__inner">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <span className="badge">Política de Privacidade</span>
            <h1>Compromisso com a segurança das suas informações</h1>
            <p>
              A Nobile Design adota práticas transparentes para coletar, tratar e proteger dados pessoais utilizados na nossa
              operação digital e no atendimento consultivo. Atualize este conteúdo com as diretrizes jurídicas oficiais da sua
              empresa.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container legal-text">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            <motion.h2 variants={item}>1. Informações coletadas</motion.h2>
            <motion.p variants={item}>
              Liste os dados pessoais coletados em formulários, atendimentos via WhatsApp e navegação no site, incluindo nome,
              contato, preferências de projeto e registros técnicos (cookies, IP, dispositivo).
            </motion.p>

            <motion.h2 variants={item}>2. Finalidade do tratamento</motion.h2>
            <motion.p variants={item}>
              Explique como os dados são utilizados para elaborar propostas de mobiliário, personalizar consultorias, enviar
              comunicações relevantes e cumprir obrigações legais ou contratuais.
            </motion.p>

            <motion.h2 variants={item}>3. Compartilhamento e retenção</motion.h2>
            <motion.p variants={item}>
              Informe com quais fornecedores (logística, ERP, parceiros de pagamento) os dados podem ser compartilhados e por
              quanto tempo são armazenados, considerando as etapas do projeto e pós-venda.
            </motion.p>

            <motion.h2 variants={item}>4. Direitos dos titulares</motion.h2>
            <motion.p variants={item}>
              Descreva como o titular pode solicitar acesso, correção, portabilidade ou exclusão dos dados, bem como entrar em
              contato com o encarregado (DPO) responsável pela governança de privacidade.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default PrivacyPolicy;

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
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="badge">Política de Privacidade</span>
            <h1>Transparência e confiança na proteção dos seus dados</h1>
            <p>
              Esta página descreve as diretrizes que seguimos para coletar, utilizar, armazenar e proteger as informações
              fornecidas pelos usuários da LogiPro. Os textos abaixo são placeholders e podem ser atualizados conforme a
              documentação jurídica oficial.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container legal-text">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            <motion.h2 variants={item}>1. Informações coletadas</motion.h2>
            <motion.p variants={item}>
              Descreva os tipos de dados pessoais coletados, incluindo dados de contato, registros de navegação e informações
              fornecidas em formulários. Explique quais tecnologias de rastreamento são utilizadas e por que são necessárias
              para a operação do serviço.
            </motion.p>

            <motion.h2 variants={item}>2. Finalidade do tratamento</motion.h2>
            <motion.p variants={item}>
              Indique como os dados são utilizados para prestar serviços logísticos, melhorar a experiência do usuário e
              oferecer suporte. Inclua observações sobre comunicações de marketing e a possibilidade de cancelamento pelo
              usuário.
            </motion.p>

            <motion.h2 variants={item}>3. Compartilhamento e retenção</motion.h2>
            <motion.p variants={item}>
              Informe como os dados podem ser compartilhados com parceiros estratégicos, autoridades regulatórias ou provedores
              de infraestrutura. Detalhe os critérios para retenção dos dados e os mecanismos utilizados para garantir a
              segurança das informações.
            </motion.p>

            <motion.h2 variants={item}>4. Direitos dos titulares</motion.h2>
            <motion.p variants={item}>
              Explique como os usuários podem solicitar acesso, correção ou exclusão de seus dados pessoais, bem como registrar
              reclamações junto às autoridades competentes. Inclua orientações sobre o canal de contato responsável pelo
              atendimento dessas solicitações.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default PrivacyPolicy;

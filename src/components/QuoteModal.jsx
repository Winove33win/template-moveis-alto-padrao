import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const modalVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export function QuoteModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <p className="modal-kicker">Consultoria exclusiva</p>
                <h2>Conte-nos sobre o seu ambiente</h2>
              </div>
              <button type="button" aria-label="Fechar modal" onClick={onClose} className="modal-close">
                <X size={20} />
              </button>
            </header>
            <form className="modal-form">
              <label>
                Nome completo
                <input type="text" name="name" placeholder="Como devemos te chamar?" required />
              </label>
              <label>
                E-mail
                <input type="email" name="email" placeholder="voce@email.com" required />
              </label>
              <label>
                WhatsApp
                <input type="tel" name="phone" placeholder="(00) 00000-0000" required />
              </label>
              <label>
                Ambiente do projeto
                <input type="text" name="space" placeholder="Ex.: Living integrado, suíte master" />
              </label>
              <label>
                Estilo desejado
                <input type="text" name="style" placeholder="Minimalista, contemporâneo, etc." />
              </label>
              <label>
                Orçamento estimado
                <input type="text" name="budget" placeholder="Informe a faixa de investimento" />
              </label>
              <label>
                Detalhes adicionais
                <textarea rows="4" name="message" placeholder="Medidas, prazos ou referências que deseja compartilhar."></textarea>
              </label>
              <button type="submit" className="btn btn-primary">
                Enviar briefing
              </button>
            </form>
            <p className="modal-footnote">
              Nosso time retorna em até algumas horas úteis pelo WhatsApp para apresentar uma proposta personalizada.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default QuoteModal;

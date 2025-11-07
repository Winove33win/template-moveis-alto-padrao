import { useState } from "react";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { Phone, MessageCircle, Clock, ShieldCheck } from "lucide-react";
import "./Consulting.css";

const faqs = [
  {
    question: "Qual o prazo médio de produção e entrega?",
    answer:
      "Para peças de linha, trabalhamos com prazos entre 25 e 45 dias úteis. Projetos sob medida são orçados individualmente, considerando o volume e acabamentos selecionados.",
  },
  {
    question: "Vocês realizam montagem e instalação?",
    answer:
      "Sim, a Nobile Design possui equipe própria e parceiros especializados para montagem, nivelamento e instalação elétrica quando necessário.",
  },
  {
    question: "É possível personalizar dimensões e tecidos?",
    answer:
      "Todas as peças podem receber ajustes em medidas, tecidos, couros, lâminas de madeira e acabamentos metálicos. Nosso time auxilia na escolha das melhores combinações.",
  },
];

const steps = [
  {
    title: "Briefing e consultoria",
    description: "Reunião online ou presencial para entender necessidades, prazos e referências do projeto.",
  },
  {
    title: "Curadoria de peças",
    description: "Seleção de móveis, iluminação e acessórios com propostas visuais, amostras físicas e simulações 3D.",
  },
  {
    title: "Produção e instalação",
    description: "Acompanhamento da fabricação, logística especializada, montagem e vistoria final com checklist Nobile.",
  },
];

export default function Consulting() {
  const { open } = useQuoteModal();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = `Olá! Sou ${form.name} e gostaria de falar sobre um projeto de móveis de alto padrão. ${form.message}`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="consulting">
      <section className="consulting-hero">
        <div>
          <span className="eyebrow">Consultoria Signature</span>
          <h1>Atendimento completo para criar ambientes sofisticados e funcionais</h1>
          <p>
            Do briefing ao pós-venda, oferecemos uma jornada personalizada para arquitetos, designers e clientes finais. Nosso time
            cuida da curadoria de móveis, acabamentos, iluminação e decoração para garantir uma entrega impecável.
          </p>
          <div className="consulting-hero__actions">
            <button type="button" className="btn btn-primary" onClick={open}>
              Enviar briefing
            </button>
            <a className="btn btn-outline--dark" href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">
              Conversar no WhatsApp
            </a>
          </div>
        </div>
        <div className="consulting-hero__info">
          <article>
            <Phone size={20} />
            <div>
              <strong>Atendimento imediato</strong>
              <span>Segunda a sábado, das 9h às 19h</span>
            </div>
          </article>
          <article>
            <Clock size={20} />
            <div>
              <strong>Prazos monitorados</strong>
              <span>Relatórios semanais de produção e logística</span>
            </div>
          </article>
          <article>
            <ShieldCheck size={20} />
            <div>
              <strong>Garantia premium</strong>
              <span>Peças com cobertura estendida e assistência dedicada</span>
            </div>
          </article>
        </div>
      </section>

      <section className="consulting-section">
        <header className="section__header">
          <span className="eyebrow">Processo</span>
          <h2>Uma jornada em três etapas</h2>
        </header>
        <div className="consulting-steps">
          {steps.map((step) => (
            <article key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="consulting-section consulting-section--surface">
        <header className="section__header">
          <span className="eyebrow">Envie seu projeto</span>
          <h2>Conte-nos sobre o ambiente que deseja transformar</h2>
        </header>
        <div className="consulting-form">
          <form onSubmit={handleSubmit}>
            <label>
              Nome
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Como devemos te chamar?" required />
            </label>
            <label>
              WhatsApp
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(00) 00000-0000" required />
            </label>
            <label>
              Mensagem
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Conte sobre o ambiente, estilo desejado e prazo."
                rows={4}
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Enviar pelo WhatsApp
            </button>
          </form>
          <aside>
            <div>
              <MessageCircle size={20} />
              <p>
                Preferimos o contato inicial pelo WhatsApp para agilizar o atendimento. Assim que recebermos sua mensagem, um consultor
                especializado continuará o atendimento de forma personalizada.
              </p>
            </div>
            <div>
              <ShieldCheck size={20} />
              <p>Transparência total sobre prazos, condições comerciais e garantia de até 2 anos para defeitos de fabricação.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="consulting-section">
        <header className="section__header">
          <span className="eyebrow">Perguntas frequentes</span>
          <h2>Esclareça suas dúvidas antes da consultoria</h2>
        </header>
        <div className="consulting-faq">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

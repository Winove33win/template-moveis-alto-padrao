import React, { useEffect, useMemo, useState } from "react";

/**
 * Landing – Móveis de Alto Padrão (Preview)
 *
 * Estilo: minimalista/contemporâneo, conversão via WhatsApp, mantendo layout de loja.
 * Recursos: header sticky com shrink, rolagem suave, grid de produtos, modal de detalhes,
 * seção "Fale com a gente" em duas colunas (form + informações) e mapa SP Centro.
 *
 * Dica: substitua as imagens/links/telefones depois. Os dados mock seguem a estrutura
 * de um banco de dados de produtos (nome, preço, medidas, materiais, acabamentos, etc.).
 */

const WA_NUMBER = "+55 11 99999-9999"; // <— Trocar para o número real (formato livre)
const WA_LINK = (produto?: string) =>
  `https://wa.me/5511999999999?text=${encodeURIComponent(
    produto
      ? `Olá! Tenho interesse no produto ${produto}. Poderiam me atender?`
      : "Olá! Gostaria de falar com um consultor."
  )}`;

const products = [
  {
    id: "p1",
    name: "Sofá Milano 3 Lugares",
    price: 12990,
    description:
      "Sofá de linhas retas com conforto premium, espuma HR e estrutura em madeira maciça certificada.",
    dimensions: "L 230 cm × P 95 cm × A 85 cm",
    materials: "Estrutura em madeira maciça, espuma HR, tecido bouclé",
    finishes: ["Off-white", "Cinza-chumbo"],
    leadTime: "35 a 45 dias",
    images: [
      "https://images.unsplash.com/photo-1616596872547-6ceb1f5b4d2a?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1920&auto=format&fit=crop",
    ],
  },
  {
    id: "p2",
    name: "Mesa de Jantar Oslo 6p",
    price: 8790,
    description:
      "Tampo elíptico em madeira natural e base escultural. Design contemporâneo para ambientes sofisticados.",
    dimensions: "L 200 cm × P 100 cm × A 75 cm",
    materials: "Tampo em lâmina natural, base em aço carbono com pintura eletrostática",
    finishes: ["Nogueira", "Carvalho-claro"],
    leadTime: "25 a 35 dias",
    images: [
      "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1920&auto=format&fit=crop",
    ],
  },
  {
    id: "p3",
    name: "Poltrona Arcos",
    price: 5690,
    description:
      "Encosto envolvente com curvas suaves, apoio lombar e pés em madeira torneada.",
    dimensions: "L 78 cm × P 82 cm × A 84 cm",
    materials: "Madeira maciça, espuma de alta densidade, linho premium",
    finishes: ["Areia", "Verde-sálvia"],
    leadTime: "20 a 30 dias",
    images: [
      "https://images.unsplash.com/photo-1554995207-3886a393cfcb?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1920&auto=format&fit=crop",
    ],
  },
  {
    id: "p4",
    name: "Aparador Linear",
    price: 6490,
    description:
      "Volume minimalista com portas em microtextura e nicho central iluminado por LED quente.",
    dimensions: "L 180 cm × P 45 cm × A 75 cm",
    materials: "MDF laqueado, alumínio escovado, LED 2700K",
    finishes: ["Fosco grafite", "Branco seda"],
    leadTime: "30 a 40 dias",
    images: [
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1920&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1920&auto=format&fit=crop",
    ],
  },
];

const currency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function useHeaderShrink() {
  const [shrink, setShrink] = useState(false);
  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return shrink;
}

const Section: React.FC<{
  id?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ id, className, children }) => (
  <section id={id} className={`mx-auto max-w-7xl px-6 md:px-8 ${className || ""}`}>
    {children}
  </section>
);

const ScrollLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <button
    onClick={() => {
      const el = document.querySelector(to);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }}
    className="transition hover:opacity-80"
  >
    {children}
  </button>
);

const ProductCard: React.FC<{
  data: (typeof products)[number];
  onOpen: (p: (typeof products)[number]) => void;
}> = ({ data, onOpen }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-stone-800/70 bg-stone-900 shadow-sm transition hover:shadow-md hover:border-orange-400/40">
      <div className="aspect-[4/3] w-full overflow-hidden bg-stone-800">
        <img
          src={data.images[0]}
          alt={data.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-stone-100">{data.name}</h3>
          <p className="mt-1 text-sm text-stone-400">{data.materials}</p>
        </div>
        <div className="shrink-0 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-medium text-stone-950">
          {currency(data.price)}
        </div>
      </div>
      <div className="flex gap-3 p-5 pt-0">
        <a
          href={WA_LINK(data.name)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-xl border border-orange-300/80 px-4 py-2 text-sm font-medium text-stone-100 transition hover:bg-orange-400 hover:text-stone-950 hover:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-400/60"
        >
          Comprar via WhatsApp
        </a>
        <button
          onClick={() => onOpen(data)}
          className="inline-flex items-center justify-center rounded-xl bg-orange-400 px-4 py-2 text-sm font-medium text-stone-950 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-[1px] focus-visible:ring-2 focus-visible:ring-orange-400/60"
        >
          Ver detalhes
        </button>
      </div>
    </div>
  );
};

const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  product?: (typeof products)[number] | null;
}> = ({ open, onClose, product }) => {
  if (!open || !product) return null;
  return (
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-stone-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-stone-900/80 text-stone-300 shadow hover:bg-stone-900"
          aria-label="Fechar"
        >
          ×
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="h-72 w-full md:h-full">
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="p-6 md:p-8">
            <h3 className="text-2xl font-semibold text-stone-100">{product.name}</h3>
            <p className="mt-2 text-sm text-stone-400">{product.description}</p>
            <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-stone-300">
              <div className="rounded-xl border border-neutral-200 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-stone-400">Preço</span>
                <span className="text-stone-100">{currency(product.price)}</span>
              </div>
              <div className="rounded-xl border border-neutral-200 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-stone-400">Dimensões</span>
                <span>{product.dimensions}</span>
              </div>
              <div className="rounded-xl border border-neutral-200 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-stone-400">Materiais</span>
                <span>{product.materials}</span>
              </div>
              <div className="rounded-xl border border-neutral-200 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-stone-400">Acabamentos</span>
                <span>{product.finishes.join(", ")}</span>
              </div>
              <div className="rounded-xl border border-neutral-200 p-3">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-stone-400">Prazo</span>
                <span>{product.leadTime}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={WA_LINK(product.name)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-orange-400 px-5 py-3 text-sm font-medium text-stone-950 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-[1px] focus-visible:ring-2 focus-visible:ring-orange-400/60"
              >
                Comprar via WhatsApp
              </a>
              <a
                href="#contato"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector("#contato");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  onClose();
                }}
                className="inline-flex items-center justify-center rounded-xl border border-orange-300/80 px-5 py-3 text-sm font-medium text-stone-100 transition hover:bg-orange-400 hover:text-stone-950 hover:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-400/60"
              >
                Falar com um consultor
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LuxuryFurnitureLanding() {
  const shrink = useHeaderShrink();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<(typeof products)[number] | null>(null);

  const openModal = (p: (typeof products)[number]) => {
    setActiveProduct(p);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveProduct(null);
  };

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Header */}
      <header
        className={`sticky top-0 z-40 w-full border-b border-stone-800/70 bg-stone-950/80 backdrop-blur ${
          shrink ? "py-2" : "py-4"
        } transition-[padding]`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-400" />
            <span className="font-semibold tracking-wide">Nobile | Design</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <ScrollLink to="#colecoes">Coleções</ScrollLink>
            <ScrollLink to="#sobre">Sobre</ScrollLink>
            <ScrollLink to="#depoimentos">Depoimentos</ScrollLink>
            <ScrollLink to="#contato">Fale com a gente</ScrollLink>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={WA_LINK()}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-xl bg-orange-400 px-4 py-2 text-sm font-medium text-stone-950 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-[1px] focus-visible:ring-2 focus-visible:ring-orange-400/60 md:inline-flex"
            >
              Comprar via WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <Section className="pt-10 md:pt-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Móveis de alto padrão, <span className="text-stone-400">design</span> que
              eleva seus ambientes
            </h1>
            <p className="mt-4 max-w-xl text-stone-300">
              Curadoria de peças contemporâneas e minimalistas, feitas sob medida com materiais nobres e acabamento impecável.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#colecoes"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector("#colecoes");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center rounded-xl bg-orange-400 px-5 py-3 text-sm font-medium text-stone-950 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-[1px] focus-visible:ring-2 focus-visible:ring-orange-400/60"
              >
                Ver coleções
              </a>
              <a
                href={WA_LINK()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-orange-300/80 px-5 py-3 text-sm font-medium text-stone-100 transition hover:bg-orange-400 hover:text-stone-950 hover:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-400/60"
              >
                Comprar via WhatsApp
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-stone-400">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
                Produção sob medida
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
                Garantia 1 ano
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
                Entrega especializada
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-stone-800 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1920&auto=format&fit=crop"
                alt="Ambiente com sofá e mesa contemporâneos"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute -bottom-6 -left-6 hidden h-20 w-20 rounded-3xl border border-stone-800/70 bg-stone-900 md:block" />
          </div>
        </div>
      </Section>

      {/* Coleções/Produtos */}
      <Section id="colecoes" className="pb-6 pt-20 md:pb-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">Destaques</h2>
            <p className="mt-2 max-w-2xl text-stone-300">
              Seleção curada de peças com estética minimalista e acabamentos premium.
            </p>
          </div>
          <a
            href={WA_LINK("Catálogo completo")}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-xl border border-orange-300/80 px-4 py-2 text-sm font-medium text-stone-100 transition hover:bg-orange-400 hover:text-stone-950 md:inline-flex"
          >
            Solicitar catálogo
          </a>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} data={p} onOpen={openModal} />
          ))}
        </div>
      </Section>

      {/* Sobre */}
      <Section id="sobre" className="py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h2 className="text-2xl font-semibold md:text-3xl">Sobre a Nobile</h2>
            <p className="mt-4 text-stone-300">
              Unimos design autoral e fabricação precisa para criar móveis que atravessam tendências. Trabalhamos com madeiras de manejo responsável, tecidos premium e metalurgia de alta precisão.
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-3 text-sm text-stone-300 md:grid-cols-2">
              <li className="rounded-xl border border-neutral-200 p-3">
                Materiais nobres selecionados
              </li>
              <li className="rounded-xl border border-neutral-200 p-3">Projeto sob medida</li>
              <li className="rounded-xl border border-neutral-200 p-3">Entrega e montagem premium</li>
              <li className="rounded-xl border border-neutral-200 p-3">Garantia e pós-venda</li>
            </ul>
            <div className="mt-6 flex gap-3">
              <a
                href={WA_LINK("Quero um projeto sob medida")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-orange-400 px-5 py-3 text-sm font-medium text-stone-950 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-[1px] focus-visible:ring-2 focus-visible:ring-orange-400/60"
              >
                Falar com um designer
              </a>
              <a
                href="#depoimentos"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#depoimentos")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center rounded-xl border border-orange-300/80 px-5 py-3 text-sm font-medium text-stone-100 transition hover:bg-orange-400 hover:text-stone-950 hover:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-400/60"
              >
                Ver depoimentos
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-stone-800 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1920&auto=format&fit=crop"
                alt="Detalhe de marcenaria premium"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Depoimentos */}
      <Section id="depoimentos" className="py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Depoimentos</h2>
          <p className="mt-3 text-stone-300">
            A experiência dos nossos clientes com atendimento consultivo e acabamentos impecáveis.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <blockquote
              key={i}
              className="rounded-2xl border border-neutral-200 bg-stone-900 p-6 text-sm text-stone-300 shadow-sm"
            >
              <p>
                “Entrega impecável e conforto surpreendente. O sofá ficou perfeito no nosso
                living!”
              </p>
              <footer className="mt-4 text-xs text-stone-400">— Marina, São Paulo</footer>
            </blockquote>
          ))}
        </div>
      </Section>

      {/* Fale com a gente (última sessão antes do footer) */}
      <Section id="contato" className="py-20">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Fale com a gente</h2>
          <p className="mt-2 text-stone-300">Atendimento consultivo para seu projeto.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Coluna: Formulário simples (mock) */}
          <div className="rounded-2xl border border-neutral-200 bg-stone-900 p-6 shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.open(WA_LINK("Olá! Preenchi o formulário no site."), "_blank");
              }}
              className="grid grid-cols-1 gap-4"
            >
              <input
                type="text"
                required
                placeholder="Seu nome"
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
              <input
                type="tel"
                required
                placeholder="Seu Whatsapp"
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
              <textarea
                placeholder="Como podemos ajudar?"
                className="min-h-[120px] w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-orange-400 px-5 py-3 text-sm font-medium text-stone-950 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-[1px] focus-visible:ring-2 focus-visible:ring-orange-400/60"
              >
                Enviar pelo WhatsApp
              </button>
              <p className="text-xs text-stone-400">Responderemos em poucos minutos no horário comercial.</p>
            </form>
          </div>

          {/* Coluna: Informações e mapa */}
          <div className="grid grid-rows-[auto_1fr] gap-4">
            <div className="rounded-2xl border border-neutral-200 bg-stone-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Atendimento</h3>
              <ul className="mt-3 space-y-2 text-sm text-stone-300">
                <li>
                  <strong>WhatsApp:</strong> {WA_NUMBER.replace("+55 ", "")} &middot; {" "}
                  <a className="underline" href={WA_LINK()} target="_blank" rel="noreferrer">
                    Iniciar conversa
                  </a>
                </li>
                <li>
                  <strong>Email:</strong> contato@nobile.design
                </li>
                <li>
                  <strong>Local:</strong> São Paulo – Centro
                </li>
                <li>
                  <strong>Horário:</strong> Seg–Sex, 9h às 19h
                </li>
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
              <iframe
                title="Mapa – São Paulo Centro"
                width="100%"
                height="300"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.808976203806!2d-46.635!3d-23.575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59b9c0b1a3fb%3A0x2c9d2!2sCentro%20Hist%C3%B3rico%20de%20S%C3%A3o%20Paulo!5e0!3m2!1spt-BR!2sbr!4v1714599999999"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="mt-20 border-t border-stone-800/70 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-stone-300 md:flex-row md:px-8">
          <div>
            © {year} Nobile | Design. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-6">
            <a href="#sobre" className="transition hover:text-stone-100">
              Sobre
            </a>
            <a href="#colecoes" className="transition hover:text-stone-100">
              Coleções
            </a>
            <a href="#contato" className="transition hover:text-stone-100">
              Contato
            </a>
          </div>
        </div>
      </footer>

      {/* Modal de detalhes */}
      <Modal open={modalOpen} onClose={closeModal} product={activeProduct} />
    </div>
  );
}

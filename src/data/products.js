export const productCategories = [
  {
    id: "abajures",
    name: "Abajures",
    slug: "abajures",
    headline: "Iluminação escultural para atmosferas acolhedoras",
    description:
      "Peças com hastes em metal escovado, cúpulas em tecidos nobres e detalhes em couro para compor ambientes com luz suave.",
    heroImage: "/assets/Abajures/Abajures%20(6).png",
    heroAlt: "Coleção de abajures contemporâneos sobre mesa lateral",
    seo: {
      title: "Abajures autorais Nobile Design",
      description:
        "Coleção de abajures esculturais com metais nobres e cúpulas em tecidos finos. Personalize dimensões e acabamentos sob medida.",
    },
    highlights: ["Base em metais nobres", "Cúpulas em tecidos importados", "Dimerização sob demanda"],
  },
  {
    id: "banquetas",
    name: "Banquetas",
    slug: "banquetas",
    headline: "Banquetas e bancos com proporções arquitetônicas",
    description:
      "Volumes estofados e estruturas em madeira maciça que equilibram conforto com presença cênica em cozinhas gourmet e áreas sociais.",
    heroImage: "/assets/Banquetas/Banquetas%20(6).png",
    heroAlt: "Banquetas altas com acabamento em madeira e couro",
    seo: {
      title: "Banquetas sob medida para cozinhas e bares",
      description:
        "Banquetas em madeira torneada, assentos estofados e opções de altura personalizada para bancadas residenciais ou corporativas.",
    },
    highlights: ["Altura sob medida", "Tecidos easy-clean", "Descanso de pés em metal"],
  },
  {
    id: "mesa-de-jantar",
    name: "Mesa de jantar",
    slug: "mesa-de-jantar",
    headline: "Mesas de jantar assinadas",
    description:
      "Tampas generosas em pedra, madeira ou vidro acidato com bases esculturais que valorizam encontros e experiências gastronômicas.",
    heroImage: "/assets/Mesa%20de%20jantar/Mesa%20de%20jantar%20(6).png",
    heroAlt: "Mesa de jantar redonda em pedra com cadeiras estofadas",
    seo: {
      title: "Mesas de jantar exclusivas",
      description:
        "Mesas de jantar redondas e retangulares com bases esculturais e tampas em pedra natural, madeira ou vidro especial.",
    },
    highlights: ["Até 12 lugares", "Bases esculturais", "Acabamentos premium"],
  },
  {
    id: "mesas-laterais",
    name: "Mesas laterais",
    slug: "mesas-laterais",
    headline: "Mesas de apoio que completam a composição",
    description:
      "Mesas laterais e aparadores com tampos em pedra, madeira e vidro fumê para complementar sofás e poltronas de alto padrão.",
    heroImage: "/assets/Mesas%20laterais/Mesas%20laterais%20(6).png",
    heroAlt: "Mesa lateral redonda em mármore claro",
    seo: {
      title: "Mesas laterais e aparadores de luxo",
      description:
        "Mesas laterais com tampos em mármore, vidro fumê e madeira natural. Ideais para áreas sociais contemporâneas.",
    },
    highlights: ["Pedras selecionadas", "Metais nobres", "Sob medida"],
  },
  {
    id: "sofas",
    name: "Sofás",
    slug: "sofas",
    headline: "Sofás modulares e esculturais",
    description:
      "Módulos generosos, costura alfaiataria e espumas de múltiplas densidades para criar ilhas de convivência sofisticadas.",
    heroImage: "/assets/Sofas/Sofas%20(6).png",
    heroAlt: "Sofá modular com estofado em bouclé claro",
    seo: {
      title: "Sofás de alto padrão Nobile",
      description:
        "Sofás modulares, chaises e sofás lineares com acabamento em bouclé, linho e couro natural para projetos exclusivos.",
    },
    highlights: ["Estrutura em madeira maciça", "Espuma de múltiplas densidades", "Bouclé europeu"],
  },
  {
    id: "cadeiras",
    name: "Cadeiras",
    slug: "cadeiras",
    headline: "Cadeiras e poltronas de jantar ergonômicas",
    description:
      "Cadeiras estofadas com costura aparente, base em madeira torneada e detalhes em metal para mesas de jantar icônicas.",
    heroImage: "/assets/cadeiras/cadeira%20(6).png",
    heroAlt: "Cadeiras estofadas com base em madeira",
    seo: {
      title: "Cadeiras sob medida para sala de jantar",
      description:
        "Cadeiras e poltronas de jantar com costura aparente, assento ergonômico e acabamentos premium.",
    },
    highlights: ["Espumas D33 + manta", "Tecidos aquaclean", "Base torneada"],
  },
  {
    id: "mesas",
    name: "Mesas de centro",
    slug: "mesas",
    headline: "Mesas de centro escultóricas",
    description:
      "Peças centrais com tampos orgânicos e materiais contrastantes que criam movimento nas salas de estar.",
    heroImage: "/assets/mesas/Mesa%20(6).png",
    heroAlt: "Mesa de centro orgânica com tampo em pedra",
    seo: {
      title: "Mesas de centro exclusivas",
      description:
        "Mesas de centro ovais e orgânicas com tampos em pedra natural, madeira e vidro fumê combinados.",
    },
    highlights: ["Tampas orgânicas", "Mix de materiais", "Acabamentos contrastantes"],
  },
  {
    id: "poltronas",
    name: "Poltronas",
    slug: "poltronas",
    headline: "Poltronas de leitura e lounge",
    description:
      "Poltronas envolventes com opções de base giratória e costura capitonê para áreas íntimas e lounges corporativos.",
    heroImage: "/assets/poltronas/Poltronas%20(6).png",
    heroAlt: "Poltrona estofada em veludo",
    seo: {
      title: "Poltronas exclusivas para living e suíte",
      description:
        "Poltronas e chaises com base giratória, braços orgânicos e costura capitonê para composições autorais.",
    },
    highlights: ["Estrutura leve", "Opção giratória", "Tecidos premium"],
  },
];

export const products = [
  {
    id: "lumina-brass",
    categoryId: "abajures",
    name: "Lumina Brass",
    summary: "Abajur com base em latão escovado e cúpula em linho europeu.",
    description:
      "A peça combina estrutura esguia em latão escovado com cúpula em linho italiano, proporcionando iluminação difusa para mesas de apoio e aparadores.",
    media: [
      { src: "/assets/Abajures/Abajures%20(3).png", alt: "Abajur Lumina Brass sobre aparador" },
      { src: "/assets/Abajures/Abajures%20(4).png", alt: "Detalhe da cúpula em linho do abajur" },
    ],
    specs: {
      designer: "Studio Nobile",
      dimensions: "L 32 cm x P 32 cm x A 58 cm",
      materials: ["Latão escovado", "Linho italiano", "Detalhes em couro"],
      finishOptions: ["Latão escovado", "Níquel escovado", "Preto ônix"],
      lightSource: "LED dimerizável 2700K",
      leadTime: "20 dias úteis",
      warranty: "2 anos",
    },
  },
  {
    id: "aurora-marble",
    categoryId: "abajures",
    name: "Aurora Marble",
    summary: "Abajur com base em mármore travertino e difusor em vidro soprado.",
    description:
      "Combinação de materiais naturais que valoriza aparadores e mesas laterais, com iluminação suave através do vidro soprado acidato.",
    media: [
      { src: "/assets/Abajures/Abajures%20(5).png", alt: "Abajur Aurora Marble em composição com livros" },
      { src: "/assets/Abajures/Abajures%20(2).png", alt: "Detalhe da base em mármore travertino" },
    ],
    specs: {
      designer: "Atelier Lumière",
      dimensions: "Ø 28 cm x A 52 cm",
      materials: ["Mármore travertino", "Vidro soprado", "Metal escovado"],
      finishOptions: ["Travertino clássico", "Mármore noir", "Mármore branco"],
      lightSource: "LED 8W 3000K",
      leadTime: "25 dias úteis",
      warranty: "2 anos",
    },
  },
  {
    id: "atelier-bar",
    categoryId: "banquetas",
    name: "Atelier Bar",
    summary: "Banqueta com estrutura em madeira maciça e assento em couro natural.",
    description:
      "Estofamento com espuma de alta densidade, apoio para os pés em metal e costura aparente inspirada em selaria premium.",
    media: [
      { src: "/assets/Banquetas/Banquetas%20(4).png", alt: "Banqueta Atelier Bar em bancada gourmet" },
      { src: "/assets/Banquetas/Banquetas%20(2).png", alt: "Detalhe do assento em couro" },
    ],
    specs: {
      designer: "Studio Nobile",
      dimensions: "L 46 cm x P 50 cm x A 92 cm",
      materials: ["Freijó maciço", "Couro natural", "Aço inox escovado"],
      finishOptions: ["Freijó natural", "Nogueira", "Ébano"],
      leadTime: "30 dias úteis",
      warranty: "5 anos",
      customization: ["Altura sob medida", "Tecidos especiais", "Detalhes em metal"],
    },
  },
  {
    id: "luna-counter",
    categoryId: "banquetas",
    name: "Luna Counter",
    summary: "Banqueta estofada com encosto envolvente e base metálica.",
    description:
      "Ideal para bancadas gourmet e bares residenciais, a Luna Counter traz assento giratório e encosto com abas envolventes.",
    media: [
      { src: "/assets/Banquetas/Banquetas%20(5).png", alt: "Banqueta Luna Counter ao lado de ilha gourmet" },
      { src: "/assets/Banquetas/Banquetas%20(6).png", alt: "Detalhe da base metálica" },
    ],
    specs: {
      designer: "Estúdio Forma",
      dimensions: "L 54 cm x P 56 cm x A 95 cm",
      materials: ["Metal pintado", "Tecidos aquaclean", "Espuma D35"],
      finishOptions: ["Champagne", "Grafite", "Preto fosco"],
      leadTime: "28 dias úteis",
      warranty: "3 anos",
      customization: ["Base giratória", "Altura customizada"],
    },
  },
  {
    id: "atlas-round",
    categoryId: "mesa-de-jantar",
    name: "Atlas Round",
    summary: "Mesa de jantar redonda com base escultural em lâmina natural.",
    description:
      "Mesa redonda para 6 lugares com tampo em pedra quartzito e base revestida em lâmina natural, ideal para salas integradas.",
    media: [
      { src: "/assets/Mesa%20de%20jantar/Mesa%20de%20jantar%20(4).png", alt: "Mesa Atlas Round com cadeiras estofadas" },
      { src: "/assets/Mesa%20de%20jantar/Mesa%20de%20jantar%20(3).png", alt: "Detalhe da base escultural" },
    ],
    specs: {
      designer: "Atelier Forma",
      dimensions: "Ø 150 cm x A 76 cm",
      materials: ["Quartzito Mont Blanc", "Lâmina de nogueira", "Aço carbono"],
      finishOptions: ["Quartzito branco", "Granito escuro", "Lâmina de carvalho"],
      leadTime: "45 dias úteis",
      warranty: "5 anos",
      customization: ["Diâmetro sob medida", "Opção retangular"],
    },
  },
  {
    id: "linea-dining",
    categoryId: "mesa-de-jantar",
    name: "Linea Dining",
    summary: "Mesa de jantar retangular com tampo em vidro acidato.",
    description:
      "Design minimalista com base metálica em perfil delgado e tampo em vidro acidato para projetos contemporâneos.",
    media: [
      { src: "/assets/Mesa%20de%20jantar/Mesa%20de%20jantar%20(5).png", alt: "Mesa Linea Dining em ambiente minimalista" },
      { src: "/assets/Mesa%20de%20jantar/Mesa%20de%20jantar%20(2).png", alt: "Estrutura metálica da mesa Linea" },
    ],
    specs: {
      designer: "Studio Linear",
      dimensions: "L 240 cm x P 110 cm x A 76 cm",
      materials: ["Vidro acidato", "Aço carbono pintado", "Detalhes em latão"],
      finishOptions: ["Branco acetinado", "Fendi", "Grafite"],
      leadTime: "50 dias úteis",
      warranty: "5 anos",
    },
  },
  {
    id: "valen-side",
    categoryId: "mesas-laterais",
    name: "Valen Side",
    summary: "Mesa lateral com tampo em mármore e nicho oculto.",
    description:
      "A Valen Side traz tampo em mármore Calacatta, base cônica em madeira e nicho oculto para armazenamento discreto.",
    media: [
      { src: "/assets/Mesas%20laterais/Mesas%20laterais%20(2).png", alt: "Mesa lateral Valen ao lado de sofá" },
      { src: "/assets/Mesas%20laterais/Mesas%20laterais%20(5).png", alt: "Detalhe do tampo em mármore" },
    ],
    specs: {
      designer: "Studio Nobile",
      dimensions: "Ø 45 cm x A 55 cm",
      materials: ["Mármore Calacatta", "Freijó maciço"],
      finishOptions: ["Freijó natural", "Nogueira", "Preto matte"],
      leadTime: "25 dias úteis",
      warranty: "3 anos",
    },
  },
  {
    id: "orion-console",
    categoryId: "mesas-laterais",
    name: "Orion Console",
    summary: "Aparador com estrutura metálica e tampos em vidro fumê.",
    description:
      "Estrutura metálica com prateleiras em vidro fumê e opções de tampos em pedra natural para halls e livings sofisticados.",
    media: [
      { src: "/assets/Mesas%20laterais/Mesas%20laterais%20(3).png", alt: "Aparador Orion Console com decoração" },
      { src: "/assets/Mesas%20laterais/Mesas%20laterais%20(4).png", alt: "Detalhe da estrutura metálica" },
    ],
    specs: {
      designer: "Atelier Orion",
      dimensions: "L 160 cm x P 40 cm x A 78 cm",
      materials: ["Aço carbono", "Vidro fumê", "Pedra natural"],
      finishOptions: ["Champagne", "Grafite", "Preto fosco"],
      leadTime: "35 dias úteis",
      warranty: "4 anos",
    },
  },
  {
    id: "modulo-sofa",
    categoryId: "sofas",
    name: "Modulo 360",
    summary: "Sofá modular com encosto móvel e chaise integrada.",
    description:
      "Sistema modular com múltiplos encostos e chaise destacável para criar composições fluidas em ambientes integrados.",
    media: [
      { src: "/assets/Sofas/Sofas%20(4).png", alt: "Sofá modular Modulo 360 em living" },
      { src: "/assets/Sofas/Sofas%20(3).png", alt: "Detalhe do sofá modular" },
    ],
    specs: {
      designer: "Studio Orbit",
      dimensions: "Composição padrão 320 cm x 180 cm",
      materials: ["Estrutura em madeira de reflorestamento", "Espuma D33", "Tecido bouclé europeu"],
      finishOptions: ["Bouclé off-white", "Linho grafite", "Couro natural"],
      leadTime: "60 dias úteis",
      warranty: "5 anos",
      customization: ["Módulos adicionais", "Braços intercambiáveis"],
    },
  },
  {
    id: "heritage-sofa",
    categoryId: "sofas",
    name: "Heritage Sofa",
    summary: "Sofá linear com costura pespontada e pés em metal.",
    description:
      "Design inspirado em marcenaria italiana com costura pespontada, assento profundo e pés em metal em formato lâmina.",
    media: [
      { src: "/assets/Sofas/Sofas%20(2).png", alt: "Sofá Heritage com almofadas" },
      { src: "/assets/Sofas/Sofas%20(5).png", alt: "Detalhe do braço do sofá" },
    ],
    specs: {
      designer: "Atelier Heritage",
      dimensions: "L 260 cm x P 105 cm x A 72 cm",
      materials: ["Estrutura em madeira maciça", "Espumas HR", "Tecidos aquaclean"],
      finishOptions: ["Linho areia", "Veludo petróleo", "Couro caramelo"],
      leadTime: "55 dias úteis",
      warranty: "5 anos",
    },
  },
  {
    id: "vera-dining-chair",
    categoryId: "cadeiras",
    name: "Vera Dining",
    summary: "Cadeira de jantar com encosto curvo e pés torneados.",
    description:
      "Encosto envolvente com costura aparente e pés em madeira torneada, perfeita para mesas redondas ou retangulares.",
    media: [
      { src: "/assets/cadeiras/cadeira%20(4).png", alt: "Cadeira Vera Dining ao redor de mesa" },
      { src: "/assets/cadeiras/cadeira%20(5).png", alt: "Detalhe do encosto curvo" },
    ],
    specs: {
      designer: "Studio Vera",
      dimensions: "L 58 cm x P 58 cm x A 84 cm",
      materials: ["Madeira maciça", "Tecidos easy-clean", "Espuma D33"],
      finishOptions: ["Carvalho", "Ébano", "Freijó"],
      leadTime: "30 dias úteis",
      warranty: "3 anos",
    },
  },
  {
    id: "arca-armchair",
    categoryId: "cadeiras",
    name: "Arca Armchair",
    summary: "Poltrona de cabeceira com braços orgânicos.",
    description:
      "Poltrona compacta com braços orgânicos que funciona como cabeceira de mesa ou complemento em livings intimistas.",
    media: [
      { src: "/assets/cadeiras/cadeira%20(2).png", alt: "Poltrona Arca Armchair" },
      { src: "/assets/cadeiras/cadeira%20(3).png", alt: "Detalhe dos braços orgânicos" },
    ],
    specs: {
      designer: "Atelier Arca",
      dimensions: "L 62 cm x P 64 cm x A 82 cm",
      materials: ["Estrutura em jequitibá", "Tecidos acetinados", "Detalhes em latão"],
      finishOptions: ["Jequitibá", "Nogueira escura"],
      leadTime: "32 dias úteis",
      warranty: "3 anos",
    },
  },
  {
    id: "flux-coffee",
    categoryId: "mesas",
    name: "Flux Coffee",
    summary: "Mesa de centro orgânica com tampos sobrepostos.",
    description:
      "Dois tampos orgânicos em alturas diferentes que criam movimento ao centro da sala, combinando madeira e pedra natural.",
    media: [
      { src: "/assets/mesas/Mesa%20(5).png", alt: "Mesa de centro Flux em sala de estar" },
      { src: "/assets/mesas/Mesa%20(3).png", alt: "Detalhe do tampo em pedra" },
    ],
    specs: {
      designer: "Studio Flux",
      dimensions: "L 140 cm x P 90 cm x A 32/38 cm",
      materials: ["Freijó", "Quartzito", "Metal pintado"],
      finishOptions: ["Mármore branco", "Mármore escuro", "Granilite"],
      leadTime: "35 dias úteis",
      warranty: "4 anos",
    },
  },
  {
    id: "ellipse-table",
    categoryId: "mesas",
    name: "Ellipse Table",
    summary: "Mesa de centro elíptica com tampo em vidro fumê.",
    description:
      "Base vazada em metal com tampo elíptico em vidro fumê e prateleira inferior em madeira natural.",
    media: [
      { src: "/assets/mesas/Mesa%20(2).png", alt: "Mesa de centro Ellipse em frente ao sofá" },
      { src: "/assets/mesas/Mesa%20(4).png", alt: "Detalhe da base vazada" },
    ],
    specs: {
      designer: "Atelier Curve",
      dimensions: "L 130 cm x P 70 cm x A 34 cm",
      materials: ["Aço carbono", "Vidro fumê", "Lâmina natural"],
      finishOptions: ["Latão escovado", "Preto ônix", "Niquelado"],
      leadTime: "30 dias úteis",
      warranty: "3 anos",
    },
  },
  {
    id: "lounge-arc",
    categoryId: "poltronas",
    name: "Lounge Arc",
    summary: "Poltrona com base giratória e encosto em arco.",
    description:
      "Poltrona envolvente com base giratória oculta e encosto em arco contínuo, ideal para lounges e salas de leitura.",
    media: [
      { src: "/assets/poltronas/Poltronas%20(5).png", alt: "Poltrona Lounge Arc em ambiente moderno" },
      { src: "/assets/poltronas/Poltronas%20(4).png", alt: "Detalhe do encosto da poltrona" },
    ],
    specs: {
      designer: "Studio Arc",
      dimensions: "L 90 cm x P 88 cm x A 82 cm",
      materials: ["Estrutura metálica", "Espumas soft", "Tecidos acetinados"],
      finishOptions: ["Veludo sálvia", "Bouclé caramelo", "Linho grafite"],
      leadTime: "40 dias úteis",
      warranty: "4 anos",
      customization: ["Base fixa", "Rotação 360º"],
    },
  },
  {
    id: "muse-chaise",
    categoryId: "poltronas",
    name: "Muse Chaise",
    summary: "Chaise longue com costura canaletada e apoio lombar.",
    description:
      "Chaise com estofamento canaletado e apoio lombar destacável para suítes master e espaços de relaxamento.",
    media: [
      { src: "/assets/poltronas/Poltronas%20(2).png", alt: "Chaise Muse em ambiente íntimo" },
      { src: "/assets/poltronas/Poltronas%20(3).png", alt: "Detalhe da costura canaletada" },
    ],
    specs: {
      designer: "Atelier Muse",
      dimensions: "L 78 cm x P 160 cm x A 82 cm",
      materials: ["Estrutura em madeira", "Espuma visco", "Tecidos premium"],
      finishOptions: ["Veludo nude", "Veludo grafite", "Linho gelo"],
      leadTime: "45 dias úteis",
      warranty: "4 anos",
    },
  },
];

// Este arquivo permanece apenas como fonte de dados para o script de seed do backend.

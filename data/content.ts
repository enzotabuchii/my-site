// Todo o texto do site mora aqui. Edite à vontade.

export const perfil = {
  nome: ["Enzo", "Seiji", "Delgado", "Tabuchi"],
  nomeCompleto: "Enzo Seiji Delgado Tabuchi",
  resumo:
    "Desenvolvedor back-end e estudante de Ciência da Computação na FIAP. Gosto de software que mexe coisas no mundo real.",
  cargo: "Analista de TI Jr",
  empresa: "Instituto J&F",
  cidade: "São Paulo",
  github: "enzotabuchii",
  // Foto do perfil do GitHub.
  foto: "https://avatars.githubusercontent.com/u/158285125?v=4",
};

export const sobre = [
  "Trabalho como Analista de TI Jr no Instituto J&F, construindo e mantendo APIs e serviços de back-end. No dia a dia isso quer dizer Node.js, NestJS e TypeScript, conversando com MySQL, SQL Server e PostgreSQL.",
  "Na FIAP, curso o bacharelado em Ciência da Computação e aproveito os Challenges para liderar times e testar ideias com empresas de verdade. Fora da tela, o que me puxa é robótica e automação: Arduino, visão computacional e sistemas que tomam decisões sozinhos.",
];

export const stack: { grupo: string; itens: string[] }[] = [
  { grupo: "Linguagens", itens: ["TypeScript", "JavaScript", "Java", "Python", "C++"] },
  { grupo: "Back-end", itens: ["Node.js", "NestJS", "Spring Boot", "GraphQL", "Prisma"] },
  { grupo: "Dados", itens: ["PostgreSQL", "MySQL", "SQL Server", "MongoDB", "Redis", "Firebase"] },
  { grupo: "Infra", itens: ["Docker", "Linux", "AWS", "Azure", "GCP"] },
  { grupo: "Front-end", itens: ["React", "Next.js", "HTML", "CSS"] },
  { grupo: "Robótica e IA", itens: ["Arduino", "OpenCV", "Scikit-Learn", "Ollama"] },
];

// Linha do tempo, da mais recente para a mais antiga.
// Complete com as experiências do seu LinkedIn.
export const carreira = [
  {
    quando: "Hoje",
    titulo: "Analista de TI Jr, back-end",
    onde: "Instituto J&F",
    texto: "APIs e serviços de back-end com NestJS, integrados a bancos MySQL, SQL Server e PostgreSQL.",
  },
  {
    quando: "Finalizado em 2026",
    titulo: "Líder do time 'Vencedores do Next'",
    onde: "FIAP Challenge com a GoodWe",
    texto: "Liderança do grupo de cinco pessoas, o projeto não foi o vencedor, mas aprendi muito com a experiência.",
  },
  {
    quando: "Em curso",
    titulo: "Bacharelado em Ciência da Computação",
    onde: "FIAP",
    texto: "Estruturas de dados, machine learning, computação aplicada e engenharia de software.",
  },
];

export const projetos: { nome: string; papel: string; texto: string; tags: string[]; url: string }[] = [
  {
    nome: "GoodWe Challenge | 2026",
    papel: "Líder, back-end e IA",
    texto:
      "Plataforma FIAP Challenge com a GoodWe, fabricante de inversores solares. API com as regras de negócio, interface web e app, tudo em TypeScript.",
    tags: ["TypeScript", "NestJS", "IA"],
    url: "https://github.com/vencedoresdonext/vencedoresdonext",
  },
  {
    nome: "Mission Control AI, ORBIMESH",
    papel: "Projeto da Global Solution",
    texto:
      "Monitora a telemetria de uma missão espacial simulada, dispara alertas e pede a um Llama 3.2 rodando local uma análise do que está dando errado.",
    tags: ["Python", "Ollama", "LLM"],
    url: "https://github.com/enzotabuchii/GS1-IA-FIAP",
  },
  {
    nome: "Visão computacional com OpenCV",
    papel: "Estudo",
    texto: "Detecção e processamento de imagens: o primeiro passo para dar olhos a um robô.",
    tags: ["Python", "OpenCV"],
    url: "https://github.com/enzotabuchii/alura-visao-computacional-opencv",
  },
];

// Mostradas no modo Portugal
export const curiosidadesPortugal = [
  "A freguesia de Madalena do Mar foi fundada por Henrique Alemão, que na verdade seria Ladislau III, o Rei da Polónia. Após sobreviver à Batalha de Varna (1444), ele terá fugido e escondido a sua identidade, recebendo terras do descobridor João Gonçalves Zarco.",
  "Ao norte de Portugal, A Aldeia Nova do Barroso não nasceu organicamente. Ela foi planeada e construída de raiz em 1944 pela Junta de Colonização Interna de Salazar. O objetivo era povoar os terrenos baldios de Trás-os-Montes e criar casais agrícolas sustentáveis.",
  "Em 1566, quando piratas e corsários franceses atacaram e saquearam violentamente a cidade do Funchal, as freiras do Convento de Santa Clara fugiram para o interior da ilha. Encontraram neste vale profundo e isolado um esconderijo perfeito, invisível a partir do mar, o Curral das Freiras.",
  "A ilha do Corvo no arquipélago de Açores, embora faça parte do território português e europeu, o Corvo assenta sobre a Placa Tectónica Americana, o que significa que se move milímetros por ano em direção oposta ao continente europeu.",
  "É muito comum ver flamingos na Ria de Aveiro. No entanto, uma curiosidade biológica local é que muitos deles são brancos ou muito claros, e não rosados. Isso acontece porque a dieta deles na ria é menos rica em pequenos crustáceos com betacaroteno.",
];

// ============================================================================
// Conteúdo do site (PT / EN). Edite aqui textos, experiências, áreas e artigos.
// ============================================================================

// Textos fixos da interface. Chaves usadas em data-i18n / data-i18n-html.
const STRINGS = {
  pt: {
    "meta.title": "Portfólio - Rubens Abraão",
    "meta.description": "Rubens Abraão — mestrando em Ciência da Computação e pesquisador pela UECE. Engenharia de Software, qualidade e P&D com a indústria.",
    "nav.open": "Abrir menu",
    "nav.close": "Fechar menu",
    "nav.experience": "Experiência",
    "nav.research": "Pesquisa",
    "nav.publications": "Artigos e publicações",
    "nav.events": "Eventos e palestras",
    "nav.contact": "Contato",
    "lang.label": "Idioma",
    "hero.photo": "Foto de Rubens Abraão",
    "hero.title": "Olá! Sou <strong>Rubens Abraão,</strong> mestrando em <span class=\"hero__accent\"><strong>Ciência da Computação e pesquisador</strong> pela <strong>UECE</strong>.</span>",
    "hero.cta": "Entrar em contato",
    "hero.ctaText": "Sinta-se livre para explorar meu portifólio e entrar em contato, adoraria me conectar com você!",
    "reading.tag": "Leitura atual",
    "reading.cover": "Capa de Lord of Mysteries",
    "listening.tag": "O que estou ouvindo",
    "listening.cover": "Capa do álbum",
    "listening.external": "YouTube Music ↗",
    "player.play": "Tocar",
    "player.pause": "Pausar",
    "player.prev": "Música anterior",
    "player.next": "Próxima música",
    "player.mute": "Silenciar",
    "player.seek": "Progresso da música",
    "player.hint": "Clique em qualquer lugar da página para ouvir",
    "labs.title": "LABS &amp; PARCEIROS",
    "exp.academic": "Experiência Acadêmica",
    "exp.technical": "Experiência Técnica",
    "exp.open": "Ver detalhes",
    "research.tag": "Minhas linhas de pesquisa",
    "research.tabs": "Áreas de pesquisa",
    "research.area": "Área",
    "pubs.tag": "Artigos e publicações",
    "pubs.journals": "Periódicos",
    "pubs.conferences": "Artigos de conferência e trabalhos completos",
    "pubs.preprints": "Pre-prints",
    "pubs.datasets": "Dados de pesquisa",
    "pubs.full": "Ver completo",
    "pubs.more": "Ver mais",
    "pubs.less": "Ver menos",
    "pubs.filter": "Filtrar por ano",
    "pubs.all": "Todos",
    "pubs.empty": "Nenhum trabalho neste ano.",
    "pubs.full.data": "Ver dados",
    "pubs.loading": "Carregando publicações…",
    "pubs.error": "Não foi possível carregar as publicações agora.",
    "pubs.updated": "Atualizado automaticamente via ORCID e OpenAlex em {date}.",
    "events.tag": "Eventos e palestras",
    "events.prev": "Eventos anteriores",
    "events.next": "Próximos eventos",
    "contact.tag": "Informações de contato",
    "contact.email": "E-mail",
    "partners.title": "ONDE JÁ ATUEI COM P&amp;D",
    "footer.contact": "Contato",
    "footer.privacy": "Política de privacidade",
    "footer.top": "Voltar ao topo",
    "modal.close": "Fechar",
  },
  en: {
    "meta.title": "Portfolio - Rubens Abraão",
    "meta.description": "Rubens Abraão — Computer Science master's student and researcher at UECE. Software Engineering, quality and industry R&D.",
    "nav.open": "Open menu",
    "nav.close": "Close menu",
    "nav.experience": "Experience",
    "nav.research": "Research",
    "nav.publications": "Papers and publications",
    "nav.events": "Events and talks",
    "nav.contact": "Contact",
    "lang.label": "Language",
    "hero.photo": "Photo of Rubens Abraão",
    "hero.title": "Hi! I'm <strong>Rubens Abraão,</strong> a master's student in <span class=\"hero__accent\"><strong>Computer Science and researcher</strong> at <strong>UECE</strong>.</span>",
    "hero.cta": "Get in touch",
    "hero.ctaText": "Feel free to explore my portfolio and reach out, I'd love to connect with you!",
    "reading.tag": "Currently reading",
    "reading.cover": "Lord of Mysteries cover",
    "listening.tag": "What I'm listening to",
    "listening.cover": "Album cover",
    "listening.external": "YouTube Music ↗",
    "player.play": "Play",
    "player.pause": "Pause",
    "player.prev": "Previous song",
    "player.next": "Next song",
    "player.mute": "Mute",
    "player.seek": "Song progress",
    "player.hint": "Click anywhere on the page to listen",
    "labs.title": "LABS &amp; PARTNERS",
    "exp.academic": "Academic Experience",
    "exp.technical": "Technical Experience",
    "exp.open": "See details",
    "research.tag": "My research lines",
    "research.tabs": "Research areas",
    "research.area": "Area",
    "pubs.tag": "Papers and publications",
    "pubs.journals": "Journal articles",
    "pubs.conferences": "Conference papers and full papers",
    "pubs.preprints": "Preprints",
    "pubs.datasets": "Research data",
    "pubs.full": "Read full",
    "pubs.more": "See more",
    "pubs.less": "See less",
    "pubs.filter": "Filter by year",
    "pubs.all": "All",
    "pubs.empty": "No works in this year.",
    "pubs.full.data": "View data",
    "pubs.loading": "Loading publications…",
    "pubs.error": "Publications could not be loaded right now.",
    "pubs.updated": "Automatically updated from ORCID and OpenAlex on {date}.",
    "events.tag": "Events and talks",
    "events.prev": "Previous events",
    "events.next": "Next events",
    "contact.tag": "Contact information",
    "contact.email": "E-mail",
    "partners.title": "WHERE I'VE WORKED ON R&amp;D",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy policy",
    "footer.top": "Back to top",
    "modal.close": "Close",
  },
};

// Playlist do card "O que estou ouvindo" (toca no próprio site via player do YouTube)
const PLAYLIST_URL = "https://music.youtube.com/playlist?list=PLQObP1XwevdI";

// Frases do topo: alternam a cada 5 segundos
const BIO = [
  {
    pt: "Sou engenheiro de qualidade, especializado em processos, automação e inovação, com visão voltada à qualidade do software e ao cliente.",
    en: "I'm a quality engineer specializing in processes, automation and innovation, focused on software quality and the customer.",
  },
  {
    pt: "Sou pesquisador na área de engenharia de software, trazendo inovação de ponta para a realidade da indústria.",
    en: "I'm a software engineering researcher, bringing cutting-edge innovation into the reality of industry.",
  },
  {
    pt: "Sou um amante da cultura geek e do Psyduck.",
    en: "I'm a lover of geek culture and Psyduck.",
  },
];
const BIO_INTERVAL = 5000;

// Linhas de pesquisa (abas "Área 01–06"). Use <strong> para destacar trechos.
const AREAS = [
  {
    title: { pt: "Segurança Centrada no Humano", en: "Human-Centered Security" },
    text: {
      pt: "Investigar como <strong>conhecimentos, comportamentos e condições organizacionais</strong> influenciam a <strong>adoção de práticas de segurança</strong> no ciclo de desenvolvimento de software. Propor abordagens que apoiem decisões e integrem a segurança ao trabalho das pessoas.",
      en: "Investigating how <strong>knowledge, behaviors and organizational conditions</strong> influence the <strong>adoption of security practices</strong> across the software development lifecycle. Proposing approaches that support decision-making and integrate security into people's work.",
    },
  },
  {
    title: { pt: "Fatores Humanos em Engenharia de Software", en: "Human Factors in Software Engineering" },
    text: {
      pt: "Investigar <strong>aspectos cognitivos, sociais e organizacionais</strong> do trabalho em software, incluindo <strong>carga cognitiva, colaboração, bem-estar e produtividade</strong>. Avaliar a adaptação de processos às pessoas e os efeitos da interação com ferramentas e agentes de IA.",
      en: "Investigating the <strong>cognitive, social and organizational aspects</strong> of software work, including <strong>cognitive load, collaboration, well-being and productivity</strong>. Evaluating how processes adapt to people and the effects of interacting with AI tools and agents.",
    },
  },
  {
    title: { pt: "Testes de Software", en: "Software Testing" },
    text: {
      pt: "Desenvolver e avaliar <strong>abordagens apoiadas por IA</strong> para <strong>geração, priorização, execução e análise de testes</strong>. Investigar seus efeitos sobre cobertura, detecção de defeitos e eficiência, considerando riscos, requisitos de negócio e limites da automação.",
      en: "Developing and evaluating <strong>AI-supported approaches</strong> for <strong>test generation, prioritization, execution and analysis</strong>. Investigating their effects on coverage, defect detection and efficiency, considering risks, business requirements and the limits of automation.",
    },
  },
  {
    title: { pt: "Engenharia de Software", en: "Software Engineering" },
    text: {
      pt: "Investigar e aperfeiçoar <strong>métodos, processos e arquiteturas</strong> para especificação, desenvolvimento, manutenção e evolução de software. Avaliar sua <strong>adequação às necessidades organizacionais</strong>, considerando requisitos, custos, riscos e sustentabilidade técnica.",
      en: "Investigating and improving <strong>methods, processes and architectures</strong> for software specification, development, maintenance and evolution. Evaluating their <strong>fit to organizational needs</strong>, considering requirements, costs, risks and technical sustainability.",
    },
  },
  {
    title: { pt: "Qualidade de Software", en: "Software Quality" },
    text: {
      pt: "Investigar <strong>atributos, métricas e práticas de garantia da qualidade</strong> de produtos, processos e artefatos de software. Desenvolver abordagens para avaliar conformidade, confiabilidade e adequação ao uso, incluindo <strong>artefatos produzidos por IA e sua revisão humana</strong>.",
      en: "Investigating <strong>attributes, metrics and quality assurance practices</strong> for software products, processes and artifacts. Developing approaches to assess conformance, reliability and fitness for use, including <strong>AI-generated artifacts and their human review</strong>.",
    },
  },
  {
    title: { pt: "Engenharia de Software Apoiada por IA", en: "AI-Assisted Software Engineering" },
    text: {
      pt: "Investigar o <strong>uso e a orquestração de modelos de IA e agentes</strong> no ciclo de desenvolvimento de software. Propor e avaliar <strong>métodos de colaboração humano–IA</strong>, considerando autonomia, supervisão, rastreabilidade e efeitos sobre processos e resultados.",
      en: "Investigating the <strong>use and orchestration of AI models and agents</strong> across the software development lifecycle. Proposing and evaluating <strong>human–AI collaboration methods</strong>, considering autonomy, oversight, traceability and effects on processes and outcomes.",
    },
  },
];

// Experiências. past: aparece esmaecida (a mais antiga já encerrada).
// inCard: false = só aparece no pop-up. desc: texto exibido ao expandir no pop-up.
const EXPERIENCES = {
  academic: [
    {
      title: { pt: "Pesquisador em Engenharia de Software - GESAD", en: "Software Engineering Researcher - GESAD" },
      meta: { pt: "GESAD (mar 2025 - atual)", en: "GESAD (Mar 2025 - present)" },
      desc: {
        pt: "GESAD - Grupo de Engenharia de Software e Sistemas Distribuídos · Meio período · Fortaleza, Ceará, Brasil · Presencial.",
        en: "GESAD - Software Engineering and Distributed Systems Group · Part-time · Fortaleza, Ceará, Brazil · On-site.",
      },
    },
  ],
  technical: [
    {
      title: { pt: "Tech Lead de Desenvolvimento de Software - LAMPI", en: "Software Development Tech Lead - LAMPI" },
      meta: { pt: "nov 2019 - atual", en: "Nov 2019 - present" },
      desc: {
        pt: "LAMPI - IFCE · Meio período · Canindé, Ceará, Brasil · Presencial.",
        en: "LAMPI - IFCE · Part-time · Canindé, Ceará, Brazil · On-site.",
      },
    },
    {
      title: { pt: "Tech Lead - QA Engineer - DARM Group", en: "Tech Lead - QA Engineer - DARM Group" },
      meta: { pt: "out 2022 - jun 2025", en: "Oct 2022 - Jun 2025" },
      desc: {
        pt: "Coordenação da equipe, orientando o time nas melhores práticas de garantia da qualidade; adequação dos processos de qualidade e testagem; elaboração de estratégias de testes. Fortaleza e Região · Híbrido.",
        en: "Led the team, guiding it on quality assurance best practices; adapted quality and testing processes; designed test strategies. Fortaleza area · Hybrid.",
      },
    },
    {
      title: { pt: "Head of Quality Software Engineering - DARM Group", en: "Head of Quality Software Engineering - DARM Group" },
      meta: { pt: "nov 2024 - fev 2026", en: "Nov 2024 - Feb 2026" },
      desc: {
        pt: "Responsável por liderar de forma integrada os times de requisitos e testes, com foco na evolução contínua da qualidade do software, desde a concepção até a entrega. Canindé, Ceará · Remoto.",
        en: "Led the requirements and testing teams in an integrated way, focused on continuously improving software quality from conception to delivery. Canindé, Ceará · Remote.",
      },
    },
  ],
};

// Artigos e publicações: carregados de data/publications.json, que é atualizado
// automaticamente (ORCID + OpenAlex). Ajustes manuais: data/publications-overrides.json

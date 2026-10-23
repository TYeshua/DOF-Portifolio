// Todo o conteúdo do portfólio fica aqui. Para atualizar textos, links ou
// projetos, edite apenas este arquivo.

export const perfil = {
  nome: 'Thiago Yeshua',
  nomeCompleto: 'Thiago Yeshua Damasceno Ferreira',
  iniciais: 'TY',
  curso: 'Engenharia de Exploração e Produção de Petróleo · UFPA',
  chamada:
    'Desenvolvo software e modelos de dados para perfuração e E&P. Meu foco é Digital Oilfield: levar o cálculo de engenharia da planilha para sistemas confiáveis.',
  vinculos: [
    'Pesquisador de Iniciação Científica · LAFI/UFPA',
    'Diretor de Tecnologia · SPE UFPA Student Chapter',
    'Graduando em Engenharia de Software · Unicesumar',
  ],
  disponibilidade: 'Aberto a estágio · presencial, remoto ou com mudança',
  cidade: 'Salinópolis, PA',
  email: 'thiagoyeshua01@gmail.com',
  telefone: '+55 91 99132-6639',
  telefoneE164: '+5591991326639',
  // Mensagem pronta do WhatsApp. A de QR vale para quem escaneou o código impresso
  // (link com ?origem=qr); a outra, para quem chegou pelo LinkedIn ou por um link repassado.
  whatsappMsg: 'Olá, Thiago! Vi seu portfólio e gostaria de conversar.',
  whatsappMsgQr: 'Olá, Thiago! Vi seu portfólio no congresso e gostaria de conversar.',
  links: {
    linkedin: 'https://www.linkedin.com/in/thiagoyeshua',
    lattes: 'http://lattes.cnpq.br/7788480032641561',
    orcid: 'https://orcid.org/0009-0005-4137-7052',
  },
  atualizado: 'out/2026',
}

export const destaques = [
  { valor: 'INPI', rotulo: 'Software registrado', detalhe: 'SIGMA, 2025' },
  { valor: '1º autor', rotulo: 'Trabalho completo', detalhe: '12º PDPetro, 2024' },
  { valor: '2', rotulo: 'Graduações', detalhe: 'Petróleo + Software' },
]

export type Demo = 'poco' | 'geoquimica'

export type Projeto = {
  id: string
  titulo: string
  periodo: string
  papel: string
  status: 'Em andamento' | 'Concluído' | 'Registrado' | 'Em preparação'
  resumo: string
  tags: string[]
  demo?: Demo
  extra?: string
}

export const projetos: Projeto[] = [
  {
    id: 'simulador',
    titulo: 'Simulador web hidráulico-volumétrico para perfuração offshore',
    periodo: '2026 – atual',
    papel: 'Desenvolvedor · bolsista PIBIC/UFPA',
    status: 'Em andamento',
    resumo:
      'Substitui planilhas legadas nos cálculos de controle de poço e limpeza do poço: capacidades, volume anular, tempo de circulação e deslocamento de fluidos, com validação de dados.',
    tags: ['Python', 'FastAPI', 'React', 'TypeScript'],
    demo: 'poco',
  },
  {
    id: 'sigma',
    titulo: 'SIGMA · Sistema Inteligente de Geoquímica e Maturidade',
    periodo: '2025',
    papel: 'Coautor com o Prof. Dr. Thiago Rafael da Silva Moura',
    status: 'Registrado',
    resumo:
      'Programa de computador com aprendizado de máquina que avalia o potencial gerador e a maturidade térmica de rochas geradoras a partir de COT e pirólise Rock-Eval.',
    tags: ['Machine learning', 'Geoquímica orgânica', 'Python', 'TypeScript'],
    extra: 'Registro INPI BR512026001049-7 · titular UFPA',
    demo: 'geoquimica',
  },
  {
    id: 'adoue',
    titulo: 'Reconstrução de COT e S2 ao longo do poço Adoue 1H',
    periodo: '2025 – 2026',
    papel: 'Primeiro autor',
    status: 'Em preparação',
    resumo:
      'Estima COT e S2 de forma contínua no intervalo Cline (Bacia Midland) combinando testemunho, perfis geofísicos e ED-XRF, com ExtraTrees e validação cruzada em blocos de profundidade.',
    tags: ['scikit-learn', 'Perfis de poço', 'ED-XRF'],
  },
  {
    id: 'anp',
    titulo: 'Dados petrofísicos de bacias brasileiras (ANP)',
    periodo: '2024 – 2026',
    papel: 'Bolsista de Iniciação Científica',
    status: 'Concluído',
    resumo:
      'Coleta, limpeza e análise exploratória de dados públicos da ANP, com dashboards em Power BI para apoiar decisões de exploração e avaliação de formações.',
    tags: ['pandas', 'Power BI', 'Análise exploratória'],
  },
  {
    id: 'twin',
    titulo: 'Plataforma Offshore Twin AI',
    periodo: '2026 – atual',
    papel: 'Integrante da equipe',
    status: 'Em andamento',
    resumo:
      'Gêmeos digitais para ativos offshore: monitoramento em tempo real, manutenção preditiva e detecção de anomalias com IA híbrida e redes neurais informadas pela física.',
    tags: ['Gêmeo digital', 'Edge computing', 'PINNs'],
  },
]

// Projetos pessoais: feitos por conta própria, sem vínculo com bolsas.
// As telas ficam em src/assets/prints (nome.webp = tela cheia, nome-p.webp = miniatura).
export type Tela = { arquivo: string; legenda: string; formato: 'desktop' | 'celular' }
export type ProjetoPessoal = {
  id: string
  titulo: string
  curto: string
  subtitulo: string
  ano: string
  area: 'Óleo e gás' | 'Energia' | 'Software'
  resumo: string
  pontos: string[]
  numeros?: { valor: string; rotulo: string }[]
  tags: string[]
  telas: Tela[]
  nota?: string
}

export const projetosPessoais: ProjetoPessoal[] = [
  {
    id: 'volve',
    curto: 'Produção',
    titulo: 'Monitoramento e previsão de produção',
    subtitulo: 'Dados reais do campo Volve (Equinor): previsão, sensores virtuais e alertas',
    ano: '2026',
    area: 'Óleo e gás',
    resumo:
      'Usa a base de produção aberta pela Equinor (8,5 anos, 7 poços) para reproduzir a operação dia a dia, vigiar os poços por exceção e estimar por software o que os sensores não mediram.',
    pontos: [
      'Replay da operação via WebSocket, com semáforo por poço',
      'Medidor virtual de vazão e sensor virtual de pressão de fundo',
      'Previsão de produção: curvas de Arps, XGBoost e a combinação dos dois',
    ],
    numeros: [
      { valor: '8 %', rotulo: 'erro do medidor virtual de líquido' },
      { valor: '9 bar', rotulo: 'erro da pressão reconstruída' },
      { valor: '264', rotulo: 'eventos detectados em 8,5 anos' },
    ],
    tags: ['Python', 'XGBoost', 'FastAPI', 'WebSocket', 'React'],
    telas: [
      { arquivo: 'volve-sala', legenda: 'Sala de controle: replay da operação e linha do tempo do campo', formato: 'desktop' },
      { arquivo: 'volve-sensores', legenda: 'Sensores virtuais: erro do medidor em três formas de validação', formato: 'desktop' },
      { arquivo: 'volve-sala-celular', legenda: 'A mesma sala de controle no celular', formato: 'celular' },
    ],
    nota: 'Dados: Equinor ASA e parceiros da licença Volve (Equinor Open Data Licence).',
  },
  {
    id: 'petra',
    curto: 'Blowout',
    titulo: 'Alerta de blowout em tempo real',
    subtitulo: 'Dados públicos 3W da Petrobras e sensores físicos com Arduino',
    ano: '2026',
    area: 'Óleo e gás',
    resumo:
      'Reproduz eventos reais da base pública 3W da Petrobras e calcula um índice de risco em tempo real. Também recebe sensores físicos por Arduino, em modo hardware-in-the-loop.',
    pontos: [
      'Pressão de fundo (PDG), temperatura e vazão de gas lift ao vivo',
      'Registro de anomalias com tempo estimado até o colapso',
      'Camada de IA híbrida (XGBoost + MLP) em treinamento',
    ],
    tags: ['3W Petrobras', 'Arduino', 'FastAPI', 'Three.js', 'React'],
    telas: [
      { arquivo: 'petra-twin-poco', legenda: 'Coluna de perfuração em 3D e índice de risco', formato: 'desktop' },
      { arquivo: 'petra-twin-telemetria', legenda: 'Telemetria do poço e registro de anomalias', formato: 'desktop' },
    ],
  },
  {
    id: 'beta',
    curto: 'Poço e custos',
    titulo: 'Projeto de poço e custos de perfuração',
    subtitulo: 'Dimensionamento das fases, poço em 3D e estimativa de custos',
    ano: '2026',
    area: 'Óleo e gás',
    resumo:
      'Dimensiona as fases de um poço (revestimentos, cimentação, fatores de segurança à tração e ao colapso) e estima custos de sonda, aço, brocas e fluido, com relatório em PDF.',
    pontos: [
      'Poço telescópico em 3D, fase por fase',
      'Custos convertidos de dólar para real com câmbio do dia',
      'Memorial descritivo dos cálculos',
    ],
    tags: ['Python', 'FastAPI', 'React', 'Three.js', 'PDF'],
    telas: [
      { arquivo: 'beta-poco-3d', legenda: 'Poço em 3D com fatores de segurança de cada fase', formato: 'desktop' },
      { arquivo: 'beta-custos', legenda: 'Custos por fase: sonda, revestimento, brocas e fluido', formato: 'desktop' },
      { arquivo: 'beta-parametros', legenda: 'Entrada de parâmetros por fase', formato: 'desktop' },
    ],
  },
  {
    id: 'delta',
    curto: 'Eólica offshore',
    titulo: 'Energia eólica em plataformas offshore',
    subtitulo: 'Dados de vento da NASA, simulação de despacho e emissões evitadas',
    ano: '2025 – 2026',
    area: 'Energia',
    resumo:
      'Lê séries horárias de vento (NASA POWER), leva a velocidade para a altura da turbina e simula como a energia eólica divide a carga da plataforma com a geração térmica, estimando gás economizado e CO₂ evitado.',
    pontos: [
      'Perfil de vento pela lei de potência de Hellmann',
      'Curva de potência do aerogerador e despacho hora a hora',
      'Rosa dos ventos, mapa de calor e curva de permanência',
    ],
    tags: ['Python', 'pandas', 'FastAPI', 'React', 'Recharts'],
    telas: [
      { arquivo: 'delta-despacho', legenda: 'Despacho eólico e térmico para uma carga de 50 MW', formato: 'desktop' },
      { arquivo: 'delta-vento', legenda: 'Rosa dos ventos, mapa de calor e curva de permanência', formato: 'desktop' },
    ],
  },
  {
    id: 'theta',
    curto: 'Tarefas',
    titulo: 'Gestão de tarefas para equipes',
    subtitulo: 'Aplicativo web com login, papéis de acesso e banco de dados',
    ano: '2026',
    area: 'Software',
    resumo:
      'Prioriza tarefas por urgência e esforço, separa os papéis de líder e colaborador e funciona como aplicativo instalável no celular.',
    pontos: ['Autenticação e banco no Supabase', 'API em FastAPI com regras por papel'],
    tags: ['React', 'Supabase', 'PostgreSQL', 'FastAPI', 'PWA'],
    telas: [
      { arquivo: 'theta-painel', legenda: 'Painel do líder com tarefas de exemplo', formato: 'celular' },
      { arquivo: 'theta-login', legenda: 'Tela de acesso', formato: 'celular' },
    ],
  },
]

export const trajetoria = [
  {
    periodo: 'set/2024 – atual',
    cargo: 'Bolsista de Iniciação Científica',
    local: 'Laboratório de Física Industrial (LAFI/UFPA)',
    texto: 'Orientação do Prof. Dr. Thiago Rafael da Silva Moura. Ciência de dados em E&P e, desde 2026, o simulador hidráulico-volumétrico.',
  },
  {
    periodo: 'mar/2025 – atual',
    cargo: 'Diretor de Tecnologia',
    local: 'SPE UFPA Student Chapter',
    texto: 'Responsável pela área de tecnologia do capítulo e pelos sites do capítulo e de congressos científicos (React, TypeScript, Vite e Tailwind).',
  },
  {
    periodo: '2022 – ago/2027',
    cargo: 'Bacharelado em Eng. de Exploração e Produção de Petróleo',
    local: 'Universidade Federal do Pará (UFPA)',
    texto: 'Conclusão prevista para agosto de 2027.',
  },
  {
    periodo: '2026 – atual',
    cargo: 'Bacharelado em Engenharia de Software',
    local: 'Universidade Cesumar (Unicesumar)',
    texto: 'Em andamento, em paralelo à graduação em petróleo.',
  },
]

export const producao = [
  {
    tipo: 'Programa de computador · INPI',
    ano: '2025',
    titulo: 'Sistema Inteligente de Geoquímica e Maturidade (SIGMA)',
    autores: 'Moura, T. R. S.; Ferreira, T. Y. D.',
    onde: 'Registro BR512026001049-7, 08/10/2025',
  },
  {
    tipo: 'Trabalho completo · 1º autor',
    ano: '2024',
    titulo:
      'O uso de modelos preditivos de machine learning em poços de petróleo: otimização em processos analíticos na seleção de um poço de petróleo',
    autores: 'Ferreira, T. Y. D.; Guerrero Martin, C. A.; Silva, J. V. A.; Fernandes, F. A. S.',
    onde: '12º PDPetro, Balneário Camboriú/SC',
  },
  {
    tipo: 'Apresentação de trabalho',
    ano: '2025',
    titulo: 'Ciência de dados na determinação do potencial de geração de hidrocarbonetos em análise geoquímica',
    autores: 'Ferreira, T. Y. D.; Luna, J. L.; Corrêa Neto, S. S.; Moura, T. R. S.',
    onde: 'Comunicação científica',
  },
]

export const coautorias = {
  resumo: '6 artigos em coautoria na Revista Veredas do Direito, v. 23, 2026, sobre inovação, tecnologia e sociedade.',
  itens: [
    'Avaliação comparativa de modelos de linguagem na identificação de fake news: ChatGPT, DeepSeek e Claude Opus 4',
    'Challenges and opportunities for the ethical, critical, and responsible use of generative artificial intelligence: a case study of IFPA Marabá Industrial Campus',
    'Technological forecasting the development of an application for the payment and hiring of diverse service providers',
    'Challenges and opportunities for technological innovation incentive initiatives at UNIFESSPA',
    'Social technology transfer: a digital platform for the preservation of the Kayapó indigenous language in Redenção',
    'Geographical indication as a vector of socioeconomic sustainability in family farming in Pará',
  ],
}

export const competencias = [
  {
    grupo: 'Engenharia de poço e E&P',
    itens: ['Hidráulica de perfuração', 'Controle de poço', 'Limpeza do poço', 'Petrofísica', 'Geoquímica orgânica (COT, Rock-Eval)'],
  },
  {
    grupo: 'Dados e machine learning',
    itens: ['Python', 'pandas', 'scikit-learn', 'XGBoost', 'Power BI', 'SQL (PostgreSQL)', 'Excel'],
  },
  {
    grupo: 'Desenvolvimento de software',
    itens: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'FastAPI', 'Supabase', 'Git e GitHub', 'Linux', 'Vercel e Render', 'Arduino/ESP8266 (C)'],
  },
]

export const idiomas = 'Português nativo · Inglês intermediário, com leitura e escrita técnicas'

export const objetivo =
  'Procuro estágio em Engenharia de Petróleo, com foco em perfuração e Digital Oilfield. Até 30 h semanais, início imediato, presencial, remoto ou com mudança de cidade.'

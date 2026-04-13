import type { Aprendente, SugestaoSalva, ProtocoloAplicacaoData } from './types'

// ─── Tipos ─────────────────────────────────────────────────────────

export type DominioSugestao =
  | 'leitura'
  | 'escrita'
  | 'matematica'
  | 'atencao'
  | 'emocional'
  | 'socioemocional'

export interface SugestaoInstrumento {
  id: string
  nome: string
  dominio: DominioSugestao
  dominioBadge: string
  oBuscaDescobrir: string          // o que o instrumento revela
  alternativaSemLicenca: string    // como avaliar sem ter o instrumento formal
  score: number                    // 0–100, calculado pelo motor
  prioridade: 'alta' | 'media' | 'baixa'
  justificativa: string            // quais campos da anamnese ativaram
}

// ─── Catálogo de instrumentos ──────────────────────────────────────
// Baseado no Tratado de Intervenção Neuropsicopedagógica Clínica (SBNPp)

const CATALOGO: Array<{
  id: string
  nome: string
  dominio: DominioSugestao
  dominioBadge: string
  oBuscaDescobrir: string
  alternativaSemLicenca: string
  keywords: string[]
}> = [
  {
    id: 'tde',
    nome: 'TDE / TDE-II',
    dominio: 'leitura',
    dominioBadge: 'Leitura & Escrita',
    oBuscaDescobrir:
      'Avalia de forma padronizada as competências de leitura, escrita e aritmética por série escolar, detectando distanciamentos da curva de normalidade. Um dos instrumentos mais utilizados e recomendados pelo SBNPp para identificar transtornos específicos de aprendizagem.',
    alternativaSemLicenca:
      'Realize um ditado livre de palavras regulares e irregulares por série, leitura de texto nivelado em voz alta e operações aritméticas simples para sondagem informal do nível de desempenho acadêmico.',
    keywords: [
      'dislexia', 'leitura', 'escrita', 'caligrafia', 'ortografia',
      'sílaba', 'fonema', 'decodificação', 'desempenho escolar',
      'reprovação', 'atraso escolar', 'dificuldade de leitura',
      'dificuldade de escrita', 'trocas de letras', 'inversão',
    ],
  },
  {
    id: 'memnon',
    nome: 'Avaliação Neuropsicológica Cognitiva (Memnon)',
    dominio: 'leitura',
    dominioBadge: 'Diagnóstico Diferencial',
    oBuscaDescobrir:
      'Bateria focada na dissecação dos processos de leitura, escrita e aritmética, auxiliando no diagnóstico diferencial de transtornos específicos de aprendizagem. Permite distinguir entre dislexia, disortografia e discalculia com base em perfis cognitivos.',
    alternativaSemLicenca:
      'Aplique tarefas de consciência fonológica (identificar rima, aliteração, segmentação silábica), memória de trabalho verbal (repetição de dígitos) e leitura de pseudopalavras para mapear o perfil de processamento fonológico.',
    keywords: [
      'transtorno', 'dislexia severa', 'diagnóstico', 'laudo anterior',
      'avaliação psicológica', 'TEA', 'déficit cognitivo', 'comprometimento',
      'acompanhamento especializado', 'neuropediatria',
    ],
  },
  {
    id: 'proade',
    nome: 'PROADE',
    dominio: 'leitura',
    dominioBadge: 'Anos Iniciais',
    oBuscaDescobrir:
      'Proposta de Avaliação das Dificuldades Escolares, calibrada especificamente para os anos iniciais do Ensino Fundamental. Identifica dificuldades de alfabetização e letramento nas fases mais críticas do desenvolvimento escolar.',
    alternativaSemLicenca:
      'Aplique a sondagem de escrita clássica (pré-silábico → silábico → alfabético) usando palavras monossílabas, dissílabas e trissílabas, combinada com leitura de sílabas simples e complexas para mapear o nível de alfabetização.',
    keywords: [
      'alfabetização', 'educação infantil', '1º ano', '2º ano', '3º ano',
      'ensino fundamental', 'primeiros anos', 'letramento', 'não sabe ler',
      'não sabe escrever', 'jardim', 'pré-escola', 'cartilha',
    ],
  },
  {
    id: 'bacmat',
    nome: 'Coruja Promat / BACMAT',
    dominio: 'matematica',
    dominioBadge: 'Matemática',
    oBuscaDescobrir:
      'Roteiros para sondagem das habilidades matemáticas e Bateria de Aferição das Competências Matemáticas. Altamente recomendados pelo SBNPp para identificar déficits no senso numérico e sinais de discalculia do desenvolvimento.',
    alternativaSemLicenca:
      'Avalie a subitização (identificação imediata de quantidades sem contar) apresentando grupos de objetos com limite de tempo, peça seriação numérica, contagem regressiva e resolução de operações com material concreto (Barrinhas de Cuisenaire ou objetos do cotidiano).',
    keywords: [
      'matemática', 'cálculo', 'número', 'discalculia', 'aritmética',
      'contar', 'dificuldade com números', 'não entende matemática',
      'operações', 'tabuada', 'soma', 'subtração', 'multiplicação',
      'quantidade', 'grandeza', 'lógica matemática',
    ],
  },
  {
    id: 'prova-soma',
    nome: 'Prova da Noção de Soma (Sastre e Moreno)',
    dominio: 'matematica',
    dominioBadge: 'Raciocínio Lógico',
    oBuscaDescobrir:
      'Avaliação qualitativa e piagetiana que verifica a capacidade de estabelecer relações lógicas entre ações materiais de reunião de objetos e a operação aritmética formal. Revela se a criança compreende o conceito de número antes de enfrentá-lo no papel.',
    alternativaSemLicenca:
      'Utilizando objetos concretos (blocos, tampinhas), peça à criança que agrupe, compare e distribua quantidades. Faça perguntas de transitividade ("Se aqui tem 5 e ali tem 3, qual grupo tem mais?") para verificar a compreensão do conceito de número.',
    keywords: [
      'lógica', 'raciocínio', 'noção de quantidade', 'pré-escolar',
      'não compreende operação', 'concreto', 'abstrato', 'pré-operatório',
      'conceito numérico', 'conservação', 'seriação',
    ],
  },
  {
    id: 'eame-ij',
    nome: 'EAME-IJ (Escala de Motivação Escolar)',
    dominio: 'emocional',
    dominioBadge: 'Motivação Escolar',
    oBuscaDescobrir:
      'Escala para Avaliação da Motivação Escolar Infanto-Juvenil (Pearson). Fundamental para avaliar as funções conativas, identificando se a barreira de aprendizagem possui raízes desmotivacionais ou fóbicas — o que muda completamente a abordagem de intervenção.',
    alternativaSemLicenca:
      'Aplique o "Termômetro do Sentimento Escolar": uma régua visual de 1 a 10 onde a criança indica como se sente em diferentes situações escolares. Combine com entrevista lúdica sobre situações da escola para mapear a origem da desmotivação.',
    keywords: [
      'motivação', 'desmotivação', 'ansiedade', 'fobia escolar',
      'choro na escola', 'resistência', 'não quer ir à escola',
      'baixa autoestima', 'desânimo', 'estresse', 'pressão', 'medo',
      'insegurança', 'bloqueio', 'aversão à escola',
    ],
  },
  {
    id: 'projetivos',
    nome: 'Testes Projetivos (Par Educativo / Família Cinética)',
    dominio: 'emocional',
    dominioBadge: 'Dinâmica Psíquica',
    oBuscaDescobrir:
      'Técnicas qualitativas que fornecem vislumbres da dinâmica psíquica, autoimagem e representação do ambiente escolar e familiar do aprendente. O Par Educativo avalia a relação afetiva com a escola; a Família Cinética revela a percepção do lugar do sujeito na família.',
    alternativaSemLicenca:
      'Peça um desenho livre com narrativa guiada ("Desenhe você na escola e conte o que está acontecendo"), seguido de uma história com fantoches representando situações escolares e familiares. Observe projeções espontâneas.',
    keywords: [
      'autoestima', 'conflito familiar', 'separação', 'luto', 'divórcio',
      'ansiedade emocional', 'comportamento', 'agressividade', 'choro fácil',
      'isolamento', 'timidez extrema', 'dificuldade de relacionamento',
      'dinâmica familiar', 'ambiente familiar', 'família desestruturada',
    ],
  },
  {
    id: 'funcoes-executivas',
    nome: 'Avaliação de Funções Executivas',
    dominio: 'atencao',
    dominioBadge: 'Atenção & Controle',
    oBuscaDescobrir:
      'Avalia o conjunto de habilidades orquestradas pelo córtex pré-frontal: planejamento, memória de trabalho, controle inibitório, atenção sustentada e flexibilidade cognitiva. É o núcleo sintomatológico do TDAH e impacta diretamente o desempenho em sala de aula.',
    alternativaSemLicenca:
      'Observe comportamento em tarefas com regras (Jogo do Simon Says, Torre de Hanoi simplificada com blocos). Avalie inibição via "Trilha com Regra" (pintar alternando cores sem repetir), memória de trabalho via repetição de sequências e planejamento via labirinto desenhado.',
    keywords: [
      'tdah', 'atenção', 'hiperatividade', 'impulsividade', 'desatenção',
      'agitação', 'inquietação', 'concentração', 'distração',
      'não consegue sentar', 'não termina atividades', 'esquecimento',
      'perde objetos', 'não segue regras', 'interrompe', 'planejamento',
      'memória de trabalho', 'déficit de atenção',
    ],
  },
  {
    id: 'socioemocional',
    nome: 'Avaliação Socioemocional / Multissensorial',
    dominio: 'socioemocional',
    dominioBadge: 'Socioemocional & TEA',
    oBuscaDescobrir:
      'Avalia o processamento sensorial, a regulação emocional e padrões de socialização — essencial para populações neurodivergentes como TEA. Identifica hipersensibilidades sensoriais, déficits na comunicação social e padrões de comportamento atípicos que impactam a aprendizagem.',
    alternativaSemLicenca:
      'Conduza uma observação estruturada em atividades lúdicas livres (15 min) e dirigidas (15 min), registrando: contato visual, reciprocidade social, jogo simbólico, resposta ao nome, reações sensoriais atípicas a texturas/sons. Use o CARS (Childhood Autism Rating Scale) como referência qualitativa.',
    keywords: [
      'autismo', 'tea', 'espectro autista', 'autista', 'sociabilização',
      'comunicação', 'fala', 'linguagem', 'contato visual',
      'sensorial', 'hipersensibilidade', 'meltdown', 'birra intensa',
      'estereotipia', 'rotina rígida', 'isolamento social', 'interação',
      'dificuldade de socializar', 'ecolalia', 'não fala',
    ],
  },
]

// ─── Peso por campo da anamnese ────────────────────────────────────

const PESOS: Record<keyof Pick<Aprendente,
  'diagnosticosPrevios' | 'queixaPrincipal' | 'historicoEscolar' |
  'historicoDesen' | 'historicoFamiliar' | 'medicacoes' | 'motivo'
>, number> = {
  diagnosticosPrevios: 40,
  queixaPrincipal: 30,
  historicoEscolar: 20,
  historicoDesen: 15,
  motivo: 15,
  historicoFamiliar: 10,
  medicacoes: 10,
}

// ─── Motor de sugestão ─────────────────────────────────────────────

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
}

function matchKeywords(texto: string, keywords: string[]): string[] {
  const normalizado = normalizarTexto(texto)
  return keywords.filter((kw) => normalizarTexto(kw).split(' ').every((part) => normalizado.includes(part)))
}

export function calcularSugestoes(aprendente: Aprendente): SugestaoInstrumento[] {
  const resultados: SugestaoInstrumento[] = []

  for (const instrumento of CATALOGO) {
    let score = 0
    const indicadoresEncontrados: string[] = []

    // Diagnósticos prévios (array de strings) — peso máximo
    if (aprendente.diagnosticosPrevios?.length) {
      const textoJunto = aprendente.diagnosticosPrevios.join(' ')
      const matches = matchKeywords(textoJunto, instrumento.keywords)
      if (matches.length > 0) {
        score += PESOS.diagnosticosPrevios
        indicadoresEncontrados.push(`diagnóstico prévio: "${matches[0]}"`)
      }
    }

    // Queixa principal
    if (aprendente.queixaPrincipal) {
      const matches = matchKeywords(aprendente.queixaPrincipal, instrumento.keywords)
      if (matches.length > 0) {
        score += PESOS.queixaPrincipal * Math.min(matches.length, 2) / 2
        indicadoresEncontrados.push(`queixa principal`)
      }
    }

    // Histórico escolar
    if (aprendente.historicoEscolar) {
      const matches = matchKeywords(aprendente.historicoEscolar, instrumento.keywords)
      if (matches.length > 0) {
        score += PESOS.historicoEscolar
        indicadoresEncontrados.push(`histórico escolar`)
      }
    }

    // Histórico de desenvolvimento
    if (aprendente.historicoDesen) {
      const matches = matchKeywords(aprendente.historicoDesen, instrumento.keywords)
      if (matches.length > 0) {
        score += PESOS.historicoDesen
        indicadoresEncontrados.push(`histórico de desenvolvimento`)
      }
    }

    // Motivo de consulta
    if (aprendente.motivo) {
      const matches = matchKeywords(aprendente.motivo, instrumento.keywords)
      if (matches.length > 0) {
        score += PESOS.motivo
        indicadoresEncontrados.push(`motivo de consulta`)
      }
    }

    // Histórico familiar
    if (aprendente.historicoFamiliar) {
      const matches = matchKeywords(aprendente.historicoFamiliar, instrumento.keywords)
      if (matches.length > 0) {
        score += PESOS.historicoFamiliar
        indicadoresEncontrados.push(`histórico familiar`)
      }
    }

    // Medicações (ex: Ritalina → sugere avaliação de atenção)
    if (aprendente.medicacoes) {
      const matches = matchKeywords(aprendente.medicacoes, instrumento.keywords)
      if (matches.length > 0) {
        score += PESOS.medicacoes
        indicadoresEncontrados.push(`medicações em uso`)
      }
    }

    if (score === 0) continue // Sem ativação: não inclui

    const prioridade: SugestaoInstrumento['prioridade'] =
      score >= 60 ? 'alta' : score >= 30 ? 'media' : 'baixa'

    const justificativa =
      indicadoresEncontrados.length > 0
        ? `Ativado por: ${indicadoresEncontrados.join(', ')}`
        : 'Indicado com base na anamnese'

    resultados.push({
      ...instrumento,
      score: Math.min(Math.round(score), 100),
      prioridade,
      justificativa,
    })
  }

  // Ordenar: alta → media → baixa, depois por score
  return resultados.sort((a, b) => {
    const ordem = { alta: 0, media: 1, baixa: 2 }
    return ordem[a.prioridade] - ordem[b.prioridade] || b.score - a.score
  })
}

// ─── Helper: verifica se há dados de anamnese suficientes ──────────

export function temAnamneseSuficiente(aprendente: Aprendente): boolean {
  return !!(
    aprendente.queixaPrincipal ||
    aprendente.historicoEscolar ||
    aprendente.historicoDesen ||
    (aprendente.diagnosticosPrevios?.length ?? 0) > 0 ||
    aprendente.motivo
  )
}

// ─── Mapa de Cobertura Diagnóstica (Sprint 5) ──────────────────────

export const DOMINIOS_COBERTURA = [
  {
    id: 'leitura',
    label: 'Leitura & Escrita',
    emoji: '📖',
    cor: '#6366f1',
    instrumentoIds: ['tde', 'memnon', 'proade'],
    keywordsNome: ['leitura', 'escrita', 'tde', 'memnon', 'proade', 'alfabet', 'fonolog'],
  },
  {
    id: 'matematica',
    label: 'Matemática',
    emoji: '🔢',
    cor: '#f59e0b',
    instrumentoIds: ['bacmat', 'prova-soma'],
    keywordsNome: ['matem', 'calculo', 'bacmat', 'promat', 'cuisenaire', 'numero', 'discalculia'],
  },
  {
    id: 'atencao',
    label: 'Atenção & Controle',
    emoji: '🎯',
    cor: '#3b82f6',
    instrumentoIds: ['funcoes-executivas'],
    keywordsNome: ['atencao', 'hiperativ', 'tdah', 'executiv', 'rastreio', 'comportamento', 'impulsiv'],
  },
  {
    id: 'emocional',
    label: 'Motivação & Emocional',
    emoji: '💙',
    cor: '#ec4899',
    instrumentoIds: ['eame-ij', 'projetivos'],
    keywordsNome: ['motivacao', 'emocional', 'eame', 'projetiv', 'familia', 'autoestima', 'ansiedade'],
  },
  {
    id: 'socioemocional',
    label: 'Socioemocional & TEA',
    emoji: '🤝',
    cor: '#10b981',
    instrumentoIds: ['socioemocional'],
    keywordsNome: ['social', 'autismo', 'tea', 'espectro', 'comunicacao', 'regulacao'],
  },
] as const

export interface CoberturaInfo {
  dominio: (typeof DOMINIOS_COBERTURA)[number]
  coberto: boolean
  instrumento?: string
  dataUltimaAplicacao?: string
  vencido: boolean     // 6+ meses sem reavaliação no domínio
}

export function calcularCobertura(
  sugestoesSalvas: SugestaoSalva[],
  aplicacoes: ProtocoloAplicacaoData[]
): CoberturaInfo[] {
  const normz = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  return DOMINIOS_COBERTURA.map((dominio) => {
    // 1. Sugestões marcadas como 'aplicado' pelo profissional
    const sugestaoAplicada = sugestoesSalvas.find(
      (s) => s.status === 'aplicado' && dominio.instrumentoIds.includes(s.instrumentoId as any)
    )

    // 2. Aplicações de protocolo com nome compatível
    const aplicacoesDominio = aplicacoes
      .filter((apl) => {
        const nome = normz(apl.modeloNome ?? '')
        return dominio.keywordsNome.some((kw) => nome.includes(normz(kw)))
      })
      .sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))

    const coberto = !!sugestaoAplicada || aplicacoesDominio.length > 0

    let dataUltimaAplicacao: string | undefined
    let instrumento: string | undefined

    if (sugestaoAplicada) {
      const instrObj = CATALOGO.find((c) => c.id === sugestaoAplicada.instrumentoId)
      instrumento = instrObj?.nome ?? sugestaoAplicada.instrumentoId
      dataUltimaAplicacao = aplicacoesDominio[0]?.dataAplicacao ?? sugestaoAplicada.dataCriacao
    } else if (aplicacoesDominio.length > 0) {
      instrumento = aplicacoesDominio[0].modeloNome ?? 'Protocolo'
      dataUltimaAplicacao = aplicacoesDominio[0].dataAplicacao
    }

    // Vencido: coberto há 6+ meses
    let vencido = false
    if (coberto && dataUltimaAplicacao) {
      const mesesDesde =
        (Date.now() - new Date(dataUltimaAplicacao + (dataUltimaAplicacao.length === 10 ? 'T12:00:00' : '')).getTime()) /
        (1000 * 60 * 60 * 24 * 30)
      vencido = mesesDesde >= 6
    }

    return { dominio, coberto, instrumento, dataUltimaAplicacao, vencido }
  })
}

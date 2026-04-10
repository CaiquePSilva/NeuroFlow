// ==========================================
// Tipos centrais do NeuroFlow
// ==========================================

export type StatusType = 'agendado' | 'andamento' | 'pago' | 'cancelado' | 'remarcado'

export interface SessaoAgenda {
  id: string
  aprendenteId: string
  nomeAprendente: string
  tipoSessao: string
  dataRealizacao: string // YYYY-MM-DD
  horaInicio: string // HH:mm
  horaFim: string // HH:mm
  status: StatusType
  valor: string
}

export interface Aprendente {
  id: string
  nome: string
  dataOuIdade: string
  responsavel1: string
  responsavel2: string
  contato: string
  motivo: string
  tipoSessao?: 'Avaliação' | 'Intervenção' | ''
  qtdSessoesAvaliacao?: number
  formaPagamento?: 'Por Sessão' | 'Pacote Mensal' | 'Avaliação Completa' | ''
  valorReferencia?: string
  duracaoMinutos?: string
  status?: 'ativo' | 'inativo'
  motivoEncerramento?: string
  dataEncerramento?: string
  metodoPagamento?: string
  magicPin?: string

  // ── Anamnese Clínica (Fase 1.3) ──
  queixaPrincipal?: string
  historicoDesen?: string       // historico_desenvolvimento
  historicoEscolar?: string
  historicoFamiliar?: string
  medicacoes?: string
  diagnosticosPrevios?: string[]
  profissionaisAcompanhamento?: string

  // ── Rede de Suporte ──
  email?: string
  medico?: string
  contatoMedico?: string
  escola?: string
  contatoEscola?: string
  contatoProfessor?: string
}


// ==========================================
// Nota de Sessão (Fase 1.2)
// ==========================================

export type TagClinica =
  | 'cognitivo'
  | 'emocional'
  | 'motor'
  | 'linguagem'
  | 'social'
  | 'acadêmico'

export interface NotaSessao {
  id?: string
  sessaoId: string
  aprendenteId: string
  tags: TagClinica[]
  observacao?: string
  engajamento?: number        // 1–5
  regulacaoEmocional?: number // 1–5
  atencaoSustentada?: number  // 1–5
  dataCriacao?: string
}

// ==========================================
// Protocolos de Avaliação (Fase 2.1)
// ==========================================

export type TipoPergunta = 'escala' | 'sim_nao' | 'texto' | 'contador'

export interface PerguntaModelo {
  id: string             // uuid gerado no frontend
  texto: string
  tipo: TipoPergunta
  peso: number           // multiplicador de pontuação (default 1)
  escalaMax?: number     // máximo para tipo 'escala' (default 5)
  obrigatorio: boolean
}

export interface FaixaInterpretacao {
  id: string
  de: number
  ate: number
  label: string            // "Nível Leve"
  descricaoLaudo: string   // parágrafo gerado no laudo
}

export interface ProtocoloModelo {
  id: string
  userId: string
  nome: string
  descricao?: string
  instrucoes?: string
  isTemplate: boolean
  perguntas: PerguntaModelo[]
  interpretacoes: FaixaInterpretacao[]
  termosAceitosEm?: string
  dataCriacao: string
}

export interface ProtocoloAplicacaoData {
  id: string
  modeloId: string
  modeloNome?: string        // join para display
  aprendenteId: string
  userId: string
  sessaoId?: string
  respostas: Record<string, number | string>
  escoreTotal?: number
  interpretacao?: string
  paragrafaLaudo?: string
  observacoes?: string
  dataAplicacao: string
  dataCriacao: string
}

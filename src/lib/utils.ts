import type { Aprendente, SessaoAgenda } from './types'

// ==========================================
// Supabase Adapters (snake_case → camelCase)
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseApFromSupa = (db: any): Aprendente => ({
  id: db.id,
  nome: db.nome,
  dataOuIdade: db.data_ou_idade,
  responsavel1: db.responsavel_1,
  responsavel2: db.responsavel_2,
  contato: db.contato,
  motivo: db.motivo,
  tipoSessao: db.tipo_sessao,
  qtdSessoesAvaliacao: db.qtd_sessoes_avaliacao,
  formaPagamento: db.forma_pagamento,
  valorReferencia: db.valor_referencia,
  duracaoMinutos: db.duracao_minutos,
  status: db.status,
  motivoEncerramento: db.motivo_encerramento,
  dataEncerramento: db.data_encerramento,
  metodoPagamento: db.metodo_pagamento,
  magicPin: db.magic_pin,
  // Anamnese Clínica
  queixaPrincipal: db.queixa_principal,
  historicoDesen: db.historico_desenvolvimento,
  historicoEscolar: db.historico_escolar,
  historicoFamiliar: db.historico_familiar,
  medicacoes: db.medicacoes,
  diagnosticosPrevios: db.diagnosticos_previos ?? [],
  profissionaisAcompanhamento: db.profissionais_acompanhamento,
  // Rede de Suporte
  email: db.email,
  medico: db.medico,
  contatoMedico: db.contato_medico,
  escola: db.escola,
  contatoEscola: db.contato_escola,
  contatoProfessor: db.contato_professor,
})


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseSesFromSupa = (db: any): SessaoAgenda => ({
  id: db.id,
  aprendenteId: db.aprendente_id,
  nomeAprendente: db.nome_aprendente,
  tipoSessao: db.tipo_sessao,
  dataRealizacao: db.data_realizacao,
  horaInicio: db.hora_inicio,
  horaFim: db.hora_fim,
  status: db.status,
  valor: db.valor,
})

// ==========================================
// Date & Time Helpers
// ==========================================

export const getTodayISO = (): string => {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export const calcularHoraFim = (inicio: string, minDura: number): string => {
  if (!inicio) return ''
  const [h, m] = inicio.split(':').map(Number)
  const date = new Date()
  date.setHours(h, m, 0)
  date.setMinutes(date.getMinutes() + minDura)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export const parseMoney = (val: string): number => {
  return parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.')) || 0
}

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ==========================================
// Input Masks
// ==========================================

export const maskAgeOrDate = (raw: string): string => {
  let value = raw.replace(/\D/g, '')
  if (value.length > 2) {
    if (value.length > 8) value = value.slice(0, 8)
    value = value.replace(/(\d{2})(\d)/, '$1/$2')
    value = value.replace(/(\d{2})(\d)/, '$1/$2')
  } else {
    if (value.length > 2) value = value.slice(0, 2)
  }
  return value
}

export const maskPhone = (raw: string): string => {
  let value = raw.replace(/\D/g, '')
  if (value.length > 11) value = value.slice(0, 11)
  if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2')
  }
  if (value.length > 9) {
    value = value.replace(/(\d{5})(\d)/, '$1-$2')
  } else if (value.length > 8) {
    value = value.replace(/(\d{4})(\d)/, '$1-$2')
  }
  return value
}

export const maskMoney = (raw: string): string => {
  const value = raw.replace(/\D/g, '')
  if (value === '') return ''
  const numericValue = parseInt(value, 10)
  if (isNaN(numericValue)) return ''
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue / 100)
}

export const maskQuickDate = (raw: string, prev: string): string => {
  let value = raw
  if (value.length < prev.length) return value // backspace
  value = value.replace(/\D/g, '')
  if (value.length > 4) value = value.slice(0, 4)
  if (value.length > 2) {
    value = `${value.slice(0, 2)}/${value.slice(2)}`
  }
  return value
}

export const maskQuickDateBlur = (raw: string): string => {
  let value = raw.replace(/\D/g, '')
  if (!value) return ''
  if (value.length === 3) value = '0' + value
  if (value.length >= 4) {
    value = `${value.slice(0, 2)}/${value.slice(2, 4)}`
  }
  return value
}

export const maskQuickTime = (raw: string, prev: string): string => {
  let value = raw
  if (value.length < prev.length) return value // backspace
  value = value.replace(/\D/g, '')
  if (value.length > 4) value = value.slice(0, 4)
  return value
}

export const maskQuickTimeBlur = (raw: string): string => {
  let value = raw.replace(/\D/g, '')
  if (!value) return ''
  if (value.length <= 2) value = value.padStart(2, '0') + '00'
  else if (value.length === 3) value = '0' + value

  if (value.length >= 4) {
    let h = parseInt(value.slice(0, 2))
    let m = parseInt(value.slice(2, 4))
    if (h > 23) h = 23
    if (m > 59) m = 59
    value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  return value
}

// ==========================================
// Business Logic Helpers
// ==========================================

export const getGreeting = (hour: number): string => {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export const getDynamicMessage = (h: number, count: number): string => {
  if (h >= 18) {
    return "O expediente chegou ao fim! Aproveite para organizar relatórios, descansar a mente e recarregar as energias para amanhã."
  }
  if (count === 0) {
    return h < 12
      ? "Café na xícara e agenda livre! Aproveite a manhã para organizar relatórios ou planejar a semana."
      : "Tarde tranquila por aqui. Que tal tirar um momento para você ou adiantar os estudos de caso?"
  }
  if (count === 1) {
    return h < 12
      ? "Apenas um atendimento aguardando por você hoje. Que seja uma sessão muito produtiva!"
      : "Falta pouco! Você tem mais um atendimento programado para esta tarde."
  }
  return h < 12
    ? `Espero que o dia seja ótimo. Você tem ${count} atendimentos programados, dê uma olhada no fluxo abaixo.`
    : `A tarde está movimentada! Há ${count} aprendentes aguardando por você nos próximos horários.`
}

export const getPagamentoInfo = (
  ap: Aprendente,
  sessoesGlobais: SessaoAgenda[]
): { showPayBtn: boolean; label: string } => {
  if (!ap.formaPagamento) return { showPayBtn: true, label: 'Marcar como Pago' }
  if (ap.formaPagamento === 'Por Sessão') return { showPayBtn: true, label: 'Marcar como Pago' }
  if (ap.formaPagamento === 'Pacote Mensal') {
    const sessoesDoMes = sessoesGlobais.filter((s) => {
      if (s.aprendenteId !== ap.id) return false
      const mesAtual = new Date().getMonth()
      const mesSessao = new Date(s.dataRealizacao + 'T12:00:00').getMonth()
      return mesAtual === mesSessao && s.status === 'pago'
    })
    if (sessoesDoMes.length >= 4) return { showPayBtn: false, label: 'Pacote Mensal Pago ✓' }
    return { showPayBtn: true, label: `Pago Antecipadamente (${sessoesDoMes.length}/4)` }
  }
  return { showPayBtn: true, label: 'Marcar como Pago' }
}

// ==========================================
// Protocolo de Avaliação — Cálculos (Fase 2.1)
// ==========================================

import type { PerguntaModelo, FaixaInterpretacao } from './types'

export const calcularEscore = (
  perguntas: PerguntaModelo[],
  respostas: Record<string, number | string>
): number => {
  return perguntas
    .filter((p) => p.tipo !== 'texto')
    .reduce((acc, p) => {
      const val = Number(respostas[p.id] ?? 0)
      return acc + val * p.peso
    }, 0)
}

export const interpretarEscore = (
  escore: number,
  interpretacoes: FaixaInterpretacao[]
): FaixaInterpretacao | null => {
  return interpretacoes.find((f) => escore >= f.de && escore <= f.ate) ?? null
}

export const escoreMaximo = (perguntas: PerguntaModelo[]): number => {
  return perguntas
    .filter((p) => p.tipo !== 'texto')
    .reduce((acc, p) => {
      const max = p.tipo === 'sim_nao' ? 1 : (p.escalaMax ?? 5)
      return acc + max * p.peso
    }, 0)
}

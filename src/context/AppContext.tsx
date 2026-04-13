import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useSupabaseData } from '../hooks/useSupabaseData'
import { usePWA } from '../hooks/usePWA'
import { parseApFromSupa, parseSesFromSupa, calcularHoraFim } from '../lib/utils'
import type { Aprendente, SessaoAgenda, NotaSessao, ProtocoloModelo, ProtocoloAplicacaoData, PerguntaModelo, FaixaInterpretacao, RAN, Encaminhamento, PIN, SugestaoSalva, SugestaoStatus } from '../lib/types'

// ==========================================
// Tipos do Contexto
// ==========================================

interface AppContextValue {
  // Data
  aprendentes: Aprendente[]
  sessoesGlobais: SessaoAgenda[]
  loading: boolean
  userId: string

  // PWA
  deferredPrompt: Event | null
  handleInstallPWA: () => void

  // Aprendente CRUD
  addAprendente: (ap: Aprendente) => void
  updateAprendente: (ap: Aprendente) => void
  removeAprendente: (id: string) => void

  // Sessão CRUD
  addSessoes: (sessoes: SessaoAgenda[]) => void
  updateSessaoStatus: (id: string, status: SessaoAgenda['status']) => void
  setSessoesGlobais: React.Dispatch<React.SetStateAction<SessaoAgenda[]>>
  removeFutureSessions: (aprendenteId: string) => void

  // Handlers de Aprendente
  handleSubmitNovoAprendente: (formData: FormData, ageOrDate: string, phone: string) => Promise<void>
  handleSalvarDetalhes: (
    formData: FormData,
    config: {
      confTipoSessao: string
      confQtd: number | ''
      confFormaPagamento: string
      confValor: string
      confDuracao: string
      ageOrDate: string
      phone: string
    },
    aprendente: Aprendente
  ) => Promise<Aprendente | null>
  handleEncerrar: (motivo: string, aprendente: Aprendente) => Promise<void>
  handleExcluirAprendente: (aprendente: Aprendente) => Promise<void>

  // Handlers de Sessão
  handleIniciarAtendimento: (id: string) => Promise<void>
  handleMarcarComoPago: (id: string) => Promise<void>
  handleCancelarSessao: (id: string) => Promise<void>
  handleRemarcarSessao: (sessao: SessaoAgenda, novaData: string, novaHora: string) => Promise<void>
  handleSubmitSessao: (data: string, horaInicio: string, aprendente: Aprendente) => Promise<void>
  handleAgendamentoRapido: (ap: Aprendente, quickDate: string, quickTime: string) => Promise<void>
  handleSalvarNota: (nota: NotaSessao) => Promise<void>

  // Protocolos de Avaliação (Fase 2.1)
  protocolos: ProtocoloModelo[]
  handleCriarModelo: (data: Omit<ProtocoloModelo, 'id' | 'userId' | 'dataCriacao'>) => Promise<ProtocoloModelo | null>
  handleAtualizarModelo: (modelo: ProtocoloModelo) => Promise<void>
  handleExcluirModelo: (id: string) => Promise<void>
  handleDuplicarModelo: (modelo: ProtocoloModelo) => Promise<ProtocoloModelo | null>
  handleSalvarAplicacao: (apl: Omit<ProtocoloAplicacaoData, 'id' | 'userId' | 'dataCriacao'>) => Promise<ProtocoloAplicacaoData | null>
  loadAplicacoesAprendente: (aprendenteId: string) => Promise<ProtocoloAplicacaoData[]>

  // RAN — Relatório de Avaliação Neuropsicopedagógica (Fase 2.2)
  handleCriarRAN: (aprendenteId: string) => Promise<RAN | null>
  handleSalvarRAN: (ran: RAN) => Promise<void>
  handleFinalizarRAN: (ran: RAN) => Promise<void>
  loadRANsAprendente: (aprendenteId: string) => Promise<RAN[]>

  // Encaminhamentos (Fase 2.2)
  handleCriarEncaminhamento: (data: Omit<Encaminhamento, 'id' | 'userId' | 'dataCriacao'>) => Promise<Encaminhamento | null>
  loadEncaminhamentosAprendente: (aprendenteId: string) => Promise<Encaminhamento[]>

  // PIN — Plano de Intervenção (Fase 2.2)
  handleSalvarPIN: (data: Omit<PIN, 'id' | 'userId' | 'dataCriacao'>) => Promise<PIN | null>
  loadPINAprendente: (aprendenteId: string) => Promise<PIN | null>

  // Evolução Clínica (Fase 3.1)
  loadNotasSessaoAprendente: (aprendenteId: string) => Promise<NotaSessao[]>

  // Sugestões de Avaliação (Fase 3.2)
  handleSalvarSugestao: (aprendenteId: string, instrumentoId: string, status: SugestaoStatus, justificativa?: string) => Promise<void>
  loadSugestoesAprendente: (aprendenteId: string) => Promise<SugestaoSalva[]>
}

const AppContext = createContext<AppContextValue | null>(null)

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}

// ==========================================
// Parsers de Protocolo
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseModeloFromSupa = (db: any): ProtocoloModelo => ({
  id: db.id,
  userId: db.user_id,
  nome: db.nome,
  descricao: db.descricao,
  instrucoes: db.instrucoes,
  isTemplate: db.is_template ?? false,
  perguntas: (db.perguntas as PerguntaModelo[]) ?? [],
  interpretacoes: (db.interpretacoes as FaixaInterpretacao[]) ?? [],
  termosAceitosEm: db.termos_aceitos_em,
  dataCriacao: db.data_criacao,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseAplicacaoFromSupa = (db: any, modeloNome?: string): ProtocoloAplicacaoData => ({
  id: db.id,
  modeloId: db.modelo_id,
  modeloNome: modeloNome ?? db.modelo_nome,
  aprendenteId: db.aprendente_id,
  userId: db.user_id,
  sessaoId: db.sessao_id,
  respostas: (db.respostas as Record<string, number | string>) ?? {},
  escoreTotal: db.escore_total,
  interpretacao: db.interpretacao,
  paragrafaLaudo: db.paragrafo_laudo,
  observacoes: db.observacoes,
  dataAplicacao: db.data_aplicacao,
  dataCriacao: db.data_criacao,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseNotaFromSupa = (db: any): NotaSessao => ({
  id: db.id,
  sessaoId: db.sessao_id,
  aprendenteId: db.aprendente_id,
  tags: db.tags ?? [],
  observacao: db.observacao ?? undefined,
  engajamento: db.engajamento ?? undefined,
  regulacaoEmocional: db.regulacao_emocional ?? undefined,
  atencaoSustentada: db.atencao_sustentada ?? undefined,
  dataCriacao: db.data_criacao ?? db.created_at,
})

// ==========================================
// Parsers de RAN / Encaminhamento / PIN
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseRANFromSupa = (db: any): RAN => ({
  id: db.id,
  aprendenteId: db.aprendente_id,
  userId: db.user_id,
  secaoQueixa: db.secao_queixa ?? undefined,
  secaoProcedimentos: db.secao_procedimentos ?? [],
  secaoResultados: db.secao_resultados ?? [],
  secaoHipoteses: db.secao_hipoteses ?? undefined,
  secaoRecomendacoes: db.secao_recomendacoes ?? undefined,
  status: db.status ?? 'rascunho',
  dataAvaliacao: db.data_avaliacao ?? undefined,
  dataCriacao: db.data_criacao,
  dataAtualizacao: db.data_atualizacao ?? db.data_criacao,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseEncaminhamentoFromSupa = (db: any): Encaminhamento => ({
  id: db.id,
  ranId: db.ran_id ?? undefined,
  aprendenteId: db.aprendente_id,
  userId: db.user_id,
  destinatario: db.destinatario ?? undefined,
  especialidade: db.especialidade,
  motivo: db.motivo,
  observacoes: db.observacoes ?? undefined,
  dataCriacao: db.data_criacao,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parsePINFromSupa = (db: any): PIN => ({
  id: db.id,
  ranId: db.ran_id ?? undefined,
  aprendenteId: db.aprendente_id,
  userId: db.user_id,
  objetivos: db.objetivos ?? [],
  frequencia: db.frequencia ?? undefined,
  duracaoSemanas: db.duracao_semanas ?? undefined,
  observacoes: db.observacoes ?? undefined,
  dataCriacao: db.data_criacao,
})

// ==========================================
// Provider
// ==========================================

export function AppProvider({ children, userId }: { children: ReactNode; userId: string }) {

  const {
    aprendentes,
    sessoesGlobais,
    loading,
    addAprendente,
    updateAprendente,
    removeAprendente,
    addSessoes,
    updateSessaoStatus,
    setSessoesGlobais,
    removeFutureSessions,
  } = useSupabaseData()

  const { deferredPrompt, handleInstallPWA } = usePWA()

  // ── Protocolo Handlers ──────────────────────────────────

  const handleCriarModelo = async (
    data: Omit<ProtocoloModelo, 'id' | 'userId' | 'dataCriacao'>
  ): Promise<ProtocoloModelo | null> => {
    const payload = {
      user_id: userId,
      nome: data.nome,
      descricao: data.descricao ?? null,
      instrucoes: data.instrucoes ?? null,
      is_template: false,
      perguntas: data.perguntas as unknown as PerguntaModelo[],
      interpretacoes: data.interpretacoes as unknown as FaixaInterpretacao[],
      termos_aceitos_em: data.termosAceitosEm ?? new Date().toISOString(),
    }
    const { data: res } = await supabase.from('protocolo_modelos').insert([payload]).select().single()
    if (res) {
      const novo = parseModeloFromSupa(res)
      setProtocolos((prev) => [novo, ...prev])
      return novo
    }
    return null
  }

  const handleAtualizarModelo = async (modelo: ProtocoloModelo): Promise<void> => {
    if (modelo.isTemplate) return
    const payload = {
      nome: modelo.nome,
      descricao: modelo.descricao ?? null,
      instrucoes: modelo.instrucoes ?? null,
      perguntas: modelo.perguntas as unknown as PerguntaModelo[],
      interpretacoes: modelo.interpretacoes as unknown as FaixaInterpretacao[],
    }
    const { data: res } = await supabase
      .from('protocolo_modelos')
      .update(payload)
      .eq('id', modelo.id)
      .select()
      .single()
    if (res) setProtocolos((prev) => prev.map((p) => (p.id === modelo.id ? parseModeloFromSupa(res) : p)))
  }

  const handleExcluirModelo = async (id: string): Promise<void> => {
    await supabase.from('protocolo_modelos').delete().eq('id', id)
    setProtocolos((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDuplicarModelo = async (modelo: ProtocoloModelo): Promise<ProtocoloModelo | null> => {
    return handleCriarModelo({
      nome: `${modelo.nome} (cópia)`,
      descricao: modelo.descricao,
      instrucoes: modelo.instrucoes,
      isTemplate: false,
      perguntas: modelo.perguntas,
      interpretacoes: modelo.interpretacoes,
    })
  }

  const handleSalvarAplicacao = async (
    apl: Omit<ProtocoloAplicacaoData, 'id' | 'userId' | 'dataCriacao'>
  ): Promise<ProtocoloAplicacaoData | null> => {
    const payload = {
      modelo_id: apl.modeloId,
      aprendente_id: apl.aprendenteId,
      user_id: userId,
      sessao_id: apl.sessaoId ?? null,
      respostas: apl.respostas,
      escore_total: apl.escoreTotal ?? null,
      interpretacao: apl.interpretacao ?? null,
      paragrafo_laudo: apl.paragrafaLaudo ?? null,
      observacoes: apl.observacoes ?? null,
      data_aplicacao: apl.dataAplicacao,
    }
    const { data: res } = await supabase.from('protocolo_aplicacoes').insert([payload]).select().single()
    if (res) return parseAplicacaoFromSupa(res, apl.modeloNome)
    return null
  }

  const loadAplicacoesAprendente = async (aprendenteId: string): Promise<ProtocoloAplicacaoData[]> => {
    const { data } = await supabase
      .from('protocolo_aplicacoes')
      .select('*, protocolo_modelos(nome)')
      .eq('aprendente_id', aprendenteId)
      .order('data_aplicacao', { ascending: false })
    if (!data) return []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((d: any) => parseAplicacaoFromSupa(d, d.protocolo_modelos?.nome))
  }

  // ── Protocolos state ────────────────────────────────────
  const [protocolos, setProtocolos] = useState<ProtocoloModelo[]>([])

  useEffect(() => {
    const fetchProtocolos = async () => {
      const { data } = await supabase
        .from('protocolo_modelos')
        .select('*')
        .order('is_template', { ascending: false })
        .order('data_criacao', { ascending: false })
      if (data) setProtocolos(data.map(parseModeloFromSupa))
    }
    fetchProtocolos()
  }, [userId])

  // ── Sessão modal state compartilhado ──
  const [, setSelectedSessaoId] = useState<string | null>(null)

  // ──────────────────────────────────────
  // Aprendente Handlers
  // ──────────────────────────────────────

  const handleSubmitNovoAprendente = async (formData: FormData, ageOrDate: string, phone: string) => {
    const pinCode = Math.floor(100000 + Math.random() * 900000).toString()
    const dbPayload = {
      nome: formData.get('nome') as string,
      data_ou_idade: ageOrDate,
      responsavel_1: formData.get('resp1') as string,
      responsavel_2: formData.get('resp2') as string,
      contato: phone,
      motivo: formData.get('motivo') as string,
      metodo_pagamento: formData.get('metodoPagamento') as string,
      status: 'ativo',
      magic_pin: pinCode,
      user_id: userId,
    }
    const { data } = await supabase.from('aprendentes').insert([dbPayload]).select().single()
    if (data) addAprendente(parseApFromSupa(data))
  }

  const handleSalvarDetalhes = async (
    formData: FormData,
    config: {
      confTipoSessao: string
      confQtd: number | ''
      confFormaPagamento: string
      confValor: string
      confDuracao: string
      ageOrDate: string
      phone: string
    },
    aprendente: Aprendente
  ): Promise<Aprendente | null> => {
    // Diagnósticos: campo de texto com vírgulas → array
    const diagnosticosRaw = (formData.get('diagnosticos_previos') as string) || ''
    const diagnosticosArray = diagnosticosRaw
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)

    const updatePayload = {
      // Dados Pessoais
      nome: (formData.get('nome') as string) || aprendente.nome,
      data_ou_idade: config.ageOrDate || aprendente.dataOuIdade,
      responsavel_1: (formData.get('resp1') as string) || aprendente.responsavel1,
      responsavel_2: (formData.get('resp2') as string) || aprendente.responsavel2,
      contato: config.phone || aprendente.contato,
      motivo: (formData.get('motivo') as string) || aprendente.motivo,
      email: (formData.get('email') as string) || null,
      metodo_pagamento: (formData.get('metodoPagamento') as string) || aprendente.metodoPagamento,
      // Configuração de Sessões
      tipo_sessao: config.confTipoSessao,
      qtd_sessoes_avaliacao: config.confTipoSessao === 'Avaliação' ? Number(config.confQtd) : null,
      forma_pagamento: config.confFormaPagamento,
      valor_referencia: config.confValor,
      duracao_minutos: config.confDuracao,
      // Anamnese Clínica
      queixa_principal: (formData.get('queixa_principal') as string) || null,
      historico_desenvolvimento: (formData.get('historico_desenvolvimento') as string) || null,
      historico_escolar: (formData.get('historico_escolar') as string) || null,
      historico_familiar: (formData.get('historico_familiar') as string) || null,
      medicacoes: (formData.get('medicacoes') as string) || null,
      diagnosticos_previos: diagnosticosArray.length > 0 ? diagnosticosArray : null,
      profissionais_acompanhamento: (formData.get('profissionais_acompanhamento') as string) || null,
      // Rede de Suporte
      medico: (formData.get('medico') as string) || null,
      contato_medico: (formData.get('contato_medico') as string) || null,
      escola: (formData.get('escola') as string) || null,
      contato_escola: (formData.get('contato_escola') as string) || null,
      contato_professor: (formData.get('contato_professor') as string) || null,
    }

    const { data } = await supabase
      .from('aprendentes')
      .update(updatePayload)
      .eq('id', aprendente.id)
      .select()
      .single()

    if (data) {
      const atualizado = parseApFromSupa(data)
      updateAprendente(atualizado)
      return atualizado
    }
    return null
  }

  const handleEncerrar = async (motivo: string, aprendente: Aprendente) => {
    const dataIso = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('aprendentes')
      .update({ status: 'inativo', motivo_encerramento: motivo, data_encerramento: dataIso })
      .eq('id', aprendente.id)
      .select()
      .single()

    if (data) updateAprendente(parseApFromSupa(data))

    const hojeIso = new Date().toISOString().split('T')[0]
    await supabase
      .from('sessoes')
      .delete()
      .eq('aprendente_id', aprendente.id)
      .eq('status', 'agendado')
      .gte('data_realizacao', hojeIso)

    removeFutureSessions(aprendente.id)
  }

  const handleExcluirAprendente = async (aprendente: Aprendente) => {
    await supabase.from('aprendentes').delete().eq('id', aprendente.id)
    removeAprendente(aprendente.id)
  }

  // ──────────────────────────────────────
  // Sessão Handlers
  // ──────────────────────────────────────

  const handleIniciarAtendimento = async (id: string) => {
    const { data } = await supabase.from('sessoes').update({ status: 'andamento' }).eq('id', id).select().single()
    if (data) updateSessaoStatus(id, 'andamento')
  }

  const handleMarcarComoPago = async (id: string) => {
    const { data } = await supabase.from('sessoes').update({ status: 'pago' }).eq('id', id).select().single()
    if (data) updateSessaoStatus(id, 'pago')
    setSelectedSessaoId(null)
  }

  const handleCancelarSessao = async (id: string) => {
    const { data } = await supabase.from('sessoes').update({ status: 'cancelado' }).eq('id', id).select().single()
    if (data) updateSessaoStatus(id, 'cancelado')
  }

  const handleRemarcarSessao = async (sessao: SessaoAgenda, novaData: string, novaHora: string) => {
    if (!novaData || !novaHora) return

    await supabase.from('sessoes').update({ status: 'remarcado' }).eq('id', sessao.id)

    const ap = aprendentes.find((a) => a.id === sessao.aprendenteId)
    const duracao = parseInt(ap?.duracaoMinutos || '45', 10)

    const novaSessao = {
      aprendente_id: sessao.aprendenteId,
      nome_aprendente: sessao.nomeAprendente,
      tipo_sessao: sessao.tipoSessao,
      data_realizacao: novaData,
      hora_inicio: novaHora,
      hora_fim: calcularHoraFim(novaHora, duracao),
      status: 'agendado',
      valor: sessao.valor,
      user_id: userId,
    }

    const { data: novaSesData } = await supabase.from('sessoes').insert([novaSessao]).select().single()

    updateSessaoStatus(sessao.id, 'remarcado')
    if (novaSesData) addSessoes([parseSesFromSupa(novaSesData)])
  }

  const handleSubmitSessao = async (data: string, horaInicio: string, aprendente: Aprendente) => {
    const duracao = parseInt(aprendente.duracaoMinutos || '45', 10)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payloadsSupa: any[] = []
    const isLoteAvaliacao = aprendente.tipoSessao === 'Avaliação' && aprendente.qtdSessoesAvaliacao
    const qtdSessoes = isLoteAvaliacao ? (aprendente.qtdSessoesAvaliacao as number) : 1

    for (let i = 0; i < qtdSessoes; i++) {
      const baseDate = new Date(data + 'T12:00:00')
      baseDate.setDate(baseDate.getDate() + i * 7)
      const dataNovaIso = baseDate.toISOString().split('T')[0]

      const tipoDisplay =
        qtdSessoes > 1
          ? `Avaliação [${i + 1}/${qtdSessoes}]`
          : aprendente.tipoSessao || 'Intervenção'

      payloadsSupa.push({
        aprendente_id: aprendente.id,
        nome_aprendente: aprendente.nome,
        tipo_sessao: tipoDisplay,
        data_realizacao: dataNovaIso,
        hora_inicio: horaInicio,
        hora_fim: calcularHoraFim(horaInicio, duracao),
        status: 'agendado',
        valor: aprendente.valorReferencia || 'R$ 0,00',
        user_id: userId,
      })
    }

    const { data: sesData } = await supabase.from('sessoes').insert(payloadsSupa).select()
    if (sesData) addSessoes(sesData.map(parseSesFromSupa))
  }

  const handleAgendamentoRapido = async (ap: Aprendente, quickDate: string, quickTime: string) => {
    const [vdd, vmm] = quickDate.split('/')
    const now = new Date()
    const monthNow = now.getMonth() + 1
    let year = now.getFullYear()
    if (parseInt(vmm) < monthNow && monthNow - parseInt(vmm) > 3) year++
    const isoDate = `${year}-${vmm.padStart(2, '0')}-${vdd.padStart(2, '0')}`
    const duracao = parseInt(ap.duracaoMinutos || '45', 10)
    const hrInicioFinal = quickTime.includes(':') ? quickTime : quickTime.replace(/(\d{2})(\d{2})/, '$1:$2')

    const dbSessao = {
      aprendente_id: ap.id,
      nome_aprendente: ap.nome,
      tipo_sessao: ap.tipoSessao || 'Sessão',
      data_realizacao: isoDate,
      hora_inicio: hrInicioFinal,
      hora_fim: calcularHoraFim(hrInicioFinal, duracao),
      status: 'agendado',
      valor: ap.valorReferencia || 'R$ 0,00',
      user_id: userId,
    }

    const { data } = await supabase.from('sessoes').insert([dbSessao]).select().single()
    if (data) addSessoes([parseSesFromSupa(data)])
  }

  const handleSalvarNota = async (nota: NotaSessao) => {
    await supabase.from('notas_sessao').insert([{
      sessao_id: nota.sessaoId,
      aprendente_id: nota.aprendenteId,
      tags: nota.tags,
      observacao: nota.observacao ?? null,
      engajamento: nota.engajamento ?? null,
      regulacao_emocional: nota.regulacaoEmocional ?? null,
      atencao_sustentada: nota.atencaoSustentada ?? null,
      user_id: userId,
    }])
  }

  // ── RAN Handlers ─────────────────────────────────────────────────

  const handleCriarRAN = async (aprendenteId: string): Promise<RAN | null> => {
    const payload = {
      aprendente_id: aprendenteId,
      user_id: userId,
      status: 'rascunho',
      secao_queixa: null,
      secao_procedimentos: [],
      secao_resultados: [],
      secao_hipoteses: null,
      secao_recomendacoes: null,
      data_avaliacao: new Date().toISOString().split('T')[0],
    }
    const { data } = await supabase.from('rans').insert([payload]).select().single()
    if (data) return parseRANFromSupa(data)
    return null
  }

  const handleSalvarRAN = async (ran: RAN): Promise<void> => {
    await supabase.from('rans').update({
      secao_queixa: ran.secaoQueixa ?? null,
      secao_procedimentos: ran.secaoProcedimentos ?? [],
      secao_resultados: ran.secaoResultados ?? [],
      secao_hipoteses: ran.secaoHipoteses ?? null,
      secao_recomendacoes: ran.secaoRecomendacoes ?? null,
      data_avaliacao: ran.dataAvaliacao ?? null,
      data_atualizacao: new Date().toISOString(),
    }).eq('id', ran.id)
  }

  const handleFinalizarRAN = async (ran: RAN): Promise<void> => {
    await supabase.from('rans').update({
      status: 'finalizado',
      secao_queixa: ran.secaoQueixa ?? null,
      secao_procedimentos: ran.secaoProcedimentos ?? [],
      secao_resultados: ran.secaoResultados ?? [],
      secao_hipoteses: ran.secaoHipoteses ?? null,
      secao_recomendacoes: ran.secaoRecomendacoes ?? null,
      data_avaliacao: ran.dataAvaliacao ?? null,
      data_atualizacao: new Date().toISOString(),
    }).eq('id', ran.id)
  }

  const loadRANsAprendente = async (aprendenteId: string): Promise<RAN[]> => {
    const { data } = await supabase
      .from('rans')
      .select('*')
      .eq('aprendente_id', aprendenteId)
      .order('data_criacao', { ascending: false })
    if (!data) return []
    return data.map(parseRANFromSupa)
  }

  // ── Encaminhamento Handlers ────────────────────────────────────

  const handleCriarEncaminhamento = async (
    enc: Omit<Encaminhamento, 'id' | 'userId' | 'dataCriacao'>
  ): Promise<Encaminhamento | null> => {
    const { data } = await supabase.from('encaminhamentos').insert([{
      ran_id: enc.ranId ?? null,
      aprendente_id: enc.aprendenteId,
      user_id: userId,
      destinatario: enc.destinatario ?? null,
      especialidade: enc.especialidade,
      motivo: enc.motivo,
      observacoes: enc.observacoes ?? null,
    }]).select().single()
    if (data) return parseEncaminhamentoFromSupa(data)
    return null
  }

  const loadEncaminhamentosAprendente = async (aprendenteId: string): Promise<Encaminhamento[]> => {
    const { data } = await supabase
      .from('encaminhamentos')
      .select('*')
      .eq('aprendente_id', aprendenteId)
      .order('data_criacao', { ascending: false })
    if (!data) return []
    return data.map(parseEncaminhamentoFromSupa)
  }

  // ── PIN Handlers ───────────────────────────────────────────────

  const handleSalvarPIN = async (
    pin: Omit<PIN, 'id' | 'userId' | 'dataCriacao'>
  ): Promise<PIN | null> => {
    const { data } = await supabase.from('pins').insert([{
      ran_id: pin.ranId ?? null,
      aprendente_id: pin.aprendenteId,
      user_id: userId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      objetivos: pin.objetivos as any,
      frequencia: pin.frequencia ?? null,
      duracao_semanas: pin.duracaoSemanas ?? null,
      observacoes: pin.observacoes ?? null,
    }]).select().single()
    if (data) return parsePINFromSupa(data)
    return null
  }

  const loadPINAprendente = async (aprendenteId: string): Promise<PIN | null> => {
    const { data } = await supabase
      .from('pins')
      .select('*')
      .eq('aprendente_id', aprendenteId)
      .order('data_criacao', { ascending: false })
      .limit(1)
      .single()
    if (!data) return null
    return parsePINFromSupa(data)
  }

  // ── Evolução Clínica Handlers ──────────────────────────────────
  const loadNotasSessaoAprendente = async (aprendenteId: string): Promise<NotaSessao[]> => {
    const { data } = await supabase
      .from('notas_sessao')
      .select('*')
      .eq('aprendente_id', aprendenteId)
      .order('created_at', { ascending: true }) // ASC for chronological chart plotting
    if (!data) return []
    return data.map(parseNotaFromSupa)
  }

  // ── Sugestões de Avaliação ─────────────────────────────────────────
  const handleSalvarSugestao = async (
    aprendenteId: string,
    instrumentoId: string,
    status: SugestaoStatus,
    justificativa?: string
  ): Promise<void> => {
    // Upsert: atualiza se já existir o mesmo instrumento para o aprendente
    await supabase.from('sugestoes_protocolos').upsert([
      {
        aprendente_id: aprendenteId,
        user_id: userId,
        instrumento_id: instrumentoId,
        status,
        justificativa: justificativa ?? null,
      },
    ], { onConflict: 'aprendente_id,instrumento_id' })
  }

  const loadSugestoesAprendente = async (aprendenteId: string): Promise<SugestaoSalva[]> => {
    const { data } = await supabase
      .from('sugestoes_protocolos')
      .select('*')
      .eq('aprendente_id', aprendenteId)
      .eq('user_id', userId)
    if (!data) return []
    return data.map((d: any) => ({
      id: d.id,
      aprendenteId: d.aprendente_id,
      userId: d.user_id,
      instrumentoId: d.instrumento_id,
      status: d.status as SugestaoStatus,
      justificativa: d.justificativa,
      dataCriacao: d.data_criacao,
    }))
  }

  // ──────────────────────────────────────
  // Render
  // ──────────────────────────────────────

  return (
    <AppContext.Provider
      value={{
        aprendentes,
        sessoesGlobais,
        loading,
        userId,
        deferredPrompt,
        handleInstallPWA,
        addAprendente,
        updateAprendente,
        removeAprendente,
        addSessoes,
        updateSessaoStatus,
        setSessoesGlobais,
        removeFutureSessions,
        handleSubmitNovoAprendente,
        handleSalvarDetalhes,
        handleEncerrar,
        handleExcluirAprendente,
        handleIniciarAtendimento,
        handleMarcarComoPago,
        handleCancelarSessao,
        handleRemarcarSessao,
        handleSubmitSessao,
        handleAgendamentoRapido,
        handleSalvarNota,
        // Protocolos
        protocolos,
        handleCriarModelo,
        handleAtualizarModelo,
        handleExcluirModelo,
        handleDuplicarModelo,
        handleSalvarAplicacao,
        loadAplicacoesAprendente,
        // RAN
        handleCriarRAN,
        handleSalvarRAN,
        handleFinalizarRAN,
        loadRANsAprendente,
        // Encaminhamentos
        handleCriarEncaminhamento,
        loadEncaminhamentosAprendente,
        // PIN
        handleSalvarPIN,
        loadPINAprendente,
        // Evolução
        loadNotasSessaoAprendente,
        // Sugestões
        handleSalvarSugestao,
        loadSugestoesAprendente,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

import { useState, useEffect } from 'react'
import { Brain, ChevronDown, ChevronUp, Lightbulb, AlertCircle, Info, ChevronRight } from 'lucide-react'
import { calcularSugestoes, temAnamneseSuficiente } from '../../lib/sugestao'
import { useAppContext } from '../../context/AppContext'
import type { Aprendente } from '../../lib/types'

const PRIORIDADE_CONFIG = {
  alta: { cor: '#ef4444', bg: '#fef2f2', label: 'Alta Prioridade', emoji: '🔴' },
  media: { cor: '#f59e0b', bg: '#fffbeb', label: 'Média Prioridade', emoji: '🟡' },
  baixa: { cor: '#10b981', bg: '#f0fdf4', label: 'Baixa Prioridade', emoji: '🟢' },
}

const DOMINIO_COR: Record<string, string> = {
  leitura: '#6366f1',
  escrita: '#8b5cf6',
  matematica: '#f59e0b',
  atencao: '#3b82f6',
  emocional: '#ec4899',
  socioemocional: '#10b981',
}

export function SugestaoAvaliacaoCard({
  aprendente,
  onNovaAvaliacao,
}: {
  aprendente: Aprendente
  onNovaAvaliacao?: () => void
}) {
  const { handleSalvarSugestao, loadSugestoesAprendente } = useAppContext()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Dismissed: inicia do localStorage (rápido) e sincroniza com Supabase
  const localKey = `sugestao_dismissed_${aprendente.id}`
  const [dismissed, setDismissed] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem(localKey) || '[]'))
  )

  // Carrega status do Supabase ao montar para sincronizar entre dispositivos
  useEffect(() => {
    loadSugestoesAprendente(aprendente.id).then((salvas) => {
      const archivados = salvas
        .filter((s) => s.status === 'dispensado' || s.status === 'aplicado')
        .map((s) => s.instrumentoId)
      if (archivados.length > 0) {
        setDismissed((prev) => {
          const novo = new Set([...prev, ...archivados])
          localStorage.setItem(localKey, JSON.stringify([...novo]))
          return novo
        })
      }
    }).catch(() => { /* offline — usa localStorage */ })
  }, [aprendente.id])

  const handleDismiss = async (id: string, justificativa: string) => {
    const novos = new Set(dismissed)
    novos.add(id)
    setDismissed(novos)
    localStorage.setItem(localKey, JSON.stringify([...novos]))
    // Persiste no Supabase (fire & forget)
    handleSalvarSugestao(aprendente.id, id, 'dispensado', justificativa).catch(() => {})
  }

  const handleAplicar = (s: ReturnType<typeof calcularSugestoes>[0]) => {
    // Salva como 'aplicado' no Supabase
    handleSalvarSugestao(aprendente.id, s.id, 'aplicado', s.justificativa).catch(() => {})
    // Salva contexto para o ProtocolosList
    sessionStorage.setItem(
      'sugestao_ativa',
      JSON.stringify({ id: s.id, nome: s.nome, dominio: s.dominioBadge })
    )
    onNovaAvaliacao?.()
  }

  // Sem dados de anamnese → mostrar CTA
  if (!temAnamneseSuficiente(aprendente)) {
    return (
      <div style={{
        margin: '0 1.25rem 1.5rem',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-warm)',
        border: '1.5px dashed var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <Brain size={28} color="var(--text-light)" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem', marginBottom: '2px' }}>
            Sugestões de Avaliação
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Complete a anamnese do aprendente (queixa principal, histórico escolar ou diagnósticos prévios) para receber sugestões de instrumentos de avaliação.
          </div>
        </div>
      </div>
    )
  }

  const sugestoes = calcularSugestoes(aprendente).filter((s) => !dismissed.has(s.id))

  if (sugestoes.length === 0) return null

  return (
    <section style={{ margin: '0 1.25rem 1.5rem' }}>
      {/* Header da seção */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Brain size={18} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            Sugestões de Avaliação
          </h3>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Baseado na anamnese · {sugestoes.length} instrumento{sugestoes.length > 1 ? 's' : ''} identificado{sugestoes.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Cards de sugestão */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {sugestoes.map((s) => {
          const prio = PRIORIDADE_CONFIG[s.prioridade]
          const dominioColor = DOMINIO_COR[s.dominio] || '#6366f1'
          const isExpanded = expandedId === s.id

          return (
            <div
              key={s.id}
              style={{
                background: 'var(--card-bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-light)',
                borderLeft: `4px solid ${prio.cor}`,
                boxShadow: 'var(--shadow-lux)',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              {/* Linha superior: badge de prioridade + nome + dismiss */}
              <div style={{ padding: '1rem 1rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    {/* Badge de prioridade */}
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.68rem', fontWeight: 800,
                      background: prio.bg, color: prio.cor,
                      borderRadius: '6px', padding: '2px 8px',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      marginBottom: '0.4rem',
                    }}>
                      {prio.emoji} {prio.label}
                    </span>

                    {/* Nome do instrumento */}
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-dark)', lineHeight: 1.2, marginBottom: '0.3rem' }}>
                      {s.nome}
                    </div>

                    {/* Badge de domínio */}
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.72rem', fontWeight: 700,
                      background: `${dominioColor}15`, color: dominioColor,
                      borderRadius: '6px', padding: '2px 8px',
                    }}>
                      {s.dominioBadge}
                    </span>
                  </div>

                  {/* Botão dispensar */}
                  <button
                    onClick={() => handleDismiss(s.id, s.justificativa)}
                    title="Dispensar esta sugestão"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-light)', fontSize: '1.1rem',
                      padding: '4px', borderRadius: '6px', flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Justificativa (sempre visível) */}
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '6px',
                  fontSize: '0.8rem', color: 'var(--text-muted)',
                  background: 'var(--bg-warm)', borderRadius: '8px',
                  padding: '0.5rem 0.75rem', marginBottom: '0.75rem',
                }}>
                  <Info size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{s.justificativa}</span>
                </div>

                {/* Botão Aplicar — só aparece se houver callback */}
                {onNovaAvaliacao && (
                  <button
                    onClick={() => handleAplicar(s)}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      borderRadius: '10px', border: 'none',
                      background: dominioColor, color: 'white',
                      fontWeight: 700, fontSize: '0.88rem',
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '6px',
                      marginBottom: '0.75rem',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Aplicar Protocolo <ChevronRight size={16} />
                  </button>
                )}


                {/* O que busca descobrir — SEMPRE VISÍVEL */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '0.78rem', fontWeight: 800,
                    color: dominioColor,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    marginBottom: '0.4rem',
                  }}>
                    <AlertCircle size={13} />
                    O que busca descobrir
                  </div>
                  <p style={{
                    margin: 0, fontSize: '0.88rem', color: 'var(--text-dark)',
                    lineHeight: 1.6,
                  }}>
                    {s.oBuscaDescobrir}
                  </p>
                </div>

                {/* Botão expandir alternativa */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  style={{
                    width: '100%', padding: '0.6rem 0.75rem',
                    border: '1.5px solid var(--border-light)',
                    borderRadius: '10px', background: 'var(--bg-warm)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lightbulb size={14} color="#f59e0b" />
                    Alternativa sem licença de aplicação
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Alternativa — expandível */}
              {isExpanded && (
                <div style={{
                  padding: '0.75rem 1rem 1rem',
                  borderTop: '1px solid var(--border-light)',
                  background: '#fffbeb',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <p style={{
                    margin: 0, fontSize: '0.88rem', color: '#92400e',
                    lineHeight: 1.65,
                  }}>
                    💡 {s.alternativaSemLicenca}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Aviso clínico */}
      <p style={{
        marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-light)',
        lineHeight: 1.5, fontStyle: 'italic', textAlign: 'center',
      }}>
        Sugestões com base indicativa, não diagnóstica. Avaliação clínica complementar sempre necessária.
      </p>
    </section>
  )
}

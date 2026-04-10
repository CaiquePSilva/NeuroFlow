import { useState, useEffect } from 'react'
import { AlertCircle, Save, CheckCircle, FileText } from 'lucide-react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import { useAppContext } from '../../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import { FRASES_HIPOTESES, FRASES_RECOMENDACOES } from '../../lib/constants'
import type { RAN, SecaoResultadoRAN } from '../../lib/types'

// ─── Tab Button ────────────────────────────────────────────────────
function TabBtn({ active, label, done, onClick }: { active: boolean; label: string; done?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: '0.625rem 0.25rem', border: 'none',
      borderBottom: active ? '3px solid var(--accent-rose)' : '3px solid transparent',
      background: 'transparent',
      color: active ? 'var(--accent-rose)' : done ? 'var(--accent-emerald)' : 'var(--text-muted)',
      fontWeight: active ? 700 : 500,
      cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
      transition: 'all 0.2s',
    }}>
      {done && !active && <CheckCircle size={12} style={{ marginBottom: '-2px' }} />}
      {label}
    </button>
  )
}

// ─── Quick Phrase Inserter ──────────────────────────────────────────
function FrasesRapidas({ frases, onInsert }: { frases: string[]; onInsert: (f: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <button type="button" onClick={() => setOpen(!open)} style={{
        fontSize: '0.78rem', color: 'var(--accent-rose)', fontWeight: 700,
        background: 'none', border: 'none', cursor: 'pointer', padding: '0', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        💬 Frases-modelo {open ? '▲' : '▼'}
      </button>
      {open && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {frases.map((f, i) => (
            <button key={i} type="button" onClick={() => { onInsert(f); setOpen(false) }} style={{
              textAlign: 'left', padding: '0.625rem 0.875rem', borderRadius: '10px',
              border: '1.5px solid var(--border-light)', background: 'var(--card-bg)',
              color: 'var(--text-dark)', fontSize: '0.82rem', cursor: 'pointer',
              fontFamily: 'inherit', lineHeight: 1.4, transition: 'all 0.15s',
            }}>
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────
export function RANEditor() {
  const { aprendenteId, ranId } = useParams<{ aprendenteId: string; ranId?: string }>()
  const navigate = useNavigate()
  const { aprendentes, loadRANsAprendente, handleCriarRAN, handleSalvarRAN, handleFinalizarRAN, loadAplicacoesAprendente } = useAppContext()

  const aprendente = aprendentes.find(a => a.id === aprendenteId)
  const [ran, setRan] = useState<RAN | null>(null)
  const [tab, setTab] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [procedimento, setProcedimento] = useState('')

  // Load or create RAN
  useEffect(() => {
    if (!aprendenteId) return
    if (ranId) {
      loadRANsAprendente(aprendenteId).then(rans => {
        const found = rans.find(r => r.id === ranId)
        if (found) setRan(found)
      })
    } else {
      // Auto-populate from aprendente data
      handleCriarRAN(aprendenteId).then(novo => {
        if (!novo) return
        const ap = aprendentes.find(a => a.id === aprendenteId)
        setRan({
          ...novo,
          secaoQueixa: ap?.queixaPrincipal ?? '',
        })
      })
    }
  }, [aprendenteId, ranId])

  // Load past evaluations to populate results section
  useEffect(() => {
    if (!aprendenteId || !ran) return
    if ((ran.secaoResultados?.length ?? 0) > 0) return
    loadAplicacoesAprendente(aprendenteId).then(aplicacoes => {
      const resultados: SecaoResultadoRAN[] = aplicacoes.map(apl => ({
        protocoloId: apl.modeloId,
        protocoloNome: apl.modeloNome ?? 'Instrumento de Avaliação',
        escore: apl.escoreTotal,
        interpretacao: apl.interpretacao,
        paragrafaIndicativo: apl.paragrafaLaudo
          ?? `Os resultados obtidos com o instrumento "${apl.modeloNome ?? 'avaliação'}" são sugestivos de ${apl.interpretacao ?? 'indicadores a serem analisados'}.`,
        dataAplicacao: apl.dataAplicacao,
      }))
      if (resultados.length > 0) setRan(prev => prev ? { ...prev, secaoResultados: resultados } : prev)
    })
  }, [aprendenteId, ran?.id])

  const update = (partial: Partial<RAN>) => setRan(prev => prev ? { ...prev, ...partial } : prev)

  const handleSave = async (finalize = false) => {
    if (!ran) return
    setSaving(true)
    setError('')
    try {
      if (finalize) {
        if (!ran.secaoHipoteses?.trim()) { setError('Preencha a seção de Hipóteses e Indicativos.'); setTab(5); setSaving(false); return }
        await handleFinalizarRAN(ran)
      } else {
        await handleSalvarRAN(ran)
      }
      navigate(`/aprendentes/${aprendenteId!}/ran/${ran.id}/preview`)
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (!aprendente) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aprendente não encontrado.</div>
  if (!ran) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Criando RAN...</div>

  return (
    <ScreenOverlay>
      <ScreenHeader
        title="RAN"
        subtitle={`Relatório de Avaliação Neuropsicopedagógica · ${aprendente.nome}`}
        onBack={() => navigate(`/aprendentes/${aprendenteId}`)}
        rightAction={
          <button onClick={() => handleSave(false)} disabled={saving} style={{
            padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
            background: 'var(--card-bg)', color: 'var(--accent-rose)',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <Save size={14} /> Salvar
          </button>
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid var(--border-light)', flexShrink: 0 }}>
        <TabBtn active={tab === 1} label="Queixa" done={!!ran.secaoQueixa} onClick={() => setTab(1)} />
        <TabBtn active={tab === 2} label="Procedimentos" done={(ran.secaoProcedimentos?.length ?? 0) > 0} onClick={() => setTab(2)} />
        <TabBtn active={tab === 3} label="Resultados" done={(ran.secaoResultados?.length ?? 0) > 0} onClick={() => setTab(3)} />
        <TabBtn active={tab === 4} label="Hipóteses" done={!!ran.secaoHipoteses} onClick={() => setTab(4)} />
        <TabBtn active={tab === 5} label="Recomendações" done={!!ran.secaoRecomendacoes} onClick={() => setTab(5)} />
      </div>

      <div className="form-scroll-area">
        <div className="form-container">
          {error && (
            <div style={{ background: 'var(--accent-rose-light)', border: '1.5px solid var(--accent-rose)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={18} color="var(--accent-rose)" />
              <span style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.9rem' }}>{error}</span>
            </div>
          )}

          {/* ── Tab 1: Queixa e Histórico ── */}
          {tab === 1 && (
            <div style={{ animation: 'fadeIn 0.2s' }}>
              <div className="form-group">
                <label className="form-label">Data da Avaliação</label>
                <input type="date" className="form-input" value={ran.dataAvaliacao ?? ''}
                  onChange={e => update({ dataAvaliacao: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Queixa Principal e Histórico</label>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                  Descreva a queixa principal relatada no encaminhamento e histórico relevante do desenvolvimento.
                </p>
                <textarea className="form-input" rows={8} value={ran.secaoQueixa ?? ''}
                  onChange={e => update({ secaoQueixa: e.target.value })}
                  placeholder="Descreva a queixa principal, histórico do desenvolvimento, aspectos escolares e familiares relevantes..." />
              </div>
              <button type="button" onClick={() => setTab(2)} className="btn-primary-large">
                Próximo: Procedimentos →
              </button>
            </div>
          )}

          {/* ── Tab 2: Procedimentos ── */}
          {tab === 2 && (
            <div style={{ animation: 'fadeIn 0.2s' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Liste os instrumentos e procedimentos utilizados na avaliação. <strong>Não inclua nomes de testes registrados</strong> — use descrições funcionais.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input className="form-input" value={procedimento} placeholder="Ex: Entrevista de Anamnese, Observação Clínica..."
                  onChange={e => setProcedimento(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && procedimento.trim()) {
                      update({ secaoProcedimentos: [...(ran.secaoProcedimentos ?? []), procedimento.trim()] })
                      setProcedimento('')
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => {
                  if (procedimento.trim()) {
                    update({ secaoProcedimentos: [...(ran.secaoProcedimentos ?? []), procedimento.trim()] })
                    setProcedimento('')
                  }
                }} style={{
                  padding: '0 1.25rem', borderRadius: 'var(--radius-md)', border: 'none',
                  background: 'var(--accent-rose)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  + Add
                </button>
              </div>
              {(ran.secaoProcedimentos ?? []).map((proc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--card-bg)', border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                  <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-dark)' }}>• {proc}</span>
                  <button type="button" onClick={() => update({ secaoProcedimentos: ran.secaoProcedimentos!.filter((_, j) => j !== i) })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)', fontSize: '1.1rem', padding: '0' }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={() => setTab(3)} className="btn-primary-large" style={{ marginTop: '1rem' }}>
                Próximo: Resultados →
              </button>
            </div>
          )}

          {/* ── Tab 3: Resultados e Indicativos ── */}
          {tab === 3 && (
            <div style={{ animation: 'fadeIn 0.2s' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Resultados pré-preenchidos a partir das avaliações registradas no sistema. Edite os parágrafos conforme necessário — use linguagem de <strong>indicativos</strong>, não diagnóstico.
              </p>
              {(ran.secaoResultados ?? []).length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)' }}>
                  <FileText size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 1rem' }} />
                  Nenhuma avaliação aplicada ainda.<br />
                  <span style={{ fontSize: '0.82rem' }}>Aplique protocolos no perfil do aprendente para pré-preencher esta seção.</span>
                </div>
              ) : (
                (ran.secaoResultados ?? []).map((res, i) => (
                  <div key={i} style={{ border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', background: 'var(--card-bg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{res.protocoloNome}</span>
                      {res.escore !== undefined && (
                        <span style={{ fontSize: '0.78rem', background: 'var(--accent-stone-light)', color: 'var(--accent-stone)', padding: '3px 10px', borderRadius: '8px', fontWeight: 700 }}>
                          {res.interpretacao ?? `${res.escore} pts`}
                        </span>
                      )}
                    </div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Parágrafo de Indicativos</label>
                    <textarea rows={3} value={res.paragrafaIndicativo}
                      onChange={e => {
                        const updated = [...(ran.secaoResultados ?? [])]
                        updated[i] = { ...res, paragrafaIndicativo: e.target.value }
                        update({ secaoResultados: updated })
                      }}
                      style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '0.75rem', border: '1.5px solid var(--border-light)', borderRadius: '10px', background: 'var(--bg-light)', color: 'var(--text-dark)', fontFamily: 'inherit', fontSize: '0.88rem', resize: 'vertical', marginTop: '0.4rem' }}
                    />
                  </div>
                ))
              )}
              <button type="button" onClick={() => setTab(4)} className="btn-primary-large" style={{ marginTop: '0.75rem' }}>
                Próximo: Hipóteses →
              </button>
            </div>
          )}

          {/* ── Tab 4: Hipóteses e Indicativos ── */}
          {tab === 4 && (
            <div style={{ animation: 'fadeIn 0.2s' }}>
              <div style={{ background: 'var(--accent-rose-light)', border: '1.5px solid var(--accent-rose)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--accent-rose)', lineHeight: 1.5 }}>
                ⚖️ <strong>Atenção:</strong> Use sempre linguagem de hipóteses e indicativos. Nunca afirme diagnóstico fechado.
              </div>
              <FrasesRapidas
                frases={FRASES_HIPOTESES}
                onInsert={f => update({ secaoHipoteses: (ran.secaoHipoteses ?? '') + (ran.secaoHipoteses ? '\n\n' : '') + f })}
              />
              <div className="form-group">
                <label className="form-label">Hipóteses e Indicativos Clínicos</label>
                <textarea className="form-input" rows={10} value={ran.secaoHipoteses ?? ''}
                  onChange={e => update({ secaoHipoteses: e.target.value })}
                  placeholder="Síntese dos indicativos identificados ao longo do processo avaliativo..." />
              </div>
              <button type="button" onClick={() => setTab(5)} className="btn-primary-large">
                Próximo: Recomendações →
              </button>
            </div>
          )}

          {/* ── Tab 5: Recomendações e Finalização ── */}
          {tab === 5 && (
            <div style={{ animation: 'fadeIn 0.2s' }}>
              <FrasesRapidas
                frases={FRASES_RECOMENDACOES}
                onInsert={f => update({ secaoRecomendacoes: (ran.secaoRecomendacoes ?? '') + (ran.secaoRecomendacoes ? '\n\n' : '') + f })}
              />
              <div className="form-group">
                <label className="form-label">Recomendações</label>
                <textarea className="form-input" rows={8} value={ran.secaoRecomendacoes ?? ''}
                  onChange={e => update({ secaoRecomendacoes: e.target.value })}
                  placeholder="Recomendações para intervenção, encaminhamentos e estratégias de suporte..." />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => handleSave(true)} disabled={saving}
                  className="btn-primary-large"
                  style={{ background: 'var(--accent-emerald)', boxShadow: '0 8px 24px rgba(5,150,105,0.3)' }}>
                  {saving ? 'Finalizando...' : '✓ Finalizar e Visualizar RAN'}
                </button>
                <button type="button" onClick={() => handleSave(false)} disabled={saving}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Salvar Rascunho
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ScreenOverlay>
  )
}

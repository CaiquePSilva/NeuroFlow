import { useState } from 'react'
import { Plus, ChevronUp, ChevronDown, Trash2, BarChart2, CheckSquare, FileText, Hash, AlertCircle } from 'lucide-react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import { useAppContext } from '../../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import { escoreMaximo } from '../../lib/utils'
import type { PerguntaModelo, FaixaInterpretacao, TipoPergunta } from '../../lib/types'

const TIPO_INFO: Record<TipoPergunta, { icon: React.ReactNode; label: string; desc: string; color: string }> = {
  escala:  { icon: <BarChart2 size={22} />,   label: 'Escala',   desc: 'Botões de 0 a 5',          color: '#6366f1' },
  sim_nao: { icon: <CheckSquare size={22} />, label: 'Sim / Não', desc: 'Resposta binária',          color: '#10b981' },
  texto:   { icon: <FileText size={22} />,    label: 'Texto',    desc: 'Campo livre (sem pontuação)',color: '#f59e0b' },
  contador:{ icon: <Hash size={22} />,        label: 'Contador', desc: 'Contagem de eventos',        color: '#ec4899' },
}

const newPergunta = (tipo: TipoPergunta): PerguntaModelo => ({
  id: crypto.randomUUID(),
  texto: '',
  tipo,
  peso: 1,
  escalaMax: 5,
  obrigatorio: true,
})

const newFaixa = (): FaixaInterpretacao => ({
  id: crypto.randomUUID(),
  de: 0,
  ate: 10,
  label: '',
  descricaoLaudo: '',
})

// ─── Tab Button ────────────────────────────────────────────────────
function TabBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: '0.875rem',
        border: 'none',
        borderBottom: active ? '3px solid var(--accent-rose)' : '3px solid transparent',
        background: 'transparent',
        color: active ? 'var(--accent-rose)' : 'var(--text-muted)',
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  )
}

// ─── Tipo Selector Bottom Sheet ─────────────────────────────────────
function TipoSelector({ onSelect, onClose }: { onSelect: (t: TipoPergunta) => void; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: 'var(--bg-light)', borderRadius: '20px 20px 0 0',
        padding: '1.5rem', animation: 'slideUp 0.3s ease',
      }}>
        <h3 style={{ marginBottom: '1.25rem', textAlign: 'center' }}>Tipo de Pergunta</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {(Object.entries(TIPO_INFO) as [TipoPergunta, typeof TIPO_INFO[TipoPergunta]][]).map(([tipo, info]) => (
            <button
              key={tipo}
              type="button"
              onClick={() => { onSelect(tipo); onClose() }}
              style={{
                padding: '1.25rem 1rem',
                borderRadius: '14px',
                border: `2px solid ${info.color}22`,
                background: `${info.color}11`,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ color: info.color, marginBottom: '0.4rem' }}>{info.icon}</div>
              <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{info.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{info.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Pergunta Item Editor ───────────────────────────────────────────
function PerguntaItemEditor({
  pergunta, index, total,
  onChange, onMoveUp, onMoveDown, onDelete,
}: {
  pergunta: PerguntaModelo
  index: number
  total: number
  onChange: (p: PerguntaModelo) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}) {
  const info = TIPO_INFO[pergunta.tipo]
  return (
    <div
      style={{
        border: '1.5px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        background: 'var(--card-bg)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
        background: `${info.color}11`, borderBottom: '1.5px solid var(--border-light)',
      }}>
        <span style={{ color: info.color, flexShrink: 0 }}>{info.icon}</span>
        <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 700, color: info.color }}>{info.label}</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pergunta {index + 1}</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button type="button" onClick={onMoveUp} disabled={index === 0}
            style={{ padding: '4px', border: 'none', background: 'transparent', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}>
            <ChevronUp size={16} color="var(--text-muted)" />
          </button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1}
            style={{ padding: '4px', border: 'none', background: 'transparent', cursor: index === total - 1 ? 'not-allowed' : 'pointer', opacity: index === total - 1 ? 0.3 : 1 }}>
            <ChevronDown size={16} color="var(--text-muted)" />
          </button>
          <button type="button" onClick={onDelete}
            style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <Trash2 size={16} color="var(--accent-rose)" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '0.875rem 1rem' }}>
        <textarea
          value={pergunta.texto}
          onChange={(e) => onChange({ ...pergunta, texto: e.target.value })}
          placeholder="Texto da pergunta..."
          rows={2}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '0.75rem', resize: 'none',
            border: '1.5px solid var(--border-light)', borderRadius: '10px',
            background: 'var(--bg-light)', color: 'var(--text-dark)',
            fontFamily: 'inherit', fontSize: '0.95rem', marginBottom: '0.75rem',
          }}
        />
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Peso</label>
            <input
              type="number" min={0} step={0.5} value={pergunta.peso}
              onChange={(e) => onChange({ ...pergunta, peso: Number(e.target.value) })}
              style={{
                display: 'block', width: '100%', boxSizing: 'border-box',
                padding: '0.5rem 0.75rem', border: '1.5px solid var(--border-light)',
                borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--text-dark)', fontFamily: 'inherit',
              }}
            />
          </div>
          {pergunta.tipo === 'escala' && (
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Máximo</label>
              <input
                type="number" min={1} max={10} value={pergunta.escalaMax ?? 5}
                onChange={(e) => onChange({ ...pergunta, escalaMax: Number(e.target.value) })}
                style={{
                  display: 'block', width: '100%', boxSizing: 'border-box',
                  padding: '0.5rem 0.75rem', border: '1.5px solid var(--border-light)',
                  borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--text-dark)', fontFamily: 'inherit',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────
export function ProtocoloConstrutor() {
  const { handleCriarModelo, handleAtualizarModelo, protocolos } = useAppContext()
  const navigate = useNavigate()
  const { modeloId } = useParams<{ modeloId?: string }>()

  // Pre-fill if editing
  const modeloExistente = modeloId ? protocolos.find((p) => p.id === modeloId) : undefined

  const [tab, setTab] = useState<1 | 2 | 3>(1)
  const [nome, setNome] = useState(modeloExistente?.nome ?? '')
  const [descricao, setDescricao] = useState(modeloExistente?.descricao ?? '')
  const [instrucoes, setInstrucoes] = useState(modeloExistente?.instrucoes ?? '')
  const [perguntas, setPerguntas] = useState<PerguntaModelo[]>(modeloExistente?.perguntas ?? [])
  const [interpretacoes, setInterpretacoes] = useState<FaixaInterpretacao[]>(modeloExistente?.interpretacoes ?? [])
  const [termosAceitos, setTermosAceitos] = useState(!!modeloExistente?.termosAceitosEm)
  const [showTipoSelector, setShowTipoSelector] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isTemplate = modeloExistente?.isTemplate ?? false
  const scoreMax = escoreMaximo(perguntas)

  const addPergunta = (tipo: TipoPergunta) => setPerguntas((prev) => [...prev, newPergunta(tipo)])
  const updatePergunta = (index: number, updated: PerguntaModelo) =>
    setPerguntas((prev) => prev.map((p, i) => (i === index ? updated : p)))
  const deletePergunta = (index: number) => setPerguntas((prev) => prev.filter((_, i) => i !== index))
  const moveUp = (index: number) => {
    if (index === 0) return
    setPerguntas((prev) => { const arr = [...prev]; [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]; return arr })
  }
  const moveDown = (index: number) => {
    if (index === perguntas.length - 1) return
    setPerguntas((prev) => { const arr = [...prev]; [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]; return arr })
  }

  const addFaixa = () => setInterpretacoes((prev) => [...prev, newFaixa()])
  const updateFaixa = (index: number, updated: FaixaInterpretacao) =>
    setInterpretacoes((prev) => prev.map((f, i) => (i === index ? updated : f)))
  const deleteFaixa = (index: number) => setInterpretacoes((prev) => prev.filter((_, i) => i !== index))

  const handleSave = async () => {
    setError('')
    if (!nome.trim()) { setError('O nome do protocolo é obrigatório.'); setTab(1); return }
    if (perguntas.length === 0) { setError('Adicione pelo menos uma pergunta.'); setTab(2); return }
    if (!termosAceitos) { setError('Você deve aceitar os termos de responsabilidade.'); setTab(3); return }

    setSaving(true)
    try {
      if (modeloExistente && !isTemplate) {
        await handleAtualizarModelo({ ...modeloExistente, nome, descricao, instrucoes, perguntas, interpretacoes })
      } else {
        await handleCriarModelo({ nome, descricao, instrucoes, isTemplate: false, perguntas, interpretacoes, termosAceitosEm: new Date().toISOString() })
      }
      navigate('/protocolos')
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ScreenOverlay>
        <ScreenHeader
          title={isTemplate ? modeloExistente!.nome : (modeloId ? 'Editar Protocolo' : 'Novo Protocolo')}
          onBack={() => navigate('/protocolos')}
        />

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid var(--border-light)', flexShrink: 0 }}>
          <TabBtn active={tab === 1} label="1 · Info" onClick={() => setTab(1)} />
          <TabBtn active={tab === 2} label="2 · Perguntas" onClick={() => setTab(2)} />
          <TabBtn active={tab === 3} label="3 · Pontuação" onClick={() => setTab(3)} />
        </div>

        <div className="form-scroll-area">
          <div className="form-container">
            {error && (
              <div style={{
                background: 'var(--accent-rose-light)', border: '1.5px solid var(--accent-rose)',
                borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '1.5rem', animation: 'fadeIn 0.2s',
              }}>
                <AlertCircle size={18} color="var(--accent-rose)" />
                <span style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.9rem' }}>{error}</span>
              </div>
            )}

            {/* ── Tab 1: Identificação ── */}
            {tab === 1 && (
              <div style={{ animation: 'fadeIn 0.2s' }}>
                <div className="form-group">
                  <label className="form-label">Nome do Protocolo *</label>
                  <input
                    type="text" className="form-input" value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Rastreio de Atenção e Hiperatividade"
                    disabled={isTemplate}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Descrição <span className="text-muted">(opcional)</span></label>
                  <input
                    type="text" className="form-input" value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Breve descrição do objetivo do protocolo"
                    disabled={isTemplate}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Instruções de Aplicação <span className="text-muted">(opcional)</span></label>
                  <textarea
                    className="form-input" value={instrucoes} rows={4}
                    onChange={(e) => setInstrucoes(e.target.value)}
                    placeholder="Orientações para quem vai aplicar o teste. Ex: aplicar individualmente, sem interferência dos pais..."
                    disabled={isTemplate}
                  />
                </div>
                {!isTemplate && (
                  <button
                    type="button" onClick={() => setTab(2)}
                    className="btn-primary-large" style={{ marginTop: '0.5rem' }}
                  >
                    Próximo: Adicionar Perguntas →
                  </button>
                )}
              </div>
            )}

            {/* ── Tab 2: Perguntas ── */}
            {tab === 2 && (
              <div style={{ animation: 'fadeIn 0.2s' }}>
                {perguntas.length === 0 ? (
                  <div style={{
                    padding: '2.5rem 1rem', textAlign: 'center',
                    color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6,
                  }}>
                    <BarChart2 size={40} style={{ opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
                    Nenhuma pergunta ainda.<br />Clique em "+ Adicionar Pergunta" para começar.
                  </div>
                ) : (
                  perguntas.map((p, i) => (
                    <PerguntaItemEditor
                      key={p.id} pergunta={p} index={i} total={perguntas.length}
                      onChange={(updated) => updatePergunta(i, updated)}
                      onMoveUp={() => moveUp(i)}
                      onMoveDown={() => moveDown(i)}
                      onDelete={() => deletePergunta(i)}
                    />
                  ))
                )}

                {!isTemplate && (
                  <button
                    type="button"
                    onClick={() => setShowTipoSelector(true)}
                    style={{
                      width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)',
                      border: '2px dashed var(--border-light)', background: 'var(--card-bg)',
                      color: 'var(--accent-rose)', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.5rem', fontFamily: 'inherit', fontSize: '0.95rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    <Plus size={18} /> Adicionar Pergunta
                  </button>
                )}

                {perguntas.length > 0 && (
                  <div style={{
                    marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-stone-light)', fontSize: '0.85rem', color: 'var(--text-muted)',
                  }}>
                    <strong>{perguntas.length}</strong> perguntas · Escore máximo possível: <strong>{scoreMax} pontos</strong>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 3: Pontuação & Termos ── */}
            {tab === 3 && (
              <div style={{ animation: 'fadeIn 0.2s' }}>
                {scoreMax > 0 && (
                  <>
                    <div style={{
                      padding: '1rem', borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-stone-light)', marginBottom: '1.5rem',
                      fontSize: '0.9rem', color: 'var(--text-muted)',
                    }}>
                      Escore máximo calculado: <strong style={{ color: 'var(--text-dark)' }}>{scoreMax} pontos</strong>
                    </div>

                    <h4 style={{ marginBottom: '0.75rem' }}>Tabela de Interpretação</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                      Defina os intervalos de pontuação e o que cada intervalo significa clinicamente.
                    </p>

                    {interpretacoes.map((faixa, i) => (
                      <div key={faixa.id} style={{
                        border: '1.5px solid var(--border-light)', borderRadius: 'var(--radius-md)',
                        marginBottom: '0.75rem', padding: '1rem',
                        background: 'var(--card-bg)',
                      }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DE</label>
                            <input type="number" min={0} value={faixa.de}
                              onChange={(e) => updateFaixa(i, { ...faixa, de: Number(e.target.value) })}
                              style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', border: '1.5px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-light)', color: 'var(--text-dark)', fontFamily: 'inherit' }}
                              disabled={isTemplate}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ATÉ</label>
                            <input type="number" min={0} value={faixa.ate}
                              onChange={(e) => updateFaixa(i, { ...faixa, ate: Number(e.target.value) })}
                              style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', border: '1.5px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-light)', color: 'var(--text-dark)', fontFamily: 'inherit' }}
                              disabled={isTemplate}
                            />
                          </div>
                          {!isTemplate && (
                            <button type="button" onClick={() => deleteFaixa(i)}
                              style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', marginTop: '18px' }}>
                              <Trash2 size={16} color="var(--accent-rose)" />
                            </button>
                          )}
                        </div>
                        <input type="text" placeholder="Label: Ex: Nível Leve" value={faixa.label}
                          onChange={(e) => updateFaixa(i, { ...faixa, label: e.target.value })}
                          style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', border: '1.5px solid var(--border-light)', borderRadius: '8px', marginBottom: '0.5rem', background: 'var(--bg-light)', color: 'var(--text-dark)', fontFamily: 'inherit' }}
                          disabled={isTemplate}
                        />
                        <textarea rows={3} placeholder="Parágrafo para o laudo: Ex: Os resultados indicam presença de sintomas em grau leve..." value={faixa.descricaoLaudo}
                          onChange={(e) => updateFaixa(i, { ...faixa, descricaoLaudo: e.target.value })}
                          style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem', border: '1.5px solid var(--border-light)', borderRadius: '8px', resize: 'vertical', background: 'var(--bg-light)', color: 'var(--text-dark)', fontFamily: 'inherit' }}
                          disabled={isTemplate}
                        />
                      </div>
                    ))}

                    {!isTemplate && (
                      <button type="button" onClick={addFaixa}
                        style={{
                          width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)',
                          border: '2px dashed var(--border-light)', background: 'transparent',
                          color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        }}>
                        <Plus size={16} /> Adicionar Faixa
                      </button>
                    )}
                  </>
                )}

                {!isTemplate && (
                  <>
                    <div style={{
                      marginTop: '2rem', padding: '1.25rem', borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-light)', background: 'var(--card-bg)',
                    }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox" checked={termosAceitos}
                          onChange={(e) => setTermosAceitos(e.target.checked)}
                          style={{ marginTop: '3px', accentColor: 'var(--accent-rose)', width: '18px', height: '18px', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Confirmo que tenho autorização para utilizar os critérios deste instrumento de avaliação
                          e assumo a <strong>responsabilidade técnica e legal</strong> pelo uso clínico desta ferramenta.
                        </span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !termosAceitos}
                      className="btn-primary-large"
                      style={{ marginTop: '1.5rem', opacity: (!termosAceitos || saving) ? 0.5 : 1 }}
                    >
                      {saving ? 'Salvando...' : (modeloId ? 'Salvar Alterações' : 'Publicar Protocolo')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </ScreenOverlay>

      {showTipoSelector && (
        <TipoSelector
          onSelect={addPergunta}
          onClose={() => setShowTipoSelector(false)}
        />
      )}
    </>
  )
}

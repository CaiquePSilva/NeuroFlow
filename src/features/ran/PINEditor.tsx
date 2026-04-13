import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Sparkles } from 'lucide-react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import { useAppContext } from '../../context/AppContext'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { ObjetivoIntervencao } from '../../lib/types'

export function PINEditor() {
  const { aprendenteId } = useParams<{ aprendenteId: string }>()
  const [searchParams] = useSearchParams()
  const ranId = searchParams.get('ranId')
  const navigate = useNavigate()
  const { aprendentes, loadRANsAprendente, handleSalvarPIN } = useAppContext()

  const aprendente = aprendentes.find(a => a.id === aprendenteId)
  
  const [objetivos, setObjetivos] = useState<ObjetivoIntervencao[]>([])
  const [frequencia, setFrequencia] = useState('2x por semana')
  const [duracao, setDuracao] = useState(12)
  const [obs, setObs] = useState('')
  const [saving, setSaving] = useState(false)

  // Auto-suggest goals based on RAN if available
  useEffect(() => {
    if (ranId && aprendenteId) {
      loadRANsAprendente(aprendenteId).then(rans => {
        const ran = rans.find(r => r.id === ranId)
        if (ran && ran.secaoResultados && objetivos.length === 0) {
          const suggestions: ObjetivoIntervencao[] = []
          ran.secaoResultados.forEach(res => {
            // Se o score for baixo ou houver uma interpretação negativa
            if (res.interpretacao?.toLowerCase().includes('moderado') || 
                res.interpretacao?.toLowerCase().includes('acentuado') ||
                res.interpretacao?.toLowerCase().includes('baixo')) {
              
              suggestions.push({
                id: Math.random().toString(36).substr(2, 9),
                area: res.protocoloNome,
                objetivo: `Desenvolver estratégias de compensação e estimulação para ${res.protocoloNome.toLowerCase()}.`,
                estrategia: 'Atividades lúdicas estruturadas e treino cognitivo.',
                prazo: '3 meses'
              })
            }
          })
          if (suggestions.length > 0) setObjetivos(suggestions)
        }
      })
    }
  }, [ranId, aprendenteId])

  const addObjetivo = () => {
    setObjetivos([...objetivos, {
      id: Math.random().toString(36).substr(2, 9),
      area: '',
      objetivo: '',
      estrategia: '',
      prazo: '3 meses'
    }])
  }

  const updateObjetivo = (id: string, partial: Partial<ObjetivoIntervencao>) => {
    setObjetivos(objetivos.map(obj => obj.id === id ? { ...obj, ...partial } : obj))
  }

  const removeObjetivo = (id: string) => {
    setObjetivos(objetivos.filter(obj => obj.id !== id))
  }

  const handleSave = async () => {
    if (!aprendenteId || objetivos.length === 0) return
    setSaving(true)
    await handleSalvarPIN({
      aprendenteId,
      ranId: ranId || undefined,
      objetivos,
      frequencia,
      duracaoSemanas: duracao,
      observacoes: obs
    })
    setSaving(false)
    navigate(`/aprendentes/${aprendenteId}`)
  }

  if (!aprendente) return <div style={{ padding: '2rem', textAlign: 'center' }}>Aprendente não encontrado.</div>

  return (
    <ScreenOverlay>
      <ScreenHeader
        title="Plano de Intervenção (PIN)"
        subtitle={aprendente.nome}
        onBack={() => navigate(-1)}
        rightAction={
          <button onClick={handleSave} disabled={saving || objetivos.length === 0} style={{
            padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
            background: 'var(--accent-rose)', color: 'white',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
            opacity: (saving || objetivos.length === 0) ? 0.6 : 1,
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Save size={14} /> {saving ? 'Salvando...' : 'Salvar PIN'}
          </button>
        }
      />

      <div className="form-scroll-area">
        <div className="form-container">
          
          <div style={{ 
            background: 'var(--accent-stone-light)', 
            padding: '1.25rem', 
            borderRadius: 'var(--radius-lg)', 
            marginBottom: '1.5rem',
            border: '1.5px solid var(--border-light)',
            display: 'flex', gap: '1rem', alignItems: 'flex-start'
          }}>
            <Sparkles size={24} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-dark)', marginBottom: '4px' }}>Sugestões Inteligentes Ativas</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {ranId 
                  ? 'Os objetivos iniciais foram sugeridos com base nos resultados do relatório RAN selecionado.' 
                  : 'O PIN estruturado aumenta o engajamento da família no tratamento a longo prazo.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Metas e Estratégias</h3>
            <button onClick={addObjetivo} style={{
              background: 'var(--accent-rose-light)', color: 'var(--accent-rose)',
              border: 'none', padding: '0.5rem 0.8rem', borderRadius: '8px',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <Plus size={16} /> Novo Objetivo
            </button>
          </div>

          {objetivos.length === 0 && (
            <div style={{ 
              padding: '3rem 1.5rem', textAlign: 'center', 
              border: '2px dashed var(--border-light)', borderRadius: 'var(--radius-lg)',
              color: 'var(--text-muted)'
            }}>
              Nenhum objetivo definido. Clique em "Add Objetivo" para começar.
            </div>
          )}

          {objetivos.map((obj, i) => (
            <div key={obj.id} style={{
              background: 'var(--card-bg)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1rem',
              animation: 'fadeIn 0.2s ease forwards'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ 
                  background: 'var(--accent-rose)', color: 'white', 
                  width: '24px', height: '24px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800
                }}>
                  {i + 1}
                </span>
                <button onClick={() => removeObjetivo(obj.id)} style={{
                  background: 'none', border: 'none', color: 'var(--accent-rose)',
                  cursor: 'pointer', padding: 0
                }}>
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Área de Intervenção</label>
                <input 
                  type="text" className="form-input" placeholder="Ex: Atenção Sustentada"
                  value={obj.area} onChange={e => updateObjetivo(obj.id, { area: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Objetivo Específico</label>
                <textarea 
                  className="form-input" rows={2} placeholder="O que o aprendente deve alcançar?"
                  value={obj.objetivo} onChange={e => updateObjetivo(obj.id, {  objetivo: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Estratégia Principal</label>
                  <input 
                    type="text" className="form-input" placeholder="Como trabalhar?"
                    value={obj.estrategia} onChange={e => updateObjetivo(obj.id, { estrategia: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Prazo</label>
                  <input 
                    type="text" className="form-input" placeholder="3 meses"
                    value={obj.prazo} onChange={e => updateObjetivo(obj.id, { prazo: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}

          <div style={{ 
            borderTop: '1.5px solid var(--border-light)', 
            marginTop: '1.5rem', 
            paddingTop: '1.5rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'
          }}>
            <div className="form-group">
              <label className="form-label">Frequência Sugerida</label>
              <input 
                type="text" className="form-input" value={frequencia}
                onChange={e => setFrequencia(e.target.value)}
                placeholder="Ex: 2x por semana"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Duração do Plano (semanas)</label>
              <input 
                type="number" className="form-input" value={duracao}
                onChange={e => setDuracao(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observações sobre o Plano</label>
            <textarea 
              className="form-input" rows={3} value={obs}
              onChange={e => setObs(e.target.value)}
              placeholder="Notas adicionais sobre o acompanhamento..."
            />
          </div>

          <div style={{ height: '4rem' }} />

        </div>
      </div>
    </ScreenOverlay>
  )
}

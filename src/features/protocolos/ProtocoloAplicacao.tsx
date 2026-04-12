import { useState } from 'react'
import { CheckCircle, ClipboardCopy } from 'lucide-react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import { useAppContext } from '../../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import { calcularEscore, interpretarEscore, getTodayISO } from '../../lib/utils'
import type { PerguntaModelo, ProtocoloModelo } from '../../lib/types'

// ─── Resposta Input (renders per question type) ────────────────────
function RespostaInput({
  pergunta, value, onChange,
}: { pergunta: PerguntaModelo; value?: number | string; onChange: (v: number | string) => void }) {
  const btnBase: React.CSSProperties = {
    width: '52px', height: '52px', borderRadius: '12px', border: 'none',
    fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  }

  if (pergunta.tipo === 'escala') {
    const max = pergunta.escalaMax ?? 5
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i} type="button" onClick={() => onChange(i)}
            style={{
              ...btnBase,
              background: value === i ? 'var(--accent-rose)' : 'var(--card-bg)',
              color: value === i ? 'white' : 'var(--text-dark)',
              border: `2px solid ${value === i ? 'var(--accent-rose)' : 'var(--border-light)'}`,
              transform: value === i ? 'scale(1.08)' : 'scale(1)',
              boxShadow: value === i ? '0 4px 14px rgba(198,56,89,0.35)' : 'none',
            }}
          >
            {i}
          </button>
        ))}
      </div>
    )
  }

  if (pergunta.tipo === 'sim_nao') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {[
          { label: 'SIM', val: 1, color: '#10b981', lightColor: '#d1fae5' },
          { label: 'NÃO', val: 0, color: '#ef4444', lightColor: '#fee2e2' },
        ].map((opt) => (
          <button
            key={opt.val} type="button" onClick={() => onChange(opt.val)}
            style={{
              padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: 800,
              fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit',
              background: value === opt.val ? opt.color : opt.lightColor,
              color: value === opt.val ? 'white' : opt.color,
              transition: 'all 0.15s ease',
              transform: value === opt.val ? 'scale(1.03)' : 'scale(1)',
              boxShadow: value === opt.val ? `0 4px 14px ${opt.color}55` : 'none',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  if (pergunta.tipo === 'texto') {
    return (
      <textarea
        value={value?.toString() ?? ''} onChange={(e) => onChange(e.target.value)}
        placeholder="Registre as observações clínicas..."
        rows={3}
        style={{
          width: '100%', padding: '0.875rem', borderRadius: '12px',
          border: '1.5px solid var(--border-light)', background: 'var(--card-bg)',
          color: 'var(--text-dark)', fontSize: '1rem', fontFamily: 'inherit',
          resize: 'vertical', boxSizing: 'border-box',
        }}
      />
    )
  }

  if (pergunta.tipo === 'contador') {
    const count = Number(value ?? 0)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center' }}>
        <button
          type="button" onClick={() => onChange(Math.max(0, count - 1))}
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            border: '2px solid var(--border-light)', background: 'var(--card-bg)',
            fontSize: '1.75rem', cursor: 'pointer', color: 'var(--text-dark)', fontFamily: 'inherit',
          }}
        >−</button>
        <span style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--text-dark)', minWidth: '60px', textAlign: 'center' }}>
          {count}
        </span>
        <button
          type="button" onClick={() => onChange(count + 1)}
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            border: 'none', background: 'var(--accent-rose)', color: 'white',
            fontSize: '1.75rem', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 6px 20px rgba(198,56,89,0.4)',
          }}
        >+</button>
      </div>
    )
  }
  return null
}

// ─── Resultado Screen ──────────────────────────────────────────────
function ResultadoScreen({
  modelo,
  escore,
  label,
  paragrafo,
  onSalvar,
  onPular,
  saving,
}: {
  modelo: ProtocoloModelo
  escore: number
  label: string
  paragrafo: string
  onSalvar: (obs: string) => void
  onPular: () => void
  saving: boolean
}) {
  const [obs, setObs] = useState('')
  const [copied, setCopied] = useState(false)

  const copyParagrafo = () => {
    navigator.clipboard.writeText(paragrafo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', padding: '0 0 2rem' }}>
      {/* Score Badge */}
      <div style={{ textAlign: 'center', padding: '2rem 0 1.5rem' }}>
        <div
          style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--accent-emerald-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <CheckCircle size={40} color="var(--accent-emerald)" />
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-dark)' }}>
          {escore}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          pontos de {modelo.perguntas.filter(p => p.tipo !== 'texto').reduce((acc, p) => acc + (p.escalaMax ?? 5) * p.peso, 0)} possíveis
        </div>
      </div>

      {/* Interpretation */}
      {label && (
        <div style={{
          margin: '0 0 1.5rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--accent-stone-light)',
          border: '1.5px solid var(--border-light)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            Classificação
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            {label}
          </div>
        </div>
      )}

      {/* Laudo Paragraph */}
      {paragrafo && (
        <div style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--border-light)',
          background: 'var(--card-bg)',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Parágrafo do Relatório
            </span>
            <button
              type="button"
              onClick={copyParagrafo}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '8px',
                border: '1.5px solid var(--border-light)',
                background: copied ? 'var(--accent-emerald-light)' : 'var(--card-bg)',
                color: copied ? 'var(--accent-emerald)' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit',
              }}
            >
              <ClipboardCopy size={14} />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: 1.6 }}>
            {paragrafo}
          </p>
          <p style={{ margin: '1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
            A responsabilidade técnica pelos critérios de avaliação e interpretação é do profissional de saúde responsável.
          </p>
        </div>
      )}

      {/* Observations */}
      <div className="form-group">
        <label className="form-label">Observações Adicionais <span className="text-muted">(opcional)</span></label>
        <textarea
          className="form-input" rows={3} value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Comportamento durante a aplicação, condições ambientais..."
        />
      </div>

      <button
        type="button"
        onClick={() => onSalvar(obs)}
        disabled={saving}
        className="btn-primary-large"
        style={{ background: 'var(--accent-emerald)', boxShadow: '0 8px 24px rgba(5,150,105,0.3)', marginBottom: '0.75rem' }}
      >
        {saving ? 'Salvando...' : 'Salvar Avaliação ✓'}
      </button>

      <button
        type="button"
        onClick={onPular}
        style={{
          width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--border-light)', background: 'transparent',
          color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Descartar (não salvar)
      </button>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────
export function ProtocoloAplicacao() {
  const { protocolos, handleSalvarAplicacao } = useAppContext()
  const navigate = useNavigate()
  const { aprendenteId, modeloId } = useParams<{ aprendenteId: string; modeloId: string }>()

  const modelo = protocolos.find((p) => p.id === modeloId)
  const [respostas, setRespostas] = useState<Record<string, number | string>>({})
  const [fase, setFase] = useState<'aplicando' | 'resultado'>('aplicando')
  const [escore, setEscore] = useState(0)
  const [interpretacao, setInterpretacao] = useState<{ label: string; paragrafo: string } | null>(null)
  const [saving, setSaving] = useState(false)

  if (!modelo) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Protocolo não encontrado.
      </div>
    )
  }

  const setResposta = (id: string, value: number | string) => {
    setRespostas((prev) => ({ ...prev, [id]: value }))
  }

  const handleFinalizar = () => {
    const sc = calcularEscore(modelo.perguntas, respostas)
    const faixa = interpretarEscore(sc, modelo.interpretacoes)
    setEscore(sc)
    setInterpretacao(faixa ? { label: faixa.label, paragrafo: faixa.descricaoLaudo } : null)
    setFase('resultado')
  }

  const handleSalvar = async (observacoes: string) => {
    setSaving(true)
    await handleSalvarAplicacao({
      modeloId: modelo.id,
      modeloNome: modelo.nome,
      aprendenteId: aprendenteId!,
      respostas,
      escoreTotal: escore,
      interpretacao: interpretacao?.label,
      paragrafaLaudo: interpretacao?.paragrafo,
      observacoes: observacoes || undefined,
      dataAplicacao: getTodayISO(),
    })
    setSaving(false)
    navigate(`/aprendentes/${aprendenteId}`)
  }

  const respondidas = modelo.perguntas.filter((p) => respostas[p.id] !== undefined).length
  const obrigatorias = modelo.perguntas.filter((p) => p.obrigatorio).length
  const todasObrigatorias = modelo.perguntas
    .filter((p) => p.obrigatorio)
    .every((p) => respostas[p.id] !== undefined)

  return (
    <ScreenOverlay>
      <ScreenHeader
        title={modelo.nome}
        subtitle={`${respondidas}/${modelo.perguntas.length} respondidas`}
        onBack={() => {
          if (window.history.length > 2) navigate(-1);
          else navigate(`/aprendentes/${aprendenteId}`);
        }}
      />

      {/* Progress bar */}
      <div style={{ height: '4px', background: 'var(--border-light)', flexShrink: 0 }}>
        <div style={{
          height: '100%', background: 'var(--accent-rose)',
          width: `${(respondidas / (modelo.perguntas.length || 1)) * 100}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>

      <div className="form-scroll-area">
        <div className="form-container">
          {fase === 'aplicando' ? (
            <>
              {/* Instructions */}
              {modelo.instrucoes && (
                <div style={{
                  padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-stone-light)', marginBottom: '1.5rem',
                  fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5,
                }}>
                  📋 {modelo.instrucoes}
                </div>
              )}

              {/* Questions */}
              {modelo.perguntas.map((pergunta, index) => (
                <div
                  key={pergunta.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--border-light)',
                    background: 'var(--card-bg)',
                    marginBottom: '1rem',
                    borderLeft: respostas[pergunta.id] !== undefined ? '4px solid var(--accent-rose)' : '4px solid var(--border-light)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                      display: 'inline-block', fontSize: '0.75rem', fontWeight: 700,
                      color: 'var(--text-muted)', marginBottom: '0.4rem',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {index + 1}. {pergunta.tipo === 'texto' ? 'Observação' : `Escala × ${pergunta.peso}`}
                    </span>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.4, fontSize: '1rem' }}>
                      {pergunta.texto || <em style={{ opacity: 0.5 }}>Pergunta sem texto</em>}
                    </p>
                  </div>
                  <RespostaInput
                    pergunta={pergunta}
                    value={respostas[pergunta.id]}
                    onChange={(v) => setResposta(pergunta.id, v)}
                  />
                </div>
              ))}

              {/* Finalize */}
              <button
                type="button"
                onClick={handleFinalizar}
                disabled={!todasObrigatorias}
                className="btn-primary-large"
                style={{
                  marginTop: '1.5rem',
                  opacity: todasObrigatorias ? 1 : 0.5,
                  background: 'var(--accent-rose)',
                  boxShadow: todasObrigatorias ? '0 8px 24px rgba(198,56,89,0.35)' : 'none',
                }}
              >
                {todasObrigatorias
                  ? 'Ver Resultado →'
                  : `Responda todas as perguntas obrigatórias (${obrigatorias - respondidas} restantes)`
                }
              </button>
            </>
          ) : (
            <ResultadoScreen
              modelo={modelo}
              escore={escore}
              label={interpretacao?.label ?? ''}
              paragrafo={interpretacao?.paragrafo ?? ''}
              onSalvar={handleSalvar}
              onPular={() => {
                if (window.history.length > 2) navigate(-1);
                else navigate(`/aprendentes/${aprendenteId}`);
              }}
              saving={saving}
            />
          )}
        </div>
      </div>
    </ScreenOverlay>
  )
}

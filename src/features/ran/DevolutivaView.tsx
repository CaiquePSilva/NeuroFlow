import { useState, useEffect } from 'react'
import {
  X, Trophy, Target, Heart, Zap, BookOpen, MessageSquare, Sparkles as SparklesIcon,
  ClipboardCheck,
} from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import type { RAN } from '../../lib/types'

// ─── Visual Area Card ──────────────────────────────────────────────
function AreaCard({
  icon, label, color, value, total,
}: { icon: React.ReactNode; label: string; color: string; value: number; total: number }) {
  const pct = Math.round((value / total) * 100)

  return (
    <div style={{
      background: 'var(--card-bg)',
      padding: '1.5rem',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lux)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      border: '1.5px solid var(--border-light)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '14px',
          background: `${color}18`, color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{label}</span>
      </div>

      <div style={{
        position: 'relative', height: '12px',
        background: 'var(--bg-warm)', borderRadius: '6px', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          width: `${pct}%`, background: color, borderRadius: '6px',
          transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)',
      }}>
        <span>Necessita Apoio</span>
        <span>Independente</span>
      </div>
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────
function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{
      background: 'var(--bg-warm)',
      borderRadius: 'var(--radius-lg)',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
      textAlign: 'center',
      border: '1.5px dashed var(--border-light)',
    }}>
      <div style={{ color: 'var(--text-light)', opacity: 0.6 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{title}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{subtitle}</div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────
export function DevolutivaView({
  aprendenteId: propAprendenteId,
  isParentMode,
  onClose,
}: {
  aprendenteId?: string
  isParentMode?: boolean
  onClose?: () => void
} = {}) {
  const params = useParams<{ aprendenteId: string }>()
  const resolvedId = propAprendenteId || params.aprendenteId
  const navigate = useNavigate()
  const { aprendentes, loadRANsAprendente } = useAppContext()

  const aprendente = aprendentes.find(a => a.id === resolvedId)
  const [ran, setRan] = useState<RAN | null>(null)

  useEffect(() => {
    if (resolvedId) {
      loadRANsAprendente(resolvedId).then(rans => {
        const lastFinalized = rans.find(r => r.status === 'finalizado')
        if (lastFinalized) setRan(lastFinalized)
      })
    }
  }, [resolvedId])

  const handleClose = () => {
    if (onClose) onClose()
    else navigate(-1)
  }

  if (!aprendente) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Aprendente não encontrado.
    </div>
  )

  // Mapeia protocolos técnicos para áreas compreensíveis
  const areasMap = [
    { key: 'atencao', label: 'Atenção e Foco', icon: <Target size={22} />, color: '#6366f1', value: 0, total: 0 },
    { key: 'memoria', label: 'Memória', icon: <BookOpen size={22} />, color: '#f59e0b', value: 0, total: 0 },
    { key: 'emocional', label: 'Emocional', icon: <Heart size={22} />, color: '#ec4899', value: 0, total: 0 },
    { key: 'engajamento', label: 'Participação', icon: <Zap size={22} />, color: '#10b981', value: 0, total: 0 },
  ]

  if (ran?.secaoResultados) {
    ran.secaoResultados.forEach(res => {
      const nome = res.protocoloNome.toLowerCase()
      if (nome.includes('atenção') || nome.includes('atencao')) { areasMap[0].value += res.escore || 0; areasMap[0].total += res.escoreMax || 30 }
      else if (nome.includes('comportamento') || nome.includes('emocional')) { areasMap[2].value += res.escore || 0; areasMap[2].total += res.escoreMax || 10 }
      else if (nome.includes('engajamento')) { areasMap[3].value += res.escore || 0; areasMap[3].total += res.escoreMax || 25 }
      else { areasMap[1].value += res.escore || 0; areasMap[1].total += res.escoreMax || 20 }
    })
  }

  // Fallback proporcional se não houver dados reais
  areasMap.forEach(a => { if (a.total === 0) { a.value = 7; a.total = 10 } })

  const temRAN = !!ran
  const nomeAbreviado = aprendente.nome.split(' ')[0]

  // Primeiro parágrafo de hipóteses ou recomendações para usar como destaque
  const trechoDestaque = ran?.secaoHipoteses
    ? ran.secaoHipoteses.split('\n\n')[0].trim()
    : null

  const trechoRecomendacoes = ran?.secaoRecomendacoes
    ? ran.secaoRecomendacoes.split('\n\n')[0].trim()
    : null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'var(--bg-stone)', color: 'var(--text-dark)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <header style={{
        padding: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--card-bg)',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'var(--gradient-rose)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 900,
          }}>
            {aprendente.nome.charAt(0)}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-dark)' }}>
              Olá, família do(a) {nomeAbreviado}!
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
              Veja o desenvolvimento hoje
            </p>
          </div>
        </div>
        <button onClick={handleClose} style={{
          width: '44px', height: '44px', borderRadius: '50%', border: 'none',
          background: 'var(--bg-warm)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-dark)', transition: 'background 0.2s',
        }}>
          <X size={22} />
        </button>
      </header>

      <main style={{ padding: '2rem 1.5rem 4rem', maxWidth: '1000px', margin: '0 auto' }}>

        {/* ── Destaques e Conquistas ── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <Trophy size={26} color="var(--accent-amber)" />
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              Destaques e Conquistas
            </h2>
          </div>

          {temRAN && trechoDestaque ? (
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              padding: '1.75rem', borderRadius: 'var(--radius-lg)', color: 'white',
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
            }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <SparklesIcon size={32} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800 }}>
                  Baseado no seu relatório mais recente
                </h3>
                <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9, lineHeight: 1.6 }}>
                  {trechoDestaque}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<SparklesIcon size={40} />}
              title={temRAN ? 'Relatório sem observações de destaque ainda' : 'Relatório em elaboração'}
              subtitle={
                temRAN
                  ? 'Quando a profissional preencher a seção de hipóteses clínicas, o destaque aparecerá aqui.'
                  : 'Assim que o Relatório de Avaliação (RAN) for finalizado pela equipe, você verá os destaques do desenvolvimento aqui.'
              }
            />
          )}
        </section>

        {/* ── Mapa de Desenvolvimento ── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <Target size={26} color="var(--accent-rose)" />
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              Mapa de Desenvolvimento
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}>
            {areasMap.map(({ key, ...props }) => (
              <AreaCard key={key} {...props} />
            ))}
          </div>

          {!temRAN && (
            <p style={{
              marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)',
              textAlign: 'center', fontStyle: 'italic',
            }}>
              * Estimativa visual. Os valores reais serão exibidos após a finalização do relatório de avaliação.
            </p>
          )}
        </section>

        {/* ── Próximos Passos Juntos ── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <MessageSquare size={26} color="#6366f1" />
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              Próximos Passos Juntos
            </h2>
          </div>

          {temRAN && trechoRecomendacoes ? (
            <div style={{
              background: 'var(--card-bg)', padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border-light)',
              boxShadow: 'var(--shadow-lux)',
            }}>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                "{trechoRecomendacoes}"
              </p>
              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '1px', background: 'var(--border-light)' }} />
                <span style={{
                  fontWeight: 800, color: 'var(--text-light)',
                  fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {aprendente.responsavel1
                    ? `Recomendações para a família de ${nomeAbreviado}`
                    : 'Equipe Clínica'}
                </span>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<ClipboardCheck size={40} />}
              title={temRAN ? 'Recomendações ainda não preenchidas' : 'Aguardando finalização do relatório'}
              subtitle="As recomendações personalizadas da equipe aparecerão aqui assim que o relatório de avaliação for concluído."
            />
          )}
        </section>

      </main>

      {/* Rodapé informativo — sem position: fixed */}
      <footer style={{
        padding: '1.5rem',
        background: 'var(--card-bg)',
        borderTop: '1px solid var(--border-light)',
        textAlign: 'center',
      }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {isParentMode
            ? 'Este é o seu painel visual interativo. O relatório técnico (RAN) completo é mantido pela equipe clínica em prontuário seguro.'
            : 'Este é um resumo visual para acompanhamento familiar. O relatório técnico (RAN) completo está disponível no perfil.'}
        </p>
      </footer>
    </div>
  )
}

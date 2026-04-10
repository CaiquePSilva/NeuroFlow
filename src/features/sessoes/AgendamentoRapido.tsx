import { useState } from 'react'
import { Users } from 'lucide-react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import type { Aprendente } from '../../lib/types'
import { maskQuickDate, maskQuickDateBlur, maskQuickTime, maskQuickTimeBlur } from '../../lib/utils'

interface AgendamentoRapidoProps {
  aprendentes: Aprendente[]
  onBack: () => void
  onSubmit: (aprendente: Aprendente, quickDate: string, quickTime: string) => void
}

export function AgendamentoRapido({ aprendentes, onBack, onSubmit }: AgendamentoRapidoProps) {
  const [step, setStep] = useState<'selecionar' | 'form'>('selecionar')
  const [selectedAp, setSelectedAp] = useState<Aprendente | null>(null)
  const [quickDate, setQuickDate] = useState('')
  const [quickTime, setQuickTime] = useState('')

  const ativos = aprendentes.filter((a) => a.status !== 'inativo')

  const handleSelectAp = (ap: Aprendente) => {
    setSelectedAp(ap)
    setStep('form')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAp || !quickDate || !quickTime || quickDate.length < 5 || quickTime.length < 5) return
    onSubmit(selectedAp, quickDate, quickTime)
  }

  if (step === 'selecionar') {
    return (
      <ScreenOverlay>
        <ScreenHeader title="Para quem é a sessão?" onBack={onBack} />
        <div className="form-scroll-area" style={{ padding: '1.5rem' }}>
          {ativos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Users size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Nenhum aprendente ativo cadastrado.</p>
            </div>
          ) : (
            ativos.map((ap) => (
              <article
                key={ap.id}
                className="lux-card"
                onClick={() => handleSelectAp(ap)}
                style={{ cursor: 'pointer', marginBottom: '1rem', display: 'flex', flexDirection: 'column' }}
              >
                <h3 className="card-title" style={{ marginBottom: '0.25rem', fontSize: '1.3rem' }}>
                  {ap.nome}
                </h3>
                <p className="card-subtitle" style={{ marginTop: '0', color: 'var(--accent-emerald)' }}>
                  {ap.tipoSessao || 'Sessão Padrão'}
                </p>
              </article>
            ))
          )}
        </div>
      </ScreenOverlay>
    )
  }

  // Step: form
  return (
    <ScreenOverlay>
      <ScreenHeader title="Agendar Sessão" subtitle={selectedAp?.nome} onBack={() => setStep('selecionar')} />
      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
      >
        <div className="form-scroll-area">
          <div className="form-container">
            <div
              style={{
                background: 'var(--accent-emerald-light)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2rem',
              }}
            >
              <p style={{ color: 'var(--accent-emerald)', margin: 0, fontSize: '1.1rem' }}>
                <strong>{selectedAp?.tipoSessao || 'Sessão Padrão'}</strong> • Digite números direto, o formato é
                inteligente!
              </p>
            </div>

            <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '1.3rem' }}>
                  Data
                </label>
                <input
                  type="tel"
                  className="form-input"
                  style={{ fontSize: '1.6rem', padding: '1.5rem', textAlign: 'center', letterSpacing: '2px' }}
                  placeholder="10/04"
                  value={quickDate}
                  onChange={(e) => setQuickDate(maskQuickDate(e.target.value, quickDate))}
                  onBlur={() => setQuickDate(maskQuickDateBlur(quickDate))}
                  required
                  autoFocus
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '1.3rem' }}>
                  Hora
                </label>
                <input
                  type="tel"
                  className="form-input"
                  style={{ fontSize: '1.6rem', padding: '1.5rem', textAlign: 'center', letterSpacing: '2px' }}
                  placeholder="14:00"
                  value={quickTime}
                  onChange={(e) => setQuickTime(maskQuickTime(e.target.value, quickTime))}
                  onBlur={() => setQuickTime(maskQuickTimeBlur(quickTime))}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-action-bar">
          <button type="submit" className="btn-primary-large">
            Confirmar e Agendar
          </button>
        </div>
      </form>
    </ScreenOverlay>
  )
}

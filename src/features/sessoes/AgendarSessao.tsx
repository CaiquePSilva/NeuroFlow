import { useState } from 'react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import type { Aprendente } from '../../lib/types'

interface AgendarSessaoProps {
  aprendente: Aprendente
  onBack: () => void
  onSubmit: (data: string, horaInicio: string) => void
}

export function AgendarSessao({ aprendente, onBack, onSubmit }: AgendarSessaoProps) {
  const [agendarData, setAgendarData] = useState('')
  const [agendarHoraInicio, setAgendarHoraInicio] = useState('')

  const isLoteAvaliacao =
    aprendente.tipoSessao === 'Avaliação' && aprendente.qtdSessoesAvaliacao && aprendente.qtdSessoesAvaliacao > 1

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agendarData || !agendarHoraInicio) return
    onSubmit(agendarData, agendarHoraInicio)
  }

  return (
    <ScreenOverlay>
      <ScreenHeader
        title={isLoteAvaliacao ? 'Agendar Lote de Avaliações' : `Agendar ${aprendente.tipoSessao || 'Sessão'}`}
        subtitle={aprendente.nome}
        onBack={onBack}
      />

      <form
        autoComplete="off"
        style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
        onSubmit={handleSubmit}
      >
        <div className="form-scroll-area">
          <div className="form-container">
            <div className="form-group">
              <label className="form-label">
                {isLoteAvaliacao ? 'Data da Primeira Avaliação' : 'Data da Sessão'}
              </label>
              <input
                type="date"
                className="form-input"
                value={agendarData}
                onChange={(e) => setAgendarData(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Horário de Início</label>
              <input
                type="time"
                className="form-input"
                value={agendarHoraInicio}
                onChange={(e) => setAgendarHoraInicio(e.target.value)}
                required
              />
            </div>

            <div
              style={{
                background: 'var(--bg-stone)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                marginTop: '2rem',
              }}
            >
              <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                A duração programada para este aprendente é de{' '}
                <strong>{aprendente.duracaoMinutos || 45} minutos</strong>. O encerramento será calculado
                automaticamente.
              </p>
              {isLoteAvaliacao && (
                <p
                  className="text-muted"
                  style={{
                    fontSize: '1.1rem',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '0.5rem',
                    marginTop: '0.5rem',
                  }}
                >
                  ✨ Por possuir um pacote de Avaliação, a agenda reservará automaticamente{' '}
                  <strong>{aprendente.qtdSessoesAvaliacao} sessões</strong>, repetindo este mesmo dia e horário a cada
                  semana.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bottom-action-bar">
          <button type="submit" className="btn-primary-large">
            Confirmar Agendamento
          </button>
        </div>
      </form>
    </ScreenOverlay>
  )
}

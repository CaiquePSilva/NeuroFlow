import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import type { Aprendente } from '../../lib/types'
import { MOTIVOS_ENCERRAMENTO } from '../../lib/constants'

interface EncerrarAprendenteProps {
  aprendente: Aprendente
  onBack: () => void
  onEncerrar: (motivo: string) => void
}

export function EncerrarAprendente({ aprendente, onBack, onEncerrar }: EncerrarAprendenteProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const motivo = formData.get('motivoEnc') as string
    onEncerrar(motivo)
  }

  return (
    <ScreenOverlay>
      <ScreenHeader
        title="Finalizar Acompanhamento"
        subtitle={`Arquivar ${aprendente.nome}`}
        onBack={onBack}
        titleStyle={{ color: 'var(--accent-rose)' }}
      />

      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
      >
        <div className="form-scroll-area">
          <div className="form-container">
            <div
              style={{
                background: 'var(--accent-rose-light)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2rem',
              }}
            >
              <p style={{ color: 'var(--accent-rose)', margin: 0, fontSize: '1.1rem' }}>
                <strong>Atenção:</strong> Ao arquivar este aprendente, ele sairá da sua lista ativa e{' '}
                <strong>todas as suas sessões futuras agendadas serão automaticamente canceladas e removidas.</strong>
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Por que o acompanhamento está sendo encerrado? <span className="required-asterisk">*</span>
              </label>
              <select name="motivoEnc" className="form-input" required defaultValue="">
                <option value="" disabled>
                  Selecione um motivo...
                </option>
                {MOTIVOS_ENCERRAMENTO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bottom-action-bar">
          <button type="submit" className="btn-primary-large" style={{ background: 'var(--accent-rose)' }}>
            Confirmar e Arquivar
          </button>
        </div>
      </form>
    </ScreenOverlay>
  )
}

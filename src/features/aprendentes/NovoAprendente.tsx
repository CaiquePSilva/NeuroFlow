import { useState } from 'react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import { maskAgeOrDate, maskPhone } from '../../lib/utils'

interface NovoAprendenteProps {
  onBack: () => void
  onSubmit: (formData: FormData, ageOrDate: string, phone: string) => void
}

export function NovoAprendente({ onBack, onSubmit }: NovoAprendenteProps) {
  const [ageOrDate, setAgeOrDate] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onSubmit(formData, ageOrDate, phone)
  }

  return (
    <ScreenOverlay>
      <ScreenHeader title="Novo Aprendente" onBack={onBack} />

      <form
        autoComplete="off"
        style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
        onSubmit={handleSubmit}
      >
        <div className="form-scroll-area">
          <div className="form-container">
            <div className="form-group">
              <label className="form-label">
                Nome Completo do Aprendente <span className="required-asterisk">*</span>
              </label>
              <input type="text" name="nome" className="form-input" placeholder="Ex: Lucas Pereira Silva" required />
            </div>

            <div className="form-group">
              <label className="form-label">
                Idade ou Data de Nascimento <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                name="idade"
                className="form-input"
                placeholder="Ex: 8 ou 15/05/2015"
                value={ageOrDate}
                onChange={(e) => setAgeOrDate(maskAgeOrDate(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Nome do Responsável 1 <span className="required-asterisk">*</span>
              </label>
              <input type="text" name="resp1" className="form-input" placeholder="Ex: Maria Pereira" required />
            </div>

            <div className="form-group">
              <label className="form-label">
                Nome do Responsável 2{' '}
                <span className="text-muted" style={{ fontSize: '0.9rem', marginLeft: '8px' }}>
                  (Opcional)
                </span>
              </label>
              <input type="text" name="resp2" className="form-input" placeholder="Ex: João da Silva" />
            </div>

            <div className="form-group">
              <label className="form-label">
                WhatsApp / Contato <span className="required-asterisk">*</span>
              </label>
              <input
                type="tel"
                name="contato"
                className="form-input"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Motivo Principal <span className="required-asterisk">*</span>
              </label>
              <textarea
                name="motivo"
                className="form-input"
                placeholder="Breve relato ou queixa pedagógica principal..."
                required
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bottom-action-bar">
          <button type="submit" className="btn-primary-large">
            Salvar Cadastro
          </button>
        </div>
      </form>
    </ScreenOverlay>
  )
}

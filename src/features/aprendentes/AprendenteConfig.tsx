import { useState } from 'react'
import { Calendar, Trash2, ChevronDown, ChevronRight, FileText, Settings, Users } from 'lucide-react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import type { Aprendente } from '../../lib/types'
import { maskAgeOrDate, maskPhone, maskMoney } from '../../lib/utils'

interface AprendenteConfigProps {
  aprendente: Aprendente
  onBack: () => void
  onSave: (formData: FormData, config: ConfigState) => void
  onEncerrar: () => void
  onExcluir: () => void
  onAbrirAgendador: () => void
}

export interface ConfigState {
  confTipoSessao: 'Avaliação' | 'Intervenção' | ''
  confQtd: number | ''
  confFormaPagamento: 'Por Sessão' | 'Pacote Mensal' | 'Avaliação Completa' | ''
  confValor: string
  confDuracao: string
  ageOrDate: string
  phone: string
}

// ─── Section toggle helper ───────────────────────────────────
function Section({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      style={{
        marginBottom: '1rem',
        border: '1.5px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          background: open ? 'var(--accent-rose-light)' : 'var(--card-bg)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.2s',
        }}
      >
        <span style={{ color: open ? 'var(--accent-rose)' : 'var(--text-muted)' }}>{icon}</span>
        <span style={{ flex: 1, fontWeight: 700, color: open ? 'var(--accent-rose)' : 'var(--text-dark)', fontSize: '0.95rem' }}>
          {title}
        </span>
        <span style={{ color: open ? 'var(--accent-rose)' : 'var(--text-muted)', transition: 'transform 0.2s', transform: open ? 'rotate(0deg)' : 'none' }}>
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      </button>
      {open && (
        <div style={{ padding: '1.25rem', background: 'var(--bg-light)', animation: 'fadeIn 0.2s ease' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export function AprendenteConfig({
  aprendente,
  onBack,
  onSave,
  onEncerrar,
  onExcluir,
  onAbrirAgendador,
}: AprendenteConfigProps) {
  const [ageOrDate, setAgeOrDate] = useState(aprendente.dataOuIdade || '')
  const [phone, setPhone] = useState(aprendente.contato || '')
  const [confTipoSessao, setConfTipoSessao] = useState<'Avaliação' | 'Intervenção' | ''>(aprendente.tipoSessao || '')
  const [confQtd, setConfQtd] = useState<number | ''>(aprendente.qtdSessoesAvaliacao || '')
  const [confFormaPagamento, setConfFormaPagamento] = useState<'Por Sessão' | 'Pacote Mensal' | 'Avaliação Completa' | ''>(
    aprendente.formaPagamento || ''
  )
  const [confValor, setConfValor] = useState(aprendente.valorReferencia || '')
  const [confDuracao, setConfDuracao] = useState(aprendente.duracaoMinutos || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Calculation helper
  let calculationText = ''
  if (confValor && confFormaPagamento === 'Avaliação Completa' && confTipoSessao === 'Avaliação' && confQtd) {
    const numericValue = parseFloat(confValor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim())
    if (!isNaN(numericValue) && Number(confQtd) > 0) {
      const perSession = (numericValue / Number(confQtd)).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
      calculationText = `O valor total é ${confValor}, equivalente a ${perSession} recebidos por sessão.`
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onSave(formData, { confTipoSessao, confQtd, confFormaPagamento, confValor, confDuracao, ageOrDate, phone })
  }

  return (
    <ScreenOverlay>
      <ScreenHeader
        title={aprendente.nome}
        subtitle="Configuração de Atendimento"
        onBack={onBack}
      />

      <form
        autoComplete="off"
        style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
        onSubmit={handleSubmit}
      >
        <div className="form-scroll-area">
          <div className="form-container">

            {/* ── Magic PIN ── */}
            {aprendente.magicPin && (
              <div
                style={{
                  background: 'var(--accent-stone-light)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  border: '1px dashed var(--accent-stone)',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  CÓDIGO DE ACESSO DOS PAIS:
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-dark)', letterSpacing: '0.2rem', textAlign: 'center' }}>
                  {aprendente.magicPin}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', textAlign: 'center', userSelect: 'all', color: 'var(--text-muted)' }}>
                  https://{window.location.host}/portal/{aprendente.magicPin}
                </p>
              </div>
            )}

            {/* ─────────────────────────────────────────────── */}
            {/* SEÇÃO 1: DADOS PESSOAIS */}
            {/* ─────────────────────────────────────────────── */}
            <Section title="Dados Pessoais" icon={<Users size={18} />} defaultOpen={true}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" name="nome" className="form-input" defaultValue={aprendente.nome} required />
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Idade/Data Nasc.</label>
                  <input
                    type="text"
                    name="idade"
                    className="form-input"
                    value={ageOrDate}
                    onChange={(e) => setAgeOrDate(maskAgeOrDate(e.target.value))}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Contato/WhatsApp</label>
                  <input
                    type="tel"
                    name="contato"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Responsável 1</label>
                  <input type="text" name="resp1" className="form-input" defaultValue={aprendente.responsavel1} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Responsável 2</label>
                  <input type="text" name="resp2" className="form-input" defaultValue={aprendente.responsavel2} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="email" name="email" className="form-input" defaultValue={aprendente.email || ''} placeholder="email@exemplo.com" />
              </div>

              <div className="form-group">
                <label className="form-label">Queixa / Motivo Principal</label>
                <textarea name="motivo" className="form-input" defaultValue={aprendente.motivo} required rows={2} />
              </div>
            </Section>

            {/* ─────────────────────────────────────────────── */}
            {/* SEÇÃO 2: ANAMNESE CLÍNICA */}
            {/* ─────────────────────────────────────────────── */}
            <Section title="Anamnese Clínica" icon={<FileText size={18} />}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Campos de prontuário estruturado (padrão SBNPp). Preenchidos conforme a anamnese inicial.
              </p>

              <div className="form-group">
                <label className="form-label">Queixa Principal (detalhe)</label>
                <textarea
                  name="queixa_principal"
                  className="form-input"
                  defaultValue={aprendente.queixaPrincipal || ''}
                  rows={3}
                  placeholder="Descreva com mais detalhes o motivo do encaminhamento..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Histórico de Desenvolvimento</label>
                <textarea
                  name="historico_desenvolvimento"
                  className="form-input"
                  defaultValue={aprendente.historicoDesen || ''}
                  rows={3}
                  placeholder="Desenvolvimento neuropsicomotor, marcos, intercorrências..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Histórico Escolar</label>
                <textarea
                  name="historico_escolar"
                  className="form-input"
                  defaultValue={aprendente.historicoEscolar || ''}
                  rows={3}
                  placeholder="Desempenho escolar, dificuldades, reprovações, relação com professores..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Histórico Familiar</label>
                <textarea
                  name="historico_familiar"
                  className="form-input"
                  defaultValue={aprendente.historicoFamiliar || ''}
                  rows={3}
                  placeholder="Dinâmica familiar, histórico de transtornos na família..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medicações em Uso</label>
                <input
                  type="text"
                  name="medicacoes"
                  className="form-input"
                  defaultValue={aprendente.medicacoes || ''}
                  placeholder="Ex: Ritalina 10mg, Risperdal 0,5mg..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Diagnósticos Prévios</label>
                <input
                  type="text"
                  name="diagnosticos_previos"
                  className="form-input"
                  defaultValue={(aprendente.diagnosticosPrevios || []).join(', ')}
                  placeholder="Ex: TDAH, Dislexia, TEA — separados por vírgula"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profissionais em Acompanhamento</label>
                <textarea
                  name="profissionais_acompanhamento"
                  className="form-input"
                  defaultValue={aprendente.profissionaisAcompanhamento || ''}
                  rows={2}
                  placeholder="Ex: Psicóloga Dra. Ana Lima, Fonoaudióloga..."
                />
              </div>
            </Section>

            {/* ─────────────────────────────────────────────── */}
            {/* SEÇÃO 3: REDE DE SUPORTE */}
            {/* ─────────────────────────────────────────────── */}
            <Section title="Rede de Suporte" icon={<Users size={18} />}>
              <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Médico Responsável</label>
                  <input type="text" name="medico" className="form-input" defaultValue={aprendente.medico || ''} placeholder="Nome do médico" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Contato do Médico</label>
                  <input type="tel" name="contato_medico" className="form-input" defaultValue={aprendente.contatoMedico || ''} placeholder="(00) 00000-0000" />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Escola</label>
                  <input type="text" name="escola" className="form-input" defaultValue={aprendente.escola || ''} placeholder="Nome da escola" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Contato da Escola</label>
                  <input type="tel" name="contato_escola" className="form-input" defaultValue={aprendente.contatoEscola || ''} placeholder="(00) 00000-0000" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contato do Professor(a)</label>
                <input type="text" name="contato_professor" className="form-input" defaultValue={aprendente.contatoProfessor || ''} placeholder="Nome e contato do professor responsável" />
              </div>
            </Section>

            {/* ─────────────────────────────────────────────── */}
            {/* SEÇÃO 4: CONFIGURAÇÃO DE SESSÕES */}
            {/* ─────────────────────────────────────────────── */}
            <Section title="Configuração de Sessões" icon={<Settings size={18} />}>
              <div style={{ marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={onAbrirAgendador}
                  className="fab-option-label"
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--accent-rose)',
                    border: '2px solid var(--accent-rose-light)',
                    cursor: 'pointer',
                    background: 'var(--card-bg)',
                  }}
                >
                  <Calendar size={20} />
                  {confTipoSessao === 'Avaliação'
                    ? 'Agendar Avaliação'
                    : confTipoSessao === 'Intervenção'
                      ? 'Agendar Intervenção'
                      : 'Agendar Nova Sessão'}
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Sessão</label>
                <select
                  className="form-input"
                  value={confTipoSessao}
                  onChange={(e) => setConfTipoSessao(e.target.value as 'Avaliação' | 'Intervenção' | '')}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Avaliação">Avaliação</option>
                  <option value="Intervenção">Intervenção</option>
                </select>
              </div>

              {confTipoSessao === 'Avaliação' && (
                <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
                  <label className="form-label">Quantidade de Sessões</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ex: 5"
                    value={confQtd}
                    onChange={(e) => setConfQtd(e.target.value ? Number(e.target.value) : '')}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Modelo de Cobrança</label>
                <select
                  className="form-input"
                  value={confFormaPagamento}
                  onChange={(e) =>
                    setConfFormaPagamento(e.target.value as 'Por Sessão' | 'Pacote Mensal' | 'Avaliação Completa' | '')
                  }
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="Por Sessão">Por Sessão</option>
                  <option value="Pacote Mensal">Pacote Mensal</option>
                  <option value="Avaliação Completa">Avaliação Completa</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Forma de Pagamento</label>
                <select name="metodoPagamento" className="form-input" defaultValue={aprendente.metodoPagamento || ''}>
                  <option value="" disabled>Selecione uma opção...</option>
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Doctor Prime">Doctor Prime</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Valor de Referência</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="R$ 0,00"
                  value={confValor}
                  onChange={(e) => setConfValor(maskMoney(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Duração da Sessão <span className="text-muted">(minutos)</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ex: 45 ou 50"
                  value={confDuracao}
                  onChange={(e) => setConfDuracao(e.target.value)}
                  required
                />
              </div>

              {calculationText && (
                <div
                  style={{
                    background: 'var(--accent-emerald-light)',
                    color: 'var(--accent-emerald)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    fontSize: '1.2rem',
                    animation: 'fadeIn 0.3s',
                  }}
                >
                  💡 {calculationText}
                </div>
              )}
            </Section>
          </div>
        </div>

        <div className="bottom-action-bar" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
          <button type="submit" className="btn-primary-large">
            Salvar Alterações
          </button>
          <button
            type="button"
            className="btn-primary-large"
            style={{ background: 'transparent', color: 'var(--accent-rose)', border: '2px solid var(--accent-rose-light)' }}
            onClick={onEncerrar}
          >
            Finalizar Acompanhamento
          </button>
          <button
            type="button"
            className="btn-danger-outline"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Excluir Permanentemente
          </button>
        </div>
      </form>

      {showDeleteConfirm && (
        <ConfirmModal
          title="⚠️ Excluir Aprendente"
          message={
            <>
              Tem certeza que deseja excluir <strong>{aprendente.nome}</strong> permanentemente? Todas as sessões
              vinculadas serão apagadas. <strong>Esta ação não pode ser desfeita.</strong>
            </>
          }
          onConfirm={onExcluir}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </ScreenOverlay>
  )
}

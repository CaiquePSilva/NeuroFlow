import { useState } from 'react'
import { Clock, Play, CheckCircle, Ban, RefreshCw, Calendar } from 'lucide-react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { NotaSessaoSlideUp } from './NotaSessaoSlideUp'
import type { Aprendente, SessaoAgenda, NotaSessao } from '../../lib/types'
import { getPagamentoInfo } from '../../lib/utils'

interface SessaoDetalheModalProps {
  sessao: SessaoAgenda
  aprendentes: Aprendente[]
  isParentMode?: boolean
  onClose: () => void
  onIniciarAtendimento: (id: string) => Promise<void> | void
  onMarcarComoPago: (id: string) => Promise<void> | void
  onCancelarSessao: (id: string) => Promise<void> | void
  onRemarcarSessao: (sessao: SessaoAgenda, novaData: string, novaHora: string) => Promise<void> | void
  onSalvarNota?: (nota: NotaSessao) => Promise<void>
}

export function SessaoDetalheModal({
  sessao,
  aprendentes,
  isParentMode = false,
  onClose,
  onIniciarAtendimento,
  onMarcarComoPago,
  onCancelarSessao,
  onRemarcarSessao,
  onSalvarNota,
}: SessaoDetalheModalProps) {
  const [remarcarData, setRemarcarData] = useState('')
  const [remarcarHora, setRemarcarHora] = useState('')
  const [mostrarNota, setMostrarNota] = useState(false)
  const [statusLocal, setStatusLocal] = useState(sessao.status)

  const ap = aprendentes.find((a) => a.id === sessao.aprendenteId)
  const payInfo = ap ? getPagamentoInfo(ap, []) : { showPayBtn: true, label: 'Finalizar e Marcar como Pago' }

  const handlePagar = async () => {
    await onMarcarComoPago(sessao.id)
    setStatusLocal('pago')
    // Só abre a nota se há handler disponível (modo profissional)
    if (onSalvarNota) {
      setMostrarNota(true)
    }
  }

  const handleSalvarNota = async (nota: NotaSessao) => {
    if (onSalvarNota) await onSalvarNota(nota)
    setMostrarNota(false)
    onClose()
  }

  const handlePularNota = () => {
    setMostrarNota(false)
    onClose()
  }

  return (
    <>
      <ScreenOverlay>
        <ScreenHeader title="Detalhes da Sessão" onBack={onClose} />

        <div className="form-scroll-area">
          <div className="form-container">
            {/* Session Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-full)',
                  background: statusLocal === 'pago' ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)',
                  color: statusLocal === 'pago' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  transition: 'all 0.3s ease',
                }}
              >
                {statusLocal === 'pago' ? <CheckCircle size={36} /> : <Clock size={36} />}
              </div>
              <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>{sessao.nomeAprendente}</h1>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <StatusBadge status={statusLocal} />
              </div>
            </div>

            {/* Session Info Card */}
            <div className="lux-card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>
                    DATA
                  </span>
                  <span style={{ fontWeight: 600 }}>{sessao.dataRealizacao.split('-').reverse().join('/')}</span>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>
                    HORÁRIO
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {sessao.horaInicio} - {sessao.horaFim}
                  </span>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>
                    TIPO
                  </span>
                  <span style={{ fontWeight: 600 }}>{sessao.tipoSessao}</span>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>
                    VALOR
                  </span>
                  <span style={{ fontWeight: 600 }}>{sessao.valor}</span>
                </div>
              </div>
            </div>

            {/* Session Paid Banner */}
            {statusLocal === 'pago' && (
              <div
                style={{
                  background: 'var(--accent-emerald-light)',
                  border: '1.5px solid var(--accent-emerald)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  animation: 'fadeIn 0.4s ease',
                }}
              >
                <CheckCircle size={22} color="var(--accent-emerald)" />
                <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                  Sessão concluída e registrada! ✨
                </span>
              </div>
            )}

            {/* Dynamic Actions */}
            {!isParentMode && statusLocal !== 'pago' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {statusLocal === 'agendado' && (
                  <button
                    className="btn-primary-large"
                    onClick={() => onIniciarAtendimento(sessao.id)}
                    style={{ background: 'var(--accent-blue)', boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.35)' }}
                  >
                    <Play size={18} style={{ marginRight: '8px' }} />
                    Iniciar Atendimento
                  </button>
                )}

                {statusLocal === 'andamento' && (
                  <>
                    {!payInfo.showPayBtn ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '1rem',
                          background: 'var(--accent-emerald-light)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--accent-emerald)',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        {payInfo.label}
                      </div>
                    ) : (
                      <button
                        className="btn-primary-large"
                        onClick={handlePagar}
                        style={{
                          background: 'var(--accent-emerald)',
                          boxShadow: '0 8px 24px -4px rgba(5, 150, 105, 0.35)',
                        }}
                      >
                        <CheckCircle size={18} style={{ marginRight: '8px' }} />
                        {payInfo.label}
                      </button>
                    )}
                  </>
                )}

                {['agendado', 'andamento'].includes(statusLocal) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <button
                      className="btn-danger-outline"
                      onClick={() => onCancelarSessao(sessao.id)}
                      style={{ padding: '1rem' }}
                    >
                      <Ban size={16} />
                      <span style={{ marginLeft: '6px' }}>Cancelar</span>
                    </button>
                    <button
                      className="btn-primary-large"
                      onClick={() => {}}
                      style={{
                        padding: '0.875rem',
                        background: 'transparent',
                        color: 'var(--accent-stone)',
                        border: '1.5px solid var(--border-light)',
                        boxShadow: 'var(--shadow-lux)',
                      }}
                    >
                      <RefreshCw size={16} />
                      <span style={{ marginLeft: '6px' }}>Remarcar</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reschedule Area */}
            {!isParentMode && (statusLocal === 'agendado' || statusLocal === 'remarcado') && (
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1.5px dashed var(--border-light)' }}>
                <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} className="text-muted" />
                  Alterar Data/Hora
                </h3>
                <div className="form-group">
                  <label className="form-label">Nova Data</label>
                  <input
                    type="date"
                    className="form-input"
                    value={remarcarData}
                    onChange={(e) => setRemarcarData(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nova Hora de Início</label>
                  <input
                    type="time"
                    className="form-input"
                    value={remarcarHora}
                    onChange={(e) => setRemarcarHora(e.target.value)}
                  />
                </div>
                <button
                  className="btn-primary-large"
                  onClick={() => onRemarcarSessao(sessao, remarcarData, remarcarHora)}
                  disabled={!remarcarData || !remarcarHora}
                  style={{ opacity: !remarcarData || !remarcarHora ? 0.5 : 1, marginTop: '0.5rem' }}
                >
                  Confirmar Reagendamento
                </button>
              </div>
            )}
          </div>
        </div>
      </ScreenOverlay>

      {/* Nota de Sessão — slide-up após marcar como pago */}
      {mostrarNota && (
        <NotaSessaoSlideUp
          nomeAprendente={sessao.nomeAprendente}
          sessaoId={sessao.id}
          aprendenteId={sessao.aprendenteId}
          onSalvar={handleSalvarNota}
          onPular={handlePularNota}
        />
      )}
    </>
  )
}

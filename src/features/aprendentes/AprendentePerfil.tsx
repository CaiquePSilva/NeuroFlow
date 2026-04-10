import { Clock, CheckCircle, Settings } from 'lucide-react'
import { ScreenOverlay } from '../../components/layout/ScreenOverlay'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { Aprendente, SessaoAgenda } from '../../lib/types'
import { parseMoney, formatCurrency, getPagamentoInfo } from '../../lib/utils'

interface AprendentePerfilProps {
  aprendente: Aprendente
  sessoesGlobais: SessaoAgenda[]
  isParentMode: boolean
  onBack: () => void
  onOpenConfig: () => void
  onOpenSessaoModal: (sessao: SessaoAgenda) => void
  onMarcarComoPago: (id: string) => void
}

export function AprendentePerfil({
  aprendente,
  sessoesGlobais,
  isParentMode,
  onBack,
  onOpenConfig,
  onOpenSessaoModal,
  onMarcarComoPago,
}: AprendentePerfilProps) {
  const sessoesDoAluno = sessoesGlobais
    .filter((s) => s.aprendenteId === aprendente.id)
    .sort((a, b) => a.dataRealizacao.localeCompare(b.dataRealizacao) || a.horaInicio.localeCompare(b.horaInicio))

  const totalPago = sessoesDoAluno.reduce((acc, s) => (s.status === 'pago' ? acc + parseMoney(s.valor) : acc), 0)
  const totalPendente = sessoesDoAluno.reduce(
    (acc, s) => (s.status !== 'pago' ? acc + parseMoney(s.valor) : acc),
    0
  )

  const historico = [...sessoesDoAluno].reverse().slice(0, 5)

  const ehAvaliacao = aprendente.tipoSessao === 'Avaliação'
  const totalSessoes = ehAvaliacao ? aprendente.qtdSessoesAvaliacao || sessoesDoAluno.length : sessoesDoAluno.length
  const concluidas = sessoesDoAluno.filter((s) => s.status === 'pago').length

  return (
    <ScreenOverlay>
      <header className="screen-header" style={{ borderBottom: 'none' }}>
        {!isParentMode && (
          <button className="btn-icon" onClick={onBack} aria-label="Voltar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </button>
        )}
        <div style={{ flex: 1 }}>
          <h2 className="screen-title" style={{ fontSize: '1.25rem' }}>
            Perfil
          </h2>
        </div>
        {!isParentMode && (
          <button
            className="btn-icon"
            style={{ marginRight: 0, color: 'var(--accent-rose)' }}
            onClick={onOpenConfig}
            aria-label="Configurações"
          >
            <Settings size={28} />
          </button>
        )}
      </header>

      <div className="form-scroll-area">
        <div className="form-container" style={{ paddingTop: 0 }}>
          {/* Profile Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--gradient-rose)',
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                marginBottom: '1rem',
                boxShadow: 'var(--shadow-fab)',
              }}
            >
              {aprendente.nome.charAt(0)}
            </div>
            <h2
              style={{
                fontSize: '1.5rem',
                color: 'var(--text-dark)',
                marginBottom: '4px',
                textAlign: 'center',
                fontWeight: 700,
              }}
            >
              {aprendente.nome}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {aprendente.dataOuIdade} {aprendente.dataOuIdade.length <= 2 ? 'anos' : ''} •{' '}
              {aprendente.tipoSessao || 'Sessão Padrão'}
            </p>
          </div>

          {/* Financial Summary */}
          <section className="summary-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="summary-card">
              <div className="summary-value" style={{ fontSize: '1.35rem', color: 'var(--text-dark)' }}>
                {formatCurrency(totalPendente)}
              </div>
              <div className="summary-label">Total em Aberto</div>
            </div>
            <div className="summary-card" style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
              <div className="summary-value" style={{ fontSize: '1.35rem', color: 'var(--accent-emerald)' }}>
                {formatCurrency(totalPago)}
              </div>
              <div className="summary-label">Total Recebido</div>
            </div>
          </section>

          {/* Progress Tracker (Avaliação) */}
          {ehAvaliacao && (
            <div
              style={{
                background: 'var(--card-bg)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-lux)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                  Progresso da Avaliação
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {concluidas} de {totalSessoes} concluídas
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--bg-warm)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (concluidas / Number(totalSessoes)) * 100)}%`,
                    height: '100%',
                    background: 'var(--accent-rose)',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Session History */}
          <h3 className="section-title" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} />
            Trilha de Sessões
          </h3>

          {sessoesDoAluno.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                padding: '2rem 1rem',
                background: 'var(--bg-warm)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-light)',
              }}
            >
              <p style={{ fontSize: '0.9rem' }}>Nenhuma sessão lançada.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {historico.map((s) => {
                const dParts = s.dataRealizacao.split('-')
                const displayDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}` : s.dataRealizacao
                const isPago = s.status === 'pago'
                const { label, showPayBtn } = getPagamentoInfo(aprendente, sessoesGlobais)

                return (
                  <article
                    key={s.id}
                    className={`lux-card ${s.status === 'cancelado' ? 'sessao-cancelada' : ''}`}
                    onClick={() => onOpenSessaoModal(s)}
                    style={{ display: 'flex', alignItems: 'center', padding: '1rem', cursor: 'pointer' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '50px',
                        paddingRight: '0.8rem',
                        borderRight: '1.5px solid var(--border-light)',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '1rem' }}>
                        {displayDate}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {s.horaInicio}
                      </span>
                    </div>

                    <div style={{ flex: 1, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                        {s.tipoSessao}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {s.valor} • <StatusBadge status={s.status} />
                      </span>
                    </div>

                    {!isPago && !isParentMode && showPayBtn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onMarcarComoPago(s.id)
                        }}
                        style={{
                          background: 'var(--accent-emerald-light)',
                          color: 'var(--accent-emerald)',
                          border: 'none',
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        aria-label={label}
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                    {isPago && (
                      <div style={{ color: 'var(--accent-emerald)', width: '38px', display: 'flex', justifyContent: 'center', opacity: 0.7 }}>
                        <CheckCircle size={22} />
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </ScreenOverlay>
  )
}

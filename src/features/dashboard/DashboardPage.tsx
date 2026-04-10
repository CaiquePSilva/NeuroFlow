import { Clock } from 'lucide-react'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { Aprendente, SessaoAgenda } from '../../lib/types'
import { getTodayISO, getGreeting, getDynamicMessage, parseMoney, formatCurrency } from '../../lib/utils'

interface DashboardPageProps {
  aprendentes: Aprendente[]
  sessoesGlobais: SessaoAgenda[]
  onOpenSessaoModal: (sessao: SessaoAgenda) => void
  deferredPrompt: Event | null
  onInstallPWA: () => void
}

export function DashboardPage({
  sessoesGlobais,
  onOpenSessaoModal,
  deferredPrompt,
  onInstallPWA,
}: DashboardPageProps) {
  const todayStr = getTodayISO()
  const hour = new Date().getHours()
  const greeting = getGreeting(hour)

  const todaySessions = sessoesGlobais
    .filter((s) => s.dataRealizacao === todayStr && s.status !== 'cancelado' && s.status !== 'remarcado')
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))

  const previsaoDia = formatCurrency(
    todaySessions.reduce((acc, sessao) => acc + parseMoney(sessao.valor), 0)
  )

  return (
    <>
      {/* Header Greeting */}
      <header className="header-greeting" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: '1.2' }}>
                Espaço NeuroAprendiz
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Elvira Portes</span>
            </div>
          </div>
          {deferredPrompt && (
            <button
              onClick={onInstallPWA}
              style={{
                padding: '0.4rem 0.8rem',
                background: 'var(--accent-rose)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-lux)',
              }}
            >
              Instalar App
            </button>
          )}
        </div>

        <h1 style={{ color: 'var(--accent-rose)', fontSize: '1.8rem', lineHeight: '1.3' }}>
          {greeting}, Elvira!
        </h1>
        <p className="text-muted" style={{ fontSize: '1.15rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
          {getDynamicMessage(hour, todaySessions.length)}
        </p>
      </header>

      {/* Summary Cards */}
      <section className="summary-grid">
        <div className="summary-card">
          <div className="summary-value">{String(todaySessions.length).padStart(2, '0')}</div>
          <div className="summary-label">Consultas Hoje</div>
        </div>
        <div className="summary-card">
          <div
            className="summary-value"
            style={{ color: 'var(--accent-emerald)', fontSize: previsaoDia.length > 10 ? '1.5rem' : '2.2rem' }}
          >
            {previsaoDia}
          </div>
          <div className="summary-label">Previsão do Dia</div>
        </div>
      </section>

      {/* Today's Sessions */}
      <main className="content-area">
        <h2 className="section-title">Próximos Atendimentos</h2>
        {todaySessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Clock size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Nenhum atendimento</h3>
            <p>Você não tem consultas agendadas para hoje.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {todaySessions.map((session) => (
              <article
                key={session.id}
                className="lux-card"
                onClick={() => onOpenSessaoModal(session)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{session.nomeAprendente}</h3>
                    <p className="card-subtitle" style={{ marginTop: '4px' }}>
                      <Clock size={16} />
                      Hoje, {session.horaInicio}
                    </p>
                  </div>
                  <StatusBadge status={session.status} />
                </div>
                <div className="card-footer">
                  <span className="text-muted">{session.tipoSessao}</span>
                  <span className="card-price">{session.valor}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

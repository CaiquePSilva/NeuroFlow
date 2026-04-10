import { useState } from 'react'
import { Clock, BarChart2 } from 'lucide-react'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { Aprendente, SessaoAgenda } from '../../lib/types'
import { getTodayISO, getGreeting, getDynamicMessage, parseMoney, formatCurrency } from '../../lib/utils'
import { FinanceiroDashboard } from './FinanceiroDashboard'

interface DashboardPageProps {
  aprendentes: Aprendente[]
  sessoesGlobais: SessaoAgenda[]
  onOpenSessaoModal: (sessao: SessaoAgenda) => void
  deferredPrompt: Event | null
  onInstallPWA: () => void
}

// ─── Tab Button ──────────────────────────────────────────────────
function TabBtn({
  active, icon, label, onClick,
}: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: '0.625rem 0.5rem',
        border: 'none',
        borderRadius: '10px',
        background: active ? 'var(--accent-rose)' : 'transparent',
        color: active ? 'white' : 'var(--text-muted)',
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        fontSize: '0.82rem',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.35rem',
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 4px 12px rgba(198,56,89,0.35)' : 'none',
      }}
    >
      {icon}
      {label}
    </button>
  )
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
  const [activeTab, setActiveTab] = useState<'hoje' | 'financeiro'>('hoje')

  const todaySessions = sessoesGlobais
    .filter((s) => s.dataRealizacao === todayStr && s.status !== 'cancelado' && s.status !== 'remarcado')
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))

  const previsaoDia = formatCurrency(
    todaySessions.reduce((acc, sessao) => acc + parseMoney(sessao.valor), 0)
  )

  return (
    <>
      {/* Header Greeting */}
      <header className="header-greeting" style={{ marginBottom: '1rem' }}>
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

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'var(--card-bg)',
        border: '1.5px solid var(--border-light)',
        borderRadius: '14px',
        padding: '4px',
        marginBottom: '1.25rem',
      }}>
        <TabBtn
          active={activeTab === 'hoje'}
          icon={<Clock size={14} />}
          label="Hoje"
          onClick={() => setActiveTab('hoje')}
        />
        <TabBtn
          active={activeTab === 'financeiro'}
          icon={<BarChart2 size={14} />}
          label="Financeiro"
          onClick={() => setActiveTab('financeiro')}
        />
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'hoje' ? (
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
      ) : (
        <FinanceiroDashboard
          sessoesGlobais={sessoesGlobais}
        />
      )}
    </>
  )
}

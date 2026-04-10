import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { SessaoAgenda } from '../../lib/types'
import { getTodayISO } from '../../lib/utils'

interface AgendaDiariaProps {
  sessoesGlobais: SessaoAgenda[]
  onOpenSessaoModal: (sessao: SessaoAgenda) => void
}

export function AgendaDiaria({ sessoesGlobais, onOpenSessaoModal }: AgendaDiariaProps) {
  const [selectedAgendaDate, setSelectedAgendaDate] = useState(() => getTodayISO())

  const sessoesDoDia = sessoesGlobais.filter((s) => s.dataRealizacao === selectedAgendaDate)

  return (
    <>
      <header className="header-greeting" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--text-dark)', fontSize: '1.5rem', lineHeight: '1.4', fontWeight: 500 }}>
          Vamos verificar seus próximos compromissos para garantir que nada passe despercebido.
        </h1>
      </header>

      <main className="content-area">
        <section>
          {/* Day Carousel */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              padding: '0.5rem 0 1.5rem 0',
              marginLeft: '-1rem',
              marginRight: '-1rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              scrollbarWidth: 'none',
            }}
          >
            <style>{`::-webkit-scrollbar { display: none; }`}</style>

            {Array.from({ length: 30 }, (_, i) => i - 5).map((offset) => {
              const d = new Date()
              d.setDate(d.getDate() + offset)

              const mm = String(d.getMonth() + 1).padStart(2, '0')
              const dd = String(d.getDate()).padStart(2, '0')
              const isoDate = `${d.getFullYear()}-${mm}-${dd}`

              const isSelected = selectedAgendaDate === isoDate
              const dayStr = d
                .toLocaleDateString('pt-BR', { weekday: 'short' })
                .replace('.', '')
                .toUpperCase()
              const numStr = d.getDate()

              return (
                <div
                  key={offset}
                  onClick={() => setSelectedAgendaDate(isoDate)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '70px',
                    padding: '1rem 0.5rem',
                    background: isSelected ? 'var(--accent-rose)' : 'var(--card-bg)',
                    color: isSelected ? 'white' : 'var(--text-dark)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: isSelected ? 'var(--shadow-fab)' : 'var(--shadow-lux)',
                    border: isSelected ? 'none' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                    }}
                  >
                    {dayStr}
                  </span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 600, marginTop: '4px' }}>{numStr}</span>
                </div>
              )
            })}
          </div>

          <h2 className="section-title">Programação do Dia</h2>

          {sessoesDoDia.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Calendar size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Sua agenda está livre.</h3>
              <p>Nenhuma sessão marcada para este dia.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {sessoesDoDia.map((sessao) => (
                <article
                  key={sessao.id}
                  className={`lux-card ${sessao.status === 'cancelado' ? 'sessao-cancelada' : ''} ${
                    sessao.status === 'remarcado' ? 'sessao-remarcada' : ''
                  }`}
                  style={{ display: 'flex', gap: '1rem', cursor: 'pointer' }}
                  onClick={() => onOpenSessaoModal(sessao)}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '60px',
                      borderRight: '2px solid var(--border-light)',
                      paddingRight: '1rem',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                      {sessao.horaInicio}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {sessao.horaFim}
                    </span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 className="card-title" style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                      {sessao.nomeAprendente}
                    </h3>
                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                      {sessao.tipoSessao}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <StatusBadge status={sessao.status} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

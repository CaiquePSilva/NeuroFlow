import { Users } from 'lucide-react'
import type { Aprendente } from '../../lib/types'

interface AprendentesListProps {
  aprendentes: Aprendente[]
  onSelectAprendente: (ap: Aprendente) => void
}

export function AprendentesList({ aprendentes, onSelectAprendente }: AprendentesListProps) {
  const ativos = aprendentes.filter((a) => a.status !== 'inativo')

  return (
    <>
      <header className="header-greeting" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--text-dark)', fontSize: '1.5rem', lineHeight: '1.4', fontWeight: 500 }}>
          Aqui estão todos os seus aprendentes, Elvira. Você acompanhou alguma novidade recente?
        </h1>
      </header>

      <main className="content-area">
        <h2 className="section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          Meus Aprendentes
          <span
            style={{
              background: 'var(--accent-rose-light)',
              color: 'var(--accent-rose)',
              padding: '0.1rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9rem',
            }}
          >
            {ativos.length}
          </span>
        </h2>

        {ativos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Users size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Nenhum Aprendente</h3>
            <p>Você ainda não possui aprendentes ativos. Use o botão + abaixo para cadastrar.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {ativos.map((ap) => (
              <article
                key={ap.id}
                className="lux-card"
                onClick={() => onSelectAprendente(ap)}
                style={{ cursor: 'pointer' }}
              >
                <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>
                  {ap.nome}
                </h3>
                <p className="card-subtitle" style={{ marginTop: '0', marginBottom: '1rem' }}>
                  {ap.dataOuIdade} {ap.dataOuIdade.length <= 2 ? 'anos' : ''}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} />
                    {ap.responsavel1}
                  </span>
                  {ap.contato && (
                    <a
                      href={`https://wa.me/55${ap.contato.replace(/\D/g, '')}`}
                      target="_blank"
                      className="badge badge-pago"
                      style={{ textDecoration: 'none' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

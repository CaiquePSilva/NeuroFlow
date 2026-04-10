import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { parseApFromSupa, parseSesFromSupa, formatCurrency, parseMoney, getPagamentoInfo } from '../../lib/utils'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { SessaoDetalheModal } from '../sessoes/SessaoDetalheModal'
import type { Aprendente, SessaoAgenda } from '../../lib/types'
import { Clock, CheckCircle, Shield } from 'lucide-react'

export function PortalPais() {
  const { pin } = useParams<{ pin: string }>()
  const [aprendente, setAprendente] = useState<Aprendente | null>(null)
  const [sessoes, setSessoes] = useState<SessaoAgenda[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedSessao, setSelectedSessao] = useState<SessaoAgenda | null>(null)

  useEffect(() => {
    if (!pin) { setNotFound(true); setLoading(false); return }
    const fetchDados = async () => {
      setLoading(true)
      const { data: apData } = await supabase
        .from('aprendentes')
        .select('*')
        .eq('magic_pin', pin)
        .single()

      if (!apData) { setNotFound(true); setLoading(false); return }

      const parsedAp = parseApFromSupa(apData)
      const { data: sesDb } = await supabase
        .from('sessoes')
        .select('*')
        .eq('aprendente_id', apData.id)
        .order('data_realizacao', { ascending: false })

      setAprendente(parsedAp)
      setSessoes(sesDb ? sesDb.map(parseSesFromSupa) : [])
      setLoading(false)
    }
    fetchDados()
  }, [pin])

  const handleMarcarComoPago = async (id: string) => {
    const { data } = await supabase.from('sessoes').update({ status: 'pago' }).eq('id', id).select().single()
    if (data) {
      setSessoes((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'pago' } : s)))
      setSelectedSessao(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-light)', borderTopColor: 'var(--accent-rose)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Carregando portal...</p>
      </div>
    )
  }

  if (notFound || !aprendente) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.4rem', fontWeight: 700 }}>Acesso não encontrado</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.5 }}>
          Verifique o link enviado pela profissional. O código de acesso pode ter expirado.
        </p>
      </div>
    )
  }

  const totalPago = sessoes.reduce((acc, s) => (s.status === 'pago' ? acc + parseMoney(s.valor) : acc), 0)
  const totalPendente = sessoes.reduce((acc, s) => (s.status !== 'pago' && s.status !== 'cancelado' ? acc + parseMoney(s.valor) : acc), 0)
  const { showPayBtn } = getPagamentoInfo(aprendente, sessoes)
  const concluidas = sessoes.filter((s) => s.status === 'pago').length
  const ehAvaliacao = aprendente.tipoSessao === 'Avaliação'
  const totalSessoes = ehAvaliacao ? aprendente.qtdSessoesAvaliacao || sessoes.length : sessoes.length

  return (
    <div className="mobile-container" style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* Header Portal */}
      <header style={{
        background: 'var(--gradient-rose)',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        padding: '1.5rem 1.25rem 2rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-fab)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Shield size={18} color="rgba(255,255,255,0.8)" />
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.05em' }}>
            PORTAL DOS RESPONSÁVEIS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 700, color: 'white',
            flexShrink: 0,
          }}>
            {aprendente.nome.charAt(0)}
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700, marginBottom: '2px' }}>
              {aprendente.nome}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
              {aprendente.dataOuIdade}{aprendente.dataOuIdade.length <= 2 ? ' anos' : ''} • {aprendente.tipoSessao || 'Sessão'}
            </p>
          </div>
        </div>
      </header>

      <div className="form-container" style={{ paddingTop: 0 }}>
        {/* Resumo Financeiro */}
        <section className="summary-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="summary-card">
            <div className="summary-value" style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>
              {formatCurrency(totalPendente)}
            </div>
            <div className="summary-label">Em Aberto</div>
          </div>
          <div className="summary-card" style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
            <div className="summary-value" style={{ fontSize: '1.25rem', color: 'var(--accent-emerald)' }}>
              {formatCurrency(totalPago)}
            </div>
            <div className="summary-label">Total Pago</div>
          </div>
        </section>

        {/* Progresso (Avaliação) */}
        {ehAvaliacao && (
          <div style={{
            background: 'var(--card-bg)', padding: '1.25rem',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)',
            marginBottom: '1.5rem', boxShadow: 'var(--shadow-lux)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>Progresso da Avaliação</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{concluidas} de {totalSessoes}</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-warm)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, (concluidas / Number(totalSessoes)) * 100)}%`,
                height: '100%', background: 'var(--accent-rose)', borderRadius: '4px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        )}

        {/* Trilha de Sessões */}
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Clock size={16} />
          Trilha de Sessões
        </h3>

        {sessoes.length === 0 ? (
          <div style={{
            textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem 1rem',
            background: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-light)',
          }}>
            <p style={{ fontSize: '0.9rem' }}>Nenhuma sessão registrada ainda.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {sessoes.map((s) => {
              const dParts = s.dataRealizacao.split('-')
              const displayDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}` : s.dataRealizacao
              const isPago = s.status === 'pago'

              return (
                <article
                  key={s.id}
                  className={`lux-card ${s.status === 'cancelado' ? 'sessao-cancelada' : ''}`}
                  onClick={() => setSelectedSessao(s)}
                  style={{ display: 'flex', alignItems: 'center', padding: '1rem', cursor: 'pointer' }}
                >
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    minWidth: '50px', paddingRight: '0.8rem', borderRight: '1.5px solid var(--border-light)',
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '1rem' }}>{displayDate}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.horaInicio}</span>
                  </div>

                  <div style={{ flex: 1, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{s.tipoSessao}</span>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {s.valor} • <StatusBadge status={s.status} />
                    </span>
                  </div>

                  {!isPago && showPayBtn && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarcarComoPago(s.id) }}
                      style={{
                        background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)',
                        border: 'none', width: '38px', height: '38px', borderRadius: '50%',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        cursor: 'pointer', transition: 'transform 0.2s',
                      }}
                      aria-label="Marcar como pago"
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

        {/* Footer */}
        <div style={{ padding: '2rem 0 4rem', textAlign: 'center', opacity: 0.35 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            Tecnologia <strong style={{ color: 'var(--text-dark)' }}>Neuro Flow</strong>
          </span>
        </div>
      </div>

      {/* Modal de detalhe */}
      {selectedSessao && (
        <SessaoDetalheModal
          sessao={selectedSessao}
          aprendentes={[aprendente]}
          isParentMode={true}
          onClose={() => setSelectedSessao(null)}
          onIniciarAtendimento={async () => {}}
          onMarcarComoPago={handleMarcarComoPago}
          onCancelarSessao={async () => {}}
          onRemarcarSessao={async () => {}}
        />
      )}
    </div>
  )
}

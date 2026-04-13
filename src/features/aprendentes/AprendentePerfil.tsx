import { useState, useEffect } from 'react'
import {
  Clock, CheckCircle, Settings, FlaskConical, ChevronRight, FileText, ClipboardList, Presentation,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ScreenOverlay } from '../../components/layout/ScreenOverlay'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { Aprendente, SessaoAgenda, ProtocoloAplicacaoData } from '../../lib/types'
import { parseMoney, formatCurrency, getPagamentoInfo } from '../../lib/utils'
import { useAppContext } from '../../context/AppContext'
import { EvolucaoVisao } from '../analytics/EvolucaoVisao'
import { SugestaoAvaliacaoCard } from './SugestaoAvaliacaoCard'

interface AprendentePerfilProps {
  aprendente: Aprendente
  sessoesGlobais: SessaoAgenda[]
  isParentMode: boolean
  onBack: () => void
  onOpenConfig: () => void
  onOpenSessaoModal: (sessao: SessaoAgenda) => void
  onMarcarComoPago: (id: string) => void
  onNovaAvaliacao: () => void
}

export function AprendentePerfil({
  aprendente,
  sessoesGlobais,
  isParentMode,
  onBack,
  onOpenConfig,
  onOpenSessaoModal,
  onMarcarComoPago,
  onNovaAvaliacao,
}: AprendentePerfilProps) {
  const { loadAplicacoesAprendente, loadRANsAprendente } = useAppContext()
  const navigate = useNavigate()
  const [aplicacoes, setAplicacoes] = useState<ProtocoloAplicacaoData[]>([])
  const [rans, setRans] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'evolucao'>('visao_geral')

  useEffect(() => {
    if (!isParentMode) {
      loadAplicacoesAprendente(aprendente.id).then(setAplicacoes)
      loadRANsAprendente(aprendente.id).then(setRans)
    }
  }, [aprendente.id, isParentMode])

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

          {/* ── Tabs Selector ── */}
          {!isParentMode && (
            <div style={{ display: 'flex', background: 'var(--bg-warm)', padding: '4px', borderRadius: '12px', marginBottom: '1.5rem', margin: '0 1.25rem 1.5rem' }}>
              <button
                onClick={() => setActiveTab('visao_geral')}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                  background: activeTab === 'visao_geral' ? 'white' : 'transparent',
                  color: activeTab === 'visao_geral' ? 'var(--text-dark)' : 'var(--text-muted)',
                  fontWeight: activeTab === 'visao_geral' ? 700 : 500,
                  boxShadow: activeTab === 'visao_geral' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('evolucao')}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                  background: activeTab === 'evolucao' ? 'white' : 'transparent',
                  color: activeTab === 'evolucao' ? 'var(--text-dark)' : 'var(--text-muted)',
                  fontWeight: activeTab === 'evolucao' ? 700 : 500,
                  boxShadow: activeTab === 'evolucao' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Evolução
              </button>
            </div>
          )}

          {activeTab === 'visao_geral' && (
            <>
              {/* Financial Summary */}
              <section className="summary-grid" style={{ marginBottom: '1.5rem', padding: '0 1.25rem' }}>
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

          {/* ── Sugestões de Avaliação ── */}
          <SugestaoAvaliacaoCard aprendente={aprendente} />

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
          </>
          )} 
        </div> {/* Fecha o form-container sem padding top para Visao Geral (Historico) */}

        {/* ── Tabs Content Cont. ── */}

        {/* ── Seção de Avaliações ── */}
        {!isParentMode && activeTab === 'visao_geral' && (
          <div style={{ padding: '1.5rem 1.25rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FlaskConical size={18} style={{ color: 'var(--accent-rose)' }} />
                Avaliações
              </h3>
              <button
                onClick={onNovaAvaliacao}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '0.5rem 1rem', borderRadius: '20px',
                  border: 'none', background: 'var(--accent-rose)', color: 'white',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                + Nova
              </button>
            </div>

            {aplicacoes.length === 0 ? (
              <div style={{
                padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)',
                background: 'var(--card-bg)', borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-light)', fontSize: '0.9rem',
              }}>
                Nenhuma avaliação aplicada ainda.<br />
                <span style={{ fontSize: '0.82rem' }}>Clique em "+ Nova" para começar.</span>
              </div>
            ) : (
              aplicacoes.map((apl) => (
                <div key={apl.id} className="lux-card" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)', marginBottom: '2px' }}>
                      {apl.modeloNome ?? 'Protocolo'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(apl.dataAplicacao + 'T12:00:00').toLocaleDateString('pt-BR')}
                      {apl.escoreTotal !== undefined && ` · ${apl.escoreTotal} pts`}
                    </div>
                  </div>
                  {apl.interpretacao && (
                    <span style={{
                      fontSize: '0.78rem', fontWeight: 700,
                      background: 'var(--accent-stone-light)', color: 'var(--accent-stone)',
                      borderRadius: '8px', padding: '4px 10px', whiteSpace: 'nowrap',
                    }}>
                      {apl.interpretacao}
                    </span>
                  )}
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              ))
            )}

            <div style={{ height: '1.5rem' }} />
          </div>
        )}

        {/* ── Documentos e RAN ── */}
        {!isParentMode && activeTab === 'visao_geral' && (
          <div style={{ padding: '0 1.25rem 5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <FileText size={18} style={{ color: 'var(--accent-rose)' }} />
              Documentos e Relatórios
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => navigate(`/aprendentes/${aprendente.id}/ran/novo`)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '1.25rem', borderRadius: '16px', border: '1.5px solid var(--border-light)',
                  background: 'var(--card-bg)', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-rose-light)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={22} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Gerar RAN</span>
              </button>

              <button
                onClick={() => navigate(`/aprendentes/${aprendente.id}/devolutiva`)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '1.25rem', borderRadius: '16px', border: '1.5px solid var(--border-light)',
                  background: 'var(--card-bg)', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-stone-light)', color: 'var(--accent-stone)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Presentation size={22} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>Devolutiva</span>
              </button>
            </div>

            {rans.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  RANs Finalizados ({rans.length})
                </span>
                {rans.map(r => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/aprendentes/${aprendente.id}/ran/${r.id}/preview`)}
                    className="lux-card"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  >
                    <FileText size={20} style={{ color: 'var(--accent-rose)', opacity: 0.6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Relatório de Avaliação (RAN)</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(r.dataAvaliacao + 'T12:00:00').toLocaleDateString('pt-BR')} · {r.status}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'visao_geral' && <div style={{ height: '3rem' }} />}

        {/* ── ABA EVOLUÇÃO ── */}
        {!isParentMode && activeTab === 'evolucao' && (
          <EvolucaoVisao aprendente={aprendente} />
        )}
        
        {/* Fim do scroll-area (fechamento ajustado para não quebrar estilos do form-container no geral) */}
        {activeTab === 'evolucao' && <div style={{ height: '3rem' }} />}

      </div>
    </ScreenOverlay>
  )
}

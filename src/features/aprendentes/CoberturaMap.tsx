import { useState, useEffect } from 'react'
import { ShieldCheck, AlertTriangle, RotateCcw } from 'lucide-react'
import { calcularCobertura } from '../../lib/sugestao'
import { useAppContext } from '../../context/AppContext'
import type { Aprendente, SugestaoSalva, ProtocoloAplicacaoData } from '../../lib/types'

interface CoberturaMapProps {
  aprendente: Aprendente
}

export function CoberturaMap({ aprendente }: CoberturaMapProps) {
  const { loadSugestoesAprendente, loadAplicacoesAprendente } = useAppContext()
  const [sugestoes, setSugestoes] = useState<SugestaoSalva[]>([])
  const [aplicacoes, setAplicacoes] = useState<ProtocoloAplicacaoData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      loadSugestoesAprendente(aprendente.id),
      loadAplicacoesAprendente(aprendente.id),
    ]).then(([s, a]) => {
      setSugestoes(s)
      setAplicacoes(a)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [aprendente.id])

  if (loading) return null

  const cobertura = calcularCobertura(sugestoes, aplicacoes)
  const totalCobertos = cobertura.filter((c) => c.coberto && !c.vencido).length
  const totalVencidos = cobertura.filter((c) => c.vencido).length
  const totalPendentes = cobertura.filter((c) => !c.coberto).length
  const pct = Math.round((totalCobertos / cobertura.length) * 100)

  return (
    <section style={{ padding: '1.5rem 1.25rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <ShieldCheck size={18} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            Cobertura Diagnóstica
          </h3>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {totalCobertos} de {cobertura.length} domínios avaliados
          </p>
        </div>

        {/* Barra de progresso circular compacta */}
        <div style={{ marginLeft: 'auto', position: 'relative', width: '48px', height: '48px' }}>
          <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border-light)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#6366f1'}
              strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
            />
          </svg>
          <span style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dark)',
          }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Alertas de reavaliação */}
      {totalVencidos > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#fffbeb', borderRadius: '10px',
          padding: '0.75rem 1rem', marginBottom: '1rem',
          border: '1.5px solid #fcd34d',
        }}>
          <RotateCcw size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>
            {totalVencidos} domínio{totalVencidos > 1 ? 's' : ''} com reavaliação recomendada (6+ meses)
          </span>
        </div>
      )}

      {/* Grid de domínios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
        {cobertura.map(({ dominio, coberto, instrumento, dataUltimaAplicacao, vencido }) => {
          const dataFormatada = dataUltimaAplicacao
            ? new Date(dataUltimaAplicacao + (dataUltimaAplicacao.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('pt-BR')
            : null

          return (
            <div
              key={dominio.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                background: coberto && !vencido
                  ? `${dominio.cor}08`
                  : vencido ? '#fffbeb' : 'var(--card-bg)',
                border: `1.5px solid ${
                  coberto && !vencido ? `${dominio.cor}30`
                  : vencido ? '#fcd34d'
                  : 'var(--border-light)'
                }`,
              }}
            >
              {/* Ícone de status */}
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: coberto && !vencido
                  ? `${dominio.cor}15`
                  : vencido ? '#fef3c7'
                  : 'var(--bg-warm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0,
              }}>
                {dominio.emoji}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700, fontSize: '0.9rem',
                  color: coberto && !vencido ? dominio.cor : 'var(--text-dark)',
                }}>
                  {dominio.label}
                </div>
                {coberto && instrumento && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {instrumento}{dataFormatada ? ` · ${dataFormatada}` : ''}
                  </div>
                )}
                {!coberto && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '1px' }}>
                    Nenhuma avaliação realizada
                  </div>
                )}
              </div>

              {/* Badge de status à direita */}
              <div style={{ flexShrink: 0 }}>
                {coberto && !vencido && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.72rem', fontWeight: 800,
                    color: dominio.cor, background: `${dominio.cor}15`,
                    borderRadius: '8px', padding: '3px 8px',
                  }}>
                    <ShieldCheck size={12} /> Avaliado
                  </span>
                )}
                {vencido && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.72rem', fontWeight: 800,
                    color: '#92400e', background: '#fef3c7',
                    borderRadius: '8px', padding: '3px 8px',
                  }}>
                    <RotateCcw size={12} /> Reavaliar
                  </span>
                )}
                {!coberto && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.72rem', fontWeight: 700,
                    color: 'var(--text-light)', background: 'var(--bg-warm)',
                    borderRadius: '8px', padding: '3px 8px',
                  }}>
                    <AlertTriangle size={12} /> Pendente
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { cor: '#10b981', label: `${totalCobertos} Avaliado${totalCobertos !== 1 ? 's' : ''}` },
          { cor: '#f59e0b', label: `${totalVencidos} Reavaliar` },
          { cor: 'var(--text-light)', label: `${totalPendentes} Pendente${totalPendentes !== 1 ? 's' : ''}` },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.cor }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Divisor */}
      <div style={{ height: '1px', background: 'var(--border-light)', margin: '0 0 1.5rem' }} />
    </section>
  )
}

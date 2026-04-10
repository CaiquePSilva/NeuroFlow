import { useMemo } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, Clock, XCircle, BarChart2, CalendarCheck,
} from 'lucide-react'
import type { SessaoAgenda } from '../../lib/types'
import { parseMoney, formatCurrency } from '../../lib/utils'

// ─── Helper: YYYY-MM do mês atual ────────────────────────────────
const getMesAtual = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const isMesAtual = (dataStr: string) => dataStr.startsWith(getMesAtual())

// ─── Metric Card ─────────────────────────────────────────────────
function MetricCard({
  icon, label, value, sub, color = 'var(--accent-rose)', large = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  color?: string
  large?: boolean
}) {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1.5px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        gridColumn: large ? 'span 2' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: large ? '2rem' : '1.5rem', fontWeight: 900, color: 'var(--text-dark)', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</div>
      )}
    </div>
  )
}

// ─── Top Aprendentes Bar ──────────────────────────────────────────
function TopBar({
  nome, valor, max,
}: { nome: string; valor: number; max: number }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{nome}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{formatCurrency(valor)}</span>
      </div>
      <div style={{ height: '8px', borderRadius: '4px', background: 'var(--border-light)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: '4px',
            background: 'linear-gradient(90deg, var(--accent-rose), var(--accent-emerald))',
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export function FinanceiroDashboard({ sessoesGlobais }: { sessoesGlobais: SessaoAgenda[] }) {
  const metricas = useMemo(() => {
    const sessoesMes = sessoesGlobais.filter((s) => isMesAtual(s.dataRealizacao))
    const pagas = sessoesMes.filter((s) => s.status === 'pago')
    const pendentes = sessoesMes.filter((s) => s.status === 'agendado' || s.status === 'andamento')
    const canceladas = sessoesMes.filter((s) => s.status === 'cancelado')

    const receitaMes = pagas.reduce((acc, s) => acc + parseMoney(s.valor), 0)
    const pendentesMes = pendentes.reduce((acc, s) => acc + parseMoney(s.valor), 0)
    const ticketMedio = pagas.length > 0 ? receitaMes / pagas.length : 0
    const taxaCancelamento = sessoesMes.length > 0
      ? Math.round((canceladas.length / sessoesMes.length) * 100)
      : 0

    // Projeção: receita já + pendentes confirmados
    const projecao = receitaMes + pendentesMes

    // Top aprendentes por receita no mês
    const porAprendente: Record<string, number> = {}
    pagas.forEach((s) => {
      porAprendente[s.nomeAprendente] = (porAprendente[s.nomeAprendente] ?? 0) + parseMoney(s.valor)
    })
    const topAprendentes = Object.entries(porAprendente)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
    const maxReceita = topAprendentes[0]?.[1] ?? 0

    return {
      receitaMes,
      pendentesMes,
      ticketMedio,
      taxaCancelamento,
      projecao,
      sessoesCount: { pagas: pagas.length, total: sessoesMes.length, canceladas: canceladas.length },
      topAprendentes,
      maxReceita,
    }
  }, [sessoesGlobais])

  const mesLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Month Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <BarChart2 size={20} color="var(--accent-rose)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
          {mesLabel}
        </span>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.875rem',
        marginBottom: '1.5rem',
      }}>
        {/* Receita do Mês — spans full width */}
        <div style={{
          gridColumn: 'span 2',
          background: 'linear-gradient(135deg, var(--accent-rose) 0%, #8b2252 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 8px 32px rgba(198,56,89,0.35)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', opacity: 0.85 }}>
            <DollarSign size={16} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Receita do Mês
            </span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {formatCurrency(metricas.receitaMes)}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '0.35rem' }}>
            {metricas.sessoesCount.pagas} {metricas.sessoesCount.pagas === 1 ? 'sessão paga' : 'sessões pagas'} este mês
          </div>
        </div>

        <MetricCard
          icon={<Clock size={16} />}
          label="A Receber"
          value={formatCurrency(metricas.pendentesMes)}
          sub={`${metricas.sessoesCount.total - metricas.sessoesCount.pagas - metricas.sessoesCount.canceladas} sessões`}
          color="var(--accent-stone)"
        />

        <MetricCard
          icon={<TrendingUp size={16} />}
          label="Ticket Médio"
          value={formatCurrency(metricas.ticketMedio)}
          sub="por sessão paga"
          color="var(--accent-emerald)"
        />

        <MetricCard
          icon={<CalendarCheck size={16} />}
          label="Projeção do Mês"
          value={formatCurrency(metricas.projecao)}
          sub="receita + pendentes"
          color="#6366f1"
        />

        <MetricCard
          icon={<XCircle size={16} />}
          label="Cancelamentos"
          value={`${metricas.taxaCancelamento}%`}
          sub={`${metricas.sessoesCount.canceladas} sessão(ões)`}
          color={metricas.taxaCancelamento > 20 ? 'var(--accent-rose)' : 'var(--text-muted)'}
        />
      </div>

      {/* Top Aprendentes */}
      {metricas.topAprendentes.length > 0 && (
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={16} color="var(--accent-rose)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Top Aprendentes · Receita no Mês
            </span>
          </div>
          {metricas.topAprendentes.map(([nome, valor]) => (
            <TopBar key={nome} nome={nome} valor={valor} max={metricas.maxReceita} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {metricas.receitaMes === 0 && metricas.pendentesMes === 0 && (
        <div style={{
          textAlign: 'center', padding: '3rem 1rem',
          color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6,
        }}>
          <TrendingDown size={48} style={{ opacity: 0.2, display: 'block', margin: '0 auto 1rem' }} />
          Nenhuma sessão registrada este mês ainda.<br />
          Agende sessões para ver as métricas financeiras aqui.
        </div>
      )}

      {/* Disclaimer */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, opacity: 0.7 }}>
        Dados calculados com base nas sessões registradas no sistema.<br />
        Valores em reais (R$).
      </p>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Activity, Tags, AlertTriangle, ChartBar, Compass } from 'lucide-react'
import type { Aprendente, NotaSessao, RAN } from '../../lib/types'
import { useAppContext } from '../../context/AppContext'

interface EvolucaoVisaoProps {
  aprendente: Aprendente
}

export function EvolucaoVisao({ aprendente }: EvolucaoVisaoProps) {
  const { loadNotasSessaoAprendente, loadRANsAprendente } = useAppContext()
  const [notas, setNotas] = useState<NotaSessao[]>([])
  const [rans, setRans] = useState<RAN[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [n, r] = await Promise.all([
        loadNotasSessaoAprendente(aprendente.id),
        loadRANsAprendente(aprendente.id)
      ])
      setNotas(n)
      setRans(r)
      setLoading(false)
    }
    fetchData()
  }, [aprendente.id])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Carregando dados evolutivos...
      </div>
    )
  }

  // 1. Tag Cloud / Mapa de Tags
  const tagCounts: Record<string, number> = {}
  notas.forEach(nota => {
    nota.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })
  const tagsOrdenadas = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])

  // 2. Gráfico de Evolução (Últimas 10 notas)
  const ultimasNotas = notas.slice(-10) // Pegamos as 10 mais recentes para não poluir
  
  // 3. Alertas Clínicos
  const alertas: string[] = []
  
  // -- Alerta 1: Poucos RANs / Sem RAN finalizado
  if (aprendente.tipoSessao === 'Avaliação') {
    if (rans.length === 0) alertas.push('Ainda não possui Relatório de Avaliação (RAN) iniciado.')
    else if (!rans.some(r => r.status === 'finalizado')) alertas.push('O Relatório de Avaliação (RAN) atual está em Rascunho.')
  } else {
    // Para intervenção, verificar a data do último RAN
    if (rans.length > 0) {
      const ultimoRan = rans[0]
      if (ultimoRan.dataAvaliacao) {
        const dRAN = new Date(ultimoRan.dataAvaliacao + 'T12:00:00')
        const hoje = new Date()
        const meses = (hoje.getTime() - dRAN.getTime()) / (1000 * 3600 * 24 * 30)
        if (meses > 6) alertas.push('Última reavaliação (RAN) ocorreu há mais de 6 meses.')
      }
    } else {
      alertas.push('Paciente em intervenção sem histórico de Relatório (RAN) na plataforma.')
    }
  }

  // -- Alerta 2: Muito tempo sem sessão anotada (Baseado nas notas, não na agenda)
  if (notas.length > 0) {
    const ultimaNota = notas[notas.length - 1]
    if (ultimaNota.dataCriacao) {
      const dNota = new Date(ultimaNota.dataCriacao)
      const hoje = new Date()
      const diasSemNota = (hoje.getTime() - dNota.getTime()) / (1000 * 3600 * 24)
      if (diasSemNota > 21) alertas.push(`A última nota de sessão foi registrada há ${Math.round(diasSemNota)} dias.`)
    }
  }

  if (notas.length === 0) {
    return (
      <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ 
          width: '60px', height: '60px', background: 'var(--accent-stone-light)', 
          color: 'var(--accent-stone)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem'
        }}>
          <Activity size={32} />
        </div>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Poucos Dados</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Associe etiquetas (tags) e avalie o engajamento na tela de finalizar sessão para gerar o gráfico de evolução.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem', paddingBottom: '5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Alertas */}
      {alertas.length > 0 && (
        <div style={{ 
          background: 'var(--accent-gold-light)', border: '1px solid var(--accent-gold)', 
          borderRadius: 'var(--radius-md)', padding: '1rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b47b00', fontWeight: 700, marginBottom: '0.75rem' }}>
             <AlertTriangle size={18} />
             Alertas Clínicos
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#8c6000', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {alertas.map((al, idx) => (
              <li key={idx}>{al}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mapa de Tags */}
      <section className="lux-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Tags size={18} style={{ color: 'var(--accent-rose)' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dark)' }}>Frequência de Áreas (Tags)</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tagsOrdenadas.length === 0 ? (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma tag registrada.</span>
          ) : (
            tagsOrdenadas.map(([tag, count]) => (
              <div 
                key={tag}
                style={{
                  background: count > 3 ? 'var(--accent-rose)' : 'var(--accent-stone-light)',
                  color: count > 3 ? '#fff' : 'var(--accent-stone)',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: count > 3 ? 'var(--shadow-magical)' : 'none'
                }}
              >
                <span>{tag.charAt(0).toUpperCase() + tag.slice(1)}</span>
                <span style={{ 
                  background: count > 3 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.06)', 
                  padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem' 
                }}>{count}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Gráfico de Evolução (Engajamento) */}
      <section className="lux-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <ChartBar size={18} style={{ color: 'var(--accent-emerald)' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dark)' }}>Linha de Base</h3>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
          Acompanhamento do nível de engajamento nas últimas sessões (escalas de 1 a 5).
        </p>

        <div style={{ 
          height: '180px', 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between',
          gap: '8px',
          paddingBottom: '20px',
          borderBottom: '1.5px solid var(--border-light)',
          position: 'relative'
        }}>
          {/* Linhas de grade horizontais */}
          <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {[5,4,3,2,1].map(n => (
              <div key={n} style={{ borderTop: '1px dashed var(--border-light)', width: '100%', flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-8px', left: 0, fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--card-bg)', paddingRight: '4px' }}>{n}</span>
              </div>
            ))}
          </div>

          {/* Barras do Gráfico */}
          {ultimasNotas.map((nota, i) => {
             const eng = nota.engajamento || 0
             const pct = (eng / 5) * 100
             if (eng === 0) return null // se não avaliou nesta nota
             
             // Definir a cor da barra baseado no valor
             let barColor = 'var(--accent-rose)'
             if (eng <= 2) barColor = 'var(--status-cancelado)' // Redish
             else if (eng >= 4) barColor = 'var(--accent-emerald)' // Greenish

             // Extrair o dia/mes
             const dt = nota.dataCriacao ? new Date(nota.dataCriacao) : new Date()
             const lblDia = dt.getDate().toString().padStart(2, '0')
             const lblMes = (dt.getMonth() + 1).toString().padStart(2, '0')

             return (
               <div key={nota.id || i} style={{ 
                  flex: 1, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'flex-end', 
                  alignItems: 'center', 
                  position: 'relative', 
                  zIndex: 1 
               }}>
                 {/* Barra */}
                 <div style={{ 
                   width: '70%', 
                   maxWidth: '24px', 
                   height: `${pct}%`, 
                   background: barColor, 
                   borderRadius: '4px 4px 0 0',
                   transition: 'height 0.5s ease'
                 }}></div>
                 {/* Tooltip rudimentar via texto embaixo */}
                 <span style={{ position: 'absolute', bottom: '-20px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                   {lblDia}/{lblMes}
                 </span>
               </div>
             )
          })}
        </div>
        
        {/* Avaliação Media Rápida */}
        {ultimasNotas.filter(n => n.engajamento).length > 0 && (
          <div style={{ 
            marginTop: '2rem', 
            background: 'var(--bg-warm)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <div style={{ background: 'var(--accent-emerald-light)', padding: '10px', borderRadius: '12px', color: 'var(--accent-emerald)' }}>
              <Compass size={24} />
            </div>
            <div>
               <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)' }}>Nível de Engajamento Médio</div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                 {(() => {
                   const c = ultimasNotas.filter(n => n.engajamento)
                   const media = c.reduce((acc, n) => acc + (n.engajamento || 0), 0) / c.length
                   return `${media.toFixed(1)} / 5.0 nas últimas sessões`
                 })()}
               </div>
            </div>
          </div>
        )}

      </section>
    </div>
  )
}

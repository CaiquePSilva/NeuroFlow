import { useState, useEffect } from 'react'
import {
  X, Trophy, Target, Heart, Zap, BookOpen, MessageSquare, Sparkles as SparklesIcon,
} from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import type { RAN } from '../../lib/types'

// ─── Visual Area Card ──────────────────────────────────────────────
function AreaCard({ 
  icon, label, color, value, total 
}: { icon: React.ReactNode, label: string, color: string, value: number, total: number }) {
  const pct = Math.round((value / total) * 100)
  
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '24px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      border: '1.5px solid #f0f0f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '44px', height: '44px', borderRadius: '14px', 
          background: `${color}15`, color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {icon}
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#333' }}>{label}</span>
      </div>
      
      <div style={{ position: 'relative', height: '14px', background: '#f0f0f0', borderRadius: '7px', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, height: '100%', 
          width: `${pct}%`, background: color, borderRadius: '7px',
          transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#999' }}>
        <span>Necessita Apoio</span>
        <span>Independente</span>
      </div>
    </div>
  )
}

export function DevolutivaView({
  aprendenteId: propAprendenteId,
  isParentMode,
  onClose
}: {
  aprendenteId?: string
  isParentMode?: boolean
  onClose?: () => void
} = {}) {
  const params = useParams<{ aprendenteId: string }>()
  const resolvedId = propAprendenteId || params.aprendenteId
  const navigate = useNavigate()
  const { aprendentes, loadRANsAprendente } = useAppContext()

  const aprendente = aprendentes.find(a => a.id === resolvedId)
  const [ran, setRan] = useState<RAN | null>(null)

  useEffect(() => {
    if (resolvedId) {
      loadRANsAprendente(resolvedId).then(rans => {
        const lastFinalized = rans.find(r => r.status === 'finalizado')
        if (lastFinalized) setRan(lastFinalized)
      })
    }
  }, [resolvedId])

  const handleClose = () => {
    if (onClose) onClose()
    else navigate(-1)
  }

  if (!aprendente) return <div style={{ padding: '2rem', textAlign: 'center' }}>Aprendente não encontrado.</div>

  // Mapeia protocolos técnicos para áreas compreensíveis
  const areasMap = [
    { key: 'atencao', label: 'Atenção e Foco', icon: <Target size={22} />, color: '#6366f1', value: 0, total: 0 },
    { key: 'memoria', label: 'Memória', icon: <BookOpen size={22} />, color: '#f59e0b', value: 0, total: 0 },
    { key: 'emocional', label: 'Emocional', icon: <Heart size={22} />, color: '#ec4899', value: 0, total: 0 },
    { key: 'engajamento', label: 'Participação', icon: <Zap size={22} />, color: '#10b981', value: 0, total: 0 },
  ]

  // Distribui resultados nas áreas (simplificado para demonstração)
  if (ran?.secaoResultados) {
    ran.secaoResultados.forEach(res => {
      const nome = res.protocoloNome.toLowerCase()
      if (nome.includes('atenção')) { areasMap[0].value += res.escore || 0; areasMap[0].total += res.escoreMax || 30 }
      else if (nome.includes('comportamento') || nome.includes('emocional')) { areasMap[2].value += res.escore || 0; areasMap[2].total += res.escoreMax || 10 }
      else if (nome.includes('engajamento')) { areasMap[3].value += res.escore || 0; areasMap[3].total += res.escoreMax || 25 }
      else { areasMap[1].value += res.escore || 0; areasMap[1].total += res.escoreMax || 20 }
    })
  }

  // Fallback values se não houver dados reais para mostrar o layout bonito
  areasMap.forEach(a => { if (a.total === 0) { a.value = 7; a.total = 10 } })

  return (
    <div style={{ 
      position: 'fixed', inset: 0, zIndex: 2000, 
      background: '#fcfcfd', color: '#1a1a1a', 
      overflowY: 'auto', fontFamily: 'Inter, sans-serif' 
    }}>
      <header style={{ 
        padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'white', borderBottom: '1px solid #f0f0f0' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', 
            background: 'var(--accent-rose)', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 900
          }}>
            {aprendente.nome.charAt(0)}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900 }}>Oi, família do(a) {aprendente.nome.split(' ')[0]}!</h1>
            <p style={{ margin: 0, color: '#666', fontWeight: 600 }}>Vamos ver como está o desenvolvimento hoje?</p>
          </div>
        </div>
        <button onClick={handleClose} style={{ 
          width: '48px', height: '48px', borderRadius: '50%', border: 'none',
          background: '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <X size={24} color="#333" />
        </button>
      </header>

      <main style={{ padding: '2rem 1.5rem 5rem', maxWidth: '1000px', margin: '0 auto' }}>
        
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Trophy size={28} color="#f59e0b" />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Destaques e Conquistas</h2>
          </div>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            padding: '2rem', borderRadius: '32px', color: 'white',
            display: 'flex', gap: '1.5rem', alignItems: 'center',
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)'
          }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '24px', 
              background: 'rgba(255,255,255,0.2)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center' 
            }}>
              <SparklesIcon size={40} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 800 }}>Grande evolução na interação!</h3>
              <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9, lineHeight: 1.5 }}>
                Notamos um aumento significativo na vontade de participar das atividades e na comunicação com a equipe. 
                Isso é um passo gigante para o sucesso das próximas sessões!
              </p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Target size={28} color="var(--accent-rose)" />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Mapa de Desenvolvimento</h2>
          </div>
          
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {areasMap.map(({ key, ...props }) => (
              <AreaCard key={key} {...props} />
            ))}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <MessageSquare size={28} color="#6366f1" />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Próximos Passos Juntos</h2>
          </div>
          
          <div style={{ 
            background: 'white', padding: '2rem', borderRadius: '32px',
            border: '2px solid #f0f0f0'
          }}>
            <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: 1.6, margin: 0 }}>
              "Nosso foco agora será fortalecer a <strong>atenção sustentada</strong> através de jogos que a criança gosta. 
              Em casa, vocês podem ajudar incentivando a leitura de uma pequena história por dia, sem distrações. 
              Estamos no caminho certo!"
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '1px', background: '#ccc' }}></div>
              <span style={{ fontWeight: 800, color: '#999', fontSize: '0.9rem', textTransform: 'uppercase' }}>Equipe NeuroFlow</span>
            </div>
          </div>
        </section>

      </main>

      <footer style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        padding: '1.5rem', background: 'white', borderTop: '1px solid #f0f0f0',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#999', fontWeight: 600 }}>
          {isParentMode 
            ? 'Este é o seu painel visual interativo. O relatório técnico (RAN) completo é mantido pela equipe clínica em prontuário seguro.' 
            : 'Este é um resumo visual para acompanhamento familiar. O relatório técnico (RAN) completo está disponível no perfil.'}
        </p>
      </footer>
    </div>
  )
}

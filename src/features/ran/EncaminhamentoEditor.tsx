import { useState } from 'react'
import { Printer, ArrowLeft } from 'lucide-react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import { useAppContext } from '../../context/AppContext'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ESPECIALIDADES_ENCAMINHAMENTO, DADOS_PROFISSIONAL } from '../../lib/constants'
import type { EspecialidadeEncaminhamento } from '../../lib/types'

export function EncaminhamentoEditor() {
  const { aprendenteId } = useParams<{ aprendenteId: string }>()
  const [searchParams] = useSearchParams()
  const ranId = searchParams.get('ranId')
  const navigate = useNavigate()
  const { aprendentes, handleCriarEncaminhamento } = useAppContext()

  const aprendente = aprendentes.find(a => a.id === aprendenteId)
  
  const [destinatario, setDestinatario] = useState('')
  const [especialidade, setEspecialidade] = useState<EspecialidadeEncaminhamento>('Neuropediatria')
  const [motivo, setMotivo] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!aprendenteId || !motivo) return
    setSaving(true)
    await handleCriarEncaminhamento({
      aprendenteId,
      ranId: ranId || undefined,
      destinatario,
      especialidade,
      motivo,
      observacoes,
    })
    setSaving(false)
    setMode('preview')
  }

  if (!aprendente) return <div style={{ padding: '2rem', textAlign: 'center' }}>Aprendente não encontrado.</div>

  return (
    <ScreenOverlay>
      <ScreenHeader
        title="Encaminhamento Clínico"
        subtitle={aprendente.nome}
        onBack={() => navigate(-1)}
        rightAction={
          mode === 'edit' ? (
            <button onClick={handleSave} disabled={saving || !motivo} style={{
              padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
              background: 'var(--accent-rose)', color: 'white',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
              opacity: (saving || !motivo) ? 0.6 : 1,
            }}>
              Gerar Documento
            </button>
          ) : (
            <button onClick={() => window.print()} style={{
              padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
              background: 'var(--accent-emerald)', color: 'white',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <Printer size={14} /> Imprimir / PDF
            </button>
          )
        }
      />

      <div className="form-scroll-area" style={{ background: mode === 'preview' ? '#f8fafc' : 'var(--bg-light)' }}>
        <div className="form-container" style={{ maxWidth: mode === 'preview' ? '800px' : '600px' }}>
          
          {mode === 'edit' ? (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="form-group">
                <label className="form-label">Especialidade Destino</label>
                <select 
                  className="form-input" 
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value as EspecialidadeEncaminhamento)}
                >
                  {ESPECIALIDADES_ENCAMINHAMENTO.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nome do Profissional (opcional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Dr. João da Silva"
                  value={destinatario}
                  onChange={e => setDestinatario(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Motivo do Encaminhamento</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Descreva brevemente por que você está encaminhando este aprendente.
                </p>
                <textarea 
                  className="form-input" 
                  rows={4}
                  placeholder="Ex: Indicativos de dificuldades no processamento auditivo que carecem de avaliação fonoaudiológica e exame de PAC..."
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Observações Adicionais (opcional)</label>
                <textarea 
                  className="form-input" 
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="print-canvas" style={{
              background: 'white',
              padding: '3rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid #eee',
              borderRadius: '4px',
              color: '#1a1a1a',
              fontFamily: 'serif',
              lineHeight: 1.6
            }}>
              <style>{`
                @media print {
                  .no-print { display: none !important; }
                  body { background: white !important; }
                  .mobile-container { padding: 0 !important; }
                  .print-canvas { box-shadow: none !important; border: none !important; padding: 0 !important; }
                }
              `}</style>
              
              {/* Cabeçalho */}
              <div style={{ textAlign: 'center', borderBottom: '1.5px solid #333', paddingBottom: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase' }}>{DADOS_PROFISSIONAL.nome}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{DADOS_PROFISSIONAL.titulo} — {DADOS_PROFISSIONAL.registro}</div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                  {DADOS_PROFISSIONAL.consultorio} | {DADOS_PROFISSIONAL.endereco}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ textDecoration: 'underline', fontSize: '1.3rem', fontWeight: 800 }}>ENCAMINHAMENTO CLÍNICO</h2>
                <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '0.95rem' }}>
                  Data: {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div style={{ fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                <p>À atenção de: <strong>{destinatario || `Especialista em ${especialidade}`}</strong></p>
              </div>

              <div style={{ fontSize: '1.1rem', textAlign: 'justify' }}>
                <p>
                  Encaminho o(a) aprendente <strong>{aprendente.nome}</strong> para avaliação e acompanhamento em <strong>{especialidade}</strong>.
                </p>
                <p style={{ marginTop: '1.5rem' }}>
                  As avaliações neuropsicopedagógicas realizadas indicaram: {motivo}
                </p>
                {observacoes && (
                  <p style={{ marginTop: '1.5rem' }}>
                    <strong>Observações complementares:</strong> {observacoes}
                  </p>
                )}
                <p style={{ marginTop: '3rem' }}>
                  Coloco-me à disposição para discussão do caso e maiores esclarecimentos.
                </p>
              </div>

              <div style={{ marginTop: '6rem', textAlign: 'center' }}>
                <div style={{ maxWidth: '300px', margin: '0 auto', borderTop: '1px solid #333', paddingTop: '8px' }}>
                  <div style={{ fontWeight: 800 }}>{DADOS_PROFISSIONAL.nome}</div>
                  <div style={{ fontSize: '0.9rem' }}>{DADOS_PROFISSIONAL.registro}</div>
                </div>
              </div>
            </div>
          )}

          {mode === 'preview' && (
            <div className="no-print" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', paddingBottom: '3rem' }}>
              <button 
                onClick={() => setMode('edit')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit'
                }}
              >
                <ArrowLeft size={18} /> Voltar para Edição
              </button>
            </div>
          )}

        </div>
      </div>
    </ScreenOverlay>
  )
}

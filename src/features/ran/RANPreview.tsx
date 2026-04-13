import { useRef, useState, useEffect } from 'react'
import { Printer, FileCheck, ArrowRight } from 'lucide-react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import { useAppContext } from '../../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import { DADOS_PROFISSIONAL } from '../../lib/constants'
import type { RAN } from '../../lib/types'

// ─── Estilos do Documento (Print-focused) ──────────────────────────
const docStyles = `
  @media print {
    .no-print { display: none !important; }
    .mobile-container { padding: 0 !important; background: white !important; }
    .print-area { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: none !important; margin: 0 !important; }
    @page { margin: 2cm; }
  }

  .print-area {
    background: white;
    padding: 2.5rem;
    color: #1a1a1a;
    font-family: 'Inter', 'Segoe UI', serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    border: 1px solid #f0f0f0;
    border-radius: 4px;
  }

  .doc-header {
    text-align: center;
    border-bottom: 2px solid #333;
    padding-bottom: 1.5rem;
    margin-bottom: 2rem;
  }

  .secao-titulo {
    font-size: 1.1rem;
    font-weight: 800;
    color: #333;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 2rem 0 1rem;
    border-left: 4px solid #333;
    padding-left: 12px;
  }

  .secao-conteudo {
    font-size: 1rem;
    white-space: pre-wrap;
    color: #444;
  }

  .badge-resultado {
    display: inline-block;
    background: #f5f5f5;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 0.85rem;
    margin-left: 8px;
  }

  .doc-footer {
    margin-top: 4rem;
    text-align: center;
    font-size: 0.9rem;
    border-top: 1px solid #eee;
    padding-top: 2rem;
  }
`

export function RANPreview() {
  const { aprendenteId, ranId } = useParams<{ aprendenteId: string; ranId: string }>()
  const navigate = useNavigate()
  const { aprendentes, loadRANsAprendente } = useAppContext()
  const [ran, setRan] = useState<RAN | null>(null)

  const aprendente = aprendentes.find(a => a.id === aprendenteId)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aprendenteId && ranId) {
      loadRANsAprendente(aprendenteId).then(rans => {
        const found = rans.find(r => r.id === ranId)
        if (found) setRan(found)
      })
    }
  }, [aprendenteId, ranId])

  const handlePrint = () => {
    window.print()
  }

  if (!aprendente || !ran) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando relatório...</div>

  return (
    <ScreenOverlay>
      <style>{docStyles}</style>
      <div className="no-print">
        <ScreenHeader
          title="Pré-visualização do RAN"
          subtitle={aprendente.nome}
          onBack={() => navigate(-1)}
          rightAction={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handlePrint} style={{
                padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
                background: 'var(--accent-emerald)', color: 'white',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <Printer size={14} /> Imprimir / PDF
              </button>
            </div>
          }
        />
      </div>

      <div className="form-scroll-area" style={{ background: '#f8fafc' }}>
        <div className="form-container" style={{ maxWidth: '900px' }}>
          
          <div className="print-area" ref={printRef}>
            {/* Header */}
            <header className="doc-header">
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>{DADOS_PROFISSIONAL.consultorio}</h1>
              <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#666' }}>
                {DADOS_PROFISSIONAL.nome} — {DADOS_PROFISSIONAL.titulo} ({DADOS_PROFISSIONAL.registro})
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>
                {DADOS_PROFISSIONAL.endereco} | {DADOS_PROFISSIONAL.telefone}
              </p>
            </header>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.5rem' }}>RAN</h2>
              <p style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                Relatório de Avaliação Neuropsicopedagógica
              </p>
            </div>

            {/* Identificação */}
            <section>
              <h3 className="secao-titulo">1. Identificação</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.95rem' }}>
                <div><strong>Aprendente:</strong> {aprendente.nome}</div>
                <div><strong>Data de Nascimento:</strong> {new Date(aprendente.dataOuIdade).toLocaleDateString('pt-BR')}</div>
                <div><strong>Responsáveis:</strong> {aprendente.responsavel1} {aprendente.responsavel2 ? `/ ${aprendente.responsavel2}` : ''}</div>
                <div><strong>Data da Avaliação:</strong> {ran.dataAvaliacao ? new Date(ran.dataAvaliacao + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</div>
              </div>
            </section>

            {/* Queixa */}
            {ran.secaoQueixa && (
              <section>
                <h3 className="secao-titulo">2. Queixa Principal e Histórico</h3>
                <div className="secao-conteudo">{ran.secaoQueixa}</div>
              </section>
            )}

            {/* Procedimentos */}
            {ran.secaoProcedimentos && ran.secaoProcedimentos.length > 0 && (
              <section>
                <h3 className="secao-titulo">3. Procedimentos Utilizados</h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {ran.secaoProcedimentos.map((p, i) => (
                    <li key={i} className="secao-conteudo" style={{ marginBottom: '4px' }}>{p}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Resultados */}
            {ran.secaoResultados && ran.secaoResultados.length > 0 && (
              <section>
                <h3 className="secao-titulo">4. Resultados e Indicativos</h3>
                {ran.secaoResultados.map((res, i) => (
                  <div key={i} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                      • {res.protocoloNome}
                      {res.interpretacao && <span className="badge-resultado">{res.interpretacao}</span>}
                    </div>
                    <div className="secao-conteudo" style={{ fontSize: '0.95rem', paddingLeft: '1.2rem' }}>
                      {res.paragrafaIndicativo}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Hipóteses */}
            {ran.secaoHipoteses && (
              <section>
                <h3 className="secao-titulo">5. Indicativos e Hipóteses Clínicas</h3>
                <div className="secao-conteudo" style={{ fontStyle: 'italic' }}>{ran.secaoHipoteses}</div>
              </section>
            )}

            {/* Recomendações */}
            {ran.secaoRecomendacoes && (
              <section>
                <h3 className="secao-titulo">6. Recomendações e Encaminhamentos</h3>
                <div className="secao-conteudo">{ran.secaoRecomendacoes}</div>
              </section>
            )}

            {/* Assinatura */}
            <footer className="doc-footer">
              <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                <div style={{ borderBottom: '1px solid #333', marginBottom: '8px' }}></div>
                <div style={{ fontWeight: 800 }}>{DADOS_PROFISSIONAL.nome}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>{DADOS_PROFISSIONAL.titulo} — {DADOS_PROFISSIONAL.registro}</div>
              </div>
              <p style={{ marginTop: '3rem', fontSize: '0.75rem', color: '#999', fontStyle: 'italic' }}>
                Este documento é um relatório técnico de avaliação neuropsicopedagógica e não substitui diagnóstico médico.<br />
                A validade científica deste relatório está vinculada à data da avaliação.
              </p>
            </footer>
          </div>

          <div className="no-print" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', paddingBottom: '3rem' }}>
            <button
               onClick={() => navigate(`/aprendentes/${aprendenteId}/encaminhamentos/novo?ranId=${ran.id}`)}
               style={{
                padding: '0.875rem 1.5rem', borderRadius: '12px', border: '1.5px solid var(--border-light)',
                background: 'var(--card-bg)', color: 'var(--text-dark)',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              Criar Encaminhamento <ArrowRight size={18} />
            </button>
            <button
               onClick={() => navigate(`/aprendentes/${aprendenteId}/pin/novo?ranId=${ran.id}`)}
               style={{
                padding: '0.875rem 1.5rem', borderRadius: '12px', border: 'none',
                background: 'var(--accent-rose)', color: 'white',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 8px 20px rgba(198,56,89,0.25)',
              }}
            >
              Gerar PIN <FileCheck size={18} />
            </button>
          </div>

        </div>
      </div>
    </ScreenOverlay>
  )
}

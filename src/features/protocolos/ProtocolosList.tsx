import { useState } from 'react'
import { Plus, BookOpen, Copy, Trash2, ChevronRight, ClipboardList } from 'lucide-react'
import { ScreenOverlay, ScreenHeader } from '../../components/layout/ScreenOverlay'
import { useAppContext } from '../../context/AppContext'
import type { ProtocoloModelo } from '../../lib/types'

interface ProtocolosListProps {
  onBack: () => void
  onCriar: () => void
  onEditar: (modelo: ProtocoloModelo) => void
  onAplicar: (modelo: ProtocoloModelo) => void
}

export function ProtocolosList({ onBack, onCriar, onEditar, onAplicar }: ProtocolosListProps) {
  const { protocolos, handleExcluirModelo, handleDuplicarModelo } = useAppContext()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState<string | null>(null)

  const templates = protocolos.filter((p) => p.isTemplate)
  const meus = protocolos.filter((p) => !p.isTemplate)

  const handleDelete = async (id: string) => {
    await handleExcluirModelo(id)
    setConfirmDelete(null)
  }

  const handleDuplicate = async (modelo: ProtocoloModelo) => {
    setDuplicating(modelo.id)
    await handleDuplicarModelo(modelo)
    setDuplicating(null)
  }

  return (
    <ScreenOverlay>
      <ScreenHeader title="Protocolos de Avaliação" onBack={onBack} />

      <div className="form-scroll-area">
        <div className="form-container">

          {/* CTA Card */}
          <button
            onClick={onCriar}
            style={{
              width: '100%',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--accent-rose)',
              background: 'var(--accent-rose-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem',
              transition: 'all 0.2s',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: '48px', height: '48px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-rose)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Plus size={24} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--accent-rose)', fontSize: '1rem' }}>
                Criar Novo Protocolo
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Monte seu próprio instrumento de avaliação
              </div>
            </div>
          </button>

          {/* Meus Protocolos */}
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={18} className="text-muted" />
            Meus Protocolos
          </h3>

          {meus.length === 0 && (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                background: 'var(--card-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-light)',
                marginBottom: '2rem',
                fontSize: '0.9rem',
              }}
            >
              Você ainda não criou nenhum protocolo.<br />
              <strong>Use os templates abaixo como ponto de partida!</strong>
            </div>
          )}

          {meus.map((modelo) => (
            <ModeloCard
              key={modelo.id}
              modelo={modelo}
              onAplicar={() => onAplicar(modelo)}
              onEditar={() => onEditar(modelo)}
              onDuplicar={() => handleDuplicate(modelo)}
              onDelete={() => setConfirmDelete(modelo.id)}
              isDuplicating={duplicating === modelo.id}
              confirmDelete={confirmDelete === modelo.id}
              onCancelDelete={() => setConfirmDelete(null)}
              onConfirmDelete={() => handleDelete(modelo.id)}
            />
          ))}

          {/* Templates do Sistema */}
          <h3 style={{ marginBottom: '0.5rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} className="text-muted" />
            Templates de Exemplo
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Exemplos prontos para você ver como montar um protocolo. Duplique para personalizar.
          </p>

          {templates.map((modelo) => (
            <ModeloCard
              key={modelo.id}
              modelo={modelo}
              isTemplate
              onAplicar={() => onAplicar(modelo)}
              onDuplicar={() => handleDuplicate(modelo)}
              isDuplicating={duplicating === modelo.id}
              confirmDelete={false}
            />
          ))}

          {templates.length === 0 && (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Nenhum template disponível ainda.
            </div>
          )}
        </div>
      </div>
    </ScreenOverlay>
  )
}

// ─── Card de Modelo ────────────────────────────────────────────────
function ModeloCard({
  modelo,
  isTemplate = false,
  onAplicar,
  onEditar,
  onDuplicar,
  onDelete,
  isDuplicating,
  confirmDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  modelo: ProtocoloModelo
  isTemplate?: boolean
  onAplicar: () => void
  onEditar?: () => void
  onDuplicar: () => void
  onDelete?: () => void
  isDuplicating: boolean
  confirmDelete: boolean
  onCancelDelete?: () => void
  onConfirmDelete?: () => void
}) {
  const scoredCount = modelo.perguntas.filter((p) => p.tipo !== 'texto').length
  const dataFormatada = new Date(modelo.dataCriacao).toLocaleDateString('pt-BR')

  return (
    <div
      className="lux-card"
      style={{
        marginBottom: '1rem',
        borderLeft: isTemplate ? '4px solid var(--accent-stone)' : '4px solid var(--accent-rose)',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>{modelo.nome}</span>
            {isTemplate && (
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, background: 'var(--accent-stone-light)',
                color: 'var(--accent-stone)', borderRadius: '6px', padding: '2px 8px',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Template
              </span>
            )}
          </div>
          {modelo.descricao && (
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {modelo.descricao}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {modelo.perguntas.length} {modelo.perguntas.length === 1 ? 'pergunta' : 'perguntas'}
            </span>
            {scoredCount > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                · {scoredCount} pontuadas
              </span>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>· {dataFormatada}</span>
          </div>
        </div>
      </div>

      {confirmDelete ? (
        <div style={{
          background: 'var(--accent-rose-light)', borderRadius: 'var(--radius-md)',
          padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
        }}>
          <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
            Excluir "{modelo.nome}"?
          </span>
          <button onClick={onConfirmDelete}
            style={{ background: 'var(--accent-rose)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Excluir
          </button>
          <button onClick={onCancelDelete}
            style={{ background: 'transparent', color: 'var(--text-muted)', border: '1.5px solid var(--border-light)', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={onAplicar}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none',
              background: 'var(--accent-rose)', color: 'white', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            Aplicar <ChevronRight size={16} />
          </button>

          <button
            onClick={onDuplicar}
            disabled={isDuplicating}
            title="Duplicar"
            style={{
              padding: '0.75rem', borderRadius: '10px', border: '1.5px solid var(--border-light)',
              background: 'var(--card-bg)', color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Copy size={16} />
          </button>

          {!isTemplate && onEditar && (
            <button
              onClick={onEditar}
              title="Editar"
              style={{
                padding: '0.75rem', borderRadius: '10px', border: '1.5px solid var(--border-light)',
                background: 'var(--card-bg)', color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✏️
            </button>
          )}

          {!isTemplate && onDelete && (
            <button
              onClick={onDelete}
              title="Excluir"
              style={{
                padding: '0.75rem', borderRadius: '10px', border: '1.5px solid var(--border-light)',
                background: 'var(--card-bg)', color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { X, Sparkles, ChevronRight } from 'lucide-react'
import type { TagClinica, NotaSessao } from '../../lib/types'

// ==========================================
// Tag Clínica Chip
// ==========================================

const TAGS: { id: TagClinica; emoji: string; label: string }[] = [
  { id: 'cognitivo',   emoji: '🧠', label: 'Cognitivo' },
  { id: 'emocional',   emoji: '💛', label: 'Emocional' },
  { id: 'motor',       emoji: '🤸', label: 'Motor' },
  { id: 'linguagem',   emoji: '💬', label: 'Linguagem' },
  { id: 'social',      emoji: '🤝', label: 'Social' },
  { id: 'acadêmico',   emoji: '📚', label: 'Acadêmico' },
]

// ==========================================
// Star Rating Component
// ==========================================

const RATING_LABELS: Record<number, string> = {
  1: 'Muito Baixo',
  2: 'Baixo',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
}

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{label}</span>
        {value > 0 && (
          <span
            style={{
              fontSize: '0.8rem',
              padding: '2px 10px',
              borderRadius: '20px',
              background: value >= 4 ? 'var(--accent-emerald-light)' : value >= 3 ? '#FEF3C7' : 'var(--accent-rose-light)',
              color: value >= 4 ? 'var(--accent-emerald)' : value >= 3 ? '#D97706' : 'var(--accent-rose)',
              fontWeight: 600,
            }}
          >
            {RATING_LABELS[value]}
          </span>
        )}
      </div>
      <div
        style={{ display: 'flex', gap: '8px' }}
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            style={{
              flex: 1,
              aspectRatio: '1',
              maxWidth: '52px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: n <= display
                ? 'var(--accent-rose)'
                : 'var(--bg-warm)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              transform: n <= display ? 'scale(1.05)' : 'scale(1)',
              boxShadow: n <= display ? 'var(--shadow-lux)' : 'none',
            }}
            aria-label={`${label}: ${n}`}
          >
            {n <= display ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// NotaSessaoSlideUp
// ==========================================

interface NotaSessaoSlideUpProps {
  nomeAprendente: string
  sessaoId: string
  aprendenteId: string
  onSalvar: (nota: NotaSessao) => Promise<void>
  onPular: () => void
}

export function NotaSessaoSlideUp({
  nomeAprendente,
  sessaoId,
  aprendenteId,
  onSalvar,
  onPular,
}: NotaSessaoSlideUpProps) {
  const [tags, setTags] = useState<TagClinica[]>([])
  const [engajamento, setEngajamento] = useState(0)
  const [regulacao, setRegulacao] = useState(0)
  const [atencao, setAtencao] = useState(0)
  const [observacao, setObservacao] = useState('')
  const [saving, setSaving] = useState(false)

  const toggleTag = (tag: TagClinica) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSalvar = async () => {
    setSaving(true)
    const nota: NotaSessao = {
      sessaoId,
      aprendenteId,
      tags,
      observacao: observacao.trim() || undefined,
      engajamento: engajamento || undefined,
      regulacaoEmocional: regulacao || undefined,
      atencaoSustentada: atencao || undefined,
    }
    await onSalvar(nota)
    setSaving(false)
  }

  const hasContent = tags.length > 0 || engajamento > 0 || regulacao > 0 || atencao > 0 || observacao.trim().length > 0

  return (
    <>
      {/* Backdrop — agora opaco para parecer uma nova tela */}
      <div
        onClick={onPular}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg-stone)',
          zIndex: 900,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Full-screen Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100dvh',
          background: 'var(--bg-stone)',
          zIndex: 901,
          animation: 'fadeIn 0.2s ease-out',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
        }}
      >

        {/* Header */}
        <div
          style={{
            background: 'var(--gradient-rose)',
            margin: '0.75rem 1.25rem 0',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <Sparkles size={18} color="white" />
              <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '1rem' }}>
                Nota Clínica
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: 0 }}>
              Como foi a sessão de <strong style={{ color: 'white' }}>{nomeAprendente}</strong>?
            </p>
          </div>
          <button
            onClick={onPular}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              flexShrink: 0,
            }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem 1.25rem' }}>
          {/* Tags */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
              Áreas Trabalhadas
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TAGS.map(({ id, emoji, label }) => {
                const selected = tags.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleTag(id)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: selected ? '2px solid var(--accent-rose)' : '2px solid var(--border-light)',
                      background: selected ? 'var(--accent-rose-light)' : 'var(--card-bg)',
                      color: selected ? 'var(--accent-rose)' : 'var(--text-muted)',
                      fontWeight: selected ? 700 : 500,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      transform: selected ? 'scale(1.02)' : 'scale(1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ratings */}
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-lux)',
            }}
          >
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>
              Comportamento Observado
            </h4>
            <StarRating label="Engajamento" value={engajamento} onChange={setEngajamento} />
            <StarRating label="Regulação Emocional" value={regulacao} onChange={setRegulacao} />
            <StarRating label="Atenção Sustentada" value={atencao} onChange={setAtencao} />
          </div>

          {/* Observação Livre */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
              Observação Clínica
            </h4>
            <textarea
              placeholder="Registre qualquer observação relevante sobre  a sessão de hoje..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-light)',
                background: 'var(--card-bg)',
                color: 'var(--text-dark)',
                fontSize: '0.95rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-rose)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
            />
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            padding: '1rem 1.25rem 1.5rem',
            borderTop: '1px solid var(--border-light)',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={onPular}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-light)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.15s ease',
            }}
          >
            Pular
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            disabled={saving || !hasContent}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: hasContent ? 'var(--accent-emerald)' : 'var(--border-light)',
              color: hasContent ? 'white' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: hasContent ? 'pointer' : 'not-allowed',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: hasContent ? '0 8px 24px -4px rgba(5, 150, 105, 0.35)' : 'none',
              transition: 'all 0.2s ease',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Nota'}
            {!saving && <ChevronRight size={18} />}
          </button>
        </div>
      </div>

    </>
  )
}

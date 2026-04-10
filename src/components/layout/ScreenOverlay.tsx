import { ArrowLeft } from 'lucide-react'

interface ScreenOverlayProps {
  children: React.ReactNode
}

export function ScreenOverlay({ children }: ScreenOverlayProps) {
  return <div className="screen-overlay">{children}</div>
}

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  onBack: () => void
  titleStyle?: React.CSSProperties
  rightAction?: React.ReactNode
  hideBorder?: boolean
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  titleStyle,
  rightAction,
  hideBorder,
}: ScreenHeaderProps) {
  return (
    <header className="screen-header" style={hideBorder ? { borderBottom: 'none' } : undefined}>
      <button className="btn-icon" onClick={onBack} aria-label="Voltar">
        <ArrowLeft size={28} />
      </button>
      <div style={{ flex: 1 }}>
        <h2 className="screen-title" style={{ fontSize: '1.25rem', ...titleStyle }}>
          {title}
        </h2>
        {subtitle && (
          <p className="card-subtitle" style={{ fontSize: '1.1rem', marginTop: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
      {rightAction}
    </header>
  )
}

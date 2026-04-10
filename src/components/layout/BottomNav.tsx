import { Home, Calendar, Users, LogOut } from 'lucide-react'

export type TabId = 'inicio' | 'agenda' | 'aprendentes'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onSignOut?: () => void
}

export function BottomNav({ activeTab, onTabChange, onSignOut }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'inicio' ? 'active' : ''}`}
        onClick={() => onTabChange('inicio')}
      >
        <Home size={28} strokeWidth={activeTab === 'inicio' ? 2.5 : 2} />
        <span>Início</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`}
        onClick={() => onTabChange('agenda')}
      >
        <Calendar size={28} strokeWidth={activeTab === 'agenda' ? 2.5 : 2} />
        <span>Agenda</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'aprendentes' ? 'active' : ''}`}
        onClick={() => onTabChange('aprendentes')}
      >
        <Users size={28} strokeWidth={activeTab === 'aprendentes' ? 2.5 : 2} />
        <span>Aprendentes</span>
      </button>

      {onSignOut && (
        <button
          className="nav-item"
          onClick={onSignOut}
          title="Sair"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={26} strokeWidth={2} />
          <span>Sair</span>
        </button>
      )}
    </nav>
  )
}

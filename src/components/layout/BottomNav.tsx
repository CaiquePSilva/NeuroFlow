import { Home, Calendar, Users } from 'lucide-react'

export type TabId = 'inicio' | 'agenda' | 'aprendentes'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
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
    </nav>
  )
}

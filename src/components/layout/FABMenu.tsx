import { Plus, Calendar, UserPlus, ClipboardList } from 'lucide-react'

interface FABMenuProps {
  isOpen: boolean
  onToggle: () => void
  onNovoAgendamento: () => void
  onNovoAprendente: () => void
  onProtocolos: () => void
}

export function FABMenu({ isOpen, onToggle, onNovoAgendamento, onNovoAprendente, onProtocolos }: FABMenuProps) {
  return (
    <>
      {isOpen && <div className="fab-overlay" onClick={onToggle}></div>}

      <div className={`fab-menu-container ${isOpen ? 'open' : ''}`}>
        <div className="fab-menu-options">
          <button className="fab-option" onClick={onNovoAgendamento}>
            <span className="fab-option-label">Novo Agendamento</span>
            <div className="fab-option-icon">
              <Calendar size={28} />
            </div>
          </button>
          <button className="fab-option" onClick={onNovoAprendente}>
            <span className="fab-option-label">Novo Aprendente</span>
            <div className="fab-option-icon">
              <UserPlus size={28} />
            </div>
          </button>
          <button className="fab-option" onClick={onProtocolos}>
            <span className="fab-option-label">Protocolos de Avaliação</span>
            <div className="fab-option-icon">
              <ClipboardList size={28} />
            </div>
          </button>
        </div>

        <button
          className="fab"
          aria-label={isOpen ? 'Fechar Menu' : 'Adicionar Novo'}
          onClick={onToggle}
        >
          <Plus
            size={32}
            strokeWidth={2.5}
            style={{
              transform: isOpen ? 'rotate(45deg)' : 'none',
              transition: 'transform 0.3s ease',
            }}
          />
        </button>
      </div>
    </>
  )
}

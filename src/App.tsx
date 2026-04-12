import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'
import { AppProvider, useAppContext } from './context/AppContext'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './features/auth/LoginPage'

// Layout Components
import { BottomNav, type TabId } from './components/layout/BottomNav'
import { FABMenu } from './components/layout/FABMenu'

// Feature Pages
import { DashboardPage } from './features/dashboard/DashboardPage'
import { AprendentesList } from './features/aprendentes/AprendentesList'
import { AprendentePerfil } from './features/aprendentes/AprendentePerfil'
import { AprendenteConfig } from './features/aprendentes/AprendenteConfig'
import { NovoAprendente } from './features/aprendentes/NovoAprendente'
import { EncerrarAprendente } from './features/aprendentes/EncerrarAprendente'
import { AgendaDiaria } from './features/agenda/AgendaDiaria'
import { AgendamentoRapido } from './features/sessoes/AgendamentoRapido'
import { AgendarSessao } from './features/sessoes/AgendarSessao'
import { SessaoDetalheModal } from './features/sessoes/SessaoDetalheModal'
import { PortalPais } from './features/portal/PortalPais'
import { ProtocoloConstrutor } from './features/protocolos/ProtocoloConstrutor'
import { ProtocoloAplicacao } from './features/protocolos/ProtocoloAplicacao'
import { ProtocolosList } from './features/protocolos/ProtocolosList'
import { RANEditor } from './features/ran/RANEditor'
import { RANPreview } from './features/ran/RANPreview'
import { EncaminhamentoEditor } from './features/ran/EncaminhamentoEditor'
import { PINEditor } from './features/ran/PINEditor'
import { DevolutivaView } from './features/ran/DevolutivaView'

// Styles
import './form-styles.css'

// ==========================================
// Main Shell (tabs + FAB + modals)
// ==========================================

function AppShell({ onSignOut }: { onSignOut: () => void }) {
  const navigate = useNavigate()
  const {
    aprendentes,
    sessoesGlobais,
    deferredPrompt,
    handleInstallPWA,
    handleIniciarAtendimento,
    handleMarcarComoPago,
    handleCancelarSessao,
    handleRemarcarSessao,
    handleSalvarNota,
  } = useAppContext()

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    return (sessionStorage.getItem('activeTab') as TabId) || 'inicio'
  })
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [selectedSessao, setSelectedSessao] = useState<import('./lib/types').SessaoAgenda | null>(null)
  const [showSessaoModal, setShowSessaoModal] = useState(false)

  const handleOpenSessaoModal = (sessao: import('./lib/types').SessaoAgenda) => {
    setSelectedSessao(sessao)
    setShowSessaoModal(true)
  }

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    sessionStorage.setItem('activeTab', tab)
    navigate('/')
  }

  return (
    <div className="mobile-container">
      {activeTab === 'inicio' && (
        <DashboardPage
          aprendentes={aprendentes}
          sessoesGlobais={sessoesGlobais}
          onOpenSessaoModal={handleOpenSessaoModal}
          deferredPrompt={deferredPrompt}
          onInstallPWA={handleInstallPWA}
        />
      )}

      {activeTab === 'aprendentes' && (
        <AprendentesList
          aprendentes={aprendentes}
          onSelectAprendente={(ap) => {
            navigate(`/aprendentes/${ap.id}`)
          }}
        />
      )}

      {activeTab === 'agenda' && (
        <>
          <header className="header-greeting" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <img
                src="/logo.png"
                alt="Logo"
                style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: '1.2' }}>
                  Espaço NeuroAprendiz
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Elvira Portes</span>
              </div>
            </div>
          </header>
          <AgendaDiaria
            sessoesGlobais={sessoesGlobais}
            onOpenSessaoModal={handleOpenSessaoModal}
          />
        </>
      )}

      {/* Footer Branding */}
      <div style={{ padding: '2rem 0 3rem 0', textAlign: 'center', opacity: 0.35 }}>
        <span style={{ fontSize: '1rem', fontWeight: 500 }}>
          Tecnologia <strong style={{ color: 'var(--text-dark)' }}>Neuro Flow</strong>
        </span>
      </div>

      {/* FAB Menu */}
      <FABMenu
        isOpen={isFabOpen}
        onToggle={() => setIsFabOpen(!isFabOpen)}
        onNovoAgendamento={() => {
          setIsFabOpen(false)
          navigate('/agendamento-rapido')
        }}
        onNovoAprendente={() => {
          setIsFabOpen(false)
          navigate('/novo-aprendente')
        }}
        onProtocolos={() => {
          setIsFabOpen(false)
          navigate('/protocolos')
        }}
      />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} onSignOut={onSignOut} />

      {/* Session Detail Modal */}
      {showSessaoModal && selectedSessao && (
        <SessaoDetalheModal
          sessao={selectedSessao}
          aprendentes={aprendentes}
          onClose={() => {
            setShowSessaoModal(false)
            setSelectedSessao(null)
          }}
          onIniciarAtendimento={handleIniciarAtendimento}
          onMarcarComoPago={handleMarcarComoPago}
          onSalvarNota={handleSalvarNota}
          onCancelarSessao={async (id) => {
            await handleCancelarSessao(id)
            setShowSessaoModal(false)
            setSelectedSessao(null)
          }}
          onRemarcarSessao={async (sessao, novaData, novaHora) => {
            await handleRemarcarSessao(sessao, novaData, novaHora)
            setShowSessaoModal(false)
            setSelectedSessao(null)
          }}
        />
      )}
    </div>
  )
}

// ==========================================
// Aprendente Profile Route
// ==========================================

function AprendentePerfilRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    aprendentes,
    sessoesGlobais,
    handleMarcarComoPago,
    handleIniciarAtendimento,
    handleCancelarSessao,
    handleRemarcarSessao,
    handleSalvarNota,
  } = useAppContext()

  const [selectedSessao, setSelectedSessao] = useState<import('./lib/types').SessaoAgenda | null>(null)

  const aprendente = aprendentes.find((a) => a.id === id)
  if (!aprendente) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aprendente não encontrado.</div>

  return (
    <>
      <AprendentePerfil
        aprendente={aprendente}
        sessoesGlobais={sessoesGlobais}
        isParentMode={false}
        onBack={() => {
          if (window.history.length > 2) {
            navigate(-1)
          } else {
             navigate('/')
          }
        }}
        onOpenConfig={() => navigate(`/aprendentes/${id}/config`)}
        onOpenSessaoModal={(s) => setSelectedSessao(s)}
        onMarcarComoPago={handleMarcarComoPago}
        onNovaAvaliacao={() => navigate(`/protocolos`)}
      />
      {selectedSessao && (
        <SessaoDetalheModal
          sessao={selectedSessao}
          aprendentes={aprendentes}
          onClose={() => setSelectedSessao(null)}
          onIniciarAtendimento={handleIniciarAtendimento}
          onMarcarComoPago={handleMarcarComoPago}
          onSalvarNota={handleSalvarNota}
          onCancelarSessao={async (id) => {
            await handleCancelarSessao(id)
            setSelectedSessao(null)
          }}
          onRemarcarSessao={async (sessao, novaData, novaHora) => {
            await handleRemarcarSessao(sessao, novaData, novaHora)
            setSelectedSessao(null)
          }}
        />
      )}
    </>
  )
}

// ==========================================
// Aprendente Config Route
// ==========================================

function AprendenteConfigRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { aprendentes, handleSalvarDetalhes, handleExcluirAprendente } = useAppContext()

  const aprendente = aprendentes.find((a) => a.id === id)
  if (!aprendente) return null

  return (
    <AprendenteConfig
      aprendente={aprendente}
      onBack={() => navigate(-1)}
      onSave={async (formData, config) => {
        await handleSalvarDetalhes(formData, config, aprendente)
        navigate(-1)
      }}
      onEncerrar={() => navigate(`/aprendentes/${id}/encerrar`)}
      onExcluir={async () => {
        await handleExcluirAprendente(aprendente)
        navigate('/')
      }}
      onAbrirAgendador={() => navigate(`/aprendentes/${id}/agendar`)}
    />
  )
}

// ==========================================
// Encerrar Aprendente Route
// ==========================================

function EncerrarAprendenteRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { aprendentes, handleEncerrar } = useAppContext()

  const aprendente = aprendentes.find((a) => a.id === id)
  if (!aprendente) return null

  return (
    <EncerrarAprendente
      aprendente={aprendente}
      onBack={() => navigate(-1)}
      onEncerrar={async (motivo) => {
        await handleEncerrar(motivo, aprendente)
        navigate('/')
      }}
    />
  )
}

// ==========================================
// Agendar Sessão Route
// ==========================================

function AgendarSessaoRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { aprendentes, handleSubmitSessao } = useAppContext()

  const aprendente = aprendentes.find((a) => a.id === id)
  if (!aprendente) return null

  return (
    <AgendarSessao
      aprendente={aprendente}
      onBack={() => navigate(-1)}
      onSubmit={async (data, horaInicio) => {
        await handleSubmitSessao(data, horaInicio, aprendente)
        navigate('/')
      }}
    />
  )
}

// ==========================================
// Novo Aprendente Route
// ==========================================

function NovoAprendenteRoute() {
  const navigate = useNavigate()
  const { handleSubmitNovoAprendente } = useAppContext()

  return (
    <NovoAprendente
      onBack={() => navigate(-1)}
      onSubmit={async (formData, ageOrDate, phone) => {
        await handleSubmitNovoAprendente(formData, ageOrDate, phone)
        navigate('/')
      }}
    />
  )
}

// ==========================================
// Agendamento Rápido Route
// ==========================================

function AgendamentoRapidoRoute() {
  const navigate = useNavigate()
  const { aprendentes, handleAgendamentoRapido } = useAppContext()

  return (
    <AgendamentoRapido
      aprendentes={aprendentes}
      onBack={() => navigate(-1)}
      onSubmit={async (ap, quickDate, quickTime) => {
        await handleAgendamentoRapido(ap, quickDate, quickTime)
        navigate('/')
      }}
    />
  )
}

// ==========================================
// Protocolo Routes
// ==========================================

function ProtocolosListRoute() {
  const navigate = useNavigate()
  return (
    <ProtocolosList
      onBack={() => navigate('/')}
      onCriar={() => navigate('/protocolos/novo')}
      onEditar={(m) => navigate(`/protocolos/${m.id}/editar`)}
      onAplicar={(m) => navigate(`/protocolos/${m.id}/aplicar`)}
    />
  )
}

function ProtocoloAplicarRoute() {
  const { modeloId } = useParams<{ modeloId: string }>()
  const navigate = useNavigate()
  const { aprendentes } = useAppContext()
  return (
    <div className="screen-overlay">
      <header className="screen-header">
        <button className="btn-icon" onClick={() => navigate('/protocolos')}>
          <span style={{ fontSize: '1.5rem' }}>←</span>
        </button>
        <h2 className="screen-title">Selecionar Aprendente</h2>
      </header>
      <div className="form-scroll-area">
        <div className="form-container">
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Escolha o aprendente para aplicar a avaliação:
          </p>
          {aprendentes.filter((a) => a.status === 'ativo').map((ap) => (
            <button
              key={ap.id}
              onClick={() => navigate(`/protocolos/${modeloId}/aplicar/${ap.id}`)}
              style={{
                width: '100%', textAlign: 'left', padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)',
                background: 'var(--card-bg)', cursor: 'pointer', marginBottom: '0.75rem',
                fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-dark)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              {ap.nome}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ap.dataOuIdade}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Auth Gate (protects all routes)
// ==========================================

function AuthGate() {
  const { session, loading, signIn, signOut } = useAuth()
  const location = useLocation()

  // Loading spinner
  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a0a0f 0%, #2d0f1c 40%, #1a1a2e 100%)',
      }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
          Carregando...
        </div>
      </div>
    )
  }

  // Portal dos Pais: rota pública, não precisa de login
  if (location.pathname.startsWith('/portal/')) {
    return <PortalPais />
  }

  // Não autenticado: mostrar login
  if (!session) {
    return <LoginPage onSignIn={signIn} />
  }

  // Autenticado: app completo com proteção RLS
  return (
    <AppProvider userId={session.user.id}>
      <Routes>
        {/* Main shell (tabs) */}
        <Route path="/" element={<AppShell onSignOut={signOut} />} />

        {/* Aprendente flow */}
        <Route path="/novo-aprendente" element={<NovoAprendenteRoute />} />
        <Route path="/aprendentes/:id" element={<AprendentePerfilRoute />} />
        <Route path="/aprendentes/:id/config" element={<AprendenteConfigRoute />} />
        <Route path="/aprendentes/:id/encerrar" element={<EncerrarAprendenteRoute />} />
        <Route path="/aprendentes/:id/agendar" element={<AgendarSessaoRoute />} />

        {/* Agenda flow */}
        <Route path="/agendamento-rapido" element={<AgendamentoRapidoRoute />} />

        {/* Protocolos */}
        <Route path="/protocolos" element={<ProtocolosListRoute />} />
        <Route path="/protocolos/novo" element={<ProtocoloConstrutor />} />
        <Route path="/protocolos/:modeloId/editar" element={<ProtocoloConstrutor />} />
        <Route path="/protocolos/:modeloId/aplicar" element={<ProtocoloAplicarRoute />} />
        <Route path="/protocolos/:modeloId/aplicar/:aprendenteId" element={<ProtocoloAplicacao />} />
        
        {/* RAN Routes */}
        <Route path="/aprendentes/:aprendenteId/ran/novo" element={<RANEditor />} />
        <Route path="/aprendentes/:aprendenteId/ran/:ranId" element={<RANEditor />} />
        <Route path="/aprendentes/:aprendenteId/ran/:ranId/preview" element={<RANPreview />} />
        <Route path="/aprendentes/:aprendenteId/encaminhamentos/novo" element={<EncaminhamentoEditor />} />
        <Route path="/aprendentes/:aprendenteId/pin/novo" element={<PINEditor />} />
        <Route path="/aprendentes/:aprendenteId/devolutiva" element={<DevolutivaView />} />
      </Routes>
    </AppProvider>
  )
}

// ==========================================
// Root App
// ==========================================

function App() {
  return (
    <BrowserRouter>
      <AuthGate />
    </BrowserRouter>
  )
}

export default App

import { useState } from 'react'
import { Brain, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

interface LoginPageProps {
  onSignIn: (email: string, password: string) => Promise<string | null>
}

export function LoginPage({ onSignIn }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await onSignIn(email, password)
    if (err) {
      setError('E-mail ou senha incorretos. Verifique e tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a0a0f 0%, #2d0f1c 40%, #1a1a2e 100%)',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(198, 56, 89, 0.15) 0%, transparent 70%)',
          top: '-100px',
          right: '-100px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 56, 198, 0.12) 0%, transparent 70%)',
          bottom: '-80px',
          left: '-80px',
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.4s ease',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #c63859 0%, #8b2252 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 16px 40px rgba(198, 56, 89, 0.4)',
            }}
          >
            <Brain size={38} color="white" />
          </div>
          <h1
            style={{
              color: 'white',
              fontSize: '1.75rem',
              fontWeight: 800,
              margin: '0 0 0.35rem',
              letterSpacing: '-0.02em',
            }}
          >
            NeuroFlow
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem' }}>
            Espaço NeuroAprendiz
          </p>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
            Bem-vinda de volta! 👋
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: '0.9rem' }}>
            Faça login para acessar o prontuário
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="on">
          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '0.875rem 1rem',
                transition: 'border-color 0.2s',
              }}
              onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'rgba(198,56,89,0.6)')}
              onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
            >
              <Mail size={18} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="seu@email.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '0.875rem 1rem',
                transition: 'border-color 0.2s',
              }}
              onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'rgba(198,56,89,0.6)')}
              onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
            >
              <Lock size={18} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  letterSpacing: '0.1em',
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: 'rgba(198, 56, 89, 0.15)',
                border: '1px solid rgba(198, 56, 89, 0.4)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: '#f8a4b8',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: 'none',
              background: loading
                ? 'rgba(198, 56, 89, 0.4)'
                : 'linear-gradient(135deg, #c63859 0%, #a02348 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: loading ? 'none' : '0 8px 28px rgba(198,56,89,0.45)',
              transition: 'all 0.2s ease',
              transform: loading ? 'none' : undefined,
            }}
          >
            {loading ? (
              <>
                <span style={{ opacity: 0.8 }}>Entrando</span>
                <span style={{ animation: 'pulse 1s infinite' }}>...</span>
              </>
            ) : (
              <>
                Entrar
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '1.75rem',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.78rem',
          }}
        >
          <ShieldCheck size={14} />
          <span>Dados clínicos criptografados • Conformidade LGPD</span>
        </div>
      </div>
    </div>
  )
}

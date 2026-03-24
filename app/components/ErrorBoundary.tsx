'use client'
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{
          padding: '32px 24px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 12,
          color: '#fca5a5',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
        }}>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>Une erreur est survenue.</p>
          <p style={{ opacity: 0.7 }}>
            {this.state.error?.message || 'Veuillez recharger la page.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: 16, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)',
              borderRadius: 8, padding: '8px 16px', color: '#fca5a5', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
            }}
          >
            Réessayer
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

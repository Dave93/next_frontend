'use client'

import { Component, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Catches render-time errors inside the checkout form and prints the
 * full stack to the console (the Next.js global-error boundary swallows
 * the message under "Критическая ошибка"). Helps localize React #130
 * type-is-undefined crashes when source maps alone don't suffice.
 */
export default class CheckoutErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    // eslint-disable-next-line no-console
    console.error(
      '[checkout error]',
      error?.name,
      error?.message,
      '\nstack:\n',
      error?.stack,
      '\ncomponentStack:\n',
      info?.componentStack
    )
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: '1.5rem',
            margin: '1rem',
            border: '1px solid #FCA5A5',
            background: '#FEF2F2',
            borderRadius: 12,
            color: '#991B1B',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Ошибка при отображении формы заказа
          </div>
          <div style={{ fontSize: 14, marginBottom: 12 }}>
            {this.state.error?.message || String(this.state.error)}
          </div>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            style={{
              padding: '0.5rem 1rem',
              background: '#FAAF04',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Попробовать снова
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

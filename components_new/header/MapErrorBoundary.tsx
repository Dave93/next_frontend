'use client'

import { Component, ReactNode } from 'react'

type Props = { children: ReactNode; fallback: ReactNode }
type State = { hasError: boolean }

export default class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch() {
    // swallow — leaflet "Map container is already initialized" under
    // React strict-mode dev double-mount is a known dev-only artifact
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

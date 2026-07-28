"use client"

import React, { Component, type ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export default class PublishErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error) {
        console.error('PublishErrorBoundary caught:', error)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-text-secondary mb-4">Hubo un error al cargar esta sección.</p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null })
                            window.location.reload()
                        }}
                        className="px-6 py-2 bg-primary-700 text-text-primary rounded-lg hover:bg-primary-600 transition"
                    >
                        Recargar página
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}

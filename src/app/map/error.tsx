"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
export default function MapError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en el Mapa" description="No pudimos cargar el mapa." />
}

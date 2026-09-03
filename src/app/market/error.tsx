"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
export default function MarketError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en el Marketplace" description="Algo saliÃ³ mal al cargar los vehÃ­culos. Por favor, intenta de nuevo." />
}

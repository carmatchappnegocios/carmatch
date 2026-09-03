"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
export default function MapStoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en Mapa Tiendas" description="No pudimos cargar el mapa de tiendas." />
}

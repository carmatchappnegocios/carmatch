"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
export default function MyBusinessesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en Mis Negocios" description="No pudimos cargar tus negocios." />
}

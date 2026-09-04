"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
export default function EmergencyError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en Emergencia" description="No pudimos cargar la alerta de emergencia." />
}

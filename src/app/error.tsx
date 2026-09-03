"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Algo saliÃ³ mal" description="Ha ocurrido un error inesperado. Por favor, intenta recargar la pÃ¡gina." />
}

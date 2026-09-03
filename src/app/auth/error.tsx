"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error de AutenticaciÃ³n" description="Hubo un problema con la autenticaciÃ³n." />
}

"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
export default function BlogError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en el Blog" description="No pudimos cargar los artÃ­culos del blog." />
}

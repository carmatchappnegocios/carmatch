import ErrorBoundary from '@/components/ErrorBoundary'
export default function CompararError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en Comparar" description="No pudimos cargar la comparación." />
}

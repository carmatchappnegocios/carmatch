import ErrorBoundary from '@/components/ErrorBoundary'
export default function CreditsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en Créditos" description="No pudimos cargar tu información de créditos." />
}

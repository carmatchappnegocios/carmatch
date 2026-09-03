import ErrorBoundary from '@/components/ErrorBoundary'
export default function MarketError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en el Marketplace" description="Algo salió mal al cargar los vehículos. Por favor, intenta de nuevo." />
}

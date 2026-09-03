import ErrorBoundary from '@/components/ErrorBoundary'
export default function NegocioError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error al cargar el negocio" description="No pudimos cargar los detalles del negocio." />
}

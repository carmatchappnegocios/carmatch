import ErrorBoundary from '@/components/ErrorBoundary'
export default function VehicleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error al cargar el vehículo" description="No pudimos cargar los detalles del vehículo." />
}

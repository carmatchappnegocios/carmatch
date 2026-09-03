import ErrorBoundary from '@/components/ErrorBoundary'
export default function NegociosError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en Negocios" description="No pudimos cargar los negocios de esta categoría." />
}

import ErrorBoundary from '@/components/ErrorBoundary'
export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error de Autenticación" description="Hubo un problema con la autenticación." />
}

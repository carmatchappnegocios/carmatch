import ErrorBoundary from '@/components/ErrorBoundary'
export default function BlogPostError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en el Artículo" description="No pudimos cargar este artículo." />
}

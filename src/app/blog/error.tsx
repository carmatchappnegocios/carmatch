"use client"

import * as Sentry from "@sentry/nextjs"

export default function BlogError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    Sentry.captureException(error)

    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-background px-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2">
                    Error en el Blog
                </h2>
                <p className="text-text-secondary mb-6">
                    No pudimos cargar los artículos del blog.
                </p>
                <button
                    onClick={reset}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-bold"
                >
                    Reintentar
                </button>
            </div>
        </div>
    )
}

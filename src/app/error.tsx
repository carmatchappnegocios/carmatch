"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        Sentry.captureException(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
            <div className="max-w-md w-full space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <span className="text-4xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-text-primary">
                    Algo salió mal
                </h1>
                <p className="text-text-secondary text-sm leading-relaxed">
                    Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                </p>
                {error.digest && (
                    <p className="text-text-tertiary text-xs font-mono bg-surface p-2 rounded-lg">
                        Error: {error.digest}
                    </p>
                )}
                <button
                    onClick={reset}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition active:scale-95 shadow-lg"
                >
                    Reintentar
                </button>
                <a
                    href="/"
                    className="block text-sm text-primary-400 hover:text-primary-300 transition"
                >
                    Volver al inicio
                </a>
            </div>
        </div>
    )
}

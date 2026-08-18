'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-primary mb-2">Algo salió mal</h2>
        <p className="text-text-secondary text-sm mb-4">
          {error.message || 'Ocurrió un error inesperado. Intenta de nuevo.'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}

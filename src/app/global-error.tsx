"use client"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="es">
            <body>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    color: '#fff',
                    fontFamily: 'system-ui, sans-serif',
                    padding: '1rem'
                }}>
                    <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <svg width="32" height="32" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>
                            Algo salió mal
                        </h2>
                        <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
                            Ha ocurrido un error inesperado. Por favor, recarga la página.
                        </p>
                        <button
                            onClick={reset}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#2563eb',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}

"use client"

import ErrorBoundary from '@/components/ErrorBoundary'
export default function NotificationsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorBoundary error={error} reset={reset} title="Error en Notificaciones" description="No pudimos cargar tus notificaciones." />
}

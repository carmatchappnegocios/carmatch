'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'

const PING_INTERVAL_MS = 30_000 // cada 30 segundos

export default function BetaSessionTracker() {
    const { data: session } = useSession()
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!session?.user?.id) return

        const ping = () => {
            // Solo pingear si la pestaña esta visible (usuario activo)
            if (document.visibilityState === 'visible') {
                fetch('/api/beta-session/ping', { method: 'POST' }).catch(() => {})
            }
        }

        // Ping inmediato al abrir la app
        ping()

        // Ping periodico cada 30 segundos
        intervalRef.current = setInterval(ping, PING_INTERVAL_MS)

        // Ping cuando el usuario regresa a la pestaña
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') ping()
        }
        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [session?.user?.id])

    return null // Componente invisible
}

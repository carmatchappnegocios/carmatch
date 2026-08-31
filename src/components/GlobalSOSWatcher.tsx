'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

/**
 * 🛡️ GlobalSOSWatcher
 * Este componente se ejecuta en toda la app. 
 * Si el usuario tiene una alerta SOS activa (como víctima o contraparte),
 * inicia un ciclo de actualización de ubicación agresivo (cada 15s)
 * para asegurar que el rastreo de 48h funcione incluso fuera del chat.
 */
export default function GlobalSOSWatcher() {
    const { data: session } = useSession()
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!session?.user?.id) return

        const checkAndSync = async () => {
            try {
                // 1. Verificar si hay alertas activas para este usuario
                const res = await fetch('/api/sos/active')
                if (!res.ok) return
                
                const { active } = await res.json()

                if (active) {
                    // 2. Si hay alerta activa y no hay intervalo, iniciarlo
                    if (!syncIntervalRef.current) {
                        console.log('🚨 [SOS WATCHER] Alerta activa detectada. Iniciando sincronización de ubicación...');
                        
                        const syncLocation = () => {
                            if (!navigator.geolocation) return
                            navigator.geolocation.getCurrentPosition(async (pos) => {
                                if (pos.coords.accuracy > 100) {
                                    console.warn(`⚠️ [SOS WATCHER] GPS precisión ${Math.round(pos.coords.accuracy)}m > 100m, ignorando`)
                                    return
                                }
                                try {
                                    await fetch('/api/user/location', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            latitude: pos.coords.latitude,
                                            longitude: pos.coords.longitude
                                        })
                                    })
                                } catch (e) {
                                    console.error('Error sending global SOS location:', e)
                                }
                            }, (err) => {
                                console.warn('Global SOS location failed:', err)
                            }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 })
                        }

                        syncLocation()
                        syncIntervalRef.current = setInterval(syncLocation, 15000)
                    }
                } else {
                    // 3. Si no hay alerta, detener intervalo si existe
                    if (syncIntervalRef.current) {
                        console.log('✅ [SOS WATCHER] No hay alertas activas. Deteniendo sincronización.');
                        clearInterval(syncIntervalRef.current)
                        syncIntervalRef.current = null
                    }
                }
            } catch (e) {
                console.error('Error in GlobalSOSWatcher:', e)
            }
        }

        // Ejecutar verificación inicial y luego cada minuto
        checkAndSync()
        const checkInterval = setInterval(checkAndSync, 60000)

        return () => {
            clearInterval(checkInterval)
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current)
        }
    }, [session])

    return null // Componente invisible
}

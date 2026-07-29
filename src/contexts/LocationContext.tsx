"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { getUserLocation, getLocationFromIP, reverseGeocode, LocationData } from '@/lib/geolocation'

interface LocationContextType {
    location: LocationData | null
    loading: boolean
    initializing: boolean // 🔥 Evita el parpadeo inicial
    error: string | null
    manualLocation: LocationData | null
    setManualLocation: (data: LocationData | null) => void
    refreshLocation: () => Promise<void>
    preciseLocationEnabled: boolean
    setPreciseLocationEnabled: (enabled: boolean) => void
    gpsPermission: PermissionState | 'unsupported' | 'unknown'
}


const LocationContext = createContext<LocationContextType | undefined>(undefined)

/**
 * Provider de ubicación GPS en tiempo real
 * Implementa fallback: GPS → Manual
 */
export function LocationProvider({
    children
}: {
    children: React.ReactNode
}) {
    const [location, setLocation] = useState<LocationData | null>(null)
    const [loading, setLoading] = useState(true)
    const [initializing, setInitializing] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [manualLocation, setManualLocationState] = useState<LocationData | null>(null)
    const manualLocationRef = useRef<LocationData | null>(null)
    const [preciseLocationEnabled, setPreciseLocationEnabledState] = useState(false)
    const [gpsPermission, setGpsPermission] = useState<PermissionState | 'unsupported' | 'unknown'>('unknown')

    // Persistencia: Guardar ubicación manual
    const setManualLocation = useCallback((data: LocationData | null) => {
        manualLocationRef.current = data
        setManualLocationState(data)
        if (data) setError(null) // 🔥 Limpiar error si el usuario selecciona una ubicación válida
        if (typeof window !== 'undefined') {
            if (data) localStorage.setItem('carmatch_manual_location', JSON.stringify(data))
            else localStorage.removeItem('carmatch_manual_location')
        }
    }, [])

    // Consultar el estado real del permiso GPS del navegador
    const checkGpsPermission = useCallback(async () => {
        if (typeof navigator === 'undefined' || !navigator.permissions) {
            setGpsPermission('unsupported')
            return
        }
        try {
            const result = await navigator.permissions.query({ name: 'geolocation' })
            setGpsPermission(result.state)
            result.onchange = () => setGpsPermission(result.state)
        } catch {
            setGpsPermission('unknown')
        }
    }, [])

    // Persistencia: Toggle de ubicación precisa (GPS)
    const setPreciseLocationEnabled = useCallback((enabled: boolean) => {
        setPreciseLocationEnabledState(enabled)
        if (typeof window !== 'undefined') {
            localStorage.setItem('carmatch_precise_location', enabled ? '1' : '0')
        }
        // Si se activa, pedir GPS inmediatamente
        if (enabled) {
            fetchLocation(true)
        }
    // fetchLocation se agrega más abajo como dependencia
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchLocation = useCallback(async (isManualRefresh = false) => {
        // 🛡️ PREVENT RE-ENTRY: Si ya está cargando, no iniciar otra petición
        if (loading && !isManualRefresh) return;
        
        setLoading(true)
        setError(null)

        try {
            // 1. Intentar obtener GPS del navegador (solo cuando se llama explícitamente)
            const coords = await getUserLocation()

            // 2. Convertir coordenadas a ciudad
            const locationData = await reverseGeocode(coords.latitude, coords.longitude)

            setLocation(locationData)

            // Si el usuario pidió detectar manualmente, limpiamos la selección manual previa
            // para que la ubicación real tome precedencia
            if (isManualRefresh && locationData) {
                setManualLocation(null)
            }

            // Cache para rapidez en siguiente sesión
            if (typeof window !== 'undefined') {
                localStorage.setItem('carmatch_last_detected_location', JSON.stringify(locationData))
            }

            // 🚀 SYNC TO SERVER: Guardar ubicación en el servidor
            try {
                await fetch('/api/user/location', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude })
                })
            } catch (e) {
                console.warn('[LOCATION] Failed to sync to server:', e)
            }

            setError(null)
        } catch (err) {
            console.warn('GPS no disponible:', err)
            setError(err instanceof Error ? err.message : 'Error de ubicación GPS')
        } finally {
            setLoading(false)
        }
    }, [setManualLocation])

    // Consultar permiso al montar
    useEffect(() => {
        checkGpsPermission()
    }, [checkGpsPermission])

    useEffect(() => {
        let hasSaved = false;
        
        // ─── PASO 1: Cargar ubicación en cache (instantáneo) ───────────────
        if (typeof window !== 'undefined') {
            const savedManual = localStorage.getItem('carmatch_manual_location')
            const savedDetected = localStorage.getItem('carmatch_last_detected_location')
            const savedPrecise = localStorage.getItem('carmatch_precise_location')

            if (savedPrecise === '1') {
                setPreciseLocationEnabledState(true)
            }

            if (savedManual) {
                try {
                    const parsed = JSON.parse(savedManual)
                    manualLocationRef.current = parsed
                    setManualLocationState(parsed)
                    hasSaved = true;
                } catch (e) {
                    console.error('Error parsing manual location', e)
                }
            } else if (savedDetected) {
                try {
                    const parsed = JSON.parse(savedDetected)
                    setLocation(parsed)
                    hasSaved = true;
                } catch (e) {
                    console.error('Error parsing detected location', e)
                }
            }
        }

        setInitializing(false)

        // ─── PASO 2: Detección por IP (OBLIGATORIA - siempre provee ciudad) ─
        // Se ejecuta UNA SOLA VEZ al montar. Usamos ref para leer manualLocation
        // sin agregarlo como dependencia (evita bucle infinito).
        const startIpDetection = async () => {
            if (manualLocationRef.current) {
                // El usuario ya eligió una ciudad manualmente → no interferir
                setLoading(false)
                return
            }
            
            try {
                if (!hasSaved) setLoading(true)
                
                const coords = await getLocationFromIP()
                const locationData = await reverseGeocode(coords.latitude, coords.longitude)
                
                // Actualizar ubicación:
                // - Si no hay nada → usar IP
                // - Si solo hay coordenadas sin ciudad → usar IP
                // - Si ya hay ciudad en cache → mantener cache (más preciso)
                setLocation(prev => {
                    if (!prev) return locationData
                    if (prev && !prev.city) return locationData
                    return prev // Cache ya tiene ciudad, mantener
                })
                
                if (typeof window !== 'undefined') {
                    localStorage.setItem('carmatch_last_detected_location', JSON.stringify(locationData))
                }
                console.log(`📍 [IP Location] Detected: ${locationData.city}, ${locationData.country}`)
            } catch (e) {
                console.warn('⚠️ IP detection failed. Using cached or defaulting to Mexico...')
                // 🛡️ FALLBACK FINAL: Si la IP falla también, al menos no bloqueamos
                setLocation(prev => prev || { latitude: 0, longitude: 0, city: undefined, country: 'Mexico', countryCode: 'MX' })
            } finally {
                setLoading(false) // ✅ Siempre liberar el loading al terminar IP
            }
        }
        
        startIpDetection()

        // ─── PASO 3: GPS Preciso (OPCIONAL - solo si ya inició sesión y lo activó) ─
        const precisePref = typeof window !== 'undefined'
            ? localStorage.getItem('carmatch_precise_location') === '1'
            : false
        if (!manualLocationRef.current && precisePref) {
            fetchLocation(false)
        }
        
    // 🔥 BUCLE PREVENIDO: Solo se ejecuta al montar (fetchLocation es estable con useCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchLocation])

    // 🔄 PERIODIC LOCATION UPDATE: Cada 5 minutos cuando GPS está activo
    useEffect(() => {
        if (!preciseLocationEnabled) return
        const interval = setInterval(() => {
            navigator.geolocation?.getCurrentPosition(
                async (position) => {
                    try {
                        await fetch('/api/user/location', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                            })
                        })
                        console.log('[LOCATION] Periodic sync to server OK')
                    } catch (e) {
                        console.warn('[LOCATION] Periodic sync failed:', e)
                    }
                },
                () => {},
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }, 5 * 60 * 1000) // 5 minutos
        return () => clearInterval(interval)
    }, [preciseLocationEnabled])

    // Si el usuario selecciona manualmente una ciudad, usar esa
    const effectiveLocation = manualLocation || location

    return (
        <LocationContext.Provider
            value={{
                location: effectiveLocation,
                loading,
                initializing,
                error,
                manualLocation,
                setManualLocation,
                refreshLocation: () => fetchLocation(true),
                preciseLocationEnabled,
                setPreciseLocationEnabled,
                gpsPermission,
            }}
        >
            {children}
        </LocationContext.Provider>
    )
}

/**
 * Hook para acceder al contexto de ubicación
 */
export function useLocation() {
    const context = useContext(LocationContext)
    if (context === undefined) {
        throw new Error('useLocation debe usarse dentro de LocationProvider')
    }
    return context
}

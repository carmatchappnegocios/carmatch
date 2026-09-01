"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { getUserLocation, getLocationFromIP, reverseGeocode, watchUserLocation, LocationData } from '@/lib/geolocation'

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
    showLocationPrompt: boolean
    dismissLocationPrompt: (allow: boolean) => void
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
    const preciseLocationRef = useRef(false)
    const [gpsPermission, setGpsPermission] = useState<PermissionState | 'unsupported' | 'unknown'>('unknown')
    const [showLocationPrompt, setShowLocationPrompt] = useState(false)

    // Persistencia: Guardar ubicación manual
    const setManualLocation = useCallback((data: LocationData | null) => {
        manualLocationRef.current = data ? { ...data, source: 'manual' } : null
        setManualLocationState(data ? { ...data, source: 'manual' } : null)
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
        preciseLocationRef.current = enabled
        if (typeof window !== 'undefined') {
            localStorage.setItem('carmatch_precise_location', enabled ? '1' : '0')
            localStorage.setItem('carmatch_location_prompt', 'asked')
        }
        // Si se activa, pedir GPS inmediatamente
        if (enabled) {
            fetchLocation(true)
        }
    // fetchLocation se agrega más abajo como dependencia
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const dismissLocationPrompt = useCallback((allow: boolean) => {
        setShowLocationPrompt(false)
        if (typeof window !== 'undefined') {
            localStorage.setItem('carmatch_location_prompt', 'asked')
        }
        if (allow) {
            setPreciseLocationEnabled(true)
        } else {
            setPreciseLocationEnabled(false)
        }
    }, [setPreciseLocationEnabled])

    const fetchLocation = useCallback(async (isManualRefresh = false) => {
        // 🛡️ PREVENT RE-ENTRY: Si ya está cargando, no iniciar otra petición
        if (loading && !isManualRefresh) return;
        
        setLoading(true)
        setError(null)

        try {
            // 1. Si ubicación precisa activa, SOLO GPS (sin WiFi fallback en móvil)
            //    Si GPS falla, no设置 ubicación — watchPosition se encargará cuando consiga señal
            if (preciseLocationRef.current) {
                try {
                    const coords = await getUserLocation({ highAccuracyOnly: true })
                    const locationData = await reverseGeocode(coords.latitude, coords.longitude)
                    setLocation(prev => ({ ...prev, ...locationData, source: 'gps', accuracy: coords.accuracy }))
                    if (isManualRefresh && locationData) setManualLocation(null)
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('carmatch_last_detected_location', JSON.stringify(locationData))
                    }
                } catch {
                    // GPS falló (cold start en móvil puede tardar 30-60s)
                    // No设置 ubicación — watchPosition se encargará cuando GPS consiga fix
                    console.log('📍 [LocationContext] GPS no disponible aún, watchPosition se encargará')
                }
                return
            }

            // 2. Sin ubicación precisa — fallback normal (WiFi/celda para ciudad)
            const coords = await getUserLocation()
            const locationData = await reverseGeocode(coords.latitude, coords.longitude)
            const source = coords.accuracy > 500 ? 'ip' : 'gps'
            setLocation(prev => ({ ...prev, ...locationData, source, accuracy: coords.accuracy }))

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
                preciseLocationRef.current = true
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
                    // Ignorar cache viejo — la IP detection siempre provee datos frescos
                    // Solo usamos cache si tiene GPS (precise) data
                    if (parsed && parsed.latitude && parsed.longitude) {
                        // No cargamos del cache — esperamos a que IP detection corra
                        // para siempre tener datos actualizados
                    }
                } catch (e) {
                    console.error('Error parsing detected location', e)
                }
            }
        }

        setInitializing(false)

        // ─── Mostrar prompt UNA vez si nunca se preguntó ─
        if (typeof window !== 'undefined') {
            const promptState = localStorage.getItem('carmatch_location_prompt')
            const preciseState = localStorage.getItem('carmatch_precise_location')
            if (!promptState && preciseState !== '1' && preciseState !== '0') {
                // No molestar si hay manualLocation, solo preguntar en primera visita limpia
                const hasManual = localStorage.getItem('carmatch_manual_location')
                if (!hasManual) {
                    // Delay 1.5s para no bloquear carga inicial
                    setTimeout(() => setShowLocationPrompt(true), 1500)
                }
            }
        }

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
                
                const locationData = await getLocationFromIP()
                
                console.log('🔍 [LocationContext] IP detection result:', {
                    city: locationData.city,
                    state: locationData.state,
                    lat: locationData.latitude,
                    lng: locationData.longitude,
                    source: 'ip-api'
                })
                
                // Actualizar ubicación:
                // La detección IP siempre sobrescribe el cache con datos frescos
                // porque el cache puede tener datos viejos/incorrectos.
                setLocation({ ...locationData, source: 'ip' })
                
                if (typeof window !== 'undefined') {
                    localStorage.setItem('carmatch_last_detected_location', JSON.stringify(locationData))
                }
            } catch (e) {
                console.warn('⚠️ IP detection failed. No city set — user must search manually.')
                // Sin fallback: la app es mundial, no hardcodeamos ciudad.
                // El mapa mostrará loading hasta que el usuario busque una ciudad.
            } finally {
                setLoading(false) // ✅ Siempre liberar el loading al terminar IP
            }
        }
        
        startIpDetection()

        // ─── PASO 3: GPS Preciso ─
        // NO se ejecuta automáticamente — solo cuando el usuario lo activa desde Settings
        // (evita que GPS de baja precisión sobreescriba la ubicación IP correcta)
        
    // 🔥 BUCLE PREVENIDO: Solo se ejecuta al montar (fetchLocation es estable con useCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchLocation])

    // 🔄 REAL-TIME LOCATION UPDATE: watchPosition continuo cuando GPS está activo
    useEffect(() => {
        if (!preciseLocationEnabled) return

        let lastReverseGeocode = 0
        let gotFirstFix = false
        let retryTimer: NodeJS.Timeout | null = null

        // Rescate: si watchPosition no emite fix en 20s, intentar one-shot GPS
        retryTimer = setTimeout(async () => {
            if (!gotFirstFix) {
                console.warn('⚠️ [LocationContext] GPS retry: watchPosition sin fix en 20s, intentando one-shot...')
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 20000,
                            maximumAge: 0,
                        })
                    })
                    const { latitude, longitude, accuracy } = pos.coords
                    if (accuracy <= 200) {
                        console.log(`📍 [LocationContext] GPS retry fix: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} ±${Math.round(accuracy)}m`)
                        setLocation(prev => ({ ...prev, latitude, longitude, accuracy, source: 'gps' }))
                        gotFirstFix = true
                        await fetch('/api/user/location', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ latitude, longitude, accuracy })
                        })
                    }
                } catch (e) {
                    console.warn('⚠️ [LocationContext] GPS retry also failed:', e)
                }
            }
        }, 20000)

        const stopWatching = watchUserLocation(
            async (coords, accuracy) => {
                try {
                    // Solo marcar como GPS cuando accuracy es buena (≤200m)
                    // Torre celular/WiFi (accuracy >200m) no se etiqueta como GPS
                    if (accuracy <= 200) {
                        gotFirstFix = true
                        if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
                    }

                    console.log(`📍 [LocationContext] watchPosition update: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)} (±${Math.round(accuracy)}m)`)
                    
                    // Actualizar ubicación — source solo cambia a 'gps' si accuracy ≤200m
                    setLocation(prev => ({
                        ...prev,
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        accuracy,
                        source: accuracy <= 200 ? 'gps' : prev.source,
                    }))

                    // Sync to server
                    await fetch('/api/user/location', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            accuracy,
                        })
                    })

                    // Reverse geocode throttled cada 60s (no cada update)
                    const now = Date.now()
                    if (now - lastReverseGeocode > 60000) {
                        lastReverseGeocode = now
                        const geo = await reverseGeocode(coords.latitude, coords.longitude)
                        setLocation(prev => ({
                            ...prev,
                            ...geo,
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            accuracy,
                            source: 'gps',
                        }))
                    }
                } catch (e) {
                    console.warn('[LOCATION] Real-time sync failed:', e)
                }
            },
            { maxAccuracy: 200 }
        )

        return () => {
            if (retryTimer) clearTimeout(retryTimer)
            stopWatching()
        }
    }, [preciseLocationEnabled])

    // Si el usuario selecciona manualmente una ciudad, usar esa
    const effectiveLocation = manualLocation || location

    const contextValue = useMemo(() => ({
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
        showLocationPrompt,
        dismissLocationPrompt,
    }), [effectiveLocation, loading, initializing, error, manualLocation, setManualLocation, fetchLocation, preciseLocationEnabled, setPreciseLocationEnabled, gpsPermission, showLocationPrompt, dismissLocationPrompt])

    return (
        <LocationContext.Provider value={contextValue}>
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

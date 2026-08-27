
"use client"
// v1.4 Refactor: Global LocationContext Usage

import { useEffect, useState, useRef, useCallback } from 'react'
import { MapPin, Search, Loader2, Plus, RefreshCw, MessageSquare } from 'lucide-react'
import { MarketChat } from '@/components/MarketChat'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useLocation } from '@/contexts/LocationContext'
import { searchCity, searchCities, calculateDistance, normalizeCountryCode, LocationData } from '@/lib/geolocation'
import dynamic from 'next/dynamic'
import FavoriteButton from '@/components/FavoriteButton'
import ShareButton from '@/components/ShareButton'
import ReportImageButton from '@/components/ReportImageButton'
import { formatPrice, formatNumber } from '@/lib/vehicleTaxonomy'
import { generateVehicleSlug, generateBusinessSlug } from '@/lib/slug'

const MarketFilters = dynamic(() => import('@/components/MarketFilters'), { ssr: false })

interface FeedItem {
    id: string
    title: string
    brand?: string
    model?: string
    year?: number
    price?: number
    currency?: string | null
    city: string
    latitude: number | null
    longitude: number | null
    country?: string | null
    images?: string[]
    transmission?: string
    mileage?: number
    vehicleType?: string
    isFavorited?: boolean
    feedType: 'VEHICLE' | 'BUSINESS'
    isBoosted?: boolean
    category?: string
    user: {
        name: string
        image: string | null
    }
}

interface MarketClientProps {
    initialItems: FeedItem[]
    currentUserId: string
    brands: string[]
    vehicleTypes: string[]
    colors: string[]
    searchParams: any
    aiReasoning?: string
}

// Utility: Fisher-Yates Shuffle with 300% Boost Prioritization
function boostShuffleArray(array: FeedItem[]): FeedItem[] {
    const boosted = array.filter(item => item.isBoosted)
    const regular = array.filter(item => !item.isBoosted)

    // Shuffle regular items
    for (let i = regular.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [regular[i], regular[j]] = [regular[j], regular[i]];
    }

    // Shuffle boosted items
    for (let i = boosted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [boosted[i], boosted[j]] = [boosted[j], boosted[i]];
    }

    const result: FeedItem[] = []

    // First items should be boosted if available
    const initialBoost = boosted.slice(0, 3)
    const remainingBoost = boosted.slice(3)

    result.push(...initialBoost)

    // Distribute remaining boosted items every 3 regular items (300% visibility)
    let bIndex = 0
    let rIndex = 0

    while (rIndex < regular.length || bIndex < remainingBoost.length) {
        // Add up to 3 regular items
        for (let k = 0; k < 3 && rIndex < regular.length; k++) {
            result.push(regular[rIndex++])
        }
        // Add 1 boosted item if available
        if (bIndex < remainingBoost.length) {
            result.push(remainingBoost[bIndex++])
        }
    }

    return result
}
export default function MarketClient({
    initialItems,
    currentUserId,
    brands,
    vehicleTypes,
    colors,
    searchParams,
    aiReasoning: initialAiReasoning
}: MarketClientProps) {
    const { t, locale } = useLanguage()
    const [aiReasoning, setAiReasoning] = useState(initialAiReasoning)
    const router = useRouter()

    // 🔥 USANDO CONTEXTO GLOBAL
    const { location, loading: locationLoading, manualLocation, setManualLocation } = useLocation()
    const [isFiltering, setIsFiltering] = useState(true)

    // 🛡️ EMERGENCY FAILSAFE: Si el filtrado tarda más de 5 segundos, mostramos lo que tengamos
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isFiltering) {
                console.warn("⚠️ Market filtering timed out. Forcing content visibility.")
                setIsFiltering(false)
            }
        }, 5000)
        return () => clearTimeout(timer)
    }, [isFiltering])

    // ANILLOS PROGRESIVOS
    const RADIUS_TIERS = [25, 50, 100, 250, 500, 1000, 2500, 5000]
    const [tierIndex, setTierIndex] = useState(0)
    const searchRadius = RADIUS_TIERS[tierIndex]

    const [items, setItems] = useState<FeedItem[]>(initialItems)
    const [filteredItems, setFilteredItems] = useState<FeedItem[]>(initialItems)
    const [showFilters, setShowFilters] = useState(false)

    // --- PULL TO REFRESH STATE ---
    const [pullProgress, setPullProgress] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [startY, setStartY] = useState(0)
    const pullThreshold = 100

    // Modal UI State
    const [showLocationModal, setShowLocationModal] = useState(false)

    const [locationInput, setLocationInput] = useState('')

    // 🆕 Candidate List State
    const [locationCandidates, setLocationCandidates] = useState<LocationData[]>([])
    const [showCandidates, setShowCandidates] = useState(false)

    // Ubicación Activa
    const activeLocation = manualLocation || location
    const rawCity = activeLocation?.city || activeLocation?.state || ''
    const displayCity = rawCity ? (() => { try { return decodeURIComponent(rawCity) } catch { return rawCity } })() : (locationLoading ? t('common.loading') : t('market.radius_unknown'))
    const userCountry = normalizeCountryCode(activeLocation?.countryCode || activeLocation?.country)
    const containerRef = useRef<HTMLElement | null>(null)

    // 💾 OFFLINE CACHE LOGIC
    useEffect(() => {
        if (initialItems && initialItems.length > 0) {
            localStorage.setItem('carmatch_market_cache', JSON.stringify(initialItems))
        }
    }, [initialItems])

    useEffect(() => {
        // Si no hay items del servidor (posible offline o carga fallida)
        // intentamos recuperar del cache local
        if ((!initialItems || initialItems.length === 0) && !navigator.onLine) {
            const cached = localStorage.getItem('carmatch_market_cache')
            if (cached) {
                try {
                    const parsed = JSON.parse(cached)
                    setItems(parsed)

                } catch (e) {
                    console.error('Error parsing market cache', e)
                }
            }
        }
    }, [initialItems])

    // Pagination
    const CARS_PER_PAGE = 4 // 💰 Optimizado para datos móviles (antes: 6)
    const [visibleCount, setVisibleCount] = useState(CARS_PER_PAGE)

    // 🔔 REAL-TIME NOTIFICATIONS
    const [newVehiclesCount, setNewVehiclesCount] = useState(0)

    useEffect(() => {
        /* 🔔 REAL-TIME NOTIFICATIONS (Socket.io)
        // 💰 Desactivado temporalmente para diagnosticar bloqueo de main-thread
        import('@/lib/socket').then(({ socket }) => {
            if (!socket.connected) socket.connect()

            const handleNewVehicle = (vehicle: any) => {
                if (activeLocation && activeLocation.latitude && activeLocation.longitude && vehicle.latitude && vehicle.longitude) {
                    const dist = calculateDistance(
                        activeLocation.latitude,
                        activeLocation.longitude,
                        vehicle.latitude,
                        vehicle.longitude
                    )

                    if (dist <= searchRadius) {
                        setNewVehiclesCount(prev => prev + 1)
                    }
                } else if (!activeLocation) {
                    setNewVehiclesCount(prev => prev + 1)
                }
            }

            socket.on('new_vehicle_published', handleNewVehicle)

            return () => {
                socket.off('new_vehicle_published', handleNewVehicle)
            }
        }) */
        return () => {}
    }, [activeLocation, searchRadius])

    // 🔥 AI ORCHESTRATOR: Escuchar eventos externos (desde AIChatbot)
    useEffect(() => {
        const handleAiFilter = (e: any) => {
            const params = e.detail
            const urlParams = new URLSearchParams()
            if (params.brand) urlParams.set('brand', params.brand)
            if (params.model) urlParams.set('model', params.model)
            if (params.category) urlParams.set('category', params.category)
            if (params.minPrice) urlParams.set('minPrice', params.minPrice)
            if (params.maxPrice) urlParams.set('maxPrice', params.maxPrice)
            if (params.search) urlParams.set('search', params.search)

            // Navegar para refrescar datos (SSR)
            router.push(`/market?${urlParams.toString()}`)

            // Visual feedback
            setShowFilters(false)
            setTierIndex(0)
        }

        window.addEventListener('market-ai-filter', handleAiFilter)
        return () => window.removeEventListener('market-ai-filter', handleAiFilter)
    }, [router])

    useEffect(() => {
        // 🔄 URL -> Context Synchronization
        const syncUrlCity = async () => {
            const decodedCity = (() => { try { return searchParams.city ? decodeURIComponent(searchParams.city) : '' } catch { return searchParams.city || '' } })()
            if (decodedCity && (!manualLocation || manualLocation.city !== decodedCity)) {
                try {
                    const loc = await searchCity(decodedCity)
                    if (loc) {
                        setManualLocation(loc)
                        setTierIndex(0)
                    }
                } catch (e) {
                    console.warn("Failed to sync URL city to context", e)
                }
            }
        }
        syncUrlCity()

        // 🚀 CRITICAL FIX: Always default to server-provided items first
        let currentItems = [...initialItems]

        // Only try to restore order/shuffle if we are NOT in a specific search context that dictates order/filtering
        // If initialItems changed drastically (different length/content), server knows best.
        const isDefaultView = !searchParams.search && !searchParams.brand && !searchParams.category

        if (isDefaultView) {
            const savedItemsOrder = sessionStorage.getItem('market_items_order')
            if (savedItemsOrder && !searchParams.sort) {
                try {
                    const orderedIds = JSON.parse(savedItemsOrder)
                    const orderedItems = orderedIds.map((id: string) => initialItems.find(it => it.id === id)).filter(Boolean)
                    // Only restore if we have roughly the same content
                    if (orderedItems.length > 0 && orderedItems.length === initialItems.length) {
                        currentItems = orderedItems
                    } else {
                        // Reshuffle if mismatch
                        currentItems = boostShuffleArray(initialItems)
                        sessionStorage.setItem('market_items_order', JSON.stringify(currentItems.map(it => it.id)))
                    }
                } catch (e) {
                    // Fallback shuffle
                    currentItems = boostShuffleArray(initialItems)
                }
            } else if (!searchParams.sort || searchParams.sort === 'newest') {
                // Initial shuffle
                currentItems = boostShuffleArray(initialItems)
                sessionStorage.setItem('market_items_order', JSON.stringify(currentItems.map(it => it.id)))
            }
        } else {
            // 🧠 SEARCH MODE: Trust server order absolutely
            // Do NOT shuffle or restore old order when user is searching specific things
            // But we might want to prioritize boosted in search too? usually server handles sort.
            // If sort is default (newest), maybe we still want admin boost logic?
            // Actually boostShuffleArray handles admin logic nicely.
            // But for "Ram negra", we just want the results.
            // Let's trust use server order for filtered views to avoid confusion.
        }

        setItems(currentItems)
        // Reset AI reasoning on search change
        setAiReasoning(initialAiReasoning)

    }, [initialItems, searchParams.sort, searchParams.city, searchParams.search, searchParams.brand, searchParams.category, initialAiReasoning])

    // Save visibleCount whenever it changes
    useEffect(() => {
        sessionStorage.setItem('market_visible_count', visibleCount.toString())
    }, [visibleCount])

    // --- INFINITE SCROLL LOGIC ---
    const observer = useRef<IntersectionObserver | null>(null)
    const lastItemRef = useCallback((node: HTMLDivElement | null) => {
        if (isFiltering) return
        // ✅ With native body scroll, root must be null (= viewport)
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && visibleCount < filteredItems.length) {
                setVisibleCount(prev => prev + CARS_PER_PAGE)
            }
        }, {
            threshold: 0.1,
            root: null, // null = viewport (window scroll)
            rootMargin: '100px'
        })

        if (node) observer.current.observe(node)
    }, [isFiltering, visibleCount, filteredItems.length, tierIndex, RADIUS_TIERS.length])

    // Find the main container on mount
    useEffect(() => {
        // ✅ With native body scroll, the scroller IS the window
        containerRef.current = document.documentElement as any
    }, [])

    // 🔥 MOBILE PULL-TO-REFRESH OPTIMIZATION
    const [isTouchingTop, setIsTouchingTop] = useState(false)

    useEffect(() => {
        /* 🚀 MOBILE PULL-TO-REFRESH OPTIMIZATION
        const onTouchStart = (e: TouchEvent) => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            if (scrollTop <= 5 && !isRefreshing) {
                setStartY(e.touches[0].pageY)
                setIsTouchingTop(true)
            }
        }

        const onTouchMove = (e: TouchEvent) => {
            if (startY === 0 || isRefreshing) return
            const currentY = e.touches[0].pageY
            const diff = currentY - startY
            const scrollTop = window.scrollY || document.documentElement.scrollTop

            if (diff > 0 && scrollTop <= 5) {
                const progress = Math.min(diff / 2.5, pullThreshold + 20)
                setPullProgress(progress)

                if (progress > 10 && e.cancelable) {
                    e.preventDefault()
                }
            } else if (diff < 0) {
                setPullProgress(0)
                setStartY(0)
                setIsTouchingTop(false)
            }
        }

        const onTouchEnd = async () => {
            if (pullProgress > pullThreshold && isTouchingTop) {
                await triggerRefresh()
            }
            setPullProgress(0)
            setStartY(0)
            setIsTouchingTop(false)
        }

        document.addEventListener('touchstart', onTouchStart, { passive: true })
        document.addEventListener('touchmove', onTouchMove, { passive: false })
        document.addEventListener('touchend', onTouchEnd)

        return () => {
            document.removeEventListener('touchstart', onTouchStart)
            document.removeEventListener('touchmove', onTouchMove)
            document.removeEventListener('touchend', onTouchEnd)
        } */
        return () => {}
    }, [startY, isRefreshing, pullProgress, pullThreshold, isTouchingTop])

    const triggerRefresh = async () => {
        setIsRefreshing(true)

        // 1. Force immediate local shuffle for "perceived" randomness
        sessionStorage.removeItem('market_items_order')
        const freshOrder = boostShuffleArray(initialItems)
        setItems(freshOrder)
        sessionStorage.setItem('market_items_order', JSON.stringify(freshOrder.map(it => it.id)))

        // 2. Refresh from server (Next.js server actions / router.refresh)
        router.refresh()

        // 3. Fake delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 800))
        setIsRefreshing(false)

        // 4. Ensure we show results from top
        setVisibleCount(CARS_PER_PAGE)
        // 🔔 Reset notification
        setNewVehiclesCount(0)
    }

    // --- LÓGICA DE FILTRADO Y DISTANCIA ---
    useEffect(() => {
        const filterItems = async () => {
            // 📍 LOCATION SYNC: Esperar a que la ubicación esté lista para filtrar localmente
            // Pero si ya tenemos initialItems, no bloqueamos el renderizado
            if (locationLoading && !activeLocation && items.length === 0) {
                setIsFiltering(true)
                return
            }

            setIsFiltering(true)

            try {
                const userLat = activeLocation?.latitude
                const userLng = activeLocation?.longitude

                const processed = items
                    .map(item => {
                        let d = 99999
                        if (userLat && userLng && item.latitude && item.longitude) {
                            d = calculateDistance(userLat, userLng, item.latitude, item.longitude)
                        } else if (activeLocation?.city && item.city && item.city.toLowerCase().includes(activeLocation.city.toLowerCase())) {
                            // 🏁 FALLBACK DE CIUDAD: Si no hay GPS pero la ciudad coincide, asignar distancia 0
                            // para asegurar que aparezca en el radio inicial (0-25km).
                            d = 0
                        }

                        // 👑 ADMIN GLOBAL VISIBILITY:
                        // If it's an admin vehicle (isBoosted) AND in the same country,
                        // force distance to 0 so it appears as "Local" (0-12km tier) anywhere in the country.
                        if (item.isBoosted && normalizeCountryCode(item.country) === userCountry) {
                            d = 0
                        }

                        return { ...item, distance: d }
                    })
                    // 🌍 FRONTERA DIGITAL: Filtrar estrictamente por país normalizado
                    .filter(item => {
                        if (!userCountry) return true
                        const itemCountry = normalizeCountryCode(item.country)
                        return itemCountry === userCountry
                    })
                    // Filtrar por radio
                    .filter(item => {
                        // 🔓 RECUPERACIÓN: Si todavía no hay ubicación, mostrar todos los items 
                        // en lugar de dejar la pantalla en blanco.
                        if (!userLat || !userLng) return true
                        return item.distance <= searchRadius
                    })
                    .sort((a, b) => (a.distance || 0) - (b.distance || 0))

                setFilteredItems(processed)
            } catch (error) {
                console.error('Filter error', error)
                setFilteredItems([]) // 🚫 No mostramos basura si falla el filtro
            } finally {
                setIsFiltering(false)
            }
        }

        filterItems()
    }, [items, searchRadius, activeLocation, locationLoading, userCountry, t])



    const handleExpandSearch = useCallback(() => {
        setIsFiltering(true)
        setTimeout(() => {
            setTierIndex(prev => (prev + 1) % RADIUS_TIERS.length)
            setVisibleCount(CARS_PER_PAGE)
            setIsFiltering(false)
        }, 300)
    }, [RADIUS_TIERS.length])

    const [isSearchingLocation, setIsSearchingLocation] = useState(false)
    const [locationError, setLocationError] = useState<string | null>(null)

    const searchManualLocation = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!locationInput.trim() || isSearchingLocation) return

        setIsSearchingLocation(true)
        setLocationError(null)
        setShowCandidates(false)
        setLocationCandidates([])

        try {
            // 🔍 Usar búsqueda múltiple para desambiguación
            const results = await searchCities(locationInput)

            if (results && results.length > 0) {
                if (results.length === 1) {
                    // ✅ Caso 1: Solo un resultado -> Selección automática
                    selectLocation(results[0])
                } else {
                    // 📋 Caso 2: Múltiples resultados -> Mostrar lista
                    setLocationCandidates(results)
                    setShowCandidates(true)
                }
            } else {
                setLocationError('No pudimos encontrar esa ubicación. Intenta ser más específico.')
            }
        } catch (error) {
            setLocationError('Error al buscar la ciudad. Intenta nuevamente.')
        } finally {
            setIsSearchingLocation(false)
        }
    }

    // Helper para seleccionar ubicación
    const selectLocation = (loc: LocationData) => {
        setManualLocation(loc) // Usa el método del Contexto Global
        setTierIndex(0)
        setShowLocationModal(false)
        setLocationInput('')
        setShowCandidates(false)
        setLocationCandidates([])
    }

    return (
        <div
            className="min-h-screen bg-background"
        >


            {/* 🔔 New Vehicles Notification */}
            {newVehiclesCount > 0 && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
                    <button
                        onClick={triggerRefresh}
                        className="bg-primary-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 hover:bg-primary-700 transition transform hover:scale-105"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        <span className="font-bold">
                            {newVehiclesCount === 1
                                ? t('market.new_vehicle_single')
                                : t('market.new_vehicles_count').replace('{count}', String(newVehiclesCount))}
                        </span>
                        <RefreshCw className="w-4 h-4 ml-1" />
                    </button>
                </div>
            )}

            <div className="container mx-auto px-4 pt-4 pb-24">
                {/* Header */}
                <header className="mb-3">
                    {/* Controles en una sola línea */}
                    <div className="flex flex-row gap-2 md:gap-4 items-center">
                        {/* Botón para mostrar filtros - Solo si están ocultos */}
                        {!showFilters && (
                            <button
                                onClick={() => setShowFilters(true)}
                                className="w-full md:w-auto px-6 py-3 bg-surface border border-surface-highlight rounded-xl text-text-primary font-medium hover:border-primary-700 transition flex items-center justify-center md:justify-start gap-2 whitespace-nowrap"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <span>{t('market.filters.show_filters')}</span>
                            </button>
                        )}


                    </div>
                </header>

                {/* Área de Filtros (Full Width) */}
                {
                    showFilters && (
                        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                            <MarketFilters
                                brands={brands}
                                vehicleTypes={vehicleTypes}
                                colors={colors}
                                currentFilters={searchParams}
                                onClose={() => setShowFilters(false)}
                            />
                        </div>
                    )
                }
                <div className="flex-1 pointer-events-auto">
                    {((isFiltering || locationLoading) && items.length === 0 && initialItems.length === 0) ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-text-secondary">{t('common.searching')}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-500">
                            {filteredItems.length > 0 ? (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                                    {filteredItems.slice(0, visibleCount).map((item) => {
                                        const isBusiness = item.feedType === 'BUSINESS'
                                        return (
                                            <div key={item.id} className={`bg-surface border rounded-2xl overflow-hidden hover:shadow-xl transition group relative ${isBusiness ? 'border-primary-700/30' : 'border-surface-highlight'}`}>
                                                {/* Imagen y Badge */}
                                                <Link
                                                    href={isBusiness
                                                        ? `/map-store?id=${item.id}`
                                                        : `/comprar/${generateVehicleSlug(item.brand || item.title, item.model || '', item.year || 0, item.city)}-${item.id}${item.isBoosted && activeLocation?.city ? `?contextCity=${encodeURIComponent(activeLocation.city)}` : ''}`
                                                    }
                                                    className="block relative aspect-[4/3] bg-surface group-hover:opacity-95 transition-opacity"
                                                >
                                                    {item.images && item.images[0] ? (
                                                        <img
                                                            src={item.images[0]}
                                                            alt={isBusiness ? `Negocio: ${item.title}` : `Venta de ${item.brand || item.title} ${item.model || ''} ${item.year || ''} en ${item.city} - CarMatch`}
                                                            loading="lazy"
                                                            className="w-full h-full object-contain bg-black/40"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-text-secondary opacity-20">
                                                            {isBusiness ? (
                                                                <MapPin className="w-16 h-16" />
                                                            ) : (
                                                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12l-2.08-5.99z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    )}

                                                    {isBusiness && (
                                                        <div className="absolute top-3 right-10 z-10 px-2 py-0.5 bg-primary-600 text-[10px] text-white font-bold rounded-full">
                                                            {t('market.business_badge')}
                                                        </div>
                                                    )}



                                                </Link>

                                                <div className="p-2 md:p-4">
                                                    <Link
                                                        href={isBusiness
                                                            ? `/map-store?id=${item.id}`
                                                            : `/comprar/${generateVehicleSlug(item.brand || '', item.model || '', item.year || 0, item.city)}-${item.id}${item.isBoosted && activeLocation?.city ? `?contextCity=${encodeURIComponent(activeLocation.city)}` : ''}`
                                                        }
                                                        className="block mb-0.5 group-hover:text-primary-400 transition"
                                                    >
                                                        <h3 className="font-bold text-xs md:text-lg text-text-primary line-clamp-1">
                                                            {item.brand ? `${item.brand} ${item.model}` : item.title}
                                                        </h3>
                                                    </Link>

                                                    {isBusiness ? (
                                                        <p className="text-[10px] font-bold text-primary-400 uppercase mb-1">
                                                            {item.category}
                                                        </p>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-text-secondary">
                                                            <span>{item.year}</span>
                                                            <span>•</span>
                                                            <span>{formatNumber(item.mileage || 0, locale)}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-1 mb-1.5 mt-1">
                                                        {!isBusiness && item.transmission && (
                                                            <Link
                                                                href={isBusiness
                                                                    ? `/map-store?id=${item.id}`
                                                                    : `/vehicle/${item.id}${item.isBoosted && activeLocation?.city ? `?contextCity=${encodeURIComponent(activeLocation.city)}` : ''}`
                                                                }
                                                                className="text-[10px] md:text-xs text-text-secondary bg-surface-highlight px-1.5 py-0.5 rounded hover:bg-surface-highlight/80 transition"
                                                            >
                                                                {item.transmission}
                                                            </Link>
                                                        )}
                                                        <Link
                                                            href={isBusiness
                                                                ? `/map-store?id=${item.id}`
                                                                : `/comprar/${generateVehicleSlug(item.brand || '', item.model || '', item.year || 0, item.city)}-${item.id}${item.isBoosted && activeLocation?.city ? `?contextCity=${encodeURIComponent(activeLocation.city)}` : ''}`
                                                            }
                                                            className="text-[10px] md:text-xs text-text-secondary bg-surface-highlight px-1.5 py-0.5 rounded hover:bg-surface-highlight/80 transition"
                                                        >
                                                            {/* 📍 ADMIN DYNAMIC LOCATION: Override city if it's an admin post */}
                                                            {item.isBoosted && activeLocation?.city ? activeLocation.city : item.city}
                                                        </Link>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-auto">
                                                        <div className="flex flex-col">
                                                            {!isBusiness ? (
                                                                <>
                                                                    <Link
                                                                        href={`/comprar/${generateVehicleSlug(item.brand || '', item.model || '', item.year || 0, item.city)}-${item.id}${item.isBoosted && activeLocation?.city ? `?contextCity=${encodeURIComponent(activeLocation.city)}` : ''}`}
                                                                        className="block group/price"
                                                                    >
                                                                        <p className="font-bold text-sm md:text-xl text-primary-400 group-hover/price:text-primary-300 transition" suppressHydrationWarning>
                                                                            {formatPrice(item.price || 0, item.currency || 'MXN', locale)}
                                                                        </p>
                                                                    </Link>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <Link
                                                                            href={`/comprar/${generateVehicleSlug(item.brand || '', item.model || '', item.year || 0, item.city)}-${item.id}${item.isBoosted && activeLocation?.city ? `?contextCity=${encodeURIComponent(activeLocation.city)}` : ''}`}
                                                                            className="text-[10px] font-bold text-primary-400 uppercase group-hover:text-primary-300"
                                                                        >
                                                                            {t('common.view_more') || 'Ver más'}
                                                                        </Link>
                                                                        <ReportImageButton
                                                                            imageUrl={item.images?.[0] || ''}
                                                                            vehicleId={item.id}
                                                                            className="!p-1 bg-transparent hover:text-red-500 scale-75 origin-left"
                                                                        />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <Link
                                                                        href={`/map-store?id=${item.id}`}
                                                                        className="text-[10px] font-bold text-primary-400 hover:underline"
                                                                    >
                                                                        {t('market.view_on_map')}
                                                                    </Link>
                                                                    <ReportImageButton
                                                                        imageUrl={item.images?.[0] || ''}
                                                                        businessId={item.id}
                                                                        className="!p-1 bg-transparent hover:text-red-500 scale-75 origin-left"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <ShareButton
                                                                    title={item.brand ? `${item.brand} ${item.model}` : item.title}
                                                                    text={t('market.interest_text').replace('{title}', item.brand ? `${item.brand} ${item.model}` : item.title)}
                                                                    url={isBusiness
                                                                        ? `/negocio/${generateBusinessSlug(item.title, item.city)}-${item.id}`
                                                                        : `/comprar/${generateVehicleSlug(item.brand || '', item.model || '', item.year || 0, item.city)}-${item.id}`
                                                                    }
                                                                    variant="minimal"
                                                                />
                                                            </div>
                                                            <FavoriteButton
                                                                vehicleId={!isBusiness ? item.id : undefined}
                                                                businessId={isBusiness ? item.id : undefined}
                                                                initialIsFavorited={item.isFavorited}
                                                                size="md"
                                                                rounded="rounded-full"
                                                                className="shadow-md bg-surface border border-surface-highlight"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>



                                            </div>
                                        )
                                    })}

                                    {/* Action Card (Infinite Scroll Sentinel or Expand) */}
                                    {visibleCount < filteredItems.length ? (
                                        <div
                                            ref={lastItemRef}
                                            className="col-span-2 md:col-span-3 py-10 flex flex-col items-center justify-center space-y-4"
                                        >
                                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                                            <p className="text-text-secondary text-sm font-medium animate-pulse">
                                                {t('market.loading_more') || 'Cargando más vehículos...'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="contents">
                                            {/* Card 1: Expandir Búsqueda */}
                                            <div
                                                className="bg-primary-900/20 border-2 border-primary-700/50 hover:border-primary-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center transition group min-h-[250px] relative cursor-pointer"
                                                onClick={handleExpandSearch}
                                            >
                                                <div className="w-16 h-16 bg-primary-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-primary-900/50">
                                                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
                                                        <line x1="12" y1="8" x2="12" y2="3"/><polyline points="9,6 12,3 15,6"/>
                                                        <line x1="12" y1="16" x2="12" y2="21"/><polyline points="9,18 12,21 15,18"/>
                                                        <line x1="8" y1="12" x2="3" y2="12"/><polyline points="6,9 3,12 6,15"/>
                                                        <line x1="16" y1="12" x2="21" y2="12"/><polyline points="18,9 21,12 18,15"/>
                                                    </svg>
                                                </div>
                                                <span className="font-bold text-lg text-white">
                                                    {tierIndex === RADIUS_TIERS.length - 1 ? t('market.restart_search') : t('market.expand_search')}
                                                </span>
                                                <div className="mt-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                                                    <span className="text-[10px] md:text-xs text-primary-200 font-bold uppercase tracking-wider">
                                                        {t('market.radius_label').replace('{radius}', searchRadius.toString())} | {displayCity}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-primary-200 mt-2">
                                                    {tierIndex === RADIUS_TIERS.length - 1 ? t('market.restart_search_desc') : t('market.expand_search_desc')}
                                                </span>
                                            </div>

                                            {/* Card 2: Promo Vende Tu Auto */}
                                            <div className="bg-gradient-to-br from-primary-900/20 to-indigo-900/20 border-2 border-primary-500/30 hover:border-primary-500/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center transition group min-h-[250px] relative">
                                                <div className="flex flex-col items-center w-full">
                                                    <p className="text-sm text-primary-200 font-bold uppercase tracking-wider mb-2">{t('market.while_searching')}</p>
                                                    <h3 className="text-xl font-black text-white leading-tight mb-6">
                                                        {t('market.generate_money_title')}
                                                    </h3>

                                                    <Link
                                                        href="/publish"
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-900 rounded-xl hover:bg-white/90 transition font-black uppercase tracking-wide shadow-lg text-sm group-hover:scale-105 transform duration-200"
                                                    >
                                                        <Plus size={18} strokeWidth={3} />
                                                        {t('market.convert_to_money')}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                    )}
                                </div>
                            ) : (
                                <div className="mt-12 p-4 sm:p-8 bg-surface border border-surface-highlight rounded-2xl text-center flex flex-col items-center mb-8 shadow-xl animate-in zoom-in duration-300 overflow-hidden">

                                    {/* 📍 Radio Badge movido aquí por petición del usuario */}
                                    <button
                                        onClick={() => setShowLocationModal(true)}
                                        className="mb-8 px-4 py-2 bg-primary-700/10 hover:bg-primary-700/20 active:scale-95 transition-all text-white text-xs rounded-full border border-primary-500/20 shadow-sm flex items-center gap-2 cursor-pointer group"
                                    >
                                        <MapPin className="w-3 h-3 text-primary-400" />
                                        <span className="font-bold text-primary-300 max-w-[200px] truncate block">
                                            {t('market.radius_label').replace('{radius}', searchRadius.toString())} | {displayCity}
                                        </span>
                                        <Search className="w-3 h-3 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>

                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-text-primary">
                                            {searchRadius >= 5000 ? t('market.no_results') : t('market.cant_find_title')}
                                        </h3>
                                        <p className="text-text-secondary">
                                            {searchRadius >= 5000 ? t('market.try_adjusting') : t('market.cant_find_desc')}
                                        </p>
                                    </div>

                                    {/* Action Buttons for Empty List */}
                                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                                        {/* Always show Expand/Restart button here */}
                                        <button
                                            onClick={handleExpandSearch}
                                            className="inline-flex items-center gap-2 px-5 sm:px-8 py-3 sm:py-4 bg-primary-700 text-text-primary rounded-xl hover:bg-primary-600 transition font-bold shadow-lg justify-center text-sm sm:text-base"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
                                                <line x1="12" y1="8" x2="12" y2="3"/><polyline points="9,6 12,3 15,6"/>
                                                <line x1="12" y1="16" x2="12" y2="21"/><polyline points="9,18 12,21 15,18"/>
                                                <line x1="8" y1="12" x2="3" y2="12"/><polyline points="6,9 3,12 6,15"/>
                                                <line x1="16" y1="12" x2="21" y2="12"/><polyline points="18,9 21,12 18,15"/>
                                            </svg>
                                            {tierIndex === RADIUS_TIERS.length - 1 ? t('market.restart_search') : t('market.expand_search')}
                                        </button>

                                        {/* New: Change Location Button */}
                                        <button
                                            onClick={() => setShowLocationModal(true)}
                                            className="inline-flex items-center gap-2 px-5 sm:px-8 py-3 sm:py-4 bg-surface-highlight/50 text-text-primary rounded-xl hover:bg-surface-highlight transition font-medium justify-center text-sm sm:text-base"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {t('market.change_location')}
                                        </button>

                                        {/* Botón de publicar vehículo en estado vacío */}
                                        <Link
                                            href="/publish"
                                            className="inline-flex items-center gap-2 px-5 sm:px-8 py-3 sm:py-4 bg-white text-primary-900 rounded-xl hover:bg-white/90 transition font-bold shadow-lg justify-center text-sm sm:text-base"
                                        >
                                            <Plus size={20} />
                                            {t('market.publish_cta')}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* LOCATION MODAL ... omitted for brevity in thought, but I'll write the full chunk */}
                {
                    showLocationModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
                            <div className="bg-surface border border-surface-highlight rounded-xl w-full max-w-md p-6 relative">
                                <button
                                    onClick={() => setShowLocationModal(false)}
                                    className="absolute top-4 right-4 text-text-secondary hover:text-white"
                                >
                                    ✕
                                </button>

                                <h3 className="text-xl font-bold text-text-primary mb-4">{t('market.change_location')}</h3>
                                <p className="text-text-secondary text-sm mb-6">
                                    {t('market.change_location_desc')}
                                </p>

                                <form onSubmit={searchManualLocation} className="space-y-4">
                                    <input
                                        type="text"
                                        value={locationInput}
                                        onChange={(e) => {
                                            setLocationInput(e.target.value)
                                            if (locationError) setLocationError(null)
                                            if (showCandidates) setShowCandidates(false)
                                        }}
                                        placeholder={t('market.change_location_placeholder')}
                                        className={`w-full px-4 py-3 bg-background border rounded-lg text-text-primary focus:border-primary-500 outline-none transition ${locationError ? 'border-red-500/50' : 'border-surface-highlight'}`}
                                        autoFocus
                                        disabled={isSearchingLocation}
                                    />

                                    {showCandidates && locationCandidates.length > 0 && (
                                        <div className="bg-background border border-surface-highlight rounded-lg overflow-hidden max-h-48 overflow-y-auto animate-in slide-in-from-top-2">
                                            <p className="px-3 py-2 text-xs text-text-secondary bg-surface-highlight/30 font-bold uppercase tracking-wider">
                                                {t('market.which_one')}
                                            </p>
                                            {locationCandidates.map((cand, idx) => (
                                                <button
                                                    key={`${cand.city}-${idx}`}
                                                    type="button"
                                                    onClick={() => selectLocation(cand)}
                                                    className="w-full text-left px-4 py-3 hover:bg-surface-highlight transition border-b border-surface-highlight/50 last:border-0 flex items-center gap-3 group"
                                                >
                                                    <MapPin size={16} className="text-primary-500 group-hover:scale-110 transition-transform" />
                                                    <div>
                                                        <span className="block font-bold text-text-primary text-sm">
                                                            {cand.city}
                                                        </span>
                                                        <span className="block text-xs text-text-secondary">
                                                            {cand.state}, {cand.country}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {locationError && (
                                        <p className="text-xs text-red-500 animate-in fade-in slide-in-from-top-1">
                                            ⚠️ {locationError}
                                        </p>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setManualLocation(null)
                                                setShowLocationModal(false)
                                                setLocationInput('')
                                                setLocationError(null)
                                                setShowCandidates(false)
                                                setLocationCandidates([])
                                            }}
                                            disabled={isSearchingLocation}
                                            className="flex-1 px-4 py-3 bg-surface-highlight text-text-primary rounded-lg font-medium hover:bg-surface-highlight/80 disabled:opacity-50"
                                        >
                                            {t('market.use_gps')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!locationInput.trim() || isSearchingLocation}
                                            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSearchingLocation ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>{t('common.searching')}</span>
                                                </>
                                            ) : (
                                                t('market.search_zone')
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

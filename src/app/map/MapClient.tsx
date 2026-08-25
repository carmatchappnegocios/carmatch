// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

"use client"

import { useState, useMemo, useEffect, useRef, Fragment } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { BUSINESS_CATEGORIES as CATEGORIES } from '@/lib/businessCategories'
import { useLocation } from '@/contexts/LocationContext'
import { Star, Sparkles, MapPin, Settings2, Plus, Check, MessageSquare } from 'lucide-react'
import CategoryIcon from '@/components/CategoryIcon'
import { MapStoreChat } from '@/components/MapStoreChat'
import { useRestoreSessionModal } from "@/hooks/useRestoreSessionModal"
import { toast } from 'sonner'

const MapBoxStoreLocator = dynamic(() => import('@/components/MapBoxStoreLocator'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-white/20 uppercase tracking-widest font-black">{"Loading 3D map..."}</div>
})

const BusinessDetailsModal = dynamic(() => import('@/components/BusinessDetailsModal'), { ssr: false })


interface MapClientProps {
    businesses: any[]
    user: any
}

async function searchCity(query: string) {
    try {
        const res = await fetch(`/api/geolocation?q=${encodeURIComponent(query)}`)
        if (!res.ok) return null
        const data = await res.json()
        if (data.latitude && data.longitude) {
            return {
                latitude: data.latitude,
                longitude: data.longitude,
                city: data.city || query, // Fallback al query si no hay ciudad
                country: data.country || ''
            }
        }
        return null
    } catch (error) {
        console.error('Error in searchCity:', error)
        return null
    }
}

export default function MapClient({ businesses, user }: MapClientProps) {
    const { t } = useLanguage()
    // 🔥 USANDO CONTEXTO GLOBAL
    const { location, loading, initializing, error, refreshLocation, setManualLocation, preciseLocationEnabled } = useLocation()
    const { openModal } = useRestoreSessionModal()
    const searchParams = useSearchParams()
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [showSidebar, setShowSidebar] = useState(false) // Mobile toggle
    const [searchQuery, setSearchQuery] = useState('') // 🔍 NEW: AI search query state
    const [mapKey, setMapKey] = useState(() => Math.random()) // Force map remount
    const [showLocationModal, setShowLocationModal] = useState(false)
    const [cityInput, setCityInput] = useState('')
    const [stateInput, setStateInput] = useState('')
    const [countryInput, setCountryInput] = useState('')

    const [searchSuccess, setSearchSuccess] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null)
    const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null)
    const [dynamicBusinesses, setDynamicBusinesses] = useState<any[]>(businesses)

    // 💾 OFFLINE CACHE LOGIC
    useEffect(() => {
        if (businesses && businesses.length > 0) {
            localStorage.setItem('carmatch_map_cache', JSON.stringify(businesses))
        }
    }, [businesses])

    useEffect(() => {
        if ((!businesses || businesses.length === 0) && !navigator.onLine) {
            const cached = localStorage.getItem('carmatch_map_cache')
            if (cached) {
                try {
                    const parsed = JSON.parse(cached)
                    setDynamicBusinesses(parsed)
                } catch (e) {
                    console.error('Error parsing map cache', e)
                }
            }
        }
    }, [businesses])

    const [isLoadingBounds, setIsLoadingBounds] = useState(false)
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)
    const currentBoundsRef = useRef<any>(null) // 🔥 Guardar bounds actuales
    const lastBoundsKeyRef = useRef<string>('')

    const isGuest = !user

    // Listen for custom event from MapBoxStoreLocator
    useEffect(() => {
        const handleOpenModal = (e: CustomEvent<string>) => {
            const businessId = e.detail
            const business = dynamicBusinesses.find(b => b.id === businessId)
            if (business) {
                setSelectedBusiness(business)
                setActiveBusinessId(businessId)
                // Registrar vista real / apertura de tarjeta
                fetch(`/api/businesses/${businessId}/view`, { method: 'POST' }).catch(() => { })
            }
        }

        window.addEventListener('open-business-modal' as any, handleOpenModal as any)

        return () => {
            window.removeEventListener('open-business-modal' as any, handleOpenModal as any)
        }
    }, [dynamicBusinesses])

    // 🗺️ Dynamic Bounds Fetch (Centralized)
    const refreshVisibleBusinesses = async (bounds: any, force = false) => {
        const boundsKey = JSON.stringify(bounds)
        if (!force && boundsKey === lastBoundsKeyRef.current) return

        lastBoundsKeyRef.current = boundsKey
        currentBoundsRef.current = bounds

        if (debounceTimer.current) clearTimeout(debounceTimer.current)

        debounceTimer.current = setTimeout(async () => {
            setIsLoadingBounds(true)
            try {
                const params = new URLSearchParams({
                    minLat: bounds.minLat.toString(),
                    maxLat: bounds.maxLat.toString(),
                    minLng: bounds.minLng.toString(),
                    maxLng: bounds.maxLng.toString(),
                    category: selectedCategories.length === 1 ? selectedCategories[0] : 'all',
                    search: searchQuery || '',
                    zoom: (bounds.zoom || 12).toString()
                })

                const res = await fetch(`/api/businesses/bounds?${params}`)
                console.log('[BOUNDS] API response:', res.status, res.ok ? 'OK' : 'FAIL')
                if (res.ok) {
                    const data = await res.json()
                    console.log('[BOUNDS] Received businesses:', data.businesses?.length || 0)
                    setDynamicBusinesses(prev => {
                        const existingIds = new Set(prev.map(b => b.id))
                        const newOnes = data.businesses.filter((b: any) => !existingIds.has(b.id))
                        console.log('[BOUNDS] New businesses to add:', newOnes.length, '| Total will be:', Math.min(prev.length + newOnes.length, 1000))
                        return [...prev, ...newOnes].slice(-1000)
                    })
                } else {
                    const errBody = await res.text().catch(() => 'unable to read')
                    console.error('[BOUNDS] Error response:', res.status, errBody)
                }
            } catch (err) {
                console.error("Bounds fetch error:", err)
            } finally {
                setIsLoadingBounds(false)
            }
        }, 300) // Reduced debounce for snappier AI response
    }

    const handleBoundsChange = (bounds: any) => {
        refreshVisibleBusinesses(bounds)
    }

    // 🔥 REFRESH BUSSINESSES ON CATEGORY CHANGE (AI or Manual)
    useEffect(() => {
        if (currentBoundsRef.current) {
            refreshVisibleBusinesses(currentBoundsRef.current, true)
        }
    }, [selectedCategories])

    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // 🔧 Estabilizar referencias para evitar re-ejecución innecesaria del effect del mapa
    const categoryColors = useMemo(
        () => CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.color }), {}),
        []
    )
    const categoryEmojis = useMemo(
        () => CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.icon }), {}),
        []
    )




    // 🔗 URL Params Handler: Check for shared links logic (Category + Lat/Lng + Highlight)
    useEffect(() => {
        // Only run once when loaded
        if (!searchParams) return

        const catParam = searchParams.get('category')
        const latParam = searchParams.get('lat')
        const lngParam = searchParams.get('lng')
        const highlightParam = searchParams.get('id') // Added handling for 'id' directly

        if (catParam) {
            setSelectedCategories([catParam])
        }

        if (highlightParam) {
            const business = dynamicBusinesses.find(b => b.id === highlightParam)
            if (business) {
                setSelectedBusiness(business)
                setActiveBusinessId(highlightParam)
                setManualLocation({
                    latitude: Number(business.latitude),
                    longitude: Number(business.longitude),
                    city: business.city || '',
                    country: ''
                })
                // Trigger view
                fetch(`/api/businesses/${highlightParam}/view`, { method: 'POST' }).catch(() => { })
            } else {
                // 🔍 NEW: Fetch single business if not in current bounds/props
                const fetchBusiness = async () => {
                    try {
                        const res = await fetch(`/api/businesses/${highlightParam}`)
                        if (res.ok) {
                            const data = await res.json()
                            if (data.business) {
                                const b = data.business
                                // Add to dynamic list so it shows on map
                                setDynamicBusinesses(prev => [...prev, b])
                                setSelectedBusiness(b)
                                setActiveBusinessId(highlightParam)
                                setManualLocation({
                                    latitude: Number(b.latitude),
                                    longitude: Number(b.longitude),
                                    city: b.city || '',
                                    country: ''
                                })
                                // Trigger view
                                fetch(`/api/businesses/${highlightParam}/view`, { method: 'POST' }).catch(() => { })
                            }
                        }
                    } catch (err) {
                        console.error("Error fetching highlight business:", err)
                    }
                }
                fetchBusiness()
            }
        } else if (latParam && lngParam) {
            const lat = parseFloat(latParam)
            const lng = parseFloat(lngParam)
            if (!isNaN(lat) && !isNaN(lng)) {
                // Update manual location to focus map there immediately
                setManualLocation({
                    latitude: lat,
                    longitude: lng,
                    city: t('market.shared_location'),
                    country: ''
                })
            }
        }
    }, [searchParams, setManualLocation])

    // 🔍 Búsqueda Inteligente con Análisis Especializado
    const searchManualLocation = async (e?: React.FormEvent) => {
        e?.preventDefault()

        // Concatenar para búsqueda exacta
        const queryParts = [cityInput, stateInput, countryInput].filter(p => p.trim())
        if (queryParts.length === 0) return

        const fullQuery = queryParts.join(', ')

        try {
            const result = await searchCity(fullQuery)
            if (result) {
                setManualLocation(result)
                setShowLocationModal(false)
                // Limpiar campos
                setCityInput('')
                setStateInput('')
                setCountryInput('')
            } else {
                toast.error(t('map_store.location_not_found'))
            }
        } catch (error) {
            console.error('Error buscando ciudad:', error)
            toast.error(t('map_store.location_search_error'))
        }
    }

    // Toggle Category
    const toggleCategory = (catId: string) => {
        setSelectedCategories(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        )
    }

    // Filter Logic
    const filteredBusinesses = useMemo(() => {
        let result = dynamicBusinesses;
        if (selectedCategories.length > 0) {
            result = result.filter(b => selectedCategories.includes(b.category));
        }

        // Sorting: If user has location, sort by distance? Or just boosted first.
        // For now, let's keep it simple.
        return result;
    }, [dynamicBusinesses, selectedCategories])

    // 🔒 El mapa se renderiza inmediatamente, sin esperar la ubicación.
    // La ubicación IP/GPS llega async y el mapa hace flyTo cuando está lista.

    // 🕵️ No bloqueamos si no hay GPS. El contexto LocationContext ya nos dio la ciudad por IP.
    // El mapa se cargará en esa ciudad automáticamente.


    return (
        <div className="w-full flex-1 flex flex-col bg-background overflow-hidden relative">

            <div className="flex-1 relative flex overflow-hidden">

                {/* 🗺️ MAP (FULL SCREEN / FLEX CHILD) */}
                <div className="absolute inset-0 lg:relative lg:flex-1 lg:inset-auto z-0 order-2">
                    <MapBoxStoreLocator
                        businesses={filteredBusinesses}
                        initialLocation={location && (location.latitude !== 0 || location.longitude !== 0) ? { latitude: location.latitude, longitude: location.longitude } : undefined}
                        onBoundsChange={handleBoundsChange}
                        highlightCategories={searchSuccess ? selectedCategories : []}
                        preciseLocationEnabled={preciseLocationEnabled}
                        categoryColors={categoryColors}
                        categoryEmojis={categoryEmojis}
                    />
                </div>

                {/* 📱 BOTONES FLOTANTES (MAPA - MOBILE ONLY) */}
                <div className="absolute top-6 left-6 z-30 flex flex-col gap-3 lg:hidden">
                    {!showSidebar && (
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="w-fit px-5 py-2.5 bg-surface/90 backdrop-blur-md text-white/80 rounded-full shadow-xl font-bold uppercase tracking-wider border border-white/10 flex items-center gap-2 active:scale-95 hover:bg-surface transition-all"
                        >
                            <Settings2 size={18} />
                            <span className="text-xs">{t('map_store.show_filters')}</span>
                        </button>
                    )}
                </div>

                {/* 🗂️ PANEL DE FILTROS (PERSISTENT DESKTOP / OVERLAY MOBILE) */}
                <div className={`
                    absolute inset-0 z-[50] lg:z-10 lg:static lg:w-[340px] lg:shrink-0 flex items-start justify-start transition-none pointer-events-none lg:pointer-events-auto lg:order-1
                `}>
                    {/* Backdrop (Mobile Only) */}
                    <div
                        className={`lg:hidden absolute inset-0 bg-background/40 backdrop-blur-sm transition-opacity duration-300 ${showSidebar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => setShowSidebar(false)}
                    />

                    {/* Filter Panel (Sidebar Content) */}
                    <div className={`
                        relative h-full w-[85%] max-w-[340px] lg:w-full bg-surface/95 backdrop-blur-2xl border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.4)] lg:shadow-none flex flex-col transition-transform duration-300 ease-out transform pointer-events-auto
                        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 flex flex-col h-full bg-transparent">
                            {/* 1. HEADER CON BOTÓN DE PUBLICAR */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 gap-4">
                                <Link
                                    href="/my-businesses?action=new"
                                    onClick={(e) => {
                                        // 🔥 GUEST SESSION FIX: Verificamos si hay soft logout antes de navegar a ruta protegida
                                        const isSoftLogout = document.cookie.includes('soft_logout=true') || localStorage.getItem('soft_logout') === 'true'
                                        if (user && isSoftLogout) {
                                            e.preventDefault()
                                            openModal(
                                                t('common2.session_expired'),
                                                () => { /* Restauración en modal */ }
                                            )
                                        }
                                    }}
                                    className="flex-1 py-2.5 bg-accent-600 text-white rounded-lg shadow-lg font-black uppercase tracking-wider border border-accent-500/50 flex items-center justify-center gap-2 active:scale-95 hover:bg-accent-500 transition-all text-xs"
                                >
                                    <Plus size={16} />
                                    <span>{t('map_store.publish_business')}</span>
                                </Link>
                                <button
                                    onClick={() => setShowSidebar(false)}
                                    className="p-1 text-white/40 hover:text-white transition-colors flex-shrink-0 lg:hidden"
                                >
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>

                            <div className="px-6 py-3 space-y-4 flex-1">
                                {/* 2. PREGUNTAR AL EXPERTO (NUEVA IA CONVERSACIONAL) */}
                                <div className="space-y-4">
                                    <MapStoreChat
                                        userCity={location?.city}
                                        onFilterChange={(filters) => {
                                            if (filters.categories && filters.categories.length > 0) {
                                                const normalized = filters.categories.map((c: string) => c.toLowerCase())
                                                setSelectedCategories(normalized)
                                                setSearchQuery(filters.query || '') // 🔍 SYNC: Guardar búsqueda IA
                                                setSearchSuccess(true)
                                                setHasSearched(true)
 
                                                // Auto-cerrar sidebar en mobile tras éxito
                                                setTimeout(() => setShowSidebar(false), 2000)
                                            }
                                        }}
                                        onResultsFound={(results) => {
                                            // Deep Search results handling
                                            if (results && results.length > 0) {
                                                // Podríamos resaltar estos negocios específicamente en el mapa
                                            }
                                        }}
                                        placeholder={t('map_store.smart_search_placeholder')}
                                    />
                                </div>

                                <div className="h-[1px] bg-white/5 w-full my-3"></div>

                                {/* 3. LISTA DE CATEGORÍAS SENCILLA */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-3">
                                        {t('map_store.categories_label')}
                                    </h3>

                                    <div className="space-y-1">
                                        {CATEGORIES.map((cat, index) => {
                                            const isSelected = selectedCategories.includes(cat.id);
                                            const showDivider = cat.isPublic && (index === 0 || !CATEGORIES[index - 1].isPublic);

                                            return (
                                                <Fragment key={cat.id}>
                                                    {showDivider && (
                                                        <div className="py-3 flex flex-col gap-3">
                                                            <div className="h-[1px] bg-white/5 w-full"></div>
                                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                                                                {t('map_store.categories_label')}
                                                            </h3>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => toggleCategory(cat.id)}
                                                        className={`
                                                            w-full flex items-center gap-3 py-1.5 px-3 rounded-xl transition-all group
                                                            ${isSelected ? 'bg-white/10 ring-1 ring-white/10' : 'hover:bg-white/5'}
                                                        `}
                                                    >
                                                        <div
                                                            className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm shrink-0"
                                                            style={{
                                                                backgroundColor: `${cat.color}20`,
                                                                borderColor: isSelected ? cat.color : `${cat.color}40`,
                                                                boxShadow: isSelected ? `0 0 15px ${cat.color}30` : 'none'
                                                            }}
                                                        >
                                                            <CategoryIcon
                                                                iconName={cat.icon}
                                                                size={16}
                                                                color={cat.color}
                                                                className={isSelected ? 'animate-pulse' : 'opacity-90'}
                                                            />
                                                        </div>
                                                        <span className={`text-[13px] font-bold transition-colors truncate flex-1 text-left ${isSelected ? 'text-white' : 'text-white/50'}`}>
                                                            {t(`map_store.categories.${cat.id}`) || cat.label}
                                                        </span>

                                                        {/* Checkbox Indicator */}
                                                        <div className={`
                                                            w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0
                                                            ${isSelected ? 'bg-primary-600 border-primary-600 shadow-lg shadow-primary-900/40' : 'border-white/10 bg-white/5'}
                                                        `}>
                                                            {isSelected && <Check size={12} strokeWidth={4} className="text-white" />}
                                                        </div>
                                                    </button>
                                                </Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer de Aplicar */}
                        <div className="p-4 bg-surface-highlight/20 border-t border-surface-highlight">
                            <button
                                onClick={() => setShowSidebar(false)}
                                className="w-full py-4 bg-primary-700 text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-primary-600 active:scale-95 transition-all"
                            >
                                {t('map_store.view_list')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* 🌍 MODAL DE UBICACIÓN MANUAL */}
            {showLocationModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4">
                    <div className="bg-surface border border-surface-highlight rounded-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowLocationModal(false)}
                            className="absolute top-4 right-4 text-text-secondary hover:text-white"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-bold text-text-primary mb-4">{t('map_store.modal_title')}</h3>
                        <p className="text-text-secondary text-sm mb-6">
                            {t('map_store.modal_desc')}
                        </p>

                        <form onSubmit={searchManualLocation} className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1 uppercase tracking-wider">{t('map_store.country_label')}</label>
                                    <input
                                        type="text"
                                        value={countryInput}
                                        onChange={(e) => setCountryInput(e.target.value)}
                                        placeholder={t('map_store.country_placeholder')}
                                        className="w-full px-4 py-2.5 bg-background border border-surface-highlight rounded-lg text-text-primary focus:border-primary-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1 uppercase tracking-wider">{t('map_store.state_label')}</label>
                                    <input
                                        type="text"
                                        value={stateInput}
                                        onChange={(e) => setStateInput(e.target.value)}
                                        placeholder={t('map_store.state_placeholder')}
                                        className="w-full px-4 py-2.5 bg-background border border-surface-highlight rounded-lg text-text-primary focus:border-primary-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1 uppercase tracking-wider">{t('map_store.city_label')}</label>
                                    <input
                                        type="text"
                                        value={cityInput}
                                        onChange={(e) => setCityInput(e.target.value)}
                                        placeholder={t('map_store.city_placeholder')}
                                        className="w-full px-4 py-2.5 bg-background border border-surface-highlight rounded-lg text-text-primary focus:border-primary-500 outline-none text-sm"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowLocationModal(false)
                                        setCityInput('')
                                        setStateInput('')
                                        setCountryInput('')
                                    }}
                                    className="flex-1 px-4 py-3 bg-surface-highlight text-text-primary rounded-lg font-medium hover:bg-surface-highlight/80"
                                >
                                    {t('map_store.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700"
                                >
                                    {t('map_store.search')}
                                </button>
                            </div>
                        </form>

                        <div className="mt-4 p-3 bg-surface-highlight/30 rounded-lg">
                            <p className="text-xs text-text-secondary">
                                {t('map_store.global_search_tip')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 🏬 MODAL DE DETALLES DEL NEGOCIO (NEW) */}
            {selectedBusiness && (
                <BusinessDetailsModal
                    business={selectedBusiness}
                    onClose={() => setSelectedBusiness(null)}
                    categoryColor={CATEGORIES.find(c => c.id === selectedBusiness.category)?.color}
                    categoryEmoji={CATEGORIES.find(c => c.id === selectedBusiness.category)?.icon}
                />
            )}
        </div>
    )
}

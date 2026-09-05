
"use client"

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import nextDynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'

import { useLanguage } from '@/contexts/LanguageContext'
import { BUSINESS_CATEGORIES } from '@/lib/businessCategories'
import { toast } from "sonner"

// Dynamic import for Mapbox component
const MapBoxAddressPicker = nextDynamic(() => import('@/components/MapBoxAddressPicker'), {
    ssr: false,
    loading: () => <div className="w-full h-[350px] bg-surface-highlight animate-pulse rounded-xl" />
})

export default function BusinessRegisterPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(false)

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        category: 'mecanico',
        phone: '',
        whatsapp: '',
        description: ''
    })

    // Location Data
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)
    const [viewCenter, setViewCenter] = useState<{ lat: number, lng: number } | null>(null)

    // Auto-locate user on mount for better map orientation
    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Solo actualizamos el CENTRO de la vista, no el marcador (pin)
                    // Así el usuario se ubica pero no se marca nada automáticamente
                    setViewCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                (error) => {
                    console.log('Error getting location:', error)
                }
            )
        }
    }, [])


    // Structured Address Data
    const [addressFields, setAddressFields] = useState({
        street: '',
        number: '',
        colony: '',
        city: '',
        state: ''
    })

    // Search State
    const [searchQuery, setSearchQuery] = useState('')
    const [searching, setSearching] = useState(false)


    // Handler for pin movement (Reverse Geocoding)
    const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
        setLatitude(lat)
        setLongitude(lng)

        // Auto-fetch address details when pin is dropped/moved
        try {
            const res = await fetch(`/api/geolocation?lat=${lat}&lng=${lng}`)
            if (res.ok) {
                const data = await res.json()
                setAddressFields(prev => ({
                    ...prev,
                    street: data.street || '',
                    number: data.streetNumber || '',
                    colony: data.colony || '',
                    city: data.city || '',
                    state: data.state || ''
                }))
            }
        } catch (error) {
            console.error('Error fetching address:', error)
        }
    }, [])

    // Handler for address search (Forward Geocoding)
    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        setSearching(true)

        try {
            // Buscar con la API
            const res = await fetch(`/api/geolocation?q=${encodeURIComponent(searchQuery)}`)
            if (res.ok) {
                const data = await res.json()
                if (data.latitude && data.longitude) {
                    // Update location and view
                    setLatitude(data.latitude)
                    setLongitude(data.longitude)
                    setViewCenter({ lat: data.latitude, lng: data.longitude })

                    // Update fields
                    setAddressFields({
                        street: data.street || '',
                        number: data.streetNumber || '',
                        colony: data.colony || '',
                        city: data.city || '',
                        state: data.state || ''
                    })
                } else {
                    toast.error('No encontramos esa ubicación. Intenta ser más específico.')
                }
            }
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setSearching(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!latitude || !longitude) {
            toast.error('Por favor selecciona la ubicación exacta en el mapa')
            return
        }

        // Validate Mexican phone format (10 digits, starts with 10-19)
        const phoneDigits = formData.phone.replace(/\D/g, '')
        if (phoneDigits.length !== 10 || !/^[1-9]/.test(phoneDigits)) {
            toast.error('El teléfono debe tener 10 dígitos (ej: 6561234567)')
            return
        }

        setLoading(true)

        try {
            // Construct full address string for backend
            const fullAddress = `${addressFields.street} ${addressFields.number}, ${addressFields.colony}, ${addressFields.city}, ${addressFields.state}`.replace(/, ,/g, ',').trim()

            const payload = {
                ...formData,
                address: fullAddress,
                street: addressFields.street,
                streetNumber: addressFields.number,
                colony: addressFields.colony,
                city: addressFields.city,
                state: addressFields.state,
                latitude,
                longitude
            }

            // 1. Registrar Negocio
            const res = await fetch('/api/businesses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            // Redirigir a perfil con éxito
            toast.success('¡Negocio registrado! Tu periodo de prueba de 3 meses ha comenzado.')
            router.push('/profile?business_registered=true')

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error al registrar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-background flex flex-col items-center py-12 px-4">

            {status === 'loading' && (
                <div className="max-w-3xl w-full flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {status === 'unauthenticated' && (
                <div className="max-w-3xl w-full text-center py-20 space-y-6">
                    <h2 className="text-2xl font-bold text-text-primary">{t('business_register.login_required')}</h2>
                    <p className="text-text-secondary">Necesitas una cuenta para gestionar tu negocio en CarMatch.</p>
                    <button
                        onClick={() => router.push('/auth')}
                        className="px-8 py-3 bg-primary-700 text-white rounded-xl font-bold hover:bg-primary-600 transition"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            )}

            {status === 'authenticated' && (
            <div className="max-w-3xl w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-text-primary mb-2">{t('business_register.register_title')}</h1>
                    <p className="text-xl text-primary-400 font-medium">¡3 Meses GRATIS de Publicidad!</p>
                    <p className="text-text-secondary mt-2">Únete a la red de servicios automotrices más grande de la ciudad.</p>
                </div>

                {/* Card */}
                <div className="bg-surface border border-surface-highlight rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* SECCIÓN DATOS BÁSICOS */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-text-primary border-b border-surface-highlight pb-2">
                                🏢 Datos del Negocio
                            </h3>

                            {/* Nombre */}
                            <div>
                                <label className="block text-text-primary font-bold mb-2">{t('business_register.business_name')}</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={t('business_register.business_name_placeholder')}
                                    className="w-full px-4 py-3 bg-background border border-surface-highlight rounded-xl text-text-primary focus:border-primary-700 outline-none transition"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-text-primary font-bold mb-2">{t('business_register.category')}</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1 custom-scrollbar">
                                    {[...BUSINESS_CATEGORIES]
                                        .sort((a, b) => (t(`map_store.categories.${a.id}`) || a.label).localeCompare(t(`map_store.categories.${b.id}`) || b.label))
                                        .map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={`p-3 rounded-lg border text-left flex flex-col items-center gap-2 transition-all hover:shadow-md ${formData.category === cat.id
                                                    ? 'border-primary-700 bg-primary-700/20 text-text-primary shadow-inner'
                                                    : 'border-surface-highlight bg-background text-text-secondary hover:border-primary-700/50'
                                                    }`}
                                            >
                                                <span className="text-2xl">{cat.icon}</span>
                                                <span className="text-[10px] font-medium text-center leading-tight">
                                                    {t(`map_store.categories.${cat.id}`) || cat.label}
                                                </span>
                                            </button>
                                        ))}
                                </div>
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-text-primary font-bold mb-2">{t('business_register.description_short')}</label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="¿Qué servicios ofrecen? Ej. Especialistas en frenos y suspensión."
                                    className="w-full px-4 py-3 bg-background border border-surface-highlight rounded-xl text-text-primary focus:border-primary-700 outline-none transition"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* SECCIÓN UBICACIÓN */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-text-primary border-b border-surface-highlight pb-2 flex items-center justify-between">
                                <span>📍 Ubicación Exacta</span>
                                <span className="text-xs font-normal text-text-secondary bg-surface-highlight px-2 py-1 rounded">{t('business_register.crucial_for_map')}</span>
                            </h3>

                            {/* Buscador de Dirección */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={t('business_register.search_address')}
                                    className="flex-1 px-4 py-3 bg-background border border-surface-highlight rounded-xl text-text-primary focus:border-primary-700 outline-none transition"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                                />
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    disabled={searching}
                                    className="px-6 bg-primary-700 text-white rounded-xl font-bold hover:bg-primary-600 transition disabled:opacity-50"
                                >
                                    {searching ? '...' : '🔍 Buscar'}
                                </button>
                            </div>

                            {/* Mapa */}
                            <div className="relative">
                                <MapBoxAddressPicker
                                    latitude={latitude}
                                    longitude={longitude}
                                    viewCenter={viewCenter}
                                    onLocationSelect={handleLocationSelect}
                                />
                            </div>

                            {/* Campos Estructurados */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-highlight/10 p-4 rounded-xl border border-surface-highlight/30">
                                <div className="md:col-span-2">
                                    <p className="text-sm text-primary-400 mb-2 font-medium">💡 Verifica y corrige los datos si es necesario:</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-secondary">{t('business_register.street')}</label>
                                    <input
                                        value={addressFields.street}
                                        onChange={e => setAddressFields({ ...addressFields, street: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-surface-highlight rounded-lg text-sm text-text-primary"
                                        placeholder="Calle"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-secondary">Número Ext/Int</label>
                                    <input
                                        value={addressFields.number}
                                        onChange={e => setAddressFields({ ...addressFields, number: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-surface-highlight rounded-lg text-sm text-text-primary"
                                        placeholder="#"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-secondary">{t('business_register.neighborhood')}</label>
                                    <input
                                        value={addressFields.colony}
                                        onChange={e => setAddressFields({ ...addressFields, colony: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-surface-highlight rounded-lg text-sm text-text-primary"
                                        placeholder="Colonia"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-secondary">{t('business_register.city')}</label>
                                    <input
                                        value={addressFields.city}
                                        onChange={e => setAddressFields({ ...addressFields, city: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-surface-highlight rounded-lg text-sm text-text-primary"
                                        placeholder="Ciudad"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN CONTACTO */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-text-primary border-b border-surface-highlight pb-2">
                                📞 Contacto
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-text-primary font-bold mb-2">Teléfono (Llamadas)</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="656..."
                                        className="w-full px-4 py-3 bg-background border border-surface-highlight rounded-xl text-text-primary focus:border-primary-700 outline-none transition"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-text-primary font-bold mb-2">WhatsApp (Opcional)</label>
                                    <input
                                        type="tel"
                                        placeholder="656..."
                                        className="w-full px-4 py-3 bg-background border border-surface-highlight rounded-xl text-text-primary focus:border-primary-700 outline-none transition"
                                        value={formData.whatsapp}
                                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-green-600 to-primary-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-primary-700/30 transition-all transform hover:scale-[1.02] disabled:opacity-50"
                            >
                                {loading ? 'Registrando...' : '🚀 Activar mis 3 Meses Gratis'}
                            </button>
                            <p className="text-center text-xs text-text-secondary mt-3">
                                Después de la prueba, la suscripción costará solo $20.00 MXN al mes. Puedes cancelar cuando quieras.
                            </p>
                        </div>

                    </form>
                </div>
            </div>
            )}

        </div>
    )
}

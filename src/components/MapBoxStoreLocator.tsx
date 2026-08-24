// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

"use client"

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { escapeHtml } from '@/lib/sanitize'

interface Business {
    id: string
    name: string
    category: string
    latitude: number
    longitude: number
    images: string[]
    city: string
    description?: string
    services?: string[]
    phone?: string
    whatsapp?: string
    address?: string
    street?: string
    streetNumber?: string
    colony?: string
    state?: string
    hours?: string
    is24Hours?: boolean
    hasEmergencyService?: boolean
    hasHomeService?: boolean
}

interface MapBoxStoreLocatorProps {
    businesses: Business[]
    categoryColors: Record<string, string>
    categoryEmojis: Record<string, string>
    initialLocation?: { latitude: number; longitude: number }
    highlightCategories?: string[]
    onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void
    preciseLocationEnabled?: boolean
}

export default function MapBoxStoreLocator({
    businesses,
    categoryColors,
    categoryEmojis,
    initialLocation,
    onBoundsChange,
    highlightCategories = [],
    preciseLocationEnabled = false
}: MapBoxStoreLocatorProps) {
    const { t } = useLanguage()
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [mapError, setMapError] = useState<string | null>(null)

    useEffect(() => {
        if (!mapContainer.current || map.current) return
        if (!initialLocation) return

        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        if (!token) {
            console.error('Mapbox token missing')
            setMapLoaded(true)
            return
        }
        mapboxgl.accessToken = token

        const center: [number, number] = [initialLocation.longitude, initialLocation.latitude]

        let newMap: mapboxgl.Map
        try {
        newMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/outdoors-v12',
            center: center,
            zoom: 12,
            minZoom: 8,
            maxZoom: 18,
            minTileCacheSize: 500,
            maxTileCacheSize: 1000,
            refreshExpiredTiles: false,
            trackResize: true,
        })
        } catch (e) {
            console.error('[MAP] Failed to initialize Mapbox map:', e)
            setMapError('No se pudo inicializar el mapa. Verifica tu conexión o el token de Mapbox.')
            setMapLoaded(true)
            return
        }

        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right')

        const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: preciseLocationEnabled,
            showUserLocation: preciseLocationEnabled,
            showAccuracyCircle: false
        })

        newMap.addControl(geolocateControl, 'top-right')

        newMap.on('load', () => {
            setMapLoaded(true)
            try { newMap.resize() } catch (e) { /* ignore resize errors */ }

            if (newMap.getLayer('poi-label')) {
                newMap.setLayoutProperty('poi-label', 'visibility', 'none')
            }

            const reportBounds = () => {
                if (!onBoundsChange) return
                const bounds = newMap.getBounds()
                if (!bounds) return

                onBoundsChange({
                    minLat: bounds.getSouth(),
                    maxLat: bounds.getNorth(),
                    minLng: bounds.getWest(),
                    maxLng: bounds.getEast()
                })
            }

            newMap.on('moveend', reportBounds)
            newMap.on('dragstart', () => { userMovedRef.current = true })
            setTimeout(reportBounds, 1000)
        })

        // 🎯 Focus Business Listener
        const handleFocus = (e: any) => {
            const { lat, lng } = e.detail;
            newMap.flyTo({
                center: [lng, lat],
                zoom: 15,
                essential: true
            });
        };

        // 🤖 AI SEARCH LISTENER: Control remoto desde el Chatbot
        const handleAiSearch = (e: any) => {
            const { lat, lng, zoom } = e.detail;
            if (lat && lng) {
                newMap.flyTo({
                    center: [lng, lat],
                    zoom: zoom || 14,
                    essential: true
                });
            }
        };

        window.addEventListener('map-focus-business', handleFocus);
        window.addEventListener('map-ai-search', handleAiSearch);

        map.current = newMap

        return () => {
            window.removeEventListener('map-focus-business', handleFocus);
            window.removeEventListener('map-ai-search', handleAiSearch);
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [initialLocation])

    const lastFlyToRef = useRef<{ lat: number; lng: number } | null>(null)
    const userMovedRef = useRef(false)
    const didSafetyFitRef = useRef(false)

    // flyTo ya no es necesario — el mapa se crea directo en initialLocation

    useEffect(() => {
        if (!map.current || !mapLoaded) return

        const mapInstance = map.current
        const features = (businesses || [])
            .filter(b => b.latitude && b.longitude)
            .map(b => ({
                type: 'Feature',
                properties: {
                    id: b.id,
                    name: b.name,
                    category: b.category,
                    city: b.city,
                    image: b.images?.[0] || '',
                    description: b.description || '',
                    services: b.services || [],
                    phone: b.phone || '',
                    whatsapp: b.whatsapp || '',
                    address: b.address || '',
                    street: b.street || '',
                    streetNumber: b.streetNumber || '',
                    colony: b.colony || '',
                    state: b.state || '',
                    hours: b.hours || '',
                    is24Hours: b.is24Hours || false,
                    hasEmergencyService: b.hasEmergencyService || false,
                    hasHomeService: b.hasHomeService || false
                },
                geometry: {
                    type: 'Point',
                    coordinates: [b.longitude, b.latitude]
                }
            }))

        const geojson: any = {
            type: 'FeatureCollection',
            features: features
        }

        if (!mapInstance.hasImage('pin')) {
            const pinImg = new window.Image(384, 512)
            pinImg.onload = () => {
                try {
                    if (!mapInstance.hasImage('pin')) {
                        mapInstance.addImage('pin', pinImg, { sdf: true })
                        // 🔥 FORZAR REDIBUJADO: la capa se montó antes de tener el ícono
                        mapInstance.triggerRepaint()
                    }
                } catch (e) {
                    console.error('[MAP] Failed to add pin image:', e)
                }
            }
            pinImg.onerror = (e) => {
                console.error('[MAP] Failed to load pin SVG:', e)
            }
            pinImg.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'%3E%3Cpath fill='%23fff' d='M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z'/%3E%3C/svg%3E"
        }

        const sourceId = 'businesses';
        try {
        if (mapInstance.getSource(sourceId)) {
            (mapInstance.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson)
        } else {
            mapInstance.addSource(sourceId, {
                type: 'geojson',
                data: geojson,
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 70,
                clusterMinPoints: 70,
            })

            mapInstance.addLayer({
                id: 'clusters',
                type: 'circle',
                source: sourceId,
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': '#1a1a2e',
                    'circle-radius': 20,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                }
            })

            mapInstance.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: sourceId,
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 14
                },
                paint: {
                    'text-color': '#ffffff'
                }
            })

            mapInstance.addLayer({
                id: 'unclustered-point-bg',
                type: 'symbol',
                source: sourceId,
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'icon-image': 'pin',
                    'icon-size': 0.08,
                    'icon-allow-overlap': true,
                    'icon-anchor': 'bottom',
                },
                paint: {
                    'icon-color': [
                        'match',
                        ['get', 'category'],
                        ...Object.entries(categoryColors).flat(),
                        '#ef4444'
                    ]
                }
            })

            mapInstance.on('click', 'clusters', (e) => {
                const features = mapInstance.queryRenderedFeatures(e.point, {
                    layers: ['clusters']
                })
                if (!features.length) return
                const clusterId = features[0].properties?.cluster_id
                const source = mapInstance.getSource('businesses') as mapboxgl.GeoJSONSource

                source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                    if (err || zoom == null) return
                    mapInstance.easeTo({
                        center: (features[0].geometry as any).coordinates,
                        zoom: zoom
                    })
                })
            })

            const handlePointClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
                if (!e.features || !e.features[0]) return

                const feature = e.features[0]
                const coordinates = (feature.geometry as any).coordinates.slice()
                const props = feature.properties as any

                // 📊 REGISTRAR EVENTO: Pin clickeado en mapa
                try {
                    fetch('/api/analytics/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            eventType: 'MAP_PIN_CLICKED',
                            entityType: 'BUSINESS',
                            entityId: props.id,
                            metadata: {
                                name: props.name,
                                category: props.category,
                                city: props.city,
                                timestamp: new Date().toISOString()
                            }
                        })
                    })
                } catch {
                    // Fail silently
                }

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                const popupHTML = `
                    <div class="p-3 w-[min(280px,85vw)] max-w-[320px]">
                        ${props.image ?
                        `<div class="w-full h-36 relative mb-3 rounded-xl overflow-hidden bg-gray-900">
                                <div class="absolute inset-0 bg-cover bg-center blur-sm opacity-50" style="background-image: url('${escapeHtml(props.image)}')"></div>
                                <img src="${escapeHtml(props.image)}" alt="${escapeHtml(props.name)}" style="object-fit: contain; width: 100%; height: 100%; position: relative; z-index: 10;" />
                            </div>` : ''
                    }
                        <h3 class="font-extrabold text-gray-900 text-xl leading-tight mb-1.5">${escapeHtml(props.name)}</h3>
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-gray-800 tracking-wide">
                                ${escapeHtml(props.category?.toUpperCase())}
                            </span>
                            ${props.is24Hours ? '<span class="px-2 py-0.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200">24h</span>' : ''}
                            ${props.hasEmergencyService ? '<span class="px-2 py-0.5 rounded-full text-xs font-bold text-red-600 bg-red-50 border border-red-200">Urgencias</span>' : ''}
                            ${props.hasHomeService ? '<span class="px-2 py-0.5 rounded-full text-xs font-bold text-green-600 bg-green-50 border border-green-200">A domicilio</span>' : ''}
                        </div>
                        <p class="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                            <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            ${escapeHtml([props.street ? props.street + (props.streetNumber ? ' ' + props.streetNumber : '') : '', props.colony, props.city, props.state].filter(Boolean).join(', ') || props.city)}
                        </p>
                        ${props.hours ? `<p class="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                            <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ${escapeHtml(props.hours)}
                        </p>` : ''}
                        ${props.description ? `<p class="text-xs text-gray-600 mb-2.5 line-clamp-2 leading-relaxed">${escapeHtml(props.description)}</p>` : '<div class="mb-1"></div>'}
                        ${(() => {
                            let svc: string[] = [];
                            try {
                                if (Array.isArray(props.services)) svc = props.services;
                                else if (typeof props.services === 'string' && props.services) svc = JSON.parse(props.services);
                            } catch(e) {}
                            if (svc.length === 0) return '';
                            const shown = svc.slice(0, 4);
                            const remaining = svc.length - 4;
                            return `<div class="flex flex-wrap gap-1 mb-3">${shown.map((s: string) => `<span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full border border-gray-200">${escapeHtml(s)}</span>`).join('')}${remaining > 0 ? `<span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full border border-gray-200">+${remaining}</span>` : ''}</div>`;
                        })()}
                        <div class="flex gap-2">
                            ${props.whatsapp ? `<a href="https://wa.me/${escapeHtml(props.whatsapp.replace(/\D/g, ''))}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold rounded-lg text-center transition flex items-center justify-center gap-1.5 shadow-sm">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                                WhatsApp
                            </a>` : ''}
                            ${props.phone ? `<a href="tel:${escapeHtml(props.phone)}" class="flex-1 py-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-lg text-center transition flex items-center justify-center gap-1.5 shadow-sm">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                Llamar
                            </a>` : ''}
                            <button 
                                data-business-id="${escapeHtml(props.id)}"
                                class="open-business-btn ${props.whatsapp || props.phone ? 'flex-1' : 'w-full'} py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg text-center transition shadow-sm"
                            >
                                Ver más
                            </button>
                        </div>
                    </div>
                `

                new mapboxgl.Popup({ offset: 15 })
                    .setLngLat(coordinates)
                    .setHTML(popupHTML)
                    .addTo(mapInstance);
            }

            mapInstance.on('click', 'unclustered-point-bg', handlePointClick);

            // Event delegation for "Ver más" button in popups
            mapInstance.getContainer().addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const btn = target.closest('.open-business-btn');
                if (btn) {
                    const id = btn.getAttribute('data-business-id');
                    if (id) {
                        window.dispatchEvent(new CustomEvent('open-business-modal', { detail: id }));
                    }
                }
            });
        }
        } catch (e) {
            console.error('[MAP] Error adding source/layers:', e)
        }

        // 🔧 FIT BOUNDS: Centrar en todos los negocios una sola vez para garantizar
        // que siempre sean visibles al cargar el mapa.
        if (features.length > 0 && !didSafetyFitRef.current) {
            try {
                const bounds = new mapboxgl.LngLatBounds()
                features.forEach((f: any) => bounds.extend(f.geometry.coordinates as [number, number]))
                if (!bounds.isEmpty()) {
                    mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 0 })
                    didSafetyFitRef.current = true
                }
            } catch (e) {
                console.error('[MAP] fitBounds failed:', e)
            }
        }
    }, [businesses, mapLoaded, categoryColors, t])

    if (!initialLocation) {
        return (
            <div className="w-full h-full relative bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-white/60">Detectando tu ubicación...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full relative bg-gray-900">
            {mapError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-sm px-6">
                    <div className="text-center max-w-sm">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <p className="text-sm text-white/80">{mapError}</p>
                    </div>
                </div>
            ) : (
                <div ref={mapContainer} className="w-full h-full" />
            )}
            {!mapLoaded && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-white">{t('map_locator.loading_3d')}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

"use client"

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface IntelligenceData {
    searches: Array<{ latitude: number; longitude: number; category?: string; query?: string }>
    vehicles: Array<{ latitude: number; longitude: number; title: string }>
    businesses: Array<{ latitude: number; longitude: number; name: string; category: string }>
}

export default function AdminHeatMap({ data }: { data: IntelligenceData }) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const [mapLoaded, setMapLoaded] = useState(false)

    useEffect(() => {
        if (!mapContainer.current || map.current) return

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [-100.3161, 25.6866], // MTY
            zoom: 10,
            pitch: 45,
            bearing: -20,
            antialias: true
        })

        map.current.on('load', () => {
            setMapLoaded(true)
            if (map.current) {
                map.current.resize()
                map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right')
            }
        })

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (!map.current || !mapLoaded || !data) return
        const m = map.current

        // 1. Demand Source (Searches) - Red/Warm Heatmap
        const demandGeojson = {
            type: 'FeatureCollection',
            features: (data.searches || []).map(s => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [s.longitude, s.latitude] },
                properties: { weight: 1 }
            }))
        }

        if (m.getSource('demand')) {
            (m.getSource('demand') as mapboxgl.GeoJSONSource).setData(demandGeojson as any)
        } else {
            m.addSource('demand', { type: 'geojson', data: demandGeojson as any })
            m.addLayer({
                id: 'demand-heat',
                type: 'heatmap',
                source: 'demand',
                paint: {
                    'heatmap-weight': ['get', 'weight'],
                    'heatmap-intensity': 2,
                    'heatmap-color': [
                        'interpolate', ['linear'], ['heatmap-density'],
                        0, 'rgba(0,0,0,0)',
                        0.2, 'rgba(239, 68, 68, 0.2)', 
                        0.4, 'rgba(239, 68, 68, 0.4)',
                        0.6, 'rgba(239, 68, 68, 0.6)',
                        0.8, 'rgba(239, 68, 68, 0.8)',
                        1, 'rgba(239, 68, 68, 1)'
                    ],
                    'heatmap-radius': 45,
                    'heatmap-opacity': 0.8
                }
            })
        }

        // 2. Supply Source (Businesses - Competition) - White/Clean points
        const supplyGeojson = {
            type: 'FeatureCollection',
            features: (data.businesses || []).map(b => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [b.longitude, b.latitude] },
                properties: { name: b.name, category: b.category }
            }))
        }

        if (m.getSource('supply')) {
            (m.getSource('supply') as mapboxgl.GeoJSONSource).setData(supplyGeojson as any)
        } else {
            m.addSource('supply', { type: 'geojson', data: supplyGeojson as any })
            m.addLayer({
                id: 'supply-points',
                type: 'circle',
                source: 'supply',
                paint: {
                    'circle-radius': 7,
                    'circle-color': '#ffffff',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#3b82f6', 
                    'circle-opacity': 0.9
                }
            })
            
            m.on('click', 'supply-points', (e: any) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const { name, category } = e.features[0].properties;

                new mapboxgl.Popup({ className: 'custom-map-popup', closeButton: false })
                    .setLngLat(coordinates)
                    .setHTML(`<div style="padding: 10px; font-family: sans-serif;">
                        <b style="color: black; font-size: 14px;">${name}</b>
                        <p style="color: #6b7280; font-size: 10px; text-transform: uppercase; font-weight: 900; margin: 4px 0 0 0;">${category}</p>
                    </div>`)
                    .addTo(m);
            });

            m.on('mouseenter', 'supply-points', () => { m.getCanvas().style.cursor = 'pointer' });
            m.on('mouseleave', 'supply-points', () => { m.getCanvas().style.cursor = '' });
        }
    }, [data, mapLoaded])

    return (
        <div className="w-full h-full relative rounded-[32px] overflow-hidden border border-white/10 group shadow-2xl">
            <div ref={mapContainer} className="w-full h-full" />
            
            {/* Glossy Overlay Legend */}
            <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Market Radar Live</span>
            </div>

            <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-2xl p-6 rounded-[24px] border border-white/10 shadow-2xl transition-all group-hover:bg-black/80 max-w-[240px]">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Estrategia de Expansión</p>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/40">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase tracking-tighter">Demanda (Búsquedas)</span>
                            <span className="text-[10px] font-bold text-white/40 uppercase italic">Zonas Calientes</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-lg bg-white flex items-center justify-center border border-primary-500 shadow-inner">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase tracking-tighter">Oferta (Socios)</span>
                            <span className="text-[10px] font-bold text-white/40 uppercase italic">Negocios Existentes</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-white/10">
                    <p className="text-[10px] text-primary-400 font-black italic leading-tight">
                        💡 CONSEJO: Las zonas <span className="text-red-500 underline decoration-red-500/30 underline-offset-4">Rojas</span> sin puntos <span className="text-white underline decoration-white/30 underline-offset-4">Blancos</span> son minas de oro para nuevos socios.
                    </p>
                </div>
            </div>

            <style jsx global>{`
                .custom-map-popup .mapboxgl-popup-content {
                    background: white !important;
                    border-radius: 16px !important;
                    padding: 0 !important;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .custom-map-popup .mapboxgl-popup-tip {
                    display: none;
                }
                .mapboxgl-ctrl-group {
                    background: rgba(0,0,0,0.6) !important;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-radius: 12px !important;
                    overflow: hidden;
                }
                .mapboxgl-ctrl-group button {
                    width: 36px !important;
                    height: 36px !important;
                    filter: invert(1);
                }
            `}</style>
        </div>
    )
}

"use client"

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import mapboxgl from 'mapbox-gl'
import { useLocation } from '@/contexts/LocationContext'

export default function MapPreloader() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { location } = useLocation()
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        if (!location?.latitude || !location?.longitude) return
        if (mapRef.current) return
        if (!containerRef.current) return

        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        if (!token) return
        mapboxgl.accessToken = token

        mapRef.current = new mapboxgl.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/outdoors-v12',
            center: [location.longitude, location.latitude],
            zoom: 12,
        })

        return () => {
            mapRef.current?.remove()
            mapRef.current = null
        }
    }, [location?.latitude, location?.longitude])

    if (!mounted) return null

    return createPortal(
        <div
            ref={containerRef}
            className="fixed -left-[9999px] top-0 w-screen h-screen opacity-0 pointer-events-none"
            aria-hidden="true"
        />,
        document.body
    )
}

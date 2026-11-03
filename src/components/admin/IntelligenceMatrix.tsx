"use client"

import { useMemo } from 'react'
import { Target, MapPin, TrendingUp, AlertTriangle } from 'lucide-react'

interface Point {
  latitude: number
  longitude: number
  [key: string]: any
}

interface IntelligenceData {
  searches: Point[]
  vehicles: Point[]
  businesses: Point[]
}

function clusterPoints(points: Point[], precision = 2) {
  const map = new Map<string, Point[]>()
  points.forEach(p => {
    if (!p.latitude || !p.longitude) return
    const key = `${p.latitude.toFixed(precision)},${p.longitude.toFixed(precision)}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  })
  return Array.from(map.entries()).map(([key, items]) => {
    const [lat, lng] = key.split(',').map(Number)
    // Try to infer city from first item if available
    const city = items[0].city || ''
    return { lat, lng, count: items.length, key, city }
  })
}

export default function IntelligenceMatrix({ data }: { data: IntelligenceData }) {
  const clusters = useMemo(() => {
    const searchClusters = clusterPoints(data.searches || [])
    const businessClusters = clusterPoints(data.businesses || [])
    
    const businessMap = new Map(businessClusters.map(b => [b.key, b]))
    const searchMap = new Map(searchClusters.map(s => [s.key, s.count]))
    
    const allKeys = new Set([...businessMap.keys(), ...searchMap.keys()])
    const matrix = Array.from(allKeys).map(key => {
      const business = businessMap.get(key)
      const demand = searchMap.get(key) || 0
      const supply = business ? business.count : 0
      const ratio = supply > 0 ? demand / supply : demand
      const city = business?.city || searchClusters.find(s => s.key === key)?.city || ''
      return { lat: business?.lat || 0, lng: business?.lng || 0, demand, supply, ratio, key, city }
    })
    
    return matrix.sort((a, b) => b.ratio - a.ratio)
  }, [data])

  const topCities = useMemo(() => {
    return clusters.slice(0, 10)
  }, [clusters])

  const gaps = useMemo(() => {
    return clusters.filter(c => c.demand >= 3 && c.supply === 0).slice(0, 10)
  }, [clusters])

  if (!data || clusters.length === 0) {
    return (
      <div className="bg-[#111114] border border-white/5 rounded-[32px] p-8 text-center opacity-60">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-amber-400" />
        <p className="text-sm">No hay datos suficientes para generar la matriz</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
            <Target className="text-primary-500" /> Matriz del Monopolio
          </h3>
          <p className="text-xs text-text-secondary font-medium">Demanda vs Oferta por zona geográfica</p>
        </div>
      </header>

      {/* Ranking de ciudades */}
      <div className="bg-[#111114] border border-white/5 rounded-[32px] p-8">
        <h4 className="text-xs font-black uppercase tracking-widest text-primary-400 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Top Zonas por Ratio Demanda/Oferta
        </h4>
        <div className="space-y-3">
          {topCities.map((c) => (
            <div key={c.key} className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] px-5 py-3 rounded-2xl border border-white/5 transition">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-white/40" />
                <span className="text-xs font-bold text-white/80">{c.city || `${c.lat.toFixed(2)}, ${c.lng.toFixed(2)}`}</span>
              </div>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase">
                <span className="text-red-400">Demanda: {c.demand}</span>
                <span className="text-white">Oferta: {c.supply}</span>
                <span className={c.ratio > 5 ? "text-amber-400" : "text-text-secondary"}>Ratio: {c.ratio.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vista de huecos */}
      <div className="bg-[#111114] border border-white/5 rounded-[32px] p-8">
        <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-6 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Huecos de Mercado - Oportunidades
        </h4>
        <div className="space-y-3">
          {gaps.length === 0 ? (
            <p className="text-xs text-text-secondary italic">No se detectaron huecos significativos</p>
          ) : gaps.map((c) => (
            <div key={c.key} className="flex items-center justify-between bg-amber-500/5 hover:bg-amber-500/10 px-5 py-3 rounded-2xl border border-amber-500/20 transition">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-200">{c.lat.toFixed(2)}, {c.lng.toFixed(2)}</span>
              </div>
              <div className="text-[10px] font-black uppercase text-amber-300">
                Demanda: {c.demand} | Sin oferta
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

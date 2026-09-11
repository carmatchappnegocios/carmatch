'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, MapPin, ChevronRight, Fuel, Gauge, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

interface VehicleOfTheDayData {
  id: string
  reason: string | null
  vehicle: {
    id: string
    title: string
    brand: string
    model: string
    year: number
    price: any
    city: string
    images: string[]
    currency: string
    mileage: number | null
    transmission: string | null
    fuel: string | null
    color: string | null
  }
}

export default function VehicleOfTheDayBanner() {
  const [data, setData] = useState<VehicleOfTheDayData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVehicleOfTheDay = async () => {
      try {
        const res = await fetch('/api/vehicle-of-the-day')
        if (res.ok) {
          const result = await res.json()
          setData(result.vehicleOfTheDay)
        }
      } catch (error) {
        console.error('Error fetching vehicle of the day:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicleOfTheDay()
  }, [])

  if (loading || !data) return null

  const { vehicle } = data
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl mb-8"
    >
      <div className="absolute inset-0">
        {vehicle.images[0] && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${vehicle.images[0]})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
      </div>

      <div className="relative p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full border border-amber-500/30">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">Auto del Día</span>
          </div>
          {data.reason && (
            <span className="text-xs text-white/50">{data.reason}</span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic mb-2">
              {vehicle.brand} {vehicle.model}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm mb-4">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {vehicle.year}
              </span>
              {vehicle.mileage && (
                <span className="flex items-center gap-1">
                  <Gauge size={14} />
                  {vehicle.mileage.toLocaleString()} km
                </span>
              )}
              {vehicle.transmission && (
                <span>{vehicle.transmission}</span>
              )}
              {vehicle.fuel && (
                <span className="flex items-center gap-1">
                  <Fuel size={14} />
                  {vehicle.fuel}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {vehicle.city}
              </span>
            </div>
            <div className="text-4xl font-black text-white">
              {formatPrice(vehicle.price, vehicle.currency)}
            </div>
          </div>

          <Link
            href={`/vehicle/${vehicle.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105"
          >
            Ver Auto
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

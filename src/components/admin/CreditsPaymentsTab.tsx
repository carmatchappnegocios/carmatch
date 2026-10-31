"use client"

import { useEffect, useState } from 'react'
import { Coins, CreditCard, TrendingUp, AlertCircle, Calendar } from 'lucide-react'

export default function CreditsPaymentsTab() {
  const [data, setData] = useState<any>(null)
  const [monday, setMonday] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        setData(d)
        return fetch('/api/admin/monday-metrics')
      })
      .then(r => r.json())
      .then(m => {
        setMonday(m)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-text-secondary">Cargando...</div>

  const creditStats = data?.detailedStats?.creditStats || {}
  const financials = data?.financials || {}

  return (
    <div className="space-y-8 pb-24">
      <header>
        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
          <Coins className="text-amber-400" /> Créditos y Pagos
        </h3>
        <p className="text-text-secondary mt-2">Control de circulación de créditos y proyección de ingresos</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111114] border border-white/5 rounded-[32px] p-6">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="w-5 h-5 text-primary-400" />
            <span className="text-xs font-black uppercase tracking-widest text-white/70">Comprados</span>
          </div>
          <p className="text-3xl font-black text-white">{creditStats.purchased || 0}</p>
        </div>
        <div className="bg-[#111114] border border-white/5 rounded-[32px] p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-xs font-black uppercase tracking-widest text-white/70">Usados</span>
          </div>
          <p className="text-3xl font-black text-white">{creditStats.used || 0}</p>
        </div>
        <div className="bg-[#111114] border border-white/5 rounded-[32px] p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-widest text-white/70">En circulación</span>
          </div>
          <p className="text-3xl font-black text-white">{creditStats.activeInCirculation || 0}</p>
        </div>
      </div>

      <div className="bg-[#111114] border border-white/5 rounded-[32px] p-8">
        <h4 className="text-sm font-black uppercase tracking-widest text-primary-400 mb-4">Proyección de ingresos</h4>
        <p className="text-2xl font-black text-white">${financials.projectedRevenue?.toLocaleString('es-MX') || 0} MXN</p>
        <p className="text-xs text-text-secondary mt-2">Basado en $10 por crédito comprado</p>
      </div>

      <div className="bg-[#111114] border border-white/5 rounded-[32px] p-8">
        <h4 className="text-sm font-black uppercase tracking-widest text-green-400 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Métricas de la semana
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-text-secondary text-xs uppercase">Nuevos usuarios</p>
            <p className="text-xl font-black text-white">{monday?.newUsers ?? '-'}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase">Vehículos activos</p>
            <p className="text-xl font-black text-white">{monday?.newVehicles ?? '-'}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase">Negocios</p>
            <p className="text-xl font-black text-white">{monday?.newBusinesses ?? '-'}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase">Búsquedas</p>
            <p className="text-xl font-black text-white">{monday?.searches ?? '-'}</p>
          </div>
        </div>
        <p className="text-[10px] text-text-secondary mt-4">Semana iniciada: {monday ? new Date(monday.weekStart).toLocaleDateString('es-MX') : '-'}</p>
      </div>
    </div>
  )
}

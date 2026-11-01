"use client"

import { useEffect, useState } from 'react'
import { Bell, AlertTriangle, Car, MapPin, Building2, Globe } from 'lucide-react'

export default function AlertsTab() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulación de alertas basadas en datos reales
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        const a = []
        // Dominio vence
        const expiry = new Date('2026-12-11')
        const days = Math.ceil((expiry.getTime() - Date.now()) / 86400000)
        if (days <= 60) {
          a.push({ type: 'dominio', title: 'Dominio por vencer', message: `carmatchapp.net vence en ${days} días (11 dic 2026)`, icon: Globe, color: 'amber' })
        }
        // Negocios por aprobar
        const pending = d.reports?.filter((r:any)=>r.status==='PENDING').length || 0
        if (pending > 0) {
          a.push({ type: 'reporte', title: 'Reportes pendientes', message: `${pending} reportes sin revisar`, icon: AlertTriangle, color: 'red' })
        }
        setAlerts(a)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-text-secondary">Cargando...</div>

  return (
    <div className="space-y-8 pb-24">
      <header>
        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
          <Bell className="text-amber-400" /> Alertas
        </h3>
      </header>
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-[#111114] border border-white/5 rounded-[32px] p-8 text-center text-text-secondary">
            No notifications
          </div>
        ) : alerts.map((al,i)=>(
          <div key={i} className="bg-[#111114] border border-white/5 rounded-[32px] p-6 flex items-center gap-4">
            <al.icon className={`w-6 h-6 text-${al.color}-400`} />
            <div>
              <p className="font-bold text-white">{al.title}</p>
              <p className="text-sm text-text-secondary">{al.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

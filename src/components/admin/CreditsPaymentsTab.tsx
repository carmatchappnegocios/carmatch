"use client"

import { useEffect, useState } from 'react'
import { Coins, CreditCard, TrendingUp, AlertCircle, Calendar } from 'lucide-react'

export default function CreditsPaymentsTab() {
  const [data, setData] = useState<any>(null)
  const [monday, setMonday] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        setData(d)
        return fetch('/api/admin/payments')
      })
      .then(r => r.json())
      .then(p => {
        setPayments(p.payments || [])
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

      {/* Monday 48h Per-Piece Metrics */}
      <div className="bg-[#111114] border border-white/5 rounded-[32px] p-8">
        <h4 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Métricas Lunes 48h por Pieza
        </h4>
        {monday?.monday48h?.isMonday ? (
          <>
            <p className="text-[11px] text-text-secondary mb-4">
              Ventana: {new Date(monday.monday48h.window.periodStart).toLocaleString('es-MX')} → {new Date(monday.monday48h.window.periodEnd).toLocaleString('es-MX')} • Piezas activas: {monday.monday48h.totalActivePieces}
            </p>
            <div className="overflow-auto max-h-[50vh]">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-widest text-white/50">
                  <tr>
                    <th className="text-left py-2">Vehículo</th>
                    <th className="text-left py-2">Ciudad</th>
                    <th className="text-right py-2">Views 48h</th>
                    <th className="text-right py-2">Fav 48h</th>
                    <th className="text-right py-2">Chats 48h</th>
                    <th className="text-right py-2">Mensajes 48h</th>
                    <th className="text-right py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {monday.monday48h.perPieceMetrics.map((p: any, i: number) => (
                    <tr key={p.vehicleId || i} className="border-t border-white/5">
                      <td className="py-2 text-white">
                        <div className="font-bold">{p.brand} {p.model} {p.year}</div>
                        <div className="text-[10px] text-text-secondary truncate max-w-[250px]">{p.title}</div>
                      </td>
                      <td className="py-2 text-text-secondary">{p.city || '-'}</td>
                      <td className="py-2 text-right text-white">{p.views48h}</td>
                      <td className="py-2 text-right text-amber-400 font-bold">{p.favorites48h}</td>
                      <td className="py-2 text-right text-white">{p.chats48h}</td>
                      <td className="py-2 text-right text-white">{p.messages48h}</td>
                      <td className="py-2 text-right text-green-400 font-bold">{p.score48h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {monday.monday48h.perPieceMetrics.length === 0 && (
                <p className="text-text-secondary text-xs mt-4">Sin actividad en las últimas 48h</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-[11px] text-text-secondary">
            Métricas por pieza se calculan solo los lunes. Hoy no es lunes.
          </p>
        )}
      </div>

      <div className="bg-[#111114] border border-white/5 rounded-[32px] p-8">
        <h4 className="text-sm font-black uppercase tracking-widest text-green-400 mb-4">Historial de pagos</h4>
        <div className="overflow-auto max-h-[40vh]">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-white/50">
              <tr><th className="text-left py-2">Fecha</th><th className="text-left py-2">Usuario</th><th className="text-left py-2">Monto</th><th className="text-left py-2">Créditos</th></tr>
            </thead>
            <tbody>
              {payments.map((p,i)=>(
                <tr key={i} className="border-t border-white/5">
                  <td className="py-2 text-text-secondary">{new Date(p.createdAt).toLocaleString('es-MX')}</td>
                  <td className="py-2 text-white">{p.user?.name || p.user?.email}</td>
                  <td className="py-2 text-white">${Number(p.amount).toLocaleString('es-MX')}</td>
                  <td className="py-2 text-white">{p.creditsAdded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

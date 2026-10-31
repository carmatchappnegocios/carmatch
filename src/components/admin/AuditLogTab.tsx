"use client"

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'

export default function AuditLogTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        setLogs(d.logs || [])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-text-secondary">Cargando...</div>

  return (
    <div className="space-y-8 pb-24">
      <header>
        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
          <FileText className="text-primary-400" /> Audit Log
        </h3>
        <p className="text-text-secondary mt-2">Registro de actividades del sistema</p>
      </header>
      <div className="bg-[#111114] border border-white/5 rounded-[32px] p-6 overflow-auto max-h-[70vh]">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-widest text-white/50">
            <tr>
              <th className="text-left py-2">Fecha</th>
              <th className="text-left py-2">Acción</th>
              <th className="text-left py-2">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l: any, i: number) => (
              <tr key={i} className="border-t border-white/5">
                <td className="py-2 text-text-secondary">{new Date(l.createdAt).toLocaleString('es-MX')}</td>
                <td className="py-2 text-white">{l.action || l.type || '-'}</td>
                <td className="py-2 text-text-secondary">{JSON.stringify(l.details || l.message || '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

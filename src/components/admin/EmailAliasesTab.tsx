'use client'

import { useState, useEffect } from 'react'
import { Mail, Plus, Copy, Trash2, Check, Loader2, AlertCircle, Info } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Alias {
  id: string
  email: string
  name: string
  enabled: boolean
  createdAt: string
}

export default function EmailAliasesTab() {
  const [aliases, setAliases] = useState<Alias[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [newAlias, setNewAlias] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAliases = async () => {
    try {
      const res = await fetch('/api/admin/email-aliases')
      if (!res.ok) throw new Error('Error al cargar')
      const data = await res.json()
      setAliases(data.aliases || [])
    } catch (error) {
      console.error('Error fetching aliases:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los aliases',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAliases()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAlias.trim() || creating) return

    setCreating(true)
    try {
      const res = await fetch('/api/admin/email-aliases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localPart: newAlias.trim() }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al crear')
      }

      const alias = await res.json()
      setAliases([alias, ...aliases])
      setNewAlias('')
      toast({
        title: 'Creado',
        description: `${alias.email} creado correctamente`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear alias',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`¿Eliminar ${email}?`)) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/email-aliases?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Error al eliminar')

      setAliases(aliases.filter((a) => a.id !== id))
      toast({
        title: 'Eliminado',
        description: `${email} eliminado`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar',
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopied(email)
    setTimeout(() => setCopied(null), 2000)
    toast({
      title: 'Copiado',
      description: `${email} copiado al portapapeles`,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white px-2">
            Gestor de Correos
          </h3>
          <p className="text-zinc-500 mt-1 text-sm">
            Crea aliases @carmatchapp.net que llegan a tu Gmail
          </p>
        </div>
        <div className="w-12 h-1 bg-primary-500 rounded-full blur-[2px] opacity-50" />
      </div>

      <div className="bg-[#111114] border border-white/5 rounded-[2rem] p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-black/30 rounded-xl border border-white/5">
          <Info className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-400 space-y-1">
            <p className="font-medium text-white">
              <strong>Catch-all activo:</strong> cualquier cosa@carmatchapp.net llega a tu Gmail
            </p>
            <p>
              Los aliases de abajo crean reglas individuales para tracking. El catch-all ya captura todo.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              placeholder="usuario"
              className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20"
              disabled={creating}
              maxLength={64}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
              @carmatchapp.net
            </span>
          </div>
          <button
            type="submit"
            disabled={creating || !newAlias.trim()}
            className="px-6 py-3 bg-primary-500 text-white font-black text-sm rounded-xl hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{creating ? 'Creando...' : 'Crear'}</span>
          </button>
        </form>

        <div className="space-y-3">
          {aliases.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No hay aliases creados</p>
              <p className="text-sm mt-1">Crea tu primer alias arriba</p>
            </div>
          ) : (
            aliases.map((alias) => (
              <div
                key={alias.id}
                className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-xl hover:border-primary-500/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="font-mono text-white break-all">{alias.email}</p>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wide">
                      {alias.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(alias.email)}
                    className="p-2 bg-white/5 hover:bg-primary-500/10 rounded-lg text-zinc-400 hover:text-primary-400 transition-colors flex items-center gap-1"
                    title="Copiar email"
                  >
                    {copied === alias.email ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="text-[10px] font-medium hidden sm:inline">
                      {copied === alias.email ? 'Copiado' : 'Copiar'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(alias.id, alias.email)}
                    disabled={deleting === alias.id}
                    className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    {deleting === alias.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
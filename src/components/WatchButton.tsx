"use client"

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface WatchButtonProps {
  vehicleId: string
  currentPrice: number
  className?: string
}

export default function WatchButton({ vehicleId, currentPrice, className = '' }: WatchButtonProps) {
  const { data: session } = useSession()
  const [isWatching, setIsWatching] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    const checkWatchStatus = async () => {
      try {
        const res = await fetch(`/api/watches?vehicleId=${vehicleId}`)
        if (res.ok) {
          const data = await res.json()
          setIsWatching(data.isWatching || false)
        }
      } catch {}
    }
    checkWatchStatus()
  }, [vehicleId, session])

  const toggleWatch = async () => {
    if (!session) {
      toast.error('Inicia sesión para monitorear precios')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/watches', {
        method: isWatching ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, currentPrice }),
      })
      const data = await res.json()
      if (res.ok) {
        setIsWatching(!isWatching)
        toast.success(isWatching ? 'Dejaste de monitorear' : 'Monitoreando precio')
      } else {
        toast.error(data.error || 'Error')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null

  return (
    <button
      onClick={toggleWatch}
      disabled={loading}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition ${isWatching ? 'bg-primary-600/20 text-primary-400' : 'bg-surface-highlight text-text-secondary hover:text-text-primary'} ${className}`}
      title={isWatching ? 'Dejar de monitorear' : 'Monitorear precio'}
    >
      {isWatching ? <Eye size={14} /> : <EyeOff size={14} />}
      {isWatching ? 'Monitoreado' : 'Monitorear'}
    </button>
  )
}

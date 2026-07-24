'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, CheckCircle2, Smartphone, Monitor, Apple, RefreshCw, Users, Wifi, WifiOff, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const GOAL_SECONDS = 240 // 4 minutos

interface BetaSessionRow {
    id: string
    userId: string
    userName: string | null
    userEmail: string
    userImage: string | null
    date: string
    maxDuration: number
    completedToday: boolean
    deviceOS: string
    lastPing: string
    sessionStart: string
}

function secondsToMMSS(s: number): string {
    const m = Math.floor(Math.min(s, GOAL_SECONDS) / 60)
    const sec = Math.min(s, GOAL_SECONDS) % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
}

function DeviceIcon({ os }: { os: string }) {
    if (os === 'Android') return <span className="text-green-400 text-xs font-black">🤖 Android</span>
    if (os === 'iOS') return <span className="text-blue-400 text-xs font-black">🍎 iOS</span>
    if (os === 'Windows') return <span className="text-sky-400 text-xs font-black">🖥 Windows</span>
    if (os === 'Mac') return <span className="text-zinc-300 text-xs font-black">🍎 Mac</span>
    return <span className="text-zinc-500 text-xs">❓ {os}</span>
}

function isOnline(lastPing: string): boolean {
    const last = new Date(lastPing).getTime()
    const now = Date.now()
    return now - last < 75_000 // activo si pingó hace menos de 75s
}

export default function BetaSessionsTab() {
    const [mounted, setMounted] = useState(false)
    const [sessions, setSessions] = useState<BetaSessionRow[]>([])
    const [loading, setLoading] = useState(true)
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
    const [selectedDate, setSelectedDate] = useState<string>('')

    const load = useCallback(async (dateToLoad?: string) => {
        try {
            const target = dateToLoad || selectedDate
            const res = await fetch(`/api/admin/beta-sessions?date=${target}`)
            const data = await res.json()
            if (data.success) {
                setSessions(data.sessions)
            }
        } catch {}
        setLoading(false)
        setLastRefresh(new Date())
    }, [selectedDate])

    const isToday = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
        return todayStr === selectedDate
    }, [selectedDate])

    const changeDate = (days: number) => {
        const d = new Date(selectedDate)
        d.setDate(d.getDate() + days)
        const dateStr = d.toISOString().split('T')[0]
        setSelectedDate(dateStr)
        setLoading(true)
    }

    useEffect(() => {
        setMounted(true)
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
        setSelectedDate(today)
    }, [])

    useEffect(() => {
        if (mounted) load()
        if (isToday) {
            const interval = setInterval(load, 30_000) // Solo actualizar en vivo si es HOY
            return () => clearInterval(interval)
        }
    }, [load, isToday])

    const completed = sessions.filter(s => s.completedToday)
    const inProgress = sessions.filter(s => !s.completedToday && isOnline(s.lastPing))
    const idle = sessions.filter(s => !s.completedToday && !isOnline(s.lastPing))

    if (!mounted) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Iniciando Sesiones Blindadas...</p>
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto pb-24 px-4 space-y-6">
            {/* Header */}
            {/* Selector de Fecha v8.3 */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-2 flex items-center justify-between">
                <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 transition-all active:scale-90">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400/50" />
                    <span className="text-sm font-black text-white uppercase tracking-tighter italic">
                        {isToday ? 'HOY · ' : ''}
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <button onClick={() => changeDate(1)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 transition-all active:scale-90">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                            <Timer className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">
                            Sesiones Beta
                        </h2>
                    </div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        {isToday ? 'Actualización en vivo cada 30s' : 'Modo Historial · Estático'}
                    </p>
                </div>
                {isToday && (
                    <button 
                        onClick={() => { setLoading(true); load() }}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        {lastRefresh.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </button>
                )}
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-emerald-400">{completed.length}</p>
                    <p className="text-[10px] font-black uppercase text-emerald-600 mt-1">✅ Completados</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-yellow-400">{inProgress.length}</p>
                    <p className="text-[10px] font-black uppercase text-yellow-600 mt-1">⏱ En Progreso</p>
                </div>
                <div className="bg-zinc-500/10 border border-zinc-500/20 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-zinc-400">{idle.length}</p>
                    <p className="text-[10px] font-black uppercase text-zinc-600 mt-1">💤 Sin Actividad</p>
                </div>
            </div>

            {/* Lista de Sesiones */}
            {loading && sessions.length === 0 ? (
                <div className="text-center py-20 text-zinc-600 font-bold animate-pulse">Cargando sesiones...</div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-20">
                    <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold">Aún no hay sesiones hoy</p>
                    <p className="text-zinc-600 text-sm mt-1">Los usuarios aparecerán aquí cuando entren a la app</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {sessions.map(s => {
                        const online = isOnline(s.lastPing)
                        const pct = Math.min((s.maxDuration / GOAL_SECONDS) * 100, 100)
                        const timeStr = secondsToMMSS(s.maxDuration)

                        return (
                            <motion.div
                                key={s.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-[#111114] border rounded-2xl p-4 flex flex-col gap-3 ${
                                    s.completedToday 
                                        ? 'border-emerald-500/30' 
                                        : online 
                                            ? 'border-yellow-500/20' 
                                            : 'border-white/5'
                                }`}
                            >
                                {/* Top row */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Avatar */}
                                        <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-black ${
                                            s.completedToday ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                                        }`}>
                                            {s.userName?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-white truncate">{s.userName || 'Sin nombre'}</p>
                                            <p className="text-[10px] text-zinc-500 truncate">{s.userEmail}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <DeviceIcon os={s.deviceOS} />
                                        {online ? (
                                            <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                                                ONLINE
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-black text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">OFFLINE</span>
                                        )}
                                    </div>
                                </div>

                                {/* Barra de progreso */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                            {s.completedToday ? '✅ COMPLETADO HOY' : `⏱ ${timeStr} / 4:00`}
                                        </span>
                                        <span className={`text-[10px] font-black ${s.completedToday ? 'text-emerald-400' : online ? 'text-yellow-400' : 'text-zinc-500'}`}>
                                            {Math.round(pct)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.5 }}
                                            className={`h-full rounded-full ${
                                                s.completedToday 
                                                    ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                                                    : online 
                                                        ? 'bg-gradient-to-r from-yellow-500 to-amber-400' 
                                                        : 'bg-zinc-600'
                                            }`}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

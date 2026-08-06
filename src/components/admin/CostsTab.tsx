'use client'

import { useState, useEffect } from 'react'
import { Globe, Database, Image, Map, Cpu, CreditCard, Server, Wifi, TriangleAlert, CheckCircle2, Clock, DollarSign, Edit3, Save, X } from 'lucide-react'

interface Service {
    id: string
    name: string
    description: string
    icon: any
    color: string
    costMXN: number
    cycle: 'mensual' | 'anual' | 'por-uso' | 'gratis'
    nextPayment: string | null // ISO date string or null
    status: 'activo' | 'gratis' | 'por-uso'
    url: string
    notes: string
}

const INITIAL_SERVICES: Service[] = [
    {
        id: 'domain',
        name: 'Dominio carmatchapp.net',
        description: 'NameCheap — Registro anual del dominio',
        icon: Globe,
        color: 'orange',
        costMXN: 350,
        cycle: 'anual',
        nextPayment: '2026-12-11',
        status: 'activo',
        url: 'https://namecheap.com',
        notes: 'Registrado: 11 Dic 2025 · Vence: 11 Dic 2026'
    },
    {
        id: 'vercel',
        name: 'Vercel (Hosting)',
        description: 'Hosting y deployment de Next.js',
        icon: Server,
        color: 'white',
        costMXN: 0,
        cycle: 'gratis',
        nextPayment: null,
        status: 'gratis',
        url: 'https://vercel.com',
        notes: 'Plan Hobby — Límite de 100GB de ancho de banda'
    },
    {
        id: 'neon',
        name: 'Neon DB (PostgreSQL)',
        description: 'Base de datos Prisma/PostgreSQL en la nube',
        icon: Database,
        color: 'teal',
        costMXN: 0,
        cycle: 'gratis',
        nextPayment: null,
        status: 'gratis',
        url: 'https://neon.tech',
        notes: 'Plan Free — 512MB storage, 0.25vCPU'
    },
    {
        id: 'cloudinary',
        name: 'Cloudinary (Imágenes)',
        description: 'Almacenamiento y transformación de imágenes',
        icon: Image,
        color: 'blue',
        costMXN: 0,
        cycle: 'gratis',
        nextPayment: null,
        status: 'gratis',
        url: 'https://cloudinary.com',
        notes: 'Plan Free — 25GB storage, 25 créditos/mes'
    },
    {
        id: 'mapbox',
        name: 'Mapbox',
        description: 'Mapas interactivos y geocodificación',
        icon: Map,
        color: 'cyan',
        costMXN: 0,
        cycle: 'gratis',
        nextPayment: null,
        status: 'gratis',
        url: 'https://mapbox.com',
        notes: 'Plan Free — 50,000 cargas de mapa/mes gratis'
    },
    {
        id: 'gemini',
        name: 'Google Gemini AI',
        description: 'IA para prompts, chats y análisis de imágenes',
        icon: Cpu,
        color: 'purple',
        costMXN: 0,
        cycle: 'por-uso',
        nextPayment: null,
        status: 'por-uso',
        url: 'https://aistudio.google.com',
        notes: 'API Key gratuita — Límites de cuota diaria'
    },
    {
        id: 'stripe',
        name: 'Stripe (Pagos)',
        description: 'Procesador de pagos para créditos',
        icon: CreditCard,
        color: 'indigo',
        costMXN: 0,
        cycle: 'por-uso',
        nextPayment: null,
        status: 'por-uso',
        url: 'https://stripe.com',
        notes: '2.9% + $3 MXN por transacción exitosa'
    },
    {
        id: 'pushapi',
        name: 'Web Push (Notificaciones)',
        description: 'Notificaciones push para usuarios',
        icon: Wifi,
        color: 'green',
        costMXN: 0,
        cycle: 'gratis',
        nextPayment: null,
        status: 'gratis',
        url: '',
        notes: 'API nativa del navegador — Sin costo'
    },
]

function getDaysUntil(dateStr: string | null): number | null {
    if (!dateStr) return null
    const target = new Date(dateStr)
    const now = new Date()
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getColorClasses(color: string) {
    const map: Record<string, string> = {
        orange: 'text-orange-400 bg-orange-500/10',
        white: 'text-zinc-300 bg-white/10',
        teal: 'text-teal-400 bg-teal-500/10',
        blue: 'text-blue-400 bg-blue-500/10',
        cyan: 'text-cyan-400 bg-cyan-500/10',
        purple: 'text-purple-400 bg-purple-500/10',
        indigo: 'text-indigo-400 bg-indigo-500/10',
        green: 'text-green-400 bg-green-500/10',
        red: 'text-red-400 bg-red-500/10',
    }
    return map[color] || 'text-zinc-400 bg-zinc-500/10'
}

export default function CostsTab() {
    const [services, setServices] = useState<Service[]>(INITIAL_SERVICES)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValues, setEditValues] = useState<Partial<Service>>({})
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        try {
            const saved = localStorage.getItem('carmatch-costs')
            if (saved) {
                const parsed = JSON.parse(saved)
                const restored = parsed.map((s: any) => {
                    const initial = INITIAL_SERVICES.find(i => i.id === s.id)
                    return { ...initial, ...s, icon: initial?.icon || Globe }
                })
                setServices(restored)
            }
        } catch {}
        setLoaded(true)
    }, [])

    useEffect(() => {
        if (!loaded) return
        try {
            const toSave = services.map(s => ({ ...s, icon: undefined }))
            localStorage.setItem('carmatch-costs', JSON.stringify(toSave))
        } catch {}
    }, [services, loaded])

    const totalMensual = services.reduce((acc, s) => {
        if (s.cycle === 'anual') return acc + s.costMXN / 12
        if (s.cycle === 'mensual') return acc + s.costMXN
        return acc
    }, 0)

    const totalAnual = services.reduce((acc, s) => {
        if (s.cycle === 'anual') return acc + s.costMXN
        if (s.cycle === 'mensual') return acc + s.costMXN * 12
        return acc
    }, 0)

    const urgentServices = services.filter(s => {
        const d = getDaysUntil(s.nextPayment)
        return d !== null && d <= 30
    })

    const startEdit = (s: Service) => {
        setEditingId(s.id)
        setEditValues({ costMXN: s.costMXN, nextPayment: s.nextPayment, notes: s.notes })
    }

    const saveEdit = (id: string) => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, ...editValues } : s))
        setEditingId(null)
    }

    const CycleLabel = ({ cycle }: { cycle: string }) => {
        const map: Record<string, { label: string; cls: string }> = {
            mensual: { label: 'Mensual', cls: 'bg-blue-500/20 text-blue-400' },
            anual: { label: 'Anual', cls: 'bg-orange-500/20 text-orange-400' },
            'por-uso': { label: 'Por Uso', cls: 'bg-purple-500/20 text-purple-400' },
            gratis: { label: 'Gratis', cls: 'bg-green-500/20 text-green-400' },
        }
        const c = map[cycle] || map.gratis
        return <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${c.cls}`}>{c.label}</span>
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                        Monitor de Gastos
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Servicios activos de CarMatch Social</p>
                </div>
            </div>

            {/* Totals Banner */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/20 p-5 rounded-3xl">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Gasto Mensual Est.</p>
                    <p className="text-3xl font-black italic text-white">${totalMensual.toFixed(0)}</p>
                    <p className="text-[9px] text-zinc-500 mt-1">MXN / mes</p>
                </div>
                <div className="bg-gradient-to-br from-orange-900/30 to-red-900/20 border border-orange-500/20 p-5 rounded-3xl">
                    <p className="text-[9px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">Gasto Anual Est.</p>
                    <p className="text-3xl font-black italic text-white">${totalAnual.toFixed(0)}</p>
                    <p className="text-[9px] text-zinc-500 mt-1">MXN / año</p>
                </div>
            </div>

            {/* Upcoming Payments Alert */}
            {urgentServices.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
                    <TriangleAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-black text-red-400">¡Próximos vencimientos!</p>
                        {urgentServices.map(s => (
                            <p key={s.id} className="text-xs text-zinc-400 mt-1">
                                <span className="text-white font-bold">{s.name}</span> — {getDaysUntil(s.nextPayment)} días ({s.nextPayment})
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Services List */}
            <div className="space-y-3">
                {services.map(service => {
                    const Icon = service.icon
                    const iconCls = getColorClasses(service.color)
                    const daysLeft = getDaysUntil(service.nextPayment)
                    const isEditing = editingId === service.id

                    return (
                        <div key={service.id} className="bg-[#111114] border border-white/5 rounded-3xl p-5 space-y-4 transition-all">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl shrink-0 ${iconCls}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <h4 className="font-black text-sm text-white">{service.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <CycleLabel cycle={service.cycle} />
                                            {!isEditing && (
                                                <button
                                                    onClick={() => startEdit(service)}
                                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-0.5">{service.description}</p>
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-3 border-t border-white/5 pt-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Costo MXN</label>
                                            <input
                                                type="number"
                                                value={editValues.costMXN ?? ''}
                                                onChange={e => setEditValues(p => ({ ...p, costMXN: Number(e.target.value) }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Próximo Pago</label>
                                            <input
                                                type="date"
                                                value={editValues.nextPayment ?? ''}
                                                onChange={e => setEditValues(p => ({ ...p, nextPayment: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Notas</label>
                                        <input
                                            type="text"
                                            value={editValues.notes ?? ''}
                                            onChange={e => setEditValues(p => ({ ...p, notes: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => saveEdit(service.id)}
                                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-[11px] font-black text-white flex items-center justify-center gap-1.5 transition"
                                        >
                                            <Save className="w-3.5 h-3.5" /> Guardar
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-black text-zinc-400 flex items-center justify-center gap-1.5 transition"
                                        >
                                            <X className="w-3.5 h-3.5" /> Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                                    <div>
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Costo</p>
                                        <p className="text-lg font-black italic text-white">
                                            {service.costMXN === 0
                                                ? <span className="text-emerald-400 text-sm">Sin costo</span>
                                                : `$${service.costMXN} MXN`
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Vencimiento</p>
                                        {daysLeft !== null ? (
                                            <p className={`text-sm font-black ${daysLeft <= 7 ? 'text-red-400' : daysLeft <= 30 ? 'text-orange-400' : 'text-zinc-300'}`}>
                                                {daysLeft > 0 ? `${daysLeft} días` : '¡Vencido!'}
                                            </p>
                                        ) : (
                                            <p className="text-sm font-black text-zinc-600">—</p>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Notas</p>
                                        <p className="text-[10px] text-zinc-400">{service.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <p className="text-center text-[9px] text-zinc-600 font-bold uppercase tracking-widest pb-4">
                Datos actualizados manualmente · Usa el ícono ✏️ para editar
            </p>
        </div>
    )
}

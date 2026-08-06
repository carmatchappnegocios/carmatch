'use client'

import { useState, useMemo, useCallback } from 'react'
import { Copy, Check, Search, Swords, Shield, Zap, Heart, Mountain, RefreshCw, Calendar, Clock, Sparkles, ChevronDown, ChevronUp, Filter } from 'lucide-react'
import {
    generateVideoPrompt,
    generateBatch,
    generateCalendar,
    heroes,
    villains,
    scenes,
    emotions,
    seasons,
    type Hero,
    type Villain,
    type Scene,
    type Emotion,
    type Season,
    type GeneratedPrompt
} from '@/lib/video-prompts'

const heroIcons: Record<Hero, any> = {
    'don-match': Shield,
    'car-mela': Heart,
    'matchy': Zap,
    'car-litos': Mountain
}

const heroColors: Record<Hero, string> = {
    'don-match': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'car-mela': 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    'matchy': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    'car-litos': 'text-orange-400 bg-orange-400/10 border-orange-400/20'
}

const villainColors: Record<Villain, string> = {
    'el-bache': 'text-yellow-500 bg-yellow-500/10',
    'la-agencia': 'text-red-500 bg-red-500/10',
    'mecanico-tranero': 'text-gray-400 bg-gray-400/10',
    'estafa-odometro': 'text-orange-500 bg-orange-500/10',
    'vendedor-informal': 'text-amber-500 bg-amber-500/10',
    'perfiles-falsos': 'text-cyan-400 bg-cyan-400/10',
    'gasolinazo': 'text-red-600 bg-red-600/10',
    'multa-sorpresa': 'text-slate-400 bg-slate-400/10',
    'robo-auto': 'text-zinc-400 bg-zinc-400/10',
    'seguro-caro': 'text-emerald-500 bg-emerald-500/10'
}

export default function VideoPromptsTab() {
    const [prompts, setPrompts] = useState<GeneratedPrompt[]>(() => generateBatch(10))
    const [search, setSearch] = useState('')
    const [filterHero, setFilterHero] = useState<string>('all')
    const [filterVillain, setFilterVillain] = useState<string>('all')
    const [filterScene, setFilterScene] = useState<string>('all')
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [copiedId, setCopiedId] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState<'prompts' | 'calendar'>('prompts')
    const [calendar, setCalendar] = useState(() => generateCalendar(30))

    const filteredPrompts = useMemo(() => {
        return prompts.filter(p => {
            const matchSearch = !search ||
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.hook.toLowerCase().includes(search.toLowerCase()) ||
                villains[p.villain].villainName.toLowerCase().includes(search.toLowerCase())
            const matchHero = filterHero === 'all' || p.hero === filterHero
            const matchVillain = filterVillain === 'all' || p.villain === filterVillain
            const matchScene = filterScene === 'all' || p.scene === filterScene
            return matchSearch && matchHero && matchVillain && matchScene
        })
    }, [prompts, search, filterHero, filterVillain, filterScene])

    const generateNew = useCallback(() => {
        setPrompts(prev => [...generateBatch(10), ...prev])
    }, [])

    const generateSingle = useCallback(() => {
        setPrompts(prev => [generateVideoPrompt(), ...prev])
    }, [])

    const refreshCalendar = useCallback(() => {
        setCalendar(generateCalendar(30))
    }, [])

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id)
            setTimeout(() => setCopiedId(null), 2000)
        })
    }

    const buildFullPrompt = (p: GeneratedPrompt): string => {
        const h = heroes[p.hero]
        const v = villains[p.villain]
        const sc = scenes[p.scene]
        const em = emotions[p.emotion]
        const se = seasons[p.season]
        return `=== CARMATCH VIDEO PROMPT ===

TITULO: ${p.title}
HEROE: ${h.name} (${h.age} anios) - ${h.personality}
VILLANO: ${v.villainName} (${v.name}) - ${v.problem}
ESCENARIO: ${sc.name} - ${sc.description}
EMOCION: ${em.name} - ${em.description}
TEMPORADA: ${se.name} - ${se.theme}
DURACION: ${p.duration}
PLATAFORMA: ${p.platform}

=== HOOK (primeros 3 segundos) ===
${p.hook}

=== VOZ EN OFF (guion completo) ===
${p.voiceover}

=== ESCENAS ===
${p.escenas}

=== MUSICA ===
${p.musica}

=== TEXTO EN PANTALLA ===
${p.textoEnPantalla}

=== HASHTAGS ===
${p.hashtags}

=== SEGMENTACION ===
- Edad: ${p.segmentacion.edad}
- Ubicacion: ${p.segmentacion.ubicacion}
- Plataformas: ${p.segmentacion.plataformas}
- Intereses: ${p.segmentacion.intereses}

=== HORARIO SUGERIDO ===
${p.scheduledTime}`
    }

    const copyHookOnly = (p: GeneratedPrompt) => {
        copyToClipboard(p.hook, p.id)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                        <Swords className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Familia Match vs Villanos</h3>
                        <p className="text-xs text-gray-500">Generador infinito de videos para redes sociales</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={generateSingle}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <Sparkles className="w-4 h-4" />
                        Generar 1
                    </button>
                    <button
                        onClick={generateNew}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Generar 10
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                <button
                    onClick={() => setActiveTab('prompts')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'prompts'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    Prompts ({prompts.length})
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeTab === 'calendar'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    <Calendar className="w-4 h-4" />
                    Calendario 30 dias
                </button>
            </div>

            {activeTab === 'prompts' ? (
                <>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por titulo, hook o villano..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                            />
                        </div>
                        <select
                            value={filterHero}
                            onChange={(e) => setFilterHero(e.target.value)}
                            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                        >
                            <option value="all">Todos los heroes</option>
                            {Object.entries(heroes).map(([key, h]) => (
                                <option key={key} value={key}>{h.name}</option>
                            ))}
                        </select>
                        <select
                            value={filterVillain}
                            onChange={(e) => setFilterVillain(e.target.value)}
                            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                        >
                            <option value="all">Todos los villanos</option>
                            {Object.entries(villains).map(([key, v]) => (
                                <option key={key} value={key}>{v.villainName}</option>
                            ))}
                        </select>
                        <select
                            value={filterScene}
                            onChange={(e) => setFilterScene(e.target.value)}
                            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                        >
                            <option value="all">Todos los escenarios</option>
                            {Object.entries(scenes).map(([key, s]) => (
                                <option key={key} value={key}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="text-sm text-gray-500">{filteredPrompts.length} prompts encontrados</div>

                    {/* Prompts List */}
                    <div className="space-y-4">
                        {filteredPrompts.map((prompt) => {
                            const HeroIcon = heroIcons[prompt.hero]
                            const isExpanded = expandedId === prompt.id
                            const h = heroes[prompt.hero]
                            const v = villains[prompt.villain]
                            return (
                                <div key={prompt.id} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                        onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg border ${heroColors[prompt.hero]}`}>
                                                <HeroIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{prompt.title}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-md">{prompt.hook}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${villainColors[prompt.villain]}`}>
                                                {v.villainName}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                {prompt.duration}
                                            </span>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t p-4 space-y-4 text-sm">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                                <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                    <span className="text-gray-500">Escenario:</span> {scenes[prompt.scene].name}
                                                </div>
                                                <div className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded">
                                                    <span className="text-gray-500">Emocion:</span> {emotions[prompt.emotion].name}
                                                </div>
                                                <div className="px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded">
                                                    <span className="text-gray-500">Temporada:</span> {seasons[prompt.season].name}
                                                </div>
                                                <div className="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded">
                                                    <span className="text-gray-500">Plataforma:</span> {prompt.platform}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="font-medium text-xs text-gray-500 mb-1">HOOK</div>
                                                <div className="text-red-500 font-bold">{prompt.hook}</div>
                                            </div>
                                            <div>
                                                <div className="font-medium text-xs text-gray-500 mb-1">VOZ EN OFF</div>
                                                <div className="text-gray-700 dark:text-gray-300">{prompt.voiceover}</div>
                                            </div>
                                            <div>
                                                <div className="font-medium text-xs text-gray-500 mb-1">ESCENAS</div>
                                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{prompt.escenas}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="font-medium text-xs text-gray-500 mb-1">MUSICA</div>
                                                    <div className="text-gray-700 dark:text-gray-300">{prompt.musica}</div>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-xs text-gray-500 mb-1">TEXTO EN PANTALLA</div>
                                                    <div className="text-gray-700 dark:text-gray-300 text-xs">{prompt.textoEnPantalla}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-medium text-xs text-gray-500 mb-1">HASHTAGS</div>
                                                <div className="text-blue-500 text-xs">{prompt.hashtags}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="font-medium text-xs text-gray-500 mb-1">SEGMENTACION</div>
                                                    <div className="text-gray-700 dark:text-gray-300 text-xs space-y-1">
                                                        <div>Edad: {prompt.segmentacion.edad}</div>
                                                        <div>Ubicacion: {prompt.segmentacion.ubicacion}</div>
                                                        <div>Intereses: {prompt.segmentacion.intereses}</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-xs text-gray-500 mb-1">HORARIO SUGERIDO</div>
                                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                        <Clock className="w-4 h-4" />
                                                        {prompt.scheduledTime}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(buildFullPrompt(prompt), prompt.id) }}
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
                                                >
                                                    {copiedId === prompt.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    {copiedId === prompt.id ? 'Copiado!' : 'Copiar prompt completo'}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); copyHookOnly(prompt) }}
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
                                                >
                                                    {copiedId === prompt.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    Copiar solo hook
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </>
            ) : (
                /* Calendar View */
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">30 dias de contenido programado</p>
                        <button
                            onClick={refreshCalendar}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Regenerar
                        </button>
                    </div>
                    <div className="space-y-3">
                        {calendar.map((day) => {
                            const HeroIcon = heroIcons[day.prompt.hero]
                            const h = heroes[day.prompt.hero]
                            const v = villains[day.prompt.villain]
                            return (
                                <div key={day.day} className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[10px] font-bold text-blue-200">DIA</span>
                                                <span className="text-lg font-black text-white leading-none">{day.day}</span>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">{day.date}</div>
                                                <div className="font-medium text-sm mt-0.5">{day.prompt.title}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className={`p-1 rounded ${heroColors[day.prompt.hero]}`}>
                                                        <HeroIcon className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">{h.name} vs {v.villainName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                                {day.prompt.duration}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                {day.prompt.scheduledTime}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 italic">{day.tips}</div>
                                    <div className="mt-2 text-xs text-red-500 font-medium">{day.prompt.hook}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

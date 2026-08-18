'use client'

import React, { useState, useEffect } from 'react'
import { Video, CheckCircle2, Circle, Zap, Calendar, ChevronDown, ChevronUp, Copy, Loader2, Share2 } from 'lucide-react'
import { generateProtocolContent } from '@/app/admin/actions/protocol-actions'

const PLAN_VIDEOS = [
  { day: 1, theme: 'Lanzamiento: Por qué CarMatch va a cambiar México hoy' },
  { day: 2, theme: 'SOS: Cómo pedir ayuda si te quedas sin batería en carretera' },
  { day: 3, theme: 'MapStore: Encuentra el taller más cercano con mejores reviews' },
  { day: 4, theme: 'Venta Rápida: Cómo publicar tu auto en menos de 60 segundos' },
  { day: 5, theme: 'Seguridad: Por qué en CarMatch no hay perfiles falsos' },
  { day: 6, theme: 'Ahorro: Olvídate de las comisiones de las agencias' },
  { day: 7, theme: 'Análisis Semanal: Repite tu video más viral' },
  { day: 8, theme: 'SOS: El botón que puede salvar vidas en una emergencia' },
  { day: 9, theme: 'MapStore: ¿Buscas llantas? Mira cómo encontrarlas cerca de ti' },
  { day: 10, theme: 'Filtros: Encuentra exactamente el auto de tus sueños' },
  { day: 11, theme: 'Comunidad: El poder de los reportes en tiempo real' },
  { day: 12, theme: 'Autollenado: Los datos reales de agencia en tu celular' },
  { day: 13, theme: 'Privacidad: Tú controlas quién ve tus datos' },
  { day: 14, theme: 'Análisis Semanal: Lo que aprendimos del video #8' },
  { day: 15, theme: 'Uso Diario: De camino al trabajo con CarMatch' },
  { day: 16, theme: 'SOS: ¿Qué hacer si te quedas sin gasolina?' },
  { day: 17, theme: 'MapStore: Los mejores autolavados de tu zona' },
  { day: 18, theme: 'Venta: ¿Moto o Auto? Todo se vende en CarMatch' },
  { day: 19, theme: 'Exclusividad: Beneficios de ser usuario pionero' },
  { day: 20, theme: 'Tutorial: Navegando los 3 feeds de CarMatch' },
  { day: 21, theme: 'Análisis Semanal: El video con más comentarios gana' },
  { day: 22, theme: 'SOS: Cómo ayudar a otro usuario en apuros' },
  { day: 23, theme: 'MapStore: Refacciones originales sin dar vueltas' },
  { day: 24, theme: 'Historias: Alguien vendió su auto en tiempo récord' },
  { day: 25, theme: 'Seguridad: Los filtros de protección al comprador' },
  { day: 26, theme: 'Futuro: Lo que viene para CarMatch el próximo mes' },
  { day: 27, theme: 'Comparativa: CarMatch vs. Métodos antiguos' },
  { day: 28, theme: 'SOS: Seguridad para mujeres conductoras' },
  { day: 29, theme: 'MapStore: Seguros y servicios legales en la app' },
  { day: 30, theme: '🏁 Cierre de Mes: 30 días de CarMatch México' },
]

export default function ContentCalendarTab() {
  const [done, setDone] = useState<Set<number>>(new Set())
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]))
  const [generatingDay, setGeneratingDay] = useState<number | null>(null)
  const [results, setResults] = useState<Record<number, any>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const savedDone = localStorage.getItem('carmatch_calendar_done')
      const savedWeeks = localStorage.getItem('carmatch_calendar_weeks')
      const savedResults = localStorage.getItem('carmatch_calendar_results')

      if (savedDone) setDone(new Set(JSON.parse(savedDone)))
      if (savedWeeks) setOpenWeeks(new Set(JSON.parse(savedWeeks)))
      if (savedResults) setResults(JSON.parse(savedResults))
    } catch (e) {
      console.error('Error loading calendar state', e)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('carmatch_calendar_done', JSON.stringify(Array.from(done)))
    localStorage.setItem('carmatch_calendar_weeks', JSON.stringify(Array.from(openWeeks)))
    localStorage.setItem('carmatch_calendar_results', JSON.stringify(results))
  }, [done, openWeeks, results, isLoaded])

  const toggleDone = (day: number) => {
    setDone(prev => {
      const next = new Set(prev)
      next.has(day) ? next.delete(day) : next.add(day)
      return next
    })
  }

  const toggleWeek = (week: number) => {
    setOpenWeeks(prev => {
      const next = new Set(prev)
      next.has(week) ? next.delete(week) : next.add(week)
      return next
    })
  }

  const handleGenerate = async (day: number, theme: string) => {
    setGeneratingDay(day)
    try {
      const res = await generateProtocolContent(theme)
      if (res.success) {
        setResults(prev => ({ ...prev, [day]: res.data }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGeneratingDay(null)
    }
  }

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const progress = Math.round((done.size / 30) * 100)
  const weeks = [
    { n: 1, label: 'Semana 1: El Despertar', days: PLAN_VIDEOS.slice(0, 7) },
    { n: 2, label: 'Semana 2: La Tribu', days: PLAN_VIDEOS.slice(7, 14) },
    { n: 3, label: 'Semana 3: Prueba Social', days: PLAN_VIDEOS.slice(14, 21) },
    { n: 4, label: 'Semana 4: Conversión Máxima', days: PLAN_VIDEOS.slice(21, 30) },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* HEADER */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
            <Video className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">30 Días de Viralidad</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Generación Automática de Videos Pippit</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[140px]">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{done.size} / 30 videos</span>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] font-black text-orange-400">{progress}% completado</span>
        </div>
      </div>

      {/* SEMANAS */}
      {weeks.map((week) => (
        <div key={week.n} className={`border rounded-3xl overflow-hidden bg-black/40 ${openWeeks.has(week.n) ? 'border-orange-500/20' : 'border-white/5'}`}>
          <button onClick={() => toggleWeek(week.n)} className="w-full flex justify-between items-center p-5 text-left">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-orange-400">{week.label}</span>
              <p className="text-[10px] text-zinc-600 mt-0.5 italic">Estrategia semanal de crecimiento acelerado</p>
            </div>
            {openWeeks.has(week.n) ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
          </button>

          {openWeeks.has(week.n) && (
            <div className="px-4 pb-4 space-y-3">
              {week.days.map((day) => {
                const isDone = done.has(day.day)
                const isGenerating = generatingDay === day.day
                const result = results[day.day]
                
                return (
                  <div key={day.day} className={`rounded-2xl border transition-all overflow-hidden ${isDone ? 'opacity-40 grayscale bg-white/5 border-white/5' : 'bg-white/5 border-white/5'}`}>
                    {/* FILA DEL DÍA */}
                    <div className="flex items-center gap-3 p-4">
                      <button onClick={() => toggleDone(day.day)} className="flex-shrink-0">
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-zinc-700" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-zinc-500 uppercase">Día {day.day}</span>
                          <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase">Pippit</span>
                        </div>
                        <p className={`text-sm font-bold mt-0.5 truncate ${isDone ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>
                          {day.theme}
                        </p>
                      </div>
                      {!isDone && (
                        <button
                          onClick={() => handleGenerate(day.day, day.theme)}
                          disabled={isGenerating}
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all"
                        >
                          {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                          {isGenerating ? 'Generando...' : 'Generar'}
                        </button>
                      )}
                    </div>

                    {/* PANEL DE RESULTADOS (SOLO SI SE HA GENERADO) */}
                    {result && !isDone && (
                      <div className="bg-black/60 border-t border-white/5 p-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                        {/* Pippit Prompt */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                              <Video className="w-3 h-3" /> Prompt para Pippit (Video)
                            </span>
                            <button
                              onClick={() => copy(result.pippit_prompt, `p${day.day}`)}
                              className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg transition-all ${copiedId === `p${day.day}` ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                              {copiedId === `p${day.day}` ? 'Copiado!' : 'Copiar Prompt'}
                            </button>
                          </div>
                          <div className="bg-black/40 border border-orange-500/20 p-4 rounded-xl text-[10px] text-zinc-300 font-mono leading-relaxed">
                            {result.pippit_prompt}
                          </div>
                        </div>

                        {/* Redes Sociales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(result.platforms).map(([plat, text]: any) => (
                            <div key={plat} className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{plat}</span>
                                <button onClick={() => copy(text, `${plat}${day.day}`)} className="text-zinc-600 hover:text-white transition-colors">
                                  {copiedId === `${plat}${day.day}` ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                              <p className="text-[10px] text-zinc-400 leading-tight italic line-clamp-2">{text}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase italic">
                           <Share2 className="w-3 h-3" /> Sube este video hoy para maximizar el K-Factor de crecimiento.
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

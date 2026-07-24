'use client'

import React, { useState, useEffect } from 'react'
import { 
  Zap, Shield, Eye, Share2, MessageSquare, 
  Lock, Copy, CheckCircle2, Loader2, FileText, 
  Terminal, AlertTriangle, Radio
} from 'lucide-react'
import { generateProtocolContent, getProtocolMissions } from '@/app/admin/actions/protocol-actions'
import { renderProtocolPDF } from '@/lib/protocol-pdf'

interface Props {
  prefilledTopic?: string
  onTopicConsumed?: () => void
}

export default function ProtocolAgentTab({ prefilledTopic, onTopicConsumed }: Props) {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [protocolData, setProtocolData] = useState<any>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dynamicMissions, setDynamicMissions] = useState<any[]>([])

  useEffect(() => {
    async function loadMissions() {
      const res = await getProtocolMissions()
      if (res.success) setDynamicMissions(res.data)
    }
    loadMissions()
  }, [])

  // Cuando llega un tema del calendario, lo precarga y lanza automáticamente
  useEffect(() => {
    if (prefilledTopic && prefilledTopic.trim()) {
      setTopic(prefilledTopic)
      handleLaunch(prefilledTopic)
      onTopicConsumed?.()
    }
  }, [prefilledTopic])

  const handleLaunch = async (forcedTopic?: string) => {
    const finalTopic = forcedTopic || topic
    if (!finalTopic.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await generateProtocolContent(finalTopic)
      if (res.success) {
        setProtocolData(res.data)
        if (forcedTopic) setTopic(forcedTopic)
      } else {
        setError(res.error)
      }
    } catch (err) {
      setError('Falla en la conexión del protocolo')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const missionIcons: Record<string, JSX.Element> = {
    leak: <AlertTriangle className="w-3 h-3 text-red-500" />,
    hero: <Shield className="w-3 h-3 text-green-500" />,
    exclusivity: <Lock className="w-3 h-3 text-yellow-500" />,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* HEADER PROTOCOLO */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
            <Radio className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Protocol Agent</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Unicorn Growth Strategy Engine // v2.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">En Línea - Escaneando Mercado</span>
        </div>
      </div>

      {/* MISIONES DINÁMICAS (RADAR PROACTIVO) */}
      {!protocolData && !loading && (
        <div className="space-y-3 animate-in fade-in duration-1000">
          <div className="flex items-center gap-2 px-1">
            <Terminal className="w-3 h-3 text-zinc-600" />
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">
              {dynamicMissions.length > 0 ? 'Anomalías Detectadas — Misiones Listas' : 'Radar Escaneando Mercado...'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dynamicMissions.length > 0 ? dynamicMissions.map((s: any) => (
              <button
                key={s.id}
                onClick={() => handleLaunch(s.label)}
                className="bg-white/5 border border-white/5 hover:border-red-500/30 p-4 rounded-2xl transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-2">
                  {missionIcons[s.type] ?? <Zap className="w-3 h-3 text-orange-500" />}
                  <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Misión Detectada</span>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase leading-tight italic">
                  {s.label}
                </p>
              </button>
            )) : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl animate-pulse space-y-2">
                <div className="h-2 w-12 bg-white/10 rounded" />
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="h-3 w-3/4 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INPUT DE MISIÓN */}
      <div className="relative group">
        <input 
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="¿Cuál es la próxima verdad que vamos a filtrar? (Ej: Estafas de Agencias)"
          className="w-full bg-[#111] border-2 border-white/5 rounded-2xl py-5 px-6 text-white placeholder:text-zinc-700 focus:border-red-500/50 outline-none transition-all font-bold text-lg"
        />
        <button 
          onClick={handleLaunch}
          disabled={loading || !topic.trim()}
          className="absolute right-3 top-3 bottom-3 px-8 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 group-hover:scale-105"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Iniciar Protocolo
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* RESULTADOS DEL PROTOCOLO */}
      {protocolData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* COLUMNA IZQUIERDA: EL BRIEFING */}
          <div className="lg:col-span-2 space-y-6">
            {/* EL LEAK / GANCHO */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-3 h-3" /> Filtración Detectada (The Leak)
                </span>
                {protocolData.characters && (
                  <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                    <span className="text-[10px]">🎭</span>
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{protocolData.characters}</span>
                  </div>
                )}
                <button onClick={() => renderProtocolPDF(protocolData, topic)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all">
                  <FileText className="w-3 h-3 text-zinc-400" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Protocol Briefing</span>
                </button>
              </div>
              <h3 className="text-3xl font-black text-white leading-none italic italic">"{protocolData.leaked_hook}"</h3>
              <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-red-500/30 pl-4 py-1 italic">
                {protocolData.protocol_briefing}
              </p>
            </div>

            {/* ⭐ OPERACIÓN RECLUTAMIENTO — FACEBOOK */}
            {protocolData.recruitment_prompt && (
              <div className="bg-gradient-to-br from-blue-950/60 to-black border-2 border-blue-500/40 rounded-3xl p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-blue-400" />
                      <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Reclutamiento de Negocios (FB)</span>
                    </div>
                    <p className="text-[9px] text-blue-700 uppercase tracking-widest">Atrae Autolavados, Talleres y Agencias al MapStore</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                        onClick={() => copy(protocolData.recruitment_prompt, 'gemini')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${copiedId === 'gemini' ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                    >
                        {copiedId === 'gemini' ? <CheckCircle2 className="w-3 h-3" /> : <><Copy className="w-3 h-3" /> Imagen (Gemini)</>}
                    </button>
                    <button
                        onClick={() => copy(protocolData.recruitment_copy, 'fb_copy')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${copiedId === 'fb_copy' ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
                    >
                        {copiedId === 'fb_copy' ? <CheckCircle2 className="w-3 h-3" /> : <><Copy className="w-3 h-3" /> Copy FB</>}
                    </button>
                  </div>
                </div>

                <div className="bg-black/60 rounded-2xl p-4 border border-blue-500/10 space-y-3">
                  <div>
                    <span className="text-[8px] font-black text-blue-500 uppercase block mb-1">Estrategia de Captación</span>
                    <p className="text-[11px] text-blue-100/80 leading-relaxed italic">{protocolData.recruitment_copy}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic leading-none">
                        Paga por 5,000 likes iniciales para generar autoridad inmediata.
                    </span>
                </div>
              </div>
            )}

            {/* ⭐ PIPPIT PROMPT — ESTRELLA PRINCIPAL */}
            {protocolData.pippit_prompt && (
              <div className="bg-gradient-to-br from-orange-950/60 to-black border-2 border-orange-500/40 rounded-3xl p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-400" />
                      <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Prompt para Pippit</span>
                    </div>
                    <p className="text-[9px] text-orange-700 uppercase tracking-widest">Cópialo · Pégalo en Pippit · Español Mexicano · 30 seg</p>
                  </div>
                  <button
                    onClick={() => copy(protocolData.pippit_prompt, 'pippit')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${copiedId === 'pippit' ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-400 text-white'}`}
                  >
                    {copiedId === 'pippit'
                      ? <><CheckCircle2 className="w-4 h-4" /> Copiado!</>
                      : <><Copy className="w-4 h-4" /> Copiar Prompt</>}
                  </button>
                </div>
                <div className="bg-black/60 rounded-2xl p-4 border border-orange-500/10">
                  <p className="text-[11px] text-orange-100/80 leading-relaxed font-mono">{protocolData.pippit_prompt}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { n: '1', text: 'Abre Pippit y crea un nuevo proyecto de video' },
                    { n: '2', text: 'Pega este prompt en el campo de script o descripción' },
                    { n: '3', text: 'Elige un avatar Latino y genera el video' }
                  ].map(step => (
                    <div key={step.n} className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3 space-y-1">
                      <span className="text-orange-500 font-black text-lg">{step.n}</span>
                      <p className="text-[9px] text-zinc-500 leading-tight">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PLATAFORMAS DE ATAQUE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(protocolData.platforms).map(([id, text]: any) => (
                    <div key={id} className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-3 group hover:border-red-500/20 transition-all">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">{id} // Incursión</span>
                            <button onClick={() => copy(text, id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                                {copiedId === id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-medium line-clamp-4 italic">{text}</p>
                    </div>
                ))}
            </div>
          </div>

          {/* COLUMNA DERECHA: STORYBOARD & SOS */}
          <div className="space-y-6">
            {/* STORYBOARD */}
            <div className="bg-black border border-white/10 rounded-3xl p-6 space-y-4">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Eye className="w-3 h-3" /> Visual Pipeline
                </span>
                <div className="space-y-4">
                    {protocolData.storyboard.map((step: any, i: number) => (
                        <div key={i} className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-red-500 mono">{String(i+1).padStart(2, '0')}</span>
                                <span className="text-[9px] font-black text-zinc-600 uppercase">Toma</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-tight italic">{step.visual}</p>
                            <div className="bg-white/5 p-2 rounded-lg border border-white/5 mt-1">
                                <span className="text-[8px] font-bold text-zinc-500 uppercase block mb-1">Overlay</span>
                                <p className="text-[10px] text-white font-bold mono uppercase">{step.overlay}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SOS MISSION */}
            <div className="bg-red-600 rounded-3xl p-6 space-y-3 shadow-xl shadow-red-600/10 border border-red-500/50">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocolo Héroe (SOS)</span>
                </div>
                <p className="text-xs font-bold text-white/90 leading-relaxed italic">
                    {protocolData.hero_mission}
                </p>
                <div className="pt-2 border-t border-white/10">
                    <span className="text-[8px] font-black text-red-200 uppercase tracking-widest italic leading-none">Crea empatía y gratitud masiva</span>
                </div>
            </div>

            {/* EXCLUSIVIDAD */}
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-zinc-500" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Barrera de Exclusividad</span>
                    </div>
                    <button onClick={() => copy(protocolData.invite_gate, 'gate')} className="text-zinc-600 hover:text-white transition-colors">
                        {copiedId === 'gate' ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                    </button>
                </div>
                <p className="text-[11px] font-bold text-zinc-500 italic leading-relaxed">
                    "{protocolData.invite_gate}"
                </p>
            </div>
          </div>

        </div>
      )}

      {/* FOOTER ACERCA DE */}
      {!protocolData && (
        <div className="py-20 text-center space-y-6">
          <div className="flex justify-center gap-8 opacity-20">
            <Zap className="w-12 h-12" />
            <Shield className="w-12 h-12" />
            <Radio className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-zinc-600 font-black uppercase text-xs tracking-[0.4em]">Autonomous Growth Engine</h3>
            <p className="text-zinc-800 text-[10px] max-w-md mx-auto leading-relaxed">
                Diseñado para infiltrar a CarMatch Social en la conciencia colectiva mediante el misterio y la utilidad real. Cero publicidad genérica. Cero comisiones. 200 Millones de usuarios es el único fin.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

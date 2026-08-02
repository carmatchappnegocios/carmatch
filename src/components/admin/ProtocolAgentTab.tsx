'use client'

import React, { useState, useEffect } from 'react'
import { 
  Zap, Copy, CheckCircle2, Loader2, 
  AlertTriangle, Image, FileText, Share2,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { generateProtocolContent, getProtocolMissions } from '@/app/admin/actions/protocol-actions'

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
  const [expandedSection, setExpandedSection] = useState<string | null>('image_prompts')
  const [activeTab, setActiveTab] = useState<'images' | 'copy' | 'video'>('images')

  useEffect(() => {
    async function loadMissions() {
      const res = await getProtocolMissions()
      if (res.success) setDynamicMissions(res.data)
    }
    loadMissions()
  }, [])

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
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyAllImagePrompts = () => {
    if (!protocolData?.image_prompts) return
    const allPrompts = Object.entries(protocolData.image_prompts)
      .map(([key, val]: any) => `=== ${key.toUpperCase()} (${val.aspect_ratio}) ===\n${val.prompt}\n`)
      .join('\n')
    copy(allPrompts, 'all_images')
  }

  const promptLabels: Record<string, { label: string, icon: string }> = {
    hero_image: { label: 'Hero Image', icon: '🖼️' },
    story_1: { label: 'Story 1 - Hook', icon: '📱' },
    story_2: { label: 'Story 2 - Problem', icon: '😰' },
    story_3: { label: 'Story 3 - Solution', icon: '✅' },
    carousel_1: { label: 'Carousel Opener', icon: '🎠' },
    carousel_2: { label: 'Carousel Data', icon: '📊' },
    carousel_3: { label: 'Carousel CTA', icon: '🎯' },
    thumbnail: { label: 'YouTube Thumbnail', icon: '▶️' },
    banner: { label: 'Profile Banner', icon: '🏷️' },
    ad_square: { label: 'Paid Ad', icon: '💰' },
    meme: { label: 'Meme Format', icon: '😂' },
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* HEADER */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
            <Image className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Prompt Generator</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">AI Image Prompts + Social Media Copy</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Ready</span>
        </div>
      </div>

      {/* SUGGESTED TOPICS */}
      {!protocolData && !loading && (
        <div className="space-y-3 animate-in fade-in duration-1000">
          <div className="flex items-center gap-2 px-1">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">
              {dynamicMissions.length > 0 ? 'Trending Topics' : 'Loading topics...'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dynamicMissions.map((s: any) => (
              <button
                key={s.id}
                onClick={() => handleLaunch(s.label)}
                className="bg-white/5 border border-white/5 hover:border-purple-500/30 p-4 rounded-2xl transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3 h-3 text-purple-500" />
                  <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">{s.type}</span>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase leading-tight italic">
                  {s.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT */}
      <div className="relative group">
        <input 
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
          placeholder="Enter a topic to generate image prompts... (e.g., Estafas de Agencias)"
          className="w-full bg-[#111] border-2 border-white/5 rounded-2xl py-5 px-6 text-white placeholder:text-zinc-700 focus:border-purple-500/50 outline-none transition-all font-bold text-lg"
        />
        <button 
          onClick={() => handleLaunch()}
          disabled={loading || !topic.trim()}
          className="absolute right-3 top-3 bottom-3 px-8 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 group-hover:scale-105"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Generate
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* RESULTS */}
      {protocolData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Campaign Header */}
          <div className="bg-gradient-to-br from-purple-950/60 to-black border-2 border-purple-500/40 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter">{protocolData.campaign_name}</h3>
                <p className="text-[10px] text-purple-400 uppercase tracking-widest">{protocolData.topic}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {protocolData.hashtags?.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-[10px] font-bold text-purple-300">{tag}</span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-[#111114] rounded-xl border border-white/5">
            {[
              { id: 'images' as const, label: 'Image Prompts', icon: Image },
              { id: 'copy' as const, label: 'Social Copy', icon: FileText },
              { id: 'video' as const, label: 'Video', icon: Share2 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* IMAGE PROMPTS TAB */}
          {activeTab === 'images' && protocolData.image_prompts && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  {Object.keys(protocolData.image_prompts).length} Prompts Generated
                </span>
                <button
                  onClick={copyAllImagePrompts}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                    copiedId === 'all_images' ? 'bg-green-500 text-white' : 'bg-purple-500 hover:bg-purple-400 text-white'
                  }`}
                >
                  {copiedId === 'all_images' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'all_images' ? 'Copied!' : 'Copy All Prompts'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {Object.entries(protocolData.image_prompts).map(([key, promptData]: any) => {
                  const meta = promptLabels[key] || { label: key, icon: '📷' }
                  const isExpanded = expandedSection === key
                  return (
                    <div key={key} className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/20 transition-all">
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : key)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{meta.icon}</span>
                          <div>
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">{meta.label}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[8px] font-bold text-zinc-600 bg-white/5 px-2 py-0.5 rounded">{promptData.aspect_ratio}</span>
                              <span className="text-[8px] font-bold text-zinc-600">{promptData.platform}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); copy(promptData.prompt, key) }}
                            className={`p-2 rounded-lg transition-all ${copiedId === key ? 'bg-green-500 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-400'}`}
                          >
                            {copiedId === key ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                          <p className="text-[10px] text-zinc-500 italic">{promptData.description}</p>
                          <div className="bg-black/60 rounded-xl p-4 border border-purple-500/10">
                            <p className="text-[11px] text-purple-100/80 leading-relaxed font-mono whitespace-pre-wrap">{promptData.prompt}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* SOCIAL COPY TAB */}
          {activeTab === 'copy' && protocolData.copy && (
            <div className="space-y-4">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-[11px] font-black text-yellow-400 uppercase tracking-widest">Viral Hook</span>
                  <button
                    onClick={() => copy(protocolData.copy.hook, 'hook')}
                    className="ml-auto"
                  >
                    {copiedId === 'hook' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-zinc-500 hover:text-white" />}
                  </button>
                </div>
                <p className="text-sm text-white font-bold italic">"{protocolData.copy.hook}"</p>
              </div>

              {Object.entries(protocolData.copy).filter(([k]) => k !== 'hook').map(([platform, text]: any) => (
                <div key={platform} className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">{platform.replace('caption_', '')}</span>
                    <button onClick={() => copy(text, platform)}>
                      {copiedId === platform ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-zinc-500 hover:text-white" />}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium italic">{text}</p>
                </div>
              ))}
            </div>
          )}

          {/* VIDEO TAB */}
          {activeTab === 'video' && protocolData.video_prompt && (
            <div className="space-y-4">
              {protocolData.video_prompt.pippit && (
                <div className="bg-gradient-to-br from-orange-950/60 to-black border-2 border-orange-500/40 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-orange-400" />
                        <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Pippit/CapCut Prompt</span>
                      </div>
                      <p className="text-[9px] text-orange-700 uppercase tracking-widest">Copy + Paste into Pippit</p>
                    </div>
                    <button
                      onClick={() => copy(protocolData.video_prompt.pippit, 'pippit')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${copiedId === 'pippit' ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-400 text-white'}`}
                    >
                      {copiedId === 'pippit' ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                    </button>
                  </div>
                  <div className="bg-black/60 rounded-2xl p-4 border border-orange-500/10">
                    <p className="text-[11px] text-orange-100/80 leading-relaxed font-mono">{protocolData.video_prompt.pippit}</p>
                  </div>
                </div>
              )}

              {protocolData.video_prompt.voiceover && (
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Voiceover Script</span>
                    <button onClick={() => copy(protocolData.video_prompt.voiceover, 'voiceover')}>
                      {copiedId === 'voiceover' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-zinc-500 hover:text-white" />}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">{protocolData.video_prompt.voiceover}</p>
                </div>
              )}

              {protocolData.storyboard && (
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Storyboard</span>
                  <div className="space-y-3">
                    {protocolData.storyboard.map((step: any, i: number) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="text-[10px] font-bold text-purple-500 mono shrink-0 mt-0.5">{String(i+1).padStart(2, '0')}</span>
                        <div className="flex-1 space-y-1">
                          <p className="text-[11px] text-zinc-400 leading-tight italic">{step.visual}</p>
                          <div className="flex gap-2">
                            <span className="text-[8px] font-bold text-zinc-600 bg-white/5 px-2 py-0.5 rounded">{step.duration}</span>
                            {step.overlay && <span className="text-[8px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{step.overlay}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* EMPTY STATE */}
      {!protocolData && !loading && (
        <div className="py-20 text-center space-y-6">
          <div className="flex justify-center gap-8 opacity-20">
            <Image className="w-12 h-12" />
            <FileText className="w-12 h-12" />
            <Share2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-zinc-600 font-black uppercase text-xs tracking-[0.4em]">AI Content Generator</h3>
            <p className="text-zinc-800 text-[10px] max-w-md mx-auto leading-relaxed">
              Enter a topic and get 11 image prompts, social media copy, and video scripts ready to use.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

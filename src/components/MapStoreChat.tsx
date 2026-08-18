'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Sparkles, X, ChevronRight, Search, MapPin, User, Bot, HelpCircle, Siren } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface MapStoreChatProps {
    onFilterChange?: (filters: any) => void
    onResultsFound?: (results: any[]) => void
    placeholder?: string
    userCity?: string
}

import { BUSINESS_CATEGORIES } from '@/lib/businessCategories'

export const MapStoreChat: React.FC<MapStoreChatProps> = ({
    onFilterChange,
    onResultsFound,
    placeholder,
    userCity
}) => {
    const { t } = useLanguage()
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [turnCount, setTurnCount] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!inputValue.trim() || isTyping) return

        const userMessage = inputValue.trim()
        setInputValue('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsTyping(true)
        setTurnCount(prev => prev + 1)

        try {
            const response = await fetch('/api/ai/analyze-problem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userMessage,
                    userCity: userCity,
                    categories: BUSINESS_CATEGORIES, 
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                    turn: turnCount + 1
                })
            })

            const data = await response.json()

            const messagesToAdd: Message[] = []
            
            if (data.explanation && !data.isConversational) {
                messagesToAdd.push({ role: 'assistant', content: data.explanation })
            } else if (data.aiReasoning && !data.isConversational) {
                messagesToAdd.push({ role: 'assistant', content: data.aiReasoning })
            }

            if (data.isConversational && data.nextQuestion && turnCount < 4) {
                messagesToAdd.push({ role: 'assistant', content: data.nextQuestion })
            } else {
                if (messagesToAdd.length === 0) {
                messagesToAdd.push({ role: 'assistant', content: t('map_store.filter_success') })
                }
                setTurnCount(0)
            }

            setMessages(prev => [...prev, ...messagesToAdd])

            // SIEMPRE aplicar los filtros si existen, incluso si está haciendo una pregunta
            if (onFilterChange) onFilterChange({ ...data, query: userMessage })

            // 🔥 FIX: Despachar eventos de foco y selección si la IA los devuelve
            if (data.focus) {
                window.dispatchEvent(new CustomEvent('map-ai-search', { detail: data.focus }));
            }
            if (data.selectedBusinessId) {
                window.dispatchEvent(new CustomEvent('open-business-modal', { detail: data.selectedBusinessId }));
            }

            if (data.isDeepSearch) {
                const deepRes = await fetch('/api/ai/deep-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: userMessage, context: 'MAP' })
                })
                const deepData = await deepRes.json()
                if (onResultsFound) onResultsFound(deepData.results)

                // 🔥 FIX: Si es una búsqueda profunda y solo hay un resultado, enfocarlo automáticamente
                if (deepData.results && deepData.results.length === 1) {
                    const business = deepData.results[0];
                    window.dispatchEvent(new CustomEvent('map-ai-search', { 
                        detail: { lat: business.latitude, lng: business.longitude, zoom: 16 } 
                    }));
                    window.dispatchEvent(new CustomEvent('open-business-modal', { detail: business.id }));
                }
            }

        } catch (error) {
            console.error('Map Chat Error:', error)
            setMessages(prev => [...prev, { role: 'assistant', content: t('map_store.fallback_explanation') }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="w-full flex flex-col gap-4">


            {/* 💬 Chat Container - Technical Guru UI */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-transparent border border-amber-500/20 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl backdrop-blur-3xl ring-1 ring-amber-500/10">
                {/* 🛠️ Minimalist Header */}
                <div className="px-5 py-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Texto removido a petición del usuario */}
                    </div>
                    {isTyping ? (
                        <div className="flex gap-1">
                            <div className="w-1 h-3 bg-amber-500/50 animate-bounce"></div>
                            <div className="w-1 h-3 bg-amber-500/50 animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1 h-3 bg-amber-500/50 animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    ) : (
                        <Siren size={14} className="text-amber-500/50" />
                    )}
                </div>

                {/* Historial */}
                <div
                    ref={scrollRef}
                    className="h-[140px] overflow-y-auto p-4 space-y-3 custom-scrollbar"
                >
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-2 space-y-4 opacity-100">
                            <p className="text-sm font-black text-white uppercase tracking-[0.2em]">{t('map_store.smart_search_label')}</p>

                            {/* Sugerencias rápidas (solo 3) */}
                            <div className="flex flex-wrap justify-center gap-1.5">
                                {[t('map_store.categories.mecanico'), t('map_store.categories.gruas'), t('map_store.categories.refacciones')].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => {
                                            setInputValue(suggestion)
                                            inputRef.current?.focus()
                                        }}
                                        className="text-xs bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/20 px-3 py-1.5 rounded-full text-amber-100 transition-all transform hover:scale-105 active:scale-95 uppercase font-black tracking-widest"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            key={i}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-lg backdrop-blur-sm ${m.role === 'user'
                                ? 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white rounded-tr-none font-bold border border-amber-400/20'
                                : 'bg-slate-800/60 text-slate-100 border border-white/10 rounded-tl-none font-medium'
                                }`}>
                                {m.role === 'assistant' && (
                                    <div className="flex items-center gap-1.5 mb-1 opacity-70">
                                        <div className="p-1 bg-amber-500/20 rounded">
                                            <Siren size={10} className="text-amber-400" />
                                        </div>
                                    </div>
                                )}
                                {m.content}
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 px-4 py-4 rounded-2xl rounded-tl-none border border-white/10">
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form
                    onSubmit={handleSend}
                    className="p-2 border-t border-white/10 bg-white/5 flex items-center gap-2 overflow-hidden"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder || t('map_store.default_placeholder')}
                        className="flex-1 min-w-0 bg-transparent border-none outline-none px-3 py-2 text-white placeholder-white/30 text-sm font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        className="w-9 h-9 flex-none bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-white/10 text-white rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-blue-500/40 border border-white/20 mr-1"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>


        </div>
    )
}

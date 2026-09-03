'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, X, Bot, Siren, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface AIChatWidgetProps {
    context: 'market' | 'map' | 'support'
    onFilterChange?: (filters: any) => void
    onResultsFound?: (results: any[]) => void
    placeholder?: string
    userCity?: string
    suggestions?: string[]
}

const CONTEXT_CONFIG = {
    market: {
        apiEndpoint: '/api/ai/search',
        accentColor: 'blue',
        gradientFrom: 'from-blue-700 to-blue-500',
        dotColor: 'bg-blue-500',
        borderColor: 'border-blue-500/30',
        suggestionBg: 'bg-blue-600/20 hover:bg-blue-600/40',
        suggestionBorder: 'border-blue-500/30',
        suggestionText: 'text-white',
        headerLabel: 'Matchmaker AI',
        Icon: Bot,
        emptyLabelKey: 'market.filters.ia',
        emptyLabelFallback: 'Asesor Inteligente',
    },
    map: {
        apiEndpoint: '/api/ai/analyze-problem',
        accentColor: 'amber',
        gradientFrom: 'from-amber-600 to-amber-500',
        dotColor: 'bg-amber-500',
        borderColor: 'border-amber-500/20',
        suggestionBg: 'bg-amber-500/10 hover:bg-amber-500/30',
        suggestionBorder: 'border-amber-500/20',
        suggestionText: 'text-amber-100',
        headerLabel: '',
        Icon: Siren,
        emptyLabelKey: 'map_store.smart_search_label',
        emptyLabelFallback: 'Búsqueda Inteligente',
    },
    support: {
        apiEndpoint: '/api/ai/chatbot',
        accentColor: 'primary',
        gradientFrom: 'from-primary-700 to-primary-600',
        dotColor: 'bg-primary-700',
        borderColor: 'border-primary-700/20',
        suggestionBg: 'bg-primary-700/20 hover:bg-primary-700/40',
        suggestionBorder: 'border-primary-700/20',
        suggestionText: 'text-white',
        headerLabel: 'Soporte',
        Icon: Users,
        emptyLabelKey: 'common.support',
        emptyLabelFallback: 'Soporte',
    },
}

export default function AIChatWidget({
    context,
    onFilterChange,
    onResultsFound,
    placeholder,
    userCity,
    suggestions: customSuggestions,
}: AIChatWidgetProps) {
    const { t } = useLanguage()
    const config = CONTEXT_CONFIG[context]
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isOpen, setIsOpen] = useState(context === 'market')
    const [turnCount, setTurnCount] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const defaultSuggestions = customSuggestions || (
        context === 'market'
            ? [t('market.chat_suggestion_1') || 'Camioneta familiar', t('market.chat_suggestion_2') || 'Primer carro barato', t('market.chat_suggestion_3') || 'Pickup 4x4 diesel', t('market.chat_suggestion_4') || 'Auto para Uber']
            : context === 'map'
                ? [t('map_store.categories.mecanico'), t('map_store.categories.gruas'), t('map_store.categories.refacciones')]
                : []
    )

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    useEffect(() => {
        if (context === 'support') {
            const handleOpen = () => setIsOpen(true)
            window.addEventListener('open-chatbot', handleOpen)
            return () => window.removeEventListener('open-chatbot', handleOpen)
        }
    }, [context])

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!inputValue.trim() || isTyping) return

        const userMessage = inputValue.trim()
        setInputValue('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsTyping(true)
        setTurnCount(prev => prev + 1)

        try {
            const body: any = {
                query: userMessage,
                history: messages.map(m => ({ role: m.role, content: m.content })),
                turn: turnCount + 1,
            }

            if (context === 'market') {
                body.context = 'MARKET'
                body.city = userCity
            } else if (context === 'map') {
                body.userCity = userCity
                const { BUSINESS_CATEGORIES } = await import('@/lib/businessCategories')
                body.categories = BUSINESS_CATEGORIES
            } else {
                body.message = userMessage
            }

            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await response.json()
            const messagesToAdd: Message[] = []

            if (context === 'support') {
                if (data.command && data.command.type !== 'NONE') {
                    const eventName = data.command.type === 'MARKET_FILTER' ? 'market-ai-filter' : 'map-ai-search'
                    window.dispatchEvent(new CustomEvent(eventName, { detail: data.command.params }))
                    if (data.command.type === 'MAP_SEARCH' && data.command.params?.id) {
                        window.dispatchEvent(new CustomEvent('open-business-modal', { detail: data.command.params.id }))
                    }
                }
                messagesToAdd.push({ role: 'assistant', content: data.response || t('chat.maintenance') })
            } else {
                const reasoning = data.explanation || data.aiReasoning
                if (reasoning && !data.isConversational) {
                    messagesToAdd.push({ role: 'assistant', content: reasoning })
                }
                if (data.advisorTip && !data.isConversational) {
                    messagesToAdd.push({ role: 'assistant', content: `💡 Tip: ${data.advisorTip}` })
                }
                if (data.isConversational && data.nextQuestion && turnCount < 4) {
                    messagesToAdd.push({ role: 'assistant', content: data.nextQuestion })
                } else {
                    if (messagesToAdd.length === 0) {
                        messagesToAdd.push({ role: 'assistant', content: t('market.chat_done') || '¡Hecho! He filtrado los resultados para ti. 🚗✨' })
                    }
                    setTurnCount(0)
                }

                if (onFilterChange) onFilterChange({ ...data, query: userMessage })

                if (data.focus) {
                    window.dispatchEvent(new CustomEvent('map-ai-search', { detail: data.focus }))
                }
                if (data.selectedBusinessId) {
                    window.dispatchEvent(new CustomEvent('open-business-modal', { detail: data.selectedBusinessId }))
                }

                if (data.isDeepSearch) {
                    const deepRes = await fetch('/api/ai/deep-search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: userMessage, context: context === 'market' ? 'MARKET' : 'MAP' })
                    })
                    const deepData = await deepRes.json()
                    if (onResultsFound) onResultsFound(deepData.results)
                    if (deepData.results?.length === 1) {
                        const biz = deepData.results[0]
                        window.dispatchEvent(new CustomEvent('map-ai-search', { detail: { lat: biz.latitude, lng: biz.longitude, zoom: 16 } }))
                        window.dispatchEvent(new CustomEvent('open-business-modal', { detail: biz.id }))
                    }
                }
            }

            setMessages(prev => [...prev, ...messagesToAdd])
        } catch (error) {
            console.error(`[${context}] Chat Error:`, error)
            setMessages(prev => [...prev, { role: 'assistant', content: t('market.chat_error') || 'Ups, algo salió mal. ¿Podrías decirme de nuevo qué buscas?' }])
        } finally {
            setIsTyping(false)
        }
    }

    const Icon = config.Icon

    if (context === 'market') {
        return (
            <div className="w-full flex flex-col gap-4">
                <div className={`bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl backdrop-blur-3xl ring-1 ring-white/10`}>
                    <div className="px-5 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 ${config.dotColor} rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]`}></div>
                            <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em]">{config.headerLabel}</span>
                        </div>
                    </div>
                    <div ref={scrollRef} className="h-[140px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-2 space-y-4">
                                <p className="text-sm font-black text-white uppercase tracking-[0.2em]">
                                    {t(config.emptyLabelKey) || config.emptyLabelFallback}
                                </p>
                                <div className="flex flex-wrap justify-center gap-1.5">
                                    {defaultSuggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => { setInputValue(suggestion); inputRef.current?.focus() }}
                                            className={`text-xs ${config.suggestionBg} border ${config.suggestionBorder} px-3 py-1.5 rounded-full ${config.suggestionText} transition-all transform hover:scale-105 active:scale-95 uppercase font-black tracking-tight`}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-lg backdrop-blur-sm ${m.role === 'user' ? `bg-gradient-to-tr ${config.gradientFrom} text-white rounded-tr-none font-bold border border-white/20` : 'bg-white/10 text-white border border-white/20 rounded-tl-none font-medium'}`}>
                                    {m.role === 'assistant' && (
                                        <div className="flex items-center gap-1.5 mb-1 opacity-50">
                                            <Icon size={12} className="text-blue-300" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t(config.emptyLabelKey) || 'Asesor'}</span>
                                        </div>
                                    )}
                                    {m.content}
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-tl-none border border-white/10">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-white/5 flex items-center gap-2">
                        <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={placeholder || t('market.search_placeholder') || 'Dime qué buscas...'} className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-white placeholder-white/30 text-sm font-medium" />
                        <button type="submit" disabled={!inputValue.trim() || isTyping} className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-white/10 text-white rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0 shadow-lg shadow-blue-500/40 border border-white/20">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    if (context === 'map') {
        return (
            <div className="w-full flex flex-col gap-4">
                <div className={`bg-gradient-to-br from-slate-900 via-slate-850 to-transparent border ${config.borderColor} rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl backdrop-blur-3xl ring-1 ring-amber-500/10`}>
                    <div className="px-5 py-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
                        <div className="flex items-center gap-2"></div>
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
                    <div ref={scrollRef} className="h-[140px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-2 space-y-4 opacity-100">
                                <p className="text-sm font-black text-white uppercase tracking-[0.2em]">{t(config.emptyLabelKey) || config.emptyLabelFallback}</p>
                                <div className="flex flex-wrap justify-center gap-1.5">
                                    {defaultSuggestions.map((suggestion) => (
                                        <button key={suggestion} onClick={() => { setInputValue(suggestion); inputRef.current?.focus() }} className={`text-xs ${config.suggestionBg} border ${config.suggestionBorder} px-3 py-1.5 rounded-full ${config.suggestionText} transition-all transform hover:scale-105 active:scale-95 uppercase font-black tracking-widest`}>
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-lg backdrop-blur-sm ${m.role === 'user' ? `bg-gradient-to-tr ${config.gradientFrom} text-white rounded-tr-none font-bold border border-amber-400/20` : 'bg-slate-800/60 text-slate-100 border border-white/10 rounded-tl-none font-medium'}`}>
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
                    <form onSubmit={handleSend} className="p-2 border-t border-white/10 bg-white/5 flex items-center gap-2 overflow-hidden">
                        <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={placeholder || t('map_store.default_placeholder')} className="flex-1 min-w-0 bg-transparent border-none outline-none px-3 py-2 text-white placeholder-white/30 text-sm font-medium" />
                        <button type="submit" disabled={!inputValue.trim() || isTyping} className="w-9 h-9 flex-none bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-white/10 text-white rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-blue-500/40 border border-white/20 mr-1">
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    // Support context — floating widget with toggle
    return (
        <>
            {isOpen && (
                <div className="fixed bottom-24 md:bottom-6 right-6 z-50 w-[calc(100vw-3rem)] md:w-[400px] h-[500px] max-h-[calc(100vh-14rem)] bg-background border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="bg-surface p-4 flex justify-between items-center border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-700/20 p-2 rounded-full">
                                <Users className="text-primary-700" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary text-sm">{t('common.support')}</h3>
                                <p className="text-xs text-primary-700 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary-700 rounded-full"></span>
                                    {t('common.online_team')}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-text-primary transition">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary-700 text-text-primary rounded-br-none' : 'bg-surface text-text-secondary rounded-bl-none border border-white/10'}`}>
                                    <p className="whitespace-pre-line">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-surface p-3 rounded-2xl rounded-bl-none border border-white/10 flex gap-1">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                    <div className="p-4 bg-surface border-t border-white/10">
                        <div className="flex gap-2">
                            <input autoFocus type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={t('common.typing_placeholder')} className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-700 transition placeholder:text-gray-600" />
                            <button onClick={() => handleSend()} disabled={!inputValue.trim()} className="bg-primary-700 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-text-primary p-2 rounded-xl transition">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

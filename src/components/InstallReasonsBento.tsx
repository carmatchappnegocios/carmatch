"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, Banknote, Flame, Wrench, Download, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface InstallReasonsBentoProps {
    onClose?: () => void;
    showCloseButton?: boolean;
}

export default function InstallReasonsBento({ onClose, showCloseButton = false }: InstallReasonsBentoProps) {
    const { t } = useLanguage()
    
    // We can use the PWA prompt if available, or just redirect to instructions
    const handleInstallClick = () => {
        // Trigger PWA install if available in window, or show custom modal
        const event = new CustomEvent('trigger-pwa-install');
        window.dispatchEvent(event);
    }

    const reasons = [
        {
            id: 'sos',
            icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
            title: "Nunca te quedes tirado",
            desc: "Botón SOS con grúas y talleres en tiempo real 24/7.",
            color: "bg-red-500/10 border-red-500/20",
            delay: 0.1
        },
        {
            id: 'money',
            icon: <Banknote className="w-8 h-8 text-green-500" />,
            title: "Tu dinero intacto",
            desc: "0% comisiones. Vende directo por WhatsApp.",
            color: "bg-green-500/10 border-green-500/20",
            delay: 0.2
        },
        {
            id: 'swipe',
            icon: <Flame className="w-8 h-8 text-orange-500" />,
            title: "Adicción Automotriz",
            desc: "Desliza y encuentra autos increíbles cerca de ti.",
            color: "bg-orange-500/10 border-orange-500/20",
            delay: 0.3
        },
        {
            id: 'business',
            icon: <Wrench className="w-8 h-8 text-blue-500" />,
            title: "Radar de Negocios",
            desc: "Aparece en el mapa y consigue clientes en apuros.",
            color: "bg-blue-500/10 border-blue-500/20",
            delay: 0.4
        }
    ]

    return (
        <div className="w-full relative rounded-3xl overflow-hidden bg-gradient-to-br from-surface to-[#0a0f1c] border border-surface-highlight shadow-2xl">
            {showCloseButton && onClose && (
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/70 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            {/* Glowing Orbs Effect */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-600/20 blur-[100px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            <div className="relative z-10 p-6 md:p-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
                        Tu Copiloto de Vida
                    </h2>
                    <p className="text-text-secondary md:text-lg max-w-xl mx-auto font-medium">
                        CarMatch no es solo para cambiar de auto. Es una herramienta de supervivencia obligatoria en tu celular.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {reasons.map((reason) => (
                        <motion.div
                            key={reason.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: reason.delay }}
                            className={`p-5 rounded-2xl border ${reason.color} backdrop-blur-sm flex items-start gap-4 hover:scale-[1.02] transition-transform`}
                        >
                            <div className="shrink-0 p-3 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                                {reason.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg mb-1">{reason.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{reason.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Call to action */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-white/10"
                >
                    <button 
                        onClick={handleInstallClick}
                        className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 group"
                    >
                        <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                        INSTALAR APP GRATIS
                    </button>
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">
                        Zero Comisiones • SOS 24/7
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

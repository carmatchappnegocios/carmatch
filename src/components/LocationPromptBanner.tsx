'use client'

import { MapPin, X } from 'lucide-react'
import { useLocation } from '@/contexts/LocationContext'

export default function LocationPromptBanner() {
    const { showLocationPrompt, dismissLocationPrompt } = useLocation()

    if (!showLocationPrompt) return null

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-5xl mx-auto bg-surface border-2 border-primary-500/30 rounded-2xl shadow-2xl backdrop-blur-xl">
                <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                <MapPin className="text-blue-500" size={20} />
                            </div>
                            <h3 className="text-base md:text-xl font-bold text-text-primary">
                                Ubicación en tiempo real
                            </h3>
                        </div>
                        <button
                            onClick={() => dismissLocationPrompt(false)}
                            className="p-1.5 hover:bg-surface-highlight rounded-lg transition-colors"
                            aria-label="Cerrar"
                        >
                            <X size={18} className="text-text-secondary" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
                            ¿Quieres ver tu punto en el mapa y encontrar negocios/vehículos cercanos con precisión? 
                            Puedes cambiar esto después en Configuración.
                        </p>
                        <p className="text-text-secondary/60 text-[10px] md:text-xs leading-relaxed">
                            En Android/iOS, selecciona "Ubicación precisa" (no aproximada) cuando el navegador lo pida para mejor exactitud.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => dismissLocationPrompt(true)}
                                className="flex-1 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-all"
                            >
                                Sí, activar
                            </button>
                            <button
                                onClick={() => dismissLocationPrompt(false)}
                                className="flex-1 px-4 py-2.5 bg-surface-highlight hover:bg-surface border border-surface-highlight text-text-secondary hover:text-text-primary text-sm font-medium rounded-xl transition-all"
                            >
                                Ahora no
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

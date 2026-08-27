
'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function RegisterSW() {
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
    const { t } = useLanguage()

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return

        let intervalId: ReturnType<typeof setInterval> | null = null

        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                // Detectar nueva versión
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing
                    if (!newWorker) return

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            setWaitingWorker(newWorker)
                            setShowUpdatePrompt(true)
                        }
                    })
                })

                // Revisar actualizaciones cada 1 hora
                intervalId = setInterval(() => {
                    registration.update()
                }, 60 * 60 * 1000)
            })
            .catch(() => {})

        const handleControllerChange = () => {
            window.location.reload()
        }
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

        return () => {
            if (intervalId) clearInterval(intervalId)
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
        }
    }, [])

    const handleUpdate = () => {
        if (waitingWorker) {
            waitingWorker.postMessage({ type: 'SKIP_WAITING' })
            setShowUpdatePrompt(false)
        }
    }

    if (!showUpdatePrompt) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[9999] bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-2xl">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <RefreshCw className="w-6 h-6 animate-spin-slow" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">{t('sw_update.new_version')}</h4>
                    <p className="text-xs text-white/90 mb-3">
                        {t('sw_update.update_desc')}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleUpdate}
                            className="flex-1 bg-white text-orange-600 font-semibold text-xs px-3 py-2 rounded-md hover:bg-orange-50 transition"
                        >
                            {t('sw_update.update_now')}
                        </button>
                        <button
                            onClick={() => setShowUpdatePrompt(false)}
                            className="px-3 py-2 text-xs text-white/80 hover:text-white transition"
                        >
                            {t('sw_update.later')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

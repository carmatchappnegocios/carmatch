
'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstallable, setIsInstallable] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Verificar si ya está instalada como PWA
        const checkStandalone = () => window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://')

        if (checkStandalone()) {
            console.log("📱 La aplicación ya está detectada como instalada")
            setIsStandalone(true)
            setIsInstallable(false)
            return
        }

        const handler = (e: Event) => {
            console.log("📥 PWA Install Prompt capturado!")
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setIsInstallable(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Escuchar cuando se instale con éxito
        window.addEventListener('appinstalled', () => {
            console.log("🎉 PWA instalada con éxito")
            localStorage.setItem('pwa-installed', 'true')
            setDeferredPrompt(null)
            setIsInstallable(false)
            setIsStandalone(true)
        })

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const triggerInstall = async () => {
        if (!deferredPrompt) {
            console.warn("⚠️ No deferredPrompt available yet. User might need to interact with the page first or wait.")
            return false
        }

        try {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            console.log(`User response to install prompt: ${outcome}`)

            if (outcome === 'accepted') {
                setDeferredPrompt(null)
                setIsInstallable(false)
                return true
            }
        } catch (err) {
            console.error("❌ Error triggering PWA install:", err)
        }
        return false
    }

    return { isInstallable, isStandalone, triggerInstall }
}

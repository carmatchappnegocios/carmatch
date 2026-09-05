'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type BrowserType = 'chrome-android' | 'samsung-internet' | 'safari-ios' | 'chrome-desktop' | 'other'

function detectBrowser(): BrowserType {
    if (typeof window === 'undefined') return 'other'
    const ua = navigator.userAgent
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone ||
        document.referrer.includes('android-app://')

    if (isStandalone) return 'other'

    if (/iPhone|iPad|iPod/.test(ua)) return 'safari-ios'
    if (/SamsungBrowser/i.test(ua)) return 'samsung-internet'
    if (/Chrome/.test(ua) && /Mobile|Android/.test(ua)) return 'chrome-android'
    if (/Chrome/.test(ua)) return 'chrome-desktop'
    return 'other'
}

export default function SmartInstallBanner() {
    const { t } = useLanguage();
    const [browser, setBrowser] = useState<BrowserType>('other')
    const [canInstall, setCanInstall] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        const b = detectBrowser()
        setBrowser(b)

        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            (navigator as any).standalone ||
            document.referrer.includes('android-app://')
        setIsStandalone(standalone)

        if (standalone || b === 'other') return

        const dismissedKey = `pwa-install-dismissed-${b}`
        if (localStorage.getItem(dismissedKey)) {
            setDismissed(true)
            return
        }

        if (b === 'chrome-android' || b === 'chrome-desktop') {
            const handler = (e: Event) => {
                e.preventDefault()
                setDeferredPrompt(e as BeforeInstallPromptEvent)
                setCanInstall(true)
            }
            window.addEventListener('beforeinstallprompt', handler)
            return () => window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstall = useCallback(async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                setCanInstall(false)
                setDeferredPrompt(null)
            }
        }
    }, [deferredPrompt])

    const handleDismiss = useCallback(() => {
        setDismissed(true)
        const dismissedKey = `pwa-install-dismissed-${browser}`
        localStorage.setItem(dismissedKey, 'true')
    }, [browser])

    if (isStandalone || dismissed || browser === 'other') return null

    if (browser === 'samsung-internet') {
        return (
            <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2 md:hidden">
                <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-3 shadow-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0ea5e9] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium">{t('install_banner.samsung_title')}</p>
                        <p className="text-slate-400 text-[10px]">{t('install_banner.samsung_desc')}</p>
                    </div>
                    <button onClick={handleDismiss} className="text-slate-500 hover:text-slate-300 p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        )
    }

    if (browser === 'safari-ios') {
        return (
            <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2 md:hidden">
                <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-3 shadow-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0ea5e9] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium">{t('install_banner.ios_title')}</p>
                        <p className="text-slate-400 text-[10px]">{t('install_banner.ios_desc')}</p>
                    </div>
                    <button onClick={handleDismiss} className="text-slate-500 hover:text-slate-300 p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        )
    }

    if (browser === 'chrome-android' && canInstall) {
        return (
            <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2 md:hidden">
                <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-3 shadow-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#3ddc84] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium">{t('install_banner.android_title')}</p>
                        <p className="text-slate-400 text-[10px]">{t('install_banner.android_desc')}</p>
                    </div>
                    <button
                        onClick={handleInstall}
                        className="bg-[#f97316] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#ea580c] transition-colors"
                    >
                        {t('install_banner.install_btn')}
                    </button>
                    <button onClick={handleDismiss} className="text-slate-500 hover:text-slate-300 p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        )
    }

    if (browser === 'chrome-desktop' && canInstall) {
        return (
            <div className="hidden md:block fixed bottom-4 right-4 z-50">
                <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-3 shadow-lg flex items-center gap-3 max-w-xs">
                    <div className="w-8 h-8 rounded-lg bg-[#f97316] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium">{t('install_banner.desktop_title')}</p>
                        <p className="text-slate-400 text-[10px]">{t('install_banner.desktop_desc')}</p>
                    </div>
                    <button
                        onClick={handleInstall}
                        className="bg-[#f97316] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#ea580c] transition-colors"
                    >
                        {t('install_banner.install_btn')}
                    </button>
                    <button onClick={handleDismiss} className="text-slate-500 hover:text-slate-300 p-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        )
    }

    return null
}
